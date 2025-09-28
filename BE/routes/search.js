const express = require('express');
const mysql = require('mysql2/promise');
const router = express.Router();

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'DB_QL_RAP_CHIEU_PHIM',
  charset: 'utf8mb4'
};

// Search films API
router.get('/search/films', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === '') {
      return res.json({
        success: true,
        data: [],
        message: 'Vui lòng nhập từ khóa tìm kiếm'
      });
    }

    const connection = await mysql.createConnection(dbConfig);

    // Search films by name, director, actors, genre, or language
    const searchQuery = `
            SELECT 
                p.MAPHIM,
                p.TENPHIM,
                p.HINH_ANH_URL as HINHANH,
                ct.DAODIEN,
                ct.DIENVIEN,
                ct.THELOAI,
                ct.NGONNGU,
                ct.RATED,
                ct.NGAYKHOICHIEU,
                ct.THOILUONG,
                ct.MOTA,
                ct.TRAILER_YOUTUBE_ID as TRAILER,
                tt.TENTT as TINHTRANG
            FROM PHIM p
            LEFT JOIN CHITIETPHIM ct ON p.MAPHIM = ct.MAPHIM
            LEFT JOIN TINHTRANGPHIM tt ON p.MATT = tt.MATT
            WHERE 
                p.TENPHIM LIKE ? OR
                ct.DAODIEN LIKE ? OR
                ct.DIENVIEN LIKE ? OR
                ct.THELOAI LIKE ? OR
                ct.NGONNGU LIKE ? OR
                ct.MOTA LIKE ?
            ORDER BY p.TENPHIM ASC
        `;

    const searchTerm = `%${q.trim()}%`;

    const [rows] = await connection.execute(searchQuery, [
      searchTerm, searchTerm, searchTerm,
      searchTerm, searchTerm, searchTerm
    ]);

    await connection.end();

    res.json({
      success: true,
      data: rows,
      count: rows.length,
      query: q
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Lỗi khi tìm kiếm phim: ' + error.message
    });
  }
});

// Search films with schedules (for booking)
router.get('/search/films-with-schedules', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === '') {
      return res.json({
        success: true,
        data: [],
        message: 'Vui lòng nhập từ khóa tìm kiếm'
      });
    }

    const connection = await mysql.createConnection(dbConfig);

    // Search films that have schedules
    const searchQuery = `
            SELECT DISTINCT
                p.MAPHIM,
                p.TENPHIM,
                p.HINH_ANH_URL as HINHANH,
                ct.DAODIEN,
                ct.DIENVIEN,
                ct.THELOAI,
                ct.NGONNGU,
                ct.RATED,
                ct.NGAYKHOICHIEU,
                ct.THOILUONG,
                ct.MOTA,
                ct.TRAILER_YOUTUBE_ID as TRAILER,
                tt.TENTT as TINHTRANG
            FROM PHIM p
            LEFT JOIN CHITIETPHIM ct ON p.MAPHIM = ct.MAPHIM
            LEFT JOIN TINHTRANGPHIM tt ON p.MATT = tt.MATT
            INNER JOIN LICHCHIEU lc ON p.MAPHIM = lc.MAPHIM
            WHERE 
                (p.TENPHIM LIKE ? OR
                ct.DAODIEN LIKE ? OR
                ct.DIENVIEN LIKE ? OR
                ct.THELOAI LIKE ? OR
                ct.NGONNGU LIKE ? OR
                ct.MOTA LIKE ?)
                AND tt.TENTT = 'Đang chiếu'
            ORDER BY p.TENPHIM ASC
        `;

    const searchTerm = `%${q.trim()}%`;

    const [rows] = await connection.execute(searchQuery, [
      searchTerm, searchTerm, searchTerm,
      searchTerm, searchTerm, searchTerm
    ]);

    await connection.end();

    res.json({
      success: true,
      data: rows,
      count: rows.length,
      query: q
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Lỗi khi tìm kiếm phim: ' + error.message
    });
  }
});

module.exports = router;
