/**
 * 工具函数库
 */

// 日期格式化函数，将YYYYMMDD格式转换为YYYY/MM/DD
function formatDateString(dateString) {
    // 确保日期字符串是8位数字
    if (!/^\d{8}$/.test(dateString)) {
        return dateString;
    }
    
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    
    return `${year}/${month}/${day}`;
}

// 将日期字符串转换为Date对象
function parseDate(dateString) {
    try {
        console.log('Parsing date string:', dateString);
        
        if (!dateString) {
            console.error('Date string is empty or null');
            return null;
        }
        
        // 支持 YYYY/MM/DD 和 YYYY-MM-DD 格式
        const parts = dateString.split(/[/-]/);
        
        if (parts.length !== 3) {
            console.error('Invalid date format. Expected YYYY/MM/DD or YYYY-MM-DD, got:', dateString);
            return null;
        }
        
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1;
        const day = parseInt(parts[2]);
        
        if (isNaN(year) || isNaN(month) || isNaN(day)) {
            console.error('Invalid date parts:', { year, month: month + 1, day });
            return null;
        }
        
        const date = new Date(year, month, day);
        
        // 驗證日期是否有效
        if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
            console.error('Invalid date value:', dateString);
            return null;
        }
        
        console.log('Successfully parsed date:', date);
        return date;
    } catch (error) {
        console.error('Error parsing date:', error);
        return null;
    }
}

// 获取星期几（0=星期日，1=星期一，...，6=星期六）
function getDayOfWeek(dateString) {
    const date = parseDate(dateString);
    return date ? date.getDay() : 0;
}

// 获取星期几的中文名称
function getDayOfWeekName(dayIndex) {
    const dayNames = ['（日）', '（一）', '（二）', '（三）', '（四）', '（五）', '（六）'];
    return dayNames[dayIndex];
}

// 格式化金额，添加千位分隔符
function formatAmount(amount) {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// 随机生成颜色
function getRandomColors(count) {
    const colors = [];
    
    for (let i = 0; i < count; i++) {
        // 使用预定义的颜色数组，确保颜色足够区分
        const predefinedColors = [
            'rgba(255, 99, 132, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(153, 102, 255, 0.7)',
            'rgba(255, 159, 64, 0.7)',
            'rgba(199, 199, 199, 0.7)',
            'rgba(83, 102, 255, 0.7)',
            'rgba(40, 167, 69, 0.7)',
            'rgba(220, 53, 69, 0.7)'
        ];
        
        if (i < predefinedColors.length) {
            colors.push(predefinedColors[i]);
        } else {
            // 如果预定义颜色不够，则随机生成
            const r = Math.floor(Math.random() * 255);
            const g = Math.floor(Math.random() * 255);
            const b = Math.floor(Math.random() * 255);
            colors.push(`rgba(${r}, ${g}, ${b}, 0.7)`);
        }
    }
    
    return colors;
}

// 检查两个日期是否为同一天
function isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
}

// 获取过去N天的日期范围
function getDateRangeFromDays(days) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    
    return {
        start: startDate,
        end: endDate
    };
}

// 將 Date 對象轉換為 YYYY-MM-DD 格式（用於 input type="date"）
function formatDateForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
}

// 將 Date 對象轉換為 YYYY-MM-DD 格式
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
}

// 检查日期是否在指定范围内
function isDateInRange(dateStr, startDate, endDate) {
    const date = parseDate(dateStr);
    return date && date >= startDate && date <= endDate;
} 