document.addEventListener("DOMContentLoaded", () => {
    let registerForm = document.querySelector(".register-form");

    if (registerForm) {
        registerForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            let username = document.getElementById('usernameRegister').value;
            let email = document.getElementById('emailRegister').value;
            let password = document.getElementById('passwordRegister').value;

            console.log("REGISTER: 1. Đã nhận sự kiện submit từ form đăng ký.");
            console.log(`REGISTER: 2. Dữ liệu chuẩn bị gửi - Username: ${username}, Email: ${email}, Password: ${password}`);

            if (username && email && password) {
                try {
                    let response = await fetch('http://localhost:3000/register', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            usernameRegister: username,
                            emailRegister: email,
                            passwordRegister: password
                        }),
                        credentials: 'include'
                    });

                    let data = await response.json();

                    if (response.ok) {
                        if (data.success) {
                            alert(data.message || 'Đăng ký thành công!');
                            window.location.href = '../html/home.html';
                        } else {
                            let modal = new bootstrap.Modal(document.getElementById("registerFailModal"));
                            document.querySelector('#registerFailModal .modal-body').textContent = data.message || 'Đăng ký thất bại. Vui lòng thử lại.';
                            modal.show();
                        }
                    } else {
                        let modal = new bootstrap.Modal(document.getElementById("registerFailModal"));
                        document.querySelector('#registerFailModal .modal-body').textContent = data.message || `Lỗi từ server (${response.status}): Đăng ký thất bại.`;
                        modal.show();
                    }
                } catch (error) {
                    console.error('Lỗi khi gửi yêu cầu đăng ký:', error);
                    let modal = new bootstrap.Modal(document.getElementById("registerFailModal"));
                    document.querySelector('#registerFailModal .modal-body').textContent = 'Lỗi kết nối đến server hoặc dữ liệu không hợp lệ. Vui lòng thử lại.';
                    modal.show();
                }
            } else {
                let modal = new bootstrap.Modal(document.getElementById("registerFailModal"));
                document.querySelector('#registerFailModal .modal-body').textContent = 'Vui lòng nhập đầy đủ thông tin đăng ký.';
                modal.show();
            }
        });
    }
});