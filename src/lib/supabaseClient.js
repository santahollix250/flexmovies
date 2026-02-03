import { createClient } from '@supabase/supabase-js';

// Directly use your Supabase URL and anon key
// Replace these with your actual values from Supabase dashboard
const supabaseUrl = 'https://pwzwgilirhmdqjelzxvp.supabase.co'; // e.g., https://xyzabc.supabase.co
const supabaseAnonKey = 'sb_publishable_2R0aLjX_YeZiA-pQTpPBkQ_qDD4eqtB'; // e.g., eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// Check if credentials are still placeholders
if (supabaseUrl.includes('YOUR_') || supabaseAnonKey.includes('YOUR_')) {
    console.error('❌ Please update your Supabase credentials in supabaseClient.js');
    console.error('Get them from: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api');
}

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey); 