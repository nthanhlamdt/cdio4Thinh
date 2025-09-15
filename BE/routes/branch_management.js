const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

// Kết nối database
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'DB_QL_RAP_CHIEU_PHIM',
  charset: 'utf8mb4'
};

// Lấy danh sách tất cả rạp chiếu
router.get('/branches', async (req, res) => {
  try {
    console.log('🏢 [API] /branches called with query:', req.query);

    const connection = await mysql.createConnection(dbConfig);
    const { city } = req.query;

    let query = `
            SELECT r.MARAP, r.TENRAP, r.DIACHI, tp.TENTP, r.MATP
            FROM RAP r
            LEFT JOIN THANHPHO tp ON r.MATP = tp.MATP
        `;

    let params = [];

    // Nếu có filter theo thành phố
    if (city) {
      console.log('🏙️ [API] Filtering by city:', city);
      query += ' WHERE r.MATP = ?';
      params.push(city);
    }

    query += ' ORDER BY r.TENRAP';

    console.log('🔍 [API] Final query:', query);
    console.log('📝 [API] Params:', params);

    const [rows] = await connection.execute(query, params);
    console.log('📊 [API] Query result:', rows);

    await connection.end();

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('❌ [API] Error fetching branches:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi khi tải danh sách rạp chiếu: ' + error.message
    });
  }
});

// Thêm rạp chiếu mới
router.post('/branches', async (req, res) => {
  try {
    const { TENRAP, DIACHI, MATP } = req.body;

    if (!TENRAP || !DIACHI || !MATP) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng nhập đầy đủ thông tin'
      });
    }

    const connection = await mysql.createConnection(dbConfig);

    // Tạo mã rạp tự động
    const [countRows] = await connection.execute('SELECT COUNT(*) as count FROM RAP');
    const newMarap = `R${String(countRows[0].count + 1).padStart(3, '0')}`;

    await connection.execute(
      'INSERT INTO RAP (MARAP, TENRAP, DIACHI, MATP) VALUES (?, ?, ?, ?)',
      [newMarap, TENRAP, DIACHI, MATP]
    );

    await connection.end();

    res.json({
      success: true,
      message: 'Thêm rạp chiếu thành công',
      data: { MARAP: newMarap }
    });
  } catch (error) {
    console.error('Error adding branch:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi khi thêm rạp chiếu'
    });
  }
});

// Cập nhật rạp chiếu
router.put('/branches/:marap', async (req, res) => {
  try {
    const { marap } = req.params;
    const { TENRAP, DIACHI, MATP } = req.body;

    if (!TENRAP || !DIACHI || !MATP) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng nhập đầy đủ thông tin'
      });
    }

    const connection = await mysql.createConnection(dbConfig);

    // Kiểm tra xem rạp có tồn tại không
    const [existingRows] = await connection.execute(
      'SELECT MARAP FROM RAP WHERE MARAP = ?',
      [marap]
    );

    if (existingRows.length === 0) {
      await connection.end();
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy rạp chiếu'
      });
    }

    await connection.execute(
      'UPDATE RAP SET TENRAP = ?, DIACHI = ?, MATP = ? WHERE MARAP = ?',
      [TENRAP, DIACHI, MATP, marap]
    );

    await connection.end();

    res.json({
      success: true,
      message: 'Cập nhật rạp chiếu thành công'
    });
  } catch (error) {
    console.error('Error updating branch:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi khi cập nhật rạp chiếu'
    });
  }
});

// Xóa rạp chiếu
router.delete('/branches/:marap', async (req, res) => {
  try {
    const { marap } = req.params;

    const connection = await mysql.createConnection(dbConfig);

    // Kiểm tra xem rạp có phòng chiếu không
    const [roomRows] = await connection.execute(
      'SELECT COUNT(*) as count FROM PHONG WHERE MARAP = ?',
      [marap]
    );

    if (roomRows[0].count > 0) {
      await connection.end();
      return res.status(400).json({
        success: false,
        error: 'Không thể xóa rạp có phòng chiếu'
      });
    }

    await connection.execute('DELETE FROM RAP WHERE MARAP = ?', [marap]);

    await connection.end();

    res.json({
      success: true,
      message: 'Xóa rạp chiếu thành công'
    });
  } catch (error) {
    console.error('Error deleting branch:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi khi xóa rạp chiếu'
    });
  }
});

// Lấy thông tin một rạp cụ thể
router.get('/branches/:marap', async (req, res) => {
  try {
    const { marap } = req.params;
    const connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute(`
            SELECT r.MARAP, r.TENRAP, r.DIACHI, r.MATP, tp.TENTP
            FROM RAP r
            LEFT JOIN THANHPHO tp ON r.MATP = tp.MATP
            WHERE r.MARAP = ?
        `, [marap]);

    await connection.end();

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy rạp chiếu'
      });
    }

    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Error fetching branch:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi khi tải thông tin rạp chiếu'
    });
  }
});

// Lấy danh sách thành phố
router.get('/cities', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute('SELECT MATP, TENTP FROM THANHPHO ORDER BY TENTP');

    await connection.end();

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching cities:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi khi tải danh sách thành phố'
    });
  }
});

module.exports = router;
