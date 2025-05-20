require('dotenv').config();
const { Client } = require('pg');

async function checkPostgres() {
    const client = new Client({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    try {
        console.log('Thông tin kết nối PostgreSQL:');
        console.log('Host:', process.env.DB_HOST);
        console.log('Port:', process.env.DB_PORT);
        console.log('User:', process.env.DB_USER);
        console.log('Database:', process.env.DB_NAME);

        console.log('Đang kết nối đến PostgreSQL...');
        await client.connect();
        console.log('Kết nối thành công!');

        const res = await client.query('SELECT NOW()');
        console.log('Thời gian hiện tại của PostgreSQL:', res.rows[0].now);

        await client.end();
    } catch (err) {
        console.error('Lỗi kết nối PostgreSQL:', err);
    }
}

checkPostgres();