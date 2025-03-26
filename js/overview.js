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
        
        // 清空星期平均營業額圖表
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
    updateSalesTrendChart(data) {
        try {
            console.log('Updating sales trend chart...');
            
            // 檢查圖表容器是否存在
            const chartContainer = document.getElementById('sales-trend-chart');
            if (!chartContainer) {
                console.error('Sales trend chart container not found');
                return;
            }
            
            // 按日期分组数据
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
            
            // 创建或更新图表
            const ctx = chartContainer.getContext('2d');
            
            if (this.salesTrendChart) {
                this.salesTrendChart.data.labels = dates;
                this.salesTrendChart.data.datasets = [{
                    label: '日營業額',
                    data: amounts,
                    borderColor: '#2997ff',
                    backgroundColor: '#2997ff',
                    fill: false,
                    tension: 0.4,
                    borderWidth: 2
                }, {
                    label: '三日平均',
                    data: movingAverages,
                    borderColor: 'rgba(41, 151, 255, 0.5)',
                    backgroundColor: 'rgba(41, 151, 255, 0.5)',
                    fill: false,
                    borderWidth: 1.5,
                    tension: 0.4,
                    pointRadius: 0
                }];
                this.salesTrendChart.update();
                console.log('Sales trend chart updated');
            } else {
                console.log('Creating new sales trend chart');
                this.salesTrendChart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: dates,
                        datasets: [{
                            label: '日營業額',
                            data: amounts,
                            borderColor: '#2997ff',
                            backgroundColor: '#2997ff',
                            fill: false,
                            tension: 0.4,
                            borderWidth: 2
                        }, {
                            label: '三日平均',
                            data: movingAverages,
                            borderColor: 'rgba(41, 151, 255, 0.5)',
                            backgroundColor: 'rgba(41, 151, 255, 0.5)',
                            fill: false,
                            borderWidth: 1.5,
                            tension: 0.4,
                            pointRadius: 0
                        }]
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
                                    color: '#a0a0a0'
                                }
                            }
                        },
                        interaction: {
                            mode: 'index',
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
                            y: {
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
                            }
                        }
                    }
                });
            }
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
                    if (item.rawProduct && item.rawProduct.includes('(單點)')) {
                        detailsByProduct[item.product].singleItems += item.quantity;
                    } else if (item.rawProduct && item.rawProduct.includes('(套餐)')) {
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
            
            const chartLabels = topProducts.map(item => item.product);
            const chartData = topProducts.map(item => item.amount);
            const chartColors = getRandomColors(topProducts.length);
            
            // 创建或更新图表
            const ctx = chartContainer.getContext('2d');
            
            if (this.topProductsChart) {
                this.topProductsChart.data.labels = chartLabels;
                this.topProductsChart.data.datasets[0].data = chartData;
                this.topProductsChart.data.datasets[0].backgroundColor = chartColors;
                this.topProductsChart.update();
                console.log('Top products chart updated');
            } else {
                console.log('Creating new top products chart');
                this.topProductsChart = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: chartLabels,
                        datasets: [{
                            label: '銷售額',
                            data: chartData,
                            backgroundColor: chartColors,
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        indexAxis: 'y',
                        plugins: {
                            legend: {
                                display: false
                            },
                            tooltip: {
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
                                ticks: {
                                    callback: function(value) {
                                        return formatAmount(value) + ' 元';
                                    }
                                }
                            }
                        }
                    }
                });
            }
        } catch (error) {
            console.error('Error updating top products chart:', error);
        }
    }
    
    // 更新分类销售比例的饼图
    updateCategoryPieChart(data) {
        try {
            console.log('Updating category pie chart...');
            
            // 檢查圖表容器是否存在
            const chartContainer = document.getElementById('category-pie-chart');
            if (!chartContainer) {
                console.error('Category pie chart container not found');
                return;
            }
            
            // 按分类分组并计算销售额和銷售數量
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
            
            const categories = Object.keys(salesByCategory);
            const chartData = categories.map(category => salesByCategory[category]);
            const chartColors = getRandomColors(categories.length);
            
            // 创建或更新图表
            const ctx = chartContainer.getContext('2d');
            
            if (this.categoryPieChart) {
                this.categoryPieChart.data.labels = categories;
                this.categoryPieChart.data.datasets[0].data = chartData;
                this.categoryPieChart.data.datasets[0].backgroundColor = chartColors;
                this.categoryPieChart.update();
                console.log('Category pie chart updated');
            } else {
                console.log('Creating new category pie chart');
                this.categoryPieChart = new Chart(ctx, {
                    type: 'pie',
                    data: {
                        labels: categories,
                        datasets: [{
                            data: chartData,
                            backgroundColor: chartColors,
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'right'
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        const total = context.dataset.data.reduce((sum, value) => sum + value, 0);
                                        const percentage = ((context.raw / total) * 100).toFixed(1);
                                        const category = context.label;
                                        const quantity = quantityByCategory[category];
                                        const details = detailsByCategory[category];
                                        
                                        const lines = [
                                            `${category}: ${formatAmount(context.raw)} 元 (${percentage}%)`,
                                            `銷售數量: ${quantity} 份`
                                        ];
                                        
                                        // 添加套餐和單點的詳情
                                        if (details && (details.setItems > 0 || details.singleItems > 0)) {
                                            const detailParts = [];
                                            if (details.setItems > 0) {
                                                detailParts.push(`套餐: ${details.setItems} 份`);
                                            }
                                            if (details.singleItems > 0) {
                                                detailParts.push(`單點: ${details.singleItems} 份`);
                                            }
                                            
                                            if (detailParts.length > 0) {
                                                lines.push(`內含: ${detailParts.join(', ')}`);
                                            }
                                        }
                                        
                                        return lines;
                                    }
                                }
                            }
                        }
                    }
                });
            }
        } catch (error) {
            console.error('Error updating category pie chart:', error);
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
                            backgroundColor: [
                                'rgba(255, 99, 132, 0.7)',
                                'rgba(54, 162, 235, 0.7)',
                                'rgba(255, 206, 86, 0.7)',
                                'rgba(75, 192, 192, 0.7)',
                                'rgba(153, 102, 255, 0.7)',
                                'rgba(255, 159, 64, 0.7)',
                                'rgba(201, 203, 207, 0.7)'
                            ],
                            borderWidth: 1
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
                                callbacks: {
                                    label: function(context) {
                                        return `平均營業額: $${formatAmount(context.raw)}`;
                                    }
                                }
                            },
                            annotation: {
                                annotations: {
                                    twentyThousandLine: {
                                        type: 'line',
                                        yMin: 20000,
                                        yMax: 20000,
                                        borderColor: 'rgb(255, 0, 0)',
                                        borderWidth: 2,
                                        borderDash: [5, 5],
                                        label: {
                                            display: true,
                                            content: '$20,000',
                                            position: 'end',
                                            backgroundColor: 'rgba(255, 0, 0, 0.8)',
                                            color: 'white',
                                            font: {
                                                weight: 'bold'
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                min: 0,
                                ticks: {
                                    callback: function(value) {
                                        return `$${formatAmount(value)}`;
                                    },
                                    maxTicksLimit: 10
                                },
                                suggestedMax: function(context) {
                                    const allData = context.chart.data.datasets.flatMap(dataset => dataset.data);
                                    const maxValue = Math.max(...allData);
                                    return maxValue * 1.2;
                                },
                            }
                        }
                    }
                });
            }
            
            console.log('Weekday average sales chart updated successfully');
            
        } catch (error) {
            console.error('Error updating weekday average sales chart:', error);
        }
    }
} 