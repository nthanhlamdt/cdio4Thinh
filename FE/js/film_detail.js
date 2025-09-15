function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    let regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    let results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

async function fetchAndDisplayFilmDetails() {
    let maphim = getUrlParameter('maphim');

    if (!maphim) {
        console.error("LỖI: Không tìm thấy MAPHIM trong URL.");
        document.querySelector('.film-detail').innerHTML = '<p class="text-center w-100 text-danger">Không tìm thấy mã phim trong URL.</p>';
        return;
    }

    console.log(`DEBUG: Đang lấy chi tiết phim cho MAPHIM: ${maphim}`);

    try {
        let response = await fetch(`http://localhost:3000/api/phim/detail/${maphim}`);
        let data = await response.json();
        console.log('DEBUG: Dữ liệu chi tiết phim nhận được:', data);

        if (data.success && data.film) {
            let film = data.film;

            document.getElementById('filmTitlePage').textContent = film.TENPHIM;
            document.getElementById('filmPoster').src = film.HINH_ANH_URL || 'https://via.placeholder.com/300x450?text=Poster+Lỗi';
            document.getElementById('filmPoster').alt = film.TENPHIM;
            document.getElementById('filmTitle').textContent = film.TENPHIM;
            document.getElementById('filmDirector').textContent = film.DAODIEN;
            document.getElementById('filmActors').textContent = film.DIENVIEN;
            document.getElementById('filmGenre').textContent = film.THELOAI;
            document.getElementById('filmReleaseDate').textContent = film.NGAYKHOICHIEU;
            document.getElementById('filmDuration').textContent = film.THOILUONG;
            document.getElementById('filmLanguage').textContent = film.NGONNGU;
            document.getElementById('filmRated').textContent = film.RATED;
            document.getElementById('filmDescription').textContent = film.MOTA;

            let filmTrailerElement = document.getElementById('filmTrailer');
            let trailerHeadingElement = filmTrailerElement ? filmTrailerElement.previousElementSibling : null;
            let trailerId = film.TRAILER_YOUTUBE_ID;

            function toYouTubeEmbedSrc(input) {
                if (!input) return '';
                if (/^https?:\/\/www\.youtube\.com\/embed\//i.test(input)) return input;
                const watchMatch = input.match(/[?&]v=([^&#]+)/);
                if (watchMatch && watchMatch[1]) {
                    return `https://www.youtube.com/embed/${watchMatch[1]}?autoplay=0&modestbranding=1&rel=0`;
                }
                const shortMatch = input.match(/^https?:\/\/youtu\.be\/([^?&#]+)/i);
                if (shortMatch && shortMatch[1]) {
                    return `https://www.youtube.com/embed/${shortMatch[1]}?autoplay=0&modestbranding=1&rel=0`;
                }
                if (!/^https?:\/\//i.test(input)) {
                    return `https://www.youtube.com/embed/${input}?autoplay=0&modestbranding=1&rel=0`;
                }
                return input;
            }

            if (filmTrailerElement) {
                if (trailerId) {
                    filmTrailerElement.src = toYouTubeEmbedSrc(trailerId);
                    filmTrailerElement.style.display = 'block';
                    if (trailerHeadingElement && trailerHeadingElement.tagName === 'H3') {
                        trailerHeadingElement.style.display = 'block';
                    }
                } else {
                    filmTrailerElement.src = '';
                    filmTrailerElement.style.display = 'none';
                    if (trailerHeadingElement && trailerHeadingElement.tagName === 'H3') {
                        trailerHeadingElement.style.display = 'none';
                    }
                }
            }


            document.getElementById('modalFilmName').textContent = film.TENPHIM;

            let buyTicketBtn = document.getElementById('buyTicketBtn');
            if (buyTicketBtn) {
                let filmStatus = film.MATT;
                console.log(`DEBUG: Trạng thái phim từ backend (film.MATT): "${filmStatus}"`);
                console.log(`DEBUG: Classlist của nút TRƯỚC khi thay đổi:`, buyTicketBtn.classList);

                buyTicketBtn.classList.remove('btn-primary', 'btn-secondary');

                if (filmStatus === "TT1") {
                    console.log(`DEBUG: Phim "${film.TENPHIM}" có trạng thái "Đang Chiếu" (TT1). Kích hoạt nút "Mua Vé".`);
                    buyTicketBtn.classList.add('btn-primary');

                    buyTicketBtn.textContent = 'Mua Vé';
                    buyTicketBtn.disabled = false;

                    buyTicketBtn.addEventListener('click', async (event) => {
                        console.log('DEBUG: Nút "Mua Vé" (kích hoạt) được nhấn.');

                        event.preventDefault();
                        event.stopPropagation();

                        let savedUser = null;
                        try { savedUser = JSON.parse(localStorage.getItem('user')); } catch (_) { savedUser = null; }

                        if (savedUser) {
                            console.log('DEBUG: Người dùng đã đăng nhập (localStorage). Hiển thị modal chọn suất chiếu.');
                            let myModal = new bootstrap.Modal(document.getElementById('myModal'));
                            myModal.show();
                        } else {
                            console.log('DEBUG: Người dùng chưa đăng nhập (localStorage rỗng). Chuyển hướng đến trang đăng nhập.');
                            alert('Bạn chưa đăng nhập, vui lòng tới trang đăng nhập.');
                            window.location.href = '../html/login.html';
                        }
                    }, { once: true });

                } else if (filmStatus === "TT2") {
                    console.log(`DEBUG: Phim "${film.TENPHIM}" có trạng thái "Sắp Chiếu" (TT2). Vô hiệu hóa nút "Mua Vé".`);
                    buyTicketBtn.classList.add('btn-secondary');

                    buyTicketBtn.textContent = 'Sắp Chiếu';
                    buyTicketBtn.disabled = true;

                } else {
                    console.warn(`CẢNH BÁO: Phim "${film.TENPHIM}" có trạng thái không xác định: "${filmStatus}". Nút "Mua Vé" sẽ bị vô hiệu hóa.`);
                    buyTicketBtn.classList.add('btn-secondary');
                    buyTicketBtn.textContent = 'Không có sẵn';
                    buyTicketBtn.disabled = true;
                }
                console.log(`DEBUG: Classlist của nút SAU KHI thay đổi:`, buyTicketBtn.classList);
            }

        } else {
            console.log(`DEBUG: Backend trả về success: false hoặc không có film data.`);
            document.querySelector('.film-detail').innerHTML = `<p class="text-center w-100 text-danger">Không tìm thấy thông tin chi tiết cho phim có mã ${maphim}.</p>`;
        }
    } catch (error) {
        console.error(`LỖI: Lỗi khi lấy chi tiết phim ${maphim}:`, error);
        document.querySelector('.film-detail').innerHTML = '<p class="text-center w-100 text-danger">Có lỗi xảy ra khi tải chi tiết phim.</p>';
    }
}

document.addEventListener("DOMContentLoaded", function () {
    // Cleanup any stray Bootstrap modal backdrops/body state
    function cleanupModalBackdrops() {
        document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
        document.body.classList.remove('modal-open');
        document.body.style.removeProperty('padding-right');
    }

    // Auto-clean on modal hidden
    ['myModal', 'seatModal', 'bankModal', 'successModal'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('hidden.bs.modal', cleanupModalBackdrops);
        }
    });

    fetchAndDisplayFilmDetails();

    const API_BASE = 'http://localhost:3000/api';
    const maphim = getUrlParameter('maphim');

    const cityInput = document.querySelector('.city .form-control');
    const cityMenu = document.querySelector('.city .dropdown-menu');
    const theaterInput = document.querySelector('.theater .form-control');
    const theaterMenu = document.querySelector('.theater .dropdown-menu');
    // Không cần chọn phòng trong flow mua vé
    const roomInput = { dataset: {} };
    const roomMenu = null;
    const showtimeInput = document.querySelector('.show-times .form-control');
    const showtimeMenu = document.querySelector('.show-times .dropdown-menu');
    const dateList = document.getElementById('dateList');

    // Load cities to dropdown
    async function loadCities() {
        try {
            const res = await fetch(`${API_BASE}/cities`);
            const data = await res.json();
            if (data.success) {
                cityMenu.innerHTML = data.data.map(c => `<li><a class="dropdown-item" data-id="${c.MATP}">${c.TENTP}</a></li>`).join('');
                bindCityEvents();
            }
        } catch (e) { console.error('Load cities error', e); }
    }

    function bindCityEvents() {
        cityMenu.querySelectorAll('.dropdown-item').forEach(item => {
            item.addEventListener('click', async function () {
                const cityId = this.dataset.id;
                cityInput.value = this.textContent.trim();
                cityInput.dataset.id = cityId;
                // reset below
                theaterInput.value = ''; theaterInput.dataset.id = '';
                showtimeInput.value = '';
                await loadBranches(cityId);
                // clear dates and showtimes until theater selected
                const dateListEl = document.getElementById('dateList');
                if (dateListEl) dateListEl.innerHTML = '';
                const list = document.getElementById('showtimeList');
                if (list) list.innerHTML = '';
                showtimeMenu.innerHTML = '';
            });
        });
    }

    async function loadBranches(cityId) {
        try {
            const res = await fetch(`${API_BASE}/branches?city=${cityId}`);
            const data = await res.json();
            if (data.success) {
                theaterMenu.innerHTML = data.data.map(b => `<li><a class="dropdown-item" data-id="${b.MARAP}">${b.TENRAP}</a></li>`).join('');
                bindBranchEvents();
            }
        } catch (e) { console.error('Load branches error', e); }
    }

    function bindBranchEvents() {
        theaterMenu.querySelectorAll('.dropdown-item').forEach(item => {
            item.addEventListener('click', async function () {
                if (!cityInput.dataset.id) {
                    alert('Vui lòng chọn thành phố trước.');
                    return;
                }
                const branchId = this.dataset.id;
                theaterInput.value = this.textContent.trim();
                theaterInput.dataset.id = branchId;
                showtimeInput.value = '';
                await loadShowtimes();
            });
        });
    }

    async function loadShowtimes() {
        try {
            const params = new URLSearchParams({ film: maphim });
            // Chỉ cần branch để tránh lọc quá chặt
            if (theaterInput.dataset.id) params.append('branch', theaterInput.dataset.id);
            // Không cần param room
            const url = `${API_BASE}/schedules?${params.toString()}`;
            console.log('Loading showtimes from:', url);
            const res = await fetch(url);
            const data = await res.json();
            if (data.success) {
                const items = Array.isArray(data.data) ? data.data : [];
                // Hiển thị ngay danh sách suất chiếu, nhóm theo ngày
                renderGroupedShowtimes(items);
                // Đồng thời đổ dropdown (toàn bộ giờ) để ai thích dùng cũng có
                showtimeMenu.innerHTML = items.length ? items.map(s => {
                    const dateStr = (typeof s.NGAYCHIEU === 'string') ? (s.NGAYCHIEU.includes('T') ? s.NGAYCHIEU.split('T')[0] : s.NGAYCHIEU) : '';
                    const timeStr = (typeof s.GIOCHIEU === 'string') ? s.GIOCHIEU.substring(0, 5) : '';
                    return `<li><a class="dropdown-item" data-id="${s.MALICHCHIEU}">${dateStr} ${timeStr}</a></li>`;
                }).join('') : `<li><span class="dropdown-item text-muted">Không có suất chiếu</span></li>`;
                bindShowtimeEvents();
            } else {
                console.error('Showtimes error:', data.error);
                showtimeMenu.innerHTML = `<li><span class="dropdown-item text-danger">Lỗi tải suất chiếu</span></li>`;
            }
        } catch (e) { console.error('Load showtimes error', e); }
    }

    function bindShowtimeEvents() {
        showtimeMenu.querySelectorAll('.dropdown-item').forEach(item => {
            item.addEventListener('click', function () {
                showtimeInput.value = this.textContent.trim();
                showtimeInput.dataset.id = this.dataset.id;
            });
        });
    }

    function renderGroupedShowtimes(items) {
        const list = document.getElementById('showtimeList');
        if (!list) return;
        if (!items.length) {
            list.innerHTML = `<div class="list-group-item text-muted">Không có suất chiếu</div>`;
            return;
        }
        // Nhóm theo ngày
        const groupMap = new Map();
        items.forEach(s => {
            const dateStr = (typeof s.NGAYCHIEU === 'string') ? (s.NGAYCHIEU.includes('T') ? s.NGAYCHIEU.split('T')[0] : s.NGAYCHIEU) : '';
            if (!groupMap.has(dateStr)) groupMap.set(dateStr, []);
            groupMap.get(dateStr).push(s);
        });
        // Render
        const sections = [];
        [...groupMap.keys()].sort().forEach(d => {
            const dayItems = groupMap.get(d).sort((a, b) => (a.GIOCHIEU || '').localeCompare(b.GIOCHIEU || ''));
            const timeButtons = dayItems.map(s => {
                const t = (typeof s.GIOCHIEU === 'string') ? s.GIOCHIEU.substring(0, 5) : '';
                const label = `${t}` + (typeof s.AVAILABLE === 'number' ? ` • còn ${s.AVAILABLE}` : '');
                return `<button class="btn btn-outline-secondary btn-sm me-2 mb-2" data-id="${s.MALICHCHIEU}">${label}</button>`;
            }).join('');
            sections.push(`<div class="list-group-item"><div class="fw-bold mb-2">${d}</div><div class="d-flex flex-wrap">${timeButtons}</div></div>`);
        });
        list.innerHTML = sections.join('');
        // Bind click to set showtime
        list.querySelectorAll('button[data-id]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                showtimeInput.value = btn.textContent.trim();
                showtimeInput.dataset.id = btn.dataset.id;
            });
        });
    }

    // init
    loadCities();
    // Không tự load suất chiếu khi mở modal; chỉ load sau khi chọn rạp

    document.querySelectorAll('.dropdown-menu .dropdown-item').forEach(function (item) {
        item.addEventListener('click', function (e) {
            let inputGroup = e.target.closest('.input-group');
            if (!inputGroup) return;

            let input = inputGroup.querySelector('input.form-control');
            let button = inputGroup.querySelector('.dropdown-toggle');

            if (input) {
                input.value = e.target.textContent.trim();
            }

            if (button) {
                let dropdown = bootstrap.Dropdown.getInstance(button) || new bootstrap.Dropdown(button);
                dropdown.hide();
                button.blur();
            }
        });
    });

    document.querySelectorAll('.theater .dropdown-item').forEach(item => {
        item.addEventListener('click', function () {
            let selected = this.textContent.trim();
            let theaterDisplay = document.querySelector('#modalTheaterName');
            if (theaterDisplay) theaterDisplay.textContent = selected;
        });
    });

    document.querySelectorAll('.rooms .dropdown-item').forEach(item => {
        item.addEventListener('click', function () {
            let selected = this.textContent.trim();
            let roomDisplay = document.querySelector('#modalRoomName');
            if (roomDisplay) roomDisplay.textContent = selected;
        });
    });

    document.querySelectorAll('.show-times .dropdown-item').forEach(item => {
        item.addEventListener('click', function () {
            let selected = this.textContent.trim();
            let showtimeDisplay = document.querySelector('#modalShowtime');
            if (showtimeDisplay) showtimeDisplay.textContent = selected;
        });
    });

    let seatMap = document.querySelector('.seats-map');
    let seatDisplay = document.querySelector('.seat-name');
    let totalPriceDisplay = document.getElementById('modalTotalPrice');
    let seatPrice = 80000;

    if (seatMap) {
        seatMap.addEventListener('click', function (e) {
            let seat = e.target;
            if (!seat.classList.contains('seat') || seat.classList.contains('bg-danger')) {
                return;
            }
            seat.classList.toggle('bg-primary');
            seat.classList.toggle('bg-secondary');

            let selectedSeats = seatMap.querySelectorAll('.seat.bg-primary');
            let seatNames = Array.from(selectedSeats).map(s => s.textContent.trim());
            seatDisplay.textContent = seatNames.length > 0 ? seatNames.join(', ') : 'Chưa chọn';

            let total = selectedSeats.length * seatPrice;
            totalPriceDisplay.textContent = total.toLocaleString('vi-VN') + ' VND';
        });
    }

    let registerSeatBtn = document.querySelector('.layer-btn-reservation .btn-outline-reservation');
    if (registerSeatBtn) {
        registerSeatBtn.addEventListener('click', async (event) => {
            event.preventDefault();
            event.stopPropagation();

            // Bắt buộc chọn suất chiếu
            const showtimeId = document.querySelector('.show-times .form-control')?.dataset?.id;
            if (!showtimeId) {
                alert('Vui lòng chọn suất chiếu trước.');
                return;
            }

            // Tải ghế từ DB theo suất chiếu
            try {
                const res = await fetch(`${API_BASE}/schedules/${showtimeId}/seats`);
                const data = await res.json();
                if (data.success) {
                    // Render seats vào seatMap theo DB
                    if (seatMap) {
                        seatMap.innerHTML = '';
                        // Nhóm theo dãy
                        const group = new Map();
                        data.data.forEach(seat => {
                            if (!group.has(seat.TENDAY)) group.set(seat.TENDAY, []);
                            group.get(seat.TENDAY).push(seat);
                        });
                        // Hiển thị thống kê số lượng theo dãy
                        const stats = document.getElementById('rowStats');
                        if (stats) {
                            stats.innerHTML = '';
                            [...group.keys()].sort().forEach(row => {
                                const seats = group.get(row);
                                const total = seats.length;
                                const booked = seats.filter(s => s.BOOKED === 1).length;
                                const available = total - booked;
                                const badge = document.createElement('span');
                                badge.className = 'badge rounded-pill text-bg-light border';
                                badge.textContent = `${row}: ${available}/${total}`;
                                stats.appendChild(badge);
                            });
                        }
                        [...group.keys()].sort().forEach(row => {
                            const seats = group.get(row).sort((a, b) => a.SOGHE - b.SOGHE);
                            seats.forEach(s => {
                                const div = document.createElement('div');
                                div.className = `seat text-white text-center ${s.BOOKED ? 'bg-danger' : 'bg-secondary'}`;
                                div.textContent = `${row}${s.SOGHE}`;
                                seatMap.appendChild(div);
                            });
                        });
                    }

                    let myModalEl = document.getElementById('myModal');
                    let seatModalEl = document.getElementById('seatModal');
                    let myModal = bootstrap.Modal.getInstance(myModalEl);
                    if (myModal) myModal.hide();
                    cleanupModalBackdrops();
                    let seatModal = new bootstrap.Modal(seatModalEl);
                    seatModal.show();
                    document.getElementById('modalFilmName').textContent = document.getElementById('filmTitle').textContent;
                    if (seatDisplay) seatDisplay.textContent = 'Chưa chọn';
                    if (totalPriceDisplay) totalPriceDisplay.textContent = '0 VND';
                } else {
                    alert('Lỗi tải ghế: ' + data.error);
                }
            } catch (err) {
                console.error('Load seats error:', err);
                alert('Lỗi tải danh sách ghế.');
            }
        });
    }

    let seatModalBtnSecondary = document.querySelector('#seatModal .btn-secondary');
    if (seatModalBtnSecondary) {
        seatModalBtnSecondary.addEventListener('click', function () {
            let seatModalEl = document.getElementById('seatModal');
            let myModalEl = document.getElementById('myModal');

            let seatModal = bootstrap.Modal.getInstance(seatModalEl);
            if (seatModal) seatModal.hide();

            cleanupModalBackdrops();
            let myModal = new bootstrap.Modal(myModalEl);
            myModal.show();
        });
    }

    let seatModalBtnPrimary = document.querySelector('#seatModal .btn-primary');
    if (seatModalBtnPrimary) {
        seatModalBtnPrimary.addEventListener('click', function () {
            let seatModalEl = document.getElementById('seatModal');
            let bankModalEl = document.getElementById('bankModal');

            let filmName = document.querySelector('#modalFilmName')?.textContent;
            let theater = document.querySelector('#modalTheaterName')?.textContent;
            let room = document.querySelector('#modalRoomName')?.textContent;
            let showtime = document.querySelector('#modalShowtime')?.textContent;
            let seat = document.querySelector('.seat-name')?.textContent;
            let total = document.querySelector('#modalTotalPrice')?.textContent;

            let seatModal = bootstrap.Modal.getInstance(seatModalEl);
            if (seatModal) seatModal.hide();

            if (!bankModalEl) {
                alert('Thiếu modal thanh toán (bankModal). Vui lòng thêm phần tử #bankModal trong HTML hoặc bỏ qua bước này.');
                return;
            }

            let bankModalFilmName = document.querySelector('#bankModal #modalFilmName');
            if (bankModalFilmName) bankModalFilmName.textContent = filmName;

            let bankModalTheaterName = document.querySelector('#bankModal .name-theater .name-info');
            if (bankModalTheaterName) bankModalTheaterName.textContent = theater;

            let bankModalRoomName = document.querySelector('#bankModal .rooms-name');
            if (bankModalRoomName) bankModalRoomName.textContent = room;

            let bankModalShowtime = document.querySelector('#bankModal .showtime-name');
            if (bankModalShowtime) bankModalShowtime.textContent = showtime;

            let bankModalSeatName = document.querySelector('#bankModal .seat-name');
            if (bankModalSeatName) bankModalSeatName.textContent = seat;

            let bankModalMoney = document.querySelector('#bankModal .money');
            if (bankModalMoney) bankModalMoney.textContent = total;

            cleanupModalBackdrops();
            let bankModal = new bootstrap.Modal(bankModalEl);
            bankModal.show();
        });
    }

    let bankModalBtnSecondary = document.querySelector('#bankModal .btn-secondary');
    if (bankModalBtnSecondary) {
        bankModalBtnSecondary.addEventListener('click', function () {
            let bankModalEl = document.getElementById('bankModal');
            let seatModalEl = document.getElementById('seatModal');

            let bankModal = bootstrap.Modal.getInstance(bankModalEl);
            if (bankModal) bankModal.hide();

            cleanupModalBackdrops();
            let seatModal = new bootstrap.Modal(seatModalEl);
            seatModal.show();
        });
    }


    let bankModalBtnPrimary = document.querySelector('#bankModal .btn-primary');
    if (bankModalBtnPrimary) {
        bankModalBtnPrimary.addEventListener('click', function () {
            console.log('DEBUG: Đang xử lý thanh toán thực tế...');

            let bankModalEl = document.getElementById('bankModal');
            let bankModal = bootstrap.Modal.getInstance(bankModalEl);
            if (bankModal) bankModal.hide();

            let successModalEl = document.getElementById('successModal');
            cleanupModalBackdrops();
            let successModal = new bootstrap.Modal(successModalEl);
            successModal.show();
        });
    }

    document.querySelectorAll('.bank .dropdown-item').forEach(function (item) {
        item.addEventListener('click', function (e) {
            let input = e.target.closest('.input-group')?.querySelector('input.form-control');
            if (input) {
                input.value = e.target.textContent.trim();
            }
            let button = e.target.closest('.input-group')?.querySelector('.dropdown-toggle');
            if (button) {
                let dropdown = bootstrap.Dropdown.getInstance(button) || new bootstrap.Dropdown(button);
                dropdown.hide();
                button.blur();
            }
        });
    });

    document.querySelectorAll('.city .dropdown-item').forEach(item => {
        item.addEventListener('click', function () {
            let selected = this.textContent.trim();
            console.log(`DEBUG: Thành phố được chọn: ${selected}`);
        });
    });
});