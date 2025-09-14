
async function fetchAndDisplayFilms(matt, containerElementId) {
    let containerElement = document.getElementById(containerElementId);
    if (!containerElement) {
        console.error(`ERROR: Container element with ID "${containerElementId}" not found.`);
        return;
    }
    console.log(`DEBUG: [fetchAndDisplayFilms] Đang fetch phim cho MATT: ${matt} vào container: ${containerElementId}`);

    try {
        let response = await fetch(`http://localhost:3000/list_film/status/${matt}`);
        let data = await response.json();
        console.log('DEBUG: [fetchAndDisplayFilms] Dữ liệu nhận được từ API:', data);

        if (data.success && data.films && data.films.length > 0) {
            console.log(`DEBUG: [fetchAndDisplayFilms] Tìm thấy ${data.films.length} phim cho MATT ${matt}. Đang render...`);
            containerElement.innerHTML = '';

            let filmsToDisplay = data.films;
            console.log('DEBUG: [fetchAndDisplayFilms] Phim sẽ hiển thị:', filmsToDisplay);

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
            console.log('DEBUG: [fetchAndDisplayFilms] Đã hoàn thành rendering phim.');
        } else {
            console.log(`DEBUG: [fetchAndDisplayFilms] Không có phim hoặc lỗi cho MATT ${matt}.`);
            containerElement.innerHTML = '<p class="text-center w-100">Không có phim nào để hiển thị.</p>';
        }
    } catch (error) {
        console.error(`ERROR: [fetchAndDisplayFilms] Lỗi trong fetchAndDisplayFilms cho MATT ${matt}:`, error);
        containerElement.innerHTML = '<p class="text-center w-100 text-danger">Có lỗi xảy ra khi tải phim.</p>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    fetchAndDisplayFilms('TT2', 'phimSapChieuContainer'); 
});