require('dotenv').config();
const { Client } = require('pg');

// Kết nối đến PostgreSQL mà không chỉ định cơ sở dữ liệu
const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'postgres' // Kết nối đến cơ sở dữ liệu mặc định postgres
});

async function createDatabase() {
    try {
        await client.connect();
        console.log('Đã kết nối đến PostgreSQL');

        // Kiểm tra xem cơ sở dữ liệu đã tồn tại chưa
        const checkResult = await client.query(`
      SELECT 1 FROM pg_database WHERE datname = '${process.env.DB_NAME}'
    `);

        if (checkResult.rows.length === 0) {
            // Cơ sở dữ liệu chưa tồn tại, tạo mới
            console.log(`Đang tạo cơ sở dữ liệu ${process.env.DB_NAME}...`);
            await client.query(`CREATE DATABASE ${process.env.DB_NAME}`);
            console.log(`Đã tạo cơ sở dữ liệu ${process.env.DB_NAME} thành công`);
        } else {
            console.log(`Cơ sở dữ liệu ${process.env.DB_NAME} đã tồn tại`);
        }

    } catch (error) {
        console.error('Lỗi:', error);
    } finally {
        await client.end();
        console.log('Đã đóng kết nối');
    }
}

createDatabase();