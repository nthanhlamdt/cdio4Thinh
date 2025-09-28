// Search functionality for films
const API_BASE = 'http://localhost:3000/api';

// Initialize search functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
  initializeSearch();
});

function initializeSearch() {
  const searchForm = document.getElementById('search-box');
  const searchInput = document.getElementById('search-input');

  if (!searchForm || !searchInput) {
    return;
  }

  // Handle form submission
  searchForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (query) {
      searchFilms(query);
    }
  });

  // Handle Enter key press
  searchInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      const query = searchInput.value.trim();
      if (query) {
        searchFilms(query);
      }
    }
  });

  // Optional: Add real-time search suggestions (debounced)
  let searchTimeout;
  searchInput.addEventListener('input', function (e) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      const query = e.target.value.trim();
      if (query.length >= 2) {
        // Could add search suggestions here
      }
    }, 300);
  });
}

async function searchFilms(query) {
  try {
    showSearchLoading();

    const response = await fetch(`${API_BASE}/search/films?q=${encodeURIComponent(query)}`);
    const result = await response.json();

    hideSearchLoading();

    if (result.success) {
      displaySearchResults(result.data, query);
    } else {
      showSearchError(result.error || 'Có lỗi xảy ra khi tìm kiếm');
    }

  } catch (error) {
    hideSearchLoading();
    showSearchError('Lỗi kết nối. Vui lòng thử lại.');
  }
}

function displaySearchResults(films, query) {
  // Remove existing search results
  removeExistingSearchResults();

  if (films.length === 0) {
    showNoResults(query);
    return;
  }

  // Create search results container
  const resultsContainer = document.createElement('div');
  resultsContainer.id = 'search-results';
  resultsContainer.className = 'search-results-container';

  // Add search results header
  const header = document.createElement('div');
  header.className = 'search-results-header';
  header.innerHTML = `
        <h3>Kết quả tìm kiếm cho "${query}"</h3>
        <p>Tìm thấy ${films.length} phim</p>
        <button class="btn btn-sm btn-outline-secondary" onclick="closeSearchResults()">
            <i class="fas fa-times"></i> Đóng
        </button>
    `;
  resultsContainer.appendChild(header);

  // Create films grid
  const filmsGrid = document.createElement('div');
  filmsGrid.className = 'search-films-grid';

  films.forEach(film => {
    const filmCard = createFilmCard(film);
    filmsGrid.appendChild(filmCard);
  });

  resultsContainer.appendChild(filmsGrid);

  // Add to page
  document.body.appendChild(resultsContainer);

  // Add styles if not already added
  addSearchStyles();
}

function createFilmCard(film) {
  const card = document.createElement('div');
  card.className = 'search-film-card';

  const posterSrc = film.HINHANH || '../img/poster/default.jpg';
  const statusColor = film.TINHTRANG === 'Đang chiếu' ? 'success' :
    film.TINHTRANG === 'Sắp chiếu' ? 'warning' : 'secondary';

  card.innerHTML = `
        <div class="film-poster">
            <img src="${posterSrc}" alt="${film.TENPHIM}" 
                 onerror="this.src='../img/poster/default.jpg'">
            <div class="film-status badge bg-${statusColor}">${film.TINHTRANG}</div>
        </div>
        <div class="film-info">
            <h4 class="film-title">${film.TENPHIM}</h4>
            <p class="film-director"><strong>Đạo diễn:</strong> ${film.DAODIEN || 'Chưa cập nhật'}</p>
            <p class="film-genre"><strong>Thể loại:</strong> ${film.THELOAI || 'Chưa cập nhật'}</p>
            <p class="film-language"><strong>Ngôn ngữ:</strong> ${film.NGONNGU || 'Chưa cập nhật'}</p>
            <p class="film-duration"><strong>Thời lượng:</strong> ${film.THOILUONG || 'Chưa cập nhật'} phút</p>
            <p class="film-release"><strong>Khởi chiếu:</strong> ${formatDate(film.NGAYKHOICHIEU)}</p>
            ${film.MOTA ? `<p class="film-description">${film.MOTA.substring(0, 100)}...</p>` : ''}
        </div>
        <div class="film-actions">
            <button class="btn btn-primary btn-sm" onclick="viewFilmDetail('${film.MAPHIM}')">
                <i class="fas fa-eye"></i> Xem chi tiết
            </button>
            ${film.TINHTRANG === 'Đang chiếu' ?
      `<button class="btn btn-success btn-sm" onclick="bookTicket('${film.MAPHIM}')">
                    <i class="fas fa-ticket-alt"></i> Đặt vé
                </button>` : ''}
        </div>
    `;

  return card;
}

function formatDate(dateString) {
  if (!dateString) return 'Chưa cập nhật';

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  } catch (error) {
    return dateString;
  }
}

function viewFilmDetail(maphim) {
  // Navigate to film detail page
  window.location.href = `film_detail.html?maphim=${maphim}`;
}

function bookTicket(maphim) {
  // Navigate to film detail page for booking
  window.location.href = `film_detail.html?maphim=${maphim}`;
}

function closeSearchResults() {
  removeExistingSearchResults();
}


function removeExistingSearchResults() {
  const existingResults = document.getElementById('search-results');
  if (existingResults) {
    existingResults.remove();
  }
}

function showSearchLoading() {
  const searchBtn = document.getElementById('search-btn');
  if (searchBtn) {
    searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    searchBtn.disabled = true;
  }
}

function hideSearchLoading() {
  const searchBtn = document.getElementById('search-btn');
  if (searchBtn) {
    searchBtn.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i>';
    searchBtn.disabled = false;
  }
}

function showSearchError(message) {
  // You could show a toast notification or alert here
  alert('Lỗi tìm kiếm: ' + message);
}

function showNoResults(query) {
  removeExistingSearchResults();

  const resultsContainer = document.createElement('div');
  resultsContainer.id = 'search-results';
  resultsContainer.className = 'search-results-container';

  resultsContainer.innerHTML = `
        <div class="search-no-results">
            <div class="text-center">
                <i class="fas fa-search fa-3x text-muted mb-3"></i>
                <h3>Không tìm thấy phim nào</h3>
                <p>Không có kết quả nào cho từ khóa "<strong>${query}</strong>"</p>
                <p class="text-muted">Hãy thử với từ khóa khác hoặc kiểm tra chính tả</p>
                <button class="btn btn-outline-secondary" onclick="closeSearchResults()">
                    <i class="fas fa-times"></i> Đóng
                </button>
            </div>
        </div>
    `;

  document.body.appendChild(resultsContainer);
  addSearchStyles();
}

function addSearchStyles() {
  // Check if styles already added
  if (document.getElementById('search-styles')) return;

  const styles = document.createElement('style');
  styles.id = 'search-styles';
  styles.textContent = `
        .search-results-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 9999;
            overflow-y: auto;
            padding: 20px;
        }
        
        .search-results-header {
            background: white;
            padding: 20px;
            border-radius: 10px 10px 0 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .search-films-grid {
            background: white;
            padding: 20px;
            border-radius: 0 0 10px 10px;
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .search-film-card {
            border: 1px solid #ddd;
            border-radius: 8px;
            overflow: hidden;
            transition: transform 0.3s, box-shadow 0.3s;
        }
        
        .search-film-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 5px 20px rgba(0,0,0,0.1);
        }
        
        .film-poster {
            position: relative;
            height: 200px;
            overflow: hidden;
        }
        
        .film-poster img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .film-status {
            position: absolute;
            top: 10px;
            right: 10px;
        }
        
        .film-info {
            padding: 15px;
        }
        
        .film-title {
            font-size: 1.2em;
            font-weight: bold;
            margin-bottom: 10px;
            color: #333;
        }
        
        .film-info p {
            margin-bottom: 5px;
            font-size: 0.9em;
            color: #666;
        }
        
        .film-description {
            font-style: italic;
            color: #888 !important;
        }
        
        .film-actions {
            padding: 15px;
            border-top: 1px solid #eee;
            display: flex;
            gap: 10px;
        }
        
        .search-no-results {
            background: white;
            padding: 40px;
            border-radius: 10px;
            max-width: 500px;
            margin: 50px auto;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        @media (max-width: 768px) {
            .search-films-grid {
                grid-template-columns: 1fr;
            }
            
            .search-results-header {
                flex-direction: column;
                gap: 15px;
                text-align: center;
            }
        }
    `;

  document.head.appendChild(styles);
}
