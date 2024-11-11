import React, { useEffect, useState } from 'react';
import { Table, Tabs, Input, Checkbox, Tag, Row, Col, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import UserTree from '../components/userTree';
import { getListUserDetailByID } from '../api';
import { formatCurrency } from '../utils';

const { TabPane } = Tabs;

const TeamGroup = () => {
    const [users, setUsers] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [selectedLevels, setSelectedLevels] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [levelCounts, setLevelCounts] = useState({});

    useEffect(() => {
        const fetchUserDataByID = async () => {
            try {
                const response = await getListUserDetailByID({ user_id: localStorage.getItem('user_id') });
                if (response.data.success) {
                    const data = response.data.data;
                    setUsers(data);
                    const counts = data.reduce((acc, user) => {
                        const level = parseInt(user.level, 10);
                        acc[level] = (acc[level] || 0) + 1;
                        return acc;
                    }, {});
                    setLevelCounts(counts);
                }
            } catch (error) {
                message.error('Lỗi khi gọi API.');
            }
        };
        fetchUserDataByID();
    }, []);

    const maskEmail = (email) => {
        const [name, domain] = email.split('@');
        return `${name.slice(0, 4)}***@***.${domain.split('.').pop()}`;
    };

    const maskPhone = (phone) => {
        return `${phone.slice(0, 6)}****`;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return 'green';
            case 'pending':
                return 'orange';
            case 'locked':
                return 'red';
            default:
                return 'blue';
        }
    };

    const columns = [
        {
            title: 'STT',
            dataIndex: 'stt',
            key: 'stt',
            render: (text, record, index) => (currentPage - 1) * pageSize + index + 1,
        },
        { title: 'ID', dataIndex: 'id', key: 'id', sorter: (a, b) => a.id.localeCompare(b.id) },
        { title: 'Họ Tên', dataIndex: 'name', key: 'name' },
        {
            title: 'Số điện thoại',
            dataIndex: 'phone',
            key: 'phone',
            render: (text, record) => parseInt(record.level, 10) === 2 ? maskPhone(record.phone) : record.phone,
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            render: (text, record) => parseInt(record.level, 10) === 2 ? maskEmail(record.email) : record.email,
        },
        {
            title: 'Cấp độ',
            dataIndex: 'level',
            key: 'level',
            filters: [
                { text: `Level 1 (${levelCounts[1] || 0})`, value: 1 },
                { text: `Level 2 (${levelCounts[2] || 0})`, value: 2 },
            ],
            onFilter: (value, record) => parseInt(record.level, 10) === value,
        },
        {
            title: 'Doanh số',
            dataIndex: 'sales',
            key: 'sales',
            sorter: (a, b) => a.sales - b.sales,
            render: (sales) => formatCurrency(sales),
        },
        {
            title: 'Điểm PV',
            dataIndex: 'pv',
            key: 'pv',
            sorter: (a, b) => a.pv - b.pv,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'account_status',
            key: 'account_status',
            filters: [
                { text: 'Hoạt động', value: 'active' },
                { text: 'Chưa kích hoạt', value: 'pending' },
                { text: 'Bị khóa', value: 'locked' },
            ],
            onFilter: (value, record) => record.account_status === value,
            render: (status) => (
                <Tag color={getStatusColor(status)}>
                    {status === 'active' ? 'Hoạt động' : status === 'pending' ? 'Chưa kích hoạt' : 'Bị khóa'}
                </Tag>
            ),
        },
    ];

    const handleSearch = (e) => {
        setSearchText(e.target.value);
    };

    const handleLevelChange = (checkedValues) => {
        setSelectedLevels(checkedValues);
    };

    const handleStatusChange = (checkedValues) => {
        setSelectedStatus(checkedValues);
    };

    const filteredData = users.filter(item => {
        const level = parseInt(item.level, 10);
        return (
            (level === 1 || level === 2) && // Chỉ bao gồm lv1 và lv2
            (!searchText || item.id.toLowerCase().includes(searchText.toLowerCase()) || item.name.toLowerCase().includes(searchText.toLowerCase()) || item.email.toLowerCase().includes(searchText.toLowerCase()) || item.phone.includes(searchText)) &&
            (!selectedLevels.length || selectedLevels.includes(level)) &&
            (!selectedStatus.length || selectedStatus.includes(item.account_status))
        );
    });

    const treeData = users
        .filter(user => parseInt(user.level, 10) === 1) // Chỉ bao gồm lv1
        .map(user => ({
            title: user.name,
            key: user.id,
            sales: user.sales,
            status: user.account_status,
            children: users
                .filter(child => child.parentId === user.id && parseInt(child.level, 10) === 2) // Chỉ bao gồm lv2
                .map(child => ({
                    title: child.name,
                    key: child.id,
                    sales: child.sales,
                    status: child.account_status,
                })),
        }));

    return (
        <Tabs defaultActiveKey="1">
            <TabPane tab="Danh sách thành viên" key="1">
                <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
                    <Col xs={24} sm={12} md={8}>
                        <Input
                            placeholder="Tìm kiếm theo ID, Họ tên, Email, Số điện thoại"
                            prefix={<SearchOutlined />}
                            value={searchText}
                            onChange={handleSearch}
                            style={{ width: '100%' }}
                        />
                    </Col>
                    <Col xs={24} sm={12} md={16} style={{ display: 'flex', alignItems: 'center' }}>
                        <Checkbox.Group
                            options={[
                                { label: `Level 1 (${levelCounts[1] || 0})`, value: 1 },
                                { label: `Level 2 (${levelCounts[2] || 0})`, value: 2 },
                            ]}
                            onChange={handleLevelChange}
                            style={{ marginRight: 16 }}
                        />
                        <Checkbox.Group
                            options={[
                                { label: 'Hoạt động', value: 'active' },
                                { label: 'Chưa kích hoạt', value: 'pending' },
                                { label: 'Bị khóa', value: 'locked' },
                            ]}
                            onChange={handleStatusChange}
                            style={{ display: 'none' }} // Nếu không cần thiết, bạn có thể để mặc định như vậy
                        />
                    </Col>
                </Row>
                <Table
                    columns={columns}
                    dataSource={filteredData}
                    pagination={{
                        current: currentPage,
                        pageSize: pageSize,
                        onChange: (page, size) => {
                            setCurrentPage(page);
                            setPageSize(size);
                        },
                        showSizeChanger: true,
                    }}
                />
            </TabPane>
            <TabPane tab="Cây thành viên" key="2">
                <UserTree treeData={treeData} />
            </TabPane>
        </Tabs>
    );
};

export default TeamGroup;
