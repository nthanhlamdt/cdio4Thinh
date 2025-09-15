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

// Lấy danh sách tất cả lịch chiếu
router.get('/schedules', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);

    const { film, room, branch, city, date } = req.query;

    let query = `
            SELECT lc.MALICHCHIEU, lc.MAPHIM, lc.MAPHONG,
                   p.TENPHIM, r.TENRAP, ph.TENPHONG,
                   lc.NGAYCHIEU, lc.GIOCHIEU, tt.TENTT,
                   COALESCE(total_seats.TOTAL_SEATS, 0) AS TOTAL_SEATS,
                   COALESCE(sold_tickets.SOLD, 0) AS SOLD,
                   COALESCE(total_seats.TOTAL_SEATS, 0) - COALESCE(sold_tickets.SOLD, 0) AS AVAILABLE
            FROM LICHCHIEU lc
            LEFT JOIN PHIM p ON lc.MAPHIM = p.MAPHIM
            LEFT JOIN PHONG ph ON lc.MAPHONG = ph.MAPHONG
            LEFT JOIN RAP r ON ph.MARAP = r.MARAP
            LEFT JOIN TINHTRANGPHIM tt ON p.MATT = tt.MATT
            LEFT JOIN THANHPHO tp ON r.MATP = tp.MATP
            LEFT JOIN (
                SELECT dg.MAPHONG, COUNT(g.MAGHE) AS TOTAL_SEATS
                FROM DAYGHE dg
                LEFT JOIN GHE g ON dg.MADAYGHE = g.MADAYGHE
                GROUP BY dg.MAPHONG
            ) AS total_seats ON total_seats.MAPHONG = lc.MAPHONG
            LEFT JOIN (
                SELECT MALICHCHIEU, COUNT(*) AS SOLD
                FROM VE
                GROUP BY MALICHCHIEU
            ) AS sold_tickets ON sold_tickets.MALICHCHIEU = lc.MALICHCHIEU
            WHERE 1=1`;
    const params = [];

    if (film) { query += ' AND lc.MAPHIM = ?'; params.push(film); }
    if (room) { query += ' AND lc.MAPHONG = ?'; params.push(room); }
    if (branch) { query += ' AND r.MARAP = ?'; params.push(branch); }
    if (city) { query += ' AND r.MATP = ?'; params.push(city); }
    if (date) { query += ' AND lc.NGAYCHIEU = ?'; params.push(date); }

    query += ' ORDER BY lc.NGAYCHIEU ASC, lc.GIOCHIEU ASC';

    const [rows] = await connection.execute(query, params);

    await connection.end();

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi khi tải danh sách lịch chiếu'
    });
  }
});

// Danh sách ghế của một suất chiếu, đánh dấu ghế đã đặt
router.get('/schedules/:malichchieu/seats', async (req, res) => {
  try {
    const { malichchieu } = req.params;
    const connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute(`
      SELECT g.MAGHE,
             dg.TENDAY,
             g.SOGHE,
             CASE WHEN v.MAGHE IS NULL THEN 0 ELSE 1 END AS BOOKED
      FROM LICHCHIEU lc
      JOIN DAYGHE dg ON dg.MAPHONG = lc.MAPHONG
      JOIN GHE g ON g.MADAYGHE = dg.MADAYGHE
      LEFT JOIN VE v ON v.MALICHCHIEU = lc.MALICHCHIEU AND v.MAGHE = g.MAGHE
      WHERE lc.MALICHCHIEU = ?
      ORDER BY dg.TENDAY, g.SOGHE
    `, [malichchieu]);

    await connection.end();

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching seats for showtime:', error);
    res.status(500).json({ success: false, error: 'Lỗi khi tải ghế của suất chiếu' });
  }
});

// Đặt vé cho một suất chiếu
router.post('/schedules/:malichchieu/tickets', async (req, res) => {
  try {
    const { malichchieu } = req.params;
    const { seats, GIAVE, TENDANGNHAP, MAPTTT } = req.body;

    if (!Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({ success: false, error: 'Danh sách ghế trống' });
    }

    const connection = await mysql.createConnection(dbConfig);

    // Xác thực ghế thuộc đúng phòng của suất chiếu và chưa bị đặt
    const [lcRows] = await connection.execute('SELECT MAPHONG FROM LICHCHIEU WHERE MALICHCHIEU = ?', [malichchieu]);
    if (lcRows.length === 0) {
      await connection.end();
      return res.status(404).json({ success: false, error: 'Không tìm thấy suất chiếu' });
    }
    const maphong = lcRows[0].MAPHONG;

    // Kiểm tra tất cả ghế thuộc phòng
    const [seatCheck] = await connection.query(
      `SELECT g.MAGHE
       FROM GHE g
       JOIN DAYGHE dg ON dg.MADAYGHE = g.MADAYGHE
       WHERE dg.MAPHONG = ? AND g.MAGHE IN (${seats.map(() => '?').join(',')})`,
      [maphong, ...seats]
    );
    if (seatCheck.length !== seats.length) {
      await connection.end();
      return res.status(400).json({ success: false, error: 'Có ghế không thuộc phòng của suất chiếu' });
    }

    // Kiểm tra ghế đã đặt
    const [booked] = await connection.query(
      `SELECT MAGHE FROM VE WHERE MALICHCHIEU = ? AND MAGHE IN (${seats.map(() => '?').join(',')})`,
      [malichchieu, ...seats]
    );
    if (booked.length > 0) {
      await connection.end();
      return res.status(409).json({ success: false, error: 'Một số ghế đã được đặt', booked: booked.map(r => r.MAGHE) });
    }

    // Tạo mã vé và chèn
    const [countRows] = await connection.execute('SELECT COUNT(*) AS count FROM VE');
    let next = countRows[0].count;

    const insertValues = [];
    seats.forEach(maghe => {
      next += 1;
      const mave = `V${String(next).padStart(3, '0')}`;
      insertValues.push([mave, malichchieu, maghe, GIAVE || 0]);
    });

    await connection.query(
      'INSERT INTO VE (MAVE, MALICHCHIEU, MAGHE, GIAVE) VALUES ?', [insertValues]
    );

    await connection.end();

    res.json({ success: true, message: 'Đặt vé thành công', data: { seats } });
  } catch (error) {
    console.error('Error booking tickets:', error);
    res.status(500).json({ success: false, error: 'Lỗi khi đặt vé' });
  }
});

// Thêm lịch chiếu mới
router.post('/schedules', async (req, res) => {
  try {
    const { MAPHIM, MAPHONG, NGAYCHIEU, GIOCHIEU } = req.body;

    if (!MAPHIM || !MAPHONG || !NGAYCHIEU || !GIOCHIEU) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng nhập đầy đủ thông tin'
      });
    }

    const connection = await mysql.createConnection(dbConfig);

    // Tạo mã lịch chiếu tự động
    const [countRows] = await connection.execute('SELECT COUNT(*) as count FROM LICHCHIEU');
    const newMalichchieu = `LC${String(countRows[0].count + 1).padStart(3, '0')}`;

    // Kiểm tra xem phòng có bị trùng lịch không
    const [conflictRows] = await connection.execute(`
            SELECT COUNT(*) as count FROM LICHCHIEU 
            WHERE MAPHONG = ? AND NGAYCHIEU = ? AND GIOCHIEU = ?
        `, [MAPHONG, NGAYCHIEU, GIOCHIEU]);

    if (conflictRows[0].count > 0) {
      await connection.end();
      return res.status(400).json({
        success: false,
        error: 'Phòng đã có lịch chiếu vào thời gian này'
      });
    }

    await connection.execute(
      'INSERT INTO LICHCHIEU (MALICHCHIEU, MAPHIM, MAPHONG, NGAYCHIEU, GIOCHIEU) VALUES (?, ?, ?, ?, ?)',
      [newMalichchieu, MAPHIM, MAPHONG, NGAYCHIEU, GIOCHIEU]
    );

    await connection.end();

    res.json({
      success: true,
      message: 'Thêm lịch chiếu thành công',
      data: { MALICHCHIEU: newMalichchieu }
    });
  } catch (error) {
    console.error('Error adding schedule:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi khi thêm lịch chiếu'
    });
  }
});

// Cập nhật lịch chiếu
router.put('/schedules/:malichchieu', async (req, res) => {
  try {
    const { malichchieu } = req.params;
    const { MAPHIM, MAPHONG, NGAYCHIEU, GIOCHIEU } = req.body;

    if (!MAPHIM || !MAPHONG || !NGAYCHIEU || !GIOCHIEU) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng nhập đầy đủ thông tin'
      });
    }

    const connection = await mysql.createConnection(dbConfig);

    // Kiểm tra xem phòng có bị trùng lịch không (trừ lịch hiện tại)
    const [conflictRows] = await connection.execute(`
            SELECT COUNT(*) as count FROM LICHCHIEU 
            WHERE MAPHONG = ? AND NGAYCHIEU = ? AND GIOCHIEU = ? AND MALICHCHIEU != ?
        `, [MAPHONG, NGAYCHIEU, GIOCHIEU, malichchieu]);

    if (conflictRows[0].count > 0) {
      await connection.end();
      return res.status(400).json({
        success: false,
        error: 'Phòng đã có lịch chiếu vào thời gian này'
      });
    }

    await connection.execute(
      'UPDATE LICHCHIEU SET MAPHIM = ?, MAPHONG = ?, NGAYCHIEU = ?, GIOCHIEU = ? WHERE MALICHCHIEU = ?',
      [MAPHIM, MAPHONG, NGAYCHIEU, GIOCHIEU, malichchieu]
    );

    await connection.end();

    res.json({
      success: true,
      message: 'Cập nhật lịch chiếu thành công'
    });
  } catch (error) {
    console.error('Error updating schedule:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi khi cập nhật lịch chiếu'
    });
  }
});

// Xóa lịch chiếu
router.delete('/schedules/:malichchieu', async (req, res) => {
  try {
    const { malichchieu } = req.params;

    const connection = await mysql.createConnection(dbConfig);

    // Kiểm tra xem lịch chiếu có vé đã bán không
    const [ticketRows] = await connection.execute(
      'SELECT COUNT(*) as count FROM VE WHERE MALICHCHIEU = ?',
      [malichchieu]
    );

    if (ticketRows[0].count > 0) {
      await connection.end();
      return res.status(400).json({
        success: false,
        error: 'Không thể xóa lịch chiếu đã có vé được bán'
      });
    }

    await connection.execute('DELETE FROM LICHCHIEU WHERE MALICHCHIEU = ?', [malichchieu]);

    await connection.end();

    res.json({
      success: true,
      message: 'Xóa lịch chiếu thành công'
    });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi khi xóa lịch chiếu'
    });
  }
});

// Lấy danh sách phim cho dropdown
router.get('/films', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute(`
            SELECT p.MAPHIM, p.TENPHIM, tt.TENTT
            FROM PHIM p
            LEFT JOIN TINHTRANGPHIM tt ON p.MATT = tt.MATT
            ORDER BY p.TENPHIM
        `);

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

// Lấy thông tin một lịch chiếu cụ thể
router.get('/schedules/:malichchieu', async (req, res) => {
  try {
    const { malichchieu } = req.params;
    const connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute(`
            SELECT lc.MALICHCHIEU, lc.MAPHIM, lc.MAPHONG, lc.NGAYCHIEU, lc.GIOCHIEU,
                   p.TENPHIM, r.TENRAP, ph.TENPHONG, tt.TENTT, r.MARAP, r.MATP
            FROM LICHCHIEU lc
            LEFT JOIN PHIM p ON lc.MAPHIM = p.MAPHIM
            LEFT JOIN PHONG ph ON lc.MAPHONG = ph.MAPHONG
            LEFT JOIN RAP r ON ph.MARAP = r.MARAP
            LEFT JOIN TINHTRANGPHIM tt ON p.MATT = tt.MATT
            WHERE lc.MALICHCHIEU = ?
        `, [malichchieu]);

    await connection.end();

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy lịch chiếu'
      });
    }

    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Error fetching schedule:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi khi tải thông tin lịch chiếu'
    });
  }
});

// Lấy danh sách phòng cho dropdown
router.get('/rooms', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute(`
            SELECT p.MAPHONG, p.TENPHONG, r.TENRAP
            FROM PHONG p
            LEFT JOIN RAP r ON p.MARAP = r.MARAP
            ORDER BY r.TENRAP, p.TENPHONG
        `);

    await connection.end();

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({
      success: false,
      error: 'Lỗi khi tải danh sách phòng'
    });
  }
});

module.exports = router;
