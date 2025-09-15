document.addEventListener("DOMContentLoaded", function () {
    // API Base URL
    const API_BASE = 'http://localhost:3000/api';

    // Load danh sách thành phố từ database
    async function loadCities() {
        try {
            console.log('🏙️ Loading cities from:', `${API_BASE}/cities`);
            const response = await fetch(`${API_BASE}/cities`);
            const result = await response.json();

            console.log('📊 Cities API Response:', result);

            if (result.success && result.data) {
                console.log('✅ Cities data:', result.data);
                displayCities(result.data);
            } else {
                console.error('❌ Cities API Error:', result.error);
                showAlert('Lỗi khi tải danh sách thành phố: ' + result.error, 'error');
            }
        } catch (error) {
            console.error('❌ Cities Network Error:', error);
            showAlert('Lỗi khi tải danh sách thành phố: ' + error.message, 'error');
        }
    }

    // Hiển thị danh sách thành phố trong dropdown
    function displayCities(cities) {
        const dropdown = document.getElementById('cityDropdown');
        dropdown.innerHTML = '';

        if (cities && cities.length > 0) {
            cities.forEach(city => {
                const li = document.createElement('li');
                li.innerHTML = `<a class="dropdown-item" href="#" data-city-id="${city.MATP}">${city.TENTP}</a>`;
                dropdown.appendChild(li);
            });
        } else {
            const li = document.createElement('li');
            li.innerHTML = '<a class="dropdown-item text-muted">Không có thành phố nào</a>';
            dropdown.appendChild(li);
        }
    }

    // Xử lý khi chọn thành phố
    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('dropdown-item') && e.target.dataset.cityId) {
            e.preventDefault();

            const cityName = e.target.textContent.trim();
            const cityId = e.target.dataset.cityId;

            console.log(`🏙️ [UI] City selected: ${cityName} (ID: ${cityId})`);

            // Cập nhật input
            const cityInput = document.getElementById('cityInput');
            cityInput.value = cityName;

            // Lưu cityId để sử dụng sau
            cityInput.dataset.cityId = cityId;

            console.log(`💾 [UI] Saved cityId to input:`, cityInput.dataset.cityId);

            // Đóng dropdown
            const button = document.querySelector('.dropdown-toggle');
            const dropdown = bootstrap.Dropdown.getInstance(button) || new bootstrap.Dropdown(button);
            dropdown.hide();
            button.blur();
        }
    });

    // Load danh sách rạp theo thành phố
    async function loadBranchesByCity(cityId) {
        try {
            console.log('🏢 Loading branches for city:', cityId);
            console.log('🌐 API URL:', `${API_BASE}/branches?city=${cityId}`);

            const response = await fetch(`${API_BASE}/branches?city=${cityId}`);
            console.log('📡 Response status:', response.status);
            console.log('📡 Response headers:', response.headers);

            const result = await response.json();
            console.log('📊 API Response:', result);

            if (result.success) {
                console.log('✅ Successfully loaded branches:', result.data);
                displayBranches(result.data);
            } else {
                console.error('❌ API Error:', result.error);
                showAlert('Lỗi khi tải danh sách rạp: ' + result.error, 'error');
            }
        } catch (error) {
            console.error('❌ Network Error:', error);
            showAlert('Lỗi khi tải danh sách rạp: ' + error.message, 'error');
        }
    }

    // Hiển thị danh sách rạp trong modal
    function displayBranches(branches) {
        const tbody = document.querySelector('#myModal tbody');
        tbody.innerHTML = '';

        if (branches && branches.length > 0) {
            branches.forEach(branch => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${branch.TENRAP}</td>
                    <td>${branch.DIACHI}</td>
                    <td>${branch.TENTP}</td>
                    <td>Chưa cập nhật</td>
                    <td>Chưa cập nhật</td>
                `;
                tbody.appendChild(row);
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Không có rạp nào trong thành phố này</td></tr>';
        }
    }

    // Xử lý khi click nút "Xem Danh Sách Rạp"
    document.querySelector('.btn.btn-custom').addEventListener('click', function () {
        const cityInput = document.getElementById('cityInput');
        const cityId = cityInput.dataset.cityId;

        console.log('🔘 [UI] Button clicked');
        console.log('🏙️ [UI] City input value:', cityInput.value);
        console.log('🆔 [UI] City ID from dataset:', cityId);

        if (!cityId) {
            console.log('⚠️ [UI] No city selected');
            showAlert('Vui lòng chọn thành phố trước!', 'warning');
            return;
        }

        console.log('✅ [UI] Proceeding to load branches for city:', cityId);
        loadBranchesByCity(cityId);
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

    let modal = document.getElementById('myModal');
    let btn = document.querySelector('.btn.btn-custom');

    modal.addEventListener('show.bs.modal', function () {
        btn.classList.add('modal-open-btn');
    });

    modal.addEventListener('hidden.bs.modal', function () {
        btn.classList.remove('modal-open-btn');
    });

    // Load cities khi trang load
    loadCities();
});