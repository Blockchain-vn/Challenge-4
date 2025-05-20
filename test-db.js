require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

async function testConnection() {
    try {
        const client = await pool.connect();
        console.log('Connected to database successfully');

        const result = await client.query('SELECT NOW()');
        console.log('Database time:', result.rows[0].now);

        client.release();

        // Test if users table exists
        try {
            const tableResult = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'users'
        );
      `);

            if (tableResult.rows[0].exists) {
                console.log('Users table exists');

                // Check table structure
                const columnsResult = await pool.query(`
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'users';
        `);

                console.log('Users table structure:');
                columnsResult.rows.forEach(row => {
                    console.log(`- ${row.column_name}: ${row.data_type}`);
                });
            } else {
                console.log('Users table does not exist');
            }
        } catch (err) {
            console.error('Error checking table:', err);
        }

    } catch (err) {
        console.error('Database connection error:', err);
    } finally {
        await pool.end();
    }
}

testConnection();