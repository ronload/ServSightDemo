/**
/**
 * 总览页面
 * 显示销售趋势、销售额排行和分类占比
 */

class OverviewPage {
    constructor() {
        try {
            console.log('Initializing OverviewPage...');
            
            // 確保 ChartAnnotation 插件可用
            if (!Chart.registry.plugins.get('annotation')) {
                console.log('Registering annotation plugin...');
                Chart.register(ChartAnnotation);
            }
            
            // 初始化圖表相關屬性
            this.salesTrendChart = null;
            this.topProductsChart = null;
            this.categoryPieChart = null;
            this.weekdayChart = null;  // 新增星期平均營業額圖表
            
            // 獲取頁面元素
            console.log('Getting page elements...');
            this.startDateInput = document.getElementById('start-date');
            this.endDateInput = document.getElementById('end-date');
            this.dateConfirmBtn = document.getElementById('date-confirm');
            
            // 獲取統計數據元素
            this.avgSalesElement = document.getElementById('avg-sales');
            this.totalSalesElement = document.getElementById('total-sales');
            this.highestSalesDateElement = document.getElementById('highest-sales-date');
            this.highestSalesAmountElement = document.getElementById('highest-sales-amount');
            this.lowestSalesDateElement = document.getElementById('lowest-sales-date');
            this.lowestSalesAmountElement = document.getElementById('lowest-sales-amount');
            
            // 確保所有必要的元素都存在
            if (!this.startDateInput) {
                throw new Error('Start date input not found');
            }
            if (!this.endDateInput) {
                throw new Error('End date input not found');
            }
            if (!this.dateConfirmBtn) {
                throw new Error('Date confirm button not found');
            }
            if (!this.avgSalesElement || !this.totalSalesElement) {
                throw new Error('Sales statistics elements not found');
            }
            if (!this.highestSalesDateElement || !this.highestSalesAmountElement) {
                throw new Error('Highest sales elements not found');
            }
            if (!this.lowestSalesDateElement || !this.lowestSalesAmountElement) {
                throw new Error('Lowest sales elements not found');
            }
            
            console.log('All required elements found');
            
            // 初始化日期選擇器
            this.startDatePicker = flatpickr("#start-date", {
                locale: 'zh_tw',
                dateFormat: "Y-m-d",
                defaultDate: "2025-02-01",
                maxDate: "today",
                disableMobile: true,
                onChange: (selectedDates, dateStr) => {
                    if (selectedDates[0]) {
                        this.endDatePicker.set('minDate', dateStr);
                    }
                }
            });

            this.endDatePicker = flatpickr("#end-date", {
                locale: 'zh_tw',
                dateFormat: "Y-m-d",
                defaultDate: new Date(),
                maxDate: "today",
                disableMobile: true,
                onChange: (selectedDates, dateStr) => {
                    if (selectedDates[0]) {
                        this.startDatePicker.set('maxDate', dateStr);
                    }
                }
            });
            
            // 初始化頁面
            this.init();
            console.log('OverviewPage initialized successfully');
            
        } catch (error) {
            console.error('Error in OverviewPage constructor:', error);
            alert('頁面初始化失敗，請查看控制台以獲取詳細信息');
        }
    }
    
    // 初始化页面
    init() {
        try {
            console.log('Initializing page...');
            
            // 設置預設日期範圍（最近30天）
            const today = new Date();
            const thirtyDaysAgo = new Date(today);
            thirtyDaysAgo.setDate(today.getDate() - 30);
            
            // 確保日期範圍在有效數據範圍內（2025-02-01 之後）
            const minDate = new Date(2025, 1, 1);
            if (thirtyDaysAgo < minDate) {
                thirtyDaysAgo.setTime(minDate.getTime());
            }
            
            // 設置日期輸入框的值
            this.startDateInput.value = formatDateForInput(thirtyDaysAgo);
            this.endDateInput.value = formatDateForInput(today);
            
            // 綁定確認按鈕事件
            this.dateConfirmBtn.addEventListener('click', () => {
                console.log('Date confirm button clicked');
                this.loadData();
            });
            
            console.log('Page initialized successfully');
            
            // 初始加載數據
            this.loadData();
            
        } catch (error) {
            console.error('Error in init:', error);
            alert('頁面初始化失敗，請查看控制台以獲取詳細信息');
        }
    }
    
    // 加载页面数据
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
                // 清空圖表
                this.clearCharts();
                return;
            }
            
            // 更新图表
            console.log('Updating charts...');
            this.updateSalesTrendChart(data);
            this.updateWeekdayChart(data);  // 新增更新星期平均營業額圖表
            this.updateTopProductsChart(data);
            this.updateCategoryPieChart(data);
            console.log('Charts updated successfully');
            
            // 計算統計數據
            this.calculateAndDisplayStats(data);
            
        } catch (error) {
            console.error('Error loading data:', error);
            alert('加載數據時發生錯誤，請查看控制台以獲取詳細信息');
            // 清空圖表
            this.clearCharts();
        }
    }
    
    // 清空所有圖表
    clearCharts() {
        // 清空統計數據
        this.resetStats();
        
        // 清空銷售趨勢圖
        if (this.salesTrendChart) {
            this.salesTrendChart.data.labels = [];
            this.salesTrendChart.data.datasets[0].data = [];
            this.salesTrendChart.update();
        }
        
        // 清空星期平均營業額圖
        if (this.weekdayChart) {
            this.weekdayChart.data.labels = [];
            this.weekdayChart.data.datasets[0].data = [];
            this.weekdayChart.update();
        }
        
        // 清空銷售額排行圖
        if (this.topProductsChart) {
            this.topProductsChart.data.labels = [];
            this.topProductsChart.data.datasets[0].data = [];
            this.topProductsChart.update();
        }
        
        // 清空分類比例圖
        if (this.categoryPieChart) {
            this.categoryPieChart.data.labels = [];
            this.categoryPieChart.data.datasets[0].data = [];
            this.categoryPieChart.update();
        }
    }
    
    // 更新销售趋势折线图
    async updateSalesTrendChart(data) {
        try {
            console.log('Updating sales trend chart...');
            
            // 檢查圖表容器是否存在
            const chartContainer = document.getElementById('sales-trend-chart');
            if (!chartContainer) {
                console.error('Sales trend chart container not found');
                return;
            }
            
            // 檢測是否為移動設備
            const isMobile = window.innerWidth <= 768;
            
            // 按日期分組數據
            const salesByDate = {};
            
            // 首先查找每个日期的"總計"行
            let hasGrandTotals = false;
            data.forEach(item => {
                if (item.product.includes('總計')) {
                    hasGrandTotals = true;
                    if (!salesByDate[item.date]) {
                        salesByDate[item.date] = 0;
                    }
                    salesByDate[item.date] = item.amount;
                }
            });
            
            // 如果没有"总计"行，则从类别"共計"行汇总
            if (!hasGrandTotals) {
                const categoryTotalsByDate = {};
                
                // 首先尝试使用类别共计行
                data.forEach(item => {
                    if (item.product.includes('共計') && !item.product.includes('總計')) {
                        const date = item.date;
                        if (!categoryTotalsByDate[date]) {
                            categoryTotalsByDate[date] = 0;
                        }
                        categoryTotalsByDate[date] += item.amount;
                    }
                });
                
                // 如果找到了类别共计行，就使用它们
                if (Object.keys(categoryTotalsByDate).length > 0) {
                    Object.assign(salesByDate, categoryTotalsByDate);
                } else {
                    // 如果类别共计行也没有，则手动汇总每天的销售额
                    data.forEach(item => {
                        if (!item.product.includes('共計') && !item.product.includes('總計')) {
                            if (!salesByDate[item.date]) {
                                salesByDate[item.date] = 0;
                            }
                            salesByDate[item.date] += item.amount;
                        }
                    });
                }
            }
            
            // 准备图表数据
            const dates = Object.keys(salesByDate).sort();
            const amounts = dates.map(date => salesByDate[date]);
            
            // 計算三日移動平均
            const movingAverages = amounts.map((amount, index) => {
                if (index < 2) return null;  // 前兩天沒有足夠的數據計算平均值
                const sum = amounts.slice(index - 2, index + 1).reduce((a, b) => a + b, 0);
                return sum / 3;
            });

            // $20000 水平線
            const twentyThousandLine = amounts.map(() => 20000);

            // 更新总销售额
            const totalSales = amounts.reduce((sum, amount) => sum + amount, 0);
            this.totalSalesElement.textContent = `$${formatAmount(totalSales)}`;
            
            // 創建圖表的選項配置
            const chartOptions = {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: false
                    },
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: '#9E9E9E', // Material Design 灰色
                            boxWidth: 12,
                            padding: 15
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(33, 33, 33, 0.8)', // Material Design 深灰色
                        titleColor: '#FFFFFF',
                        bodyColor: '#FFFFFF',
                        borderColor: 'rgba(255, 255, 255, 0.1)',
                        borderWidth: 1,
                        padding: 10,
                        cornerRadius: 4 // Material Design 圓角
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: '#9E9E9E', // Material Design 灰色
                            callback: function(value, index, values) {
                                if (isMobile) {
                                    // 移動端簡化為 MM/DD 格式
                                    const date = new Date(this.getLabelForValue(value));
                                    const month = date.getMonth() + 1;
                                    const day = date.getDate();
                                    return `${month}/${day}`;
                                }
                                return this.getLabelForValue(value);
                            }
                        },
                        grid: {
                            display: false,
                            drawBorder: false
                        }
                    },
                    y: {
                        ticks: {
                            color: '#9E9E9E', // Material Design 灰色
                            callback: function(value, index, values) {
                                if (isMobile) {
                                    // 移動端使用 k 表示千元
                                    if (value >= 1000) {
                                        return '$' + (value / 1000) + 'k';
                                    }
                                }
                                return '$' + value;
                            }
                        },
                        grid: {
                            color: 'rgba(200, 200, 200, 0.08)', // 極淡的網格線
                            drawBorder: false
                        },
                        beginAtZero: true
                    }
                },
                animation: {
                    duration: 800, // 更短的動畫時間，符合Material的即時反饋原則
                    easing: 'easeOutCubic' // Material Design 推薦的緩動函數
                },
                elements: {
                    line: {
                        tension: 0.4 // 平滑曲線
                    }
                },
                layout: {
                    padding: {
                        left: 0,
                        right: 8,
                        top: 8,
                        bottom: 0
                    }
                }
            };
            
            // 準備圖表數據
            const chartData = {
                labels: dates,
                datasets: [
                    {
                        label: '日營業額',
                        data: amounts,
                        borderColor: '#2196F3', // Material Design 主色藍
                        backgroundColor: 'rgba(33, 150, 243, 0.12)', // 淺藍色半透明
                        fill: true,
                        borderWidth: 2,
                        tension: 0.4,
                        pointRadius: isMobile ? 1.5 : 2,
                        pointHoverRadius: isMobile ? 3 : 4,
                        pointBackgroundColor: '#2196F3',
                        pointBorderColor: '#2196F3',
                        pointBorderWidth: 1
                    }
                ]
            };
            
            // 只在非移動設備上添加三日平均線
            if (!isMobile) {
                chartData.datasets.push({
                    label: '三日平均',
                    data: movingAverages,
                    borderColor: '#64B5F6', // Material Design 淺藍色
                    backgroundColor: 'rgba(0, 0, 0, 0)',
                    fill: false,
                    borderWidth: 1.5,
                    borderDash: [5, 3],
                    tension: 0.4,
                    pointRadius: 0
                });
            }
            
            // 添加水平線
            chartData.datasets.push({
                label: '$20000',
                data: twentyThousandLine,
                borderColor: 'rgba(255, 255, 255, 0.3)',
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                fill: false,
                borderWidth: 1,
                borderDash: [3, 3],
                tension: 0,
                pointRadius: 0
            });
            
            // 創建或更新圖表
            const ctx = chartContainer.getContext('2d');
            
            if (this.salesTrendChart) {
                // 更新现有图表
                this.salesTrendChart.data.labels = dates;
                this.salesTrendChart.data.datasets = [
                    {
                        label: '日營業額',
                        data: amounts,
                        borderColor: '#2196F3', // Material Design 主色藍
                        backgroundColor: 'rgba(33, 150, 243, 0.12)', // 淺藍色半透明
                        fill: true,
                        borderWidth: 2,
                        tension: 0.4,
                        pointRadius: isMobile ? 1.5 : 2,
                        pointHoverRadius: isMobile ? 3 : 4,
                        pointBackgroundColor: '#2196F3',
                        pointBorderColor: '#2196F3',
                        pointBorderWidth: 1
                    }
                ];
                
                // 只在非移動設備上添加三日平均線
                if (!isMobile) {
                    this.salesTrendChart.data.datasets.push({
                        label: '三日平均',
                        data: movingAverages,
                        borderColor: '#64B5F6', // Material Design 淺藍色
                        backgroundColor: 'rgba(0, 0, 0, 0)',
                        fill: false,
                        borderWidth: 1.5,
                        borderDash: [5, 3],
                        tension: 0.4,
                        pointRadius: 0
                    });
                }
                
                // 添加水平線
                this.salesTrendChart.data.datasets.push({
                    label: '$20000',
                    data: twentyThousandLine,
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    fill: false,
                    borderWidth: 1,
                    borderDash: [3, 3],
                    tension: 0,
                    pointRadius: 0
                });
                
                // 更新圖表選項
                this.salesTrendChart.options.scales.x.ticks.callback = function(value, index, values) {
                    if (isMobile) {
                        // 移動端簡化為 MM/DD 格式
                        const date = new Date(this.getLabelForValue(value));
                        const month = date.getMonth() + 1;
                        const day = date.getDate();
                        return `${month}/${day}`;
                    }
                    return this.getLabelForValue(value);
                };
                
                this.salesTrendChart.options.scales.y.ticks.callback = function(value, index, values) {
                    if (isMobile) {
                        // 移動端使用 k 表示千元
                        if (value >= 1000) {
                            return '$' + (value / 1000) + 'k';
                        }
                    }
                    return '$' + value;
                };
                
                this.salesTrendChart.update();
            } else {
                // 创建新图表
                this.salesTrendChart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: dates,
                        datasets: [
                            {
                                label: '日營業額',
                                data: amounts,
                                borderColor: '#2196F3', // Material Design 主色藍
                                backgroundColor: 'rgba(33, 150, 243, 0.12)', // 淺藍色半透明
                                fill: true,
                                borderWidth: 2,
                                tension: 0.4,
                                pointRadius: isMobile ? 1.5 : 2,
                                pointHoverRadius: isMobile ? 3 : 4,
                                pointBackgroundColor: '#2196F3',
                                pointBorderColor: '#2196F3',
                                pointBorderWidth: 1
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            title: {
                                display: false
                            },
                            legend: {
                                display: true,
                                position: 'top',
                                labels: {
                                    color: '#9E9E9E', // Material Design 灰色
                                    boxWidth: 12,
                                    padding: 15
                                }
                            },
                            tooltip: {
                                backgroundColor: 'rgba(33, 33, 33, 0.8)', // Material Design 深灰色
                                titleColor: '#FFFFFF',
                                bodyColor: '#FFFFFF',
                                borderColor: 'rgba(255, 255, 255, 0.1)',
                                borderWidth: 1,
                                padding: 10,
                                cornerRadius: 4 // Material Design 圓角
                            }
                        },
                        scales: {
                            x: {
                                ticks: {
                                    color: '#9E9E9E', // Material Design 灰色
                                    callback: function(value, index, values) {
                                        if (isMobile) {
                                            // 移動端簡化為 MM/DD 格式
                                            const date = new Date(this.getLabelForValue(value));
                                            const month = date.getMonth() + 1;
                                            const day = date.getDate();
                                            return `${month}/${day}`;
                                        }
                                        return this.getLabelForValue(value);
                                    }
                                },
                                grid: {
                                    display: false,
                                    drawBorder: false
                                }
                            },
                            y: {
                                ticks: {
                                    color: '#9E9E9E', // Material Design 灰色
                                    callback: function(value, index, values) {
                                        if (isMobile) {
                                            // 移動端使用 k 表示千元
                                            if (value >= 1000) {
                                                return '$' + (value / 1000) + 'k';
                                            }
                                        }
                                        return '$' + value;
                                    }
                                },
                                grid: {
                                    color: 'rgba(200, 200, 200, 0.08)', // 極淡的網格線
                                    drawBorder: false
                                },
                                beginAtZero: true
                            }
                        },
                        animation: {
                            duration: 800, // 更短的動畫時間，符合Material的即時反饋原則
                            easing: 'easeOutCubic' // Material Design 推薦的緩動函數
                        },
                        elements: {
                            line: {
                                tension: 0.4 // 平滑曲線
                            }
                        },
                        layout: {
                            padding: {
                                left: 0,
                                right: 8,
                                top: 8,
                                bottom: 0
                            }
                        }
                    }
                });
                
                // 只在非移動設備上添加三日平均線
                if (!isMobile) {
                    this.salesTrendChart.data.datasets.push({
                        label: '三日平均',
                        data: movingAverages,
                        borderColor: '#64B5F6', // Material Design 淺藍色
                        backgroundColor: 'rgba(0, 0, 0, 0)',
                        fill: false,
                        borderWidth: 1.5,
                        borderDash: [5, 3],
                        tension: 0.4,
                        pointRadius: 0
                    });
                }
                
                // 添加水平線
                this.salesTrendChart.data.datasets.push({
                    label: '$20000',
                    data: twentyThousandLine,
                    borderColor: 'rgba(255, 255, 255, 0.3)',
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    fill: false,
                    borderWidth: 1,
                    borderDash: [3, 3],
                    tension: 0,
                    pointRadius: 0
                });
                
                this.salesTrendChart.update();
            }
            
            console.log('Sales trend chart updated successfully');
            
        } catch (error) {
            console.error('Error updating sales trend chart:', error);
        }
    }
    
    // 更新销售额排行前五的柱状图
    updateTopProductsChart(data) {
        try {
            console.log('Updating top products chart...');
            
            // 檢查圖表容器是否存在
            const chartContainer = document.getElementById('top-products-chart');
            if (!chartContainer) {
                console.error('Top products chart container not found');
                return;
            }
            
            // 按产品分组并计算销售额和銷售數量
            const salesByProduct = {};
            const quantityByProduct = {};
            const detailsByProduct = {};
            
            data.forEach(item => {
                // 跳过"共计"和"总计"行
                if (!item.product.includes('共計') && !item.product.includes('總計')) {
                    if (!salesByProduct[item.product]) {
                        salesByProduct[item.product] = 0;
                        quantityByProduct[item.product] = 0;
                        detailsByProduct[item.product] = {
                            singleItems: 0,
                            setItems: 0
                        };
                    }
                    salesByProduct[item.product] += item.amount;
                    quantityByProduct[item.product] += item.quantity;
                    
                    // 記錄套餐和單點的數量
                    if (item.rawProduct && item.rawProduct.includes('單點')) {
                        detailsByProduct[item.product].singleItems += item.quantity;
                    } else if (item.rawProduct && item.rawProduct.includes('套餐')) {
                        detailsByProduct[item.product].setItems += item.quantity;
                    }
                }
            });
            
            // 转换为数组并排序 (仍然按銷售額排序)
            const productSalesArray = Object.entries(salesByProduct)
                .map(([product, amount]) => ({ 
                    product, 
                    amount,
                    quantity: quantityByProduct[product],
                    details: detailsByProduct[product]
                }))
                .sort((a, b) => b.amount - a.amount);
            
            // 获取前五名
            const topProducts = productSalesArray.slice(0, 5);
            
            const chartLabels = topProducts.map(item => ''); // 空標籤，因為我們將使用自定義標籤繪製
            const chartData = topProducts.map(item => item.amount);
            // 使用統一顏色 rgba(54, 162, 235, 0.7)，不再使用隨機顏色
            const chartColor = 'rgba(54, 162, 235, 0.7)';  // 標準藍色
            
            // 自定義繪製插件
            const customLabelsPlugin = {
                id: 'customLabels',
                afterDraw: function(chart) {
                    const ctx = chart.ctx;
                    const meta = chart.getDatasetMeta(0);
                    
                    ctx.save();
                    ctx.font = '13px Roboto, Arial, sans-serif'; // Material Design 偏好 Roboto
                    
                    // 檢測是否為移動端
                    const isMobile = window.innerWidth < 768;
                    
                    meta.data.forEach((bar, index) => {
                        const item = topProducts[index];
                        const formattedAmount = formatAmount(item.amount);
                        
                        // 獲取長條的位置信息
                        const y = bar.y;
                        
                        // 在長條左上方顯示產品名稱 - PC 端時增加間距
                        ctx.fillStyle = '#FFFFFF';
                        ctx.textAlign = 'left';
                        ctx.textBaseline = 'bottom';
                        
                        // PC 端特別處理
                        if (!isMobile) {
                            // 名稱位置調整：左側增加間距，上方增加間距
                            ctx.fillText(item.product, 10, y - 14);
                            
                            // 在長條最右邊顯示銷售額和份數
                            ctx.textAlign = 'right';
                            ctx.fillStyle = '#BDBDBD';  // Material Design 淺灰色
                            
                            // 銷售額和份數位置調整：右側增加間距
                            ctx.fillText(`$${formattedAmount} (${item.quantity}份)`, chart.chartArea.right - 10, y - 14);
                        } else {
                            // 移動端保持原來的位置
                            ctx.fillText(item.product, 5, y - 10);
                            
                            ctx.textAlign = 'right';
                            ctx.fillStyle = '#BDBDBD';
                            ctx.fillText(`$${formattedAmount} (${item.quantity}份)`, chart.chartArea.right - 5, y - 10);
                        }
                    });
                    
                    ctx.restore();
                }
            };
            
            // 创建或更新图表
            const ctx = chartContainer.getContext('2d');
            
            if (this.topProductsChart) {
                // 銷毀舊圖表重建，以確保自定義插件生效
                this.topProductsChart.destroy();
                this.topProductsChart = null;
            }
            
            // 創建新圖表
            this.topProductsChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: chartLabels,
                    datasets: [{
                        label: '銷售額',
                        data: chartData,
                        backgroundColor: '#2196F3', // Material Design 藍色
                        borderWidth: 0,
                        barThickness: 10, // Material Design 更偏好纖細的元素
                        borderRadius: 2,  // Material Design 的微小圓角
                        borderSkipped: false // 確保圓角應用到所有邊
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: 'y',
                    layout: {
                        padding: {
                            top: 25, // Material Design 更注重空間留白
                            right: 20, // 為右側標籤留出空間
                            left: 5,  // 左側少量空間
                            bottom: 10 // 底部少量空間
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            enabled: true,
                            backgroundColor: 'rgba(33, 33, 33, 0.8)', // Material Design 深灰色
                            titleColor: '#FFFFFF',
                            bodyColor: '#FFFFFF',
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                            borderWidth: 1,
                            padding: 10,
                            cornerRadius: 4, // Material Design 圓角
                            displayColors: false,
                            callbacks: {
                                label: function(context) {
                                    const item = topProducts[context.dataIndex];
                                    const lines = [
                                        `銷售額: ${formatAmount(item.amount)} 元`,
                                        `銷售數量: ${item.quantity} 份`
                                    ];
                                    
                                    // 添加套餐和單點的詳情
                                    if (item.details.setItems > 0 || item.details.singleItems > 0) {
                                        const detailParts = [];
                                        if (item.details.setItems > 0) {
                                            detailParts.push(`套餐: ${item.details.setItems} 份`);
                                        }
                                        if (item.details.singleItems > 0) {
                                            detailParts.push(`單點: ${item.details.singleItems} 份`);
                                        }
                                        
                                        if (detailParts.length > 0) {
                                            lines.push(`內含: ${detailParts.join(', ')}`);
                                        }
                                    }
                                    
                                    return lines;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            beginAtZero: true,
                            grid: {
                                display: false,
                                drawBorder: false
                            },
                            ticks: {
                                display: false
                            }
                        },
                        y: {
                            display: false, // 隱藏Y軸刻度
                            spacing: 8,    // 調整間距，大幅降低原先16的間距
                            border: {
                                display: false
                            }
                        }
                    },
                    animation: {
                        duration: 500,  // Material Design 偏好更快速的反應
                        easing: 'easeOutQuad' // Material Design 推薦的緩動函數
                    }
                },
                plugins: [customLabelsPlugin]
            });
            
            console.log('Top products chart created');
        } catch (error) {
            console.error('Error updating top products chart:', error);
        }
    }
    
    // 更新分类销售比例圖表
    updateCategoryPieChart(data) {
        try {
            console.log('Updating category chart...');
            
            // 檢查圖表容器是否存在
            const chartContainer = document.getElementById('category-pie-chart');
            if (!chartContainer) {
                console.error('Category chart container not found');
                return;
            }
            
            // 按分类分组并计算销售額和銷售數量
            const salesByCategory = {};
            const quantityByCategory = {};
            const detailsByCategory = {};
            
            // 首先尝试使用共计行
            let hasCategoryTotals = false;
            data.forEach(item => {
                // 使用带有"共计"字样的行来获取每个分类的总销售额
                if (item.product.includes('共計') && !item.product.includes('總計')) {
                    hasCategoryTotals = true;
                    const category = item.category || '其他';
                    if (!salesByCategory[category]) {
                        salesByCategory[category] = 0;
                        quantityByCategory[category] = 0;
                        detailsByCategory[category] = {
                            singleItems: 0,
                            setItems: 0
                        };
                    }
                    salesByCategory[category] += item.amount;
                    quantityByCategory[category] += item.quantity;
                }
            });
            
            // 如果没有找到共计行，则手动计算每个分类的销售额和銷售數量
            if (!hasCategoryTotals) {
                data.forEach(item => {
                    if (!item.product.includes('總計') && !item.product.includes('共計')) {
                        const category = item.category || '其他';
                        if (!salesByCategory[category]) {
                            salesByCategory[category] = 0;
                            quantityByCategory[category] = 0;
                            detailsByCategory[category] = {
                                singleItems: 0,
                                setItems: 0
                            };
                        }
                        salesByCategory[category] += item.amount;
                        quantityByCategory[category] += item.quantity;
                        
                        // 記錄套餐和單點的數量
                        if (item.rawProduct && item.rawProduct.includes('(單點)')) {
                            detailsByCategory[category].singleItems += item.quantity;
                        } else if (item.rawProduct && item.rawProduct.includes('(套餐)')) {
                            detailsByCategory[category].setItems += item.quantity;
                        }
                    }
                });
            }
            
            // 計算總銷售額
            const totalSales = Object.values(salesByCategory).reduce((sum, amount) => sum + amount, 0);
            
            // 按銷售額排序分類
            const categoriesArray = Object.keys(salesByCategory)
                .map(category => ({
                    category,
                    amount: salesByCategory[category],
                    percentage: ((salesByCategory[category] / totalSales) * 100).toFixed(1)
                }))
                .sort((a, b) => b.amount - a.amount);
            
            const categories = categoriesArray.map(item => item.category);
            const chartData = categoriesArray.map(item => item.amount);
            const percentages = categoriesArray.map(item => parseFloat(item.percentage));
            
            // 獲取每個分類的顏色 - 使用 Material Design 調色板
            const colorOptions = [
                '#2196F3', // Material Blue
                '#4CAF50', // Material Green
                '#FFC107', // Material Amber
                '#9C27B0', // Material Purple
                '#FF5722'  // Material Deep Orange
            ];
            
            const chartColors = [];
            categories.forEach((category, index) => {
                chartColors.push(colorOptions[index % colorOptions.length]);
            });
            
            // 創建或更新圖表
            const ctx = chartContainer.getContext('2d');
            
            if (this.categoryPieChart) {
                // 銷毀舊圖表
                this.categoryPieChart.destroy();
                this.categoryPieChart = null;
            }
            
            // 清除畫布並設置大小
            const container = chartContainer.parentElement;
            const containerWidth = container.clientWidth;
            const containerHeight = container.clientHeight;
            
            // 考慮裝置像素比例以提高畫面清晰度
            const dpr = window.devicePixelRatio || 1;
            chartContainer.width = containerWidth * dpr;
            chartContainer.height = containerHeight * dpr;
            
            // 設置CSS尺寸
            chartContainer.style.width = `${containerWidth}px`;
            chartContainer.style.height = `${containerHeight}px`;
            
            // 調整Canvas的繪圖比例
            ctx.scale(dpr, dpr);
            
            // 檢測是否為PC端
            const isPC = window.innerWidth >= 768;
            
            // 計算長條的位置和尺寸 - PC端時長條高度略微縮小以騰出空間
            const barHeight = isPC ? 16 : 18; // PC端稍微縮小
            const barY = isPC ? 30 : 40; // PC端上移
            const barWidth = containerWidth - 40;
            const startX = 20;
            
            // 繪製長條圖
            ctx.save();
            
            // 繪製單一長條，不同顏色區塊代表不同分類
            let currentX = startX;
            categoriesArray.forEach((item, index) => {
                const widthPercentage = parseFloat(item.percentage) / 100;
                const segmentWidth = barWidth * widthPercentage;
                
                // 繪製此分類的區塊
                ctx.fillStyle = chartColors[index];
                ctx.beginPath();
                // Material Design 偏好更小的圓角或直角
                if (index === 0) { // 第一個區塊（左側）
                    ctx.moveTo(currentX + 2, barY); // 左上角微小圓角
                    ctx.lineTo(currentX + segmentWidth, barY);
                    ctx.lineTo(currentX + segmentWidth, barY + barHeight);
                    ctx.lineTo(currentX + 2, barY + barHeight);
                    ctx.arc(currentX + 2, barY + barHeight - 2, 2, Math.PI/2, Math.PI, false); // 左下角微小圓角
                    ctx.lineTo(currentX, barY + 2);
                    ctx.arc(currentX + 2, barY + 2, 2, Math.PI, Math.PI*3/2, false); // 左上角微小圓角
                } else if (index === categoriesArray.length - 1) { // 最後一個區塊（右側）
                    ctx.moveTo(currentX, barY);
                    ctx.lineTo(currentX + segmentWidth - 2, barY);
                    ctx.arc(currentX + segmentWidth - 2, barY + 2, 2, Math.PI*3/2, 0, false); // 右上角微小圓角
                    ctx.lineTo(currentX + segmentWidth, barY + barHeight - 2);
                    ctx.arc(currentX + segmentWidth - 2, barY + barHeight - 2, 2, 0, Math.PI/2, false); // 右下角微小圓角
                    ctx.lineTo(currentX, barY + barHeight);
                } else { // 中間區塊（無圓角）
                    ctx.rect(currentX, barY, segmentWidth, barHeight);
                }
                ctx.fill();
                
                currentX += segmentWidth;
            });
            
            // 在下方顯示圖例，使用 Material Design 風格
            const legendY = barY + barHeight + 20; // PC端縮小上方間距
            const legendItemHeight = 28; // 增加間距使圖例更易讀
            
            // 檢測是否為PC端
            
            // PC端圖例調整 - 進一步縮小間距
            const legendStartX = isPC ? startX + 6 : startX + 5;
            const circleRadius = isPC ? 5 : 4;
            const rectSize = isPC ? 10 : 8;
            const textOffset = isPC ? 18 : 14;
            const fontSize = isPC ? '14px' : '13px';
            const legendSpacing = isPC ? 24 : 28; // PC端減少圖例間距
            
            categoriesArray.forEach((item, index) => {
                const legendItemY = legendY + (index * legendSpacing);
                
                // 繪製顏色圓點 - 使用方形或小圓點更符合 Material Design
                ctx.fillStyle = chartColors[index];
                ctx.beginPath();
                if (index % 2 === 0) { // 多樣化圖例樣式 - 偶數索引使用圓點
                    ctx.arc(legendStartX, legendItemY, circleRadius, 0, Math.PI * 2);
                } else { // 奇數索引使用小方塊
                    const rectY = legendItemY - rectSize/2;
                    ctx.rect(legendStartX - rectSize/2, rectY, rectSize, rectSize);
                }
                ctx.fill();
                
                // 繪製分類名稱和百分比 - 使用符合 Material Design 的字體樣式
                ctx.fillStyle = '#FFFFFF';
                ctx.font = `${fontSize} Roboto, Arial, sans-serif`; // Material Design 偏好 Roboto
                ctx.textAlign = 'left';
                ctx.textBaseline = 'middle';
                ctx.fillText(`${item.category}`, legendStartX + textOffset, legendItemY);
                
                // 繪製百分比在右側 - PC端增加間距
                const rightMargin = isPC ? 25 : 20;
                ctx.textAlign = 'right';
                ctx.fillText(`${item.percentage}%`, containerWidth - rightMargin, legendItemY);
            });
            
            ctx.restore();
            
            // 添加圖表的交互功能（懸停提示）- 改為更現代的提示方式
            chartContainer.onclick = function(evt) {
                const rect = chartContainer.getBoundingClientRect();
                const x = evt.clientX - rect.left;
                const y = evt.clientY - rect.top;
                
                // 檢查是否點擊了長條圖
                if (y >= barY && y <= barY + barHeight && x >= startX && x <= startX + barWidth) {
                    // 確定點擊了哪個分類
                    let accumulatedWidth = 0;
                    for (let i = 0; i < categoriesArray.length; i++) {
                        const widthPercentage = parseFloat(categoriesArray[i].percentage) / 100;
                        const segmentWidth = barWidth * widthPercentage;
                        
                        if (x >= startX + accumulatedWidth && x <= startX + accumulatedWidth + segmentWidth) {
                            const item = categoriesArray[i];
                            showCustomTooltip(item, evt.clientX, evt.clientY);
                            break;
                        }
                        
                        accumulatedWidth += segmentWidth;
                    }
                }
                
                // 檢查是否點擊了圖例項目
                for (let i = 0; i < categoriesArray.length; i++) {
                    const legendItemY = legendY + (i * legendItemHeight);
                    
                    if (y >= legendItemY - 10 && y <= legendItemY + 10 && x >= startX && x <= containerWidth - 20) {
                        const item = categoriesArray[i];
                        showCustomTooltip(item, evt.clientX, evt.clientY);
                        break;
                    }
                }
            };
            
            // 自定義更現代的提示框顯示函數
            function showCustomTooltip(item, clientX, clientY) {
                // 使用 alert 很不 Material Design，但由於我們沒有自定義 DOM 的能力，暫時保留
                alert(`${item.category}: ${formatAmount(item.amount)} 元 (${item.percentage}%)\n銷售數量: ${quantityByCategory[item.category]} 份`);
            }
            
            console.log('Category percentage bar chart created with Material Design style');
        } catch (error) {
            console.error('Error updating category chart:', error);
        }
    }

    calculateAndDisplayStats(data) {
        try {
            console.log('Calculating statistics...');
            
            // 按日期分組計算每日營業額
            const dailySales = {};
            
            // 首先嘗試使用每日總計數據
            data.forEach(item => {
                if (item.product.includes('總計')) {
                    dailySales[item.date] = item.amount;
                }
            });
            
            // 如果沒有找到總計數據，則使用分類共計
            if (Object.keys(dailySales).length === 0) {
                data.forEach(item => {
                    if (item.product.includes('共計') && !item.product.includes('總計')) {
                        if (!dailySales[item.date]) {
                            dailySales[item.date] = 0;
                        }
                        dailySales[item.date] += item.amount;
                    }
                });
            }
            
            // 如果還是沒有數據，則手動加總每個商品的銷售額
            if (Object.keys(dailySales).length === 0) {
                data.forEach(item => {
                    if (!item.product.includes('共計') && !item.product.includes('總計')) {
                        if (!dailySales[item.date]) {
                            dailySales[item.date] = 0;
                        }
                        dailySales[item.date] += item.amount;
                    }
                });
            }
            
            // 計算總營業額
            const totalSales = Object.values(dailySales).reduce((sum, amount) => sum + amount, 0);
            
            // 計算平均營業額（使用實際的天數）
            const numberOfDays = Object.keys(dailySales).length;
            const avgSales = numberOfDays > 0 ? totalSales / numberOfDays : 0;
            
            // 找出最高和最低營業額的日期
            const dateEntries = Object.entries(dailySales);
            const highestSales = dateEntries.reduce((max, [date, amount]) => 
                amount > max.amount ? {date, amount} : max
            , {date: '-', amount: -Infinity});
            
            const lowestSales = dateEntries.reduce((min, [date, amount]) => 
                amount < min.amount ? {date, amount} : min
            , {date: '-', amount: Infinity});
            
            console.log('Statistics calculated:', {
                totalSales,
                avgSales,
                highestSales,
                lowestSales,
                numberOfDays
            });
            
            // 更新顯示
            this.avgSalesElement.textContent = `$${Math.round(avgSales).toLocaleString()}`;
            this.totalSalesElement.textContent = `$${Math.round(totalSales).toLocaleString()}`;
            this.highestSalesDateElement.textContent = highestSales.date;
            this.highestSalesAmountElement.textContent = `$${Math.round(highestSales.amount).toLocaleString()}`;
            this.lowestSalesDateElement.textContent = lowestSales.date;
            this.lowestSalesAmountElement.textContent = `$${Math.round(lowestSales.amount).toLocaleString()}`;
            
        } catch (error) {
            console.error('Error calculating statistics:', error);
            this.resetStats();
        }
    }

    resetStats() {
        // 重置統計數據顯示
        this.avgSalesElement.textContent = '$0';
        this.totalSalesElement.textContent = '$0';
        this.highestSalesDateElement.textContent = '-';
        this.highestSalesAmountElement.textContent = '$0';
        this.lowestSalesDateElement.textContent = '-';
        this.lowestSalesAmountElement.textContent = '$0';
    }

    // 新增更新星期平均營業額圖表方法
    updateWeekdayChart(data) {
        try {
            console.log('Updating weekday average sales chart...');
            
            // 檢查圖表容器是否存在
            const chartContainer = document.getElementById('weekday-avg-chart');
            if (!chartContainer) {
                console.error('Weekday average sales chart container not found');
                return;
            }
            
            // 按日期和星期幾組織數據
            const salesByDate = {};
            
            // 首先查找每個日期的"總計"行
            let hasGrandTotals = false;
            data.forEach(item => {
                if (item.product.includes('總計')) {
                    hasGrandTotals = true;
                    if (!salesByDate[item.date]) {
                        salesByDate[item.date] = {
                            amount: 0,
                            dayOfWeek: getDayOfWeek(item.date)
                        };
                    }
                    salesByDate[item.date].amount = item.amount;
                }
            });
            
            // 如果沒有"總計"行，則從類別"共計"行匯總
            if (!hasGrandTotals) {
                const categoryTotalsByDate = {};
                
                // 首先嘗試使用類別共計行
                data.forEach(item => {
                    if (item.product.includes('共計') && !item.product.includes('總計')) {
                        const date = item.date;
                        if (!categoryTotalsByDate[date]) {
                            categoryTotalsByDate[date] = {
                                amount: 0,
                                dayOfWeek: getDayOfWeek(date)
                            };
                        }
                        categoryTotalsByDate[date].amount += item.amount;
                    }
                });
                
                // 如果找到了類別共計行，就使用它們
                if (Object.keys(categoryTotalsByDate).length > 0) {
                    Object.assign(salesByDate, categoryTotalsByDate);
                } else {
                    // 如果類別共計行也沒有，則從單品匯總，但要跳過包含"共計"的行
                    const tempSalesByDate = {};
                    
                    data.forEach(item => {
                        if (!item.product.includes('共計') && !item.product.includes('總計')) {
                            if (!tempSalesByDate[item.date]) {
                                tempSalesByDate[item.date] = 0;
                            }
                            tempSalesByDate[item.date] += item.amount;
                        }
                    });
                    
                    // 然後構建salesByDate對象
                    Object.keys(tempSalesByDate).forEach(date => {
                        salesByDate[date] = {
                            amount: tempSalesByDate[date],
                            dayOfWeek: getDayOfWeek(date)
                        };
                    });
                }
            }
            
            // 按星期幾分組計算平均值
            const salesByDayOfWeek = Array(7).fill(0).map(() => ({total: 0, count: 0}));
            
            Object.values(salesByDate).forEach(({amount, dayOfWeek}) => {
                salesByDayOfWeek[dayOfWeek].total += amount;
                salesByDayOfWeek[dayOfWeek].count += 1;
            });
            
            // 計算平均值
            const avgSalesByDayOfWeek = salesByDayOfWeek.map(({total, count}) => 
                count > 0 ? Math.round(total / count) : 0
            );
            
            // 準備圖表數據
            const chartLabels = Array(7).fill(0).map((_, index) => getDayOfWeekName(index));
            const chartData = avgSalesByDayOfWeek;
            
            // 創建或更新圖表
            const ctx = chartContainer.getContext('2d');
            
            if (this.weekdayChart) {
                this.weekdayChart.data.datasets[0].data = chartData;
                this.weekdayChart.update();
            } else {
                this.weekdayChart = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: chartLabels,
                        datasets: [{
                            label: '平均營業額',
                            data: chartData,
                            backgroundColor: '#2196F3', // Material Design 主色藍
                            borderWidth: 0,
                            borderRadius: 2, // Material Design 的微小圓角
                            borderSkipped: false, // 確保圓角應用到所有邊
                            barPercentage: 0.5, // 讓長條更細些，符合 Material Design 的線條美學
                            maxBarThickness: 32 // 限制最大寬度
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: false
                            },
                            tooltip: {
                                backgroundColor: 'rgba(33, 33, 33, 0.8)', // Material Design 深灰色
                                titleColor: '#FFFFFF',
                                bodyColor: '#FFFFFF',
                                borderColor: 'rgba(255, 255, 255, 0.1)',
                                borderWidth: 1,
                                padding: 10,
                                cornerRadius: 4, // Material Design 圓角
                                displayColors: false,
                                callbacks: {
                                    label: function(context) {
                                        return `平均營業額: $${formatAmount(context.raw)}`;
                                    }
                                }
                            }
                        },
                        scales: {
                            x: {
                                ticks: {
                                    autoSkip: false,
                                    maxRotation: 0,  // 取消標籤文字的旋轉
                                    minRotation: 0,  // 確保標籤保持水平
                                    color: '#9E9E9E', // Material Design 灰色
                                    font: {
                                        size: 12
                                    },
                                    padding: 5
                                },
                                grid: {
                                    display: false,  // 隱藏網格線增加現代感
                                    drawBorder: false
                                }
                            },
                            y: {
                                beginAtZero: true,
                                min: 0,
                                ticks: {
                                    callback: function(value) {
                                        return `$${formatAmount(value)}`;
                                    },
                                    maxTicksLimit: 5, // 減少刻度數量，增加清晰度
                                    color: '#9E9E9E',
                                    font: {
                                        size: 12
                                    },
                                    padding: 8
                                },
                                grid: {
                                    color: 'rgba(200, 200, 200, 0.08)', // 極淡的網格線
                                    drawBorder: false
                                },
                                suggestedMax: function(context) {
                                    const allData = context.chart.data.datasets.flatMap(dataset => dataset.data);
                                    const maxValue = Math.max(...allData);
                                    return maxValue * 1.1; // 只預留10%的頂部空間
                                },
                            }
                        },
                        animation: {
                            duration: 600,  // 更短的動畫時間，符合Material的即時反饋原則
                            easing: 'easeOutQuad' // Material Design 推薦的緩動函數
                        }
                    }
                });
            }
            
            console.log('Weekday average sales chart updated successfully');
            
        } catch (error) {
            console.error('Error updating weekday average sales chart:', error);
        }
    }

    // 更新週間平均營業額圖表
    updateWeekdayAverageChart(data) {
        try {
            console.log('Updating weekday average chart...');
            const weekdays = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
            
            if (!data || !data.dailyData || data.dailyData.length === 0) {
                console.log('No data for weekday chart');
                return;
            }
            
            // 檢測是否為移動設備
            const isMobile = window.innerWidth <= 768;
            
            // 將資料按星期幾分組
            const salesByWeekday = {};
            const countByWeekday = {};
            
            weekdays.forEach(day => {
                salesByWeekday[day] = 0;
                countByWeekday[day] = 0;
            });
            
            data.dailyData.forEach(day => {
                const date = new Date(day.date.replace(/(\d{4})\/(\d{2})\/(\d{2})/, '$1-$2-$3'));
                const weekdayIndex = date.getDay();
                const weekday = weekdays[weekdayIndex];
                
                salesByWeekday[weekday] += day.totalSales;
                countByWeekday[weekday]++;
            });
            
            // 計算每個星期幾的平均銷售額
            const avgSalesByWeekday = {};
            weekdays.forEach(day => {
                if (countByWeekday[day] > 0) {
                    avgSalesByWeekday[day] = salesByWeekday[day] / countByWeekday[day];
                } else {
                    avgSalesByWeekday[day] = 0;
                }
            });
            
            // 轉換成圖表資料
            const chartData = {
                labels: weekdays,
                datasets: [{
                    label: '平均營業額',
                    data: weekdays.map(day => avgSalesByWeekday[day]),
                    backgroundColor: function(context) {
                        const index = context.dataIndex;
                        const value = context.dataset.data[index];
                        return 'rgba(255, 255, 255, 0.7)';
                    },
                    borderColor: function(context) {
                        const index = context.dataIndex;
                        const value = context.dataset.data[index];
                        return 'rgba(255, 255, 255, 0.7)';
                    },
                    borderWidth: 1
                }]
            };
            
            // 更新或創建圖表
            const chartOptions = {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: false
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: '#a0a0a0',
                            callback: function(value, index, values) {
                                if (isMobile) {
                                    // 移動端使用 k 表示千元
                                    if (value >= 1000) {
                                        return '$' + (value / 1000) + 'k';
                                    }
                                }
                                return '$' + value;
                            }
                        },
                        grid: {
                            color: 'rgba(160, 160, 160, 0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#a0a0a0'
                        },
                        grid: {
                            color: 'rgba(160, 160, 160, 0.1)'
                        }
                    }
                }
            };
            
            if (this.weekdayAvgChart) {
                this.weekdayAvgChart.data = chartData;
                this.weekdayAvgChart.options = chartOptions;
                this.weekdayAvgChart.update();
            } else {
                this.weekdayAvgChart = new Chart(
                    document.getElementById('weekday-avg-chart').getContext('2d'), {
                        type: 'bar',
                        data: chartData,
                        options: chartOptions
                    }
                );
            }
            
            console.log('Weekday average chart updated successfully');
        } catch (error) {
            console.error('Error updating weekday average chart:', error);
        }
    }
} 