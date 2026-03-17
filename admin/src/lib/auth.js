import { supabase } from './supabase'

export async function signUpOwner({ full_name, email, password, phone, businessName }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name,
        role: 'owner'
      }
    }
  })
  if (error) throw error
  
  if (data.user) {
    await supabase
      .from('profiles')
      .update({ phone, business_name: businessName })
      .eq('id', data.user.id)
  }
  return data
}

export async function signInOwner({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email, password
  })
  if (error) throw error
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single()
  
  if (profile?.role !== 'owner') {
    await supabase.auth.signOut()
    throw new Error('This account is not an owner account.')
  }
  
  return data
}

export async function signOut() {
  await supabase.auth.signOut()
}

export async function getMyProfile() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .single()
  if (error) throw error
  return data
}
