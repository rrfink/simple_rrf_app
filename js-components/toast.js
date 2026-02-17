export class Toast {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.container = null;
        this.toasts = {};
        this.idCounter = 0;
    }

    init() {
        this.container = document.getElementById('toastContainer');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        }
    }

    show(message, type = 'info', duration = 3000) {
        const id = `toast-${this.idCounter++}`;
        const toast = this.createToast(message, type, id);
        
        this.container.appendChild(toast);
        this.toasts[id] = toast;

        setTimeout(() => {
            this.hide(id);
        }, duration);

        return id;
    }

    createToast(message, type, id) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.id = id;

        const icon = this.getIcon(type);
        const iconElement = document.createElement('i');
        iconElement.className = `fas ${icon}`;

        const messageElement = document.createElement('span');
        messageElement.textContent = message;

        const closeButton = document.createElement('button');
        closeButton.className = 'toast-close';
        closeButton.innerHTML = '<i class="fas fa-times"></i>';
        closeButton.onclick = () => this.hide(id);

        toast.appendChild(iconElement);
        toast.appendChild(messageElement);
        toast.appendChild(closeButton);

        return toast;
    }

    getIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-times-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    hide(id) {
        const toast = this.toasts[id];
        if (!toast) return;

        toast.classList.add('toast-hiding');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
            delete this.toasts[id];
        }, 300);
    }

    hideAll() {
        Object.keys(this.toasts).forEach(id => this.hide(id));
    }

    success(message, duration) {
        return this.show(message, 'success', duration);
    }

    error(message, duration) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration) {
        return this.show(message, 'warning', duration);
    }

    info(message, duration) {
        return this.show(message, 'info', duration);
    }
}
