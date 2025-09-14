document.addEventListener('DOMContentLoaded', () => {
    let infoAside = document.querySelector('.info-aside');

    let tabLinks = {
        dashboard: document.querySelector('.link-dashboard'),
        in4: document.querySelector('.link-in4'),
        film: document.querySelector('.link-film'),
        showtimes: document.querySelector('.link-showtimes'),
        admin: document.querySelector('.link-admin'),
        users: document.querySelector('.link-users'),
        pay: document.querySelector('.link-pay')
    };

    // API Base URL
    const API_BASE = 'http://localhost:3000/api';

    function activateTab(tab) {
        infoAside.classList.remove('show-dashboard', 'show-film', 'show-showtimes', 'show-admin', 'show-users', 'show-in4', 'show-pay');
        infoAside.classList.add(`show-${tab}`);

        Object.keys(tabLinks).forEach(key => {
            tabLinks[key].classList.toggle('active', key === tab);
        });
    }

    tabLinks.dashboard.addEventListener('click', (e) => {
        e.preventDefault();
        activateTab('dashboard');
    });

    tabLinks.in4.addEventListener('click', (e) => {
        e.preventDefault();
        activateTab('in4');
    });

    tabLinks.film.addEventListener('click', (e) => {
        e.preventDefault();
        activateTab('film');
    });

    tabLinks.showtimes.addEventListener('click', (e) => {
        e.preventDefault();
        activateTab('showtimes');
    });

    tabLinks.admin.addEventListener('click', (e) => {
        e.preventDefault();
        activateTab('admin');
    });

    tabLinks.users.addEventListener('click', (e) => {
        e.preventDefault();
        activateTab('users');
        loadUsers();
    });

    tabLinks.pay.addEventListener('click', (e) => {
        e.preventDefault();
        activateTab('pay');
    });

    activateTab('dashboard');

    let modal = document.getElementById('addFilmModal');
    let btn = document.querySelector('.btn.add-btn');

    modal.addEventListener('show.bs.modal', function () {
        btn.classList.add('modal-open-btn');
    });

    modal.addEventListener('hidden.bs.modal', function () {
        btn.classList.remove('modal-open-btn');
    });

    document.querySelectorAll('.dropdown-menu .dropdown-item').forEach(function (item) {
        item.addEventListener('click', function (e) {
            let inputGroup = e.target.closest('.input-group');
            let input = inputGroup.querySelector('input.form-control');
            let button = inputGroup.querySelector('.dropdown-toggle');

            input.value = e.target.textContent.trim();

            let dropdown = bootstrap.Dropdown.getInstance(button) || new bootstrap.Dropdown(button);
            dropdown.hide();
            button.blur();
        });
    });

    // ==================== USER MANAGEMENT FUNCTIONS ====================

    // Load danh sách người dùng
    async function loadUsers() {
        try {
            console.log('Attempting to load users from:', `${API_BASE}/users`);
            
            const response = await fetch(`${API_BASE}/users`, {
                method: 'GET',
                credentials: 'include'
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`HTTP ${response.status}: ${errorData.error || 'Không thể tải danh sách người dùng'}`);
            }

            const result = await response.json();
            console.log('API Response:', result);
            
            if (result.success) {
                displayUsers(result.data);
            } else {
                showAlert('Lỗi: ' + result.error, 'error');
            }
        } catch (error) {
            console.error('Error loading users:', error);
            showAlert('Lỗi khi tải danh sách người dùng: ' + error.message, 'error');
        }
    }

    // Hiển thị danh sách người dùng trong bảng
    function displayUsers(users) {
        const tbody = document.getElementById('usersTableBody');
        tbody.innerHTML = '';

        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><b>${user.TENDANGNHAP}</b></td>
                <td>${user.HOTEN || 'Chưa cập nhật'}</td>
                <td>${user.EMAIL || 'Chưa cập nhật'}</td>
                <td>${user.SDT || 'Chưa cập nhật'}</td>
                <td><span class="badge ${user.MAVT === 'MAVT1' ? 'bg-danger' : 'bg-primary'}">${user.TENVT}</span></td>
                <td>
                    <button class="btn btn-sm btn-warning me-2" onclick="editUser('${user.TENDANGNHAP}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteUser('${user.TENDANGNHAP}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    // Thêm người dùng mới
    document.getElementById('saveUserBtn').addEventListener('click', async function() {
        const form = document.getElementById('addUserForm');
        const formData = new FormData(form);

        const userData = {
            TENDANGNHAP: formData.get('username'),
            HOTEN: formData.get('fullname'),
            EMAIL: formData.get('email'),
            SDT: formData.get('phone'),
            MATKHAU: formData.get('password'),
            MAVT: formData.get('role')
        };

        try {
            const response = await fetch(`${API_BASE}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData),
                credentials: 'include'
            });

            const result = await response.json();
            
            if (result.success) {
                showAlert('Thêm người dùng thành công!', 'success');
                bootstrap.Modal.getInstance(document.getElementById('addUserModal')).hide();
                form.reset();
                loadUsers();
            } else {
                showAlert('Lỗi: ' + result.error, 'error');
            }
        } catch (error) {
            console.error('Error adding user:', error);
            showAlert('Lỗi khi thêm người dùng: ' + error.message, 'error');
        }
    });

    // Sửa thông tin người dùng
    window.editUser = async function(username) {
        try {
            const response = await fetch(`${API_BASE}/users/${username}`, {
                method: 'GET',
                credentials: 'include'
            });

            const result = await response.json();
            
            if (result.success) {
                const user = result.data;
                document.getElementById('editUsername').value = user.TENDANGNHAP;
                document.getElementById('editFullname').value = user.HOTEN || '';
                document.getElementById('editEmail').value = user.EMAIL || '';
                document.getElementById('editPhone').value = user.SDT || '';
                document.getElementById('editRole').value = user.MAVT;
                document.getElementById('editPassword').value = '';

                new bootstrap.Modal(document.getElementById('editUserModal')).show();
            } else {
                showAlert('Lỗi: ' + result.error, 'error');
            }
        } catch (error) {
            console.error('Error loading user for edit:', error);
            showAlert('Lỗi khi tải thông tin người dùng: ' + error.message, 'error');
        }
    };

    // Cập nhật thông tin người dùng
    document.getElementById('updateUserBtn').addEventListener('click', async function() {
        const form = document.getElementById('editUserForm');
        const formData = new FormData(form);

        const userData = {
            HOTEN: formData.get('fullname'),
            EMAIL: formData.get('email'),
            SDT: formData.get('phone'),
            MATKHAU: formData.get('password'),
            MAVT: formData.get('role')
        };

        // Nếu không có mật khẩu mới, không gửi field này
        if (!userData.MATKHAU || userData.MATKHAU.trim() === '') {
            delete userData.MATKHAU;
        }

        const username = document.getElementById('editUsername').value;

        try {
            const response = await fetch(`${API_BASE}/users/${username}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData),
                credentials: 'include'
            });

            const result = await response.json();
            
            if (result.success) {
                showAlert('Cập nhật thông tin người dùng thành công!', 'success');
                bootstrap.Modal.getInstance(document.getElementById('editUserModal')).hide();
                loadUsers();
            } else {
                showAlert('Lỗi: ' + result.error, 'error');
            }
        } catch (error) {
            console.error('Error updating user:', error);
            showAlert('Lỗi khi cập nhật người dùng: ' + error.message, 'error');
        }
    });

    // Xóa người dùng
    window.deleteUser = function(username) {
        document.getElementById('deleteUsername').value = username;
        new bootstrap.Modal(document.getElementById('deleteUsersModal')).show();
    };

    // Xác nhận xóa người dùng
    document.getElementById('confirmDeleteUserBtn').addEventListener('click', async function() {
        const username = document.getElementById('deleteUsername').value;

        try {
            const response = await fetch(`${API_BASE}/users/${username}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            const result = await response.json();
            
            if (result.success) {
                showAlert('Xóa người dùng thành công!', 'success');
                bootstrap.Modal.getInstance(document.getElementById('deleteUsersModal')).hide();
                document.getElementById('deleteUsername').value = '';
                loadUsers();
            } else {
                showAlert('Lỗi: ' + result.error, 'error');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            showAlert('Lỗi khi xóa người dùng: ' + error.message, 'error');
        }
    });

    // Hiển thị thông báo
    function showAlert(message, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show`;
        alertDiv.style.position = 'fixed';
        alertDiv.style.top = '20px';
        alertDiv.style.right = '20px';
        alertDiv.style.zIndex = '9999';
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
});