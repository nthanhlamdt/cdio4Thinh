document.addEventListener('DOMContentLoaded', () => {
    let infoAside = document.querySelector('.info-aside');

    let tabLinks = {
        user: document.querySelector('.link-user-info'),
        history: document.querySelector('.link-user-history'),
        password: document.querySelector('.link-user-password')
    };

    // API Base URL
    const API_BASE = 'http://localhost:3000/api';

    function activateTab(tab) {
        infoAside.classList.remove('show-user', 'show-history', 'show-password');
        infoAside.classList.add(`show-${tab}`);

        Object.keys(tabLinks).forEach(key => {
            tabLinks[key].classList.toggle('active', key === tab);
        });
    }

    tabLinks.user.addEventListener('click', (e) => {
        e.preventDefault();
        activateTab('user');
        loadUserInfo();
    });

    tabLinks.history.addEventListener('click', (e) => {
        e.preventDefault();
        activateTab('history');
        loadBookingHistory();
    });

    tabLinks.password.addEventListener('click', (e) => {
        e.preventDefault();
        activateTab('password');
    });

    // Load thông tin người dùng hiện tại từ localStorage
    function loadUserInfo() {
        try {
            console.log('🔍 Loading user info from localStorage...');

            // Lấy thông tin user từ localStorage
            const userInfo = localStorage.getItem('user');

            if (userInfo) {
                const user = JSON.parse(userInfo);
                console.log('✅ User info from localStorage:', user);

                // Kiểm tra cấu trúc dữ liệu và lấy thông tin đúng
                const username = user.TENDANGNHAP || user.username || '';
                const fullname = user.HOTEN || user.fullname || '';
                const email = user.EMAIL || user.email || '';
                const phone = user.SDT || user.phone || user.phoneNumber || '';

                console.log('📋 Parsed user data:', {
                    username,
                    fullname,
                    email,
                    phone
                });

                // Điền thông tin vào form
                document.getElementById('username_user').value = username;
                document.getElementById('fullname').value = fullname;
                document.getElementById('email').value = email;
                document.getElementById('phoneNumber').value = phone;
                // Không hiển thị mật khẩu thực tế
                document.getElementById('password').value = '••••••••';
            } else {
                console.log('❌ No user info in localStorage');
                showAlert('Vui lòng đăng nhập để xem thông tin', 'error');
                // Redirect to login page
                window.location.href = '../html/login.html';
            }
        } catch (error) {
            console.error('❌ Error loading user info from localStorage:', error);
            showAlert('Lỗi khi tải thông tin người dùng: ' + error.message, 'error');
        }
    }

    // Cập nhật thông tin người dùng
    function updateUserInfo() {
        try {
            const formData = {
                HOTEN: document.getElementById('fullname').value,
                EMAIL: document.getElementById('email').value,
                SDT: document.getElementById('phoneNumber').value
            };

            console.log('📝 Updating user info:', formData);

            // Lấy thông tin user hiện tại từ localStorage
            const userInfo = localStorage.getItem('user');
            if (!userInfo) {
                showAlert('Không tìm thấy thông tin người dùng', 'error');
                return;
            }

            const user = JSON.parse(userInfo);

            // Cập nhật thông tin mới (giữ nguyên cấu trúc dữ liệu gốc)
            user.HOTEN = formData.HOTEN;
            user.EMAIL = formData.EMAIL;
            user.SDT = formData.SDT;

            // Lưu lại vào localStorage
            localStorage.setItem('user', JSON.stringify(user));

            console.log('✅ User info updated in localStorage:', user);
            showAlert('Cập nhật thông tin thành công!', 'success');

            // Reload user info để hiển thị
            loadUserInfo();
        } catch (error) {
            console.error('❌ Error updating user info:', error);
            showAlert('Lỗi khi cập nhật thông tin: ' + error.message, 'error');
        }
    }

    // Đổi mật khẩu
    function changePassword() {
        try {
            const oldPassword = document.getElementById('oldPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmNewPassword').value;

            if (newPassword !== confirmPassword) {
                showAlert('Mật khẩu mới và xác nhận mật khẩu không khớp!', 'error');
                return;
            }

            if (newPassword.length < 6) {
                showAlert('Mật khẩu mới phải có ít nhất 6 ký tự!', 'error');
                return;
            }

            // Lấy thông tin user hiện tại từ localStorage
            const userInfo = localStorage.getItem('user');
            if (!userInfo) {
                showAlert('Không tìm thấy thông tin người dùng', 'error');
                return;
            }

            const user = JSON.parse(userInfo);

            // Kiểm tra mật khẩu cũ (giả sử mật khẩu được lưu trong localStorage)
            if (user.MATKHAU && user.MATKHAU !== oldPassword) {
                showAlert('Mật khẩu cũ không đúng!', 'error');
                return;
            }

            // Cập nhật mật khẩu mới
            user.MATKHAU = newPassword;

            // Lưu lại vào localStorage
            localStorage.setItem('user', JSON.stringify(user));

            console.log('🔐 Password changed successfully');
            showAlert('Đổi mật khẩu thành công!', 'success');

            // Clear form
            document.getElementById('oldPassword').value = '';
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmNewPassword').value = '';
        } catch (error) {
            console.error('❌ Error changing password:', error);
            showAlert('Lỗi khi đổi mật khẩu: ' + error.message, 'error');
        }
    }

    // Load lịch sử đặt vé
    async function loadBookingHistory() {
        try {
            console.log('🎫 Loading booking history...');
            const response = await fetch(`${API_BASE}/bookings/history`, {
                credentials: 'include'
            });
            const result = await response.json();

            if (result.success) {
                displayBookingHistory(result.data);
            } else {
                showAlert('Lỗi khi tải lịch sử đặt vé: ' + result.error, 'error');
            }
        } catch (error) {
            console.error('❌ Error loading booking history:', error);
            showAlert('Lỗi khi tải lịch sử đặt vé: ' + error.message, 'error');
        }
    }

    // Hiển thị lịch sử đặt vé
    function displayBookingHistory(bookings) {
        const tbody = document.querySelector('.info.history tbody');
        if (tbody) {
            tbody.innerHTML = '';

            if (bookings && bookings.length > 0) {
                bookings.forEach(booking => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td><b>${booking.MALS || 'N/A'}</b></td>
                        <td>${booking.MAVE || 'N/A'}</td>
                        <td>${booking.TENPHIM || 'N/A'}</td>
                        <td>${booking.MAGHE || 'N/A'}</td>
                        <td>${booking.TENPHONG || 'N/A'}</td>
                        <td>${booking.TENRAP || 'N/A'}</td>
                        <td>${booking.TENTP || 'N/A'}</td>
                        <td>${booking.THOIGIANDAT || 'N/A'}</td>
                        <td>${booking.PHUONGTHUCTHANHTOAN || 'N/A'}</td>
                        <td><span class="badge ${booking.TINHTRANGTHANHTOAN === 'Đã thanh toán' ? 'bg-success' : 'bg-warning'}">${booking.TINHTRANGTHANHTOAN || 'N/A'}</span></td>
                    `;
                    tbody.appendChild(row);
                });
            } else {
                tbody.innerHTML = '<tr><td colspan="10" class="text-center text-muted">Không có lịch sử đặt vé nào</td></tr>';
            }
        }
    }

    // Hiển thị thông báo
    function showAlert(message, type) {
        // Tạo alert element
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type === 'error' ? 'danger' : 'success'} alert-dismissible fade show position-fixed`;
        alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        document.body.appendChild(alertDiv);

        // Tự động ẩn sau 5 giây
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.parentNode.removeChild(alertDiv);
            }
        }, 5000);
    }

    // Event listeners
    document.querySelector('.info.user form').addEventListener('submit', (e) => {
        e.preventDefault();
        updateUserInfo();
    });

    document.querySelector('.info.password form').addEventListener('submit', (e) => {
        e.preventDefault();
        changePassword();
    });

    // Debug function để kiểm tra cấu trúc dữ liệu
    function debugUserData() {
        const userInfo = localStorage.getItem('user');
        if (userInfo) {
            const user = JSON.parse(userInfo);
            console.log('🔍 Debug - Full user data structure:', user);
            console.log('🔍 Debug - Available keys:', Object.keys(user));
            console.log('🔍 Debug - TENDANGNHAP:', user.TENDANGNHAP);
            console.log('🔍 Debug - username:', user.username);
        } else {
            console.log('❌ Debug - No user data in localStorage');
        }
    }

    // Load user info khi trang load
    activateTab('user');
    debugUserData(); // Debug trước khi load
    loadUserInfo();
});