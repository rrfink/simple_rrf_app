export class ThemeManager {
    constructor(storage, eventBus) {
        this.storage = storage;
        this.eventBus = eventBus;
        this.currentTheme = 'light';
    }

    init() {
        this.loadTheme();
        this.applyTheme();
        this.bindEvents();
    }

    loadTheme() {
        const savedTheme = this.storage.getLocal('theme');
        this.currentTheme = savedTheme || 'light';
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        this.updateThemeIcon();
    }

    updateThemeIcon() {
        const lightIcon = document.querySelector('.light-icon');
        const darkIcon = document.querySelector('.dark-icon');

        if (this.currentTheme === 'dark') {
            if (lightIcon) lightIcon.classList.add('hidden');
            if (darkIcon) darkIcon.classList.remove('hidden');
        } else {
            if (lightIcon) lightIcon.classList.remove('hidden');
            if (darkIcon) darkIcon.classList.add('hidden');
        }
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.saveTheme();
        this.applyTheme();
        this.eventBus.emit('theme:changed', this.currentTheme);
    }

    saveTheme() {
        this.storage.setLocal('theme', this.currentTheme);
    }

    setTheme(theme) {
        if (theme !== 'light' && theme !== 'dark') return;
        this.currentTheme = theme;
        this.saveTheme();
        this.applyTheme();
        this.eventBus.emit('theme:changed', this.currentTheme);
    }

    getTheme() {
        return this.currentTheme;
    }

    bindEvents() {
        const themeToggleBtn = document.getElementById('themeToggleBtn');
        if (themeToggleBtn) {
            themeToggleBtn.addEventListener('click', () => this.toggleTheme());
        }

        this.eventBus.on('theme:toggle', () => this.toggleTheme());
        this.eventBus.on('theme:set', (theme) => this.setTheme(theme));
    }
}
