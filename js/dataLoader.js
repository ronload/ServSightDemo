/**
 * 数据加载器
 * 负责从CSV文件加载销售数据
 */

class DataLoader {
    constructor() {
        // 使用相對路徑，這樣可以在本地開發服務器和生產環境中正常工作
        this.receiptsPath = '/receipts_csv/';
        this.cachedData = null;
        this.cachedBusinessDays = null;
        this.categories = [
            '牛肉麵類',
            '拌麵類',
            '手作類',
            '小碟類',
            '湯品類',
            '飲料類',
            '加點類'
        ];
    }

    /**
     * 標準化商品名稱，移除(套餐)和(單點)後綴
     * @param {string} productName 原商品名稱
     * @returns {string} 標準化後的商品名稱
     */
    standardizeProductName(productName) {
        if (!productName) return productName;
        
        // 添加調試日誌
        if (productName.includes('學生') || productName.includes('加麵')) {
            console.log('Standardizing name:', productName);
        }
        
        // 首先去掉套餐和單點的標記
        let standardName = productName
            .replace(/\(套餐\)$/, '')
            .replace(/\(單點\)$/, '')
            .trim();
            
        // 特別處理「學生加麵」和「加麵」的所有可能變體
        if (standardName.includes('學生') && standardName.includes('加麵')) {
            console.log('Identified as student extra noodle variant');
            return '學生加麵';
        } else if (standardName === '加麵' || standardName === '普通加麵') {
            console.log('Identified as regular extra noodle');
            return '加麵';
        }
        
        // 將紅燒三寶、川辣三寶、蕃茄三寶標準化為對應的三寶麵
        if (standardName === '紅燒三寶') {
            standardName = '紅燒三寶麵';
        } else if (standardName === '川辣三寶') {
            standardName = '川辣三寶麵';
        } else if (standardName === '蕃茄三寶') {
            standardName = '蕃茄三寶麵';
        }
        
        if (standardName.includes('學生') || standardName.includes('加麵')) {
            console.log('Final standardized name:', standardName);
        }
        
        return standardName;
    }

    /**
     * load all receipts data
     * @returns {Promise<Array>} data after standardize product name
     */
    async loadAllData() {
        if (this.cachedData) {
            return this.cachedData;
        }

        try {
            // get all csv files
            const csvFiles = await this.getCSVFileList();
            
            // load all files data
            const dataPromises = csvFiles.map(file => this.loadCSVFile(file));
            const dataArrays = await Promise.all(dataPromises);
            
            // merge all data
            this.cachedData = dataArrays.flat();
            
            return this.cachedData;
        } catch (error) {
            console.error('加载数据失败:', error);
            return [];
        }
    }

    /**
     * 获取所有营业日期列表
     * @returns {Promise<Array>} 营业日期列表
     */
    async getBusinessDays() {
        if (this.cachedBusinessDays) {
            return this.cachedBusinessDays;
        }

        try {
            // 获取所有CSV文件列表
            const csvFiles = await this.getCSVFileList();
            
            // 从文件名中提取日期
            const businessDays = csvFiles.map(file => {
                const dateMatch = file.match(/(\d{8})\.csv$/);
                if (dateMatch && dateMatch[1]) {
                    return formatDateString(dateMatch[1]);
                }
                return null;
            }).filter(date => date !== null);
            
            // 按日期排序
            businessDays.sort((a, b) => parseDate(a) - parseDate(b));
            
            this.cachedBusinessDays = businessDays;
            return businessDays;
        } catch (error) {
            console.error('获取营业日期失败:', error);
            return [];
        }
    }

    /**
     * 获取指定数量的最近营业日
     * @param {number} count 要获取的营业日数量
     * @returns {Promise<Array>} 日期范围内的营业日
     */
    async getRecentBusinessDays(count) {
        const allBusinessDays = await this.getBusinessDays();
        if (count >= allBusinessDays.length) {
            return allBusinessDays;
        }
        
        return allBusinessDays.slice(allBusinessDays.length - count);
    }

    /**
     * 获取指定日期范围内的销售数据（基于实际营业日）
     * @param {Date} startDate 开始日期
     * @param {Date} endDate 结束日期
     * @returns {Promise<Array>} 该日期范围内的销售数据
     */
    async getDataByDateRange(startDate, endDate) {
        try {
            console.log('Date range:', startDate, 'to', endDate);
            
            // 將日期轉換為 YYYYMMDD 格式的字符串，用於比較
            const startStr = startDate.getFullYear() +
                String(startDate.getMonth() + 1).padStart(2, '0') +
                String(startDate.getDate()).padStart(2, '0');
            
            const endStr = endDate.getFullYear() +
                String(endDate.getMonth() + 1).padStart(2, '0') +
                String(endDate.getDate()).padStart(2, '0');
            
            console.log('Date strings:', startStr, 'to', endStr);
            
            // 獲取所有可能的文件名
            const allFiles = await this.getCSVFileList();
            console.log('All files:', allFiles);
            
            // 過濾出日期範圍內的文件
            const targetFiles = allFiles.filter(fileName => {
                const dateMatch = fileName.match(/(\d{8})\.csv$/);
                if (!dateMatch) return false;
                
                const fileDate = dateMatch[1];
                return fileDate >= startStr && fileDate <= endStr;
            });
            
            console.log('Target files:', targetFiles);
            
            if (targetFiles.length === 0) {
                console.log('No files found in date range');
                return [];
            }
            
            // 加載所有目標文件的數據
            const dataPromises = targetFiles.map(file => this.loadCSVFile(file));
            const dataArrays = await Promise.all(dataPromises);
            
            // 合併所有數據
            const allData = dataArrays.flat();
            console.log('Total records loaded:', allData.length);
            
            return allData;
        } catch (error) {
            console.error('Error in getDataByDateRange:', error);
            return [];
        }
    }

    /**
     * 获取最近N个营业日的销售数据
     * @param {number} days 营业日天数
     * @returns {Promise<Array>} 最近N个营业日的销售数据
     */
    async getRecentData(days) {
        // 获取最近的N个营业日期
        const recentBusinessDays = await this.getRecentBusinessDays(days);
        
        if (recentBusinessDays.length === 0) {
            return [];
        }
        
        // 设定日期范围
        const startDate = parseDate(recentBusinessDays[0]);
        const endDate = parseDate(recentBusinessDays[recentBusinessDays.length - 1]);
        
        // 获取指定日期范围内的数据
        const allData = await this.loadAllData();
        
        return allData.filter(item => {
            if (!item.date) return false;
            
            // 检查日期是否在最近的营业日列表中
            return recentBusinessDays.includes(item.date);
        });
    }

    /**
     * 获取所有可用的商品列表
     * @returns {Promise<Array>} 商品列表
     */
    async getAllProducts() {
        const allData = await this.loadAllData();
        
        // 使用Set来去重
        const productSet = new Set();
        
        allData.forEach(item => {
            // 不包含共计行
            if (item.product && !item.product.includes('共計') && !item.product.includes('總計')) {
                productSet.add(item.product);
            }
        });
        
        return Array.from(productSet).sort();
    }

    /**
     * 读取所有CSV文件名
     * @returns {Promise<Array>} CSV文件名列表
     */
    async getCSVFileList() {
        try {
            // 生成可能的文件名列表
            const csvFiles = [];
            const endDate = new Date();
            const startDate = new Date(2025, 1, 1); // 从2025-02-01开始
            
            console.log('Generating file list from', startDate, 'to', endDate);
            
            let currentDate = new Date(startDate);
            while (currentDate <= endDate) {
                const year = currentDate.getFullYear();
                const month = String(currentDate.getMonth() + 1).padStart(2, '0');
                const day = String(currentDate.getDate()).padStart(2, '0');
                
                const fileName = `${year}${month}${day}.csv`;
                csvFiles.push(fileName);
                
                // 移到下一天
                currentDate.setDate(currentDate.getDate() + 1);
            }
            
            console.log('Generated file list:', csvFiles);
            
            // 並行檢查所有文件是否存在
            const existingFiles = await Promise.all(
                csvFiles.map(async file => {
                    const exists = await this.checkFileExists(file);
                    return exists ? file : null;
                })
            );
            
            // 過濾出存在的文件
            const availableFiles = existingFiles.filter(file => file !== null);
            console.log('Available files:', availableFiles);
            
            return availableFiles;
            
        } catch (error) {
            console.error('Error getting CSV file list:', error);
            return [];
        }
    }

    /**
     * 检查文件是否存在
     * @param {string} fileName 文件名
     * @returns {Promise<boolean>} 文件是否存在
     */
    async checkFileExists(fileName) {
        try {
            console.log('Checking file exists:', this.receiptsPath + fileName);
            const response = await fetch(this.receiptsPath + fileName, { method: 'HEAD' });
            console.log('File check response:', fileName, response.ok);
            return response.ok;
        } catch (error) {
            console.error('Error checking file:', fileName, error);
            return false;
        }
    }

    /**
     * 加载并解析单个CSV文件
     * @param {string} fileName 文件名
     * @returns {Promise<Array>} 解析后的数据
     */
    async loadCSVFile(fileName) {
        try {
            console.log('Loading CSV file:', this.receiptsPath + fileName);
            const response = await fetch(this.receiptsPath + fileName);
            
            // 如果文件不存在，返回空数组
            if (!response.ok) {
                console.warn('File not found:', fileName);
                return [];
            }
            
            const text = await response.text();
            console.log('CSV content for', fileName, ':', text.substring(0, 200) + '...');
            
            // 解析CSV数据
            const data = this.parseCSVData(text, fileName);
            console.log('Parsed data count for', fileName, ':', data.length);
            return data;
        } catch (error) {
            console.error(`加载文件 ${fileName} 失败:`, error);
            return [];
        }
    }

    /**
     * 解析CSV数据
     * @param {string} csvText CSV文本
     * @param {string} fileName 文件名
     * @returns {Array} 解析后的数据
     */
    parseCSVData(csvText, fileName) {
        try {
            // 从文件名中提取日期，格式为YYYYMMDD.csv
            const dateMatch = fileName.match(/(\d{8})\.csv$/);
            if (!dateMatch || !dateMatch[1]) {
                console.error('Invalid filename format:', fileName);
                return [];
            }
            
            // 將檔案名稱中的日期轉換為 YYYY/MM/DD 格式
            const year = dateMatch[1].substring(0, 4);
            const month = dateMatch[1].substring(4, 6);
            const day = dateMatch[1].substring(6, 8);
            const fileDate = `${year}/${month}/${day}`;
            
            console.log('Processing file for date:', fileDate);
            
            // 解析CSV内容
            const rows = csvText.split('\n');
            const data = [];
            let currentCategory = '';
            
            // 添加學生加麵計數器
            let studentNoodleCount = 0;
            
            rows.forEach((row, index) => {
                // 跳过CSV的标题行和空行
                if (index === 0 || !row.trim()) return;
                
                const columns = row.split(',');
                
                // 确保列数足够
                if (columns.length < 4) {
                    console.warn(`Invalid row format at line ${index + 1}:`, row);
                    return;
                }
                
                // 使用文件名中的日期，忽略CSV中的日期列
                const date = fileDate;
                const rawProduct = columns[1].trim().replace(/\s+/g, ' '); // 標準化空格
                const quantity = parseInt(columns[2].trim(), 10) || 0;
                const amount = parseInt(columns[3].trim(), 10) || 0;
                
                // 標準化商品名稱，將套餐和單點視為同一個商品
                const product = this.standardizeProductName(rawProduct);
                
                // 特別記錄學生加麵
                if (rawProduct.includes('學生') && rawProduct.includes('加麵')) {
                    studentNoodleCount++;
                    console.log(`Found student noodle entry #${studentNoodleCount} in ${fileName}:`, {
                        line: index + 1,
                        rawProduct,
                        standardizedProduct: product,
                        quantity,
                        amount,
                        rawLength: rawProduct.length,
                        containsStudent: rawProduct.includes('學生'),
                        containsNoodle: rawProduct.includes('加麵'),
                        charCodes: Array.from(rawProduct).map(char => char.charCodeAt(0))
                    });
                }
                
                // 检查是否为类别共计行
                if (product.includes('共計')) {
                    // 通过"类别共计"来提取当前类别
                    const categoryMatch = product.match(/(.+)共計/);
                    if (categoryMatch && categoryMatch[1]) {
                        currentCategory = categoryMatch[1];
                    }
                }
                
                // 記錄商品的原始名稱，以備需要
                data.push({
                    date,
                    product,
                    rawProduct,
                    quantity,
                    amount,
                    category: currentCategory
                });
            });
            
            if (studentNoodleCount > 0) {
                console.log(`Found ${studentNoodleCount} student noodle entries in ${fileName}`);
            }
            
            console.log(`Parsed ${data.length} records for date ${fileDate}`);
            return data;
            
        } catch (error) {
            console.error('Error parsing CSV data:', error);
            return [];
        }
    }

    /**
     * 获取按日期组织的销售数据
     * @returns {Promise<Object>} 销售数据对象，包含dailyData数组
     */
    async getSalesData() {
        const allData = await this.loadAllData();
        const dailyDataMap = new Map();
        
        // 组织数据按日期分组
        allData.forEach(item => {
            if (!item.date) return;
            
            if (!dailyDataMap.has(item.date)) {
                dailyDataMap.set(item.date, {
                    date: item.date,
                    totalSales: 0,
                    totalQuantity: 0,
                    products: {}
                });
            }
            
            const dayData = dailyDataMap.get(item.date);
            
            // 跳過共計和總計行
            if (item.product.includes('共計') || item.product.includes('總計')) {
                return;
            }
            
            // 累加总销售额和销售量
            dayData.totalSales += item.amount;
            dayData.totalQuantity += item.quantity;
            
            // 使用標準化後的商品名稱作為鍵
            if (!dayData.products[item.product]) {
                dayData.products[item.product] = {
                    sales: 0,
                    quantity: 0,
                    rawProducts: {} // 新增：記錄原始商品名稱的銷售數據
                };
            }
            
            // 更新標準化商品的總計
            dayData.products[item.product].sales += item.amount;
            dayData.products[item.product].quantity += item.quantity;
            
            // 記錄原始商品名稱的銷售數據
            if (!dayData.products[item.product].rawProducts[item.rawProduct]) {
                dayData.products[item.product].rawProducts[item.rawProduct] = {
                    sales: 0,
                    quantity: 0
                };
            }
            dayData.products[item.product].rawProducts[item.rawProduct].sales += item.amount;
            dayData.products[item.product].rawProducts[item.rawProduct].quantity += item.quantity;
        });
        
        // 转换为数组并按日期排序
        const dailyData = Array.from(dailyDataMap.values());
        dailyData.sort((a, b) => parseDate(a.date) - parseDate(b.date));
        
        return {
            dailyData: dailyData,
            totalDays: dailyData.length
        };
    }
}

// 導出 DataLoader 類
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataLoader;
} 