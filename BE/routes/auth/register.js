let express = require('express');
let router = express.Router();
let connection = require('../../db/mysql');

router.post('/register', async function (req, res) {
    let { usernameRegister, emailRegister, passwordRegister } = req.body;

    if (usernameRegister && emailRegister && passwordRegister) {
        try {
            let [userExists] = await connection.query(
                'SELECT * FROM TAIKHOAN WHERE TENDANGNHAP = ?',
                [usernameRegister]
            );

            if (userExists.length > 0) {
                return res.status(409).json({ success: false, message: 'Tên đăng nhập đã tồn tại!' });
            } else {
                let [insertAccountResult] = await connection.query(
                    'INSERT INTO TAIKHOAN (TENDANGNHAP, EMAIL, MATKHAU) VALUES (?, ?, ?)',
                    [usernameRegister, emailRegister, passwordRegister]
                );

                let [maxIdResult] = await connection.query(
                    'SELECT MAX(CAST(SUBSTRING(MAND, 3) AS UNSIGNED)) AS maxND FROM NGUOIDUNG'
                );

                let nextNumber = (maxIdResult[0].maxND || 0) + 1;
                let newMAND = 'ND' + nextNumber; 

                let [insertUserResult] = await connection.query(
                    'INSERT INTO NGUOIDUNG (MAND, TENDANGNHAP, HOTEN, EMAIL, SDT, MAVT) VALUES (?, ?, ?, ?, ?, ?)',
                    [newMAND, usernameRegister, null, emailRegister, null, 'MAVT2']
                );

                return res.status(201).json({ success: true, message: 'Đăng ký tài khoản thành công! Bạn có thể đăng nhập ngay bây giờ.' });
            }
        } catch (error) {
            console.error("REGISTER_BACKEND: LỖI CSDL TRONG ĐĂNG KÝ:", error);
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