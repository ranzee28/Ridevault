const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://gfgkgrkadlhevuqqdnkt.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseAnonKey) {
  console.error("VITE_SUPABASE_ANON_KEY is not defined in process.env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error("Error fetching bookings:", error);
    } else {
      console.log("Success! Columns found in one row:", data.length > 0 ? Object.keys(data[0]) : "No rows in bookings table yet.");
    }
  } catch (err) {
    console.error("Catastrophic error:", err);
  }
}

check();
