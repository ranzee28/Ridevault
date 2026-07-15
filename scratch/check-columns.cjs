const https = require('https');

const supabaseUrl = 'https://gfgkgrkadlhevuqqdnkt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmZ2tncmthZGxoZXZ1cXFkbmt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0ODM4MzgsImV4cCI6MjA5OTA1OTgzOH0.Gl9VNfXNDEAk2C_4400lUZrvY8dIRkYQlBuVipFlV4k';

const url = `${supabaseUrl}/rest/v1/`;

const options = {
  headers: {
    'apikey': supabaseAnonKey,
    'Authorization': `Bearer ${supabaseAnonKey}`
  }
};

https.get(url, options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const schema = JSON.parse(data);
      const bookingsTable = schema.definitions.bookings;
      if (bookingsTable) {
        console.log("Bookings columns:", Object.keys(bookingsTable.properties));
      } else {
        console.log("Bookings table not found in schema!");
      }
    } catch (e) {
      console.error("Failed to parse JSON:", e.message);
      console.log("Response text:", data);
    }
  });

}).on('error', (err) => {
  console.error("Error: ", err.message);
});
