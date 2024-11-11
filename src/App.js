import React, { useEffect, useState } from 'react';
import { Layout, Row, Col } from 'antd';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/index';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import TeamGroup from './pages/TeamGroup';
import Statistics from './pages/Statistics';
import MenuSidebar from './components/Menu';
import { haschild } from './api';
import RegisterSuccess from './pages/RegisterSuccess';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
const { Content } = Layout;
// window.RV_CONFIGS ={
//   site_url: window.location.host,
//     	ajax_url:"https://lotilife.com/wp-admin/admin-ajax.php",
//         user_id:"",
//         user_login:"",
//         is_login:false,
// }
function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(() => {
        // Try to get login status from localStorage, fallback to window.RV_CONFIGS
        return localStorage.getItem('is_login') === 'true' || window.RV_CONFIGS && window.RV_CONFIGS.is_login;
    });
    const [hasChild, setHasChild] = useState(false);

    useEffect(() => {
        const currentHash = window.location.hash;
        if (!isLoggedIn && 
            currentHash !== '#/login' && 
            !currentHash.startsWith('#/register') &&
            !currentHash.startsWith('#/register-success')
        ) {
            window.location.href = '#/login';
        }
    }, [isLoggedIn]);

    useEffect(() => {
        // Sync localStorage with state
        localStorage.setItem('is_login', isLoggedIn);
    }, [isLoggedIn]);
    useEffect(() => {
        const checkHasChild = async () => {
            const userId = window.RV_CONFIGS && window.RV_CONFIGS.user_id || localStorage.getItem('user_id');
            if (userId) {
                try {
                    const response = await haschild({ user_id: userId });
                    if (response.data.success) {
                        setHasChild(response.data.data);
                    }
                } catch (error) {
                    console.error('Error checking child:', error);
                }
            }
        };

        checkHasChild();
    }, []);
    return (
        <Router>
            <Layout style={{ minHeight: '50vh' }}>
                {isLoggedIn && (                    
                        <MenuSidebar hasChild={hasChild} />                    
                )}
                <Layout>
                    <Content style={{ margin: '16px' }}>
                        <Routes>
                            {isLoggedIn ? (
                                <>
                                    <Route path="/" element={<Home hasChild={hasChild} />} />
                                    {hasChild  &&<Route path="/stats" element={<Statistics />} />}
                                    <Route path="/profile" element={<Profile />} />                                                                   
                                    {hasChild  && <Route path="/team" element={<TeamGroup />} />}
                                    <Route path="*" element={<Navigate to="/" />} />
                                </>
                            ) : (
                                <>
                                    <Route path="/login" element={<Login />} />
                                    <Route path="/register" element={<Register />} />
                                    <Route path="/register-success" element={<RegisterSuccess />} />
                                    <Route path="/forgot-password" element={<ForgotPassword />} />
                                    <Route path="/reset-password" element={<ResetPassword />} />
                                    <Route path="*" element={<Navigate to="/login" />} />
                                </>
                            )}
                        </Routes>
                    </Content>
                </Layout>
            </Layout>
        </Router>
    );
}

export default App;
