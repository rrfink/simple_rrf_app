import { Utils } from '../js-core/utils.js';
import { FormDialog } from '../js-components/form-dialog.js';

export class ProjectManagementPage {
    constructor(options) {
        this.container = options.container;
        this.eventBus = options.eventBus;
        this.storage = options.storage;
        this.theme = options.theme;
        this.toast = options.toast;
        this.dialog = options.dialog;
        this.logger = options.logger;
        this.formDialog = new FormDialog(options.dialog);
        
        this.projects = [];
    }

    async init() {
        this.logger.info('Initializing project management page...');
        
        try {
            this.render();
            await this.loadData();
            this.renderProjects();
            this.bindEvents();
            this.logger.info('Project management page initialized successfully');
        } catch (error) {
            this.logger.error('Failed to initialize project management page:', error);
            this.toast.error('页面初始化失败');
        }
    }

    async loadData() {
        this.projects = await this.storage.getAll('projects') || [];
        this.logger.info('Projects loaded successfully');
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
                            <h2 class="section-title">项目列表</h2>
                            <div class="section-actions">
                                <button class="btn btn-primary btn-sm" data-action="new-project">
                                    <i class="fas fa-plus"></i>
                                    新建项目
                                </button>
                            </div>
                        </div>
                        <div id="projectList" class="grid grid-auto-fit gap-4"></div>
                    </div>
                </div>
            </main>
        `;
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
                <p><i class="fas fa-map-marker-alt"></i> ${project.address || '无地址'}</p>
                <p class="text-sm text-secondary">${project.description || '无描述'}</p>
                <div class="card-actions">
                    <button class="btn btn-sm btn-ghost" data-action="edit-project" data-id="${project.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-ghost" data-action="delete-project" data-id="${project.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    bindEvents() {
        document.addEventListener('click', (e) => {
            const actionEl = e.target.closest('[data-action]');
            if (!actionEl) return;
            
            const action = actionEl.dataset.action;
            const id = actionEl.dataset.id;
            
            switch (action) {
                case 'toggle-menu':
                    this.toggleMobileMenu();
                    break;
                case 'new-project':
                    this.handleNewProject();
                    break;
                case 'edit-project':
                    this.handleEditProject(id);
                    break;
                case 'delete-project':
                    this.handleDeleteProject(id);
                    break;
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

    handleEditProject(id) {
        const project = this.projects.find(p => p.id === id);
        if (!project) return;

        this.formDialog.show({
            type: 'info',
            title: '编辑项目',
            confirmText: '保存',
            cancelText: '取消',
            fields: [
                {
                    type: 'text',
                    name: 'name',
                    label: '项目名称',
                    value: project.name,
                    placeholder: '请输入项目名称',
                    required: true
                },
                {
                    type: 'text',
                    name: 'address',
                    label: '项目地址',
                    value: project.address || '',
                    placeholder: '请输入项目地址'
                },
                {
                    type: 'textarea',
                    name: 'description',
                    label: '项目描述',
                    value: project.description || '',
                    placeholder: '请输入项目描述',
                    rows: 3
                }
            ],
            onSubmit: async (data) => {
                try {
                    const updatedProject = {
                        ...project,
                        name: data.name,
                        address: data.address || '',
                        description: data.description || '',
                        updatedAt: new Date().toISOString()
                    };

                    await this.storage.set('projects', updatedProject);
                    const index = this.projects.findIndex(p => p.id === id);
                    this.projects[index] = updatedProject;
                    this.renderProjects();
                    this.toast.success('项目保存成功');
                } catch (error) {
                    this.logger.error('Failed to update project:', error);
                    this.toast.error('保存失败，请重试');
                }
            }
        });
    }

    async handleDeleteProject(id) {
        const project = this.projects.find(p => p.id === id);
        if (!project) return;

        if (!confirm(`确定要删除项目"${project.name}"吗？`)) return;

        try {
            await this.storage.delete('projects', id);
            this.projects = this.projects.filter(p => p.id !== id);
            this.renderProjects();
            this.toast.success('项目删除成功');
        } catch (error) {
            this.logger.error('Failed to delete project:', error);
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
        this.logger.info('Destroying project management page...');
        this.container.innerHTML = '';
        this.logger.info('Project management page destroyed');
    }
}
