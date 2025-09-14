let express = require('express');
let router = express.Router();
let db = require('../db/mysql');

router.get('/images', async (req, res) => {
    try {
        let [rows] = await db.query('SELECT * FROM ANH_SLIDER ORDER BY MA_ANH DESC');
        res.json(rows.map(row => row.DUONG_DAN));
    } catch (err) {
        console.error('Lỗi khi lấy danh sách ảnh:', err);
        res.status(500).json({ error: 'Lỗi khi lấy danh sách ảnh', details: err.message });
    }
});


module.exports = router;
