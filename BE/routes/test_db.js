const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

// Cấu hình database
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'DB_QL_RAP_CHIEU_PHIM'
};

// Test kết nối database
router.get('/test-db', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);

        // Test query đơn giản
        const [result] = await connection.execute('SELECT 1 as test');

        // Test query bảng VAITRO
        const [roles] = await connection.execute('SELECT * FROM VAITRO');

        // Test query bảng TAIKHOAN
        const [users] = await connection.execute('SELECT TENDANGNHAP, MAVT FROM TAIKHOAN LIMIT 3');

        await connection.end();

        res.json({
            success: true,
            message: 'Database connection successful',
            data: {
                simpleTest: result,
                roles: roles,
                users: users
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Database connection failed: ' + error.message,
            config: {
                host: dbConfig.host,
                user: dbConfig.user,
                database: dbConfig.database
            }
        });
    }
});

module.exports = router;
