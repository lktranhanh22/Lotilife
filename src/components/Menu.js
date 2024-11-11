import React from 'react';
import { Menu } from 'antd';
import { DollarOutlined , UserOutlined, LogoutOutlined, TeamOutlined,BarChartOutlined } from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';
import { message } from 'antd';
import { logout } from '../api';

const MenuSidebar = ({hasChild }) => {    
    const location = useLocation();

    const handleLogout = async () => {
        try {
            const response = await logout();
            if (response.data.success) {
                message.success('Đăng xuất thành công!');
                window.RV_CONFIGS.is_login = false;
                localStorage.setItem('is_login', false);
                localStorage.setItem('user_id', '');
                localStorage.setItem('user_login', '');
                // navigate('/');
                window.location.href = '/'; 
            } else {
                message.error('Lỗi khi đăng xuất. Vui lòng thử lại.');
            }
        } catch (error) {
            console.error('Logout error:', error); // Log lỗi ra console
            message.error(`Có lỗi xảy ra: ${error.message}`);
        }
    };

    return (
        
        <Menu theme="light" selectedKeys={[location.pathname]} mode="horizontal">
            <Menu.Item key="/" icon={<DollarOutlined />}>
                <Link to="/">Orders</Link>
            </Menu.Item>
            {hasChild && (
            <Menu.Item key="/stats" icon={<BarChartOutlined />}>
                <Link to="/stats">Statistics</Link>
            </Menu.Item>
            )}
            <Menu.Item key="/profile" icon={<UserOutlined />}>
                <Link to="/profile">Profile</Link>
            </Menu.Item>            
            {hasChild && (
                <Menu.Item key="/team" icon={<TeamOutlined />}>
                    <Link to="/team">Team Group</Link>
                </Menu.Item>
            )}
            <Menu.Item key="/logout" icon={<LogoutOutlined />} onClick={handleLogout}>
                Đăng xuất
            </Menu.Item>
        </Menu>
    );
};

export default MenuSidebar;
