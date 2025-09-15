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

// Lấy danh sách tất cả phim
router.get('/films', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);

    // Debug: Kiểm tra dữ liệu từng bảng
    console.log('🔍 Checking PHIM table...');
    const [phimRows] = await connection.execute('SELECT COUNT(*) as count FROM PHIM');
    console.log('PHIM count:', phimRows[0].count);

    console.log('🔍 Checking CHITIETPHIM table...');
    const [ctRows] = await connection.execute('SELECT COUNT(*) as count FROM CHITIETPHIM');
    console.log('CHITIETPHIM count:', ctRows[0].count);

    const [rows] = await connection.execute(`
            SELECT p.MAPHIM, p.TENPHIM, p.HINH_ANH_URL, tt.TENTT,
                   COALESCE(ct.DAODIEN, 'N/A') as DAODIEN, 
                   COALESCE(ct.DIENVIEN, 'N/A') as DIENVIEN, 
                   COALESCE(ct.THELOAI, 'N/A') as THELOAI, 
                   COALESCE(ct.NGONNGU, 'N/A') as NGONNGU, 
                   COALESCE(ct.RATED, 'N/A') as RATED
            FROM PHIM p
            LEFT JOIN TINHTRANGPHIM tt ON p.MATT = tt.MATT
            LEFT JOIN CHITIETPHIM ct ON p.MAPHIM = ct.MAPHIM
            ORDER BY p.MAPHIM
        `);

    console.log('📊 Query result:', rows.length, 'films');
    if (rows.length > 0) {
      console.log('🎬 First film:', rows[0]);
    }

    await connection.end();

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching films:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi khi tải danh sách phim'
    });
  }
});

// Thêm phim mới
router.post('/films', async (req, res) => {
  try {
    const { TENPHIM, HINH_ANH_URL, MATT, DAODIEN, DIENVIEN, THELOAI, NGAYKHOICHIEU, THOILUONG, NGONNGU, RATED, MOTA, TRAILER_YOUTUBE_ID } = req.body;

    if (!TENPHIM || !HINH_ANH_URL || !MATT) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng nhập đầy đủ thông tin bắt buộc'
      });
    }

    const connection = await mysql.createConnection(dbConfig);

    // Tạo mã phim tự động
    const [countRows] = await connection.execute('SELECT COUNT(*) as count FROM PHIM');
    const newMaphim = `P${String(countRows[0].count + 1).padStart(3, '0')}`;

    // Thêm phim
    await connection.execute(
      'INSERT INTO PHIM (MAPHIM, TENPHIM, HINH_ANH_URL, MATT) VALUES (?, ?, ?, ?)',
      [newMaphim, TENPHIM, HINH_ANH_URL, MATT]
    );

    // Thêm chi tiết phim nếu có
    if (DAODIEN && DIENVIEN && THELOAI && NGAYKHOICHIEU && THOILUONG && NGONNGU && RATED && MOTA && TRAILER_YOUTUBE_ID) {
      await connection.execute(
        'INSERT INTO CHITIETPHIM (MAPHIM, DAODIEN, DIENVIEN, THELOAI, NGAYKHOICHIEU, THOILUONG, NGONNGU, RATED, MOTA, TRAILER_YOUTUBE_ID) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [newMaphim, DAODIEN, DIENVIEN, THELOAI, NGAYKHOICHIEU, THOILUONG, NGONNGU, RATED, MOTA, TRAILER_YOUTUBE_ID]
      );
    }

    await connection.end();

    res.json({
      success: true,
      message: 'Thêm phim thành công',
      data: { MAPHIM: newMaphim }
    });
  } catch (error) {
    console.error('Error adding film:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi khi thêm phim'
    });
  }
});

// Cập nhật phim
router.put('/films/:maphim', async (req, res) => {
  try {
    const { maphim } = req.params;
    const { TENPHIM, HINH_ANH_URL, MATT, DAODIEN, DIENVIEN, THELOAI, NGAYKHOICHIEU, THOILUONG, NGONNGU, RATED, MOTA, TRAILER_YOUTUBE_ID } = req.body;

    if (!TENPHIM || !HINH_ANH_URL || !MATT) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng nhập đầy đủ thông tin bắt buộc'
      });
    }

    const connection = await mysql.createConnection(dbConfig);

    // Cập nhật phim
    await connection.execute(
      'UPDATE PHIM SET TENPHIM = ?, HINH_ANH_URL = ?, MATT = ? WHERE MAPHIM = ?',
      [TENPHIM, HINH_ANH_URL, MATT, maphim]
    );

    // Cập nhật chi tiết phim
    if (DAODIEN && DIENVIEN && THELOAI && NGAYKHOICHIEU && THOILUONG && NGONNGU && RATED && MOTA && TRAILER_YOUTUBE_ID) {
      await connection.execute(
        'UPDATE CHITIETPHIM SET DAODIEN = ?, DIENVIEN = ?, THELOAI = ?, NGAYKHOICHIEU = ?, THOILUONG = ?, NGONNGU = ?, RATED = ?, MOTA = ?, TRAILER_YOUTUBE_ID = ? WHERE MAPHIM = ?',
        [DAODIEN, DIENVIEN, THELOAI, NGAYKHOICHIEU, THOILUONG, NGONNGU, RATED, MOTA, TRAILER_YOUTUBE_ID, maphim]
      );
    }

    await connection.end();

    res.json({
      success: true,
      message: 'Cập nhật phim thành công'
    });
  } catch (error) {
    console.error('Error updating film:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi khi cập nhật phim'
    });
  }
});

// Xóa phim
router.delete('/films/:maphim', async (req, res) => {
  try {
    const { maphim } = req.params;

    const connection = await mysql.createConnection(dbConfig);

    // Kiểm tra xem phim có lịch chiếu không
    const [scheduleRows] = await connection.execute(
      'SELECT COUNT(*) as count FROM LICHCHIEU WHERE MAPHIM = ?',
      [maphim]
    );

    if (scheduleRows[0].count > 0) {
      await connection.end();
      return res.status(400).json({
        success: false,
        error: 'Không thể xóa phim có lịch chiếu'
      });
    }

    // Xóa chi tiết phim trước (do foreign key constraint)
    await connection.execute('DELETE FROM CHITIETPHIM WHERE MAPHIM = ?', [maphim]);
    await connection.execute('DELETE FROM PHIM WHERE MAPHIM = ?', [maphim]);

    await connection.end();

    res.json({
      success: true,
      message: 'Xóa phim thành công'
    });
  } catch (error) {
    console.error('Error deleting film:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi khi xóa phim'
    });
  }
});

// Lấy thông tin một phim cụ thể
router.get('/films/:maphim', async (req, res) => {
  try {
    const { maphim } = req.params;
    const connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute(`
            SELECT p.MAPHIM, p.TENPHIM, p.HINH_ANH_URL, p.MATT, tt.TENTT,
                   ct.DAODIEN, ct.DIENVIEN, ct.THELOAI, ct.NGAYKHOICHIEU, 
                   ct.THOILUONG, ct.NGONNGU, ct.RATED, ct.MOTA, ct.TRAILER_YOUTUBE_ID
            FROM PHIM p
            LEFT JOIN TINHTRANGPHIM tt ON p.MATT = tt.MATT
            LEFT JOIN CHITIETPHIM ct ON p.MAPHIM = ct.MAPHIM
            WHERE p.MAPHIM = ?
        `, [maphim]);

    await connection.end();

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy phim'
      });
    }

    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Error fetching film:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi khi tải thông tin phim'
    });
  }
});

// Lấy danh sách tình trạng phim
router.get('/film-status', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute('SELECT MATT, TENTT FROM TINHTRANGPHIM ORDER BY TENTT');

    await connection.end();

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching film status:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi khi tải danh sách tình trạng phim'
    });
  }
});

module.exports = router;
