import { supabase } from './supabase'

export async function signUpStudent({ name, email, password }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { 
        full_name: name,
        role: 'student'
      }
    }
  })
  if (error) throw error
  return data
}

export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email, password
  })
  if (error) throw error
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .single()
  
  if (profile?.role !== 'student') {
    await supabase.auth.signOut()
    throw new Error('Please use the owner dashboard to login.')
  }
  
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function getMyProfile() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .single()
  if (error) throw error
  return data
}

export async function updateProfile(updates) {
  const { data: { user } } = await supabase.auth.getUser()
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function savePushToken(token) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  await supabase
    .from('profiles')
    .update({ push_token: token })
    .eq('id', user.id)
}
