import React from 'react';
import { Input, Button, Tag,Tooltip } from 'antd';
import { SearchOutlined,FileSearchOutlined,CloseCircleOutlined  } from '@ant-design/icons';
import dayjs from 'dayjs'; 
const useOrderColumns = (onOrderClick, selectedColumns, data, setFilteredData, resetFilters,statusLabels,canCancelOrder,onCanCancelOrder) => {  
    const allColumns = [
      {
        title: 'ID',
        dataIndex: 'orderId',
        key: 'orderId',
        sorter: (a, b) => a.orderId - b.orderId, // Đã chuyển thành số
        sortDirections: ['ascend', 'descend'],
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
          <div style={{ padding: 8 }}>
            <Input
              placeholder="Tìm kiếm ID đơn hàng"
              value={selectedKeys[0]}
              onChange={e => {
                const value = e.target.value;
                setSelectedKeys(value ? [value] : []);
                if (!value) {
                  clearFilters();
                  setFilteredData(data);
                }
              }}
              onPressEnter={() => confirm()}
              style={{ marginBottom: 8, display: 'block' }}
            />
            <Button
              type="primary"
              onClick={() => confirm()}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90, marginRight: 8 }}
            >
              Tìm kiếm
            </Button>
            <Button 
              onClick={() => {
                clearFilters();
                resetFilters();
              }} 
              size="small" 
              style={{ width: 90 }}
            >
              Đặt lại
            </Button>
          </div>
        ),
        onFilter: (value, record) =>
          record.orderId.toString().includes(value),
        render: (text, record) => (
          <Button type="link" onClick={() => onOrderClick(record)}>
            {text}
          </Button>
        ),
      },
      {
        title: 'Khách Hàng',
        dataIndex: 'customer',
        key: 'customer',
        sorter: (a, b) => a.customer.localeCompare(b.customer),
        sortDirections: ['ascend', 'descend'],
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
          <div style={{ padding: 8 }}>
            <Input
              placeholder="Tìm kiếm khách hàng"
              value={selectedKeys[0]}
              onChange={e => {
                const value = e.target.value;
                setSelectedKeys(value ? [value] : []);
                if (!value) {
                  clearFilters();
                  setFilteredData(data);
                }
              }}
              onPressEnter={() => confirm()}
              style={{ marginBottom: 8, display: 'block' }}
            />
            <Button
              type="primary"
              onClick={() => confirm()}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90, marginRight: 8 }}
            >
              Tìm kiếm
            </Button>
            <Button 
              onClick={() => {
                clearFilters();
                resetFilters();
              }} 
              size="small" 
              style={{ width: 90 }}
            >
              Đặt lại
            </Button>
          </div>
        ),
        onFilter: (value, record) =>
          record.customer.toLowerCase().includes(value.toLowerCase()),
      },
      {
        title: 'Thời Gian',
        dataIndex: 'orderDate',
        key: 'orderDate',
        sorter: (a, b) => dayjs(a.orderDate).unix() - dayjs(b.orderDate).unix(),
        sortDirections: ['ascend', 'descend'],
      },
      {
        title: 'Trạng Thái',
        dataIndex: 'status',
        key: 'status',
        filters: Object.keys(statusLabels).map(key => ({
            text: statusLabels[key],
            value: statusLabels[key],
        })),
        onFilter: (value, record) => record.status === value,
        render: status => {
            let color = 'geekblue';
            if (status === 'Hoàn thành') color = 'green';
            else if (status === 'Đang xử lý') color = 'orange';
            else if (status === 'Đã hủy') color = 'red';
            return <Tag color={color}>{status}</Tag>;
        },
      },
      {
        title: 'Cấp độ',
        dataIndex: 'level',
        key: 'level',
        filters: [
          { text: 'Cấp 1', value: 1 },
          { text: 'Cấp 2', value: 2 },
        ],
        onFilter: (value, record) => record.level === value,
        sorter: (a, b) => a.level - b.level,
        render: level => `Cấp ${level}`,
      },
      {
        title: 'Doanh Số',
        dataIndex: 'totalValue',
        key: 'totalValue',
        sorter: (a, b) =>
          parseFloat(a.totalValue) - parseFloat(b.totalValue),
        sortDirections: ['ascend', 'descend'],
        render: value => `${parseInt(value, 10).toLocaleString()} đ`,
      },
      {
        title: 'Điểm PV',
        dataIndex: 'pvPoints',
        key: 'pvPoints',
        sorter: (a, b) => a.pvPoints - b.pvPoints,
        sortDirections: ['ascend', 'descend'],
      },
      {
        title: 'Hành Động',
        key: 'action',
        render: (text, record) => (
          <div>
                    <Tooltip title="Xem chi tiết đơn hàng">
                        <Button shape="circle" type="primary" onClick={() => onOrderClick(record)}>
                            <FileSearchOutlined />
                        </Button>
                    </Tooltip>
                    {canCancelOrder && (
                        <Tooltip title="Hủy đơn hàng">
                            <Button 
                                shape="circle" 
                                danger 
                                onClick={() => onCanCancelOrder(record)} 
                                style={{ marginLeft: 8 }}
                                icon={<CloseCircleOutlined />}
                            />
                        </Tooltip>
                    )}
                </div>
        ),
      },
    ];
  
    return allColumns.filter(column => selectedColumns.includes(column.key));
  };
export { useOrderColumns };