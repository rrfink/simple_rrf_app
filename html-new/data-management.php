<?php
$pageTitle = '数据管理 - 任工记工';
$page = 'data';
include 'header.php';
?>
    <div id="app"></div>
    <script type="module" src="../js-core/utils.js"></script>
    <script type="module" src="../js-core/storage.js"></script>
    <script type="module" src="../js-core/logger.js"></script>
    <script type="module" src="../js-core/event-bus.js"></script>
    <script type="module" src="../js-components/dialog.js"></script>
    <script type="module" src="../js-components/form-dialog.js"></script>
    <script type="module" src="../js-components/toast.js"></script>
    <script type="module" src="../js-shared/theme.js"></script>
    <script type="module" src="../js-pages/data-management.js"></script>
    <script type="module">
        import { StorageManager } from '../js-core/storage.js';
        import { Logger } from '../js-core/logger.js';
        import { EventBus } from '../js-core/event-bus.js';
        import { Dialog } from '../js-components/dialog.js';
        import { Toast } from '../js-components/toast.js';
        import { ThemeManager } from '../js-shared/theme.js';
        import { DataManagementPage } from '../js-pages/data-management.js';

        (async () => {
            const container = document.getElementById('app');
            const storage = new StorageManager();
            const logger = new Logger();
            const eventBus = new EventBus();
            const dialog = new Dialog(eventBus);
            const toast = new Toast(eventBus);
            const theme = new ThemeManager(storage, eventBus);

            const page = new DataManagementPage({
                container,
                eventBus,
                storage,
                theme,
                toast,
                dialog,
                logger
            });

            await storage.init();
            await page.init();
        })();
    </script>
<?php
include 'menu.php';
include 'footer.php';
?>
