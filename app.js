import { EventBus } from './js-core/event-bus.js';
import { StorageManager } from './js-core/storage.js';
import { Logger } from './js-core/logger.js';
import { ThemeManager } from './js-shared/theme.js';
import { Toast } from './js-components/toast.js';
import { Dialog } from './js-components/dialog.js';
import { FormDialog } from './js-components/form-dialog.js';
import { HomePage } from './js-pages/home.js';

export class App {
    constructor(options) {
        this.container = options.container || document.getElementById('app');
        this.page = options.page || 'home';
        
        this.eventBus = new EventBus();
        this.storage = new StorageManager();
        this.logger = Logger;
        
        this.theme = new ThemeManager(this.storage, this.eventBus);
        this.toast = new Toast(this.eventBus);
        this.dialog = new Dialog(this.eventBus);
        
        this.currentPage = null;
        this.isInitialized = false;
    }

    async init() {
        if (this.isInitialized) {
            this.logger.warn('App already initialized');
            return;
        }

        try {
            await this.storage.init();
            this.logger.info('Storage initialized');

            this.theme.init();
            this.logger.info('Theme initialized');

            this.toast.init();
            this.logger.info('Toast initialized');

            this.dialog.init();
            this.logger.info('Dialog initialized');

            await this.loadPage(this.page);
            
            this.isInitialized = true;
            this.logger.info('App initialized successfully');
            this.eventBus.emit('app:ready');
        } catch (error) {
            this.logger.error('Failed to initialize app:', error);
            this.toast.error('应用初始化失败，请刷新页面重试');
            throw error;
        }
    }

    async loadPage(pageName) {
        if (this.currentPage) {
            this.currentPage.destroy();
        }

        const PageClass = this.getPageClass(pageName);
        
        if (!PageClass) {
            throw new Error(`Page not found: ${pageName}`);
        }

        this.currentPage = new PageClass({
            container: this.container,
            eventBus: this.eventBus,
            storage: this.storage,
            theme: this.theme,
            toast: this.toast,
            dialog: this.dialog,
            logger: this.logger
        });

        try {
            await this.currentPage.init();
            this.logger.info(`Page loaded: ${pageName}`);
            this.eventBus.emit('page:loaded', { page: pageName });
        } catch (error) {
            this.logger.error(`Failed to load page ${pageName}:`, error);
            this.toast.error(`页面加载失败: ${error.message}`);
            throw error;
        }
    }

    getPageClass(pageName) {
        const pages = {
            'home': HomePage
        };

        return pages[pageName];
    }

    navigateTo(pageName) {
        if (pageName === this.page) return;
        
        this.page = pageName;
        this.loadPage(pageName);
        
        this.eventBus.emit('page:navigate', { from: this.page, to: pageName });
    }

    destroy() {
        if (this.currentPage) {
            this.currentPage.destroy();
        }
        
        this.toast.hideAll();
        this.dialog.hideAll();
        
        this.isInitialized = false;
        this.logger.info('App destroyed');
    }
}
