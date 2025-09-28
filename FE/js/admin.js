document.addEventListener('DOMContentLoaded', () => {
    let infoAside = document.querySelector('.info-aside');

    let tabLinks = {
        dashboard: document.querySelector('.link-dashboard'),
        in4: document.querySelector('.link-in4'),
        film: document.querySelector('.link-film'),
        showtimes: document.querySelector('.link-showtimes'),
        branch: document.querySelector('.link-branch'),
        room: document.querySelector('.link-room'),
        admin: document.querySelector('.link-admin'),
        users: document.querySelector('.link-users'),
        pay: document.querySelector('.link-pay')
    };

    // API Base URL
    const API_BASE = 'http://localhost:3000/api';

    function activateTab(tab) {
        infoAside.classList.remove('show-dashboard', 'show-film', 'show-showtimes', 'show-branch', 'show-room', 'show-admin', 'show-users', 'show-in4', 'show-pay');
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
        loadFilms();
    });

    tabLinks.showtimes.addEventListener('click', (e) => {
        e.preventDefault();
        activateTab('showtimes');
        loadSchedules();
    });

    tabLinks.branch.addEventListener('click', (e) => {
        e.preventDefault();
        activateTab('branch');
        loadBranches();
    });

    tabLinks.room.addEventListener('click', (e) => {
        e.preventDefault();
        activateTab('room');
        loadRooms();
    });

    tabLinks.admin.addEventListener('click', (e) => {
        e.preventDefault();
        activateTab('admin');
        loadAdmins();
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

    // Load danh sách admin
    async function loadAdmins() {
        try {
            const response = await fetch(`${API_BASE}/admins`, {
                method: 'GET',
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`HTTP ${response.status}: ${errorData.error || 'Không thể tải danh sách admin'}`);
            }

            const result = await response.json();

            if (result.success && result.data) {
                displayAdmins(result.data);
            } else {
                showAlert('Lỗi: ' + (result.error || 'Không thể tải danh sách admin'), 'error');
            }
        } catch (error) {
            showAlert('Lỗi khi tải danh sách admin: ' + error.message, 'error');
        }
    }

    // Hiển thị danh sách admin
    function displayAdmins(admins) {
        const tbody = document.getElementById('adminsTableBody');
        if (tbody) {
            tbody.innerHTML = '';

            if (admins && admins.length > 0) {
                admins.forEach((admin, index) => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td><b>${admin.TENDANGNHAP}</b></td>
                        <td>${admin.TENDANGNHAP}</td>
                        <td>${admin.EMAIL || 'Chưa cập nhật'}</td>
                        <td>${admin.HOTEN || 'Chưa cập nhật'}</td>
                        <td>${admin.SDT || 'Chưa cập nhật'}</td>
                        <td>
                            <button class="btn btn-sm btn-warning me-2" onclick="editAdmin('${admin.TENDANGNHAP}')" title="Sửa admin">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="deleteAdmin('${admin.TENDANGNHAP}')" title="Xóa admin">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    `;
                    tbody.appendChild(row);
                });
            } else {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Không có admin nào</td></tr>';
            }
        } else {
        }
    }

    // Load danh sách người dùng
    async function loadUsers() {
        try {

            const response = await fetch(`${API_BASE}/users`, {
                method: 'GET',
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`HTTP ${response.status}: ${errorData.error || 'Không thể tải danh sách người dùng'}`);
            }

            const result = await response.json();
            if (result.success) {
                displayUsers(result.data);
            } else {
                showAlert('Lỗi: ' + result.error, 'error');
            }
        } catch (error) {
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
    document.getElementById('saveUserBtn').addEventListener('click', async function () {
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
            showAlert('Lỗi khi thêm người dùng: ' + error.message, 'error');
        }
    });

    // Sửa thông tin người dùng
    window.editUser = async function (username) {
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
            showAlert('Lỗi khi tải thông tin người dùng: ' + error.message, 'error');
        }
    };

    // Cập nhật thông tin người dùng
    document.getElementById('updateUserBtn').addEventListener('click', async function () {
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
            showAlert('Lỗi khi cập nhật người dùng: ' + error.message, 'error');
        }
    });

    // Xóa người dùng
    window.deleteUser = function (username) {
        document.getElementById('deleteUsername').value = username;
        new bootstrap.Modal(document.getElementById('deleteUsersModal')).show();
    };

    // Xác nhận xóa người dùng
    document.getElementById('confirmDeleteUserBtn').addEventListener('click', async function () {
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

    // ========== QUẢN LÝ RẠP CHIẾU ==========
    async function loadBranches() {
        try {
            const response = await fetch(`${API_BASE}/branches`);
            const result = await response.json();

            if (result.success) {
                displayBranches(result.data);
            } else {
                showAlert('Lỗi khi tải danh sách rạp: ' + result.error, 'error');
            }
        } catch (error) {
            showAlert('Lỗi khi tải danh sách rạp: ' + error.message, 'error');
        }
    }

    function displayBranches(branches) {
        const tbody = document.getElementById('branchTableBody');
        tbody.innerHTML = '';

        branches.forEach(branch => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><b>${branch.MARAP}</b></td>
                <td>${branch.TENRAP}</td>
                <td>${branch.DIACHI}</td>
                <td>${branch.TENTP || 'N/A'}</td>
                <td>
                    <button class="btn btn-sm btn-primary me-1" onclick="editBranch('${branch.MARAP}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteBranch('${branch.MARAP}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    // Thêm rạp mới
    document.getElementById('saveBranchBtn').addEventListener('click', async () => {
        const form = document.getElementById('addBranchForm');
        const formData = new FormData(form);

        const branchData = {
            TENRAP: formData.get('tenrap'),
            DIACHI: formData.get('diachi'),
            MATP: formData.get('matp')
        };

        try {
            const response = await fetch(`${API_BASE}/branches`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(branchData)
            });

            const result = await response.json();

            if (result.success) {
                showAlert('Thêm rạp chiếu thành công!', 'success');
                form.reset();
                bootstrap.Modal.getInstance(document.getElementById('addBranchModal')).hide();
                loadBranches();
            } else {
                showAlert('Lỗi: ' + result.error, 'error');
            }
        } catch (error) {
            showAlert('Lỗi khi thêm rạp chiếu: ' + error.message, 'error');
        }
    });

    // ========== QUẢN LÝ PHÒNG CHIẾU ==========
    async function loadRooms() {
        try {
            const response = await fetch(`${API_BASE}/rooms`);
            const result = await response.json();

            if (result.success) {
                displayRooms(result.data);
            } else {
                showAlert('Lỗi khi tải danh sách phòng: ' + result.error, 'error');
            }
        } catch (error) {
            showAlert('Lỗi khi tải danh sách phòng: ' + error.message, 'error');
        }
    }

    function displayRooms(rooms) {
        const tbody = document.getElementById('roomTableBody');
        tbody.innerHTML = '';

        rooms.forEach(room => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><b>${room.MAPHONG}</b></td>
                <td>${room.TENPHONG}</td>
                <td>${room.TENRAP}</td>
                <td>${room.SO_GHE || 'Chưa có'}</td>
                <td>
                    <button class="btn btn-sm btn-info me-2" onclick="manageSeats('${room.MAPHONG}', '${room.TENPHONG}', '${room.TENRAP}')">
                        <i class="fas fa-chair"></i> Ghế
                    </button>
                    <button class="btn btn-sm btn-warning me-2" onclick="editRoom('${room.MAPHONG}')">
                        <i class="fas fa-edit"></i> Sửa
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteRoom('${room.MAPHONG}')">
                        <i class="fas fa-trash"></i> Xóa
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    // ========== QUẢN LÝ GHẾ THEO PHÒNG ==========
    let currentSeatContext = { maphong: null, tenphong: '', tenrap: '', madayghe: null };

    window.manageSeats = async function (maphong, tenphong, tenrap) {
        currentSeatContext = { maphong, tenphong, tenrap, madayghe: null };
        document.getElementById('seatsRoomTitle').textContent = `${tenrap} - ${tenphong} (${maphong})`;
        await loadRowsForRoom(maphong);
        new bootstrap.Modal(document.getElementById('manageSeatsModal')).show();
    };

    async function loadRowsForRoom(maphong) {
        try {
            const response = await fetch(`${API_BASE}/rooms/${maphong}/rows`);
            const result = await response.json();
            if (result.success) {
                renderRowsList(result.data);
                // Tự động chọn dãy đầu tiên nếu có
                if (result.data.length > 0) {
                    selectRow(result.data[0].MADAYGHE, result.data[0].TENDAY);
                } else {
                    document.getElementById('currentRowLabel').textContent = '(chưa có dãy)';
                    document.getElementById('seatsGrid').innerHTML = '';
                }
            } else {
                showAlert('Lỗi khi tải dãy ghế: ' + result.error, 'error');
            }
        } catch (error) {
            showAlert('Lỗi khi tải dãy ghế: ' + error.message, 'error');
        }
    }

    function renderRowsList(rows) {
        const rowsList = document.getElementById('rowsList');
        rowsList.innerHTML = '';

        // Header quick actions
        const addRowLi = document.createElement('li');
        addRowLi.className = 'list-group-item d-flex justify-content-between align-items-center';
        addRowLi.innerHTML = `
            <div class="input-group input-group-sm">
                <span class="input-group-text">Thêm dãy</span>
                <input type="text" class="form-control" id="newRowName" placeholder="Ví dụ: A" maxlength="5">
                <button class="btn btn-primary" id="addRowBtn">Thêm</button>
            </div>
        `;
        rowsList.appendChild(addRowLi);

        rows.forEach(row => {
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-center';
            li.innerHTML = `
                <span class="row-select" style="cursor:pointer">
                    <b>${row.TENDAY}</b> <small class="text-muted">(${row.SO_GHE} ghế)</small>
                </span>
                <div>
                    <button class="btn btn-sm btn-outline-danger" data-madayghe="${row.MADAYGHE}"><i class="fas fa-trash"></i></button>
                </div>
            `;

            // Click vào dãy để load ghế
            li.querySelector('.row-select').addEventListener('click', async (e) => {
                e.preventDefault();
                // Highlight dãy đang chọn
                Array.from(rowsList.querySelectorAll('.list-group-item')).forEach(item => item.classList.remove('active'));
                li.classList.add('active');
                await selectRow(row.MADAYGHE, row.TENDAY);
            });
            li.querySelector('button').addEventListener('click', () => deleteRow(row.MADAYGHE));

            rowsList.appendChild(li);
        });

        document.getElementById('addRowBtn').addEventListener('click', async () => {
            const name = document.getElementById('newRowName').value.trim();
            if (!name) return;
            try {
                const response = await fetch(`${API_BASE}/rows`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ TENDAY: name, MAPHONG: currentSeatContext.maphong })
                });
                const result = await response.json();
                if (result.success) {
                    loadRowsForRoom(currentSeatContext.maphong);
                    document.getElementById('newRowName').value = '';
                    showAlert('Thêm dãy ghế thành công', 'success');
                } else {
                    showAlert('Lỗi: ' + result.error, 'error');
                }
            } catch (error) {
                showAlert('Lỗi khi thêm dãy ghế: ' + error.message, 'error');
            }
        });
    }

    async function selectRow(madayghe, tenday) {
        currentSeatContext.madayghe = madayghe;
        document.getElementById('currentRowLabel').textContent = tenday;
        await loadSeatsForRow(madayghe);
    }

    async function loadSeatsForRow(madayghe) {
        try {
            const response = await fetch(`${API_BASE}/rows/${madayghe}/seats`);
            const result = await response.json();
            if (result.success) {
                renderSeatsGrid(result.data);
            } else {
                showAlert('Lỗi khi tải ghế: ' + result.error, 'error');
            }
        } catch (error) {
            showAlert('Lỗi khi tải ghế: ' + error.message, 'error');
        }
    }

    function renderSeatsGrid(seats) {
        const grid = document.getElementById('seatsGrid');
        grid.innerHTML = '';

        // Quick add seat controls
        const controls = document.createElement('div');
        controls.className = 'w-100 d-flex align-items-center mb-2 gap-2';
        controls.innerHTML = `
            <div class="input-group input-group-sm" style="max-width:260px;">
                <span class="input-group-text">Thêm ghế số</span>
                <input type="number" min="1" class="form-control" id="newSeatNumber" placeholder="vd: 11">
                <button class="btn btn-primary" id="addSeatBtn">Thêm</button>
            </div>
        `;
        grid.appendChild(controls);

        // Render seats sorted by SOGHE
        seats.sort((a, b) => Number(a.SOGHE) - Number(b.SOGHE));
        seats.forEach(seat => {
            const btn = document.createElement('button');
            btn.className = 'btn btn-outline-secondary';
            btn.textContent = seat.SOGHE;
            btn.title = `MAGHE: ${seat.MAGHE}`;
            btn.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                deleteSeat(seat.MAGHE);
            });
            grid.appendChild(btn);
        });

        document.getElementById('addSeatBtn').addEventListener('click', async () => {
            const num = Number(document.getElementById('newSeatNumber').value);
            if (!currentSeatContext.madayghe || !num) return;
            try {
                const response = await fetch(`${API_BASE}/seats`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ MADAYGHE: currentSeatContext.madayghe, SOGHE: num })
                });
                const result = await response.json();
                if (result.success) {
                    loadSeatsForRow(currentSeatContext.madayghe);
                    document.getElementById('newSeatNumber').value = '';
                    showAlert('Thêm ghế thành công', 'success');
                } else {
                    showAlert('Lỗi: ' + result.error, 'error');
                }
            } catch (error) {
                showAlert('Lỗi khi thêm ghế: ' + error.message, 'error');
            }
        });
    }

    async function deleteRow(madayghe) {
        if (!confirm('Xóa dãy ghế này? Hành động không thể hoàn tác.')) return;
        try {
            const response = await fetch(`${API_BASE}/rows/${madayghe}`, { method: 'DELETE' });
            const result = await response.json();
            if (result.success) {
                showAlert('Đã xóa dãy ghế', 'success');
                loadRowsForRoom(currentSeatContext.maphong);
            } else {
                showAlert('Lỗi: ' + result.error, 'error');
            }
        } catch (error) {
            showAlert('Lỗi khi xóa dãy ghế: ' + error.message, 'error');
        }
    }

    async function deleteSeat(maghe) {
        if (!confirm('Xóa ghế này?')) return;
        try {
            const response = await fetch(`${API_BASE}/seats/${maghe}`, { method: 'DELETE' });
            const result = await response.json();
            if (result.success) {
                showAlert('Đã xóa ghế', 'success');
                if (currentSeatContext.madayghe) loadSeatsForRow(currentSeatContext.madayghe);
            } else {
                showAlert('Lỗi: ' + result.error, 'error');
            }
        } catch (error) {
            showAlert('Lỗi khi xóa ghế: ' + error.message, 'error');
        }
    }

    // Thêm phòng mới
    document.getElementById('saveRoomBtn').addEventListener('click', async () => {
        const form = document.getElementById('addRoomForm');
        const formData = new FormData(form);

        try {
            const response = await fetch(`${API_BASE}/rooms`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    TENPHONG: formData.get('tenphong'),
                    MARAP: formData.get('rap')
                })
            });

            const result = await response.json();

            if (result.success) {
                showAlert('Thêm phòng thành công!', 'success');
                form.reset();
                bootstrap.Modal.getInstance(document.getElementById('addRoomModal')).hide();
                loadRooms();
            } else {
                showAlert('Lỗi: ' + result.error, 'error');
            }
        } catch (error) {
            showAlert('Lỗi khi thêm phòng: ' + error.message, 'error');
        }
    });

    // Load danh sách thành phố cho dropdown
    async function loadCities() {
        try {
            const response = await fetch(`${API_BASE}/cities`);
            const result = await response.json();

            if (result.success) {
                const select = document.getElementById('thanhpho');
                select.innerHTML = '<option value="">Chọn thành phố</option>';

                result.data.forEach(city => {
                    const option = document.createElement('option');
                    option.value = city.MATP;
                    option.textContent = city.TENTP;
                    select.appendChild(option);
                });
            }
        } catch (error) {
        }
    }

    // Load danh sách rạp cho dropdown
    async function loadBranchesForDropdown() {
        try {
            const response = await fetch(`${API_BASE}/branches`);
            const result = await response.json();

            if (result.success) {
                const select = document.getElementById('rap');
                select.innerHTML = '<option value="">Chọn rạp</option>';

                result.data.forEach(branch => {
                    const option = document.createElement('option');
                    option.value = branch.MARAP;
                    option.textContent = branch.TENRAP;
                    select.appendChild(option);
                });
            }
        } catch (error) {

        }
    }

    // Load dữ liệu khi mở modal
    document.getElementById('addBranchModal').addEventListener('show.bs.modal', loadCities);
    document.getElementById('addRoomModal').addEventListener('show.bs.modal', loadBranchesForDropdown);

    // Reset modal khi đóng
    document.getElementById('addBranchModal').addEventListener('hidden.bs.modal', function () {
        document.querySelector('#addBranchModal .modal-title').textContent = 'Thêm Rạp Chiếu';
        document.getElementById('saveBranchBtn').textContent = 'Lưu';
        document.getElementById('saveBranchBtn').onclick = () => {
            // Reset to add function
            const form = document.getElementById('addBranchForm');
            const formData = new FormData(form);

            fetch(`${API_BASE}/branches`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    TENRAP: formData.get('tenrap'),
                    DIACHI: formData.get('diachi'),
                    MATP: formData.get('thanhpho')
                })
            })
                .then(response => response.json())
                .then(result => {
                    if (result.success) {
                        showAlert('Thêm rạp thành công!', 'success');
                        form.reset();
                        bootstrap.Modal.getInstance(document.getElementById('addBranchModal')).hide();
                        loadBranches();
                    } else {
                        showAlert('Lỗi: ' + result.error, 'error');
                    }
                })
                .catch(error => {
                    showAlert('Lỗi khi thêm rạp: ' + error.message, 'error');
                });
        };
        document.getElementById('addBranchForm').reset();
    });

    document.getElementById('addRoomModal').addEventListener('hidden.bs.modal', function () {
        document.querySelector('#addRoomModal .modal-title').textContent = 'Thêm Phòng Chiếu';
        document.getElementById('saveRoomBtn').textContent = 'Lưu';
        document.getElementById('saveRoomBtn').onclick = () => {
            // Reset to add function
            const form = document.getElementById('addRoomForm');
            const formData = new FormData(form);

            fetch(`${API_BASE}/rooms`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    TENPHONG: formData.get('tenphong'),
                    MARAP: formData.get('rap')
                })
            })
                .then(response => response.json())
                .then(result => {
                    if (result.success) {
                        showAlert('Thêm phòng thành công!', 'success');
                        form.reset();
                        bootstrap.Modal.getInstance(document.getElementById('addRoomModal')).hide();
                        loadRooms();
                    } else {
                        showAlert('Lỗi: ' + result.error, 'error');
                    }
                })
                .catch(error => {
                    showAlert('Lỗi khi thêm phòng: ' + error.message, 'error');
                });
        };
        document.getElementById('addRoomForm').reset();
    });

    // Load danh sách thành phố cho dropdown rạp chiếu
    async function loadCitiesForBranch() {
        try {
            const response = await fetch(`${API_BASE}/cities`);
            const result = await response.json();

            if (result.success) {
                const addSelect = document.getElementById('addMatp');
                const editSelect = document.getElementById('editMatp');

                // Clear existing options
                addSelect.innerHTML = '<option value="">Chọn thành phố *</option>';
                editSelect.innerHTML = '<option value="">Chọn thành phố *</option>';

                result.data.forEach(city => {
                    const addOption = document.createElement('option');
                    addOption.value = city.MATP;
                    addOption.textContent = city.TENTP;
                    addSelect.appendChild(addOption);

                    const editOption = document.createElement('option');
                    editOption.value = city.MATP;
                    editOption.textContent = city.TENTP;
                    editSelect.appendChild(editOption);
                });
            }
        } catch (error) {
        }
    }

    // Các hàm global để có thể gọi từ HTML
    window.editBranch = async function (marap) {
        try {
            const response = await fetch(`${API_BASE}/branches/${marap}`);
            const result = await response.json();

            if (result.success) {
                const branch = result.data;

                // Điền dữ liệu vào form sửa
                document.getElementById('editTenrap').value = branch.TENRAP || '';
                document.getElementById('editDiachi').value = branch.DIACHI || '';

                // Load dropdowns
                await loadCitiesForBranch();

                // Set city
                if (branch.MATP) {
                    document.getElementById('editMatp').value = branch.MATP;
                }

                // Lưu marap để sử dụng khi cập nhật
                document.getElementById('editBranchForm').dataset.marap = marap;

                // Hiển thị modal
                new bootstrap.Modal(document.getElementById('editBranchModal')).show();
            } else {
                showAlert('Lỗi khi tải thông tin rạp: ' + result.error, 'error');
            }
        } catch (error) {
            showAlert('Lỗi khi tải thông tin rạp: ' + error.message, 'error');
        }
    };

    // Cập nhật rạp chiếu
    document.getElementById('updateBranchBtn').addEventListener('click', async function () {
        const form = document.getElementById('editBranchForm');
        const formData = new FormData(form);
        const marap = form.dataset.marap;

        const branchData = {
            TENRAP: formData.get('tenrap'),
            DIACHI: formData.get('diachi'),
            MATP: formData.get('matp')
        };

        try {
            const response = await fetch(`${API_BASE}/branches/${marap}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(branchData)
            });

            const result = await response.json();

            if (result.success) {
                showAlert('Cập nhật rạp chiếu thành công!', 'success');
                bootstrap.Modal.getInstance(document.getElementById('editBranchModal')).hide();
                loadBranches();
            } else {
                showAlert('Lỗi: ' + result.error, 'error');
            }
        } catch (error) {
            showAlert('Lỗi khi cập nhật rạp chiếu: ' + error.message, 'error');
        }
    });

    window.deleteBranch = function (marap) {
        // Lưu marap để sử dụng khi xác nhận xóa
        document.getElementById('confirmDeleteBranchBtn').dataset.marap = marap;
        new bootstrap.Modal(document.getElementById('deleteBranchModal')).show();
    };

    // Xác nhận xóa rạp chiếu
    document.getElementById('confirmDeleteBranchBtn').addEventListener('click', async function () {
        const marap = this.dataset.marap;

        try {
            const response = await fetch(`${API_BASE}/branches/${marap}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (result.success) {
                showAlert('Xóa rạp chiếu thành công!', 'success');
                bootstrap.Modal.getInstance(document.getElementById('deleteBranchModal')).hide();
                loadBranches();
            } else {
                showAlert('Lỗi: ' + result.error, 'error');
            }
        } catch (error) {
            showAlert('Lỗi khi xóa rạp chiếu: ' + error.message, 'error');
        }
    });

    // Load data khi mở modal thêm rạp chiếu
    document.getElementById('addBranchModal').addEventListener('show.bs.modal', function () {
        loadCitiesForBranch();
    });

    // Load data khi mở modal sửa rạp chiếu
    document.getElementById('editBranchModal').addEventListener('show.bs.modal', function () {
        loadCitiesForBranch();
    });


    window.editRoom = async function (maphong) {
        try {
            // Lấy thông tin phòng hiện tại
            const response = await fetch(`${API_BASE}/rooms/${maphong}`);
            const result = await response.json();

            if (result.success) {
                const room = result.data;

                // Điền dữ liệu vào form
                document.getElementById('tenphong').value = room.TENPHONG;
                document.getElementById('rap').value = room.MARAP;

                // Thay đổi modal title và button
                document.querySelector('#addRoomModal .modal-title').textContent = 'Sửa Phòng Chiếu';
                document.getElementById('saveRoomBtn').textContent = 'Cập Nhật';
                document.getElementById('saveRoomBtn').onclick = () => updateRoom(maphong);

                // Hiển thị modal
                const modal = new bootstrap.Modal(document.getElementById('addRoomModal'));
                modal.show();
            } else {
                showAlert('Lỗi khi tải thông tin phòng: ' + result.error, 'error');
            }
        } catch (error) {
            showAlert('Lỗi khi tải thông tin phòng: ' + error.message, 'error');
        }
    };

    window.deleteRoom = async function (maphong) {
        if (confirm('Bạn có chắc chắn muốn xóa phòng này?')) {
            try {
                const response = await fetch(`${API_BASE}/rooms/${maphong}`, {
                    method: 'DELETE'
                });

                const result = await response.json();

                if (result.success) {
                    showAlert('Xóa phòng thành công!', 'success');
                    loadRooms();
                } else {
                    showAlert('Lỗi: ' + result.error, 'error');
                }
            } catch (error) {
                showAlert('Lỗi khi xóa phòng: ' + error.message, 'error');
            }
        }
    };

    // Hàm cập nhật phòng
    async function updateRoom(maphong) {
        const form = document.getElementById('addRoomForm');
        const formData = new FormData(form);

        try {
            const response = await fetch(`${API_BASE}/rooms/${maphong}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    TENPHONG: formData.get('tenphong'),
                    MARAP: formData.get('rap')
                })
            });

            const result = await response.json();

            if (result.success) {
                showAlert('Cập nhật phòng thành công!', 'success');
                form.reset();
                bootstrap.Modal.getInstance(document.getElementById('addRoomModal')).hide();
                loadRooms();
            } else {
                showAlert('Lỗi: ' + result.error, 'error');
            }
        } catch (error) {
            showAlert('Lỗi khi cập nhật phòng: ' + error.message, 'error');
        }
    }

    // ========== QUẢN LÝ PHIM ==========
    async function loadFilms() {
        try {
            const response = await fetch(`${API_BASE}/films?t=${Date.now()}`, {
                cache: 'no-cache'
            });
            const result = await response.json();


            if (result.success && result.data) {
                displayFilms(result.data);
            } else {
                showAlert('Lỗi khi tải danh sách phim: ' + result.error, 'error');
            }
        } catch (error) {
            showAlert('Lỗi khi tải danh sách phim: ' + error.message, 'error');
        }
    }

    function displayFilms(films) {
        const tbody = document.querySelector('#filmTableBody') || document.querySelector('.info.film tbody');
        if (tbody) {
            tbody.innerHTML = '';

            if (films && films.length > 0) {
                films.forEach((film, index) => {
                    // Đảm bảo dữ liệu không undefined
                    const maphim = film.MAPHIM || 'N/A';
                    const tenphim = film.TENPHIM || 'N/A';
                    const daodien = film.DAODIEN || 'Chưa cập nhật';
                    const theloai = film.THELOAI || 'Chưa cập nhật';
                    const ngonngu = film.NGONNGU || 'Chưa cập nhật';
                    const rated = film.RATED || 'Chưa cập nhật';
                    const hinhanh = film.HINH_ANH_URL || '';
                    const tinhtrang = film.TENTT || 'N/A';

                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td><b>${maphim}</b></td>
                        <td>${tenphim}</td>
                        <td>${daodien}</td>
                        <td>${theloai}</td>
                        <td>${ngonngu}</td>
                        <td><span class="badge bg-info">${rated}</span></td>
                        <td>
                            <img src="${hinhanh}" alt="${tenphim}" style="width: 70px; height: auto; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgNzAgMTAwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSI3MCIgaGVpZ2h0PSIxMDAiIGZpbGw9IiNmM2Y0ZjYiLz48dGV4dCB4PSIzNSIgeT0iNTAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+UG9zdGVyPC90ZXh0Pjwvc3ZnPg=='">
                        </td>
                        <td><span class="badge ${tinhtrang === 'Đang chiếu' ? 'bg-success' : 'bg-warning'}">${tinhtrang}</span></td>
                        <td>
                            <button class="btn btn-sm btn-warning me-2" onclick="editFilm('${maphim}')" title="Sửa phim">
                                <i class="fas fa-edit"></i> Sửa
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="deleteFilm('${maphim}')" title="Xóa phim">
                                <i class="fas fa-trash"></i> Xóa
                            </button>
                        </td>
                    `;
                    tbody.appendChild(row);
                });
            } else {
                tbody.innerHTML = '<tr><td colspan="9" class="text-center text-muted">Không có dữ liệu phim</td></tr>';
            }
        } else {
        }
    }

    // Load danh sách tình trạng phim cho dropdown
    async function loadFilmStatuses() {
        try {
            const response = await fetch(`${API_BASE}/film-status`);
            const result = await response.json();

            if (result.success) {
                const addSelect = document.getElementById('addMatt');
                const editSelect = document.getElementById('editMatt');

                // Clear existing options
                addSelect.innerHTML = '<option value="">Chọn tình trạng phim *</option>';
                editSelect.innerHTML = '<option value="">Chọn tình trạng phim *</option>';

                result.data.forEach(status => {
                    const addOption = document.createElement('option');
                    addOption.value = status.MATT;
                    addOption.textContent = status.TENTT;
                    addSelect.appendChild(addOption);

                    const editOption = document.createElement('option');
                    editOption.value = status.MATT;
                    editOption.textContent = status.TENTT;
                    editSelect.appendChild(editOption);
                });
            }
        } catch (error) {
        }
    }

    // Thêm phim mới
    document.getElementById('saveFilmBtn').addEventListener('click', async function () {
        const form = document.getElementById('addFilmForm');
        const formData = new FormData(form);

        const filmData = {
            TENPHIM: formData.get('tenphim'),
            HINH_ANH_URL: formData.get('hinhanh'),
            MATT: formData.get('matt'),
            DAODIEN: formData.get('daodien'),
            DIENVIEN: formData.get('dienvien'),
            THELOAI: formData.get('theloai'),
            NGAYKHOICHIEU: formData.get('ngaykhoichieu'),
            THOILUONG: formData.get('thoiluong'),
            NGONNGU: formData.get('ngonngu'),
            RATED: formData.get('rated'),
            MOTA: formData.get('mota'),
            TRAILER_YOUTUBE_ID: formData.get('trailer')
        };

        try {
            const response = await fetch(`${API_BASE}/films`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(filmData)
            });

            const result = await response.json();

            if (result.success) {
                showAlert('Thêm phim thành công!', 'success');
                bootstrap.Modal.getInstance(document.getElementById('addFilmModal')).hide();
                form.reset();
                loadFilms();
            } else {
                showAlert('Lỗi: ' + result.error, 'error');
            }
        } catch (error) {
            showAlert('Lỗi khi thêm phim: ' + error.message, 'error');
        }
    });

    // ==================== ADMIN MANAGEMENT FUNCTIONS ====================

    // Các hàm global cho quản lý admin
    window.editAdmin = async function (username) {
        try {
            const response = await fetch(`${API_BASE}/admins/${username}`, {
                method: 'GET',
                credentials: 'include'
            });
            const result = await response.json();

            if (result.success) {
                const admin = result.data;

                // Điền dữ liệu vào form sửa
                document.getElementById('editAdminUsername').value = admin.TENDANGNHAP || '';
                document.getElementById('editAdminHoten').value = admin.HOTEN || '';
                document.getElementById('editAdminEmail').value = admin.EMAIL || '';
                document.getElementById('editAdminSdt').value = admin.SDT || '';
                document.getElementById('editAdminPassword').value = '';

                // Mở modal sửa
                const editModal = new bootstrap.Modal(document.getElementById('editAdminModal'));
                editModal.show();
            } else {
                showAlert('Lỗi: ' + result.error, 'error');
            }
        } catch (error) {
            showAlert('Lỗi khi tải thông tin admin: ' + error.message, 'error');
        }
    };

    window.deleteAdmin = function (username) {
        if (confirm(`Bạn có chắc chắn muốn xóa admin "${username}"?`)) {
            document.getElementById('deleteAdminUsername').value = username;
            const deleteModal = new bootstrap.Modal(document.getElementById('deleteAdminsModal'));
            deleteModal.show();
        }
    };

    // Event listeners cho modal admin
    document.getElementById('confirmAddAdminBtn').addEventListener('click', async function () {
        const form = document.getElementById('addAdminForm');
        const formData = new FormData(form);

        const adminData = {
            TENDANGNHAP: formData.get('TENDANGNHAP'),
            MAVT: 'MAVT1', // Mã vai trò admin
            MATKHAU: formData.get('MATKHAU'),
            HOTEN: formData.get('HOTEN'),
            EMAIL: formData.get('EMAIL'),
            SDT: formData.get('SDT')
        };

        try {
            const response = await fetch(`${API_BASE}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(adminData)
            });

            const result = await response.json();

            if (result.success) {
                showAlert('Thêm admin thành công!', 'success');
                bootstrap.Modal.getInstance(document.getElementById('addAdminModal')).hide();
                form.reset();
                loadAdmins();
            } else {
                showAlert('Lỗi: ' + result.error, 'error');
            }
        } catch (error) {
            showAlert('Lỗi khi thêm admin: ' + error.message, 'error');
        }
    });

    document.getElementById('confirmEditAdminBtn').addEventListener('click', async function () {
        const form = document.getElementById('editAdminForm');
        const formData = new FormData(form);
        const username = formData.get('TENDANGNHAP');

        const adminData = {
            HOTEN: formData.get('HOTEN'),
            EMAIL: formData.get('EMAIL'),
            SDT: formData.get('SDT')
        };

        // Chỉ thêm mật khẩu nếu có nhập
        const password = formData.get('MATKHAU');
        if (password && password.trim() !== '') {
            adminData.MATKHAU = password;
        }

        try {
            const response = await fetch(`${API_BASE}/admins/${username}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(adminData)
            });

            const result = await response.json();

            if (result.success) {
                showAlert('Cập nhật thông tin admin thành công!', 'success');
                bootstrap.Modal.getInstance(document.getElementById('editAdminModal')).hide();
                loadAdmins();
            } else {
                showAlert('Lỗi: ' + result.error, 'error');
            }
        } catch (error) {
            showAlert('Lỗi khi cập nhật admin: ' + error.message, 'error');
        }
    });

    document.getElementById('confirmDeleteAdminBtn').addEventListener('click', async function () {
        const username = document.getElementById('deleteAdminUsername').value;

        try {
            const response = await fetch(`${API_BASE}/admins/${username}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            const result = await response.json();

            if (result.success) {
                showAlert('Xóa admin thành công!', 'success');
                bootstrap.Modal.getInstance(document.getElementById('deleteAdminsModal')).hide();
                document.getElementById('deleteAdminUsername').value = '';
                loadAdmins();
            } else {
                showAlert('Lỗi: ' + result.error, 'error');
            }
        } catch (error) {
            showAlert('Lỗi khi xóa admin: ' + error.message, 'error');
        }
    });

    // Các hàm global cho quản lý phim
    window.editFilm = async function (maphim) {
        try {
            const response = await fetch(`${API_BASE}/films/${maphim}`);
            const result = await response.json();

            if (result.success) {
                const film = result.data;

                // Điền dữ liệu vào form sửa
                document.getElementById('editTenphim').value = film.TENPHIM || '';
                document.getElementById('editHinhanh').value = film.HINH_ANH_URL || '';
                document.getElementById('editDaodien').value = film.DAODIEN || '';
                document.getElementById('editDienvien').value = film.DIENVIEN || '';
                document.getElementById('editTheloai').value = film.THELOAI || '';
                document.getElementById('editNgaykhoichieu').value = film.NGAYKHOICHIEU ? film.NGAYKHOICHIEU.split('T')[0] : '';
                document.getElementById('editThoiluong').value = film.THOILUONG || '';
                document.getElementById('editNgonngu').value = film.NGONNGU || '';
                document.getElementById('editRated').value = film.RATED || '';
                document.getElementById('editMatt').value = film.MATT || '';
                document.getElementById('editMota').value = film.MOTA || '';
                document.getElementById('editTrailer').value = film.TRAILER_YOUTUBE_ID || '';

                // Lưu maphim để sử dụng khi cập nhật
                document.getElementById('editFilmForm').dataset.maphim = maphim;

                // Hiển thị modal
                new bootstrap.Modal(document.getElementById('editFilmModal')).show();
            } else {
                showAlert('Lỗi khi tải thông tin phim: ' + result.error, 'error');
            }
        } catch (error) {
            showAlert('Lỗi khi tải thông tin phim: ' + error.message, 'error');
        }
    };

    // Cập nhật phim
    document.getElementById('updateFilmBtn').addEventListener('click', async function () {
        const form = document.getElementById('editFilmForm');
        const formData = new FormData(form);
        const maphim = form.dataset.maphim;

        const filmData = {
            TENPHIM: formData.get('tenphim'),
            HINH_ANH_URL: formData.get('hinhanh'),
            MATT: formData.get('matt'),
            DAODIEN: formData.get('daodien'),
            DIENVIEN: formData.get('dienvien'),
            THELOAI: formData.get('theloai'),
            NGAYKHOICHIEU: formData.get('ngaykhoichieu'),
            THOILUONG: formData.get('thoiluong'),
            NGONNGU: formData.get('ngonngu'),
            RATED: formData.get('rated'),
            MOTA: formData.get('mota'),
            TRAILER_YOUTUBE_ID: formData.get('trailer')
        };

        try {
            const response = await fetch(`${API_BASE}/films/${maphim}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(filmData)
            });

            const result = await response.json();

            if (result.success) {
                showAlert('Cập nhật phim thành công!', 'success');
                bootstrap.Modal.getInstance(document.getElementById('editFilmModal')).hide();
                loadFilms();
            } else {
                showAlert('Lỗi: ' + result.error, 'error');
            }
        } catch (error) {
            showAlert('Lỗi khi cập nhật phim: ' + error.message, 'error');
        }
    });

    // Xóa phim
    window.deleteFilm = function (maphim) {
        // Lưu maphim để sử dụng khi xác nhận xóa
        document.getElementById('confirmDeleteFilmBtn').dataset.maphim = maphim;
        new bootstrap.Modal(document.getElementById('deleteFilmModal')).show();
    };

    // Xác nhận xóa phim
    document.getElementById('confirmDeleteFilmBtn').addEventListener('click', async function () {
        const maphim = this.dataset.maphim;

        try {
            const response = await fetch(`${API_BASE}/films/${maphim}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (result.success) {
                showAlert('Xóa phim thành công!', 'success');
                bootstrap.Modal.getInstance(document.getElementById('deleteFilmModal')).hide();
                loadFilms();
            } else {
                showAlert('Lỗi: ' + result.error, 'error');
            }
        } catch (error) {
            showAlert('Lỗi khi xóa phim: ' + error.message, 'error');
        }
    });

    // Load film statuses khi mở modal thêm phim
    document.getElementById('addFilmModal').addEventListener('show.bs.modal', loadFilmStatuses);
    document.getElementById('editFilmModal').addEventListener('show.bs.modal', loadFilmStatuses);

    // ========== QUẢN LÝ LỊCH CHIẾU ==========
    async function loadSchedules() {
        try {
            const response = await fetch(`${API_BASE}/schedules`);
            const result = await response.json();

            if (result.success) {
                displaySchedules(result.data);
            } else {
                showAlert('Lỗi khi tải danh sách lịch chiếu: ' + result.error, 'error');
            }
        } catch (error) {
            showAlert('Lỗi khi tải danh sách lịch chiếu: ' + error.message, 'error');
        }
    }

    function displaySchedules(schedules) {
        const tbody = document.querySelector('#scheduleTableBody') || document.querySelector('.info.showtimes tbody');
        if (tbody) {
            tbody.innerHTML = '';

            if (schedules && schedules.length > 0) {
                schedules.forEach((schedule, index) => {
                    console.log(`🎬 Schedule ${index + 1}:`, schedule);

                    // Format ngày tháng đẹp hơn
                    const formatDate = (dateStr) => {
                        if (!dateStr) return 'N/A';
                        try {
                            const date = new Date(dateStr);
                            return date.toLocaleDateString('vi-VN', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                            });
                        } catch (e) {
                            return dateStr;
                        }
                    };

                    // Format giờ đẹp hơn
                    const formatTime = (timeStr) => {
                        if (!timeStr) return 'N/A';
                        try {
                            // Nếu là ISO string, extract time part
                            if (timeStr.includes('T')) {
                                const time = new Date(timeStr);
                                return time.toLocaleTimeString('vi-VN', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit'
                                });
                            }
                            // Nếu đã là time string
                            return timeStr;
                        } catch (e) {
                            return timeStr;
                        }
                    };

                    // Đảm bảo dữ liệu không undefined
                    const malichchieu = schedule.MALICHCHIEU || 'N/A';
                    const tenphim = schedule.TENPHIM || 'N/A';
                    const tenrap = schedule.TENRAP || 'N/A';
                    const tenphong = schedule.TENPHONG || 'N/A';
                    const ngaychieu = formatDate(schedule.NGAYCHIEU);
                    const giochieu = formatTime(schedule.GIOCHIEU);
                    const tinhtrang = schedule.TENTT || 'N/A';

                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td><span class="badge bg-primary">${malichchieu}</span></td>
                        <td><strong>${tenphim}</strong></td>
                        <td>
                            <i class="fas fa-building me-1 text-muted"></i>
                            ${tenrap}
                        </td>
                        <td>
                            <i class="fas fa-door-open me-1 text-muted"></i>
                            ${tenphong}
                        </td>
                        <td>
                            <i class="fas fa-calendar-alt me-1 text-muted"></i>
                            ${ngaychieu}
                        </td>
                        <td>
                            <i class="fas fa-clock me-1 text-muted"></i>
                            <span class="badge bg-info">${giochieu}</span>
                        </td>
                        <td>
                            <span class="badge ${tinhtrang === 'Đang chiếu' ? 'bg-success' : 'bg-warning'}">
                                <i class="fas fa-play-circle me-1"></i>
                                ${tinhtrang}
                            </span>
                        </td>
                        <td>
                            <div class="btn-group-vertical btn-group-sm" role="group">
                                <button class="btn btn-warning mb-1" onclick="editSchedule('${malichchieu}')" title="Sửa lịch chiếu">
                                    <i class="fas fa-edit"></i> Sửa
                                </button>
                                <button class="btn btn-danger" onclick="deleteSchedule('${malichchieu}')" title="Xóa lịch chiếu">
                                    <i class="fas fa-trash"></i> Xóa
                                </button>
                            </div>
                        </td>
                    `;
                    tbody.appendChild(row);
                });
            } else {
                tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted py-4"><i class="fas fa-calendar-times me-2"></i>Không có lịch chiếu nào</td></tr>';
            }
        } else {
            console.error('❌ Không tìm thấy tbody element cho schedules');
        }
    }

    // Load danh sách phim cho dropdown
    async function loadFilmsForSchedule() {
        try {
            const response = await fetch(`${API_BASE}/films-for-schedule`);
            const result = await response.json();

            if (result.success) {
                const addSelect = document.getElementById('addMaphim');
                const editSelect = document.getElementById('editMaphim');

                // Clear existing options
                addSelect.innerHTML = '<option value="">Chọn phim *</option>';
                editSelect.innerHTML = '<option value="">Chọn phim *</option>';

                result.data.forEach(film => {
                    const addOption = document.createElement('option');
                    addOption.value = film.MAPHIM;
                    addOption.textContent = film.TENPHIM;
                    addSelect.appendChild(addOption);

                    const editOption = document.createElement('option');
                    editOption.value = film.MAPHIM;
                    editOption.textContent = film.TENPHIM;
                    editSelect.appendChild(editOption);
                });
            }
        } catch (error) {
        }
    }

    // Load danh sách thành phố cho dropdown
    async function loadCitiesForSchedule() {
        try {
            const response = await fetch(`${API_BASE}/cities`);
            const result = await response.json();

            if (result.success) {
                const addSelect = document.getElementById('addThanhpho');
                const editSelect = document.getElementById('editThanhpho');

                // Clear existing options
                addSelect.innerHTML = '<option value="">Chọn thành phố *</option>';
                editSelect.innerHTML = '<option value="">Chọn thành phố *</option>';

                result.data.forEach(city => {
                    const addOption = document.createElement('option');
                    addOption.value = city.MATP;
                    addOption.textContent = city.TENTP;
                    addSelect.appendChild(addOption);

                    const editOption = document.createElement('option');
                    editOption.value = city.MATP;
                    editOption.textContent = city.TENTP;
                    editSelect.appendChild(editOption);
                });
            }
        } catch (error) {
        }
    }

    // Load danh sách rạp theo thành phố
    async function loadBranchesForSchedule(cityId, targetSelectId) {
        try {
            const response = await fetch(`${API_BASE}/branches${cityId ? `?city=${cityId}` : ''}`);
            const result = await response.json();

            if (result.success) {
                const select = document.getElementById(targetSelectId);
                select.innerHTML = '<option value="">Chọn rạp *</option>';

                result.data.forEach(branch => {
                    const option = document.createElement('option');
                    option.value = branch.MARAP;
                    option.textContent = branch.TENRAP;
                    select.appendChild(option);
                });
            }
        } catch (error) {
        }
    }

    // Load danh sách phòng theo rạp
    async function loadRoomsForSchedule(branchId, targetSelectId) {
        try {
            const response = await fetch(`${API_BASE}/rooms${branchId ? `?branch=${branchId}` : ''}`);
            const result = await response.json();

            if (result.success) {
                const select = document.getElementById(targetSelectId);
                select.innerHTML = '<option value="">Chọn phòng *</option>';

                result.data.forEach(room => {
                    const option = document.createElement('option');
                    option.value = room.MAPHONG;
                    option.textContent = room.TENPHONG;
                    select.appendChild(option);
                });
            }
        } catch (error) {
        }
    }

    // Thêm lịch chiếu mới
    document.getElementById('saveScheduleBtn').addEventListener('click', async function () {
        const form = document.getElementById('addScheduleForm');
        const formData = new FormData(form);

        const scheduleData = {
            MAPHIM: formData.get('maphim'),
            MAPHONG: formData.get('maphong'),
            NGAYCHIEU: formData.get('ngaychieu'),
            GIOCHIEU: formData.get('giochieu')
        };

        try {
            const response = await fetch(`${API_BASE}/schedules`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(scheduleData)
            });

            const result = await response.json();

            if (result.success) {
                showAlert('Thêm lịch chiếu thành công!', 'success');
                bootstrap.Modal.getInstance(document.getElementById('addShowtimesModal')).hide();
                form.reset();
                loadSchedules();
            } else {
                showAlert('Lỗi: ' + result.error, 'error');
            }
        } catch (error) {
            console.error('Error adding schedule:', error);
            showAlert('Lỗi khi thêm lịch chiếu: ' + error.message, 'error');
        }
    });

    // Các hàm global cho quản lý lịch chiếu
    window.editSchedule = async function (malichchieu) {
        try {
            console.log('🎬 Loading schedule for editing:', malichchieu);
            const response = await fetch(`${API_BASE}/schedules/${malichchieu}`);
            const result = await response.json();

            if (result.success) {
                const schedule = result.data;
                console.log('📊 Schedule data:', schedule);

                // Điền dữ liệu vào form sửa
                document.getElementById('editMaphim').value = schedule.MAPHIM || '';
                document.getElementById('editMaphong').value = schedule.MAPHONG || '';

                // Xử lý ngày chiếu (format: YYYY-MM-DD)
                if (schedule.NGAYCHIEU) {
                    console.log('📅 Raw NGAYCHIEU:', schedule.NGAYCHIEU);
                    try {
                        // Nếu là string YYYY-MM-DD, sử dụng trực tiếp
                        if (typeof schedule.NGAYCHIEU === 'string' && schedule.NGAYCHIEU.match(/^\d{4}-\d{2}-\d{2}$/)) {
                            document.getElementById('editNgaychieu').value = schedule.NGAYCHIEU;
                        } else {
                            // Nếu là Date object hoặc string khác, convert
                            const ngayChieu = new Date(schedule.NGAYCHIEU);
                            if (!isNaN(ngayChieu.getTime())) {
                                document.getElementById('editNgaychieu').value = ngayChieu.toISOString().split('T')[0];
                            } else {
                                console.warn('Invalid date format for NGAYCHIEU:', schedule.NGAYCHIEU);
                                document.getElementById('editNgaychieu').value = '';
                            }
                        }
                    } catch (error) {
                        console.error('Error parsing NGAYCHIEU:', error);
                        document.getElementById('editNgaychieu').value = '';
                    }
                } else {
                    document.getElementById('editNgaychieu').value = '';
                }

                // Xử lý giờ chiếu (format: HH:MM:SS hoặc HH:MM)
                if (schedule.GIOCHIEU) {
                    console.log('🕐 Raw GIOCHIEU:', schedule.GIOCHIEU);
                    try {
                        // Nếu là string HH:MM:SS hoặc HH:MM, lấy phần HH:MM
                        if (typeof schedule.GIOCHIEU === 'string') {
                            if (schedule.GIOCHIEU.match(/^\d{2}:\d{2}(:\d{2})?$/)) {
                                document.getElementById('editGiochieu').value = schedule.GIOCHIEU.substring(0, 5);
                            } else {
                                console.warn('Invalid time format for GIOCHIEU:', schedule.GIOCHIEU);
                                document.getElementById('editGiochieu').value = '';
                            }
                        } else {
                            // Nếu là Date object, convert
                            const gioChieu = new Date(schedule.GIOCHIEU);
                            if (!isNaN(gioChieu.getTime())) {
                                const timeString = gioChieu.toTimeString().split(' ')[0];
                                document.getElementById('editGiochieu').value = timeString.substring(0, 5);
                            } else {
                                console.warn('Invalid time format for GIOCHIEU:', schedule.GIOCHIEU);
                                document.getElementById('editGiochieu').value = '';
                            }
                        }
                    } catch (error) {
                        console.error('Error parsing GIOCHIEU:', error);
                        document.getElementById('editGiochieu').value = '';
                    }
                } else {
                    document.getElementById('editGiochieu').value = '';
                }

                // Load dropdowns
                await loadCitiesForSchedule();
                await loadFilmsForSchedule();

                // Set city and load branches/rooms
                if (schedule.MATP) {
                    document.getElementById('editThanhpho').value = schedule.MATP;
                    await loadBranchesForSchedule(schedule.MATP, 'editMarap');
                    document.getElementById('editMarap').value = schedule.MARAP;
                    await loadRoomsForSchedule(schedule.MARAP, 'editMaphong');
                }

                // Lưu malichchieu để sử dụng khi cập nhật
                document.getElementById('editScheduleForm').dataset.malichchieu = malichchieu;

                // Hiển thị modal
                new bootstrap.Modal(document.getElementById('editScheduleModal')).show();
            } else {
                showAlert('Lỗi khi tải thông tin lịch chiếu: ' + result.error, 'error');
            }
        } catch (error) {
            console.error('Error loading schedule:', error);
            showAlert('Lỗi khi tải thông tin lịch chiếu: ' + error.message, 'error');
        }
    };

    // Cập nhật lịch chiếu
    document.getElementById('updateScheduleBtn').addEventListener('click', async function () {
        const form = document.getElementById('editScheduleForm');
        const formData = new FormData(form);
        const malichchieu = form.dataset.malichchieu;

        const scheduleData = {
            MAPHIM: formData.get('maphim'),
            MAPHONG: formData.get('maphong'),
            NGAYCHIEU: formData.get('ngaychieu'),
            GIOCHIEU: formData.get('giochieu')
        };

        try {
            const response = await fetch(`${API_BASE}/schedules/${malichchieu}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(scheduleData)
            });

            const result = await response.json();

            if (result.success) {
                showAlert('Cập nhật lịch chiếu thành công!', 'success');
                bootstrap.Modal.getInstance(document.getElementById('editScheduleModal')).hide();
                loadSchedules();
            } else {
                showAlert('Lỗi: ' + result.error, 'error');
            }
        } catch (error) {
            console.error('Error updating schedule:', error);
            showAlert('Lỗi khi cập nhật lịch chiếu: ' + error.message, 'error');
        }
    });

    // Xóa lịch chiếu
    window.deleteSchedule = function (malichchieu) {
        // Lưu malichchieu để sử dụng khi xác nhận xóa
        document.getElementById('confirmDeleteScheduleBtn').dataset.malichchieu = malichchieu;
        new bootstrap.Modal(document.getElementById('deleteShowtimesModal')).show();
    };

    // Xác nhận xóa lịch chiếu
    document.getElementById('confirmDeleteScheduleBtn').addEventListener('click', async function () {
        const malichchieu = this.dataset.malichchieu;

        try {
            const response = await fetch(`${API_BASE}/schedules/${malichchieu}`, {
                method: 'DELETE'
            });

            const result = await response.json();

            if (result.success) {
                showAlert('Xóa lịch chiếu thành công!', 'success');
                bootstrap.Modal.getInstance(document.getElementById('deleteShowtimesModal')).hide();
                loadSchedules();
            } else {
                showAlert('Lỗi: ' + result.error, 'error');
            }
        } catch (error) {
            console.error('Error deleting schedule:', error);
            showAlert('Lỗi khi xóa lịch chiếu: ' + error.message, 'error');
        }
    });

    // Event listeners cho dropdowns
    document.getElementById('addThanhpho').addEventListener('change', function () {
        const cityId = this.value;
        if (cityId) {
            loadBranchesForSchedule(cityId, 'addMarap');
        }
    });

    document.getElementById('addMarap').addEventListener('change', function () {
        const branchId = this.value;
        if (branchId) {
            loadRoomsForSchedule(branchId, 'addMaphong');
        }
    });

    document.getElementById('editThanhpho').addEventListener('change', function () {
        const cityId = this.value;
        if (cityId) {
            loadBranchesForSchedule(cityId, 'editMarap');
        }
    });

    document.getElementById('editMarap').addEventListener('change', function () {
        const branchId = this.value;
        if (branchId) {
            loadRoomsForSchedule(branchId, 'editMaphong');
        }
    });

    // Load data khi mở modal thêm lịch chiếu
    document.getElementById('addShowtimesModal').addEventListener('show.bs.modal', function () {
        loadFilmsForSchedule();
        loadCitiesForSchedule();
    });

    // Load data khi mở modal sửa lịch chiếu
    document.getElementById('editScheduleModal').addEventListener('show.bs.modal', function () {
        loadFilmsForSchedule();
        loadCitiesForSchedule();
    });
});