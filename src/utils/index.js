export const formatCurrency = (value) => {
    if (value >= 1_000_000_000) {
        return `${(value / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}B`;
    } else if (value >= 100_000_000) {
        return `${(value / 100_000_000).toFixed(1).replace(/\.0$/, '')}M`;
    } else {
        return `${parseInt(value, 10).toLocaleString('vi-VN')} đ`;
    }
};