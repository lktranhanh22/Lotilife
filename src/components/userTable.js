// Danh sách thành viên trong hệ thống dạng bảng có lọc theo lv1 lv2, tìm kiếm theo tên,ID,sdt,email
// Cây thành viên trong hệ thống dạng dropdown 
import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Input, DatePicker, Checkbox, Dropdown, Menu, Modal, Descriptions, Row, Col, Image, Tag as AntTag } from 'antd';
import { SearchOutlined, DownOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(isBetween);

const { RangePicker } = DatePicker;

const OrdersTable = ({ title, selectedColumns, onColumnsChange, levelFilter }) => {
  const today = [dayjs(), dayjs()];
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState(today);

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch('http://localhost:5000/orders'); //mode=[myorder,suborder,all] user_id 
      const result = await response.json();
      const filteredByLevel = result.filter(order => levelFilter(order.level));
      setData(filteredByLevel);
      filterByDateRange(filteredByLevel, selectedDateRange);
    };

    fetchData();
  }, [levelFilter]);

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    setModalVisible(true);
  };

  const handleTableChange = (pagination, filters, sorter) => {
    let currentData = data;

    if (filters.status) {
      currentData = currentData.filter(order => filters.status.includes(order.status));
    }
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
      order.orderId.toLowerCase().includes(value) ||
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
    setSelectedDateRange(dates);
    filterByDateRange(data, dates);
  };

  const resetFilters = () => {
    setFilteredData(data);
    setSelectedDateRange(today);
  };

  const columns = useOrderColumns(handleOrderClick, selectedColumns, data, setFilteredData, resetFilters);

  const totals = calculateTotals(filteredData);

  const allColumnOptions = [
    { label: 'ID Đơn Hàng', value: 'orderId' },
    { label: 'Khách Hàng', value: 'customer' },
    { label: 'Thời Gian', value: 'orderDate' },
    { label: 'Trạng Thái', value: 'status' },
    { label: 'Cấp độ', value: 'level' },
    { label: 'Doanh Số', value: 'totalValue' },
    { label: 'Điểm PV', value: 'pvPoints' },
    { label: 'Hành Động', value: 'action' },
  ];

  const menu = (
    <Menu>
      <Checkbox.Group
        options={allColumnOptions}
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
    <Card
      title={title}
      extra={
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <RangePicker
            onChange={handleDateRangeChange}
            format="DD/MM/YYYY"
            value={selectedDateRange}
            style={{ marginRight: 8, marginBottom: 8 }}
          />
          <Input
            placeholder="Tìm kiếm đơn hàng..."
            onChange={handleSearch}
            style={{ width: 200, marginRight: 8, marginBottom: 8 }}
          />
          <Dropdown overlay={menu} trigger={['click']}>
            <Button>
              Chọn cột <DownOutlined />
            </Button>
          </Dropdown>
        </div>
      }
      style={{ marginTop: 16 }}
    >
      <Table
        columns={columns}
        dataSource={filteredData}
        pagination={{ pageSize: 5 }}
        onChange={handleTableChange}
        scroll={{ x: 800 }} // Cho phép cuộn ngang nếu bảng quá rộng
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
      <Modal
        visible={modalVisible}
        title={`Thông tin đơn hàng: #${selectedOrder?.orderId}`}
        onCancel={closeModal}
        footer={[
          <Button key="close" type="primary" onClick={closeModal}>
            THOÁT
          </Button>,
        ]}
        width={700}
      >
        {selectedOrder?.items.map((item, index) => (
          <Row key={index} style={{ marginBottom: 16 }}>
            <Col span={6}>
              <Image
                width={50}
                src={item.image}
                alt={item.name}
              />
            </Col>
            <Col span={12}>
              <strong>{item.name}</strong>
            </Col>
            <Col span={6} style={{ textAlign: 'right' }}>
              <AntTag color="blue">Số lượng: {item.quantity}</AntTag>
              <AntTag color="purple">{item.price.toLocaleString()} đ</AntTag>
            </Col>
          </Row>
        ))}

        <Descriptions title="Giá trị đơn hàng" bordered>
          <Descriptions.Item label="Tiền hàng">{selectedOrder?.totalItemsValue.toLocaleString()} đ</Descriptions.Item>
          <Descriptions.Item label="Phí ship">{selectedOrder?.shippingCost.toLocaleString()} đ</Descriptions.Item>
          <Descriptions.Item label="Tổng đơn">{selectedOrder?.totalOrderValue.toLocaleString()} đ</Descriptions.Item>
        </Descriptions>

        <Descriptions title="Thông tin người nhận" bordered style={{ marginTop: 16 }}>
          <Descriptions.Item label="Điện thoại">{selectedOrder?.recipientPhone}</Descriptions.Item>
          <Descriptions.Item label="Họ tên">{selectedOrder?.recipientName}</Descriptions.Item>
          <Descriptions.Item label="Địa chỉ">{selectedOrder?.recipientAddress}</Descriptions.Item>
        </Descriptions>
      </Modal>
    </Card>
  );
};

const useOrderColumns = (onOrderClick, selectedColumns, data, setFilteredData, resetFilters) => {
  const allColumns = [
    {
      title: 'ID Đơn Hàng',
      dataIndex: 'orderId',
      key: 'orderId',
      sorter: (a, b) => a.orderId.localeCompare(b.orderId),
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
        record.orderId.toLowerCase().includes(value.toLowerCase()),
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
      filters: [
        { text: 'Đã giao', value: 'Đã giao' },
        { text: 'Đang xử lý', value: 'Đang xử lý' },
        { text: 'Đã hủy', value: 'Đã hủy' },
      ],
      onFilter: (value, record) => record.status === value,
      render: status => {
        let color = 'geekblue';
        if (status === 'Đã giao') color = 'green';
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
        <Button type="primary" onClick={() => onOrderClick(record)}>
          Xem chi tiết
        </Button>
      ),
    },
  ];

  return allColumns.filter(column => selectedColumns.includes(column.key));
};

const calculateTotals = (data) => {
  return data.reduce(
    (totals, order) => {
      totals.totalValue += parseFloat(order.totalValue);
      totals.pvPoints += order.pvPoints;
      return totals;
    },
    { totalValue: 0, pvPoints: 0 }
  );
};

const MyOrders = () => {
  const [selectedColumns, setSelectedColumns] = useState(['orderId', 'customer', 'orderDate', 'status', 'totalValue', 'pvPoints', 'action']);

  return <OrdersTable title="Danh sách đơn hàng của tôi" selectedColumns={selectedColumns} onColumnsChange={setSelectedColumns} levelFilter={level => level === 0} />;
};

const SubOrders = () => {
  const [selectedColumns, setSelectedColumns] = useState(['orderId', 'customer', 'orderDate', 'status', 'level', 'totalValue', 'pvPoints', 'action']);

  return <OrdersTable title="Danh sách đơn hàng cấp dưới" selectedColumns={selectedColumns} onColumnsChange={setSelectedColumns} levelFilter={level => level > 0} />;
};

export { MyOrders, SubOrders };
