// ========== LOGIN FORM ==========
document.addEventListener("DOMContentLoaded", () => {
    // Nếu đã đăng nhập theo localStorage, chặn vào trang login
    let loginForm = document.querySelector(".login-form");
    if (!loginForm) return; // để tránh lỗi khi không ở trang login

    loginForm.addEventListener("submit", function (e) {
        e.preventDefault();

        let username = document.getElementById("usernameLogin").value.trim();
        let password = document.getElementById("passwordLogin").value.trim();

        if (!username || !password) {
            alert("Vui lòng nhập tài khoản và mật khẩu!");
            return;
        }

        fetch("http://localhost:3000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ usernameLogin: username, passwordLogin: password }),
            credentials: "include" // ✅ Quan trọng: gửi & nhận cookie
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // ✅ Login thành công → lưu user và điều hướng theo vai trò
                    localStorage.setItem('user', JSON.stringify(data.data));
                    const roleName = (data.data && data.data.TENVT) ? String(data.data.TENVT).toUpperCase() : '';
                    if (roleName === 'KHACHHANG') {
                        window.location.href = "../html/home.html";
                    } else {
                        window.location.href = "../html/admin.html";
                    }
                } else {
                    let modal = new bootstrap.Modal(document.getElementById("loginFailModal"));
                    modal.show();
                }
            })
            .catch(error => cnsole.error("Lỗi:", error));
    });

    const savedUserRaw = localStorage.getItem('user');
    if (savedUserRaw) {
        const savedUser = JSON.parse(savedUserRaw);
        const roleName = savedUser.TENVT;

        if (roleName.toUpperCase() === 'KHACHHANG') {
            window.location.href = "../html/home.html";
            return;
        }
        // Nếu không phải khách hàng, mặc định coi là admin/nhân viên
        window.location.href = "../html/admin.html";
        return;
    }
});