export class Logger {
    static debug(message, data) {
        console.debug(`[DEBUG] ${message}`, data || '');
    }

    static info(message, data) {
        console.info(`[INFO] ${message}`, data || '');
    }

    static warn(message, data) {
        console.warn(`[WARN] ${message}`, data || '');
    }

    static error(message, data) {
        console.error(`[ERROR] ${message}`, data || '');
    }

    debug(message, data) {
        Logger.debug(message, data);
    }

    info(message, data) {
        Logger.info(message, data);
    }

    warn(message, data) {
        Logger.warn(message, data);
    }

    error(message, data) {
        Logger.error(message, data);
    }

    static log(level, message, data) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            message,
            data
        };

        switch (level) {
            case 'debug':
                this.debug(message, data);
                break;
            case 'info':
                this.info(message, data);
                break;
            case 'warn':
                this.warn(message, data);
                break;
            case 'error':
                this.error(message, data);
                break;
            default:
                console.log(logEntry);
        }

        return logEntry;
    }
}
