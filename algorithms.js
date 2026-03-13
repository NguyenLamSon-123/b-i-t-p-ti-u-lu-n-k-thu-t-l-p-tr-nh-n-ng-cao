/**
 * ============================================================
 * THƯ VIỆN THUẬT TOÁN XỬ LÝ CHUỖI
 * ============================================================
 * Bao gồm: Chuẩn hóa chuỗi (bỏ dấu tiếng Việt) và
 * Levenshtein Distance (tìm kiếm gần đúng)
 * ============================================================
 */

const StringAlgorithms = (() => {

    // ========================================================
    // 1. CHUẨN HÓA CHUỖI (Lowercase + Bỏ dấu tiếng Việt)
    // ========================================================
    const vietnameseMap = {
        'à': 'a', 'á': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a',
        'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
        'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a',
        'đ': 'd',
        'è': 'e', 'é': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e',
        'ê': 'e', 'ề': 'e', 'ế': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e',
        'ì': 'i', 'í': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
        'ò': 'o', 'ó': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o',
        'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o',
        'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o',
        'ù': 'u', 'ú': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
        'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u',
        'ỳ': 'y', 'ý': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y'
    };

    /**
     * Chuẩn hóa chuỗi: chuyển thường + bỏ dấu tiếng Việt
     * Dùng để so sánh chuỗi không phân biệt dấu và hoa/thường
     * @param {string} str
     * @returns {string}
     */
    function normalize(str) {
        if (!str) return '';
        let result = str.toLowerCase();
        let normalized = '';
        for (let i = 0; i < result.length; i++) {
            const ch = result[i];
            normalized += vietnameseMap[ch] || ch;
        }
        return normalized.trim();
    }

    // ========================================================
    // 2. LEVENSHTEIN DISTANCE (Tìm kiếm gần đúng - QHĐ)
    // ========================================================
    /**
     * Tính khoảng cách Levenshtein giữa 2 chuỗi
     * Sử dụng quy hoạch động (Dynamic Programming)
     * Độ phức tạp: O(m * n) với m, n là độ dài 2 chuỗi
     *
     * Khoảng cách Levenshtein = số phép biến đổi tối thiểu
     * (thêm, xóa, thay thế ký tự) để biến chuỗi a thành chuỗi b
     *
     * @param {string} a - Chuỗi nguồn
     * @param {string} b - Chuỗi đích
     * @returns {number} Khoảng cách Levenshtein
     */
    function levenshteinDistance(a, b) {
        const s1 = normalize(a);
        const s2 = normalize(b);
        const m = s1.length;
        const n = s2.length;

        // Tối ưu bộ nhớ: dùng 2 mảng 1 chiều thay vì ma trận 2D
        let prev = new Array(n + 1);
        let curr = new Array(n + 1);

        // Khởi tạo hàng đầu: khoảng cách từ chuỗi rỗng đến s2[0..j]
        for (let j = 0; j <= n; j++) prev[j] = j;

        for (let i = 1; i <= m; i++) {
            curr[0] = i; // khoảng cách từ s1[0..i] đến chuỗi rỗng
            for (let j = 1; j <= n; j++) {
                if (s1[i - 1] === s2[j - 1]) {
                    // Ký tự giống nhau → không cần phép biến đổi
                    curr[j] = prev[j - 1];
                } else {
                    // Lấy min của 3 phép: xóa, thêm, thay thế
                    curr[j] = 1 + Math.min(prev[j], curr[j - 1], prev[j - 1]);
                }
            }
            [prev, curr] = [curr, prev];
        }

        return prev[n];
    }

    /**
     * Tìm kiếm gần đúng (Fuzzy Search) dựa trên Levenshtein Distance
     * Kết hợp chuẩn hóa chuỗi + khoảng cách chỉnh sửa
     *
     * Thuật toán:
     * 1. Chuẩn hóa cả query và candidate (bỏ dấu, chuyển thường)
     * 2. Nếu candidate chứa query (exact substring) → distance = 0
     * 3. Ngược lại, tính Levenshtein distance
     * 4. So sánh với ngưỡng (threshold) để quyết định khớp hay không
     *
     * @param {string} query - Từ khóa tìm kiếm
     * @param {string[]} candidates - Danh sách chuỗi ứng viên
     * @param {number} maxDistance - Khoảng cách tối đa chấp nhận (mặc định: 3)
     * @returns {Array<{text: string, distance: number}>} Kết quả sắp xếp theo khoảng cách tăng dần
     */
    function fuzzySearch(query, candidates, maxDistance = 3) {
        const results = [];
        const normalizedQuery = normalize(query);

        for (const candidate of candidates) {
            const normalizedCandidate = normalize(candidate);

            // Ưu tiên: kiểm tra exact substring match trước (distance = 0)
            if (normalizedCandidate.includes(normalizedQuery)) {
                results.push({ text: candidate, distance: 0 });
                continue;
            }

            // Tính Levenshtein distance giữa query và candidate
            const dist = levenshteinDistance(query, candidate);
            // Ngưỡng chấp nhận: không vượt quá maxDistance
            const threshold = Math.min(maxDistance, Math.floor(normalizedCandidate.length / 2));
            if (dist <= Math.max(threshold, maxDistance)) {
                results.push({ text: candidate, distance: dist });
            }
        }

        // Sắp xếp kết quả theo khoảng cách tăng dần (gần đúng nhất lên trước)
        results.sort((a, b) => a.distance - b.distance);
        return results;
    }

    /**
     * Kiểm tra 1 chuỗi có khớp (gần đúng) với query không
     * Dùng Levenshtein + chuẩn hóa chuỗi
     *
     * @param {string} field - Chuỗi cần kiểm tra (VD: tên sách, tác giả)
     * @param {string} query - Từ khóa tìm kiếm
     * @param {number} maxDistance - Ngưỡng khoảng cách tối đa
     * @returns {{found: boolean, distance: number}}
     */
    function matchField(field, query, maxDistance = 2) {
        const normalizedField = normalize(field);
        const normalizedQuery = normalize(query);

        // 1. Exact substring match (sau khi chuẩn hóa)
        if (normalizedField.includes(normalizedQuery)) {
            return { found: true, distance: 0 };
        }

        // 2. Tách các từ trong field, so sánh Levenshtein từng từ với query
        const words = normalizedField.split(/\s+/);
        let minDist = Infinity;
        for (const word of words) {
            const dist = levenshteinDistance(word, query);
            if (dist < minDist) minDist = dist;
        }

        // Ngưỡng linh hoạt theo độ dài query
        const threshold = Math.max(maxDistance, Math.floor(normalizedQuery.length * 0.35));
        if (minDist <= threshold) {
            return { found: true, distance: minDist };
        }

        // 3. Levenshtein toàn chuỗi (cho trường hợp query dài)
        const fullDist = levenshteinDistance(field, query);
        const fullThreshold = Math.floor(normalizedQuery.length * 0.4);
        if (fullDist <= fullThreshold) {
            return { found: true, distance: fullDist };
        }

        return { found: false, distance: minDist };
    }

    // ========================================================
    // 3. SẮP XẾP CHUỖI (dùng chuẩn hóa để so sánh)
    // ========================================================
    /**
     * Sắp xếp mảng chuỗi theo thứ tự A-Z (có hỗ trợ tiếng Việt)
     * @param {string[]} arr
     * @param {boolean} ascending - true = A-Z, false = Z-A
     * @returns {string[]}
     */
    function sortStrings(arr, ascending = true) {
        return [...arr].sort((a, b) => {
            const na = normalize(a);
            const nb = normalize(b);
            const cmp = na.localeCompare(nb);
            return ascending ? cmp : -cmp;
        });
    }

    /**
     * Sắp xếp mảng đối tượng theo thuộc tính chuỗi
     * @param {Array} arr - Mảng đối tượng
     * @param {string} key - Tên thuộc tính
     * @param {boolean} ascending
     * @returns {Array}
     */
    function sortObjectsByStringKey(arr, key, ascending = true) {
        return [...arr].sort((a, b) => {
            const na = normalize(a[key] || '');
            const nb = normalize(b[key] || '');
            const cmp = na.localeCompare(nb);
            return ascending ? cmp : -cmp;
        });
    }

    /**
     * Sắp xếp mảng đối tượng theo thuộc tính số
     * @param {Array} arr
     * @param {string} key
     * @param {boolean} ascending
     * @returns {Array}
     */
    function sortObjectsByNumericKey(arr, key, ascending = true) {
        return [...arr].sort((a, b) => {
            const diff = (a[key] || 0) - (b[key] || 0);
            return ascending ? diff : -diff;
        });
    }

    // ========================================================
    // PUBLIC API
    // ========================================================
    return {
        normalize,
        levenshteinDistance,
        fuzzySearch,
        matchField,
        sortStrings,
        sortObjectsByStringKey,
        sortObjectsByNumericKey
    };

})();
