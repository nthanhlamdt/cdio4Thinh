
async function fetchAndDisplayFilms(matt, containerElementId) {
    let containerElement = document.getElementById(containerElementId);
    if (!containerElement) {
        return;
    }

    try {
        let response = await fetch(`http://localhost:3000/list_film/status/${matt}`);
        let data = await response.json();

        if (data.success && data.films && data.films.length > 0) {
            containerElement.innerHTML = '';

            let filmsToDisplay = data.films;

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

document.addEventListener('DOMContentLoaded', () => {
    fetchAndDisplayFilms('TT1', 'phimDangChieuContainer');
});