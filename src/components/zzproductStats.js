// Thống kế sản phẩm bán được trong hệ thống dùng bảng mở rộng Tree data nếu có sp biến thể
// ID_SP(Link sp) TEN_SP ANH SL_BÁN_RA DOANHSO 

// Thống kê thành viên trong hệ thống LIMIT 10 (LV1 và LV2)
// cho chọn LV 
// STT ID HO_TEN SL_DONHANG DOANH_SO DIEMPV 
import React, { useState, useEffect } from 'react';
import { Table, Input, DatePicker, Row, Col, Tabs, Checkbox } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

const ProductStats = () => {
  // State cho bảng thống kê sản phẩm
  const [productData, setProductData] = useState([]); 
  const [filteredProductData, setFilteredProductData] = useState([]); 
  const [searchText, setSearchText] = useState('');
  const [selectedDateRange, setSelectedDateRange] = useState([dayjs().startOf('month'), dayjs().endOf('month')]);

  // State cho bảng thống kê thành viên
  const [memberData, setMemberData] = useState([]); 
  const [filteredMemberData, setFilteredMemberData] = useState([]); 
  const [selectedMemberDateRange, setSelectedMemberDateRange] = useState([dayjs().startOf('month'), dayjs().endOf('month')]);
  const [selectedMemberLevel, setSelectedMemberLevel] = useState([]);

  // Cột cho bảng thống kê sản phẩm
  const productColumns = [
    {
      title: 'ID Sản phẩm',
      dataIndex: 'productId',
      key: 'productId',
      sorter: (a, b) => a.productId.localeCompare(b.productId),
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'productName',
      key: 'productName',
      sorter: (a, b) => a.productName.localeCompare(b.productName),
      sortDirections: ['ascend', 'descend'],
      render: (text, record) => (
        <a href={record.productLink} target="_blank" rel="noopener noreferrer">
          {text}
        </a>
      ),
    },
    {
      title: 'Ảnh thu nhỏ',
      dataIndex: 'thumbnail',
      key: 'thumbnail',
      render: (text, record) => (
        <img src={record.thumbnail} alt={record.productName} style={{ width: 50, height: 50 }} />
      ),
    },
    {
      title: 'Số lượng bán ra',
      dataIndex: 'quantitySold',
      key: 'quantitySold',
      sorter: (a, b) => a.quantitySold - b.quantitySold,
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: 'Tổng doanh số bán ra',
      dataIndex: 'totalSales',
      key: 'totalSales',
      sorter: (a, b) => a.totalSales - b.totalSales,
      sortDirections: ['ascend', 'descend'],
      render: value => `${value.toLocaleString()} đ`,
    },
    {
      title: 'Level',
      dataIndex: 'level',
      key: 'level',
      filters: [
        { text: 'Level 0', value: 0 },
        { text: 'Level 1', value: 1 },
        { text: 'Level 2', value: 2 },
      ],
      onFilter: (value, record) => record.level === value,
      render: level => `Level ${level}`,
    },
  ];

  // Cột cho bảng thống kê thành viên
  const memberColumns = [
    {
      title: 'ID Thành viên',
      dataIndex: 'memberId',
      key: 'memberId',
      sorter: (a, b) => a.memberId.localeCompare(b.memberId),
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: 'Tên thành viên',
      dataIndex: 'memberName',
      key: 'memberName',
      sorter: (a, b) => a.memberName.localeCompare(b.memberName),
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: 'Số lượng bán ra',
      dataIndex: 'totalQuantitySold',
      key: 'totalQuantitySold',
      sorter: (a, b) => a.totalQuantitySold - b.totalQuantitySold,
      sortDirections: ['ascend', 'descend'],
    },
    {
      title: 'Tổng doanh số bán ra',
      dataIndex: 'totalSales',
      key: 'totalSales',
      sorter: (a, b) => a.totalSales - b.totalSales,
      sortDirections: ['ascend', 'descend'],
      render: value => `${value.toLocaleString()} đ`,
    },
  ];

  useEffect(() => {
    const fetchProductData = async () => {
      const response = await axios.get('http://localhost:5000/products-stat'); 
      setProductData(response.data);
      setFilteredProductData(
        response.data.filter(item =>
          dayjs(item.saleDate).isBetween(selectedDateRange[0], selectedDateRange[1], 'day', '[]')
        )
      );
    };

    const fetchMemberData = async () => {
      const response = await axios.get('http://localhost:5000/members-sales-stat');
      setMemberData(response.data);
      filterMemberData(response.data); // Áp dụng bộ lọc cho bảng thành viên ngay sau khi lấy dữ liệu
    };

    fetchProductData();
    fetchMemberData();
  }, [selectedDateRange, selectedMemberDateRange, selectedMemberLevel]);

  const filterProductData = (dataToFilter) => {
    return dataToFilter.filter(item => 
      dayjs(item.saleDate).isBetween(selectedDateRange[0], selectedDateRange[1], 'day', '[]') &&
      (item.productId.toLowerCase().includes(searchText) || item.productName.toLowerCase().includes(searchText))
    );
  };

  const filterMemberData = (dataToFilter) => {
    let filtered = dataToFilter.filter(item =>
      dayjs(item.saleDate).isBetween(selectedMemberDateRange[0], selectedMemberDateRange[1], 'day', '[]')
    );

    if (selectedMemberLevel.length > 0) {
      filtered = filtered.filter(item => selectedMemberLevel.includes(item.level));
    }

    const sortedData = filtered.sort((a, b) => b.totalQuantitySold - a.totalQuantitySold);
    setFilteredMemberData(sortedData.slice(0, 10)); // Giới hạn top 10 thành viên
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchText(value);

    setFilteredProductData(filterProductData(productData));
  };

  const handleProductDateChange = (dates) => {
    if (!dates) {
        setSelectedDateRange([dayjs().startOf('month'), dayjs().endOf('month')]); // Reset về tháng hiện tại nếu nhấn Cancel
        setFilteredProductData(filterProductData(productData));
        return;
    }

    setSelectedDateRange(dates);
    setFilteredProductData(filterProductData(productData));
};
  const handleProductTableChange = (pagination, filters, sorter) => {
    let currentData = filterProductData(productData); // Bắt đầu từ dữ liệu đã lọc qua tìm kiếm và ngày tháng

    if (filters.level) {
      currentData = currentData.filter(item => filters.level.includes(item.level));
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

    setFilteredProductData(currentData);
  };

  const handleMemberDateChange = (dates) => {
    if (!dates) {
        setSelectedMemberDateRange([dayjs().startOf('month'), dayjs().endOf('month')]); // Reset về tháng hiện tại nếu nhấn Cancel
        filterMemberData(memberData);
        return;
    }

    setSelectedMemberDateRange(dates);
    filterMemberData(memberData);
};
  const handleLevelChange = (checkedValues) => {
    setSelectedMemberLevel(checkedValues);
    filterMemberData(memberData);
  };

  return (
    <div>
      <Tabs defaultActiveKey="1">
        <TabPane tab="Thống kê sản phẩm" key="1">
          <h2>Thống kê sản phẩm</h2>
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col>
              <Input
                placeholder="Tìm kiếm sản phẩm"
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={handleSearch}
                style={{ width: 300 }}
              />
            </Col>
            <Col>
              <RangePicker
                value={selectedDateRange}
                onChange={handleProductDateChange}
                format="DD/MM/YYYY"
              />
            </Col>
          </Row>
          <Table
            columns={productColumns}
            dataSource={filteredProductData}
            onChange={handleProductTableChange}
            pagination={{ pageSize: 10 }}
            rowKey={record => record.productId}
            bordered
            summary={pageData => {
              let totalQuantity = 0;
              let totalSales = 0;

              pageData.forEach(({ quantitySold, totalSales: sales }) => {
                totalQuantity += quantitySold;
                totalSales += sales;
              });

              return (
                <Table.Summary.Row>
                  <Table.Summary.Cell colSpan={3}>Tổng cộng</Table.Summary.Cell>
                  <Table.Summary.Cell>{totalQuantity}</Table.Summary.Cell>
                  <Table.Summary.Cell>{totalSales.toLocaleString()} đ</Table.Summary.Cell>
                  <Table.Summary.Cell />
                </Table.Summary.Row>
              );
            }}
          />
        </TabPane>
        <TabPane tab="Top 10 thành viên" key="2">
          <h2>Top 10 thành viên có số lượng bán ra cao nhất</h2>
          <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col>
              <RangePicker
                value={selectedMemberDateRange}
                onChange={handleMemberDateChange}
                format="DD/MM/YYYY"
              />
            </Col>
            <Col>
              <Checkbox.Group
                options={[
                  { label: 'Level 1', value: 1 },
                  { label: 'Level 2', value: 2 },
                ]}
                onChange={handleLevelChange}
                value={selectedMemberLevel}
              />
            </Col>
          </Row>
          <Table
            columns={memberColumns}
            dataSource={filteredMemberData}
            pagination={false}
            rowKey={record => record.memberId}
            bordered
          />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default ProductStats;
