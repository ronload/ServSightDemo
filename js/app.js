/**
 * 主应用程序
 * 负责初始化各个页面和处理导航
 */

// 全局數據加載器實例
window.dataLoader = null;

class App {
    constructor() {
        this.pages = {
            'overview': null,
            'product-comparison': null
        };
        
        this.navItems = null;
        this.pageElements = null;
        
        // 等待 DOM 完全加載後再初始化
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }
    
    // 初始化应用
    async init() {
        try {
            console.log('Initializing application...');
            
            // 獲取頁面元素
            this.navItems = document.querySelectorAll('.nav-item');
            this.pageElements = document.querySelectorAll('.page');
            
            // 初始化數據加載器
            if (!window.dataLoader) {
                window.dataLoader = new DataLoader();
                console.log('DataLoader initialized');
            }
            
            // 绑定导航事件
            this.navItems.forEach(item => {
                item.addEventListener('click', () => {
                    const pageId = item.getAttribute('data-page');
                    this.navigateTo(pageId);
                });
            });
            
            // 初始化各个页面
            await this.initializePages();
            
            // 默认显示总览页面
            this.navigateTo('overview');
            
            console.log('Application initialized successfully');
        } catch (error) {
            console.error('Error initializing application:', error);
        }
    }
    
    // 初始化所有页面
    async initializePages() {
        try {
            console.log('Initializing pages...');
            
            // 初始化总览页面
            this.pages['overview'] = new OverviewPage();
            console.log('Overview page initialized');
            
            // 初始化商品营业额比对页面
            this.pages['product-comparison'] = new ProductComparisonPage();
            console.log('Product comparison page initialized');
            
        } catch (error) {
            console.error('Error initializing pages:', error);
            throw error;
        }
    }
    
    // 导航到指定页面
    navigateTo(pageId) {
        console.log('Navigating to:', pageId);
        
        // 更新导航项的活动状态
        this.navItems.forEach(item => {
            if (item.getAttribute('data-page') === pageId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        
        // 更新页面显示
        this.pageElements.forEach(page => {
            if (page.id === `${pageId}-page`) {
                page.classList.add('active');
            } else {
                page.classList.remove('active');
            }
        });
    }
}

// 創建應用實例
console.log('Creating app instance...');
window.app = new App(); 