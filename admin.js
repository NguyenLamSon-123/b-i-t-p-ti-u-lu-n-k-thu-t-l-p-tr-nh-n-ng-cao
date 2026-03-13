/**
 * ============================================================
 * ADMIN.JS - Logic trang quản trị
 * ============================================================
 */

// ========================================================
// KIỂM TRA ĐĂNG NHẬP
// ========================================================
(function checkAuth() {
    const user = Storage.getCurrentUser();
    if (!user || user.role !== 'admin') {
        window.location.href = 'index.html';
        return;
    }
    document.getElementById('adminName').textContent = user.fullName;
    document.getElementById('adminAvatar').textContent = user.fullName.charAt(0).toUpperCase();
})();

// ========================================================
// NAVIGATION
// ========================================================
const pageTitles = {
    'dashboard': 'Trang chủ',
    'books': 'Quản lý sách',
    'add-book': 'Thêm sách mới',
    'users': 'Quản lý người dùng',
    'import-excel': 'Import sinh viên từ Excel',
    'borrows': 'Quản lý mượn/trả',
};

function navigateTo(page) {
    // Ẩn tất cả sections
    document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    // Hiện section tương ứng
    const section = document.getElementById('page-' + page);
    if (section) section.classList.add('active');

    // Active nav item
    const navItem = document.querySelector(`.nav-item[data-page="${page}"]`);
    if (navItem) navItem.classList.add('active');

    // Cập nhật title
    document.getElementById('pageTitle').textContent = pageTitles[page] || page;
    document.getElementById('breadcrumb').textContent = 'Trang chủ > ' + (pageTitles[page] || page);

    // Load data cho trang
    switch (page) {
        case 'dashboard': loadDashboard(); break;
        case 'books': loadBooks(); break;
        case 'users': loadUsers(); break;
        case 'borrows': loadBorrows('pending'); break;
    }
}

// Click sidebar nav
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => navigateTo(item.dataset.page));
});

// ========================================================
// TOAST NOTIFICATION
// ========================================================
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span>${type === 'success' ? '✅' : type === 'error' ? '❌' : '⚠️'}</span> ${message}`;
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
// DASHBOARD
// ========================================================
function loadDashboard() {
    const books = Storage.getBooks();
    const users = Storage.getUsers().filter(u => u.role !== 'admin');
    const borrows = Storage.getBorrows();
    const active = borrows.filter(b => b.status === 'borrowing');
    const pending = borrows.filter(b => b.status === 'pending');

    document.getElementById('statsGrid').innerHTML = `
        <div class="stat-card">
            <div class="stat-icon blue">📚</div>
            <div class="stat-info">
                <h3>${books.length}</h3>
                <p>Tổng số sách</p>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon green">👥</div>
            <div class="stat-info">
                <h3>${users.length}</h3>
                <p>Người dùng</p>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon orange">📖</div>
            <div class="stat-info">
                <h3>${active.length}</h3>
                <p>Đang mượn</p>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon red">⏳</div>
            <div class="stat-info">
                <h3>${pending.length}</h3>
                <p>Chờ xác nhận</p>
            </div>
        </div>
    `;

    // Recent borrows
    const recent = borrows.slice(-5).reverse();
    document.getElementById('recentBorrows').innerHTML = recent.length === 0
        ? '<tr><td colspan="6" class="text-center" style="padding:40px; color:var(--text-light);">Chưa có yêu cầu mượn sách nào</td></tr>'
        : recent.map(b => `
            <tr>
                <td>${b.userName}</td>
                <td>${b.userStudentId}</td>
                <td>${b.bookTitle}</td>
                <td>${formatDate(b.borrowDate)}</td>
                <td>${statusBadge(b.status)}</td>
                <td>
                    ${b.status === 'pending' ? `
                        <button class="btn btn-success btn-sm" onclick="handleConfirmBorrow('${b.id}')">✅ Duyệt</button>
                    ` : b.status === 'borrowing' ? `
                        <button class="btn btn-info btn-sm" onclick="handleConfirmReturn('${b.id}')">📥 Trả</button>
                    ` : '—'}
                </td>
            </tr>
        `).join('');
}

// ========================================================
// SÁCH
// ========================================================
let currentBooksData = [];

function loadBooks() {
    const query = document.getElementById('bookSearchInput')?.value || '';
    const searchBy = document.getElementById('bookSearchBy')?.value || 'all';
    const genreFilter = document.getElementById('bookGenreFilter')?.value || '';
    const sortBy = document.getElementById('bookSortBy')?.value || 'title-asc';

    // Load genres filter
    const genreSelect = document.getElementById('bookGenreFilter');
    if (genreSelect) {
        const genres = Storage.getGenres();
        const currentVal = genreSelect.value;
        genreSelect.innerHTML = '<option value="">Tất cả thể loại</option>' +
            genres.map(g => `<option value="${g}" ${g === currentVal ? 'selected' : ''}>${g}</option>`).join('');
    }

    // Search
    const searchResult = Storage.searchBooks(query, searchBy);
    let books = searchResult.results;

    // Filter by genre
    if (genreFilter) {
        books = books.filter(b => b.genre === genreFilter);
    }

    // Sort
    const [sortKey, sortDir] = sortBy.split('-');
    if (sortKey === 'year') {
        books = StringAlgorithms.sortObjectsByNumericKey(books, 'year', sortDir === 'asc');
    } else {
        books = StringAlgorithms.sortObjectsByStringKey(books, sortKey, sortDir === 'asc');
    }

    currentBooksData = books;

    // Show stats
    const statsDiv = document.getElementById('bookSearchStats');
    if (query && searchResult.stats) {
        statsDiv.classList.remove('hidden');
        statsDiv.innerHTML = `
            <h3>📊 Kết quả tìm kiếm</h3>
            <div class="algo-stats-grid">
                <div class="algo-stat-item">
                    <div class="value">${searchResult.stats.algorithm}</div>
                    <div class="label">Thuật toán</div>
                </div>
                <div class="algo-stat-item">
                    <div class="value">${searchResult.stats.found}</div>
                    <div class="label">Kết quả</div>
                </div>
                <div class="algo-stat-item">
                    <div class="value">${searchResult.stats.time}</div>
                    <div class="label">Thời gian</div>
                </div>
            </div>
        `;
    } else {
        statsDiv.classList.add('hidden');
    }

    // Render table
    const tbody = document.getElementById('booksTableBody');
    tbody.innerHTML = books.length === 0
        ? '<tr><td colspan="7" class="text-center" style="padding:40px; color:var(--text-light);">Không tìm thấy sách nào</td></tr>'
        : books.map((b, i) => `
            <tr>
                <td>${i + 1}</td>
                <td><strong>${b.title}</strong></td>
                <td>${b.author}</td>
                <td>${b.year}</td>
                <td><span class="badge badge-primary">${b.genre}</span></td>
                <td>${b.quantity} / <strong>${b.available}</strong></td>
                <td>
                    <div class="actions">
                        <button class="btn btn-info btn-sm" onclick="openEditBook('${b.id}')">✏️</button>
                        <button class="btn btn-danger btn-sm" onclick="handleDeleteBook('${b.id}')">🗑️</button>
                    </div>
                </td>
            </tr>
        `).join('');
}

// Event listeners for search
document.getElementById('bookSearchInput')?.addEventListener('input', debounce(loadBooks, 300));
document.getElementById('bookSearchBy')?.addEventListener('change', loadBooks);
document.getElementById('bookGenreFilter')?.addEventListener('change', loadBooks);
document.getElementById('bookSortBy')?.addEventListener('change', loadBooks);

function debounce(fn, delay) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

// THÊM SÁCH
document.getElementById('bookForm')?.addEventListener('submit', function (e) {
    e.preventDefault();
    const book = {
        title: document.getElementById('bookTitle').value.trim(),
        author: document.getElementById('bookAuthor').value.trim(),
        year: parseInt(document.getElementById('bookYear').value),
        genre: document.getElementById('bookGenre').value.trim(),
        quantity: parseInt(document.getElementById('bookQuantity').value),
        description: document.getElementById('bookDesc').value.trim()
    };

    Storage.addBook(book);
    showToast('Thêm sách thành công!');
    resetBookForm();
    navigateTo('books');
});

function resetBookForm() {
    document.getElementById('bookForm').reset();
    document.getElementById('bookEditId').value = '';
    document.getElementById('bookFormTitle').textContent = '➕ Thêm sách mới';
}

// SỬA SÁCH
function openEditBook(id) {
    const book = Storage.getBookById(id);
    if (!book) return;

    document.getElementById('editBookId').value = book.id;
    document.getElementById('editBookTitle').value = book.title;
    document.getElementById('editBookAuthor').value = book.author;
    document.getElementById('editBookYear').value = book.year;
    document.getElementById('editBookGenreInput').value = book.genre;
    document.getElementById('editBookQty').value = book.quantity;
    document.getElementById('editBookAvail').value = book.available;
    document.getElementById('editBookDescription').value = book.description || '';

    openModal('editBookModal');
}

function saveEditBook() {
    const id = document.getElementById('editBookId').value;
    const updates = {
        title: document.getElementById('editBookTitle').value.trim(),
        author: document.getElementById('editBookAuthor').value.trim(),
        year: parseInt(document.getElementById('editBookYear').value),
        genre: document.getElementById('editBookGenreInput').value.trim(),
        quantity: parseInt(document.getElementById('editBookQty').value),
        available: parseInt(document.getElementById('editBookAvail').value),
        description: document.getElementById('editBookDescription').value.trim()
    };

    Storage.updateBook(id, updates);
    closeModal('editBookModal');
    showToast('Cập nhật sách thành công!');
    loadBooks();
}

// XÓA SÁCH
function handleDeleteBook(id) {
    const book = Storage.getBookById(id);
    if (!book) return;
    if (confirm(`Bạn có chắc muốn xóa sách "${book.title}"?`)) {
        Storage.deleteBook(id);
        showToast('Đã xóa sách!', 'warning');
        loadBooks();
    }
}

// ========================================================
// NGƯỜI DÙNG
// ========================================================
function loadUsers() {
    const query = document.getElementById('userSearchInput')?.value || '';
    const searchBy = document.getElementById('userSearchBy')?.value || 'all';

    const users = Storage.searchUsers(query, searchBy);

    document.getElementById('usersTableBody').innerHTML = users.length === 0
        ? '<tr><td colspan="6" class="text-center" style="padding:40px; color:var(--text-light);">Không tìm thấy người dùng</td></tr>'
        : users.map((u, i) => `
            <tr>
                <td>${i + 1}</td>
                <td><strong>${u.fullName}</strong></td>
                <td>${u.studentId}</td>
                <td>${u.email}</td>
                <td>${u.active
                    ? '<span class="badge badge-success">Hoạt động</span>'
                    : '<span class="badge badge-danger">Đã khóa</span>'
                }</td>
                <td>
                    <div class="actions">
                        <button class="btn ${u.active ? 'btn-warning' : 'btn-success'} btn-sm" onclick="handleToggleUser('${u.id}')">
                            ${u.active ? '🔒 Khóa' : '🔓 Mở'}
                        </button>
                        <button class="btn btn-info btn-sm" onclick="viewUserHistory('${u.id}')">📖</button>
                    </div>
                </td>
            </tr>
        `).join('');
}

document.getElementById('userSearchInput')?.addEventListener('input', debounce(loadUsers, 300));
document.getElementById('userSearchBy')?.addEventListener('change', loadUsers);

// ========================================================
// IMPORT EXCEL
// ========================================================
let pendingImportData = [];

document.getElementById('excelFileInput')?.addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (evt) {
        try {
            const data = new Uint8Array(evt.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet);

            if (jsonData.length === 0) {
                showToast('File Excel trống hoặc không đúng định dạng!', 'error');
                return;
            }

            pendingImportData = jsonData;
            showExcelPreview(jsonData);
        } catch (err) {
            showToast('Lỗi đọc file Excel: ' + err.message, 'error');
        }
    };
    reader.readAsArrayBuffer(file);
    this.value = ''; // reset input
});

function showExcelPreview(data) {
    const preview = document.getElementById('excelPreview');
    const tbody = document.getElementById('excelPreviewBody');
    const count = document.getElementById('previewCount');

    count.textContent = data.length;

    // Tự động phát hiện cột dùng cùng logic với Storage
    const colMap = Storage.detectColumns(data[0] || {});

    // Hiện cột đã phát hiện để debug
    console.log('Detected columns:', colMap, '| Keys in Excel:', Object.keys(data[0] || {}));

    tbody.innerHTML = data.map((row, i) => {
        const mssv = Storage.getColumnValue(row, colMap.mssv);
        const name = Storage.getColumnValue(row, colMap.hoTen);
        const email = Storage.getColumnValue(row, colMap.email);
        return `<tr>
            <td>${i + 1}</td>
            <td>${mssv}</td>
            <td>${name}</td>
            <td>${email}</td>
        </tr>`;
    }).join('');

    preview.classList.remove('hidden');
    document.getElementById('importResult').classList.add('hidden');
}

function confirmImport() {
    if (pendingImportData.length === 0) {
        showToast('Không có dữ liệu để import!', 'error');
        return;
    }

    const result = Storage.importUsersFromData(pendingImportData);
    const resultDiv = document.getElementById('importResult');

    let html = `<div style="padding:16px; border-radius:8px; background:#f0fdf4; border:1px solid #86efac;">`;
    html += `<h4 style="color:#166534; margin-bottom:8px;">✅ Import hoàn tất!</h4>`;
    html += `<p>✅ Thêm thành công: <strong>${result.added}</strong> sinh viên</p>`;
    if (result.skipped > 0) html += `<p>⏭️ Bỏ qua (đã tồn tại): <strong>${result.skipped}</strong></p>`;
    if (result.errors && result.errors.length > 0) {
        html += `<p>❌ Lỗi: <strong>${result.errors.length}</strong></p>`;
        html += `<details style="margin-top:8px;"><summary style="cursor:pointer; color:#dc2626;">⚠️ Chi tiết lỗi (${result.errors.length})</summary>`;
        html += `<ul style="font-size:12px; color:#64748b; max-height:200px; overflow-y:auto; margin-top:8px;">`;
        result.errors.forEach(e => html += `<li>${e}</li>`);
        html += `</ul></details>`;
    }
    html += `</div>`;

    resultDiv.innerHTML = html;
    resultDiv.classList.remove('hidden');

    document.getElementById('excelPreview').classList.add('hidden');
    pendingImportData = [];

    showToast(`Import thành công ${result.added} sinh viên!`);
    loadDashboard();
}

function cancelImport() {
    document.getElementById('excelPreview').classList.add('hidden');
    pendingImportData = [];
}

function handleClearStudents() {
    if (!confirm('⚠️ Bạn có chắc muốn xóa TẤT CẢ tài khoản sinh viên? Hành động này không thể hoàn tác!')) return;
    const count = Storage.clearStudents();
    showToast(`Đã xóa ${count} tài khoản sinh viên!`, 'warning');
    loadUsers();
    loadDashboard();
}

// KHÓA / MỞ KHÓA
function handleToggleUser(id) {
    const user = Storage.toggleUserActive(id);
    if (user) {
        showToast(user.active ? 'Đã mở khóa tài khoản!' : 'Đã khóa tài khoản!', user.active ? 'success' : 'warning');
        loadUsers();
    }
}

// XEM LỊCH SỬ MƯỢN
function viewUserHistory(userId) {
    const user = Storage.getUserById(userId);
    const borrows = Storage.getBorrowsByUser(userId);

    let html = `<h4 style="margin-bottom:12px;">${user.fullName} (${user.studentId})</h4>`;

    if (borrows.length === 0) {
        html += '<p style="color:var(--text-light);">Chưa có lịch sử mượn sách.</p>';
    } else {
        html += `<table><thead><tr>
            <th>Sách</th><th>Ngày mượn</th><th>Hạn trả</th><th>Trạng thái</th>
        </tr></thead><tbody>`;
        borrows.forEach(b => {
            html += `<tr>
                <td>${b.bookTitle}</td>
                <td>${formatDate(b.borrowDate)}</td>
                <td>${formatDate(b.dueDate)}</td>
                <td>${statusBadge(b.status)}</td>
            </tr>`;
        });
        html += '</tbody></table>';
    }

    document.getElementById('userHistoryContent').innerHTML = html;
    openModal('userHistoryModal');
}

// ========================================================
// MƯỢN/TRẢ
// ========================================================
let currentBorrowTab = 'pending';

document.querySelectorAll('#page-borrows .tab').forEach(tab => {
    tab.addEventListener('click', function () {
        document.querySelectorAll('#page-borrows .tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        currentBorrowTab = this.dataset.tab;
        loadBorrows(currentBorrowTab);
    });
});

function loadBorrows(status = 'pending') {
    let borrows = Storage.getBorrows();
    if (status !== 'all') {
        borrows = borrows.filter(b => b.status === status);
    }

    // Sắp xếp mới nhất trước
    borrows.sort((a, b) => new Date(b.borrowDate) - new Date(a.borrowDate));

    document.getElementById('borrowsTableBody').innerHTML = borrows.length === 0
        ? '<tr><td colspan="9" class="text-center" style="padding:40px; color:var(--text-light);">Không có bản ghi nào</td></tr>'
        : borrows.map((b, i) => `
            <tr>
                <td>${i + 1}</td>
                <td>${b.userName}</td>
                <td>${b.userStudentId}</td>
                <td>${b.bookTitle}</td>
                <td>${formatDate(b.borrowDate)}</td>
                <td>${formatDate(b.dueDate)}</td>
                <td>${b.returnDate ? formatDate(b.returnDate) : '—'}</td>
                <td>${statusBadge(b.status)}</td>
                <td>
                    ${b.status === 'pending' ? `
                        <button class="btn btn-success btn-sm" onclick="handleConfirmBorrow('${b.id}')">✅ Duyệt</button>
                    ` : b.status === 'borrowing' ? `
                        <button class="btn btn-info btn-sm" onclick="handleConfirmReturn('${b.id}')">📥 Trả</button>
                    ` : '—'}
                </td>
            </tr>
        `).join('');
}

function handleConfirmBorrow(borrowId) {
    const result = Storage.confirmBorrow(borrowId);
    showToast(result.message, result.success ? 'success' : 'error');
    loadBorrows(currentBorrowTab);
    loadDashboard();
}

function handleConfirmReturn(borrowId) {
    const result = Storage.confirmReturn(borrowId);
    showToast(result.message, result.success ? 'success' : 'error');
    loadBorrows(currentBorrowTab);
    loadDashboard();
}



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
loadDashboard();
