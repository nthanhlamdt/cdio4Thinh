const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

// Kết nối database
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'DB_QL_RAP_CHIEU_PHIM'
};

// Middleware kiểm tra quyền admin
const checkAdminAuth = async (req, res, next) => {
    try {
        if (!req.session.loggedin) {
            return res.status(403).json({
                success: false,
                error: 'Bạn cần đăng nhập để truy cập chức năng này.'
            });
        }

        if (req.session.vaitro !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                error: 'Chỉ admin mới có thể truy cập chức năng này. Vai trò hiện tại: ' + req.session.vaitro
            });
        }

        next();
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Lỗi xác thực: ' + error.message
        });
    }
};

// GET - Lấy danh sách admin
router.get('/admins', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);

        const [rows] = await connection.execute(`
            SELECT 
                tk.TENDANGNHAP,
                tk.MAVT,
                tk.HOTEN,
                tk.EMAIL,
                tk.SDT,
                vt.TENVT
            FROM TAIKHOAN tk
            JOIN VAITRO vt ON tk.MAVT = vt.MAVT
            WHERE vt.TENVT = 'ADMIN'
            ORDER BY tk.TENDANGNHAP
        `);

        await connection.end();

        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Lỗi khi lấy danh sách admin: ' + error.message
        });
    }
});

// GET - Lấy danh sách tất cả người dùng
router.get('/users', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);

        const [rows] = await connection.execute(`
            SELECT 
                tk.TENDANGNHAP,
                tk.MAVT,
                tk.HOTEN,
                tk.EMAIL,
                tk.SDT,
                vt.TENVT
            FROM TAIKHOAN tk
            JOIN VAITRO vt ON tk.MAVT = vt.MAVT
            WHERE vt.TENVT != 'ADMIN'
            ORDER BY tk.MAVT, tk.TENDANGNHAP
        `);

        await connection.end();

        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Lỗi khi lấy danh sách người dùng: ' + error.message
        });
    }
});

// GET - Lấy thông tin một admin
router.get('/admins/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const connection = await mysql.createConnection(dbConfig);

        const [rows] = await connection.execute(`
            SELECT 
                tk.TENDANGNHAP,
                tk.MAVT,
                tk.HOTEN,
                tk.EMAIL,
                tk.SDT,
                vt.TENVT
            FROM TAIKHOAN tk
            JOIN VAITRO vt ON tk.MAVT = vt.MAVT
            WHERE tk.TENDANGNHAP = ? AND vt.TENVT = 'ADMIN'
        `, [username]);

        await connection.end();

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Không tìm thấy admin'
            });
        }

        res.json({
            success: true,
            data: rows[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Lỗi khi lấy thông tin admin'
        });
    }
});

// PUT - Cập nhật thông tin admin
router.put('/admins/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const { HOTEN, EMAIL, SDT, MATKHAU } = req.body;

        const connection = await mysql.createConnection(dbConfig);

        // Kiểm tra admin tồn tại
        const [existingAdmin] = await connection.execute(`
            SELECT tk.TENDANGNHAP 
            FROM TAIKHOAN tk
            JOIN VAITRO vt ON tk.MAVT = vt.MAVT
            WHERE tk.TENDANGNHAP = ? AND vt.TENVT = 'ADMIN'
        `, [username]);

        if (existingAdmin.length === 0) {
            await connection.end();
            return res.status(404).json({
                success: false,
                error: 'Không tìm thấy admin'
            });
        }

        // Chuẩn bị query và parameters
        let updateQuery = 'UPDATE TAIKHOAN SET ';
        let updateParams = [];
        let queryParts = [];

        if (HOTEN !== undefined) {
            queryParts.push('HOTEN = ?');
            updateParams.push(HOTEN);
        }
        if (EMAIL !== undefined) {
            queryParts.push('EMAIL = ?');
            updateParams.push(EMAIL);
        }
        if (SDT !== undefined) {
            queryParts.push('SDT = ?');
            updateParams.push(SDT);
        }
        if (MATKHAU !== undefined && MATKHAU.trim() !== '') {
            queryParts.push('MATKHAU = ?');
            updateParams.push(MATKHAU);
        }

        if (queryParts.length === 0) {
            await connection.end();
            return res.status(400).json({
                success: false,
                error: 'Không có thông tin nào để cập nhật'
            });
        }

        updateQuery += queryParts.join(', ') + ' WHERE TENDANGNHAP = ?';
        updateParams.push(username);

        await connection.execute(updateQuery, updateParams);
        await connection.end();

        res.json({
            success: true,
            message: 'Cập nhật thông tin admin thành công'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Lỗi khi cập nhật admin'
        });
    }
});

// DELETE - Xóa admin
router.delete('/admins/:username', async (req, res) => {
    try {
        const { username } = req.params;

        // Kiểm tra cơ bản
        if (!username) {
            return res.status(400).json({
                success: false,
                error: 'Tên đăng nhập không hợp lệ'
            });
        }

        const connection = await mysql.createConnection(dbConfig);

        // Kiểm tra admin tồn tại
        const [existingAdmin] = await connection.execute(`
            SELECT tk.TENDANGNHAP, tk.MAVT 
            FROM TAIKHOAN tk
            JOIN VAITRO vt ON tk.MAVT = vt.MAVT
            WHERE tk.TENDANGNHAP = ? AND vt.TENVT = 'ADMIN'
        `, [username]);

        if (existingAdmin.length === 0) {
            await connection.end();
            return res.status(404).json({
                success: false,
                error: 'Không tìm thấy admin'
            });
        }

        // Xóa admin
        await connection.execute(
            'DELETE FROM TAIKHOAN WHERE TENDANGNHAP = ?',
            [username]
        );

        await connection.end();

        res.json({
            success: true,
            message: 'Xóa admin thành công'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Lỗi khi xóa admin'
        });
    }
});

// GET - Lấy thông tin một người dùng
router.get('/users/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const connection = await mysql.createConnection(dbConfig);

        const [rows] = await connection.execute(`
            SELECT 
                tk.TENDANGNHAP,
                tk.MAVT,
                tk.HOTEN,
                tk.EMAIL,
                tk.SDT,
                vt.TENVT
            FROM TAIKHOAN tk
            JOIN VAITRO vt ON tk.MAVT = vt.MAVT
            WHERE tk.TENDANGNHAP = ?
        `, [username]);

        await connection.end();

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Không tìm thấy người dùng'
            });
        }

        res.json({
            success: true,
            data: rows[0]
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Lỗi khi lấy thông tin người dùng'
        });
    }
});

// POST - Tạo người dùng mới
router.post('/users', async (req, res) => {
    try {
        const { TENDANGNHAP, MAVT, HOTEN, EMAIL, SDT, MATKHAU } = req.body;

        // Validation
        if (!TENDANGNHAP || !MAVT || !MATKHAU) {
            return res.status(400).json({
                success: false,
                error: 'Tên đăng nhập, vai trò và mật khẩu là bắt buộc'
            });
        }

        // Kiểm tra tên đăng nhập đã tồn tại
        const connection = await mysql.createConnection(dbConfig);
        const [existingUser] = await connection.execute(
            'SELECT TENDANGNHAP FROM TAIKHOAN WHERE TENDANGNHAP = ?',
            [TENDANGNHAP]
        );

        if (existingUser.length > 0) {
            await connection.end();
            return res.status(400).json({
                success: false,
                error: 'Tên đăng nhập đã tồn tại'
            });
        }

        // Thêm người dùng mới (mật khẩu lưu trực tiếp)
        await connection.execute(`
            INSERT INTO TAIKHOAN (TENDANGNHAP, MAVT, HOTEN, EMAIL, SDT, MATKHAU)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [TENDANGNHAP, MAVT, HOTEN || null, EMAIL || null, SDT || null, MATKHAU]);

        await connection.end();

        res.json({
            success: true,
            message: 'Thêm người dùng thành công'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Lỗi khi tạo người dùng'
        });
    }
});

// PUT - Cập nhật thông tin người dùng
router.put('/users/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const { MAVT, HOTEN, EMAIL, SDT, MATKHAU } = req.body;

        const connection = await mysql.createConnection(dbConfig);

        // Kiểm tra người dùng tồn tại
        const [existingUser] = await connection.execute(
            'SELECT TENDANGNHAP FROM TAIKHOAN WHERE TENDANGNHAP = ?',
            [username]
        );

        if (existingUser.length === 0) {
            await connection.end();
            return res.status(404).json({
                success: false,
                error: 'Không tìm thấy người dùng'
            });
        }

        // Chuẩn bị query và parameters
        let updateQuery = 'UPDATE TAIKHOAN SET ';
        let updateParams = [];
        let queryParts = [];

        if (MAVT !== undefined) {
            queryParts.push('MAVT = ?');
            updateParams.push(MAVT);
        }
        if (HOTEN !== undefined) {
            queryParts.push('HOTEN = ?');
            updateParams.push(HOTEN);
        }
        if (EMAIL !== undefined) {
            queryParts.push('EMAIL = ?');
            updateParams.push(EMAIL);
        }
        if (SDT !== undefined) {
            queryParts.push('SDT = ?');
            updateParams.push(SDT);
        }
        if (MATKHAU !== undefined && MATKHAU.trim() !== '') {
            queryParts.push('MATKHAU = ?');
            updateParams.push(MATKHAU);
        }

        if (queryParts.length === 0) {
            await connection.end();
            return res.status(400).json({
                success: false,
                error: 'Không có thông tin nào để cập nhật'
            });
        }

        updateQuery += queryParts.join(', ') + ' WHERE TENDANGNHAP = ?';
        updateParams.push(username);

        await connection.execute(updateQuery, updateParams);
        await connection.end();

        res.json({
            success: true,
            message: 'Cập nhật thông tin người dùng thành công'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Lỗi khi cập nhật người dùng'
        });
    }
});

// DELETE - Xóa người dùng
router.delete('/users/:username', async (req, res) => {
    try {
        const { username } = req.params;

        // Kiểm tra cơ bản
        if (!username) {
            return res.status(400).json({
                success: false,
                error: 'Tên đăng nhập không hợp lệ'
            });
        }

        const connection = await mysql.createConnection(dbConfig);

        // Kiểm tra người dùng tồn tại
        const [existingUser] = await connection.execute(
            'SELECT TENDANGNHAP, MAVT FROM TAIKHOAN WHERE TENDANGNHAP = ?',
            [username]
        );

        if (existingUser.length === 0) {
            await connection.end();
            return res.status(404).json({
                success: false,
                error: 'Không tìm thấy người dùng'
            });
        }

        // Xóa người dùng
        await connection.execute(
            'DELETE FROM TAIKHOAN WHERE TENDANGNHAP = ?',
            [username]
        );

        await connection.end();

        res.json({
            success: true,
            message: 'Xóa người dùng thành công'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Lỗi khi xóa người dùng'
        });
    }
});

// GET - Lấy danh sách vai trò
router.get('/roles', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);

        const [rows] = await connection.execute(`
            SELECT MAVT, TENVT FROM VAITRO ORDER BY MAVT
        `);

        await connection.end();

        res.json({
            success: true,
            data: rows
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Lỗi khi lấy danh sách vai trò'
        });
    }
});

// Test endpoint để kiểm tra kết nối
router.get('/test', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT 1 as test');
        await connection.end();

        res.json({
            success: true,
            message: 'Kết nối database thành công',
            session: {
                loggedin: req.session.loggedin,
                username: req.session.username,
                vaitro: req.session.vaitro
            },
            sessionID: req.sessionID,
            headers: req.headers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Lỗi kết nối database: ' + error.message
        });
    }
});

// Debug endpoint để kiểm tra session
router.get('/debug-session', (req, res) => {
    res.json({
        session: req.session,
        sessionID: req.sessionID,
        cookies: req.headers.cookie,
        headers: req.headers
    });
});

module.exports = router;
