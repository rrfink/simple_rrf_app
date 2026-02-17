    <div class="mobile-menu" id="mobileMenu">
        <div class="mobile-menu-overlay" data-action="toggle-menu"></div>
        <div class="mobile-menu-content">
            <div class="mobile-menu-header">
                <h3>菜单</h3>
                <button class="mobile-menu-close" data-action="toggle-menu">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="mobile-menu-items">
                <?php if ($isHome): ?>
                <button class="mobile-menu-item" data-action="show-personal-info">
                    <i class="fas fa-user"></i>
                    <span>个人信息</span>
                </button>
                <button class="mobile-menu-item" data-action="show-project-info">
                    <i class="fas fa-building"></i>
                    <span>项目信息</span>
                </button>
                <?php endif; ?>
                <a href="../index.php" class="mobile-menu-item <?php echo $isHome ? 'active' : ''; ?>">
                    <i class="fas fa-home"></i>
                    <span>主页</span>
                </a>
                <a href="phonebook.php" class="mobile-menu-item <?php echo $page === 'phonebook' ? 'active' : ''; ?>">
                    <i class="fas fa-address-book"></i>
                    <span>电话簿</span>
                </a>
                <a href="project-management.php" class="mobile-menu-item <?php echo $page === 'project' ? 'active' : ''; ?>">
                    <i class="fas fa-building"></i>
                    <span>项目管理</span>
                </a>
                <a href="data-management.php" class="mobile-menu-item <?php echo $page === 'data' ? 'active' : ''; ?>">
                    <i class="fas fa-database"></i>
                    <span>数据管理</span>
                </a>
                <a href="query.php" class="mobile-menu-item <?php echo $page === 'query' ? 'active' : ''; ?>">
                    <i class="fas fa-search"></i>
                    <span>查询分析</span>
                </a>
            </div>
        </div>
    </div>
