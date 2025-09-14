let mysql = require('mysql2');

let connection = mysql.createConnection({
    host: 'localhost',
    user: 'root', // chỉ cần 'root'
    password: '123456', // nếu có password thì điền vào
    database: 'DB_QL_RAP_CHIEU_PHIM',
    port: 3306 // đúng với MariaDB trên XAMPP
});

connection.connect(err => {
    if (err) {
        console.error('Lỗi kết nối:', err.message);
        return;
    } else {
        console.log('Kết nối thành công tới CSDL với ID:', connection.threadId);
    }   
});

let promiseConnection = connection.promise();

module.exports = promiseConnection;
