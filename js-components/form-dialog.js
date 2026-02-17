export class FormDialog {
    constructor(dialog) {
        this.dialog = dialog;
    }

    show(config) {
        const formHtml = this.createForm(config);
        
        this.dialog.show({
            type: config.type || 'info',
            title: config.title || '表单',
            htmlContent: formHtml,
            onConfirm: () => this.handleSubmit(config),
            confirmText: config.confirmText || '保存',
            cancelText: config.cancelText || '取消'
        });

        this.bindFormEvents(config);
    }

    createForm(config) {
        let formHtml = '<form id="dynamicForm" class="form-container">';
        
        if (config.fields) {
            config.fields.forEach(field => {
                formHtml += this.createField(field);
            });
        }
        
        formHtml += '</form>';
        return formHtml;
    }

    createField(field) {
        switch (field.type) {
            case 'text':
                return `
                    <div class="form-group">
                        <label class="form-label">${field.label}</label>
                        <input 
                            type="text" 
                            class="form-input" 
                            name="${field.name}" 
                            value="${field.value || ''}"
                            placeholder="${field.placeholder || ''}"
                            ${field.required ? 'required' : ''}
                        >
                    </div>
                `;
            case 'number':
                return `
                    <div class="form-group">
                        <label class="form-label">${field.label}</label>
                        <input 
                            type="number" 
                            class="form-input" 
                            name="${field.name}" 
                            value="${field.value || ''}"
                            placeholder="${field.placeholder || ''}"
                            ${field.required ? 'required' : ''}
                            ${field.min ? `min="${field.min}"` : ''}
                            ${field.max ? `max="${field.max}"` : ''}
                            ${field.step ? `step="${field.step}"` : ''}
                        >
                    </div>
                `;
            case 'select':
                return `
                    <div class="form-group">
                        <label class="form-label">${field.label}</label>
                        <select class="form-select" name="${field.name}" ${field.required ? 'required' : ''}>
                            ${field.options.map(opt => `
                                <option value="${opt.value}" ${field.value === opt.value ? 'selected' : ''}>
                                    ${opt.label}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                `;
            case 'textarea':
                return `
                    <div class="form-group">
                        <label class="form-label">${field.label}</label>
                        <textarea 
                            class="form-textarea" 
                            name="${field.name}" 
                            placeholder="${field.placeholder || ''}"
                            ${field.required ? 'required' : ''}
                            rows="${field.rows || 4}"
                        >${field.value || ''}</textarea>
                    </div>
                    `;
            case 'date':
                return `
                    <div class="form-group">
                        <label class="form-label">${field.label}</label>
                        <input 
                            type="date" 
                            class="form-input" 
                            name="${field.name}" 
                            value="${field.value || ''}"
                            placeholder="${field.placeholder || ''}"
                            ${field.required ? 'required' : ''}
                        >
                    </div>
                    `;
            default:
                return '';
        }
    }

    bindFormEvents(config) {
        const form = document.getElementById('dynamicForm');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit(form, config);
        });
    }

    handleFormSubmit(form, config) {
        const formData = new FormData(form);
        const data = {};
        
        formData.forEach((value, key) => {
            data[key] = value;
        });

        if (config.onSubmit) {
            config.onSubmit(data);
        }
    }

    handleSubmit(config) {
        const form = document.getElementById('dynamicForm');
        if (form) {
            form.dispatchEvent(new Event('submit'));
        }
    }

    getFormData() {
        const form = document.getElementById('dynamicForm');
        if (!form) return null;

        const formData = new FormData(form);
        const data = {};
        
        formData.forEach((value, key) => {
            data[key] = value;
        });

        return data;
    }
}
