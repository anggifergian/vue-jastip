import axios from 'axios'
import { supabase } from './supabase'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL as string,
})

// Attach Bearer token from Supabase session on every request
http.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token

  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }

  return config
})

export default http
