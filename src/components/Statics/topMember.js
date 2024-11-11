import React, { useState, useEffect } from 'react';
import { Table, DatePicker, Row, Col, Checkbox, message } from 'antd';
import { getTopMemberSales } from '../../api';
import dayjs from 'dayjs';
import { formatCurrency } from '../../utils';

const { RangePicker } = DatePicker;

const TopMember = () => {
    const [memberData, setMemberData] = useState([]); 
    const [filteredMemberData, setFilteredMemberData] = useState([]); 
    const [selectedMemberDateRange, setSelectedMemberDateRange] = useState([dayjs().startOf('month'), dayjs().endOf('month')]);
    const [selectedMemberLevel, setSelectedMemberLevel] = useState([]);

    useEffect(() => {
        const fetchMemberData = async () => {
            try {
                const user_id = localStorage.getItem('user_id'); // Assuming user_id is stored in localStorage
                const start_date = selectedMemberDateRange[0].format('YYYY-MM-DD');
                const end_date = selectedMemberDateRange[1].format('YYYY-MM-DD');
                const limit = 10; // Assuming you want the top 10 members

                const response = await getTopMemberSales({
                    user_id,
                    start_date,
                    end_date,
                    limit,
                });

                if (response.data.success) {
                    // Filter out level 0 data from the API response
                    const filteredData = response.data.data.filter(item => item.level !== "0");
                    setMemberData(filteredData);
                    setFilteredMemberData(filterMemberData(filteredData));
                } else {
                    message.error('Có lỗi xảy ra: ' + response.data.message);
                }
            } catch (error) {
                message.error('Lỗi khi gọi API thành viên.');
            }
        };

        fetchMemberData();
    }, [selectedMemberDateRange, selectedMemberLevel]);

    const memberColumns = [
        {
            title: 'ID Thành viên',
            dataIndex: 'user_id',
            key: 'user_id',
            sorter: (a, b) => a.user_id - b.user_id,
            sortDirections: ['ascend', 'descend'],
        },
        {
            title: 'Tên thành viên',
            dataIndex: 'user_name',
            key: 'user_name',
            sorter: (a, b) => a.user_name.localeCompare(b.user_name),
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
            render: value => formatCurrency(value),
        },
        {
            title: 'Level',
            dataIndex: 'level',
            key: 'level',
            sorter: (a, b) => a.level - b.level,
            sortDirections: ['ascend', 'descend'],
            render: level => `Level ${level}`,
        },
    ];

    const filterMemberData = (dataToFilter) => {
        let filtered = dataToFilter.filter(item =>
            dayjs(item.saleDate).isBetween(selectedMemberDateRange[0], selectedMemberDateRange[1], 'day', '[]')
        );

        if (selectedMemberLevel.length > 0) {
            // Chuyển đổi selectedMemberLevel thành chuỗi để so sánh với level trong dữ liệu
            filtered = filtered.filter(item => selectedMemberLevel.includes(parseInt(item.level)));
        }

        return filtered.sort((a, b) => b.totalQuantitySold - a.totalQuantitySold);
    };

    const handleMemberDateChange = (dates) => {
        if (!dates) {
            setSelectedMemberDateRange([dayjs().startOf('month'), dayjs().endOf('month')]);
        } else {
            setSelectedMemberDateRange(dates);
        }
        setFilteredMemberData(filterMemberData(memberData));
    };

    const handleMemberLevelChange = (checkedValues) => {
        setSelectedMemberLevel(checkedValues);
        setFilteredMemberData(filterMemberData(memberData));
    };

    return (
        <>
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }} align="middle" justify="center">
                <Col xs={24} sm={12} md={8}>
                    <RangePicker
                        value={selectedMemberDateRange}
                        onChange={handleMemberDateChange}
                        format="DD/MM/YYYY"
                        style={{ width: '100%' }}
                    />
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <Checkbox.Group
                        options={[
                            { label: 'Level 1', value: 1 },
                            { label: 'Level 2', value: 2 },
                        ]}
                        onChange={handleMemberLevelChange}
                        value={selectedMemberLevel}
                    />
                </Col>
            </Row>
            <Table
                columns={memberColumns}
                dataSource={filteredMemberData}
                pagination={false}
                rowKey={record => record.user_id}
                bordered
            />
        </>
    );
};

export default TopMember;
