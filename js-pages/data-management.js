import { Utils } from '../js-core/utils.js';
import { FormDialog } from '../js-components/form-dialog.js';

export class DataManagementPage {
    constructor(options) {
        this.container = options.container;
        this.eventBus = options.eventBus;
        this.storage = options.storage;
        this.theme = options.theme;
        this.toast = options.toast;
        this.dialog = options.dialog;
        this.logger = options.logger;
        this.formDialog = new FormDialog(options.dialog);
        
        this.stats = {
            contacts: 0,
            projects: 0,
            attendance: 0,
            wageHistory: 0
        };
        this.wageHistory = [];
        this.managedHolidays = [];
    }

    async init() {
        this.logger.info('Initializing data management page...');
        
        try {
            this.render();
            await this.loadData();
            this.renderStats();
            this.bindEvents();
            this.logger.info('Data management page initialized successfully');
        } catch (error) {
            this.logger.error('Failed to initialize data management page:', error);
            this.toast.error('页面初始化失败');
        }
    }

    async loadData() {
        const [contacts, projects, attendance, wageHistory] = await Promise.all([
            this.storage.getAll('contacts'),
            this.storage.getAll('projects'),
            this.storage.getAll('attendance'),
            this.storage.getAll('wageHistory')
        ]);

        this.stats = {
            contacts: (contacts || []).length,
            projects: (projects || []).length,
            attendance: (attendance || []).length,
            wageHistory: (wageHistory || []).length
        };
        this.wageHistory = wageHistory || [];
        this.managedHolidays = await this.storage.getAll('holidays') || [];
        this.logger.info('Data loaded successfully');
    }

    render() {
        if (!this.container) return;

        this.container.innerHTML = this.getTemplate();
    }

    getTemplate() {
        return `
            <main class="app-main">
                <div class="container">
                    <div class="section">
                        <div class="section-header">
                            <h2 class="section-title">数据统计</h2>
                        </div>
                        <div class="stats-grid">
                            <div class="stat-card">
                                <div class="stat-label">联系人</div>
                                <div class="stat-value" id="contactCount">0</div>
                                <div class="stat-change positive">条</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-label">项目</div>
                                <div class="stat-value" id="projectCount">0</div>
                                <div class="stat-change positive">个</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-label">出勤记录</div>
                                <div class="stat-value" id="attendanceCount">0</div>
                                <div class="stat-change positive">条</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-label">工资历史</div>
                                <div class="stat-value" id="wageHistoryCount">0</div>
                                <div class="stat-change positive">条</div>
                            </div>
                        </div>
                    </div>

                    <div class="section">
                        <div class="section-header">
                            <h2 class="section-title">数据操作</h2>
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div class="card">
                                <h3>导出Excel</h3>
                                <p class="text-sm text-secondary mb-3">导出所有数据为Excel格式</p>
                                <button class="btn btn-primary w-full" data-action="export-excel">
                                    <i class="fas fa-file-excel"></i>
                                    导出Excel
                                </button>
                            </div>
                            <div class="card">
                                <h3>导出PDF</h3>
                                <p class="text-sm text-secondary mb-3">导出所有数据为PDF格式</p>
                                <button class="btn btn-primary w-full" data-action="export-pdf">
                                    <i class="fas fa-file-pdf"></i>
                                    导出PDF
                                </button>
                            </div>
                            <div class="card">
                                <h3>导出电话本</h3>
                                <p class="text-sm text-secondary mb-3">导出联系人为Excel格式</p>
                                <button class="btn btn-primary w-full" data-action="export-contacts">
                                    <i class="fas fa-address-book"></i>
                                    导出电话本
                                </button>
                            </div>
                            <div class="card">
                                <h3>复制到剪贴板</h3>
                                <p class="text-sm text-secondary mb-3">复制所有数据到剪贴板</p>
                                <button class="btn btn-primary w-full" data-action="copy-to-clipboard">
                                    <i class="fas fa-copy"></i>
                                    复制
                                </button>
                            </div>
                            <div class="card">
                                <h3>导入数据</h3>
                                <p class="text-sm text-secondary mb-3">从JSON文件导入数据</p>
                                <input type="file" id="importFile" accept=".json" class="hidden">
                                <button class="btn btn-secondary w-full" data-action="import-data">
                                    <i class="fas fa-upload"></i>
                                    导入数据
                                </button>
                            </div>
                            <div class="card">
                                <h3>清空所有数据</h3>
                                <p class="text-sm text-secondary mb-3">删除所有数据，不可恢复</p>
                                <button class="btn btn-error w-full" data-action="clear-all-data">
                                    <i class="fas fa-trash"></i>
                                    清空数据
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="section">
                        <div class="section-header">
                            <h2 class="section-title">工资历史</h2>
                        </div>
                        <div id="wageHistoryList" class="grid grid-auto-fit gap-4"></div>
                    </div>

                    <div class="section">
                        <div class="section-header">
                            <h2 class="section-title">节日管理</h2>
                            <div class="section-actions">
                                <button class="btn btn-primary btn-sm" data-action="add-holiday">
                                    <i class="fas fa-plus"></i>
                                    添加节日
                                </button>
                            </div>
                        </div>
                        <div id="holidayList" class="grid grid-auto-fit gap-4"></div>
                    </div>
                </div>
            </main>
        `;
    }

    renderStats() {
        const contactCountEl = document.getElementById('contactCount');
        const projectCountEl = document.getElementById('projectCount');
        const attendanceCountEl = document.getElementById('attendanceCount');
        const wageHistoryCountEl = document.getElementById('wageHistoryCount');

        if (contactCountEl) contactCountEl.textContent = this.stats.contacts;
        if (projectCountEl) projectCountEl.textContent = this.stats.projects;
        if (attendanceCountEl) attendanceCountEl.textContent = this.stats.attendance;
        if (wageHistoryCountEl) wageHistoryCountEl.textContent = this.stats.wageHistory;

        this.renderWageHistory();
        this.renderHolidayList();
    }

    renderHolidayList() {
        const container = document.getElementById('holidayList');
        if (!container) return;

        if (this.managedHolidays.length === 0) {
            container.innerHTML = '<div class="empty-state">暂无节日，点击"添加节日"创建</div>';
            return;
        }

        container.innerHTML = this.managedHolidays.map(holiday => `
            <div class="project-card">
                <h3>${holiday.name}</h3>
                <p><i class="fas fa-calendar-alt"></i> ${Utils.formatDate(holiday.date)}</p>
                <div class="card-actions">
                    <button class="btn btn-sm btn-ghost" data-action="edit-holiday" data-id="${holiday.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-ghost" data-action="delete-holiday" data-id="${holiday.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderWageHistory() {
        const container = document.getElementById('wageHistoryList');
        if (!container) return;

        if (this.wageHistory.length === 0) {
            container.innerHTML = '<div class="empty-state">暂无工资历史记录</div>';
            return;
        }

        container.innerHTML = this.wageHistory.map(record => `
            <div class="project-card">
                <h3>${record.month}</h3>
                <p><i class="fas fa-calendar-alt"></i> ${record.workDays} 天</p>
                <p><i class="fas fa-money-bill-wave"></i> ${Utils.formatCurrency(record.totalWage)}</p>
                <p class="text-sm text-secondary">${record.createdAt || ''}</p>
            </div>
        `).join('');
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
                case 'export-excel':
                    this.handleExportExcel();
                    break;
                case 'export-pdf':
                    this.handleExportPdf();
                    break;
                case 'export-contacts':
                    this.handleExportContacts();
                    break;
                case 'copy-clipboard':
                    this.handleCopyToClipboard();
                    break;
                case 'import-data':
                    this.handleImportData();
                    break;
                case 'add-holiday':
                    this.handleAddHoliday();
                    break;
                case 'edit-holiday':
                    this.handleEditHoliday(id);
                    break;
                case 'delete-holiday':
                    this.handleDeleteHoliday(id);
                    break;
                case 'clear-all-data':
                    this.handleClearAllData();
                    break;
            }
        });
    }

    handleImportData() {
        const fileInput = document.getElementById('importFile');
        if (!fileInput) return;

        fileInput.click();

        fileInput.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const text = await file.text();
                const data = JSON.parse(text);

                if (!data.contacts && !data.projects && !data.attendance) {
                    this.toast.error('无效的数据文件');
                    return;
                }

                if (!confirm('导入数据将覆盖现有数据，确定要继续吗？')) return;

                if (data.contacts && data.contacts.length > 0) {
                    for (const contact of data.contacts) {
                        await this.storage.set('contacts', contact);
                    }
                }

                if (data.projects && data.projects.length > 0) {
                    for (const project of data.projects) {
                        await this.storage.set('projects', project);
                    }
                }

                if (data.attendance && data.attendance.length > 0) {
                    for (const record of data.attendance) {
                        await this.storage.set('attendance', record);
                    }
                }

                await this.loadData();
                this.renderStats();
                this.toast.success('数据导入成功');
                fileInput.value = '';
            } catch (error) {
                this.logger.error('Failed to import data:', error);
                this.toast.error('导入失败，请检查文件格式');
                fileInput.value = '';
            }
        };
    }

    async handleClearAllData() {
        if (!confirm('确定要清空所有数据吗？此操作不可恢复！')) return;

        try {
            await this.storage.clearAll();
            this.stats = {
                contacts: 0,
                projects: 0,
                attendance: 0
            };
            this.renderStats();
            this.toast.success('数据已清空');
        } catch (error) {
            this.logger.error('Failed to clear data:', error);
            this.toast.error('清空失败，请重试');
        }
    }

    async handleExportExcel() {
        try {
            const [contacts, projects, attendance] = await Promise.all([
                this.storage.getAll('contacts'),
                this.storage.getAll('projects'),
                this.storage.getAll('attendance')
            ]);

            const data = {
                exportDate: new Date().toISOString(),
                contacts: contacts || [],
                projects: projects || [],
                attendance: attendance || []
            };

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `任工记工数据_${Utils.formatDate(new Date())}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.toast.success('数据导出成功');
        } catch (error) {
            this.logger.error('Failed to export data:', error);
            this.toast.error('导出失败，请重试');
        }
    }

    async handleExportPdf() {
        try {
            const [contacts, projects, attendance] = await Promise.all([
                this.storage.getAll('contacts'),
                this.storage.getAll('projects'),
                this.storage.getAll('attendance')
            ]);

            const data = {
                exportDate: new Date().toISOString(),
                contacts: contacts || [],
                projects: projects || [],
                attendance: attendance || []
            };

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `任工记工数据_${Utils.formatDate(new Date())}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.toast.success('数据导出成功');
        } catch (error) {
            this.logger.error('Failed to export data:', error);
            this.toast.error('导出失败，请重试');
        }
    }

    async handleExportContacts() {
        try {
            const contacts = await this.storage.getAll('contacts');

            const blob = new Blob([JSON.stringify(contacts || [], null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `电话簿_${Utils.formatDate(new Date())}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.toast.success('电话本导出成功');
        } catch (error) {
            this.logger.error('Failed to export contacts:', error);
            this.toast.error('导出失败，请重试');
        }
    }

    async handleCopyToClipboard() {
        try {
            const [contacts, projects, attendance] = await Promise.all([
                this.storage.getAll('contacts'),
                this.storage.getAll('projects'),
                this.storage.getAll('attendance')
            ]);

            const data = {
                exportDate: new Date().toISOString(),
                contacts: contacts || [],
                projects: projects || [],
                attendance: attendance || []
            };

            const text = JSON.stringify(data, null, 2);
            await navigator.clipboard.writeText(text);
            this.toast.success('数据已复制到剪贴板');
        } catch (error) {
            this.logger.error('Failed to copy to clipboard:', error);
            this.toast.error('复制失败，请重试');
        }
    }

    handleAddHoliday() {
        this.formDialog.show({
            type: 'info',
            title: '添加节日',
            confirmText: '添加',
            cancelText: '取消',
            fields: [
                {
                    type: 'text',
                    name: 'name',
                    label: '节日名称',
                    placeholder: '请输入节日名称',
                    required: true
                },
                {
                    type: 'date',
                    name: 'date',
                    label: '节日日期',
                    placeholder: '请选择节日日期',
                    required: true
                }
            ],
            onSubmit: async (data) => {
                try {
                    const holiday = {
                        id: Utils.generateId(),
                        name: data.name,
                        date: data.date,
                        createdAt: new Date().toISOString()
                    };

                    await this.storage.set('holidays', holiday);
                    this.managedHolidays.push(holiday);
                    this.renderHolidayList();
                    this.toast.success('节日添加成功');
                } catch (error) {
                    this.logger.error('Failed to add holiday:', error);
                    this.toast.error('添加失败，请重试');
                }
            }
        });
    }

    handleEditHoliday(id) {
        const holiday = this.managedHolidays.find(h => h.id === id);
        if (!holiday) return;

        this.formDialog.show({
            type: 'info',
            title: '编辑节日',
            confirmText: '保存',
            cancelText: '取消',
            fields: [
                {
                    type: 'text',
                    name: 'name',
                    label: '节日名称',
                    value: holiday.name,
                    placeholder: '请输入节日名称',
                    required: true
                },
                {
                    type: 'date',
                    name: 'date',
                    label: '节日日期',
                    value: holiday.date,
                    placeholder: '请选择节日日期',
                    required: true
                }
            ],
            onSubmit: async (data) => {
                try {
                    const updatedHoliday = {
                        ...holiday,
                        name: data.name,
                        date: data.date,
                        updatedAt: new Date().toISOString()
                    };

                    await this.storage.set('holidays', updatedHoliday);
                    const index = this.managedHolidays.findIndex(h => h.id === id);
                    this.managedHolidays[index] = updatedHoliday;
                    this.renderHolidayList();
                    this.toast.success('节日保存成功');
                } catch (error) {
                    this.logger.error('Failed to update holiday:', error);
                    this.toast.error('保存失败，请重试');
                }
            }
        });
    }

    async handleDeleteHoliday(id) {
        const holiday = this.managedHolidays.find(h => h.id === id);
        if (!holiday) return;

        if (!confirm(`确定要删除节日"${holiday.name}"吗？`)) return;

        try {
            await this.storage.delete('holidays', id);
            this.managedHolidays = this.managedHolidays.filter(h => h.id !== id);
            this.renderHolidayList();
            this.toast.success('节日删除成功');
        } catch (error) {
            this.logger.error('Failed to delete holiday:', error);
            this.toast.error('删除失败，请重试');
        }
    }

    toggleMobileMenu() {
        const menu = document.getElementById('mobileMenu');
        if (menu) {
            menu.classList.toggle('active');
        }
    }

    destroy() {
        this.logger.info('Destroying data management page...');
        this.container.innerHTML = '';
        this.logger.info('Data management page destroyed');
    }
}
