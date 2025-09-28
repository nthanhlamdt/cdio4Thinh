let currentSlide = 0;
let slides = [];
let autoSlideInterval;

async function loadSliderImages() {
    try {
        let res = await fetch('http://localhost:3000/api/images');
        let imageUrls = await res.json();

        let slider = document.getElementById('dynamic-slider');
        let dotsContainer = document.querySelector('.dots');
        slider.innerHTML = '';
        dotsContainer.innerHTML = '';

        imageUrls.forEach((url, index) => createSlide(url, index));

        slides = document.querySelectorAll('.slider .item');

        if (slides.length > 0) {
            slides[0].classList.add('active');
            document.querySelectorAll('.dots li')[0]?.classList.add('active');
            currentSlide = 0;
        }

        setupSliderControls();
        startAutoSlide();
        setupAddImageButton();

        await checkUserRoleAndUpdateUI();

    } catch (err) {
        console.error("Lỗi khi tải ảnh slider:", err);
    }
}

function createSlide(url, index) {
    let slider = document.getElementById('dynamic-slider');
    let dotsContainer = document.querySelector('.dots');

    let item = document.createElement('section');
    item.classList.add('item');

    let link = document.createElement('a');

    let img = document.createElement('img');
    img.src = url;
    img.alt = `Slide ${index + 1}`;
    img.onerror = () => {
        img.src = 'https://via.placeholder.com/800x400?text=Ảnh+lỗi';
    };

    link.appendChild(img);
    item.appendChild(link);

    let controls = document.createElement('div');
    controls.className = 'slide-image-controls';

    let editBtn = document.createElement('button');
    editBtn.className = 'btn-edit';
    editBtn.textContent = '✏️ Sửa';
    editBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();

        let fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.click();

        fileInput.onchange = async () => {
            let file = fileInput.files[0];
            if (!file) return;

            let urlParts = img.src.split('/');
            let publicIdWithExt = urlParts[urlParts.length - 1];
            let oldPublicId = publicIdWithExt.split('.')[0];

            let formData = new FormData();
            formData.append('image', file);

            try {
                let res = await fetch(`http://localhost:3000/api/images/${oldPublicId}`, {
                    method: 'PUT',
                    body: formData
                });
                let result = await res.json();

                if (result.success) {
                    img.src = result.url;
                } else {
                    alert("Sửa ảnh thất bại: " + (result.message || "Lỗi không xác định"));
                }
            } catch (err) {
                alert("Lỗi khi sửa ảnh: " + err.message);
            }
        };
    });

    let deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-delete';
    deleteBtn.textContent = '🗑️ Xóa';
    deleteBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();

        let urlParts = img.src.split('/');
        let publicIdWithExt = urlParts[urlParts.length - 1];
        let publicId = publicIdWithExt.split('.')[0];

        if (!confirm("Bạn có chắc chắn muốn xóa ảnh này?")) return;

        try {
            let res = await fetch(`http://localhost:3000/api/images/${publicId}`, {
                method: 'DELETE'
            });
            let result = await res.json();

            if (result.success) {
                item.remove();

                slides = document.querySelectorAll('.slider .item');

                if (slides.length === 0) {
                    currentSlide = 0;
                } else if (currentSlide >= slides.length) {
                    currentSlide = slides.length - 1;
                }

                let dotsContainer = document.querySelector('.dots');
                dotsContainer.innerHTML = '';
                slides.forEach((_, idx) => {
                    let newDot = document.createElement('li');
                    newDot.addEventListener('click', () => changeSlide(idx));
                    dotsContainer.appendChild(newDot);
                });
                changeSlide(currentSlide);

                await checkUserRoleAndUpdateUI();
                restartAutoSlide();
            } else {
                alert("Xóa ảnh thất bại: " + (result.message || "Lỗi không xác định"));
            }
        } catch (err) {
            alert("Lỗi khi xóa ảnh: " + err.message);
        }
    });

    controls.appendChild(editBtn);
    controls.appendChild(deleteBtn);

    item.appendChild(controls);
    slider.appendChild(item);

    let dot = document.createElement('li');

    dot.addEventListener('click', () => changeSlide(index));
    dotsContainer.appendChild(dot);
}

function changeSlide(index) {
    if (!slides.length) {
        currentSlide = 0;
        return;
    }
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;


    if (slides[currentSlide]) {
        slides[currentSlide].classList.remove('active');
    }
    let currentDot = document.querySelectorAll('.dots li')[currentSlide];
    if (currentDot) {
        currentDot.classList.remove('active');
    }

    currentSlide = index;

    if (slides[currentSlide]) {
        slides[currentSlide].classList.add('active');
    }
    let newDot = document.querySelectorAll('.dots li')[currentSlide];
    if (newDot) {
        newDot.classList.add('active');
    }
}

function setupSliderControls() {
    document.getElementById('prev').addEventListener('click', () => {
        let newIndex = (currentSlide - 1 + slides.length) % slides.length;
        changeSlide(newIndex);
        restartAutoSlide();
    });

    document.getElementById('next').addEventListener('click', () => {
        let newIndex = (currentSlide + 1) % slides.length;
        changeSlide(newIndex);
        restartAutoSlide();
    });

    let controlWrapper = document.createElement('div');
    controlWrapper.classList.add('edit-controls');

    let addBtn = document.createElement("button");
    addBtn.id = "add-image-btn";
    addBtn.textContent = "➕ Thêm ảnh";

    controlWrapper.appendChild(addBtn);
    let sliderContainer = document.querySelector(".slider-controls");
    let nextBtn = document.getElementById("next");
    if (sliderContainer && nextBtn) {
        sliderContainer.insertBefore(controlWrapper, nextBtn);
    }
}

function startAutoSlide() {
    clearInterval(autoSlideInterval);
    if (slides.length > 1) {
        autoSlideInterval = setInterval(() => {
            let newIndex = (currentSlide + 1) % slides.length;
            changeSlide(newIndex);
        }, 15000);
    }
}

function restartAutoSlide() {
    clearInterval(autoSlideInterval);
    startAutoSlide();
}

function setupAddImageButton() {
    let addBtn = document.getElementById("add-image-btn");
    if (!addBtn) {
        return;
    }
    addBtn.addEventListener("click", () => {
        let fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.click();

        fileInput.onchange = async () => {
            let file = fileInput.files[0];
            if (!file) return;

            let formData = new FormData();
            formData.append('image', file);

            try {
                let res = await fetch('http://localhost:3000/api/upload', {
                    method: 'POST',
                    body: formData
                });
                let result = await res.json();

                if (result.success) {
                    let newIndex = slides.length;
                    createSlide(result.url, newIndex);
                    slides = document.querySelectorAll('.slider .item');
                    changeSlide(newIndex);
                    await checkUserRoleAndUpdateUI();
                    restartAutoSlide();
                } else {
                    alert("Tải ảnh thất bại: " + (result.message || "Lỗi không xác định"));
                }
            } catch (err) {
                alert("Lỗi khi thêm ảnh: " + err.message);
            }
        };
    });
}

async function checkUserRoleAndUpdateUI() {
    try {
        let response = await fetch('http://localhost:3000/user-session');
        let data = await response.json();

        let addBtnContainer = document.querySelector('.edit-controls');
        let editBtns = document.querySelectorAll('.btn-edit');
        let deleteBtns = document.querySelectorAll('.btn-delete');

        if (data.loggedIn && data.vaitro === 'MAVT1') {
            if (addBtnContainer) addBtnContainer.style.display = 'block';
            editBtns.forEach(btn => btn.style.display = 'block');
            deleteBtns.forEach(btn => btn.style.display = 'block');

        } else {
            if (addBtnContainer) addBtnContainer.style.display = 'none';
            editBtns.forEach(btn => btn.style.display = 'none');
            deleteBtns.forEach(btn => btn.style.display = 'none');
        }
    } catch (error) {
        let addBtnContainer = document.querySelector('.edit-controls');
        let editBtns = document.querySelectorAll('.btn-edit');
        let deleteBtns = document.querySelectorAll('.btn-delete');

        if (addBtnContainer) addBtnContainer.style.display = 'none';
        editBtns.forEach(btn => btn.style.display = 'none');
        deleteBtns.forEach(btn => btn.style.display = 'none');
    }
}

async function fetchAndDisplayFilms(matt, containerElementId) {
    let containerElement = document.getElementById(containerElementId);
    if (!containerElement) {
        return;
    }

    try {
        let response = await fetch(`http://localhost:3000/film_preview/status/${matt}`);
        let data = await response.json();

        if (data.success && data.films && data.films.length > 0) {
            containerElement.innerHTML = '';

            let filmsToDisplay = data.films.slice(0, 8);

            filmsToDisplay.forEach(film => {
                let filmHtml = `
                    <div class="col-6 col-md-4 col-lg-3">
                        <a href="../html/film_detail.html?maphim=${film.MAPHIM}" class="text-decoration-none text-dark">
                            <img src="${film.HINH_ANH_URL}" class="img-fluid rounded" alt="${film.TENPHIM}" onerror="this.src='https://via.placeholder.com/200x300?text=Ảnh+phim+lỗi';">
                            <p class="mt-2 fw-bold">${film.TENPHIM}</p>
                        </a>
                    </div>
                `;
                containerElement.innerHTML += filmHtml;
            });
        } else {
            containerElement.innerHTML = '<p class="text-center w-100">Không có phim nào để hiển thị.</p>';
        }
    } catch (error) {
        containerElement.innerHTML = '<p class="text-center w-100 text-danger">Có lỗi xảy ra khi tải phim.</p>';
    }
}


function setupFilmTabs() {
    let reviewingLink = document.querySelector('.link-film-reviewing');
    let upcomingLink = document.querySelector('.link-film-upcoming');
    let filmContainer = document.querySelector('.film');

    let phimDangChieuContainer = document.getElementById('phimDangChieuContainer');
    let phimSapChieuContainer = document.getElementById('phimSapChieuContainer');


    function activateTab(isReviewing) {
        if (reviewingLink) reviewingLink.classList.toggle('active', isReviewing);
        if (upcomingLink) upcomingLink.classList.toggle('active', !isReviewing);

        if (phimDangChieuContainer) phimDangChieuContainer.style.display = isReviewing ? 'flex' : 'none';
        if (phimSapChieuContainer) phimSapChieuContainer.style.display = isReviewing ? 'none' : 'flex';

        if (isReviewing) {
            fetchAndDisplayFilms('TT1', 'phimDangChieuContainer');
        } else {
            fetchAndDisplayFilms('TT2', 'phimSapChieuContainer');
        }
    }

    if (reviewingLink) {
        reviewingLink.addEventListener('click', (e) => {
            e.preventDefault();
            activateTab(true);
        });
    }

    if (upcomingLink) {
        upcomingLink.addEventListener('click', (e) => {
            e.preventDefault();
            activateTab(false);
        });
    }

    activateTab(true);
}

document.addEventListener('DOMContentLoaded', () => {
    loadSliderImages();
    setupFilmTabs();
});