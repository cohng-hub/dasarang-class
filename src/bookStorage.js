/**
 * 해솔반 그림책 영구 보관소 (서버 동기화 + IndexedDB + localStorage 삼중 보존)
 * - 어떤 기기(스마트폰 A, 스마트폰 B, 노트북 C)에서 접속해도 모든 완성본 그림책 실시간 공유
 * - 어떤 기기에서 삭제하더라도 모든 기기에서 즉시 동일하게 삭제되도록 실시간 툼스톤(삭제 동기화) 지원
 * - 서버 영구 보관 (/api/books) + 오프라인 즉시 로딩을 위한 브라우저 캐시 지원
 * - 모든 원아의 그림책을 무제한으로 누적 보관
 */
class BookStorage {
  constructor() {
    this.dbName = 'HaesolStorybookDB';
    this.dbVersion = 1;
    this.storeName = 'books';
    this.db = null;
    this.cache = [];
    this.deletedIds = new Set();
    this.initialized = false;
    this.isSyncing = false;
  }

  getApiUrl(path = '/api/books') {
    return path;
  }

  saveDeletedIdsToLocal() {
    try {
      localStorage.setItem('haesol_deleted_book_ids', JSON.stringify(Array.from(this.deletedIds)));
    } catch (e) {}
  }

  async init() {
    if (this.initialized) return this.cache;

    // 0. 로컬 저장된 삭제 목록(툼스톤) 불러오기
    try {
      const dJson = localStorage.getItem('haesol_deleted_book_ids');
      if (dJson) {
        const arr = JSON.parse(dJson);
        if (Array.isArray(arr)) {
          arr.forEach(id => { if (id) this.deletedIds.add(id); });
        }
      }
    } catch (e) {
      console.warn('haesol_deleted_book_ids 로드 실패:', e);
    }

    // 1. localStorage에서 기존 저장 데이터 가져오기 (0초 즉각 렌더링)
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

    // 삭제된 책은 제외
    localBooks = localBooks.filter(b => b && b.id && !this.deletedIds.has(b.id));

    // 2. IndexedDB 열기 및 데이터 병합
    try {
      this.db = await this.openIndexedDB();
      const idbBooks = await this.getAllFromIDB();

      const bookMap = new Map();
      idbBooks.forEach(b => {
        if (b && b.id) {
          if (this.deletedIds.has(b.id)) {
            this.deleteFromIDB(b.id).catch(() => {});
          } else {
            bookMap.set(b.id, b);
          }
        }
      });
      localBooks.forEach(b => {
        if (b && b.id && !this.deletedIds.has(b.id) && !bookMap.has(b.id)) {
          bookMap.set(b.id, b);
        }
      });

      this.cache = Array.from(bookMap.values());
      this.cache.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    } catch (err) {
      console.warn('IndexedDB 초기화 실패, localStorage 모드로 동작합니다:', err);
      this.cache = localBooks;
    }

    this.initialized = true;

    // 3. 서버와 실시간 양방향 동기화 (모든 기기 공통 보관소 연동)
    this.syncWithServer().catch(err => {
      console.warn('초기 서버 동기화 건너뜀 (오프라인 모드):', err);
    });

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

  /**
   * 서버(/api/books)와 양방향 실시간 동기화
   * - 다른 기기에서 생성된 그림책들을 모두 가져와 로컬에 반영
   * - 다른 기기에서 삭제된 그림책(툼스톤)을 감지하여 로컬에서도 완전 제거
   * - 로컬에만 있고 서버에 아직 없는 그림책은 서버로 자동 백업 (삭제된 책 제외)
   * - 반환값: 변경 사항 발생 여부 (true/false)
   */
  async syncWithServer() {
    if (this.isSyncing) return false;
    this.isSyncing = true;

    let hasChanges = false;
    const prevIds = new Set(this.cache.map(b => b.id));

    try {
      const endpoints = ['/api/books', 'http://127.0.0.1:8000/api/books'];
      let responseData = null;

      for (const ep of endpoints) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 6000);
          const res = await fetch(ep, {
            signal: controller.signal,
            headers: { 'ngrok-skip-browser-warning': 'true' }
          });
          clearTimeout(timeoutId);
          if (res.ok) {
            responseData = await res.json();
            break;
          }
        } catch (e) {
          // 다음 엔드포인트 시도
        }
      }

      if (responseData) {
        let serverBooks = [];
        let serverDeletedIds = [];

        if (Array.isArray(responseData)) {
          serverBooks = responseData;
        } else if (responseData && typeof responseData === 'object') {
          serverBooks = Array.isArray(responseData.books) ? responseData.books : [];
          serverDeletedIds = Array.isArray(responseData.deleted_ids) ? responseData.deleted_ids : [];
        }

        // 1. 서버 삭제 목록 병합
        serverDeletedIds.forEach(id => {
          if (id) this.deletedIds.add(id);
        });
        this.saveDeletedIdsToLocal();

        // 2. 삭제된 책들은 IDB 및 캐시에서 철저히 제거
        for (const delId of this.deletedIds) {
          await this.deleteFromIDB(delId).catch(() => {});
        }

        const bookMap = new Map();

        // 3. 서버 책들을 맵에 등록 (삭제 목록에 있는 것은 제외)
        serverBooks.forEach(b => {
          if (b && b.id && !this.deletedIds.has(b.id)) {
            bookMap.set(b.id, b);
          }
        });

        // 4. 로컬에만 있는 책이 있다면 서버로 업로드 (삭제된 책 제외!)
        const localOnlyBooks = [];
        this.cache.forEach(localB => {
          if (localB && localB.id && !this.deletedIds.has(localB.id) && !bookMap.has(localB.id)) {
            bookMap.set(localB.id, localB);
            localOnlyBooks.push(localB);
          }
        });

        // 로컬 전용 책 비동기 업로드
        for (const b of localOnlyBooks) {
          this.uploadBookToServer(b).catch(() => {});
        }

        // 5. 통합 캐시 생성 및 최신순 정렬
        const newCache = Array.from(bookMap.values()).filter(b => b && b.id && !this.deletedIds.has(b.id));
        newCache.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

        // 변경 사항 여부 확인 (개수나 구성 ID가 달라졌는지 확인)
        if (newCache.length !== prevIds.size || newCache.some(b => !prevIds.has(b.id))) {
          hasChanges = true;
        }

        this.cache = newCache;

        // 6. 로컬 IDB 및 localStorage 동기화
        for (const b of this.cache) {
          await this.putToIDB(b).catch(() => {});
        }
        this.syncToLocalStorageBackup();
      }
    } catch (err) {
      console.warn('서버 보관함 동기화 실패 (로컬 데이터 유지):', err);
    } finally {
      this.isSyncing = false;
    }

    return hasChanges;
  }

  async uploadBookToServer(book) {
    if (!book || !book.id || this.deletedIds.has(book.id)) return;
    const endpoints = ['/api/books', 'http://127.0.0.1:8000/api/books'];
    for (const ep of endpoints) {
      try {
        const res = await fetch(ep, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
          },
          body: JSON.stringify(book)
        });
        if (res.ok) return true;
      } catch (e) {}
    }
    return false;
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
    const activeBooks = this.cache.filter(b => b && b.id && !this.deletedIds.has(b.id));
    if (filterChildName) {
      return activeBooks.filter(b => b.childName === filterChildName);
    }
    return [...activeBooks];
  }

  getBookById(bookId) {
    if (!bookId || this.deletedIds.has(bookId)) return null;
    return this.cache.find(b => b.id === bookId) || null;
  }

  async saveBook(book) {
    if (!book || !book.id) return false;
    if (!book.timestamp) book.timestamp = Date.now();

    // 만약 과거 삭제 목록에 있던 ID라면 삭제 목록에서 해제 (사용자가 다시 저장하는 경우)
    if (this.deletedIds.has(book.id)) {
      this.deletedIds.delete(book.id);
      this.saveDeletedIdsToLocal();
    }

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

    // 3. 서버에 즉시 전송하여 다른 기기(스마트폰 B, 노트북 C)에서도 즉시 보이도록 반영
    this.uploadBookToServer(book).catch(e => {
      console.warn('서버 저장 실패 (로컬에는 안전하게 보존됨):', e);
    });

    return true;
  }

  async deleteBook(bookId) {
    if (!bookId) return false;

    // 1. 삭제 목록(툼스톤)에 즉시 등록하여 다른 기기나 로컬에서 재업로드/재출현 방지
    this.deletedIds.add(bookId);
    this.saveDeletedIdsToLocal();

    // 2. 캐시에서 즉시 제거
    this.cache = this.cache.filter(b => b && b.id !== bookId);

    // 3. IndexedDB에서 영구 제거
    try {
      await this.deleteFromIDB(bookId);
    } catch (err) {
      console.warn('IndexedDB 삭제 에러:', err);
    }

    // 4. localStorage 동기화
    this.syncToLocalStorageBackup();

    // 5. 서버에서도 영구 삭제 및 툼스톤 등록
    const endpoints = [`/api/books/${bookId}`, `http://127.0.0.1:8000/api/books/${bookId}`];
    for (const ep of endpoints) {
      try {
        const res = await fetch(ep, {
          method: 'DELETE',
          headers: { 'ngrok-skip-browser-warning': 'true' }
        });
        if (res.ok) break;
      } catch (e) {}
    }

    return true;
  }

  syncToLocalStorageBackup() {
    try {
      const activeCache = this.cache.filter(b => b && b.id && !this.deletedIds.has(b.id));
      localStorage.setItem('haesol_saved_books', JSON.stringify(activeCache));
    } catch (e) {
      console.warn('localStorage 용량 초과, 경량 백업으로 축소 저장합니다:', e.message);
      try {
        const lightweight = this.cache
          .filter(b => b && b.id && !this.deletedIds.has(b.id))
          .map(b => ({
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
        console.warn('localStorage 경량 백업 실패 (IndexedDB 및 서버에는 안전하게 보존됨):', err2);
      }
    }
  }
}

export const bookStorage = new BookStorage();
