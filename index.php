<?php
$pageTitle = '任工记工';
$isHome = true;
include 'html-new/header.php';
?>
    <div id="app"></div>
    <script type="module" src="js-core/utils.js"></script>
    <script type="module" src="js-core/storage.js"></script>
    <script type="module" src="js-core/logger.js"></script>
    <script type="module" src="js-core/event-bus.js"></script>
    <script type="module" src="js-components/dialog.js"></script>
    <script type="module" src="js-components/form-dialog.js"></script>
    <script type="module" src="js-components/toast.js"></script>
    <script type="module" src="js-shared/theme.js"></script>
    <script type="module" src="js-pages/home.js"></script>
    <script type="module">
        import { App } from './app.js';

        const app = new App({
            container: document.getElementById('app'),
            page: 'home'
        });
        
        app.init().then(() => {
            console.log('应用初始化成功！');
        }).catch((error) => {
            console.error('应用初始化失败:', error);
        });
    </script>
<?php
include 'html-new/menu.php';
include 'html-new/footer.php';
?>
