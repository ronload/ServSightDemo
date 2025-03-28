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
                    handleResponsiveDisplay(); // 確保在頁面切換時應用正確的佈局
                }, 50);
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
    
    dateSelectors.forEach(selector => {
        // 完全重建DOM結構
        if (isMobile) {
            // 獲取按鈕ID和日期值
            let confirmBtnId, startDateId, endDateId, startDateValue = '', endDateValue = '';
            
            // 提取現有日期值（如果存在）
            const existingInputs = selector.querySelectorAll('input[type="text"]');
            if (existingInputs.length >= 2) {
                startDateId = existingInputs[0].id;
                endDateId = existingInputs[1].id;
                startDateValue = existingInputs[0].value || '';
                endDateValue = existingInputs[1].value || '';
                
                // 推斷確認按鈕ID
                if (startDateId === 'start-date') {
                    confirmBtnId = 'date-confirm';
                } else {
                    confirmBtnId = 'product-date-confirm';
                }
            } else {
                // 默認值
                const isOverview = selector.closest('#overview-page') !== null;
                startDateId = isOverview ? 'start-date' : 'product-start-date';
                endDateId = isOverview ? 'end-date' : 'product-end-date';
                confirmBtnId = isOverview ? 'date-confirm' : 'product-date-confirm';
            }
            
            // 完全重寫為行內HTML以避免DOM操作問題
            selector.innerHTML = `
                <div style="width:100%; margin-bottom:15px; padding:0;">
                    <div style="display:flex; width:100%; justify-content:space-between; align-items:center;">
                        <input type="text" id="${startDateId}" value="${startDateValue}" placeholder="開始日期" 
                            style="width:43%; height:70px; font-size:18px; text-align:center; border-radius:16px; 
                                  border:1px solid #444; background:#0a0a0a; color:#fff; padding:0; margin:0;
                                  -webkit-appearance:none; box-sizing:border-box;">
                        <span style="width:10%; text-align:center; color:#a0a0a0; font-size:18px;">至</span>
                        <input type="text" id="${endDateId}" value="${endDateValue}" placeholder="結束日期" 
                            style="width:43%; height:70px; font-size:18px; text-align:center; border-radius:16px; 
                                  border:1px solid #444; background:#0a0a0a; color:#fff; padding:0; margin:0; 
                                  -webkit-appearance:none; box-sizing:border-box;">
                    </div>
                </div>
                <button id="${confirmBtnId}" 
                    style="display:block; width:100%; height:70px; line-height:70px; font-size:20px; font-weight:500; 
                    background-color:#ededed; color:#000; border:none; border-radius:16px; 
                    -webkit-appearance:none; margin:0 auto;">確認</button>
            `;

            console.log(`重新構建移動端選擇器，高度:70px，字體大小:18px，按鈕字體:20px`);
            
            // 添加額外調試和確認
            console.log('檢查元素高度:', selector.querySelector('input').offsetHeight);
            console.log('檢查輸入框樣式:', selector.querySelector('input').getAttribute('style'));
            
            // 立即觸發日期選擇器初始化
            setTimeout(() => {
                if (startDateId === 'start-date' && window.app?.pages?.['overview']) {
                    window.app.pages['overview'].initializeDatePickers();
                    console.log('Reinitialized overview date pickers');
                } else if (startDateId === 'product-start-date' && window.app?.pages?.['product-comparison']) {
                    window.app.pages['product-comparison'].initializeDatePickers();
                    console.log('Reinitialized product date pickers');
                }
            }, 0);
        } else {
            // PC端不做特殊處理，保持原有的CSS樣式布局
            const existingInputs = selector.querySelectorAll('input[type="text"]');
            if (existingInputs.length >= 2) {
                const startDateId = existingInputs[0].id;
                const endDateId = existingInputs[1].id;
                const startDateValue = existingInputs[0].value || '';
                const endDateValue = existingInputs[1].value || '';
                
                // 根據ID確定按鈕ID
                const confirmBtnId = startDateId === 'start-date' ? 'date-confirm' : 'product-date-confirm';
                
                // 標準PC結構
                selector.innerHTML = `
                    <input type="text" id="${startDateId}" value="${startDateValue}" placeholder="開始日期">
                    <span class="date-separator">至</span>
                    <input type="text" id="${endDateId}" value="${endDateValue}" placeholder="結束日期">
                    <button id="${confirmBtnId}">確認</button>
                `;
                
                console.log(`Rebuilt desktop selector for ${startDateId}`);
                
                // 立即觸發日期選擇器初始化
                setTimeout(() => {
                    if (startDateId === 'start-date' && window.app?.pages?.['overview']) {
                        window.app.pages['overview'].initializeDatePickers();
                    } else if (startDateId === 'product-start-date' && window.app?.pages?.['product-comparison']) {
                        window.app.pages['product-comparison'].initializeDatePickers();
                    }
                }, 0);
            }
        }
    });
}

// 確保頁面載入和窗口大小變化時都調用
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

// 移除舊的處理函數
document.addEventListener('DOMContentLoaded', function() {
    // 移除舊處理函數
    window.adjustDateSelectorForMobile = function() {
        handleResponsiveDisplay();
    };
});

// 確保所有js函數都能訪問到這個函數
window.handleResponsiveDisplay = handleResponsiveDisplay; 