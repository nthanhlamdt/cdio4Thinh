let express = require('express');
let router = express.Router();
let connection = require('../db/mysql');

router.get('/film_preview/status/:matt', async function(req, res) {
    let matt = req.params.matt;
    let limit = 8; 

    try {
        let [phimList] = await connection.query(
            'SELECT MAPHIM, TENPHIM, HINH_ANH_URL FROM PHIM WHERE MATT = ? ORDER BY CAST(SUBSTRING(MAPHIM, 2) AS UNSIGNED) LIMIT ? ',
            [matt, limit]
        );

        res.status(200).json({ success: true, films: phimList });

    } catch (error) {
        console.error("API /phim/status: LỖI KHI LẤY DANH SÁCH PHIM:", error);
        res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách phim.' });
    }
});

module.exports = router;