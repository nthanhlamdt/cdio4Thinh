const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

// Cấu hình database
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'DB_QL_RAP_CHIEU_PHIM'
};

async function createAdminAccount() {
    try {
        // Tạo mật khẩu mã hóa
        const plainPassword = '123456';
        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        // Kết nối database
        const connection = await mysql.createConnection(dbConfig);

        // Kiểm tra xem admin đã tồn tại chưa
        const [existingAdmin] = await connection.execute(
            'SELECT TENDANGNHAP FROM TAIKHOAN WHERE TENDANGNHAP = ?',
            ['admin1']
        );

        if (existingAdmin.length > 0) {
            // Cập nhật mật khẩu admin hiện tại
            await connection.execute(
                'UPDATE TAIKHOAN SET MATKHAU = ? WHERE TENDANGNHAP = ?',
                [hashedPassword, 'admin1']
            );
        } else {
            // Tạo admin mới
            await connection.execute(
                'INSERT INTO TAIKHOAN (TENDANGNHAP, MAVT, HOTEN, EMAIL, SDT, MATKHAU) VALUES (?, ?, ?, ?, ?, ?)',
                ['admin1', 'MAVT1', 'Hoàng Văn Phong', 'hoangvanphong@dtu.edu.vn', '0123456789', hashedPassword]
            );
        }

        // Tạo tài khoản khách hàng mẫu
        const [existingUser] = await connection.execute(
            'SELECT TENDANGNHAP FROM TAIKHOAN WHERE TENDANGNHAP = ?',
            ['luulam0307']
        );

        if (existingUser.length === 0) {
            await connection.execute(
                'INSERT INTO TAIKHOAN (TENDANGNHAP, MAVT, HOTEN, EMAIL, SDT, MATKHAU) VALUES (?, ?, ?, ?, ?, ?)',
                ['luulam0307', 'MAVT2', 'Lưu Văn Lâm', 'luuvanlam@dtu.edu.vn', '0123456789', hashedPassword]
            );
        }

        await connection.end();

    } catch (error) {
        console.error('Lỗi:', error);
    }
}

createAdminAccount();
