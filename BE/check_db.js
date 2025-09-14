const mysql = require('mysql2/promise');

async function checkDatabase() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '123456',
            database: 'DB_QL_RAP_CHIEU_PHIM'
        });

        console.log('✅ Kết nối database thành công');

        // Kiểm tra tài khoản admin
        const [users] = await connection.execute(`
            SELECT tk.TENDANGNHAP, tk.MATKHAU, vt.TENVT
            FROM TAIKHOAN tk
            JOIN VAITRO vt ON tk.MAVT = vt.MAVT
            WHERE tk.TENDANGNHAP = 'admin1'
        `);

        console.log('\n=== TÀI KHOẢN ADMIN ===');
        if (users.length > 0) {
            const user = users[0];
            console.log('Username:', user.TENDANGNHAP);
            console.log('Password:', user.MATKHAU);
            console.log('Role:', user.TENVT);
            
            if (user.MATKHAU === '123456' && user.TENVT === 'ADMIN') {
                console.log('✅ Tài khoản admin đúng');
            } else {
                console.log('❌ Tài khoản admin có vấn đề');
            }
        } else {
            console.log('❌ Không tìm thấy tài khoản admin1');
        }

        // Kiểm tra tất cả tài khoản
        const [allUsers] = await connection.execute(`
            SELECT tk.TENDANGNHAP, vt.TENVT
            FROM TAIKHOAN tk
            JOIN VAITRO vt ON tk.MAVT = vt.MAVT
            ORDER BY vt.MAVT, tk.TENDANGNHAP
        `);

        console.log('\n=== TẤT CẢ TÀI KHOẢN ===');
        allUsers.forEach(user => {
            console.log(`${user.TENDANGNHAP} - ${user.TENVT}`);
        });

        await connection.end();
        console.log('\n✅ Kiểm tra hoàn tất');

    } catch (error) {
        console.error('❌ Lỗi:', error.message);
    }
}

checkDatabase();
