let express = require('express');
let router = express.Router();
let connection = require('../db/mysql');

router.get('/phim/detail/:maphim', async (req, res) => {
    let maphim = req.params.maphim;
    try {
        let [rows] = await connection.query(
            `SELECT 
                P.MAPHIM, 
                P.TENPHIM, 
                P.HINH_ANH_URL,
                CP.DAODIEN,
                CP.DIENVIEN,
                CP.THELOAI,
                CP.NGAYKHOICHIEU,
                CP.THOILUONG,
                CP.NGONNGU,
                CP.RATED,
                CP.MOTA,
                CP.TRAILER_YOUTUBE_ID,
                P.MATT
            FROM PHIM P
            JOIN CHITIETPHIM CP ON P.MAPHIM = CP.MAPHIM
            WHERE P.MAPHIM = ?`,
            [maphim]
        );

        if (rows.length > 0) {
            res.status(200).json({ success: true, film: rows[0] });
        } else {
            res.status(404).json({ success: false, message: 'Không tìm thấy phim.' });
        }

    } catch (error) {
        console.error("API /phim/detail: LỖI KHI LẤY CHI TIẾT PHIM:", error);
        res.status(500).json({ success: false, message: 'Lỗi máy chủ khi lấy chi tiết phim.' });
    }
});

module.exports = router;