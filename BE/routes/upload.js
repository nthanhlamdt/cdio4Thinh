let express = require('express');
let multer = require('multer');
let path = require('path');
let cloudinary = require('../config/cloudinary');
let fs = require('fs');
let db = require('../db/mysql');

let router = express.Router();

let storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
let upload = multer({ storage });

router.post('/upload', upload.single('image'), async (req, res) => { 
    try {
        let result = await cloudinary.uploader.upload(req.file.path);
        fs.unlinkSync(req.file.path);

        await db.query('INSERT INTO ANH_SLIDER (DUONG_DAN, PUBLIC_ID) VALUES (?, ?)', [
            result.secure_url,
            result.public_id
        ]);
        
        res.json({
            success: true,
            url: result.secure_url,
            public_id: result.public_id
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
});


router.delete('/images/:public_id', async (req, res) => {
    let { public_id } = req.params;

    try {
        await cloudinary.uploader.destroy(public_id);
        await db.query('DELETE FROM ANH_SLIDER WHERE PUBLIC_ID = ?', [public_id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/images/:public_id', upload.single('image'), async (req, res) => {
    let { public_id } = req.params;

    try {
        await cloudinary.uploader.destroy(public_id);

        let result = await cloudinary.uploader.upload(req.file.path);
        fs.unlinkSync(req.file.path);

        await db.query(
            'UPDATE ANH_SLIDER SET DUONG_DAN = ?, PUBLIC_ID = ? WHERE PUBLIC_ID = ?',
            [result.secure_url, result.public_id, public_id]
        );

        res.json({
            success: true,
            url: result.secure_url,
            public_id: result.public_id
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
