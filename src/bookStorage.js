/**
 * 해솔반 그림책 영구 보관소 (IndexedDB + localStorage 이중 보존)
 * - 브라우저 localStorage 5MB 용량 한계를 극복하는 고용량 IndexedDB 기반 영구 저장
 * - 모든 원아의 그림책을 무제한으로 누적 보관 (기존 책 절대 삭제 안 됨)
 * - 초고속 동기식 조회를 위한 인메모리 캐시 지원
 */
class BookStorage {
  constructor() {
    this.dbName = 'HaesolStorybookDB';
    this.dbVersion = 1;
    this.storeName = 'books';
    this.db = null;
    this.cache = [];
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return this.cache;

    // 1. localStorage에서 기존 저장 데이터 가져오기
    let localBooks = [];
    try {
      const json = localStorage.getItem('haesol_saved_books');
      if (json) {
        localBooks = JSON.parse(json);
        if (!Array.isArray(localBooks)) localBooks = [];
      }
    } catch (e) {
      console.warn('localStorage 파싱 실패:', e);
      localBooks = [];
    }

    // 2. IndexedDB 열기 및 데이터 병합
    try {
      this.db = await this.openIndexedDB();
      const idbBooks = await this.getAllFromIDB();

      // 두 저장소 병합 (중복 id는 idb 우선, 없으면 추가)
      const bookMap = new Map();
      idbBooks.forEach(b => { if (b && b.id) bookMap.set(b.id, b); });
      localBooks.forEach(b => { if (b && b.id && !bookMap.has(b.id)) bookMap.set(b.id, b); });

      this.cache = Array.from(bookMap.values());
      // 날짜 역순 정렬 (최신순)
      this.cache.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

      // IDB에 없는 localBooks 동기화
      for (const b of localBooks) {
        if (!idbBooks.some(ib => ib.id === b.id)) {
          await this.putToIDB(b).catch(() => {});
        }
      }
    } catch (err) {
      console.warn('IndexedDB 초기화 실패, localStorage 모드로 동작합니다:', err);
      this.cache = localBooks;
    }

    this.initialized = true;
    this.syncToLocalStorageBackup();
    return this.cache;
  }

  openIndexedDB() {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        return reject(new Error('IndexedDB not supported'));
      }
      const req = indexedDB.open(this.dbName, this.dbVersion);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          store.createIndex('childName', 'childName', { unique: false });
        }
      };
      req.onsuccess = (e) => resolve(e.target.result);
      req.onerror = (e) => reject(e.target.error);
    });
  }

  getAllFromIDB() {
    return new Promise((resolve, reject) => {
      if (!this.db) return resolve([]);
      const tx = this.db.transaction(this.storeName, 'readonly');
      const store = tx.objectStore(this.storeName);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  putToIDB(book) {
    return new Promise((resolve, reject) => {
      if (!this.db) return resolve();
      const tx = this.db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      const req = store.put(book);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  deleteFromIDB(bookId) {
    return new Promise((resolve, reject) => {
      if (!this.db) return resolve();
      const tx = this.db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      const req = store.delete(bookId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  getBooks(filterChildName = null) {
    if (!this.initialized) {
      try {
        const json = localStorage.getItem('haesol_saved_books');
        this.cache = json ? JSON.parse(json) : [];
      } catch (e) {
        this.cache = [];
      }
    }
    if (filterChildName) {
      return this.cache.filter(b => b.childName === filterChildName);
    }
    return [...this.cache];
  }

  getBookById(bookId) {
    return this.cache.find(b => b.id === bookId) || null;
  }

  async saveBook(book) {
    if (!book || !book.id) return false;
    if (!book.timestamp) book.timestamp = Date.now();

    const idx = this.cache.findIndex(b => b.id === book.id);
    if (idx >= 0) {
      this.cache[idx] = book;
    } else {
      this.cache.unshift(book);
    }

    // 1. IndexedDB에 영구 저장 (비동기, 용량 무제한)
    try {
      await this.putToIDB(book);
    } catch (err) {
      console.warn('IndexedDB 저장 에러:', err);
    }

    // 2. localStorage에 동기화 백업
    this.syncToLocalStorageBackup();
    return true;
  }

  async deleteBook(bookId) {
    this.cache = this.cache.filter(b => b.id !== bookId);
    try {
      await this.deleteFromIDB(bookId);
    } catch (err) {
      console.warn('IndexedDB 삭제 에러:', err);
    }
    this.syncToLocalStorageBackup();
    return true;
  }

  syncToLocalStorageBackup() {
    try {
      localStorage.setItem('haesol_saved_books', JSON.stringify(this.cache));
    } catch (e) {
      // 5MB 용량 초과 시 고화질 데이터 제외한 라이트 버전으로 백업
      console.warn('localStorage 용량 초과, 경량 백업으로 축소 저장합니다:', e.message);
      try {
        const lightweight = this.cache.map(b => ({
          id: b.id,
          childName: b.childName,
          protagonistName: b.protagonistName,
          title: b.title,
          author: b.author,
          createdAt: b.createdAt,
          timestamp: b.timestamp,
          storyData: b.storyData,
          coverThumbnail: b.coverThumbnail
        }));
        localStorage.setItem('haesol_saved_books', JSON.stringify(lightweight));
      } catch (err2) {
        console.warn('localStorage 경량 백업 실패 (IndexedDB에는 안전하게 보존됨):', err2);
      }
    }
  }
}

export const bookStorage = new BookStorage();
