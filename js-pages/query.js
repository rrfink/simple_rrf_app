import { Utils } from '../js-core/utils.js';
import { FormDialog } from '../js-components/form-dialog.js';

export class QueryPage {
    constructor(options) {
        this.container = options.container;
        this.eventBus = options.eventBus;
        this.storage = options.storage;
        this.theme = options.theme;
        this.toast = options.toast;
        this.dialog = options.dialog;
        this.logger = options.logger;
        this.formDialog = new FormDialog(options.dialog);
        
        this.currentTab = 'wage-query';
        this.wageHistory = [];
        this.attendance = [];
        this.personalInfo = null;
    }

    async init() {
        this.logger.info('Initializing query page...');
        
        try {
            this.render();
            await this.loadData();
            this.bindEvents();
            this.logger.info('Query page initialized successfully');
        } catch (error) {
            this.logger.error('Failed to initialize query page:', error);
            this.toast.error('页面初始化失败');
        }
    }

    async loadData() {
        const [wageHistory, attendance, personalInfo] = await Promise.all([
            this.storage.getAll('wageHistory'),
            this.storage.getAll('attendance'),
            this.storage.get('personalInfo', 'current')
        ]);

        this.wageHistory = wageHistory || [];
        this.attendance = attendance || [];
        this.personalInfo = personalInfo;
        this.logger.info('Data loaded successfully');
    }

    render() {
        if (!this.container) return;

        this.container.innerHTML = this.getTemplate();
        this.renderTabContent();
    }

    getTemplate() {
        return `
            <main class="app-main">
                <div class="container">
                    <div class="section">
                        <div class="tabs">
                            <button class="tab-btn ${this.currentTab === 'wage-query' ? 'active' : ''}" data-tab="wage-query">
                                <i class="fas fa-search"></i>
                                工资查询
                            </button>
                            <button class="tab-btn ${this.currentTab === 'month-comparison' ? 'active' : ''}" data-tab="month-comparison">
                                <i class="fas fa-chart-bar"></i>
                                多月份对比
                            </button>
                            <button class="tab-btn ${this.currentTab === 'salary-trend' ? 'active' : ''}" data-tab="salary-trend">
                                <i class="fas fa-chart-line"></i>
                                工资趋势
                            </button>
                            <button class="tab-btn ${this.currentTab === 'attendance-stats' ? 'active' : ''}" data-tab="attendance-stats">
                                <i class="fas fa-chart-pie"></i>
                                考勤统计
                            </button>
                        </div>
                        <div id="tabContent"></div>
                    </div>
                </div>
            </main>
        `;
    }

    renderTabContent() {
        const container = document.getElementById('tabContent');
        if (!container) return;

        switch (this.currentTab) {
            case 'wage-query':
                this.renderWageQuery(container);
                break;
            case 'month-comparison':
                this.renderMonthComparison(container);
                break;
            case 'salary-trend':
                this.renderSalaryTrend(container);
                break;
            case 'attendance-stats':
                this.renderAttendanceStats(container);
                break;
        }
    }

    renderWageQuery(container) {
        const years = [...new Set(this.wageHistory.map(w => new Date(w.createdAt).getFullYear()))].sort((a, b) => b - a);
        const months = [...new Set(this.wageHistory.map(w => w.month))].sort();

        container.innerHTML = `
            <div class="card">
                <h3>工资查询</h3>
                <div class="form-group">
                    <label class="form-label">选择年份</label>
                    <select class="form-select" id="queryYear">
                        <option value="">全部年份</option>
                        ${years.map(year => `<option value="${year}">${year}年</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">选择月份</label>
                    <select class="form-select" id="queryMonth">
                        <option value="">全部月份</option>
                        ${months.map(month => `<option value="${month}">${month}</option>`).join('')}
                    </select>
                </div>
                <button class="btn btn-primary w-full" data-action="query-wage">
                    <i class="fas fa-search"></i>
                    查询
                </button>
            </div>
            <div id="queryResult" class="grid grid-auto-fit gap-4 mt-4"></div>
        `;
    }

    renderMonthComparison(container) {
        const years = [...new Set(this.wageHistory.map(w => new Date(w.createdAt).getFullYear()))].sort((a, b) => b - a);

        container.innerHTML = `
            <div class="card">
                <h3>多月份对比</h3>
                <div class="form-group">
                    <label class="form-label">选择对比月份（可多选）</label>
                    <div class="checkbox-group">
                        ${this.wageHistory.map(w => `
                            <label class="checkbox-label">
                                <input type="checkbox" class="form-checkbox" value="${w.month}" data-month="${w.month}">
                                ${w.month}
                            </label>
                        `).join('')}
                    </div>
                </div>
                <button class="btn btn-primary w-full" data-action="compare-months">
                    <i class="fas fa-chart-bar"></i>
                    对比
                </button>
            </div>
            <div id="comparisonResult" class="card mt-4"></div>
        `;
    }

    renderSalaryTrend(container) {
        const years = [...new Set(this.wageHistory.map(w => new Date(w.createdAt).getFullYear()))].sort((a, b) => b - a);

        container.innerHTML = `
            <div class="card">
                <h3>工资趋势</h3>
                <div class="form-group">
                    <label class="form-label">选择年份</label>
                    <select class="form-select" id="trendYear">
                        ${years.map(year => `<option value="${year}">${year}年</option>`).join('')}
                    </select>
                </div>
                <button class="btn btn-primary w-full" data-action="show-trend">
                    <i class="fas fa-chart-line"></i>
                    显示趋势
                </button>
            </div>
            <div id="trendResult" class="card mt-4"></div>
        `;
    }

    renderAttendanceStats(container) {
        const years = [...new Set(this.attendance.map(a => new Date(a.date).getFullYear()))].sort((a, b) => b - a);
        const months = [...new Set(this.attendance.map(a => a.date.substring(0, 7)))].sort();

        container.innerHTML = `
            <div class="card">
                <h3>考勤统计</h3>
                <div class="form-group">
                    <label class="form-label">选择年份</label>
                    <select class="form-select" id="statsYear">
                        <option value="">全部年份</option>
                        ${years.map(year => `<option value="${year}">${year}年</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">选择月份</label>
                    <select class="form-select" id="statsMonth">
                        <option value="">全部月份</option>
                        ${months.map(month => `<option value="${month}">${month}</option>`).join('')}
                    </select>
                </div>
                <button class="btn btn-primary w-full" data-action="show-stats">
                    <i class="fas fa-chart-pie"></i>
                    统计
                </button>
            </div>
            <div id="statsResult" class="card mt-4"></div>
        `;
    }

    bindEvents() {
        document.addEventListener('click', (e) => {
            const actionEl = e.target.closest('[data-action]');
            if (!actionEl) return;
            
            const action = actionEl.dataset.action;
            
            switch (action) {
                case 'toggle-menu':
                    this.toggleMobileMenu();
                    break;
                case 'query-wage':
                    this.handleQueryWage();
                    break;
                case 'compare-months':
                    this.handleCompareMonths();
                    break;
                case 'show-trend':
                    this.handleShowTrend();
                    break;
                case 'show-stats':
                    this.handleShowStats();
                    break;
            }
        });

        this.container.addEventListener('change', (e) => {
            if (e.target.id === 'queryYear' || e.target.id === 'queryMonth') {
                this.handleQueryWage();
            }
        });

        this.container.addEventListener('click', (e) => {
            const tabEl = e.target.closest('[data-tab]');
            if (!tabEl) return;
            
            const tab = tabEl.dataset.tab;
            this.currentTab = tab;
            this.renderTabs();
            this.renderTabContent();
        });
    }

    renderTabs() {
        const tabs = this.container.querySelectorAll('.tab-btn');
        tabs.forEach(tab => {
            if (tab.dataset.tab === this.currentTab) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
    }

    handleQueryWage() {
        const year = document.getElementById('queryYear')?.value;
        const month = document.getElementById('queryMonth')?.value;
        const resultContainer = document.getElementById('queryResult');

        if (!resultContainer) return;

        let filtered = this.wageHistory;
        
        if (year) {
            filtered = filtered.filter(w => new Date(w.createdAt).getFullYear().toString() === year);
        }
        
        if (month) {
            filtered = filtered.filter(w => w.month === month);
        }

        if (filtered.length === 0) {
            resultContainer.innerHTML = '<div class="empty-state">没有找到符合条件的工资记录</div>';
            return;
        }

        resultContainer.innerHTML = filtered.map(wage => `
            <div class="project-card">
                <h3>${wage.month}</h3>
                <p><i class="fas fa-calendar-alt"></i> ${wage.workDays} 天</p>
                <p><i class="fas fa-money-bill-wave"></i> ${Utils.formatCurrency(wage.totalWage)}</p>
                <p class="text-sm text-secondary">${wage.createdAt || ''}</p>
            </div>
        `).join('');
    }

    handleCompareMonths() {
        const checkedMonths = Array.from(document.querySelectorAll('.form-checkbox:checked')).map(cb => cb.value);
        const resultContainer = document.getElementById('comparisonResult');

        if (checkedMonths.length < 2) {
            this.toast.warning('请至少选择2个月进行对比');
            return;
        }

        const selectedWages = this.wageHistory.filter(w => checkedMonths.includes(w.month));
        
        if (selectedWages.length === 0) {
            resultContainer.innerHTML = '<div class="empty-state">没有找到符合条件的工资记录</div>';
            return;
        }

        resultContainer.innerHTML = `
            <h4>对比结果</h4>
            <table class="table">
                <thead>
                    <tr>
                        <th>月份</th>
                        <th>工作天数</th>
                        <th>总工资</th>
                    </tr>
                </thead>
                <tbody>
                    ${selectedWages.map(wage => `
                        <tr>
                            <td>${wage.month}</td>
                            <td>${wage.workDays}</td>
                            <td>${Utils.formatCurrency(wage.totalWage)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    handleShowTrend() {
        const year = document.getElementById('trendYear')?.value;
        const resultContainer = document.getElementById('trendResult');

        if (!year) {
            this.toast.warning('请选择年份');
            return;
        }

        const yearWages = this.wageHistory.filter(w => new Date(w.createdAt).getFullYear().toString() === year);
        
        if (yearWages.length === 0) {
            resultContainer.innerHTML = '<div class="empty-state">该年份没有工资记录</div>';
            return;
        }

        yearWages.sort((a, b) => a.month.localeCompare(b.month));

        resultContainer.innerHTML = `
            <h4>${year}年工资趋势</h4>
            <div class="trend-chart">
                ${yearWages.map(wage => `
                    <div class="trend-item">
                        <div class="trend-month">${wage.month}</div>
                        <div class="trend-bar">
                            <div class="trend-fill" style="width: ${Math.min((wage.totalWage / Math.max(...yearWages.map(w => w.totalWage))) * 100, 100)}%"></div>
                        </div>
                        <div class="trend-value">${Utils.formatCurrency(wage.totalWage)}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    handleShowStats() {
        const year = document.getElementById('statsYear')?.value;
        const month = document.getElementById('statsMonth')?.value;
        const resultContainer = document.getElementById('statsResult');

        if (!resultContainer) return;

        let filtered = this.attendance;
        
        if (year) {
            filtered = filtered.filter(a => new Date(a.date).getFullYear().toString() === year);
        }
        
        if (month) {
            filtered = filtered.filter(a => a.date.startsWith(month));
        }

        if (filtered.length === 0) {
            resultContainer.innerHTML = '<div class="empty-state">没有找到符合条件的考勤记录</div>';
            return;
        }

        const presentDays = filtered.filter(a => a.status === 'present').length;
        const halfDays = filtered.filter(a => a.status === 'half').length;
        const absentDays = filtered.filter(a => a.status === 'absent').length;
        const totalDays = filtered.length;

        resultContainer.innerHTML = `
            <h4>考勤统计</h4>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-label">总天数</div>
                    <div class="stat-value">${totalDays}</div>
                    <div class="stat-change">天</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">满勤</div>
                    <div class="stat-value text-success">${presentDays}</div>
                    <div class="stat-change">天</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">半天</div>
                    <div class="stat-value text-warning">${halfDays}</div>
                    <div class="stat-change">天</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">缺勤</div>
                    <div class="stat-value text-error">${absentDays}</div>
                    <div class="stat-change">天</div>
                </div>
            </div>
        `;
    }

    toggleMobileMenu() {
        const menu = document.getElementById('mobileMenu');
        if (menu) {
            menu.classList.toggle('active');
        }
    }

    destroy() {
        this.logger.info('Destroying query page...');
        this.container.innerHTML = '';
        this.logger.info('Query page destroyed');
    }
}
