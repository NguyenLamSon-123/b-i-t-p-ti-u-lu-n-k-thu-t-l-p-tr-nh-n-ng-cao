/**
 * ============================================================
 * USER.JS - Logic trang người dùng
 * ============================================================
 */

// ========================================================
// KIỂM TRA ĐĂNG NHẬP
// ========================================================
let currentUser = null;

(function checkAuth() {
    currentUser = Storage.getCurrentUser();
    if (!currentUser || currentUser.role !== 'user') {
        window.location.href = 'index.html';
        return;
    }
    document.getElementById('userName').textContent = currentUser.fullName;
    document.getElementById('userAvatar').textContent = currentUser.fullName.charAt(0).toUpperCase();
    document.getElementById('userStudentId').textContent = currentUser.studentId;
})();

// ========================================================
// NAVIGATION
// ========================================================
const pageTitles = {
    'search': 'Tìm kiếm sách',
    'my-borrows': 'Sách đang mượn',
    'history': 'Lịch sử mượn',
    'profile': 'Thông tin cá nhân',
    'change-password': 'Đổi mật khẩu'
};

function navigateTo(page) {
    document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    const section = document.getElementById('page-' + page);
    if (section) section.classList.add('active');

    const navItem = document.querySelector(`.nav-item[data-page="${page}"]`);
    if (navItem) navItem.classList.add('active');

    document.getElementById('pageTitle').textContent = pageTitles[page] || page;
    document.getElementById('breadcrumb').textContent = 'Thư viện > ' + (pageTitles[page] || page);

    switch (page) {
        case 'my-borrows': loadMyBorrows(); break;
        case 'history': loadHistory(); break;
        case 'profile': loadProfile(); break;
    }
}

document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => navigateTo(item.dataset.page));
});

// ========================================================
// TOAST
// ========================================================
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span>${type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'info' ? 'ℹ️' : '⚠️'}</span> ${message}`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ========================================================
// MODAL
// ========================================================
function openModal(id) {
    document.getElementById(id).classList.add('show');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('show');
}

// ========================================================
// TÌM KIẾM SÁCH
// ========================================================
function performSearch() {
    const query = document.getElementById('searchInput').value.trim();
    const searchBy = document.getElementById('searchBy').value;

    if (!query) {
        document.getElementById('searchResults').innerHTML = `
            <div class="empty-state">
                <div class="icon">🔍</div>
                <h3>Nhập từ khóa tìm kiếm</h3>
                <p>Nhập tên sách, tác giả hoặc thể loại để tìm kiếm.</p>
            </div>
        `;
        document.getElementById('searchStats').classList.add('hidden');
        return;
    }

    const result = Storage.searchBooks(query, searchBy);
    const books = result.results;

    // Hiển thị thống kê tìm kiếm
    if (result.stats) {
        const statsDiv = document.getElementById('searchStats');
        statsDiv.classList.remove('hidden');
        statsDiv.innerHTML = `
            <div class="algo-stats-grid">
                <div class="algo-stat-item">
                    <div class="value">${result.stats.algorithm}</div>
                    <div class="label">Thuật toán</div>
                </div>
                <div class="algo-stat-item">
                    <div class="value">${result.stats.found}</div>
                    <div class="label">Kết quả</div>
                </div>
                <div class="algo-stat-item">
                    <div class="value">${result.stats.time}</div>
                    <div class="label">Thời gian</div>
                </div>
            </div>
        `;
    } else {
        document.getElementById('searchStats').classList.add('hidden');
    }

    // Render results
    if (books.length === 0) {
        document.getElementById('searchResults').innerHTML = `
            <div class="empty-state">
                <div class="icon">😔</div>
                <h3>Không tìm thấy kết quả</h3>
                <p>Thử tìm kiếm với từ khóa khác.</p>
            </div>
        `;
    } else {
        document.getElementById('searchResults').innerHTML = `
            <div class="books-grid">
                ${books.map(b => renderBookCard(b)).join('')}
            </div>
        `;
    }
}

// Tìm kiếm khi nhấn Enter
document.getElementById('searchInput')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') performSearch();
});

// ========================================================
// DUYỆT SÁCH
// ========================================================
function renderBookCard(book) {
    const statusClass = book.available > 0 ? 'badge-success' : 'badge-danger';
    const statusText = book.available > 0 ? `Còn ${book.available}` : 'Hết sách';

    return `
        <div class="book-card">
            <div class="book-card-header">
                <div class="book-icon">📖</div>
                <h3>${book.title}</h3>
            </div>
            <div class="book-card-body">
                <div class="meta">
                    <div class="meta-item">
                        <span class="icon">✍️</span>
                        <strong>${book.author}</strong>
                    </div>
                    <div class="meta-item">
                        <span class="icon">📅</span>
                        Năm ${book.year}
                    </div>
                    <div class="meta-item">
                        <span class="icon">📂</span>
                        ${book.genre}
                    </div>
                </div>
            </div>
            <div class="book-card-footer">
                <span class="badge ${statusClass}">${statusText}</span>
                <div class="actions">
                    <button class="btn btn-info btn-sm" onclick="viewBookDetail('${book.id}')">👁️ Chi tiết</button>
                    ${book.available > 0 ? `<button class="btn btn-primary btn-sm" onclick="handleBorrow('${book.id}')">📖 Mượn</button>` : ''}
                </div>
            </div>
        </div>
    `;
}

// ========================================================
// CHI TIẾT SÁCH
// ========================================================
function viewBookDetail(bookId) {
    const book = Storage.getBookById(bookId);
    if (!book) return;

    document.getElementById('bookDetailContent').innerHTML = `
        <div class="book-detail">
            <div class="book-cover-placeholder">
                📖
                <div class="title">${book.title}</div>
            </div>
            <div>
                <h2 style="margin-bottom:16px;">${book.title}</h2>
                <ul class="book-info-list">
                    <li><span class="label">Tác giả</span> <span>${book.author}</span></li>
                    <li><span class="label">Năm xuất bản</span> <span>${book.year}</span></li>
                    <li><span class="label">Thể loại</span> <span class="badge badge-primary">${book.genre}</span></li>
                    <li><span class="label">Số lượng</span> <span>${book.quantity} cuốn (còn ${book.available})</span></li>
                    <li><span class="label">Trạng thái</span> <span class="badge ${book.available > 0 ? 'badge-success' : 'badge-danger'}">${book.available > 0 ? 'Còn sách' : 'Hết sách'}</span></li>
                    <li><span class="label">Mô tả</span> <span>${book.description || 'Chưa có mô tả.'}</span></li>
                </ul>
            </div>
        </div>
    `;

    document.getElementById('bookDetailFooter').innerHTML = book.available > 0
        ? `<button class="btn btn-outline" onclick="closeModal('bookDetailModal')">Đóng</button>
           <button class="btn btn-primary" onclick="handleBorrow('${book.id}'); closeModal('bookDetailModal');">📖 Mượn sách</button>`
        : `<button class="btn btn-outline" onclick="closeModal('bookDetailModal')">Đóng</button>`;

    openModal('bookDetailModal');
}

// ========================================================
// MƯỢN SÁCH
// ========================================================
function handleBorrow(bookId) {
    const result = Storage.borrowBook(currentUser.id, bookId);
    showToast(result.message, result.success ? 'success' : 'error');
    if (result.success) {
        // Refresh search results
    }
}

// ========================================================
// SÁCH ĐÃ MƯỢN
// ========================================================
function loadMyBorrows() {
    const borrows = Storage.getBorrowsByUser(currentUser.id)
        .filter(b => b.status === 'borrowing' || b.status === 'pending');

    borrows.sort((a, b) => new Date(b.borrowDate) - new Date(a.borrowDate));

    document.getElementById('myBorrowsBody').innerHTML = borrows.length === 0
        ? '<tr><td colspan="5" class="text-center" style="padding:40px; color:var(--text-light);">Bạn chưa mượn sách nào</td></tr>'
        : borrows.map((b, i) => `
            <tr>
                <td>${i + 1}</td>
                <td><strong>${b.bookTitle}</strong></td>
                <td>${formatDate(b.borrowDate)}</td>
                <td>${formatDate(b.dueDate)}</td>
                <td>${statusBadge(b.status)}</td>
            </tr>
        `).join('');
}

// ========================================================
// LỊCH SỬ MƯỢN
// ========================================================
function loadHistory() {
    const borrows = Storage.getBorrowsByUser(currentUser.id);
    borrows.sort((a, b) => new Date(b.borrowDate) - new Date(a.borrowDate));

    document.getElementById('historyBody').innerHTML = borrows.length === 0
        ? '<tr><td colspan="6" class="text-center" style="padding:40px; color:var(--text-light);">Chưa có lịch sử mượn sách</td></tr>'
        : borrows.map((b, i) => `
            <tr>
                <td>${i + 1}</td>
                <td><strong>${b.bookTitle}</strong></td>
                <td>${formatDate(b.borrowDate)}</td>
                <td>${formatDate(b.dueDate)}</td>
                <td>${b.returnDate ? formatDate(b.returnDate) : '—'}</td>
                <td>${statusBadge(b.status)}</td>
            </tr>
        `).join('');
}

// ========================================================
// THÔNG TIN CÁ NHÂN
// ========================================================
function loadProfile() {
    // Reload user từ storage (có thể đã được admin sửa)
    const freshUser = Storage.getUserById(currentUser.id);
    if (freshUser) currentUser = freshUser;

    document.getElementById('profileName').value = currentUser.fullName;
    document.getElementById('profileStudentId').value = currentUser.studentId;
    document.getElementById('profileEmail').value = currentUser.email;
    document.getElementById('profileUsername').value = currentUser.username;
}

document.getElementById('profileForm')?.addEventListener('submit', function (e) {
    e.preventDefault();
    const updates = {
        fullName: document.getElementById('profileName').value.trim(),
        email: document.getElementById('profileEmail').value.trim()
    };

    Storage.updateUser(currentUser.id, updates);
    currentUser = Storage.getUserById(currentUser.id);
    // Cập nhật sidebar
    document.getElementById('userName').textContent = currentUser.fullName;
    document.getElementById('userAvatar').textContent = currentUser.fullName.charAt(0).toUpperCase();
    showToast('Cập nhật thông tin thành công!');
});

// ========================================================
// ĐỔI MẬT KHẨU
// ========================================================
document.getElementById('passwordForm')?.addEventListener('submit', function (e) {
    e.preventDefault();
    const oldPass = document.getElementById('oldPassword').value;
    const newPass = document.getElementById('newPassword').value;
    const confirmPass = document.getElementById('confirmPassword').value;

    if (newPass !== confirmPass) {
        showToast('Mật khẩu mới không khớp!', 'error');
        return;
    }

    if (newPass.length < 4) {
        showToast('Mật khẩu mới phải có ít nhất 4 ký tự!', 'error');
        return;
    }

    const result = Storage.changePassword(currentUser.id, oldPass, newPass);
    showToast(result.message, result.success ? 'success' : 'error');

    if (result.success) {
        this.reset();
        currentUser = Storage.getCurrentUser();
    }
});

// ========================================================
// UTILS
// ========================================================
function formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function statusBadge(status) {
    switch (status) {
        case 'pending': return '<span class="badge badge-warning">⏳ Chờ duyệt</span>';
        case 'borrowing': return '<span class="badge badge-info">📖 Đang mượn</span>';
        case 'returned': return '<span class="badge badge-success">✅ Đã trả</span>';
        default: return '<span class="badge">' + status + '</span>';
    }
}

function handleLogout() {
    Storage.logout();
    window.location.href = 'index.html';
}

// ========================================================
// INIT
// ========================================================
// Không cần load gì ở trang tìm kiếm ban đầu
