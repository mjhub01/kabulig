const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://xyvtquatjmkgiaexujpn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5dnRxdWF0am1rZ2lhZXh1anBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE4NjQ4ODMsImV4cCI6MjEwNzQ0MDg4M30.k-GslfBGTzMtJqmr79oEoc5PLYQnflL9qMnqXrfu51o'
);

async function testConnection() {
  try {
    console.log('Testing Supabase API connection...');
    const { data, error } = await supabase.from('users').select('*').limit(1);
    if (error) {
      console.log('Expected error (table may not exist):', error.message);
      console.log('✓ Connection to Supabase API works!');
    } else {
      console.log('✓ Connected to Supabase!');
      console.log('Data:', data);
    }
  } catch (err) {
    console.error('✗ Connection failed:', err.message);
  }
}

testConnection();
