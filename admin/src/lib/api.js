import { supabase } from './supabase'

export async function fetchMyPGs() {
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('pgs')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createPG(pgData) {
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('pgs')
    .insert({ ...pgData, owner_id: user.id })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updatePG(pgId, updates) {
  const { data, error } = await supabase
    .from('pgs')
    .update(updates)
    .eq('id', pgId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function toggleVacancy(pgId, isAvailable) {
  const { data, error } = await supabase
    .from('pgs')
    .update({ 
      availability: isAvailable ? 'Available' : 'Full',
      available_rooms: isAvailable ? 1 : 0
    })
    .eq('id', pgId)
    .select('id, availability')
    .single()
  if (error) throw error
  return data
}

export async function deletePG(pgId) {
  const { error } = await supabase
    .from('pgs')
    .update({ active: false })
    .eq('id', pgId)
  if (error) throw error
}

export async function uploadPGImage(pgId, file) {
  const { data: { user } } = await supabase.auth.getUser()
  const ext = file.name.split('.').pop()
  const filename = `${Date.now()}.${ext}`
  const path = `${user.id}/${pgId}/${filename}`

  const { error: uploadError } = await supabase.storage
    .from('pg-images')
    .upload(path, file, { upsert: false })
  
  if (uploadError) throw uploadError

  const { data: { publicUrl } } = supabase.storage
    .from('pg-images')
    .getPublicUrl(path)

  return publicUrl
}

export async function deletePGImage(pgId, imageUrl) {
  const path = imageUrl.split('/pg-images/')[1]
  const { error } = await supabase.storage
    .from('pg-images')
    .remove([path])
  if (error) throw error
}

export async function fetchMyBookings({ 
  status = null,
  pgId = null,
  from = null,
  to = null 
} = {}) {
  let query = supabase
    .from('bookings')
    .select(`
      *,
      profiles!student_id (
        full_name, email, phone, avatar_url
      ),
      pgs (name, images, address)
    `)
    .order('created_at', { ascending: false })

  if (status) query = query.eq('status', status)
  if (pgId) query = query.eq('pg_id', pgId)
  if (from) query = query.gte('check_in', from)
  if (to) query = query.lte('check_out', to)

  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function updateBookingStatus(bookingId, status) {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', bookingId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function markBookingPaid(bookingId, paidAmount) {
  const { data: booking } = await supabase
    .from('bookings')
    .select('total_amount')
    .eq('id', bookingId)
    .single()

  const paymentStatus = paidAmount >= booking.total_amount 
    ? 'Paid' : 'Partial'

  const { data, error } = await supabase
    .from('bookings')
    .update({ paid_amount: paidAmount, payment_status: paymentStatus })
    .eq('id', bookingId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function fetchDashboardStats() {
  const { data: { user } } = await supabase.auth.getUser()
  
  const [pgsResult, bookingsResult, revenueResult] = await Promise.all([
    supabase
      .from('pgs')
      .select('id, availability')
      .eq('owner_id', user.id)
      .eq('active', true),
    
    supabase
      .from('bookings')
      .select('id, status')
      .eq('owner_id', user.id)
      .eq('status', 'Active'),
    
    supabase
      .from('bookings')
      .select('paid_amount')
      .eq('owner_id', user.id)
      .gte('created_at', new Date(
        new Date().getFullYear(), 
        new Date().getMonth(), 1
      ).toISOString())
  ])

  const pgs = pgsResult.data || []
  const activeBookings = bookingsResult.data || []
  const revenue = revenueResult.data || []

  return {
    totalProperties: pgs.length,
    vacantRooms: pgs.filter(p => p.availability !== 'Full').length,
    activeBookings: activeBookings.length,
    monthlyRevenue: revenue.reduce((sum, b) => sum + (b.paid_amount || 0), 0)
  }
}
