/**
 * 商品营业额比对页面
 * 显示不同商品的销售趋势和销售总额
 */

class ProductComparisonPage {
    constructor() {
        this.productTrendChart = null;
        this.startDateInput = document.getElementById('product-start-date');
        this.endDateInput = document.getElementById('product-end-date');
        this.dateConfirmBtn = document.getElementById('product-date-confirm');
        this.productSelectionContainer = document.getElementById('product-selection-container');
        this.productSalesContainer = document.getElementById('product-sales-summary');
        this.productTrendChartContainer = document.getElementById('product-trend-chart').parentElement;
        this.selectedProducts = new Set();
        this.productColors = new Map(); // 新增：用於存儲每個商品的固定顏色
        
        // 創建並添加商品選擇彈窗
        this.createProductSelectorModal();
        
        // 設置默認日期
        const today = new Date();
        const defaultStartDate = new Date(2025, 1, 1); // 2025/02/01
        
        this.startDateInput.value = this.formatDate(defaultStartDate);
        this.endDateInput.value = this.formatDate(today);
        
        this.init();
    }
    
    // 創建商品選擇彈窗
    createProductSelectorModal() {
        // 創建彈窗容器
        const modal = document.createElement('div');
        modal.className = 'product-selector-modal';
        
        // 創建彈窗內容
        const modalContent = document.createElement('div');
        modalContent.className = 'product-selector-content';
        
        // 創建彈窗標題欄
        const modalHeader = document.createElement('div');
        modalHeader.className = 'product-selector-header';
        
        const modalTitle = document.createElement('div');
        modalTitle.className = 'product-selector-title';
        modalTitle.textContent = '選擇商品比對';
        
        const closeButton = document.createElement('button');
        closeButton.className = 'close-modal-button';
        closeButton.innerHTML = '&times;';
        closeButton.onclick = () => this.closeProductSelector();
        
        modalHeader.appendChild(modalTitle);
        modalHeader.appendChild(closeButton);
        
        // 將商品選擇器移動到彈窗中
        modalContent.appendChild(modalHeader);
        modalContent.appendChild(this.productSelectionContainer);
        modal.appendChild(modalContent);
        
        // 添加彈窗到頁面
        document.body.appendChild(modal);
        this.productSelectorModal = modal;
        
        // 點擊彈窗外部關閉
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeProductSelector();
            }
        });
        
        // 創建添加按鈕
        const addButton = document.createElement('button');
        addButton.className = 'add-product-button';
        addButton.innerHTML = '+';
        addButton.onclick = () => this.openProductSelector();
        
        // 將添加按鈕添加到商品銷售總額卡片中
        const summaryCard = document.querySelector('.chart-card.product-summary');
        summaryCard.appendChild(addButton);
    }
    
    // 打開商品選擇器
    openProductSelector() {
        this.productSelectorModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // 防止背景滾動
    }
    
    // 關閉商品選擇器
    closeProductSelector() {
        this.productSelectorModal.classList.remove('active');
        document.body.style.overflow = ''; // 恢復背景滾動
    }
    
    // 格式化日期為 YYYY-MM-DD
    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    // 初始化页面
    async init() {
        try {
            console.log('Initializing ProductComparisonPage...');
            
            // 初始化日期選擇器
            this.startDatePicker = flatpickr("#product-start-date", {
                locale: 'zh_tw',
                dateFormat: "Y-m-d",
                defaultDate: this.startDateInput.value,
                maxDate: this.endDateInput.value,
                disableMobile: false,
                position: "below",
                static: true,
                inline: true,
                mode: "single",
                onChange: (selectedDates, dateStr) => {
                    if (selectedDates[0]) {
                        this.endDatePicker.set('minDate', dateStr);
                    }
                }
            });

            this.endDatePicker = flatpickr("#product-end-date", {
                locale: 'zh_tw',
                dateFormat: "Y-m-d",
                defaultDate: this.endDateInput.value,
                minDate: this.startDateInput.value,
                maxDate: "today",
                disableMobile: false,
                position: "below",
                static: true,
                inline: true,
                mode: "single",
                onChange: (selectedDates, dateStr) => {
                    if (selectedDates[0]) {
                        this.startDatePicker.set('maxDate', dateStr);
                    }
                }
            });
            
            // 綁定確認按鈕事件
            this.dateConfirmBtn.addEventListener('click', () => {
                console.log('Date confirm button clicked');
                this.loadData();
            });
        
        // 加载商品列表
        await this.loadProductList();
        
        // 初始加载数据
        this.loadData();
            
            console.log('ProductComparisonPage initialized successfully');
            
        } catch (error) {
            console.error('Error in ProductComparisonPage init:', error);
            alert('頁面初始化失敗，請查看控制台以獲取詳細信息');
        }
    }
    
    // 加载商品列表
    async loadProductList() {
        // 获取商品和类别数据
        const allData = await dataLoader.loadAllData();
        
        // 定義完整的產品分類映射 - 基於實際菜單
        const productCategoryMapping = {
            // 牛肉麵類 - 紅燒系列
            '紅燒牛肉麵': '牛肉麵類',
            '紅燒牛筋牛肉麵': '牛肉麵類',
            '紅燒牛肚牛肉麵': '牛肉麵類',
            '紅燒三寶麵': '牛肉麵類',
            
            // 牛肉麵類 - 川辣系列
            '川辣牛肉麵': '牛肉麵類',
            '川辣牛筋牛肉麵': '牛肉麵類',
            '川辣牛肚牛肉麵': '牛肉麵類',
            '川辣三寶麵': '牛肉麵類',
            
            // 牛肉麵類 - 蕃茄系列
            '蕃茄牛肉麵': '牛肉麵類',
            '蕃茄牛筋牛肉麵': '牛肉麵類',
            '蕃茄牛肚牛肉麵': '牛肉麵類',
            '蕃茄三寶麵': '牛肉麵類',
            '蕃茄牛筋': '牛肉麵類',
            
            // 拌麵類
            '沙茶牛肉乾拌麵': '拌麵類',
            '蒜泥白肉乾麵': '拌麵類',
            '麻醬乾麵': '拌麵類',
            '肉燥乾麵': '拌麵類',
            '麻醬': '拌麵類',
            '肉燥': '拌麵類',
            '麻辣乾麵': '拌麵類',
            '肉煙乾麵': '拌麵類',
            
            // 手作類
            '蒜泥白肉': '手作類',
            '秘製滷牛肚': '手作類',
            '滷水鳥蛋': '手作類',
            '滷雞腿': '手作類',
            '豬耳朵': '手作類',
            '牛肉牛肚拼盤': '手作類',
            '牛肉拼盤': '手作類',
            
            // 小碟類
            '涼拌小黃瓜': '小碟類',
            '涼拌乾絲': '小碟類',
            '桂花豆乾': '小碟類',
            '皮蛋豆腐': '小碟類',
            '海帶絲': '小碟類',
            '燙青菜': '小碟類',
            
            // 湯品類
            '牛肉湯(無肉)': '湯品類',
            '牛肉湯（無肉）': '湯品類',
            '牛肉湯(含肉)': '湯品類',
            '牛肉湯（含肉）': '湯品類',
            '牛肉湯': '湯品類',
            '貢丸湯': '湯品類',
            
            // 飲料類
            '可樂': '飲料類',
            '雪碧': '飲料類',
            '可爾必思': '飲料類',
            '檸檬愛玉': '飲料類',
            '冬瓜茶': '飲料類',
            '綠茶': '飲料類',
            '原萃綠茶': '飲料類',
            '可口可樂': '飲料類',
            '黑麥汁': '飲料類',
            
            // 加點類
            '加牛肉': '加點類',
            '加牛筋': '加點類',
            '加牛肚': '加點類',
            '學生加麵': '加點類',
            '加滷蛋': '加點類',
            '加麵': '加點類',
            '加肉': '加點類',
            '加油蔥': '加點類'
        };
        
        // 按類別分組商品
        const productsByCategory = {};
        
        // 初始化所有預定義類別
        dataLoader.categories.forEach(category => {
            productsByCategory[category] = new Set();
        });
        
        // 獲取所有標準化後的商品名稱
        const allProductNames = new Set();
        allData.forEach(item => {
            if (item.product && !item.product.includes('共計') && !item.product.includes('總計')) {
                allProductNames.add(item.product);
            }
        });
        
        // 根據硬編碼的映射表為每個商品分配類別
        allProductNames.forEach(product => {
            const category = productCategoryMapping[product];
            
            if (category && dataLoader.categories.includes(category)) {
                productsByCategory[category].add(product);
            } else {
                // 如果映射表中沒有該商品，顯示警告但不再加入"其他"類別
                console.warn('未分類商品:', product);
                // 將未分類商品根據名稱特徵自動分類
                if (product.includes('牛肉麵') || product.includes('川辣') || product.includes('紅燒') || product.includes('蕃茄') || product.includes('三寶麵')) {
                    productsByCategory['牛肉麵類'].add(product);
                } else if (product.includes('乾麵') || product.includes('拌麵')) {
                    productsByCategory['拌麵類'].add(product);
                } else if (product.includes('滷') || product.includes('拼盤')) {
                    productsByCategory['手作類'].add(product);
                } else if (product.includes('湯')) {
                    productsByCategory['湯品類'].add(product);
                } else if (product.includes('茶') || product.includes('汁') || product.includes('水') || product.includes('飲')) {
                    productsByCategory['飲料類'].add(product);
                } else if (product.includes('加')) {
                    productsByCategory['加點類'].add(product);
                }
            }
        });
        
        // 清空容器
        this.productSelectionContainer.innerHTML = '';
        
        // 添加全選/取消全選按鈕
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'product-selection-buttons';
        buttonContainer.style.marginBottom = '15px';
        buttonContainer.style.display = 'flex';
        buttonContainer.style.gap = '10px';
        
        const selectAllButton = document.createElement('button');
        selectAllButton.textContent = '全選';
        selectAllButton.className = 'selection-button';
        selectAllButton.style.padding = '5px 10px';
        selectAllButton.style.backgroundColor = '#3498db';
        selectAllButton.style.color = 'white';
        selectAllButton.style.border = 'none';
        selectAllButton.style.borderRadius = '4px';
        selectAllButton.style.cursor = 'pointer';
        
        const deselectAllButton = document.createElement('button');
        deselectAllButton.textContent = '取消全選';
        deselectAllButton.className = 'selection-button';
        deselectAllButton.style.padding = '5px 10px';
        deselectAllButton.style.backgroundColor = '#e74c3c';
        deselectAllButton.style.color = 'white';
        deselectAllButton.style.border = 'none';
        deselectAllButton.style.borderRadius = '4px';
        deselectAllButton.style.cursor = 'pointer';
        
        buttonContainer.appendChild(selectAllButton);
        buttonContainer.appendChild(deselectAllButton);
        
        this.productSelectionContainer.appendChild(buttonContainer);
        
        // 創建商品選擇器容器 (使用 accordion 樣式)
        const accordionContainer = document.createElement('div');
        accordionContainer.className = 'category-accordion';
        accordionContainer.style.width = '100%';
        accordionContainer.style.maxHeight = '300px';
        accordionContainer.style.overflowY = 'auto';
        accordionContainer.style.border = '1px solid #eee';
        accordionContainer.style.borderRadius = '8px';
        
        // 使用預定義的類別順序，確保顯示順序一致
        const categoriesToDisplay = [...dataLoader.categories];
        
        // 為每個類別創建一個 accordion 區塊
        categoriesToDisplay.forEach(category => {
            if (!productsByCategory[category] || productsByCategory[category].size === 0) {
                return;
            }
            
            const categoryBlock = document.createElement('div');
            categoryBlock.className = 'category-block';
            
            const categoryHeader = document.createElement('div');
            categoryHeader.className = 'category-header';
            categoryHeader.textContent = category;
            categoryHeader.style.display = 'flex';
            categoryHeader.style.justifyContent = 'space-between';
            categoryHeader.style.alignItems = 'center';
            
            const productCount = document.createElement('span');
            productCount.textContent = `(${productsByCategory[category].size} 項)`;
            productCount.style.fontSize = '12px';
            productCount.style.color = '#6c757d';
            categoryHeader.appendChild(productCount);
            
            const indicator = document.createElement('span');
            indicator.textContent = '▼';
            indicator.style.fontSize = '12px';
            indicator.style.transition = 'transform 0.3s';
            categoryHeader.appendChild(indicator);
            
            const productContainer = document.createElement('div');
            productContainer.className = category === '牛肉麵類' ? 
                'product-container beef-noodles' : 
                'product-container other-category';
            
            // 特別處理牛肉麵類
                if (category === '牛肉麵類') {
                // 按口味分類商品
                const flavorGroups = {
                    '紅燒': [],
                    '川辣': [],
                    '蕃茄': []
                };
                
                // 將商品分類到對應的口味組
                Array.from(productsByCategory[category]).forEach(product => {
                    if (product.includes('紅燒')) {
                        flavorGroups['紅燒'].push(product);
                    } else if (product.includes('川辣')) {
                        flavorGroups['川辣'].push(product);
                    } else if (product.includes('蕃茄')) {
                        flavorGroups['蕃茄'].push(product);
                    }
                });

                // 定義牛肉麵排序函數
                const sortBeefNoodles = (a, b) => {
                    const order = {
                        '牛肉麵': 1,
                        '牛筋牛肉麵': 2,
                        '牛肚牛肉麵': 3,
                        '三寶麵': 4
                    };
                    
                    // 提取基本品項名稱（去除紅燒/川辣/蕃茄前綴）
                    const getBaseName = (name) => {
                        return name.replace(/^(紅燒|川辣|蕃茄)/, '');
                    };
                    
                    const baseNameA = getBaseName(a);
                    const baseNameB = getBaseName(b);
                    
                    return (order[baseNameA] || 99) - (order[baseNameB] || 99);
                };
                
                // 為每個口味創建一行
                Object.entries(flavorGroups).forEach(([flavor, products]) => {
                    if (products.length > 0) {
                        const flavorRow = document.createElement('div');
                        flavorRow.className = 'flavor-row';
                        
                        const flavorLabel = document.createElement('div');
                        flavorLabel.className = 'flavor-label';
                        flavorLabel.textContent = `${flavor}系列`;
                        flavorRow.appendChild(flavorLabel);
                        
                        // 使用自定義排序函數
                        products.sort(sortBeefNoodles).forEach(product => {
                            const checkbox = this.createProductCheckbox(product);
                            flavorRow.appendChild(checkbox);
                        });
                        
                        productContainer.appendChild(flavorRow);
                    }
                });
            } else {
                // 其他類別的商品直接橫向排列
                const categoryProducts = Array.from(productsByCategory[category]).sort();
            categoryProducts.forEach(product => {
                    const checkbox = this.createProductCheckbox(product);
                productContainer.appendChild(checkbox);
                });
            }
            
            // 類別按鈕的事件處理
            selectAllButton.addEventListener('click', () => {
                const checkboxes = productContainer.querySelectorAll('input[type="checkbox"]');
                checkboxes.forEach(checkbox => {
                    checkbox.checked = true;
                    this.selectedProducts.add(checkbox.value);
                });
                this.loadData();
            });
            
            deselectAllButton.addEventListener('click', () => {
                const checkboxes = productContainer.querySelectorAll('input[type="checkbox"]');
                checkboxes.forEach(checkbox => {
                    checkbox.checked = false;
                    this.selectedProducts.delete(checkbox.value);
                });
                this.loadData();
            });
            
            // 收起/展開功能
            categoryHeader.addEventListener('click', (e) => {
                // 如果點擊的是按鈕或按鈕內的元素，不觸發收起/展開
                if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
                    return;
                }
                
                if (productContainer.style.display === 'none') {
                    productContainer.style.display = 'flex';
                    indicator.style.transform = 'rotate(0deg)';
                } else {
                    productContainer.style.display = 'none';
                    indicator.style.transform = 'rotate(-90deg)';
                }
            });
            
            // 默認展開
            productContainer.style.display = 'flex';
            
            // 添加到類別區塊
            categoryBlock.appendChild(categoryHeader);
            categoryBlock.appendChild(productContainer);
            
            // 添加到 accordion 容器
            accordionContainer.appendChild(categoryBlock);
        });
        
        // 添加 accordion 到總容器
        this.productSelectionContainer.appendChild(accordionContainer);
        
        // 全選按鈕事件
        selectAllButton.addEventListener('click', () => {
            const checkboxes = accordionContainer.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = true;
                this.selectedProducts.add(checkbox.value);
            });
            this.loadData();
        });
        
        // 取消全選按鈕事件
        deselectAllButton.addEventListener('click', () => {
            const checkboxes = accordionContainer.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = false;
                this.selectedProducts.delete(checkbox.value);
            });
            this.loadData();
        });
        
        // 日誌記錄分類結果
        console.log('商品分類結果:', productsByCategory);
    }
    
    // 新增一個輔助方法來創建商品勾選框
    createProductCheckbox(product) {
        const checkbox = document.createElement('div');
        checkbox.className = 'product-checkbox';
        checkbox.innerHTML = `
            <input type="checkbox" id="product-${product}" value="${product}">
            <label for="product-${product}">${product}</label>
        `;

        const input = checkbox.querySelector('input');
        input.addEventListener('change', () => {
            if (input.checked) {
                this.selectedProducts.add(product);
            } else {
                this.selectedProducts.delete(product);
            }
            this.loadData();
        });

        return checkbox;
    }
    
    // 加载数据
    async loadData() {
        try {
            console.log('Loading data...');
            console.log('Start date input value:', this.startDateInput.value);
            console.log('End date input value:', this.endDateInput.value);
            
            const startDate = new Date(this.startDateInput.value);
            const endDate = new Date(this.endDateInput.value);
            
            console.log('Parsed start date:', startDate);
            console.log('Parsed end date:', endDate);
            
            // 驗證日期是否有效
            if (isNaN(startDate.getTime())) {
                console.error('Invalid start date');
                alert('請選擇有效的開始日期');
            return;
        }
        
            if (isNaN(endDate.getTime())) {
                console.error('Invalid end date');
                alert('請選擇有效的結束日期');
                return;
            }
            
            // 確保結束日期不早於開始日期
            if (endDate < startDate) {
                console.error('End date is earlier than start date');
                alert('結束日期不能早於開始日期');
            return;
        }
        
            // 將日期調整為當天的開始和結束時間
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(23, 59, 59, 999);
            
            console.log('Adjusted start date:', startDate);
            console.log('Adjusted end date:', endDate);
            
            // 获取指定日期范围内的数据
            console.log('Fetching data from dataLoader...');
            const data = await dataLoader.getDataByDateRange(startDate, endDate);
            
            console.log('Loaded data count:', data.length);
            
            if (data.length === 0) {
                console.log('No data found for the selected date range');
                alert('所選日期範圍內沒有數據');
            return;
        }
        
        // 更新图表
            this.updateProductTrendChart(data);
            this.updateProductSummary();
            
        } catch (error) {
            console.error('Error loading data:', error);
            alert('加載數據時發生錯誤，請查看控制台以獲取詳細信息');
        }
    }
    
    // 為商品分配顏色
    getProductColor(product) {
        if (!this.productColors.has(product)) {
            // 如果該商品還沒有顏色，生成一個新的顏色
            const hue = (this.productColors.size * 137.5) % 360; // 使用黃金角度來分配顏色
            this.productColors.set(product, `hsl(${hue}, 70%, 50%)`);
        }
        return this.productColors.get(product);
    }
    
    // 更新商品销售趋势折线图
    updateProductTrendChart(data) {
        try {
            console.log('Updating product trend chart...');
            
            const chartCanvas = document.getElementById('product-trend-chart');
            
            // 如果没有选择的产品，显示提示信息
        if (this.selectedProducts.size === 0) {
                // 清空圖表
                if (this.productTrendChart) {
                    this.productTrendChart.destroy();
                    this.productTrendChart = null;
                }
                chartCanvas.parentElement.innerHTML = '<canvas id="product-trend-chart"></canvas><div class="no-data-message">選擇商品進行比較</div>';
            return;
        }
        
            // 如果已經有圖表實例，直接更新數據
            if (this.productTrendChart) {
                this.productTrendChart.destroy();
            }
            
            // 確保 canvas 存在
            if (chartCanvas.parentElement.querySelector('.no-data-message')) {
                chartCanvas.parentElement.innerHTML = '<canvas id="product-trend-chart"></canvas>';
            }
            
            // 按日期分组数据
            const salesByDate = new Map();
            const quantityByDate = new Map();
            
            data.forEach(item => {
                if (!item.product) return;
                
                // 標準化商品名稱
                const standardizedProduct = item.product;
                
                // 如果不是選中的商品，跳過
                if (!this.selectedProducts.has(standardizedProduct)) return;
                
                if (!salesByDate.has(item.date)) {
                    salesByDate.set(item.date, new Map());
                    quantityByDate.set(item.date, new Map());
                }
                
                const dateProducts = salesByDate.get(item.date);
                const dateQuantities = quantityByDate.get(item.date);
                
                // 累加銷售額
                dateProducts.set(
                    standardizedProduct,
                    (dateProducts.get(standardizedProduct) || 0) + (item.amount || 0)
                );
                
                // 累加數量
                dateQuantities.set(
                    standardizedProduct,
                    (dateQuantities.get(standardizedProduct) || 0) + (item.quantity || 0)
                );
            });
            
            // 获取所有日期并排序
            const dates = Array.from(salesByDate.keys()).sort();
            
            // 為每個選中的產品創建數據集
            const datasets = Array.from(this.selectedProducts).map(product => {
                const isStudentNoodle = product === '學生加麵';
                const data = dates.map(date => {
                    if (isStudentNoodle) {
                        const productQuantities = quantityByDate.get(date);
                        return productQuantities ? (productQuantities.get(product) || 0) : 0;
                    } else {
                        const productSales = salesByDate.get(date);
                        return productSales ? (productSales.get(product) || 0) : 0;
                    }
                });
                
                const color = this.getProductColor(product);
                
                return {
                    label: isStudentNoodle ? `${product} (數量)` : product,
                    data: data,
                    borderColor: color,
                    backgroundColor: color,
                fill: false,
                    tension: 0.4,
                    yAxisID: isStudentNoodle ? 'quantity' : 'sales'
                };
            });
            
            // 檢查是否有學生加麵
            const hasStudentNoodle = this.selectedProducts.has('學生加麵');
            
            // 创建图表
            const ctx = document.getElementById('product-trend-chart').getContext('2d');
            this.productTrendChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: dates,
                    datasets: datasets
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: false
                        },
                        legend: {
                            display: false
                        },
                        tooltip: {
                            mode: 'index',
                            intersect: false,
                            callbacks: {
                                label: function(context) {
                                    let label = context.dataset.label || '';
                                    if (label) {
                                        label += ': ';
                                    }
                                    if (context.parsed.y !== null) {
                                        if (context.dataset.yAxisID === 'quantity') {
                                            label += context.parsed.y + ' 份';
                                        } else {
                                            label += new Intl.NumberFormat('zh-TW', {
                                                style: 'currency',
                                                currency: 'TWD',
                                                minimumFractionDigits: 0
                                            }).format(context.parsed.y);
                                        }
                                    }
                                    return label;
                                }
                            }
                        }
                    },
                    interaction: {
                        mode: 'nearest',
                        axis: 'x',
                        intersect: false
                    },
                    scales: {
                        x: {
                            type: 'time',
                            time: {
                                parser: 'YYYY/MM/DD',
                                tooltipFormat: 'YYYY/MM/DD',
                                unit: 'day'
                            },
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)',
                                drawBorder: false
                            },
                            ticks: {
                                color: '#a0a0a0'
                            }
                        },
                        sales: {
                            type: 'linear',
                            display: true,
                            position: 'left',
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)',
                                drawBorder: false
                            },
                            ticks: {
                                color: '#a0a0a0',
                                callback: function(value) {
                                    return new Intl.NumberFormat('zh-TW', {
                                        style: 'currency',
                                        currency: 'TWD',
                                        minimumFractionDigits: 0
                                    }).format(value);
                                }
                            }
                        },
                        quantity: {
                            type: 'linear',
                            display: hasStudentNoodle,
                            position: 'right',
                            beginAtZero: true,
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)',
                                drawOnChartArea: false
                            },
                            ticks: {
                                color: '#a0a0a0'
                            }
                        }
                    }
                }
            });
            
            console.log('Product trend chart updated successfully');
            
        } catch (error) {
            console.error('Error updating product trend chart:', error);
            alert('更新商品趨勢圖表時發生錯誤，請查看控制台以獲取詳細信息');
        }
    }
    
    // 計算商品摘要信息
    calculateProductSummary(product) {
        const salesData = this.salesData;
        if (!salesData || !salesData.dailyData || salesData.dailyData.length === 0) {
            return null;
        }
        
        let totalSales = 0;
        let totalQuantity = 0;
        let comboCount = 0;
        let singleCount = 0;
        
        // 遍历所有日期的数据
        salesData.dailyData.forEach(day => {
            if (day && day.products) {
                // 遍历每个商品
                Object.keys(day.products).forEach(rawProduct => {
                    const standardProduct = dataLoader.standardizeProductName(rawProduct);
                    
                    // 如果标准化后的商品名称匹配
                    if (standardProduct === product) {
                        const productData = day.products[rawProduct];
                        
                        // 累加销售额和销售量
                        totalSales += productData.sales || 0;
                        totalQuantity += productData.quantity || 0;
                        
                        // 判断是套餐还是单点
                        if (rawProduct.includes('(套餐)')) {
                            comboCount += productData.quantity || 0;
                        } else if (rawProduct.includes('(單點)')) {
                            singleCount += productData.quantity || 0;
                        } else {
                            // 如果没有标识，则加到单点中
                            singleCount += productData.quantity || 0;
                        }
                    }
                });
            }
        });
        
        // 计算平均单价
        const avgPrice = totalQuantity > 0 ? Math.round(totalSales / totalQuantity) : 0;
        
        return {
            totalSales,
            totalQuantity,
            avgPrice,
            comboCount,
            singleCount
        };
    }

    // 更新商品銷售總額摘要
    updateProductSummary() {
        try {
            console.log('Updating product sales summary...');
        
            // 如果没有选择的产品，显示提示信息
        if (this.selectedProducts.size === 0) {
                this.productSalesContainer.innerHTML = '<div class="no-data-message">選擇商品進行比較</div>';
            return;
        }
        
            // 获取日期范围内的数据
            const startDate = new Date(this.startDateInput.value);
            const endDate = new Date(this.endDateInput.value);
            
            // 驗證日期
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                console.error('Invalid date range');
                this.productSalesContainer.innerHTML = '<div class="no-data-message">請選擇有效的日期範圍</div>';
                return;
            }
            
            // 將日期調整為當天的開始和結束時間
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(23, 59, 59, 999);
            
            // 計算日期範圍內的總天數
            const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
            
            // 异步加载数据并更新摘要
            dataLoader.getDataByDateRange(startDate, endDate).then(data => {
                // 计算每个商品的总销售额
                const productSales = new Map();
                const productQuantities = new Map();
                const productDailySales = new Map(); // 記錄每個商品的每日銷售數據
                
                // 初始化每個商品的每日銷售記錄
        this.selectedProducts.forEach(product => {
                    productDailySales.set(product, new Set());
                    productSales.set(product, 0);
                    productQuantities.set(product, 0);
                });
                
                // 添加調試日誌
                console.log('Processing data for selected products:', Array.from(this.selectedProducts));
                
                data.forEach(item => {
                    // 跳過共計和總計行
                    if (item.product.includes('共計') || item.product.includes('總計')) {
                        return;
                    }
                    
                    // 使用原始數據中的標準化商品名稱
                    const standardizedProduct = item.product;
                    
                    // 如果不是選中的商品，跳過
                    if (!this.selectedProducts.has(standardizedProduct)) {
                        return;
                    }
                    
                    // 添加調試日誌
                    console.log('Processing item:', {
                        date: item.date,
                        product: standardizedProduct,
                        rawProduct: item.rawProduct,
                        quantity: item.quantity,
                        amount: item.amount
                    });
                    
                    // 累加銷售額
                    productSales.set(
                        standardizedProduct,
                        productSales.get(standardizedProduct) + (item.amount || 0)
                    );
                    
                    // 累加數量
                    productQuantities.set(
                        standardizedProduct,
                        productQuantities.get(standardizedProduct) + (item.quantity || 0)
                    );
                    
                    // 記錄有銷售的日期
                    if (item.date && item.quantity > 0) {  // 修改：只要有數量就算作有銷售
                        productDailySales.get(standardizedProduct).add(item.date);
                    }
                });
                
                // 添加調試日誌
                console.log('Final sales data:', {
                    sales: Object.fromEntries(productSales),
                    quantities: Object.fromEntries(productQuantities),
                    dailySales: Object.fromEntries([...productDailySales].map(([k, v]) => [k, Array.from(v)]))
                });
                
                // 按銷售數量排序（對於金額為0的商品，使用數量來排序）
                const sortedProducts = Array.from(this.selectedProducts)
                    .sort((a, b) => {
                        const salesA = productSales.get(a) || 0;
                        const salesB = productSales.get(b) || 0;
                        const quantityA = productQuantities.get(a) || 0;
                        const quantityB = productQuantities.get(b) || 0;
                        
                        // 如果兩個商品都有銷售金額，按金額排序
                        if (salesA > 0 && salesB > 0) {
                            return salesB - salesA;
                        }
                        // 如果其中一個沒有銷售金額，按數量排序
                        return quantityB - quantityA;
                    });
                
                // 生成HTML
                let html = '<div class="product-sales-list">';
                
                sortedProducts.forEach(product => {
                    const sales = productSales.get(product) || 0;
                    const totalQuantity = productQuantities.get(product) || 0;
                    const color = this.getProductColor(product);
                    
                    // 計算實際有銷售的天數
                    const actualSalesDays = productDailySales.get(product).size;
                    
                    // 計算平均每日銷售量（基於實際有銷售的天數）
                    const avgDailyQuantity = actualSalesDays > 0 
                        ? (totalQuantity / actualSalesDays)
                        : 0;
                    
                    html += `
                        <div class="product-sales-item">
                            <div class="product-info">
                                <div class="product-name">
                                    <span class="color-indicator" style="background-color: ${color}"></span>
                                    ${product}
                        </div>
                                <div class="sales-amount">
                                    ${new Intl.NumberFormat('zh-TW', {
                                        style: 'currency',
                                        currency: 'TWD',
                                        minimumFractionDigits: 0
                                    }).format(sales)}
                        </div>
                        </div>
                            <div class="quantity-info">
                                <span class="total-quantity">總計 ${totalQuantity} 份</span>
                                <span class="daily-average">平均每日 ${avgDailyQuantity.toFixed(1)} 份</span>
                                <span class="sales-days">(${actualSalesDays} 天有銷售)</span>
                        </div>
                    </div>
                `;
                });
                
                html += '</div>';
                
                // 更新容器内容
                this.productSalesContainer.innerHTML = html;
                
                console.log('Product sales summary updated successfully');
                
            }).catch(error => {
                console.error('Error loading data for product summary:', error);
                this.productSalesContainer.innerHTML = '<div class="no-data-message">加載數據時發生錯誤</div>';
            });
            
        } catch (error) {
            console.error('Error updating product sales summary:', error);
            this.productSalesContainer.innerHTML = '<div class="no-data-message">更新商品銷售總額時發生錯誤</div>';
        }
    }
} 