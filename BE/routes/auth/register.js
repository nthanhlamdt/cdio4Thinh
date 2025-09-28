const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

// Cấu hình database
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'DB_QL_RAP_CHIEU_PHIM',
    charset: 'utf8mb4'
};

router.post('/register', async function (req, res) {
    let { usernameRegister, emailRegister, passwordRegister } = req.body;

    if (usernameRegister && emailRegister && passwordRegister) {
        try {
            const connection = await mysql.createConnection(dbConfig);

            // Kiểm tra tên đăng nhập đã tồn tại
            let [userExists] = await connection.execute(
                'SELECT TENDANGNHAP FROM TAIKHOAN WHERE TENDANGNHAP = ?',
                [usernameRegister]
            );

            if (userExists.length > 0) {
                await connection.end();
                return res.status(409).json({ success: false, message: 'Tên đăng nhập đã tồn tại!' });
            }

            // Kiểm tra email đã tồn tại
            let [emailExists] = await connection.execute(
                'SELECT EMAIL FROM TAIKHOAN WHERE EMAIL = ?',
                [emailRegister]
            );

            if (emailExists.length > 0) {
                await connection.end();
                return res.status(409).json({ success: false, message: 'Email đã được sử dụng!' });
            }

            // Thêm tài khoản mới vào bảng TAIKHOAN
            await connection.execute(
                'INSERT INTO TAIKHOAN (TENDANGNHAP, MAVT, HOTEN, EMAIL, SDT, MATKHAU) VALUES (?, ?, ?, ?, ?, ?)',
                [usernameRegister, 'MAVT2', null, emailRegister, null, passwordRegister]
            );

            await connection.end();

            return res.status(201).json({
                success: true,
                message: 'Đăng ký tài khoản thành công! Bạn có thể đăng nhập ngay bây giờ.'
            });

        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ success: false, message: 'Tên đăng nhập hoặc email đã tồn tại!' });
            }
            return res.status(500).json({ success: false, message: 'Lỗi server khi đăng ký. Vui lòng thử lại.' });
        }
    } else {
        return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ thông tin đăng ký!' });
    }
});

module.exports = router;