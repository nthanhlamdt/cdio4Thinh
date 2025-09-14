let express = require('express');
let router = express.Router();
let connection = require('../../db/mysql');

router.post('/login', async function (req, res) {

    if (!req.body) {
        console.error("LỖI: req.body là undefined. Middleware express.json() hoặc express.urlencoded() có vấn đề?");
        return res.status(400).json({ success: false, message: 'Yêu cầu không hợp lệ. Vui lòng thử lại.' });
    }

    let { usernameLogin, passwordLogin } = req.body;

    if (usernameLogin && passwordLogin) {

        try {
            let [results, fields] = await connection.query(
                `SELECT tk.HOTEN, tk.SDT, tk.EMAIL, tk.TENDANGNHAP, vt.MAVT, vt.TENVT
                 FROM TAIKHOAN tk
                 JOIN VAITRO vt ON tk.MAVT = vt.MAVT
                 WHERE tk.TENDANGNHAP = ? AND tk.MATKHAU = ?`,
                [usernameLogin, passwordLogin]
            );

            if (results.length > 0) {
                let user = results[0];

                req.session.loggedin = true;
                req.session.username = user.TENDANGNHAP;
                req.session.vaitro = user.TENVT; // lưu tên vai trò thay vì mã vai trò

                res.json({ success: true, message: 'Đăng nhập thành công', data: user });
            } else {
                res.json({ success: false, message: 'Sai tên đăng nhập hoặc mật khẩu!' });
            }
        } catch (error) {
            console.error("LỖI CSDL TRONG ĐĂNG NHẬP:", error);
            res.status(500).json({ success: false, message: 'Lỗi server khi truy vấn CSDL.' });
        }
    } else {
        res.json({ success: false, message: 'Vui lòng nhập tài khoản và mật khẩu!' });
    }
});

module.exports = router;
