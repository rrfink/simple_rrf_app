<?php
$pageTitle = isset($pageTitle) ? $pageTitle : '任工记工';
$isHome = isset($isHome) ? $isHome : false;
$activeClass = $isHome ? 'active' : '';
?>
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#165DFF">
    <link rel="icon" type="image/svg+xml" href="../icon.svg">
    <title><?php echo $pageTitle; ?></title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <link rel="stylesheet" href="../css-new/variables.css">
    <link rel="stylesheet" href="../css-new/base.css">
    <link rel="stylesheet" href="../css-new/components.css">
    <link rel="stylesheet" href="../css-new/layout.css">
    <link rel="stylesheet" href="../css-new/toast.css">
    <link rel="stylesheet" href="../css-new/dialog.css">
    <link rel="stylesheet" href="../css-new/form.css">
</head>
<body>
    <header class="app-header">
        <div class="app-header-content">
            <div class="app-logo">
                <i class="fas fa-hard-hat"></i>
                <?php echo $pageTitle; ?>
            </div>
            <div class="flex items-center gap-3">
                <?php if (!$isHome): ?>
                <a href="../index.html" class="nav-link">
                    <i class="fas fa-home"></i>
                </a>
                <?php endif; ?>
                <button class="menu-btn" data-action="toggle-menu">
                    <i class="fas fa-bars"></i>
                </button>
                <button class="menu-btn" data-action="login">
                    <i class="fas fa-user"></i>
                </button>
            </div>
        </div>
    </header>
