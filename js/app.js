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
        this.mobileNavItems = null; // 新增移動端導航項
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
            this.mobileNavItems = document.querySelectorAll('.mobile-nav-item'); // 獲取移動端導航項
            this.pageElements = document.querySelectorAll('.page');
            
            // 初始化數據加載器
            if (!window.dataLoader) {
                window.dataLoader = new DataLoader();
                console.log('DataLoader initialized');
            }
            
            // 绑定桌面端导航事件
            this.navItems.forEach(item => {
                item.addEventListener('click', () => {
                    const pageId = item.getAttribute('data-page');
                    this.navigateTo(pageId);
                });
            });
            
            // 绑定移動端底部导航事件
            this.mobileNavItems.forEach(item => {
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
        
        // 更新桌面端导航项的活动状态
        this.navItems.forEach(item => {
            if (item.getAttribute('data-page') === pageId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        
        // 更新移動端导航项的活动状态
        this.mobileNavItems.forEach(item => {
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
                
                // 在顯示頁面後調整日期選擇器
                setTimeout(() => {
                    console.log('Updating date selectors for page:', pageId);
                    
                    // 檢查是否為移動端並正確應用樣式
                    const isMobile = window.matchMedia("(max-width: 768px)").matches;
                    if (isMobile) {
                        if (pageId === 'product-comparison' && this.pages['product-comparison']) {
                            console.log('Applying mobile styles to product comparison page');
                            this.pages['product-comparison'].applyMobileStyles();
                        } else if (pageId === 'overview' && this.pages['overview']) {
                            console.log('Applying mobile styles to overview page');
                            this.pages['overview'].applyMobileStyles();
                        }
                    }
                    
                    handleResponsiveDisplay(); // 確保在頁面切換時應用正確的佈局
                }, 50);
                
                // 使用多個延遲確保在各種情況下樣式都能正確應用
                if (pageId === 'product-comparison' && this.pages['product-comparison']) {
                    const delays = [100, 300, 600, 1000];
                    delays.forEach(delay => {
                        setTimeout(() => {
                            const isMobile = window.matchMedia("(max-width: 768px)").matches;
                            if (isMobile) {
                                console.log(`Reapplying product comparison mobile styles (${delay}ms)`);
                                this.pages['product-comparison'].applyMobileStyles();
                            }
                        }, delay);
                    });
                }
            } else {
                page.classList.remove('active');
            }
        });
    }
}

// 創建應用實例
console.log('Creating app instance...');
window.app = new App();

// 處理移動端和PC端的顯示差異
function handleResponsiveDisplay() {
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    console.log('Device is mobile:', isMobile);
    
    // 獲取所有日期選擇器
    const dateSelectors = document.querySelectorAll('.date-selector');
    console.log('Found date selectors:', dateSelectors.length);
    
    // 不在頁面加載時對日期選擇器進行處理，避免與OverviewPage和ProductComparisonPage中的初始化衝突
    // 這個函數將只在必要時通過window.handleResponsiveDisplay()手動調用
    
    // 確保所有js函數都能訪問到這個函數
    window.handleResponsiveDisplay = handleResponsiveDisplay;
}

// 移除這些自動載入時的事件監聽器，避免與頁面自身的初始化衝突
// 確保頁面載入和窗口大小變化時都調用
// 不需要再監聽load和resize事件，因為已經由overview.js和productComparison.js處理
/* 
window.addEventListener('load', function() {
    console.log('Window loaded, applying responsive display');
    handleResponsiveDisplay();
    
    // 額外調整：修復初始化時可能的布局問題
    setTimeout(handleResponsiveDisplay, 500);
});

window.addEventListener('resize', function() {
    console.log('Window resized, applying responsive display');
    handleResponsiveDisplay();
});
*/

// 移除舊的處理函數
document.addEventListener('DOMContentLoaded', function() {
    // 移除舊處理函數
    window.adjustDateSelectorForMobile = function() {
        handleResponsiveDisplay();
    };
}); 