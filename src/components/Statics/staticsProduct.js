import React, { useState, useEffect } from 'react';
import { Table, DatePicker, Row, Col, message, Tooltip, Skeleton, Radio } from 'antd';
import dayjs from 'dayjs';
import { getProductSales } from '../../api';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(isBetween);

const { RangePicker } = DatePicker;

const StaticsProduct = () => {
    const [productData, setProductData] = useState([]); // Dữ liệu đầy đủ từ API
    const [filteredProductData, setFilteredProductData] = useState([]); // Dữ liệu đã lọc theo level
    const [selectedDateRange, setSelectedDateRange] = useState([dayjs().startOf('month'), dayjs().endOf('month')]);
    const [selectedLevel, setSelectedLevel] = useState('all'); // Đặt mặc định là "All"
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProductData = async () => {
            setLoading(true);

            try {
                const user_id = localStorage.getItem('user_id');
                const start_date = selectedDateRange[0].format('YYYY-MM-DD');
                const end_date = selectedDateRange[1].format('YYYY-MM-DD');

                const response = await getProductSales({
                    user_id: user_id,
                    start_date: start_date,
                    end_date: end_date,
                });

                if (response.data.success) {
                    const processedData = [];

                    // Xử lý lv0, lv1, lv2 từ API và tạo cấu trúc Tree Data
                    ['lv0', 'lv1', 'lv2'].forEach((level, idx) => {
                        if (response.data.data[level]) {
                            processedData.push(...response.data.data[level].map(item => {
                                const truncatedProductName = item.productName.length > 100
                                    ? item.productName.substring(0, 100) + '...'
                                    : item.productName;

                                const thumbnailUrl = item.thumbnail || 'https://placehold.co/100x100/png';

                                const treeNode = {
                                    key: item.productId, // Dùng productId làm key chính
                                    title: truncatedProductName,
                                    productName: truncatedProductName,
                                    productFullname: item.productName,
                                    thumbnail: thumbnailUrl,
                                    totalQuantitySold: item.totalQuantitySold,
                                    totalSales: item.totalSales,
                                    productLink: item.productLink,
                                    level: idx,
                                    children: item.variants.map(variant => ({
                                        key: variant.variantId,
                                        productName: variant.variantName,
                                        totalQuantitySold: variant.quantitySold,
                                        totalSales: variant.totalSales,
                                        thumbnail: variant.thumbnail || 'https://placehold.co/50x50/png',
                                        productLink: variant.productLink,
                                    }))
                                };

                                return treeNode;
                            }));
                        }
                    });

                    setProductData(processedData);

                    // Nếu chọn "All", tổng hợp dữ liệu
                    if (selectedLevel === 'all') {
                        const aggregatedData = processAggregatedData(processedData);
                        setFilteredProductData(aggregatedData);
                    } else {
                        setFilteredProductData(filterProductData(processedData, selectedLevel)); // Gọi filterProductData với giá trị hiện tại
                    }
                } else {
                    message.warning(response.data.data); // Hiển thị thông báo từ API
                    setFilteredProductData([]); 
                }
            } catch (error) {
                message.error('Lỗi khi gọi API.');
            } finally {
                setLoading(false);
            }
        };

        fetchProductData();
    }, [selectedDateRange]); // Gọi lại khi thay đổi ngày tháng

    useEffect(() => {
        // Mỗi khi thay đổi level, lọc lại dữ liệu dựa trên dữ liệu đầy đủ
        if (selectedLevel === 'all') {
            const aggregatedData = processAggregatedData(productData);
            setFilteredProductData(aggregatedData);
        } else {
            setFilteredProductData(filterProductData(productData, selectedLevel));
        }
    }, [selectedLevel, productData]); // Lọc lại khi dữ liệu đầy đủ hoặc level thay đổi

    const productColumns = [
        {
            title: 'ID Sản phẩm',
            dataIndex: 'key',
            key: 'key',
            sorter: (a, b) => a.key.localeCompare(b.key),
            sortDirections: ['ascend', 'descend'],
        },
        {
            title: 'Tên sản phẩm',
            dataIndex: 'productName',
            key: 'productName',
            sorter: (a, b) => a.productName.localeCompare(b.productName),
            sortDirections: ['ascend', 'descend'],
            render: (text, record) => (
                <Tooltip title={record.productFullname || record.productName}>
                    <a href={record.productLink} target="_blank" rel="noopener noreferrer">
                        {text}
                    </a>
                </Tooltip>
            ),
        },
        {
            title: 'Ảnh thu nhỏ',
            dataIndex: 'thumbnail',
            key: 'thumbnail',
            render: (text) => (
                <img src={text} alt="thumbnail" style={{ width: 50, height: 50 }} />
            ),
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
            render: (value) => `${value.toLocaleString()} đ`,
        },
    ];

    const filterProductData = (dataToFilter, level) => {
        if (level === 'all') {
            return dataToFilter; // Trả về tất cả dữ liệu nếu chọn "All"
        }
        return dataToFilter.filter(item => item.level === parseInt(level, 10)); // Lọc theo level
    };

    const processAggregatedData = (data) => {
        const aggregatedData = {};

        data.forEach(item => {
            // Nếu sản phẩm đã tồn tại trong aggregatedData, cộng dồn số lượng và doanh số
            if (!aggregatedData[item.key]) {
                aggregatedData[item.key] = {
                    ...item,
                    totalQuantitySold: item.totalQuantitySold,
                    totalSales: item.totalSales,
                    children: [],
                };
            } else {
                aggregatedData[item.key].totalQuantitySold += item.totalQuantitySold;
                aggregatedData[item.key].totalSales += item.totalSales;
            }

            // Gộp các biến thể (children)
            item.children.forEach(variant => {
                const existingVariant = aggregatedData[item.key].children.find(v => v.key === variant.key);
                if (existingVariant) {
                    existingVariant.totalQuantitySold += variant.totalQuantitySold;
                    existingVariant.totalSales += variant.totalSales;
                } else {
                    aggregatedData[item.key].children.push({ ...variant });
                }
            });
        });

        return Object.values(aggregatedData);
    };

    const handleProductDateChange = (dates) => {
        if (!dates) {
            setSelectedDateRange([dayjs().startOf('month'), dayjs().endOf('month')]);
        } else {
            setSelectedDateRange(dates);
        }
    };

    const handleLevelChange = (e) => {
        const value = e.target.value;
        setSelectedLevel(value); // Cập nhật selectedLevel
    };

    return (
        <>
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }} align="middle">
                <Col xs={24} sm={8} md={6}>
                    <RangePicker
                        value={selectedDateRange}
                        onChange={handleProductDateChange}
                        format="DD/MM/YYYY"
                        style={{ width: '100%' }}
                    />
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <Radio.Group
                        options={[
                            { label: 'All', value: 'all' },
                            { label: 'Level 0', value: 0 },
                            { label: 'Level 1', value: 1 },
                            { label: 'Level 2', value: 2 }
                        ]}
                        onChange={handleLevelChange}
                        value={selectedLevel} 
                        style={{ display: 'flex', flexDirection: 'row' }} 
                    />
                </Col>
            </Row>
            <Skeleton loading={loading} active>
                <Table
                    columns={productColumns}
                    dataSource={filteredProductData}
                    pagination={{ pageSize: 10 }}
                    rowKey={record => record.key}
                    bordered
                    expandable={{
                        defaultExpandAllRows: false,
                        expandedRowRender: record => record.children && record.children.length > 0 ? <div></div> : null,
                        rowExpandable: record => record.children && record.children.length > 0, 
                    }}
                    treeData={filteredProductData}
                />
            </Skeleton>
        </>
    );
};

export default StaticsProduct;