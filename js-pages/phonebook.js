import { Utils } from '../js-core/utils.js';
import { FormDialog } from '../js-components/form-dialog.js';

export class PhoneBookPage {
    constructor(options) {
        this.container = options.container;
        this.eventBus = options.eventBus;
        this.storage = options.storage;
        this.theme = options.theme;
        this.toast = options.toast;
        this.dialog = options.dialog;
        this.logger = options.logger;
        this.formDialog = new FormDialog(options.dialog);
        
        this.contacts = [];
    }

    async init() {
        this.logger.info('Initializing phonebook page...');
        
        try {
            this.render();
            await this.loadData();
            this.renderContacts();
            this.bindEvents();
            this.logger.info('Phonebook page initialized successfully');
        } catch (error) {
            this.logger.error('Failed to initialize phonebook page:', error);
            this.toast.error('页面初始化失败');
        }
    }

    async loadData() {
        this.contacts = await this.storage.getAll('contacts') || [];
        this.logger.info('Contacts loaded successfully');
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
                            <h2 class="section-title">联系人列表</h2>
                            <div class="section-actions">
                                <button class="btn btn-primary btn-sm" data-action="new-contact">
                                    <i class="fas fa-plus"></i>
                                    新建联系人
                                </button>
                            </div>
                        </div>
                        <div id="contactList" class="grid grid-auto-fit gap-4"></div>
                    </div>
                </div>
            </main>
        `;
    }

    renderContacts() {
        const container = document.getElementById('contactList');
        if (!container) return;

        if (this.contacts.length === 0) {
            container.innerHTML = '<div class="empty-state">暂无联系人，点击"新建联系人"创建</div>';
            return;
        }

        container.innerHTML = this.contacts.map(contact => `
            <div class="project-card">
                <h3>${contact.name}</h3>
                <p><i class="fas fa-phone"></i> ${contact.phone || '无电话'}</p>
                <p><i class="fas fa-building"></i> ${contact.company || '无公司'}</p>
                <p class="text-sm text-secondary"></p>
                <div class="card-actions">
                    <button class="btn btn-sm btn-ghost" data-action="edit-contact" data-id="">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-ghost" data-action="delete-contact" data-id="">
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
                case 'new-contact':
                    this.handleNewContact();
                    break;
                case 'edit-contact':
                    this.handleEditContact(id);
                    break;
                case 'delete-contact':
                    this.handleDeleteContact(id);
                    break;
            }
        });
    }

    handleNewContact() {
        this.formDialog.show({
            type: 'info',
            title: '新建联系人',
            confirmText: '创建',
            cancelText: '取消',
            fields: [
                {
                    type: 'text',
                    name: 'name',
                    label: '姓名',
                    placeholder: '请输入姓名',
                    required: true
                },
                {
                    type: 'text',
                    name: 'phone',
                    label: '电话',
                    placeholder: '请输入电话号码',
                    required: true
                },
                {
                    type: 'text',
                    name: 'company',
                    label: '公司',
                    placeholder: '请输入公司名称'
                },
                {
                    type: 'textarea',
                    name: 'note',
                    label: '备注',
                    placeholder: '请输入备注',
                    rows: 3
                }
            ],
            onSubmit: async (data) => {
                try {
                    const contact = {
                        id: Utils.generateId(),
                        name: data.name,
                        phone: data.phone,
                        company: data.company || '',
                        note: data.note || '',
                        createdAt: new Date().toISOString()
                    };

                    await this.storage.set('contacts', contact);
                    this.contacts.push(contact);
                    this.renderContacts();
                    this.toast.success('联系人创建成功');
                } catch (error) {
                    this.logger.error('Failed to create contact:', error);
                    this.toast.error('创建失败，请重试');
                }
            }
        });
    }

    handleEditContact(id) {
        const contact = this.contacts.find(c => c.id === id);
        if (!contact) return;

        this.formDialog.show({
            type: 'info',
            title: '编辑联系人',
            confirmText: '保存',
            cancelText: '取消',
            fields: [
                {
                    type: 'text',
                    name: 'name',
                    label: '姓名',
                    value: contact.name,
                    placeholder: '请输入姓名',
                    required: true
                },
                {
                    type: 'text',
                    name: 'phone',
                    label: '电话',
                    value: contact.phone,
                    placeholder: '请输入电话号码',
                    required: true
                },
                {
                    type: 'text',
                    name: 'company',
                    label: '公司',
                    value: contact.company || '',
                    placeholder: '请输入公司名称'
                },
                {
                    type: 'textarea',
                    name: 'note',
                    label: '备注',
                    value: contact.note || '',
                    placeholder: '请输入备注',
                    rows: 3
                }
            ],
            onSubmit: async (data) => {
                try {
                    const updatedContact = {
                        ...contact,
                        name: data.name,
                        phone: data.phone,
                        company: data.company || '',
                        note: data.note || '',
                        updatedAt: new Date().toISOString()
                    };

                    await this.storage.set('contacts', updatedContact);
                    const index = this.contacts.findIndex(c => c.id === id);
                    this.contacts[index] = updatedContact;
                    this.renderContacts();
                    this.toast.success('联系人保存成功');
                } catch (error) {
                    this.logger.error('Failed to update contact:', error);
                    this.toast.error('保存失败，请重试');
                }
            }
        });
    }

    async handleDeleteContact(id) {
        const contact = this.contacts.find(c => c.id === id);
        if (!contact) return;

        if (!confirm(`确定要删除联系人"${contact.name}"吗？`)) return;

        try {
            await this.storage.delete('contacts', id);
            this.contacts = this.contacts.filter(c => c.id !== id);
            this.renderContacts();
            this.toast.success('联系人删除成功');
        } catch (error) {
            this.logger.error('Failed to delete contact:', error);
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
        this.logger.info('Destroying phonebook page...');
        this.container.innerHTML = '';
        this.logger.info('Phonebook page destroyed');
    }
}