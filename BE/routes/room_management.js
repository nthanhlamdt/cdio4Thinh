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

// Lấy danh sách tất cả phòng chiếu
router.get('/rooms', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute(`
            SELECT p.MAPHONG, p.TENPHONG, r.TENRAP, 
                   COUNT(g.MAGHE) as SO_GHE
            FROM PHONG p
            LEFT JOIN RAP r ON p.MARAP = r.MARAP
            LEFT JOIN DAYGHE dg ON p.MAPHONG = dg.MAPHONG
            LEFT JOIN GHE g ON dg.MADAYGHE = g.MADAYGHE
            GROUP BY p.MAPHONG, p.TENPHONG, r.TENRAP
            ORDER BY p.MAPHONG
        `);

    await connection.end();

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Lỗi khi tải danh sách phòng chiếu'
    });
  }
});

// ========== QUẢN LÝ DÃY GHẾ (DAYGHE) VÀ GHẾ (GHE) ==========

// Lấy danh sách dãy ghế theo phòng
router.get('/rooms/:maphong/rows', async (req, res) => {
  try {
    const { maphong } = req.params;
    const connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute(
      `SELECT dg.MADAYGHE, dg.TENDAY, dg.MAPHONG,
              COUNT(g.MAGHE) AS SO_GHE
       FROM DAYGHE dg
       LEFT JOIN GHE g ON dg.MADAYGHE = g.MADAYGHE
       WHERE dg.MAPHONG = ?
       GROUP BY dg.MADAYGHE, dg.TENDAY, dg.MAPHONG
       ORDER BY dg.TENDAY`,
      [maphong]
    );

    await connection.end();

    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Lỗi khi tải danh sách dãy ghế' });
  }
});

// Thêm dãy ghế cho phòng
router.post('/rows', async (req, res) => {
  try {
    const { TENDAY, MAPHONG } = req.body;
    if (!TENDAY || !MAPHONG) {
      return res.status(400).json({ success: false, error: 'Vui lòng nhập đầy đủ thông tin' });
    }

    const connection = await mysql.createConnection(dbConfig);

    const [countRows] = await connection.execute('SELECT COUNT(*) AS count FROM DAYGHE');
    const newMadayghe = `DG${String(countRows[0].count + 1).padStart(3, '0')}`;

    await connection.execute(
      'INSERT INTO DAYGHE (MADAYGHE, TENDAY, MAPHONG) VALUES (?, ?, ?)',
      [newMadayghe, TENDAY, MAPHONG]
    );

    await connection.end();

    res.json({ success: true, data: { MADAYGHE: newMadayghe } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Lỗi khi thêm dãy ghế' });
  }
});

// Xóa dãy ghế (cùng toàn bộ ghế trong dãy)
router.delete('/rows/:madayghe', async (req, res) => {
  try {
    const { madayghe } = req.params;
    const connection = await mysql.createConnection(dbConfig);

    await connection.execute('DELETE FROM GHE WHERE MADAYGHE = ?', [madayghe]);
    await connection.execute('DELETE FROM DAYGHE WHERE MADAYGHE = ?', [madayghe]);

    await connection.end();

    res.json({ success: true, message: 'Xóa dãy ghế thành công' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Lỗi khi xóa dãy ghế' });
  }
});

// Lấy danh sách ghế theo dãy
router.get('/rows/:madayghe/seats', async (req, res) => {
  try {
    const { madayghe } = req.params;
    const connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute(
      'SELECT MAGHE, SOGHE, MADAYGHE FROM GHE WHERE MADAYGHE = ? ORDER BY SOGHE',
      [madayghe]
    );

    await connection.end();

    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Lỗi khi tải danh sách ghế' });
  }
});

// Thêm ghế vào dãy
router.post('/seats', async (req, res) => {
  try {
    const { MADAYGHE, SOGHE } = req.body;
    if (!MADAYGHE || !SOGHE) {
      return res.status(400).json({ success: false, error: 'Vui lòng nhập đầy đủ thông tin' });
    }

    const connection = await mysql.createConnection(dbConfig);

    // Kiểm tra trùng số ghế trong dãy
    const [exists] = await connection.execute(
      'SELECT 1 FROM GHE WHERE MADAYGHE = ? AND SOGHE = ? LIMIT 1',
      [MADAYGHE, SOGHE]
    );
    if (exists.length > 0) {
      await connection.end();
      return res.status(400).json({ success: false, error: 'Số ghế đã tồn tại trong dãy' });
    }

    const [countSeats] = await connection.execute('SELECT COUNT(*) AS count FROM GHE');
    const newMaghe = `G${String(countSeats[0].count + 1).padStart(3, '0')}`;

    await connection.execute(
      'INSERT INTO GHE (MAGHE, SOGHE, MADAYGHE) VALUES (?, ?, ?)',
      [newMaghe, SOGHE, MADAYGHE]
    );

    await connection.end();

    res.json({ success: true, data: { MAGHE: newMaghe } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Lỗi khi thêm ghế' });
  }
});

// Xóa ghế
router.delete('/seats/:maghe', async (req, res) => {
  try {
    const { maghe } = req.params;
    const connection = await mysql.createConnection(dbConfig);

    // Kiểm tra ghế đã có vé hay chưa
    const [tickets] = await connection.execute('SELECT COUNT(*) AS count FROM VE WHERE MAGHE = ?', [maghe]);
    if (tickets[0].count > 0) {
      await connection.end();
      return res.status(400).json({ success: false, error: 'Không thể xóa ghế đã có vé' });
    }

    await connection.execute('DELETE FROM GHE WHERE MAGHE = ?', [maghe]);

    await connection.end();

    res.json({ success: true, message: 'Xóa ghế thành công' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Lỗi khi xóa ghế' });
  }
});

// Thêm phòng chiếu mới
router.post('/rooms', async (req, res) => {
  try {
    const { TENPHONG, MARAP } = req.body;

    if (!TENPHONG || !MARAP) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng nhập đầy đủ thông tin'
      });
    }

    const connection = await mysql.createConnection(dbConfig);

    // Kiểm tra trùng tên phòng trong cùng rạp
    const [dupRows] = await connection.execute(
      'SELECT 1 FROM PHONG WHERE MARAP = ? AND TENPHONG = ? LIMIT 1',
      [MARAP, TENPHONG]
    );
    if (dupRows.length > 0) {
      await connection.end();
      return res.status(400).json({
        success: false,
        error: 'Tên phòng đã tồn tại trong rạp này'
      });
    }

    // Tạo mã phòng tự động
    const [countRows] = await connection.execute('SELECT COUNT(*) as count FROM PHONG');
    const newMaphong = `P${String(countRows[0].count + 1).padStart(3, '0')}`;

    await connection.execute(
      'INSERT INTO PHONG (MAPHONG, TENPHONG, MARAP) VALUES (?, ?, ?)',
      [newMaphong, TENPHONG, MARAP]
    );

    await connection.end();

    res.json({
      success: true,
      message: 'Thêm phòng chiếu thành công',
      data: { MAPHONG: newMaphong }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Lỗi khi thêm phòng chiếu'
    });
  }
});

// Cập nhật phòng chiếu
router.put('/rooms/:maphong', async (req, res) => {
  try {
    const { maphong } = req.params;
    const { TENPHONG, MARAP } = req.body;

    if (!TENPHONG || !MARAP) {
      return res.status(400).json({
        success: false,
        error: 'Vui lòng nhập đầy đủ thông tin'
      });
    }

    const connection = await mysql.createConnection(dbConfig);

    // Kiểm tra trùng tên phòng trong cùng rạp (trừ phòng hiện tại)
    const [dupRows] = await connection.execute(
      'SELECT 1 FROM PHONG WHERE MARAP = ? AND TENPHONG = ? AND MAPHONG <> ? LIMIT 1',
      [MARAP, TENPHONG, maphong]
    );
    if (dupRows.length > 0) {
      await connection.end();
      return res.status(400).json({
        success: false,
        error: 'Tên phòng đã tồn tại trong rạp này'
      });
    }

    await connection.execute(
      'UPDATE PHONG SET TENPHONG = ?, MARAP = ? WHERE MAPHONG = ?',
      [TENPHONG, MARAP, maphong]
    );

    await connection.end();

    res.json({
      success: true,
      message: 'Cập nhật phòng chiếu thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Lỗi khi cập nhật phòng chiếu'
    });
  }
});

// Xóa phòng chiếu
router.delete('/rooms/:maphong', async (req, res) => {
  try {
    const { maphong } = req.params;

    const connection = await mysql.createConnection(dbConfig);

    // Kiểm tra xem phòng có lịch chiếu không
    const [scheduleRows] = await connection.execute(
      'SELECT COUNT(*) as count FROM LICHCHIEU WHERE MAPHONG = ?',
      [maphong]
    );

    if (scheduleRows[0].count > 0) {
      await connection.end();
      return res.status(400).json({
        success: false,
        error: 'Không thể xóa phòng có lịch chiếu'
      });
    }

    // Xóa các ghế và dãy ghế trước
    await connection.execute(`
            DELETE g FROM GHE g
            INNER JOIN DAYGHE dg ON g.MADAYGHE = dg.MADAYGHE
            WHERE dg.MAPHONG = ?
        `, [maphong]);

    await connection.execute('DELETE FROM DAYGHE WHERE MAPHONG = ?', [maphong]);
    await connection.execute('DELETE FROM PHONG WHERE MAPHONG = ?', [maphong]);

    await connection.end();

    res.json({
      success: true,
      message: 'Xóa phòng chiếu thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Lỗi khi xóa phòng chiếu'
    });
  }
});

// Lấy thông tin một phòng cụ thể
router.get('/rooms/:maphong', async (req, res) => {
  try {
    const { maphong } = req.params;
    const connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute(`
            SELECT p.MAPHONG, p.TENPHONG, p.MARAP, r.TENRAP
            FROM PHONG p
            LEFT JOIN RAP r ON p.MARAP = r.MARAP
            WHERE p.MAPHONG = ?
        `, [maphong]);

    await connection.end();

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Không tìm thấy phòng chiếu'
      });
    }

    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Lỗi khi tải thông tin phòng chiếu'
    });
  }
});

// Lấy danh sách rạp cho dropdown
router.get('/branches', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);

    const [rows] = await connection.execute('SELECT MARAP, TENRAP FROM RAP ORDER BY TENRAP');

    await connection.end();

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Lỗi khi tải danh sách rạp'
    });
  }
});

// Lấy danh sách phòng theo rạp
router.get('/rooms', async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const { branch } = req.query;

    let query = `
            SELECT p.MAPHONG, p.TENPHONG, p.MARAP, r.TENRAP
            FROM PHONG p
            LEFT JOIN RAP r ON p.MARAP = r.MARAP
        `;

    let params = [];

    // Nếu có filter theo rạp
    if (branch) {
      query += ' WHERE p.MARAP = ?';
      params.push(branch);
    }

    query += ' ORDER BY r.TENRAP, p.TENPHONG';

    const [rows] = await connection.execute(query, params);

    await connection.end();

    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Lỗi khi tải danh sách phòng'
    });
  }
});

module.exports = router;
