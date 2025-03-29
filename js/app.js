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
                selector.appendChild(dateInputsContainer);
                selector.appendChild(button);
                
                console.log('Date selector restructured successfully');
            });
        }
        
        // 初始化移動端頂部日期選擇器
        function initMobileTopNav() {
            console.log('Initializing mobile top nav');
            
            // 獲取移動端和原始日期選擇器元素
            const mobileStartDate = document.getElementById('mobile-start-date');
            const mobileEndDate = document.getElementById('mobile-end-date');
            
            const originalStartDate = document.getElementById('start-date');
            const originalEndDate = document.getElementById('end-date');
            const originalConfirmBtn = document.getElementById('date-confirm');
            
            const productStartDate = document.getElementById('product-start-date');
            const productEndDate = document.getElementById('product-end-date');
            const productConfirmBtn = document.getElementById('product-date-confirm');
            
            if (!mobileStartDate || !mobileEndDate) {
                console.log('Mobile date selector elements not found');
                return;
            }
            
            // 獲取原始 flatpickr 實例
            let originalStartDateInstance = null;
            let originalEndDateInstance = null;
            let productStartDateInstance = null;
            let productEndDateInstance = null;
            
            // 檢查原始元素是否已經初始化 flatpickr
            if (originalStartDate && originalStartDate._flatpickr) {
                originalStartDateInstance = originalStartDate._flatpickr;
            }
            
            if (originalEndDate && originalEndDate._flatpickr) {
                originalEndDateInstance = originalEndDate._flatpickr;
            }
            
            if (productStartDate && productStartDate._flatpickr) {
                productStartDateInstance = productStartDate._flatpickr;
            }
            
            if (productEndDate && productEndDate._flatpickr) {
                productEndDateInstance = productEndDate._flatpickr;
            }
            
            // 設置默認日期值
            const defaultStartDate = originalStartDate ? originalStartDate.value : "2025-02-01";
            const defaultEndDate = originalEndDate ? originalEndDate.value : new Date().toISOString().split('T')[0];
            
            console.log('Default dates:', defaultStartDate, defaultEndDate);
            
            // 確保日期選擇器容器已經在 DOM 中
            if (!document.querySelector('.mobile-date-selector')) {
                console.error('Mobile date selector container not found');
                return;
            }
            
            // 自動觸發確認按鈕的函數
            const triggerConfirmButton = () => {
                console.log('Auto triggering confirm button');
                
                // 獲取目前激活的頁面
                const activePage = document.querySelector('.page.active');
                if (activePage) {
                    if (activePage.id === 'overview-page' && originalConfirmBtn) {
                        originalConfirmBtn.click();
                    } else if (activePage.id === 'product-comparison-page' && productConfirmBtn) {
                        productConfirmBtn.click();
                    }
                }
            };
            
            // 初始化移動端日期選擇器
            const mobileStartDatePicker = flatpickr("#mobile-start-date", {
                locale: 'zh_tw',
                dateFormat: "Y-m-d",
                defaultDate: defaultStartDate,
                maxDate: defaultEndDate,
                disableMobile: true, // 確保在移動設備上也使用自定義日曆
                static: false, // 避免使用靜態模式，讓日曆正常彈出
                position: "below", // 將日曆放在輸入框下方
                onOpen: function(selectedDates, dateStr, instance) {
                    // 獲取頂部導航欄的高度
                    const topNavHeight = document.querySelector('.mobile-top-nav').offsetHeight;
                    // 設置日曆容器位置
                    setTimeout(() => {
                        const calendar = instance.calendarContainer;
                        const inputRect = instance.element.getBoundingClientRect();
                        calendar.style.top = `${topNavHeight + 5}px`;
                        calendar.style.left = `${inputRect.left}px`;
                        calendar.style.width = `${Math.min(320, window.innerWidth - 40)}px`;
                    }, 0);
                    document.body.classList.add('flatpickr-mobile-open');
                },
                onClose: function() {
                    document.body.classList.remove('flatpickr-mobile-open');
                },
                onChange: (selectedDates, dateStr) => {
                    if (selectedDates[0]) {
                        mobileEndDatePicker.set('minDate', dateStr);
                        
                        // 同步到原始日期選擇器
                        if (originalStartDate) {
                            if (originalStartDateInstance) {
                                originalStartDateInstance.setDate(dateStr);
                            } else {
                                originalStartDate.value = dateStr;
                                const event = new Event('change');
                                originalStartDate.dispatchEvent(event);
                            }
                        }
                        
                        // 同步到產品頁面日期選擇器
                        const activePage = document.querySelector('.page.active');
                        if (activePage && activePage.id === 'product-comparison-page' && productStartDate) {
                            if (productStartDateInstance) {
                                productStartDateInstance.setDate(dateStr);
                            } else {
                                productStartDate.value = dateStr;
                                const event = new Event('change');
                                productStartDate.dispatchEvent(event);
                            }
                        }
                        
                        // 如果結束日期已設置，自動觸發確認按鈕
                        if (mobileEndDate.value) {
                            triggerConfirmButton();
                        }
                    }
                }
            });

            const mobileEndDatePicker = flatpickr("#mobile-end-date", {
                locale: 'zh_tw',
                dateFormat: "Y-m-d",
                defaultDate: defaultEndDate,
                minDate: defaultStartDate,
                maxDate: "today",
                disableMobile: true, // 確保在移動設備上也使用自定義日曆
                static: false, // 避免使用靜態模式，讓日曆正常彈出
                position: "below", // 將日曆放在輸入框下方
                onOpen: function(selectedDates, dateStr, instance) {
                    // 獲取頂部導航欄的高度
                    const topNavHeight = document.querySelector('.mobile-top-nav').offsetHeight;
                    // 設置日曆容器位置
                    setTimeout(() => {
                        const calendar = instance.calendarContainer;
                        const inputRect = instance.element.getBoundingClientRect();
                        calendar.style.top = `${topNavHeight + 5}px`;
                        calendar.style.left = 'auto';
                        calendar.style.right = '10px';
                        calendar.style.width = `${Math.min(320, window.innerWidth - 40)}px`;
                    }, 0);
                    document.body.classList.add('flatpickr-mobile-open');
                },
                onClose: function() {
                    document.body.classList.remove('flatpickr-mobile-open');
                },
                onChange: (selectedDates, dateStr) => {
                    if (selectedDates[0]) {
                        mobileStartDatePicker.set('maxDate', dateStr);
                        
                        // 同步到原始日期選擇器
                        if (originalEndDate) {
                            if (originalEndDateInstance) {
                                originalEndDateInstance.setDate(dateStr);
                            } else {
                                originalEndDate.value = dateStr;
                                const event = new Event('change');
                                originalEndDate.dispatchEvent(event);
                            }
                        }
                        
                        // 同步到產品頁面日期選擇器
                        const activePage = document.querySelector('.page.active');
                        if (activePage && activePage.id === 'product-comparison-page' && productEndDate) {
                            if (productEndDateInstance) {
                                productEndDateInstance.setDate(dateStr);
                            } else {
                                productEndDate.value = dateStr;
                                const event = new Event('change');
                                productEndDate.dispatchEvent(event);
                            }
                        }
                        
                        // 選擇完結束日期後自動觸發確認按鈕
                        triggerConfirmButton();
                    }
                }
            });
            
            // 將 flatpickr 實例保存到全局變量
            window.mobileStartDatePicker = mobileStartDatePicker;
            window.mobileEndDatePicker = mobileEndDatePicker;
            
            // 監聽頁面切換，更新頂部導航欄的日期
            if (window.app) {
                const originalNavigateTo = window.app.navigateTo;
                window.app.navigateTo = function(pageId) {
                    originalNavigateTo.call(window.app, pageId);
                    window.app.currentPage = window.app.pages[pageId];
                    
                    setTimeout(() => {
                        // 根據頁面更新移動端日期選擇器
                        if (pageId === 'overview' && originalStartDate && originalEndDate) {
                            mobileStartDatePicker.setDate(originalStartDate.value || defaultStartDate);
                            mobileEndDatePicker.setDate(originalEndDate.value || defaultEndDate);
                        } else if (pageId === 'product-comparison' && productStartDate && productEndDate) {
                            mobileStartDatePicker.setDate(productStartDate.value || defaultStartDate);
                            mobileEndDatePicker.setDate(productEndDate.value || defaultEndDate);
                        }
                    }, 100);
                };
            }
            
            console.log('Mobile top nav initialized successfully');
        }
        
        // 執行調整
        adjustDateSelectorForMobile();
        
        // 由於頂部日期選擇器需要在調整後才能初始化，使用更長的延遲
        setTimeout(function() {
            initMobileTopNav();
        }, 500);
        
        // 當窗口大小變化時重新調整
        window.addEventListener('resize', function() {
            // 只在移動端視圖調整結構
            if (window.innerWidth <= 768) {
                adjustDateSelectorForMobile();
            }
        });
    }, 300);
}); 