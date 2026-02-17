import { Utils } from '../js-core/utils.js';
import { FormDialog } from '../js-components/form-dialog.js';

export class HomePage {
    constructor(options) {
        this.container = options.container;
        this.eventBus = options.eventBus;
        this.storage = options.storage;
        this.theme = options.theme;
        this.toast = options.toast;
        this.dialog = options.dialog;
        this.logger = options.logger;
        this.formDialog = new FormDialog(options.dialog);
        
        this.currentMonth = new Date();
        this.personalInfo = null;
        this.projects = [];
        this.attendance = [];
        this.selectedDate = null;
        this.holidays = [];
    }

    async init() {
        this.logger.info('Initializing home page...');
        
        try {
            this.render();
            await this.loadData();
            this.updatePersonalInfo();
            this.renderProjects();
            this.renderCalendar();
            this.updateStatistics();
            this.renderHolidayCountdown();
            this.bindEvents();
            this.logger.info('Home page initialized successfully');
        } catch (error) {
            this.logger.error('Failed to initialize home page:', error);
            this.toast.error('页面初始化失败');
        }
    }

    async loadData() {
        const [personalInfo, projects, attendance, holidays] = await Promise.all([
            this.storage.get('personalInfo', 'current'),
            this.storage.getAll('projects'),
            this.storage.getAll('attendance'),
            this.storage.getAll('holidays')
        ]);

        this.personalInfo = personalInfo;
        this.projects = projects || [];
        this.attendance = attendance || [];
        this.holidays = holidays || [];
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
                    <div class="section" id="personalInfoSection">
                        <div class="section-header">
                            <h2 class="section-title">个人信息</h2>
                            <div class="section-actions">
                                <button class="btn btn-primary btn-sm" data-action="edit-info">
                                    <i class="fas fa-edit"></i>
                                    编辑信息
                                </button>
                            </div>
                        </div>
                        <div class="info-grid">
                            <div class="info-item">
                                <div class="info-label">姓名</div>
                                <div class="info-value clickable" id="workerName">请设置姓名</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">工种</div>
                                <div class="info-value clickable" id="workerType">请填写工种</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">日工资</div>
                                <div class="info-value clickable" id="workerWage">¥0/天</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">月工资</div>
                                <div class="info-value clickable" id="monthlyWage">¥0/月</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">当前月份</div>
                                <div class="info-value" id="currentMonthText">2026年2月</div>
                            </div>
                        </div>
                    </div>

                    <div class="section hidden" id="projectInfoSection">
                        <div class="section-header">
                            <h2 class="section-title">项目信息</h2>
                            <div class="section-actions">
                                <button class="btn btn-primary btn-sm" data-action="new-project">
                                    <i class="fas fa-plus"></i>
                                    新建项目
                                </button>
                            </div>
                        </div>
                        <div id="projectList" class="grid grid-auto-fit gap-4"></div>
                    </div>

                    <div class="section">
                        <div class="section-header">
                            <h2 class="section-title">出勤记录</h2>
                        </div>
                        <div class="calendar-header">
                            <div class="calendar-nav">
                                <button class="btn btn-ghost btn-sm" data-action="prev-month">
                                    <i class="fas fa-chevron-left"></i>
                                </button>
                            </div>
                            <div class="calendar-title" id="calendarTitle">2026年2月</div>
                            <div class="calendar-nav">
                                <button class="btn btn-ghost btn-sm" data-action="next-month">
                                    <i class="fas fa-chevron-right"></i>
                                </button>
                            </div>
                        </div>
                        <div class="calendar-grid">
                            <div class="week-days">
                                <div class="week-day">日</div>
                                <div class="week-day">一</div>
                                <div class="week-day">二</div>
                                <div class="week-day">三</div>
                                <div class="week-day">四</div>
                                <div class="week-day">五</div>
                                <div class="week-day">六</div>
                            </div>
                            <div class="calendar-days" id="calendarDays"></div>
                        </div>
                        <div class="action-bar">
                            <button class="btn btn-success" data-action="set-present">
                                <i class="fas fa-check"></i>
                                满勤
                            </button>
                            <button class="btn btn-warning" data-action="set-half">
                                <i class="fas fa-adjust"></i>
                                半天
                            </button>
                            <button class="btn btn-error" data-action="set-absent">
                                <i class="fas fa-times"></i>
                                缺勤
                            </button>
                            <button class="btn btn-secondary" data-action="clear-attendance">
                                <i class="fas fa-eraser"></i>
                                清除
                            </button>
                        </div>
                    </div>

                    <div class="section">
                        <div class="section-header">
                            <h2 class="section-title">工资统计</h2>
                        </div>
                        <div class="stats-grid">
                            <div class="stat-card">
                                <div class="stat-label">工作天数</div>
                                <div class="stat-value" id="workDays">0</div>
                                <div class="stat-change positive">天</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-label">总工资</div>
                                <div class="stat-value" id="totalWage">¥0</div>
                                <div class="stat-change positive">元</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-label">实际工资</div>
                                <div class="stat-value" id="actualWage">¥0</div>
                                <div class="stat-change positive">元</div>
                            </div>
                        </div>
                    </div>

                    <div class="section">
                        <div class="section-header">
                            <h2 class="section-title">倒计时节日</h2>
                        </div>
                        <div id="holidayCountdown" class="card">
                            <p class="text-center text-secondary">加载中...</p>
                        </div>
                    </div>
                </div>
            </main>
        `;
    }

    updatePersonalInfo() {
        if (this.personalInfo) {
            const nameEl = document.getElementById('workerName');
            const typeEl = document.getElementById('workerType');
            const wageEl = document.getElementById('workerWage');
            const monthlyWageEl = document.getElementById('monthlyWage');

            if (nameEl) nameEl.textContent = this.personalInfo.name || '请设置姓名';
            if (typeEl) typeEl.textContent = this.personalInfo.job || '请填写工种';
            if (wageEl) wageEl.textContent = Utils.formatCurrency(this.personalInfo.wage) + '/天';
            if (monthlyWageEl) monthlyWageEl.textContent = Utils.formatCurrency(this.personalInfo.monthlyWage) + '/月';
        }
    }

    renderProjects() {
        const container = document.getElementById('projectList');
        if (!container) return;

        if (this.projects.length === 0) {
            container.innerHTML = '<div class="empty-state">暂无项目，点击"新建项目"创建</div>';
            return;
        }

        container.innerHTML = this.projects.map(project => `
            <div class="project-card">
                <h3>${project.name}</h3>
                <p>${project.address || '无地址'}</p>
                <p class="text-sm text-secondary">${project.description || '无描述'}</p>
            </div>
        `).join('');
    }

    renderCalendar() {
        const container = document.getElementById('calendarDays');
        const titleEl = document.getElementById('calendarTitle');
        if (!container || !titleEl) return;

        const year = this.currentMonth.getFullYear();
        const month = this.currentMonth.getMonth();
        
        titleEl.textContent = `${year}年${month + 1}月`;

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDay = firstDay.getDay();
        const totalDays = lastDay.getDate();
        
        let html = '';
        
        for (let i = 0; i < startDay; i++) {
            html += '<div class="day-item empty"></div>';
        }

        for (let day = 1; day <= totalDays; day++) {
            const dateStr = Utils.formatDate(new Date(year, month, day));
            const attendance = this.attendance.find(a => a.date === dateStr);
            const statusClass = attendance ? `attendance-${attendance.status}` : '';
            const selectedClass = this.selectedDate === dateStr ? 'selected' : '';
            const isHoliday = this.holidays.some(h => h.date === dateStr);
            const holidayClass = isHoliday ? 'holiday' : '';
            
            const statusIcon = attendance && attendance.status === 'present' 
                ? '<i class="fas fa-check-circle status-icon"></i>' 
                : '';

            html += `<div class="day-item ${statusClass} ${selectedClass} ${holidayClass}" data-date="${dateStr}">
                <div class="day-number">${day}</div>
                ${statusIcon}
            </div>`;
        }

        container.innerHTML = html;
    }

    updateStatistics() {
        const workDaysEl = document.getElementById('workDays');
        const totalWageEl = document.getElementById('totalWage');
        const actualWageEl = document.getElementById('actualWage');

        if (!this.personalInfo) return;

        const presentDays = this.attendance.filter(a => a.status === 'present').length;
        const halfDays = this.attendance.filter(a => a.status === 'half').length;
        const workDays = presentDays + (halfDays * 0.5);
        
        let totalWage = 0;
        let actualWage = 0;

        if (this.personalInfo.monthlyWage && this.personalInfo.monthlyWage > 0) {
            totalWage = this.personalInfo.monthlyWage;
            actualWage = this.personalInfo.monthlyWage;
        } else {
            totalWage = workDays * (this.personalInfo.wage || 0);
            actualWage = totalWage;
        }

        if (workDaysEl) workDaysEl.textContent = workDays.toFixed(1);
        if (totalWageEl) totalWageEl.textContent = Utils.formatCurrency(totalWage);
        if (actualWageEl) actualWageEl.textContent = Utils.formatCurrency(actualWage);
    }

    renderHolidayCountdown() {
        const container = document.getElementById('holidayCountdown');
        if (!container) return;

        const now = new Date();
        const upcomingHolidays = this.holidays.filter(h => new Date(h.date) > now);
        
        if (upcomingHolidays.length === 0) {
            container.innerHTML = '<p class="text-center text-secondary">暂无即将到来的节日，请在数据管理中添加</p>';
            return;
        }

        const nextHoliday = upcomingHolidays[0];
        const diffTime = new Date(nextHoliday.date) - now;
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const hours = Math.ceil((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.ceil((diffTime % (1000 * 60 * 60)) / (1000 * 60));

        let countdownText = '';
        if (days > 0) {
            countdownText = `还有 ${days} 天`;
        } else if (hours > 0) {
            countdownText = `还有 ${hours} 小时`;
        } else if (minutes > 0) {
            countdownText = `还有 ${minutes} 分钟`;
        } else {
            countdownText = '节日已到';
        }

        container.innerHTML = `
            <div class="holiday-info">
                <h3>${nextHoliday.name}</h3>
                <p class="text-secondary">${Utils.formatDate(nextHoliday.date)}</p>
                <p class="countdown">${countdownText}</p>
            </div>
        `;
    }

    bindEvents() {
        document.addEventListener('click', (e) => {
            const actionEl = e.target.closest('[data-action]');
            
            if (actionEl) {
                const action = actionEl.dataset.action;
                
                switch (action) {
                    case 'toggle-menu':
                        this.toggleMobileMenu();
                        break;
                    case 'show-personal-info':
                        this.showSection('personalInfoSection');
                        break;
                    case 'show-project-info':
                        this.showSection('projectInfoSection');
                        break;
                    case 'edit-info':
                        this.handleEditInfo();
                        break;
                    case 'phonebook':
                        window.location.href = 'html-new/phonebook.php';
                        break;
                    case 'project-management':
                        window.location.href = 'html-new/project-management.php';
                        break;
                    case 'data-management':
                        window.location.href = 'html-new/data-management.php';
                        break;
                    case 'new-project':
                        this.handleNewProject();
                        break;
                    case 'login':
                        this.toast.info('登录/注册功能开发中');
                        break;
                    case 'prev-month':
                        this.changeMonth(-1);
                        break;
                    case 'next-month':
                        this.changeMonth(1);
                        break;
                    case 'set-present':
                        this.setAttendance('present');
                        break;
                    case 'set-half':
                        this.setAttendance('half');
                        break;
                    case 'set-absent':
                        this.setAttendance('absent');
                        break;
                    case 'clear-attendance':
                        this.clearAttendance();
                        break;
                }
            }

            const dateEl = e.target.closest('.day-item[data-date]');
            if (dateEl && !dateEl.classList.contains('empty')) {
                const dateStr = dateEl.dataset.date;
                this.selectedDate = dateStr;
                this.renderCalendar();
            }
        });
    }

    handleEditInfo() {
        this.formDialog.show({
            type: 'info',
            title: '编辑信息',
            confirmText: '保存',
            cancelText: '取消',
            fields: [
                {
                    type: 'text',
                    name: 'name',
                    label: '姓名',
                    value: this.personalInfo?.name || '',
                    placeholder: '请输入姓名',
                    required: true
                },
                {
                    type: 'text',
                    name: 'job',
                    label: '工种',
                    value: this.personalInfo?.job || '',
                    placeholder: '请输入工种',
                    required: true
                },
                {
                    type: 'number',
                    name: 'wage',
                    label: '日工资（元）',
                    value: this.personalInfo?.wage || '',
                    placeholder: '请输入日工资',
                    required: true,
                    min: 0,
                    step: 0.01
                },
                {
                    type: 'number',
                    name: 'monthlyWage',
                    label: '月工资（元，全职员工填写）',
                    value: this.personalInfo?.monthlyWage || '',
                    placeholder: '请输入月工资',
                    required: false,
                    min: 0,
                    step: 0.01
                },
                {
                    type: 'number',
                    name: 'overtimeRate',
                    label: '加班工资倍率',
                    value: this.personalInfo?.overtimeRate || 1.5,
                    placeholder: '例如：1.5表示1.5倍工资',
                    required: false,
                    min: 1,
                    max: 3,
                    step: 0.5
                }
            ],
            onSubmit: async (data) => {
                try {
                    const personalInfo = {
                        id: 'current',
                        name: data.name,
                        job: data.job,
                        wage: parseFloat(data.wage) || 0,
                        monthlyWage: parseFloat(data.monthlyWage) || 0,
                        overtimeRate: parseFloat(data.overtimeRate) || 1.5
                    };

                    await this.storage.set('personalInfo', personalInfo);
                    this.personalInfo = personalInfo;
                    this.updatePersonalInfo();
                    this.updateStatistics();
                    this.toast.success('信息保存成功');
                } catch (error) {
                    this.logger.error('Failed to save personal info:', error);
                    this.toast.error('保存失败，请重试');
                }
            }
        });
    }

    handleNewProject() {
        this.formDialog.show({
            type: 'info',
            title: '新建项目',
            confirmText: '创建',
            cancelText: '取消',
            fields: [
                {
                    type: 'text',
                    name: 'name',
                    label: '项目名称',
                    placeholder: '请输入项目名称',
                    required: true
                },
                {
                    type: 'text',
                    name: 'address',
                    label: '项目地址',
                    placeholder: '请输入项目地址'
                },
                {
                    type: 'textarea',
                    name: 'description',
                    label: '项目描述',
                    placeholder: '请输入项目描述',
                    rows: 3
                }
            ],
            onSubmit: async (data) => {
                try {
                    const project = {
                        id: Utils.generateId(),
                        name: data.name,
                        address: data.address || '',
                        description: data.description || '',
                        createdAt: new Date().toISOString()
                    };

                    await this.storage.set('projects', project);
                    this.projects.push(project);
                    this.renderProjects();
                    this.toast.success('项目创建成功');
                } catch (error) {
                    this.logger.error('Failed to create project:', error);
                    this.toast.error('创建失败，请重试');
                }
            }
        });
    }

    changeMonth(delta) {
        this.currentMonth.setMonth(this.currentMonth.getMonth() + delta);
        this.renderCalendar();
        this.updateStatistics();
    }

    async setAttendance(status) {
        const selectedDateEl = document.querySelector('.day-item.selected');
        if (!selectedDateEl) {
            this.toast.warning('请先选择日期');
            return;
        }

        const dateStr = selectedDateEl.dataset.date;
        const existingAttendance = this.attendance.find(a => a.date === dateStr);
        
        const attendanceData = {
            id: existingAttendance?.id || Utils.generateId(),
            date: dateStr,
            status: status,
            updatedAt: new Date().toISOString()
        };

        try {
            await this.storage.set('attendance', attendanceData);
            
            if (existingAttendance) {
                const index = this.attendance.findIndex(a => a.date === dateStr);
                this.attendance[index] = attendanceData;
            } else {
                this.attendance.push(attendanceData);
            }
            
            this.renderCalendar();
            this.updateStatistics();
            
            const label = status === 'present' ? '满勤' : status === 'half' ? '半天' : '缺勤';
            this.toast.success(`${dateStr}设置为${label}`);
        } catch (error) {
            this.logger.error('Failed to set attendance:', error);
            this.toast.error('设置失败，请重试');
        }
    }

    async clearAttendance() {
        const selectedDateEl = document.querySelector('.day-item.selected');
        if (!selectedDateEl) {
            this.toast.warning('请先选择日期');
            return;
        }

        const dateStr = selectedDateEl.dataset.date;
        const existingAttendance = this.attendance.find(a => a.date === dateStr);
        
        if (!existingAttendance) {
            this.toast.info('该日期没有考勤记录');
            return;
        }

        try {
            await this.storage.delete('attendance', existingAttendance.id);
            this.attendance = this.attendance.filter(a => a.date !== dateStr);
            
            this.renderCalendar();
            this.updateStatistics();
            this.toast.success(`${dateStr}考勤记录已清除`);
        } catch (error) {
            this.logger.error('Failed to clear attendance:', error);
            this.toast.error('清除失败，请重试');
        }
    }

    toggleMobileMenu() {
        const menu = document.getElementById('mobileMenu');
        if (menu) {
            menu.classList.toggle('active');
        }
    }

    showSection(sectionId) {
        const sections = ['personalInfoSection', 'projectInfoSection'];
        sections.forEach(id => {
            const section = document.getElementById(id);
            if (section) {
                if (id === sectionId) {
                    section.classList.remove('hidden');
                } else {
                    section.classList.add('hidden');
                }
            }
        });
        this.toggleMobileMenu();
    }

    destroy() {
        this.logger.info('Destroying home page...');
        this.container.innerHTML = '';
        this.logger.info('Home page destroyed');
    }
}
