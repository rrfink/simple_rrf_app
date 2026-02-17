export class StorageManager {
    constructor() {
        this.dbName = 'RenGongJiGongDB';
        this.dbVersion = 2;
        this.db = null;
        this.stores = {
            projects: 'id',
            attendance: 'id',
            contacts: 'id',
            personalInfo: 'id',
            wageHistory: 'id',
            holidays: 'id'
        };
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => {
                reject(new Error('Failed to open database'));
            };

            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                const oldVersion = event.oldVersion || 0;
                
                for (const storeName in this.stores) {
                    if (this.stores.hasOwnProperty(storeName)) {
                        const keyPath = this.stores[storeName];
                        if (!db.objectStoreNames.contains(storeName)) {
                            db.createObjectStore(storeName, { keyPath });
                        }
                    }
                }
                
                if (oldVersion < 2) {
                    if (!db.objectStoreNames.contains('wageHistory')) {
                        db.createObjectStore('wageHistory', { keyPath: 'id' });
                    }
                    if (!db.objectStoreNames.contains('holidays')) {
                        db.createObjectStore('holidays', { keyPath: 'id' });
                    }
                }
            };
        });
    }

    async get(storeName, key) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(key);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getAll(storeName) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    }

    async set(storeName, data) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(data);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async delete(storeName, key) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(key);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async clear(storeName) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }

            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.clear();

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    getLocal(key) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.error('Failed to get from localStorage:', error);
            return null;
        }
    }

    setLocal(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Failed to set to localStorage:', error);
            return false;
        }
    }

    removeLocal(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Failed to remove from localStorage:', error);
            return false;
        }
    }

    clearLocal() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Failed to clear localStorage:', error);
            return false;
        }
    }
}
