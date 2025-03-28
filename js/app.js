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
                
                // 調整頁面內的日期選擇器
                setTimeout(() => {
                    const dateSelector = page.querySelector('.date-selector');
                    if (dateSelector) {
                        // 確保日期選擇器高度一致
                        dateSelector.style.height = 'auto';
                        
                        // 確保在不同頁面之間切換時調整日期選擇器
                        if (window.innerWidth <= 768) {
                            // 重新調用調整函數
                            adjustDateSelectorForMobile();
                        }
                    }
                }, 100);
            } else {
                page.classList.remove('active');
            }
        });
    }
}

// 創建應用實例
console.log('Creating app instance...');
window.app = new App();

// 在頁面加載完成後執行
document.addEventListener('DOMContentLoaded', function() {
    // 延遲執行確保 DOM 已加載
    setTimeout(function() {
        // 調整日期選擇器結構
        function adjustDateSelectorForMobile() {
            console.log('Adjusting date selector for mobile');
            const dateSelectors = document.querySelectorAll('.date-selector');
            
            dateSelectors.forEach(selector => {
                // 檢查是否已經調整過
                if (selector.querySelector('.date-inputs-container')) {
                    return;
                }
                
                const inputs = selector.querySelectorAll('input[type="text"]');
                if (inputs.length < 2) {
                    console.log('Not enough inputs found');
                    return;
                }
                
                const separator = selector.querySelector('.date-separator');
                const button = selector.querySelector('button');
                
                if (!separator || !button) {
                    console.log('Missing separator or button');
                    return;
                }
                
                // 創建一個容器用於水平排列日期輸入框
                const dateInputsContainer = document.createElement('div');
                dateInputsContainer.className = 'date-inputs-container';
                
                // 清空選擇器內容
                const startDateInput = inputs[0];
                const endDateInput = inputs[1];
                
                // 從原DOM中移除元素
                startDateInput.parentNode.removeChild(startDateInput);
                separator.parentNode.removeChild(separator);
                endDateInput.parentNode.removeChild(endDateInput);
                button.parentNode.removeChild(button);
                
                // 將日期輸入元素添加到容器中
                dateInputsContainer.appendChild(startDateInput);
                dateInputsContainer.appendChild(separator);
                dateInputsContainer.appendChild(endDateInput);
                
                // 將容器和按鈕添加到選擇器中
                selector.innerHTML = ''; // 完全清空內容確保沒有殘留元素
                selector.appendChild(dateInputsContainer);
                selector.appendChild(button);
                
                // 統一日期選擇器高度
                selector.style.height = 'auto';
                
                console.log('Date selector restructured successfully');
            });
        }
        
        // 執行調整
        adjustDateSelectorForMobile();
        
        // 當窗口大小變化時重新調整
        window.addEventListener('resize', function() {
            // 只在移動端視圖調整結構
            if (window.innerWidth <= 768) {
                adjustDateSelectorForMobile();
            }
        });
    }, 300);
});

// 調整日期選擇器結構 - 將函數暴露給window對象
window.adjustDateSelectorForMobile = function() {
    console.log('Adjusting date selector for mobile');
    const dateSelectors = document.querySelectorAll('.date-selector');
    
    dateSelectors.forEach(selector => {
        // 檢查是否已經調整過
        if (selector.querySelector('.date-inputs-container')) {
            return;
        }
        
        const inputs = selector.querySelectorAll('input[type="text"]');
        if (inputs.length < 2) {
            console.log('Not enough inputs found');
            return;
        }
        
        const separator = selector.querySelector('.date-separator');
        const button = selector.querySelector('button');
        
        if (!separator || !button) {
            console.log('Missing separator or button');
            return;
        }
        
        // 取得當前輸入框的值，確保不丟失已選擇的日期
        const startDateValue = inputs[0].value;
        const endDateValue = inputs[1].value;
        
        // 創建一個容器用於水平排列日期輸入框
        const dateInputsContainer = document.createElement('div');
        dateInputsContainer.className = 'date-inputs-container';
        
        // 不直接修改DOM結構，改為克隆元素以保持事件綁定
        const startDateInput = inputs[0].cloneNode(true);
        startDateInput.value = startDateValue;
        
        const endDateInput = inputs[1].cloneNode(true);
        endDateInput.value = endDateValue;
        
        const separatorClone = separator.cloneNode(true);
        const buttonClone = button.cloneNode(true);
        
        // 清空選擇器內容，但保留原始元素的引用
        const parentElement = selector;
        while (parentElement.firstChild) {
            parentElement.removeChild(parentElement.firstChild);
        }
        
        // 將日期輸入元素添加到容器中
        dateInputsContainer.appendChild(startDateInput);
        dateInputsContainer.appendChild(separatorClone);
        dateInputsContainer.appendChild(endDateInput);
        
        // 將容器和按鈕添加到選擇器中
        parentElement.appendChild(dateInputsContainer);
        parentElement.appendChild(buttonClone);
        
        // 統一日期選擇器高度
        parentElement.style.height = 'auto';
        
        // 重新初始化flatpickr
        if (startDateInput.id === 'start-date' && endDateInput.id === 'end-date') {
            // 觸發Overview頁面的重新初始化
            if (window.app && window.app.pages['overview']) {
                setTimeout(() => {
                    window.app.pages['overview'].initializeDatePickers();
                }, 0);
            }
        } else if (startDateInput.id === 'product-start-date' && endDateInput.id === 'product-end-date') {
            // 觸發Product頁面的重新初始化
            if (window.app && window.app.pages['product-comparison']) {
                setTimeout(() => {
                    window.app.pages['product-comparison'].initializeDatePickers();
                }, 0);
            }
        }
        
        console.log('Date selector restructured successfully');
    });
};

// 執行調整
window.adjustDateSelectorForMobile(); 