// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

// ⚠️ REPLACE THESE WITH YOUR ACTUAL CREDENTIALS ⚠️
// Get them from: Supabase Dashboard → Settings → API
const supabaseUrl = 'https://pwzwgilirhmdqjelzxvp.supabase.co'
const supabaseAnonKey = 'sb_publishable_2R0aLjX_YeZiA-pQTpPBkQ_qDD4eqtB'

// Create the Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ✅ IMPORTANT: Export the supabase client
export { supabase }

// Optional: Also export as default
export default supabase