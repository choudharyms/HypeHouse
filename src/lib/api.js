import { supabase } from './supabase'

export async function fetchPGs({ 
  search = '', 
  type = null, 
  gender = null,
  maxPrice = null,
  city = null,
  availability = null,
  limit = 20,
  offset = 0
} = {}) {
  let query = supabase
    .from('pgs')
    .select(`
      id, name, description, room_type, gender,
      address, city, lat, lng, distance_from_college,
      price_per_month, security_deposit,
      total_rooms, available_rooms,
      amenities, images, availability,
      rating, review_count,
      contact_name, contact_phone, show_phone,
      owner_id,
      profiles!owner_id (full_name, avatar_url)
    `)
    .eq('active', true)
    .eq('is_draft', false)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (search) {
    query = query.or(
      `name.ilike.%${search}%,city.ilike.%${search}%,address.ilike.%${search}%`
    )
  }
  if (type) query = query.eq('room_type', type)
  if (gender) query = query.eq('gender', gender)
  if (maxPrice) query = query.lte('price_per_month', maxPrice)
  if (city) query = query.eq('city', city)
  if (availability) query = query.eq('availability', availability)

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function fetchPGById(pgId) {
  const { data, error } = await supabase
    .from('pgs')
    .select(`
      *,
      profiles!owner_id (full_name, avatar_url, phone),
      reviews (
        id, rating, comment, created_at,
        profiles!student_id (full_name, avatar_url)
      )
    `)
    .eq('id', pgId)
    .eq('active', true)
    .single()
  if (error) throw error
  return data
}

export async function fetchSavedPGs() {
  const { data, error } = await supabase
    .from('saved_pgs')
    .select(`
      saved_at,
      pgs (
        id, name, city, address, price_per_month,
        images, rating, review_count, availability,
        room_type, gender, distance_from_college
      )
    `)
    .order('saved_at', { ascending: false })
  if (error) throw error
  return data.map(s => ({ ...s.pgs, saved_at: s.saved_at }))
}

export async function savePG(pgId) {
  const { data: { user } } = await supabase.auth.getUser()
  const { error } = await supabase
    .from('saved_pgs')
    .insert({ student_id: user.id, pg_id: pgId })
  if (error) throw error
}

export async function unsavePG(pgId) {
  const { data: { user } } = await supabase.auth.getUser()
  const { error } = await supabase
    .from('saved_pgs')
    .delete()
    .match({ student_id: user.id, pg_id: pgId })
  if (error) throw error
}

export async function fetchSavedPGIds() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data, error } = await supabase
    .from('saved_pgs')
    .select('pg_id')
    .eq('student_id', user.id)
  if (error) throw error
  return data.map(s => s.pg_id)
}

export async function fetchMyBookings() {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      pgs (
        id, name, address, city, images,
        contact_name, contact_phone
      )
    `)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createBooking({
  pgId, checkIn, checkOut, totalAmount, roomNumber, notes
}) {
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      student_id: user.id,
      pg_id: pgId,
      check_in: checkIn,
      check_out: checkOut,
      total_amount: totalAmount,
      room_number: roomNumber,
      notes,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function cancelBooking(bookingId) {
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('bookings')
    .update({ 
      status: 'Cancelled',
      cancelled_at: new Date().toISOString(),
      cancelled_by: user.id,
    })
    .eq('id', bookingId)
    .eq('student_id', user.id)
    .eq('status', 'Upcoming')
    .select()
    .single()
  if (error) throw error
  return data
}

export async function addReview({ pgId, bookingId, rating, comment }) {
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('reviews')
    .insert({
      student_id: user.id,
      pg_id: pgId,
      booking_id: bookingId,
      rating,
      comment,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function fetchNotifications() {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) throw error
  return data
}

export async function markNotificationRead(notifId) {
  await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notifId)
}

export async function markAllNotificationsRead() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', user.id)
    .eq('read', false)
}
