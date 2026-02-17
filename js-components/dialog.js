export class Dialog {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.container = null;
        this.overlay = null;
        this.dialog = null;
        this.currentConfig = null;
    }

    init() {
        this.createContainer();
        this.bindEvents();
    }

    createContainer() {
        this.container = document.getElementById('dialogContainer');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'dialogContainer';
            document.body.appendChild(this.container);
        }
    }

    show(config) {
        this.currentConfig = config;
        this.createContainer();
        this.createDialog(config);
        this.bindDialogEvents();
    }

    createDialog(config) {
        this.overlay = document.createElement('div');
        this.overlay.className = 'dialog-overlay';

        this.dialog = document.createElement('div');
        this.dialog.className = `dialog dialog-${config.type || 'info'}`;

        const header = document.createElement('div');
        header.className = 'dialog-header';
        
        const title = document.createElement('h3');
        title.className = 'dialog-title';
        title.textContent = config.title || '提示';
        
        const closeButton = document.createElement('button');
        closeButton.className = 'dialog-close';
        closeButton.innerHTML = '<i class="fas fa-times"></i>';
        closeButton.onclick = () => this.handleClose();

        header.appendChild(title);
        header.appendChild(closeButton);

        const body = document.createElement('div');
        body.className = 'dialog-body';
        
        if (config.htmlContent) {
            body.innerHTML = config.htmlContent;
        } else {
            const message = document.createElement('p');
            message.textContent = config.message || '';
            body.appendChild(message);
        }

        const footer = document.createElement('div');
        footer.className = 'dialog-footer';

        if (config.type === 'confirm') {
            const cancelBtn = document.createElement('button');
            cancelBtn.className = 'btn btn-secondary';
            cancelBtn.textContent = config.cancelText || '取消';
            cancelBtn.onclick = () => this.handleCancel();
            footer.appendChild(cancelBtn);
        }

        const confirmBtn = document.createElement('button');
        confirmBtn.className = `btn ${config.type === 'confirm' ? 'btn-primary' : 'btn-success'}`;
        confirmBtn.textContent = config.confirmText || '确定';
        confirmBtn.onclick = () => this.handleConfirm();
        footer.appendChild(confirmBtn);

        this.dialog.appendChild(header);
        this.dialog.appendChild(body);
        this.dialog.appendChild(footer);

        this.container.appendChild(this.overlay);
        this.container.appendChild(this.dialog);

        setTimeout(() => {
            this.overlay.classList.add('dialog-overlay-show');
            this.dialog.classList.add('dialog-show');
        }, 10);
    }

    bindDialogEvents() {
        const self = this;
        
        this.overlay.addEventListener('click', function(e) {
            if (e.target === self.overlay) {
                self.handleClose();
            }
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                self.handleClose();
            }
        });
    }

    bindEvents() {
        this.eventBus.on('dialog:show', (config) => this.show(config));
        this.eventBus.on('dialog:hide', () => this.hide());
    }

    handleConfirm() {
        if (this.currentConfig && this.currentConfig.onConfirm) {
            this.currentConfig.onConfirm();
        }
        this.hide();
    }

    handleCancel() {
        if (this.currentConfig && this.currentConfig.onCancel) {
            this.currentConfig.onCancel();
        }
        this.hide();
    }

    handleClose() {
        if (this.currentConfig && this.currentConfig.onClose) {
            this.currentConfig.onClose();
        }
        this.hide();
    }

    hide() {
        if (this.overlay) {
            this.overlay.classList.remove('dialog-overlay-show');
        }
        if (this.dialog) {
            this.dialog.classList.remove('dialog-show');
        }

        setTimeout(() => {
            if (this.overlay && this.overlay.parentNode) {
                this.overlay.parentNode.removeChild(this.overlay);
            }
            if (this.dialog && this.dialog.parentNode) {
                this.dialog.parentNode.removeChild(this.dialog);
            }
            this.overlay = null;
            this.dialog = null;
            this.currentConfig = null;
        }, 300);
    }

    hideAll() {
        this.hide();
    }

    confirm(message, onConfirm, onCancel) {
        this.show({
            type: 'confirm',
            title: '确认',
            message,
            onConfirm,
            onCancel
        });
    }

    alert(message, onConfirm) {
        this.show({
            type: 'info',
            title: '提示',
            message,
            onConfirm
        });
    }

    error(message, onConfirm) {
        this.show({
            type: 'error',
            title: '错误',
            message,
            onConfirm
        });
    }

    success(message, onConfirm) {
        this.show({
            type: 'success',
            title: '成功',
            message,
            onConfirm
        });
    }
}
