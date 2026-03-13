/**
 * ============================================================
 * TẦNG DỮ LIỆU - LocalStorage Manager
 * ============================================================
 * Quản lý tất cả dữ liệu: Sách, Người dùng, Mượn/Trả
 * ============================================================
 */

const Storage = (() => {
    const KEYS = {
        BOOKS: 'library_books',
        USERS: 'library_users',
        BORROWS: 'library_borrows',
        CURRENT_USER: 'library_current_user'
    };

    // ========================================================
    // HELPER FUNCTIONS
    // ========================================================
    function get(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    }

    function set(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    function generateId() {
        return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // ========================================================
    // KHỞI TẠO DỮ LIỆU MẪU
    // ========================================================
    function initSampleData() {
        if (!get(KEYS.BOOKS)) {
            const sampleBooks = [
                {
                    id: generateId(), title: 'Lập Trình C Nâng Cao', author: 'Nguyễn Văn An',
                    year: 2023, genre: 'Công nghệ thông tin', quantity: 5, available: 5,
                    description: 'Cuốn sách giới thiệu các kỹ thuật lập trình C nâng cao bao gồm con trỏ, cấu trúc dữ liệu và thuật toán.'
                },
                {
                    id: generateId(), title: 'Cấu Trúc Dữ Liệu và Giải Thuật', author: 'Trần Thị Bình',
                    year: 2022, genre: 'Công nghệ thông tin', quantity: 3, available: 3,
                    description: 'Tổng quan về các cấu trúc dữ liệu cơ bản và nâng cao: mảng, danh sách liên kết, cây, đồ thị.'
                },
                {
                    id: generateId(), title: 'Toán Rời Rạc', author: 'Lê Minh Cường',
                    year: 2021, genre: 'Toán học', quantity: 4, available: 4,
                    description: 'Toán rời rạc ứng dụng trong khoa học máy tính: logic, tập hợp, quan hệ, đồ thị.'
                },
                {
                    id: generateId(), title: 'Nhập Môn Trí Tuệ Nhân Tạo', author: 'Phạm Đức Dũng',
                    year: 2024, genre: 'Công nghệ thông tin', quantity: 6, available: 6,
                    description: 'Giới thiệu các khái niệm cơ bản về AI, Machine Learning và Deep Learning.'
                },
                {
                    id: generateId(), title: 'Văn Học Việt Nam Hiện Đại', author: 'Hoàng Thị Em',
                    year: 2020, genre: 'Văn học', quantity: 2, available: 2,
                    description: 'Tổng hợp các tác phẩm văn học Việt Nam từ thế kỷ 20 đến nay.'
                },
                {
                    id: generateId(), title: 'Kinh Tế Vi Mô', author: 'Ngô Quang Phú',
                    year: 2023, genre: 'Kinh tế', quantity: 7, available: 7,
                    description: 'Nguyên lý kinh tế vi mô: cung cầu, thị trường, hành vi người tiêu dùng.'
                },
                {
                    id: generateId(), title: 'Lịch Sử Việt Nam', author: 'Đặng Văn Giang',
                    year: 2019, genre: 'Lịch sử', quantity: 3, available: 3,
                    description: 'Lịch sử Việt Nam qua các thời kỳ từ thời Hùng Vương đến hiện đại.'
                },
                {
                    id: generateId(), title: 'Hệ Điều Hành', author: 'Vũ Thị Hương',
                    year: 2022, genre: 'Công nghệ thông tin', quantity: 4, available: 4,
                    description: 'Nguyên lý hệ điều hành: tiến trình, bộ nhớ, hệ thống file, bảo mật.'
                },
                {
                    id: generateId(), title: 'Mạng Máy Tính', author: 'Bùi Quốc Khánh',
                    year: 2023, genre: 'Công nghệ thông tin', quantity: 5, available: 5,
                    description: 'Kiến trúc mạng, giao thức TCP/IP, bảo mật mạng và ứng dụng.'
                },
                {
                    id: generateId(), title: 'Tâm Lý Học Đại Cương', author: 'Mai Thị Lan',
                    year: 2021, genre: 'Tâm lý học', quantity: 3, available: 3,
                    description: 'Nhập môn tâm lý học: nhận thức, cảm xúc, hành vi, phát triển con người.'
                },
                {
                    id: generateId(), title: 'Xử Lý Chuỗi Nâng Cao', author: 'Trần Tuấn Anh',
                    year: 2025, genre: 'Công nghệ thông tin', quantity: 8, available: 8,
                    description: 'Các thuật toán xử lý chuỗi: Brute Force, KMP, Boyer-Moore, Levenshtein Distance.'
                },
                {
                    id: generateId(), title: 'Cơ Sở Dữ Liệu', author: 'Nguyễn Thị Minh',
                    year: 2022, genre: 'Công nghệ thông tin', quantity: 6, available: 6,
                    description: 'Mô hình quan hệ, SQL, thiết kế CSDL, chuẩn hóa dữ liệu.'
                }
            ];
            set(KEYS.BOOKS, sampleBooks);
        }

        if (!get(KEYS.USERS)) {
            const sampleUsers = [
                {
                    id: generateId(), username: 'admin', password: 'admin123',
                    fullName: 'Quản Trị Viên', email: 'admin@library.edu.vn',
                    studentId: 'ADMIN001', role: 'admin', active: true,
                    createdAt: new Date().toISOString()
                },
                {
                    id: generateId(), username: 'SV2024001', password: '123',
                    fullName: 'Nguyễn Tuấn Anh', email: 'tuananh@tnut.edu.vn',
                    studentId: 'SV2024001', role: 'user', active: true,
                    createdAt: new Date().toISOString()
                },
                {
                    id: generateId(), username: 'SV2024002', password: '123',
                    fullName: 'Trần Lam Sơn', email: 'lamson@tnut.edu.vn',
                    studentId: 'SV2024002', role: 'user', active: true,
                    createdAt: new Date().toISOString()
                },
                {
                    id: generateId(), username: 'SV2024003', password: '123',
                    fullName: 'Lê Thùy Linh', email: 'thuylinh@tnut.edu.vn',
                    studentId: 'SV2024003', role: 'user', active: true,
                    createdAt: new Date().toISOString()
                }
            ];
            set(KEYS.USERS, sampleUsers);
        }

        if (!get(KEYS.BORROWS)) {
            set(KEYS.BORROWS, []);
        }
    }

    // ========================================================
    // SÁCH - CRUD
    // ========================================================
    function getBooks() {
        return get(KEYS.BOOKS) || [];
    }

    function getBookById(id) {
        return getBooks().find(b => b.id === id);
    }

    function addBook(book) {
        const books = getBooks();
        book.id = generateId();
        book.quantity = parseInt(book.quantity) || 0;
        book.available = book.quantity;
        book.year = parseInt(book.year) || new Date().getFullYear();
        books.push(book);
        set(KEYS.BOOKS, books);
        return book;
    }

    function updateBook(id, updates) {
        const books = getBooks();
        const index = books.findIndex(b => b.id === id);
        if (index === -1) return null;
        books[index] = { ...books[index], ...updates };
        set(KEYS.BOOKS, books);
        return books[index];
    }

    function deleteBook(id) {
        const books = getBooks();
        const filtered = books.filter(b => b.id !== id);
        set(KEYS.BOOKS, filtered);
        return filtered.length < books.length;
    }

    function getGenres() {
        const books = getBooks();
        const genres = new Set(books.map(b => b.genre));
        return [...genres].sort();
    }

    // ========================================================
    // NGƯỜI DÙNG - CRUD
    // ========================================================
    function getUsers() {
        return get(KEYS.USERS) || [];
    }

    function getUserById(id) {
        return getUsers().find(u => u.id === id);
    }

    function getUserByUsername(username) {
        return getUsers().find(u => u.username === username);
    }

    /**
     * Tìm user theo MSSV hoặc username
     */
    function getUserByStudentId(studentId) {
        return getUsers().find(u => u.studentId === studentId);
    }

    function addUser(user) {
        const users = getUsers();
        // Kiểm tra trùng MSSV (username = MSSV)
        if (users.find(u => u.studentId === user.studentId)) return null;
        user.id = generateId();
        user.username = user.studentId; // MSSV là tài khoản đăng nhập
        user.password = user.password || '123'; // Mật khẩu mặc định
        user.role = user.role || 'user';
        user.active = true;
        user.createdAt = new Date().toISOString();
        users.push(user);
        set(KEYS.USERS, users);
        return user;
    }

    /**
     * Import danh sách sinh viên từ dữ liệu Excel (đã parse thành mảng object)
     * Mỗi object cần có: MSSV, HoTen, Email (tùy chọn)
     * Mật khẩu mặc định: 123
     * @param {Array} data - Mảng đối tượng từ Excel
     * @returns {object} { added: number, skipped: number, errors: string[] }
     */
    function importUsersFromData(data) {
        const users = getUsers();
        let added = 0, skipped = 0;
        const errors = [];

        // Tự động phát hiện tên cột từ row đầu tiên
        const columnMap = detectColumns(data[0] || {});

        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            const mssv = getColumnValue(row, columnMap.mssv);
            const hoTen = getColumnValue(row, columnMap.hoTen);
            const email = getColumnValue(row, columnMap.email);

            if (!mssv) {
                errors.push(`Dòng ${i + 2}: Thiếu MSSV`);
                continue;
            }
            if (!hoTen) {
                errors.push(`Dòng ${i + 2}: Thiếu Họ tên (MSSV: ${mssv})`);
                continue;
            }

            // Kiểm tra trùng
            if (users.find(u => u.studentId === mssv)) {
                skipped++;
                continue;
            }

            users.push({
                id: generateId(),
                username: mssv,
                password: '123',
                fullName: hoTen,
                email: email || mssv.toLowerCase() + '@tnut.edu.vn',
                studentId: mssv,
                role: 'user',
                active: true,
                createdAt: new Date().toISOString()
            });
            added++;
        }

        set(KEYS.USERS, users);
        return { added, skipped, errors };
    }

    /**
     * Tự động phát hiện tên cột trong dữ liệu Excel
     * Chuẩn hóa tên cột (bỏ dấu, lowercase, bỏ khoảng trắng/ký tự đặc biệt)
     * rồi so khớp với các pattern đã biết
     */
    function detectColumns(sampleRow) {
        const keys = Object.keys(sampleRow);
        const result = { mssv: null, hoTen: null, email: null };

        // Bảng bỏ dấu tiếng Việt cho tên cột
        function normalizeKey(str) {
            return str.toLowerCase()
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                .replace(/đ/g, 'd').replace(/Đ/g, 'D')
                .replace(/[^a-z0-9]/g, '');
        }

        const mssvPatterns = ['mssv', 'masv', 'masvien', 'masinhvien', 'studentid', 'stt', 'maso', 'msv'];
        const namePatterns = ['hoten', 'hovaten', 'hovatten', 'fullname', 'ten', 'name', 'tensv', 'tensinhvien'];
        const emailPatterns = ['email', 'mail', 'emailsv'];

        for (const key of keys) {
            const nk = normalizeKey(key);

            if (!result.mssv && mssvPatterns.some(p => nk === p || nk.includes(p))) {
                result.mssv = key;
            }
            if (!result.hoTen && namePatterns.some(p => nk === p || nk.includes(p))) {
                result.hoTen = key;
            }
            if (!result.email && emailPatterns.some(p => nk === p || nk.includes(p))) {
                result.email = key;
            }
        }

        // Fallback: nếu không tìm được, thử dùng cột đầu tiên = MSSV, cột 2 = HoTen
        if (!result.mssv && keys.length >= 1) result.mssv = keys[0];
        if (!result.hoTen && keys.length >= 2) result.hoTen = keys[1];
        if (!result.email && keys.length >= 3) result.email = keys[2];

        return result;
    }

    /**
     * Lấy giá trị từ row theo tên cột đã phát hiện
     */
    function getColumnValue(row, colName) {
        if (!colName) return '';
        const val = row[colName];
        if (val === undefined || val === null) return '';
        return val.toString().trim();
    }

    /**
     * Xóa toàn bộ sinh viên (giữ lại admin)
     */
    function clearStudents() {
        const users = getUsers().filter(u => u.role === 'admin');
        set(KEYS.USERS, users);
        return users.length;
    }

    function updateUser(id, updates) {
        const users = getUsers();
        const index = users.findIndex(u => u.id === id);
        if (index === -1) return null;
        users[index] = { ...users[index], ...updates };
        set(KEYS.USERS, users);
        return users[index];
    }

    function toggleUserActive(id) {
        const users = getUsers();
        const index = users.findIndex(u => u.id === id);
        if (index === -1) return null;
        users[index].active = !users[index].active;
        set(KEYS.USERS, users);
        return users[index];
    }

    // ========================================================
    // ĐĂNG NHẬP
    // ========================================================
    /**
     * Đăng nhập bằng MSSV hoặc username (admin)
     * Sinh viên đăng nhập bằng MSSV, mật khẩu mặc định: 123
     */
    function login(loginId, password) {
        // Tìm theo username (cho admin) hoặc theo MSSV (cho sinh viên)
        let user = getUserByUsername(loginId);
        if (!user) user = getUserByStudentId(loginId);
        if (!user) return { success: false, message: 'Tài khoản không tồn tại! Kiểm tra lại MSSV.' };
        if (!user.active) return { success: false, message: 'Tài khoản đã bị khóa! Liên hệ admin.' };
        if (user.password !== password) return { success: false, message: 'Mật khẩu không đúng!' };
        set(KEYS.CURRENT_USER, user);
        return { success: true, user };
    }

    function logout() {
        localStorage.removeItem(KEYS.CURRENT_USER);
    }

    function getCurrentUser() {
        return get(KEYS.CURRENT_USER);
    }

    function changePassword(userId, oldPass, newPass) {
        const users = getUsers();
        const index = users.findIndex(u => u.id === userId);
        if (index === -1) return { success: false, message: 'Không tìm thấy người dùng!' };
        if (users[index].password !== oldPass) return { success: false, message: 'Mật khẩu cũ không đúng!' };
        users[index].password = newPass;
        set(KEYS.USERS, users);
        set(KEYS.CURRENT_USER, users[index]);
        return { success: true, message: 'Đổi mật khẩu thành công!' };
    }

    // ========================================================
    // MƯỢN - TRẢ SÁCH
    // ========================================================
    function getBorrows() {
        return get(KEYS.BORROWS) || [];
    }

    function getBorrowsByUser(userId) {
        return getBorrows().filter(b => b.userId === userId);
    }

    function getActiveBorrows() {
        return getBorrows().filter(b => b.status === 'borrowing');
    }

    function borrowBook(userId, bookId) {
        const books = getBooks();
        const bookIndex = books.findIndex(b => b.id === bookId);
        if (bookIndex === -1) return { success: false, message: 'Sách không tồn tại!' };
        if (books[bookIndex].available <= 0) return { success: false, message: 'Sách đã hết!' };

        // Kiểm tra đã mượn chưa
        const borrows = getBorrows();
        const existing = borrows.find(b => b.userId === userId && b.bookId === bookId && b.status === 'borrowing');
        if (existing) return { success: false, message: 'Bạn đã mượn sách này rồi!' };

        const user = getUserById(userId);
        const borrow = {
            id: generateId(),
            userId,
            bookId,
            userName: user ? user.fullName : 'N/A',
            userStudentId: user ? user.studentId : 'N/A',
            bookTitle: books[bookIndex].title,
            borrowDate: new Date().toISOString(),
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 ngày
            returnDate: null,
            status: 'pending' // pending -> borrowing -> returned
        };

        borrows.push(borrow);
        set(KEYS.BORROWS, borrows);

        return { success: true, borrow, message: 'Gửi yêu cầu mượn sách thành công! Chờ admin xác nhận.' };
    }

    function confirmBorrow(borrowId) {
        const borrows = getBorrows();
        const index = borrows.findIndex(b => b.id === borrowId);
        if (index === -1) return { success: false, message: 'Không tìm thấy yêu cầu!' };

        const books = getBooks();
        const bookIndex = books.findIndex(b => b.id === borrows[index].bookId);
        if (bookIndex === -1) return { success: false, message: 'Sách không tồn tại!' };
        if (books[bookIndex].available <= 0) return { success: false, message: 'Sách đã hết!' };

        borrows[index].status = 'borrowing';
        borrows[index].borrowDate = new Date().toISOString();
        borrows[index].dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

        books[bookIndex].available--;

        set(KEYS.BORROWS, borrows);
        set(KEYS.BOOKS, books);

        return { success: true, message: 'Xác nhận mượn sách thành công!' };
    }

    function confirmReturn(borrowId) {
        const borrows = getBorrows();
        const index = borrows.findIndex(b => b.id === borrowId);
        if (index === -1) return { success: false, message: 'Không tìm thấy bản ghi!' };

        const books = getBooks();
        const bookIndex = books.findIndex(b => b.id === borrows[index].bookId);

        borrows[index].status = 'returned';
        borrows[index].returnDate = new Date().toISOString();

        if (bookIndex !== -1) {
            books[bookIndex].available++;
            set(KEYS.BOOKS, books);
        }

        set(KEYS.BORROWS, borrows);

        return { success: true, message: 'Xác nhận trả sách thành công!' };
    }

    // ========================================================
    // TÌM KIẾM NÂNG CAO (Sử dụng StringAlgorithms)
    // ========================================================
    /**
     * Tìm kiếm sách sử dụng Levenshtein Distance + Chuẩn hóa chuỗi
     * @param {string} query - Từ khóa
     * @param {string} searchBy - 'title' | 'author' | 'genre' | 'all'
     */
    function searchBooks(query, searchBy = 'all') {
        if (!query || !query.trim()) return { results: getBooks(), stats: null };

        const books = getBooks();
        const results = [];
        const startTime = performance.now();

        for (const book of books) {
            let fields = [];
            if (searchBy === 'title' || searchBy === 'all') fields.push(book.title);
            if (searchBy === 'author' || searchBy === 'all') fields.push(book.author);
            if (searchBy === 'genre' || searchBy === 'all') fields.push(book.genre);
            if (searchBy === 'all') fields.push(book.description || '');

            let found = false;
            let bestDistance = Infinity;
            for (const field of fields) {
                const match = StringAlgorithms.matchField(field, query);
                if (match.found) {
                    found = true;
                    if (match.distance < bestDistance) bestDistance = match.distance;
                    break;
                }
            }

            if (found) {
                results.push({ ...book, _distance: bestDistance });
            }
        }

        // Sắp xếp: exact match (distance=0) lên trước, sau đó theo distance tăng dần
        results.sort((a, b) => a._distance - b._distance);

        const elapsed = performance.now() - startTime;

        return {
            results,
            stats: {
                algorithm: 'Levenshtein + Chuẩn hóa',
                time: elapsed.toFixed(4) + 'ms',
                found: results.length
            }
        };
    }

    /**
     * Tìm kiếm người dùng sử dụng Levenshtein + Chuẩn hóa chuỗi
     */
    function searchUsers(query, searchBy = 'all') {
        if (!query || !query.trim()) return getUsers().filter(u => u.role !== 'admin');

        const users = getUsers().filter(u => u.role !== 'admin');
        return users.filter(u => {
            let fields = [];
            if (searchBy === 'name' || searchBy === 'all') fields.push(u.fullName);
            if (searchBy === 'studentId' || searchBy === 'all') fields.push(u.studentId);
            if (searchBy === 'email' || searchBy === 'all') fields.push(u.email);

            return fields.some(field => {
                const match = StringAlgorithms.matchField(field, query);
                return match.found;
            });
        });
    }

    // ========================================================
    // PUBLIC API
    // ========================================================
    return {
        initSampleData,
        // Sách
        getBooks, getBookById, addBook, updateBook, deleteBook, getGenres,
        // Người dùng
        getUsers, getUserById, getUserByUsername, getUserByStudentId,
        addUser, updateUser, toggleUserActive, importUsersFromData, clearStudents,
        // Auth
        login, logout, getCurrentUser, changePassword,
        // Mượn trả
        getBorrows, getBorrowsByUser, getActiveBorrows,
        borrowBook, confirmBorrow, confirmReturn,
        // Tìm kiếm
        searchBooks, searchUsers,
        // Utils
        generateId, detectColumns, getColumnValue
    };
})();

// Khởi tạo dữ liệu khi load
Storage.initSampleData();
