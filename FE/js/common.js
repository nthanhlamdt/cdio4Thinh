// ========== HEADER USER UI USING localStorage ==========
document.addEventListener("DOMContentLoaded", function () {
    let userInfo = document.getElementById("user-info");
    let userIconLink = document.querySelector(".user-icon-link");
    let user = null;
    try {
        user = JSON.parse(localStorage.getItem('user'));
    } catch (_) { user = null; }

    if (user) {
        const displayName = user.HOTEN || user.TENDANGNHAP || "User";
        if (userInfo) {
            userInfo.innerHTML = `
                <span>Hi, <span id="username">${displayName}</span></span>
            `;
        }
        if (userIconLink) {
            // Biến icon thành dropdown toggle
            userIconLink.setAttribute("href", "#");
            userIconLink.setAttribute("id", "userMenuIcon");
            userIconLink.setAttribute("data-bs-toggle", "dropdown");
            userIconLink.setAttribute("aria-expanded", "false");
            // Đảm bảo parent là dropdown để đặt menu đúng vị trí
            const parent = userIconLink.parentElement;
            if (parent && !parent.classList.contains('dropdown')) {
                parent.classList.add('dropdown');
            }
            // Thêm menu ngay sau icon
            const menu = document.createElement('ul');
            menu.className = 'dropdown-menu dropdown-menu-end';
            menu.setAttribute('aria-labelledby', 'userMenuIcon');
            menu.innerHTML = `
                <li><a class="dropdown-item" href="#" id="profile-link">Hồ sơ cá nhân</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item text-danger" href="#" id="logout-btn">Đăng xuất</a></li>
            `;
            parent.appendChild(menu);
        }
        document.getElementById("profile-link")?.addEventListener("click", function (e) {
            e.preventDefault();
            window.location.href = "/FE/html/info_members.html";
        });
        document.getElementById("logout-btn")?.addEventListener("click", function (e) {
            e.preventDefault();
            try { localStorage.removeItem('user'); } catch (_) {}
            window.location.href = "/FE/html/login.html";
        });
    } else {
        if (userInfo) {
            userInfo.innerHTML = `
                <a href="/FE/html/login.html" style="color: black; text-decoration: none;">Đăng Nhập</a>
                <span class="mx-2">/</span>
                <a href="/FE/html/register.html" style="color: black; text-decoration: none;">Đăng Ký</a>
            `;
        }
        if (userIconLink) {
            userIconLink.setAttribute("href", "../html/login.html");
        }
    }
});