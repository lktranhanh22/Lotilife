import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Typography, message, Button, Skeleton, Grid, Tabs } from 'antd';
import { ApartmentOutlined, CopyOutlined, UserOutlined } from '@ant-design/icons';
import { MyOrders, SubOrders } from '../components/order';
import { getOrderStactics } from '../api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;
const { TabPane } = Tabs;

const DashboardCard = ({ title, sales, commission, pvPoints, color, icon, loading = false }) => {
    const screens = useBreakpoint();
    return (
        <Card hoverable bordered={false} style={{ backgroundColor: color, borderRadius: 10, minHeight: 150 }}>
            <Skeleton loading={loading} active>
                <div>
                    {!screens.xs && (
                        <div style={{ fontSize: '3em', color: 'white' }}>
                            {icon}
                        </div>
                    )}
                    <Title level={4} style={{ color: 'white', fontSize: '1.5em', marginTop: 10 }}>
                        {title}
                    </Title>
                    <Text style={{ color: 'white', display: 'block', marginTop: 10, fontSize: '1.2em' }}>
                        Doanh số: {parseInt(sales, 10).toLocaleString('vi-VN')} đ
                    </Text>
                    <Text style={{ color: 'white', display: 'block', marginTop: 10, fontSize: '1.2em', fontStyle: 'italic' }}>
                        Hoa hồng: {
                            //parseInt(commission, 10).toLocaleString('vi-VN')
                        } Đang cập nhật...
                    </Text>
                    <Text style={{ color: 'white', display: 'block', marginTop: 10, fontSize: '1.2em' }}>
                        Điểm PV: {pvPoints}
                    </Text>
                </div>
            </Skeleton>
        </Card>
    );
};

const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
        message.success('Link đăng ký đã được sao chép!');
    }).catch(err => {
        message.error('Lỗi khi sao chép link!');
    });
};

const getRegistrationLink = () => {
    const userId = window.RV_CONFIGS?.user_id || localStorage.getItem('user_id') || 1; 
    return `https://lotilife.com/my-account/#/register?ref=${userId}`;
};

const Home = ({ hasChild }) => {    
    const userId = window.RV_CONFIGS?.user_id || localStorage.getItem('user_id') || 1; 
    const screens = useBreakpoint();
    const [statistics, setStatistics] = useState({
        salesRevenue: 0,
        commission: 0,
        pvPoints: 0,
        salesF1: 0,
        commissionF1: 0,
        pvPointsF1: 0,
        salesF2: 0,
        commissionF2: 0,
        pvPointsF2: 0,
    });
    const [loading, setLoading] = useState(true);
    const registrationLink = getRegistrationLink();
    
    const start_date = dayjs().startOf('month').format('YYYY-MM-DD');
    const end_date = dayjs().endOf('month').format('YYYY-MM-DD');

    useEffect(() => {
        const fetchStatistics = async () => {
            setLoading(true);
            try {
                const response = await getOrderStactics({ 
                    user_id: userId, 
                    start_date: start_date, 
                    end_date: end_date 
                });
                if (response.data.success) {
                    const userStats = response.data.data.user_stats || {};
                    const f1Stats = response.data.data.f1_stats || {};
                    const f2Stats = response.data.data.f2_stats || {};

                    setStatistics({
                        salesRevenue: userStats.sales_revenue || 0,
                        commission: userStats.commission || 0,
                        pvPoints: userStats.pv_points || 0,
                        salesF1: f1Stats.sales_revenue || 0,
                        commissionF1: f1Stats.commission || 0,
                        pvPointsF1: f1Stats.pv_points || 0,
                        salesF2: f2Stats.sales_revenue || 0,
                        commissionF2: f2Stats.commission || 0,
                        pvPointsF2: f2Stats.pv_points || 0,
                    });
                } else {
                    message.error('Không thể lấy dữ liệu thống kê.');
                }
            } catch (error) {
                message.error('Lỗi khi gọi API thống kê.');
            } finally {
                setLoading(false);
            }
        };

        fetchStatistics();
    }, [start_date, end_date]);

    // const modalColumns = ['orderId', 'orderDate', 'status', 'totalValue', 'pvPoints','action'];
    const mobileColumns = ['orderId','totalValue', 'status', 'action'];
    const defaultColumns = ['orderId', 'orderDate', 'status', 'totalValue', 'pvPoints', 'action'];
    const selectedColumns = screens.xs ? mobileColumns : defaultColumns;


    return (
        <>
            <Row gutter={[24, 24]}>
                <Col span={24} style={{ textAlign: 'center', marginBottom: '10px' }}>
                    <Button 
                        type="primary" 
                        icon={<CopyOutlined />} 
                        size="medium" 
                        onClick={() => copyToClipboard(registrationLink)}
                    >
                        Lấy link đăng ký thành viên
                    </Button>
                </Col>
            </Row>
    
            <Row gutter={[24, 24]}>
                {screens.xs ? (
                    <Col span={24}>
                        <Tabs defaultActiveKey="1">
                            <TabPane tab="Doanh số của tôi" key="1">
                                <DashboardCard 
                                    // title="Doanh số của tôi" 
                                    sales={statistics.salesRevenue}
                                    commission={statistics.commission}
                                    pvPoints={statistics.pvPoints}
                                    color="#d4b5fc" 
                                    icon={<UserOutlined />}                    
                                    loading={loading}
                                />
                            </TabPane>
                            <TabPane tab="Doanh số F1" key="2">
                                <DashboardCard 
                                    // title="Doanh số F1" 
                                    sales={statistics.salesF1}
                                    commission={statistics.commissionF1}
                                    pvPoints={statistics.pvPointsF1}
                                    color="#9bd1f9" 
                                    icon={<ApartmentOutlined />}                  
                                    loading={loading}
                                />
                            </TabPane>
                            <TabPane tab="Doanh số F2" key="3">
                                <DashboardCard 
                                    // title="Doanh số F2" 
                                    sales={statistics.salesF2}
                                    commission={statistics.commissionF2}
                                    pvPoints={statistics.pvPointsF2}
                                    color="#a8e8c4" 
                                    icon={<ApartmentOutlined />}                    
                                    loading={loading}
                                />
                            </TabPane>
                        </Tabs>
                    </Col>
                ) : (
                    <>
                        <Col xs={24} sm={24} md={12} lg={8} xl={8}>
                            <DashboardCard 
                                title="Doanh số của tôi" 
                                sales={statistics.salesRevenue}
                                commission={statistics.commission}
                                pvPoints={statistics.pvPoints}
                                color="#d4b5fc" 
                                icon={<UserOutlined />}                    
                                loading={loading}
                            />
                        </Col>
                        <Col xs={24} sm={24} md={12} lg={8} xl={8}>
                            <DashboardCard 
                                title="Doanh số F1" 
                                sales={statistics.salesF1}
                                commission={statistics.commissionF1}
                                pvPoints={statistics.pvPointsF1}
                                color="#9bd1f9" 
                                icon={<ApartmentOutlined />}                  
                                loading={loading}
                            />
                        </Col>
                        <Col xs={24} sm={24} md={12} lg={8} xl={8}>
                            <DashboardCard 
                                title="Doanh số F2" 
                                sales={statistics.salesF2}
                                commission={statistics.commissionF2}
                                pvPoints={statistics.pvPointsF2}
                                color="#a8e8c4" 
                                icon={<ApartmentOutlined />}                    
                                loading={loading}
                            />
                        </Col>
                    </>
                )}
            </Row>
    
            <Row gutter={[24, 24]}>
                <Col span={24}>
                    <MyOrders selectedColumns={selectedColumns} title="Danh sách đơn hàng của bạn" />
                </Col>
                {hasChild && (              
                    <Col span={24}>
                        <SubOrders selectedColumns={defaultColumns} />
                    </Col>              
            )}
            </Row>
    
            
        </>
    );
    
};

export default Home;
