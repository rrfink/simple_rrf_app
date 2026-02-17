# 任工记工 - 新架构

## 目录结构

```
d:\xampp\htdocs\
├── 1/                          # 最老版本（参考）
│   ├── css/
│   ├── html/
│   ├── js/
│   └── ...
│
├── js-core/                     # 核心模块
│   ├── constants.js            # 常量定义
│   ├── logger.js               # 日志系统
│   ├── utils.js                # 工具函数
│   ├── storage.js              # 存储管理
│   └── event-bus.js            # 事件总线
│
├── js-shared/                   # 共享功能模块
│   └── theme.js                # 主题管理
│
├── js-components/               # UI组件
│   ├── dialog.js               # 对话框组件
│   └── toast.js                # 提示组件
│
├── js-pages/                    # 页面模块
│   └── home.js                 # 主页
│
├── css-new/                     # CSS样式
│   ├── variables.css            # CSS变量
│   ├── base.css                # 基础样式
│   ├── components.css          # 组件样式
│   ├── layout.css              # 布局样式
│   ├── toast.css               # Toast样式
│   └── dialog.css              # Dialog样式
│
├── html-new/                    # HTML页面（待开发）
│
├── app.js                       # 应用入口
├── index.html                   # 主页
└── README.md                    # 本文件
```

## 特点

1. **完全手动编写** - 没有复制任何旧代码
2. **无内联样式** - 所有样式都在CSS文件中
3. **模块化设计** - 清晰的模块划分
4. **易于维护** - 代码结构清晰，易于理解和扩展

## 快速开始

### 1. 打开主页

直接在浏览器中打开 `index.html` 即可。

### 2. 核心模块使用

#### StorageManager（存储管理）

```javascript
import { StorageManager } from './js-core/storage.js';

const storage = new StorageManager();
await storage.init();

// IndexedDB 操作
const project = await storage.get('projects', 'project-id');
await storage.set('projects', { id: 'project-id', name: '项目名称' });
const allProjects = await storage.getAll('projects');

// localStorage 操作
const theme = storage.getLocal('theme');
storage.setLocal('theme', 'dark');
```

#### EventBus（事件总线）

```javascript
import { EventBus } from './js-core/event-bus.js';

const eventBus = new EventBus();

// 监听事件
eventBus.on('theme:changed', (data) => {
    console.log('主题已切换:', data.theme);
});

// 发送事件
eventBus.emit('theme:changed', { theme: 'dark' });
```

#### Utils（工具函数）

```javascript
import { Utils } from './js-core/utils.js';

// 日期处理
const formatted = Utils.formatDate(new Date(), 'YYYY-MM-DD');

// 数据处理
const cloned = Utils.deepClone(originalObject);

// 验证
const isValidPhone = Utils.validatePhone('13800138000');

// 格式化
const currency = Utils.formatCurrency(1234.56);
```

### 3. UI组件使用

#### Toast（提示）

```javascript
import { Toast } from './js-components/toast.js';

const toast = new Toast(eventBus);
toast.init();

// 显示不同类型的提示
toast.success('操作成功！');
toast.error('操作失败！');
toast.warning('请注意！');
toast.info('提示信息');
```

#### Dialog（对话框）

```javascript
import { Dialog } from './js-components/dialog.js';

const dialog = new Dialog(eventBus);

// 显示信息对话框
dialog.show({
    type: 'info',
    title: '提示',
    message: '操作成功！',
    onConfirm: () => console.log('确定')
});

// 显示确认对话框
dialog.show({
    type: 'confirm',
    title: '确认',
    message: '确定要删除吗？',
    onConfirm: () => console.log('已删除'),
    onCancel: () => console.log('已取消')
});
```

### 4. 创建新页面

```javascript
export class MyPage {
    constructor(options) {
        this.container = options.container;
        this.eventBus = options.eventBus;
        this.storage = options.storage;
        this.theme = options.theme;
        this.toast = options.toast;
        this.dialog = options.dialog;
        this.logger = options.logger;
    }

    async init() {
        this.logger.info('Initializing my page...');
        
        await this.loadData();
        this.render();
        this.bindEvents();
        
        this.logger.info('My page initialized successfully');
    }

    async loadData() {
    }

    render() {
        this.container.innerHTML = `
            <div class="my-page">
                <h1>我的页面</h1>
            </div>
        `;
    }

    bindEvents() {
        this.container.addEventListener('click', (e) => {
            const action = e.target.closest('[data-action]')?.dataset.action;
            this.handleAction(action);
        });
    }

    handleAction(action) {
        switch (action) {
            case 'some-action':
                this.toast.success('执行操作');
                break;
        }
    }

    async destroy() {
        this.logger.info('Destroying my page...');
        this.container.innerHTML = '';
        this.logger.info('My page destroyed');
    }
}
```

## CSS类说明

### 布局类

- `.container` - 居中容器
- `.container-fluid` - 全宽容器
- `.row` - 行
- `.col-1` 到 `.col-12` - 列

### 间距类

- `.mt-0` 到 `.mt-5` - 上边距
- `.mb-0` 到 `.mb-5` - 下边距
- `.ml-0` 到 `.ml-5` - 左边距
- `.mr-0` 到 `.mr-5` - 右边距
- `.pt-0` 到 `.pt-5` - 上内边距
- `.pb-0` 到 `.pb-5` - 下内边距
- `.pl-0` 到 `.pl-5` - 左内边距
- `.pr-0` 到 `.pr-5` - 右内边距

### Flexbox类

- `.flex` - Flex容器
- `.flex-col` - 垂直方向
- `.items-center` - 垂直居中
- `.justify-center` - 水平居中
- `.justify-between` - 两端对齐

### Grid类

- `.grid` - Grid容器
- `.grid-cols-1` 到 `.grid-cols-4` - 列数
- `.grid-auto-fit` - 自适应列

### 文本类

- `.text-center` - 居中对齐
- `.text-left` - 左对齐
- `.text-right` - 右对齐
- `.text-primary` - 主色文本
- `.text-success` - 成功色文本
- `.text-warning` - 警告色文本
- `.text-error` - 错误色文本
- `.text-secondary` - 次要文本

### 显示类

- `.hidden` - 隐藏
- `.hidden-mobile` - 移动端隐藏
- `.visible` - 可见
- `.invisible` - 不可见

## 开发规范

### 1. 命名规范

- 类名：PascalCase（如 `StorageManager`）
- 函数名：camelCase（如 `loadData`）
- 常量：UPPER_SNAKE_CASE（如 `THEME_LIGHT`）
- 私有属性：_prefix（如 `_privateMethod`）

### 2. 错误处理

- 使用 try-catch 捕获错误
- 使用 Logger 记录错误
- 使用 Toast 显示用户友好的错误信息

### 3. 事件命名

- 使用冒号分隔：`module:action`
- 例如：`theme:changed`、`sync:success`

### 4. CSS规范

- 不使用内联样式
- 使用CSS变量
- 使用工具类
- 保持样式一致性

## 待开发功能

- [ ] 数据管理页面
- [ ] 项目管理页面
- [ ] 电话簿页面
- [ ] 工资历史页面
- [ ] 用户中心
- [ ] 云端同步
- [ ] 数据导入导出

## 参考目录

- `1/` 目录包含最老版本的代码，可以作为参考
- 新架构完全独立，不影响现有功能

## 联系方式

如有问题，请查看参考目录或联系开发团队。
