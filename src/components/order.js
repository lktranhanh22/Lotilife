import React, { useState, useEffect, useCallback } from 'react';
import { OrdersTable } from './Order/orderTable';
const defaultColumnOptions = [
  { label: 'ID Đơn Hàng', value: 'orderId' },
  { label: 'Khách Hàng', value: 'customer' },
  { label: 'Thời Gian', value: 'orderDate' },
  { label: 'Trạng Thái', value: 'status' },
  { label: 'Cấp độ', value: 'level' },
  { label: 'Doanh Số', value: 'totalValue' },
  { label: 'Điểm PV', value: 'pvPoints' },
  { label: 'Hành Động', value: 'action' },
];

const MyOrders = ({ userId, selectedColumns, title }) => { 
  const defaultColumns = ['orderId', 'customer', 'orderDate', 'status', 'totalValue', 'pvPoints', 'action'];
  const [columns, setColumns] = useState(selectedColumns || defaultColumns);

  useEffect(() => {
    if (selectedColumns) {
      setColumns(selectedColumns);
    }
  }, [selectedColumns]);  
  const levelFilter = useCallback((level) => level === 0, []);

  return (
    <OrdersTable 
      title={title || "Danh sách đơn hàng"}
      selectedColumns={columns} 
      onColumnsChange={setColumns} 
      mode="myorder" 
      userId={userId} 
      levelFilter={levelFilter}  // Lọc đơn hàng với level = 0             
      columnOptions= {defaultColumnOptions}
      canCancelOrder={true}
    />
  );
};
const SubOrders = ({ userId }) => {
  const [selectedColumns, setSelectedColumns] = useState(['orderId', 'customer', 'orderDate', 'status', 'level', 'totalValue', 'pvPoints']); 
  const levelFilter = useCallback((level) => level > 0, []);  
  return (    
      <OrdersTable       
        title="Danh sách đơn hàng cấp dưới" 
        selectedColumns={selectedColumns} 
        onColumnsChange={setSelectedColumns} 
        mode="suborder" 
        userId={userId} 
        levelFilter={levelFilter}  // Lọc đơn hàng với level > 0
        columnOptions={defaultColumnOptions}
        canCancelOrder={false}
      />    
  );
};

const CustomOrder = ({ userId }) => {
  const [selectedColumns, setSelectedColumns] = useState(['orderId', 'customer', 'orderDate', 'status', 'totalValue', 'pvPoints']);

  // Sử dụng useCallback để ghi nhớ hàm levelFilter
  const levelFilter = useCallback((level) => level === 0, []);

  return (
    <OrdersTable 
      title="Danh sách của thằng nào đó!" 
      selectedColumns={selectedColumns} 
      onColumnsChange={setSelectedColumns} 
      mode="myorder" 
      userId={userId} 
      levelFilter={levelFilter}  // Lọc đơn hàng với level = 0
    />
  );
};

export { MyOrders, SubOrders, CustomOrder };
