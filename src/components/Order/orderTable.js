import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Input, DatePicker, Checkbox, Dropdown, Menu, message, Skeleton,Grid,Modal  } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { getOrders } from '../../api';
import { useOrderColumns } from './useOrderColumns';
import { calculateTotals } from './calculateTotals';
import OrderDetailsModal from './OrderDetailsModal';

dayjs.extend(isBetween);

const { RangePicker } = DatePicker;
const { useBreakpoint } = Grid;
const statusLabels = {
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
  pending: 'Đang chờ',
  processing: 'Đang xử lý',
  'on-hold': 'Đang xử lý',
  // refunded: 'Hoàn tiền',
  // failed: 'Thất bại',  
};

const OrdersTable = ({ title, selectedColumns, onColumnsChange, mode = 'myorder', userId, levelFilter,columnOptions,canCancelOrder}) => {    
  const screens = useBreakpoint();
  const today = [dayjs().startOf('week'), dayjs().endOf('week')];
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState(today);
  const [loading, setLoading] = useState(true); // Trạng thái tải
  const [totals, setTotals] = useState({ totalValue: 0, pvPoints: 0 });
  const user_id = userId ? userId : localStorage.getItem('user_id'); 
  useEffect(() => {
    const fetchData = async () => {
        setLoading(true); // Bắt đầu tải
        try {
            const start_date = selectedDateRange[0].format('YYYY-MM-DD');
            const end_date = selectedDateRange[1].format('YYYY-MM-DD');

            const response = await getOrders({
                mode: mode,
                user_id: user_id, // Đảm bảo user_id được cập nhật đúng
                start_date: start_date,
                end_date: end_date,
            });

            if (response.data.success) {
                const convertedData = response.data.data.map(order => ({
                    ...order,
                    user_id: parseInt(order.user_id, 10),
                    order_id: parseInt(order.order_id, 10),
                    level: parseInt(order.level, 10),
                    pvPoints: parseInt(order.pvPoints, 10),
                    totalValue: parseFloat(order.totalOrderValue),
                    status: statusLabels[order.status] || order.status, 
                    items: order.items
                }));          
                const filteredByLevel = convertedData.filter(order => levelFilter(order.level));
                setData(filteredByLevel);
                setFilteredData(filteredByLevel); // Cập nhật filteredData luôn
            } else {
                setData([]); // Xóa dữ liệu nếu không có đơn hàng nào
                setFilteredData([]); // Xóa dữ liệu lọc
            }
        } catch (error) {
            message.error('Lỗi khi gọi API đơn hàng');
            setData([]); // Xóa dữ liệu nếu xảy ra lỗi
            setFilteredData([]); // Xóa dữ liệu lọc
        } finally {
            setLoading(false); // Kết thúc tải
        }
    };

    fetchData();
}, [mode, user_id, selectedDateRange, levelFilter]);

  useEffect(() => {
    // Tính tổng dựa trên dữ liệu đã lọc mỗi khi `filteredData` thay đổi
    setTotals(calculateTotals(filteredData));
  }, [filteredData]);

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    setModalVisible(true);
  };
  const handleCanCancelOrder = (order) => {    
    Modal.confirm({
      title: `Bạn có muốn hủy đơn hàng ${order.orderId}?`,
      okText: 'Có',
      cancelText: 'Không',
      onOk: () => {
        message.info('Liên hệ CSKH để hủy đơn!');
      },
      onCancel: () => {
        // Không cần làm gì khi chọn "Không", Modal sẽ tự động đóng.
      },
    });
  };
  const handleTableChange = (pagination, filters, sorter) => {
    let currentData = data;

    // Bộ lọc ID đơn hàng
    if (filters.orderId) {
      currentData = currentData.filter(order => filters.orderId.includes(order.orderId.toString()));
    }

    // Bộ lọc Khách hàng
    if (filters.customer) {
      currentData = currentData.filter(order => filters.customer.some(cust => order.customer.toLowerCase().includes(cust.toLowerCase())));
    }

    // Bộ lọc Trạng thái
    if (filters.status) {
      currentData = currentData.filter(order => filters.status.includes(order.status));
    }

    // Bộ lọc Cấp độ
    if (filters.level) {
      currentData = currentData.filter(order => filters.level.includes(order.level));
    }

    if (sorter.order) {
      currentData = currentData.sort((a, b) => {
        if (sorter.order === 'ascend') {
          return a[sorter.field] > b[sorter.field] ? 1 : -1;
        } else {
          return a[sorter.field] < b[sorter.field] ? 1 : -1;
        }
      });
    }

    setFilteredData(currentData);
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    const filtered = data.filter(order =>
      order.orderId.toString().toLowerCase().includes(value) ||
      order.customer.toLowerCase().includes(value)
    );
    setFilteredData(filtered);
  };

  const filterByDateRange = (dataToFilter, dateRange) => {
    if (!dateRange || dateRange.length === 0) {
      setFilteredData(dataToFilter);
      return;
    }
    const [start, end] = dateRange;
    const filtered = dataToFilter.filter(order =>
      dayjs(order.orderDate).isBetween(start, end, 'day', '[]')
    );
    setFilteredData(filtered);
  };

  const handleDateRangeChange = (dates) => {
    if (!dates || dates.length === 0) {
      setSelectedDateRange(today); // Đặt lại khoảng thời gian mặc định là trong tuần
      filterByDateRange(data, today); // Lọc dữ liệu theo khoảng thời gian mặc định là trong tuần
    } else {
      setSelectedDateRange(dates);
      filterByDateRange(data, dates);
    }
  };

  const resetFilters = () => {
    setFilteredData(data);
    setSelectedDateRange(today);
  };
 
  const columns = useOrderColumns(handleOrderClick, selectedColumns, data, setFilteredData, resetFilters,statusLabels,canCancelOrder,handleCanCancelOrder);

  // const allColumnOptions = [
  //   { label: 'ID Đơn Hàng', value: 'orderId' },
  //   { label: 'Khách Hàng', value: 'customer' },
  //   { label: 'Thời Gian', value: 'orderDate' },
  //   { label: 'Trạng Thái', value: 'status' },
  //   { label: 'Cấp độ', value: 'level' },
  //   { label: 'Doanh Số', value: 'totalValue' },
  //   { label: 'Điểm PV', value: 'pvPoints' },
  //   { label: 'Hành Động', value: 'action' },
  // ];
  const mobileColumns = [
    { key: 'orderId', width: '20%' },
    { key: 'status', width: '40%' },
    { key: 'action', width: '40%' },
  ];
  const scrollX = screens.xs ? 400 : 800;
  // Chọn các cột phù hợp theo kích thước màn hình
  const columnsToUse = screens.xs
    ? mobileColumns.map(mc => ({
        ...columns.find(col => col.key === mc.key),
        width: mc.width,
      }))
    : columns;

  const menu = (
    <Menu>
      <Checkbox.Group
        options={columnOptions}
        value={selectedColumns}
        onChange={onColumnsChange}
        style={{ display: 'block', padding: 8 }}
      />
    </Menu>
  );

  const closeModal = () => {
    setModalVisible(false);
    setSelectedOrder(null);
  };

  return (
    <div style={{ marginTop: 16, backgroundColor: 'white', padding: screens.xs ? '5px' : '10px 0' }}>
      {/* Header Section */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: screens.xs ? 'center' : 'space-evenly',
          alignItems: 'center',
        }}
      >
        <h2 style={{ textAlign: screens.xs ? 'center' : 'left', width: screens.xs ? '100%' : 'auto' }}>{title}</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', width: screens.xs ? '100%' : 'auto' }}>
          <RangePicker
            onChange={handleDateRangeChange}
            format="DD/MM/YYYY"
            value={selectedDateRange}
            style={{ marginRight: 8, width: screens.xs ? '100%' : 'auto', marginBottom: screens.xs ? 8 : 0 }}
          />
          <Input
            placeholder="Tìm kiếm đơn hàng..."
            onChange={handleSearch}
            style={{ width: screens.xs ? '100%' : 200, marginRight: 8, marginBottom: screens.xs ? 8 : 0 }}
          />
          <Dropdown overlay={menu} trigger={['click']}>
            <Button style={{ width: screens.xs ? '100%' : 'auto',marginBottom: screens.xs ? 8 : 0, display: screens.xs ? 'none':'block' }}>
              Chọn cột <DownOutlined />
            </Button>
          </Dropdown>
        </div>
      </div>

      {/* Table Section */}
      {loading ? (
        <Skeleton active />
      ) : (
        <Table
          columns={columnsToUse}
          dataSource={filteredData}
          pagination={{ pageSize: 5 }}
          onChange={handleTableChange}
          scroll={{ x: {scrollX} }}
          tableLayout="fixed"
          summary={() => {
            const totalValueIndex = selectedColumns.indexOf('totalValue');
            const pvPointsIndex = selectedColumns.indexOf('pvPoints');
            return (
              <Table.Summary.Row>
                {columns.map((col, index) => (
                  <Table.Summary.Cell index={index} key={col.key}>
                    {index === totalValueIndex ? totals.totalValue.toLocaleString() + ' đ' : null}
                    {index === pvPointsIndex ? totals.pvPoints : null}
                  </Table.Summary.Cell>
                ))}
              </Table.Summary.Row>
            );
          }}
        />
      )}

      {/* Order Details Modal */}
      <OrderDetailsModal visible={modalVisible} order={selectedOrder} onClose={closeModal} />
    </div>
  );
};
export { OrdersTable };
