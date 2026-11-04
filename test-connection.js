const { Client } = require('pg');

const client = new Client({
  host: '2406:da14:311:1500:4aa5:a1f3:42e9:d1dd',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'Ai818346123',
});

client.connect()
  .then(() => {
    console.log('✓ Connected to Supabase via IPv6!');
    return client.query('SELECT NOW()');
  })
  .then(res => {
    console.log('✓ Query successful:', res.rows[0]);
    client.end();
  })
  .catch(err => {
    console.error('✗ Connection failed:', err.message);
    client.end();
  });
