const calculateTotals = (data) => {
    if (!data || data.length === 0) {
      // Nếu không có dữ liệu, trả về tổng mặc định là 0
      return { totalValue: 0, pvPoints: 0 };
    }
  
    return data.reduce(
      (totals, order) => {
        totals.totalValue += parseFloat(order.totalValue) || 0; // Đảm bảo giá trị là số
        totals.pvPoints += parseInt(order.pvPoints, 10) || 0; // Đảm bảo giá trị là số
        return totals;
      },
      { totalValue: 0, pvPoints: 0 }
    );
  };
  
  export { calculateTotals };
  