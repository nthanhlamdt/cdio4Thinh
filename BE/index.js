let express = require('express');
let session = require('express-session');
let path = require('path');
let loginRoute = require('./routes/auth/login');
let registerRoute = require('./routes/auth/register');
let imagesRoute = require('./routes/images');
let uploadRoute = require('./routes/upload');
let fs = require('fs');
let filmRouter = require('./routes/film_preview');
let listFilmRouter = require('./routes/list_film');
let filmDetailsRouter = require('./routes/film_detail');
let userManagementRouter = require('./routes/user_management');
let testDbRouter = require('./routes/test_db');
let branchManagementRouter = require('./routes/branch_management');
let roomManagementRouter = require('./routes/room_management');
let scheduleManagementRouter = require('./routes/schedule_management');
let filmManagementRouter = require('./routes/film_management');
let searchRouter = require('./routes/search');
let cors = require('cors');

let app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: true, // Cho phép tất cả origin
    credentials: true
}));

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

app.use(express.static(path.join(__dirname, '../FE')));

app.use('/api', imagesRoute);
app.use('/api', uploadRoute);

app.use(loginRoute);
app.use(registerRoute);

app.use('/', filmRouter);
app.use('/', listFilmRouter);

app.use('/api', filmDetailsRouter);
app.use('/api', userManagementRouter);
app.use('/api', testDbRouter);
app.use('/api', branchManagementRouter);
app.use('/api', roomManagementRouter);
app.use('/api', scheduleManagementRouter);
app.use('/api', filmManagementRouter);
app.use('/api', searchRouter);

app.get('/', function (req, res) {
    res.sendFile(path.resolve(__dirname, '../FE/html/home.html'));
});

app.get('/session', (req, res) => {
    if (req.session.loggedin) {
        res.json({
            loggedIn: true,
            username: req.session.username,
            vaitro: req.session.vaitro,
            sessionID: req.sessionID
        });
    } else {
        res.json({
            loggedIn: false,
            sessionID: req.sessionID,
            session: req.session
        });
    }
});

app.get('/home', function (req, res) {
    if (req.session.loggedin) {
        res.sendFile(path.resolve(__dirname, '../FE/html/home.html'));
    } else {
        res.redirect('/');
    }
});

app.get('/returnLogin', function (req, res) {
    res.sendFile(path.resolve(__dirname, '../FE/html/login.html'));
});

app.get('/user-session', (req, res) => {
    if (req.session.loggedin) {
        res.json({
            loggedIn: true,
            username: req.session.username,
            vaitro: req.session.vaitro
        });
    } else {
        res.json({
            loggedIn: false
        });
    }
});

app.get('/logout', function (req, res) {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send("Lỗi khi đăng xuất");
        }
        res.clearCookie("connect.sid");
        res.redirect('/home');
    });
});

let uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

app.listen(3000, () => {
    console.log('Server đang chạy tại http://localhost:3000');
});
