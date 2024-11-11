import React from 'react';
import { Tabs } from 'antd';
import StaticsProduct from '../components/Statics/staticsProduct';
import TopMember from '../components/Statics/topMember';
const { TabPane } = Tabs;
const Statistics = () => {
    return (
        <Tabs defaultActiveKey="1">
            <TabPane tab="Thống kê sản phẩm" key="1">
                <StaticsProduct />
            </TabPane>
            <TabPane tab="Top 10 thành viên" key="2">
                <TopMember />
            </TabPane>
        </Tabs>
    );
};

export default Statistics;
