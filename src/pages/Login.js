import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Checkbox, Row, Col, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { login } from '../api';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const Login = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();


    useEffect(() => {
        document.title = "Đăng Nhập"; 
    }, []);

    const onFinish = async (values) => {
        setLoading(true);

        try {
            const response = await login(values);

            if (response.data.success) {
                console.log(response.data);
                message.success('Đăng nhập thành công!');

                // Cập nhật thông tin vào RV_CONFIGS
                // window.RV_CONFIGS.user_id = response.data.data.user_id;
                // window.RV_CONFIGS.user_login = response.data.data.user_login;
                // window.RV_CONFIGS.is_login = true;

                // Lưu thông tin vào localStorage
                localStorage.setItem('is_login', true);
                localStorage.setItem('user_id', response.data.data.user_id);
                localStorage.setItem('user_login', response.data.data.user_login);

                // Điều hướng đến trang Profile
                navigate('/', { replace: true });
                
                // Reload lại trang
                window.location.reload();
            } else {
                message.error(response.data.data || 'Đăng nhập thất bại.');
            }
        } catch (error) {
            message.error(`Có lỗi xảy ra: ${error.message}`);
        }

        setLoading(false);
    };

    const handleForgotPassword = () => {
        message.info('Hãy truy cập vào trang quên mật khẩu của chúng tôi.'); 
        // Bạn có thể chuyển hướng người dùng đến trang quên mật khẩu tại đây
    };

    return (
        <Row justify="center" style={{ marginTop: '50px' }}>
            <Col xs={24} sm={20} md={16} lg={8} xl={6}>
                <Title level={2} style={{ textAlign: 'center', marginBottom: '20px' }}>
                    Đăng Nhập
                </Title>
                <Form
                    name="login"
                    onFinish={onFinish}
                    layout="vertical"
                    initialValues={{ remember: true }}
                >
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: 'Vui lòng nhập Email hoặc số điện thoại!' }]}
                    >
                        <Input 
                            prefix={<UserOutlined />} 
                            placeholder="Email hoặc số điện thoại " 
                            size="large" 
                        />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                    >
                        <Input.Password 
                            prefix={<LockOutlined />} 
                            placeholder="Mật khẩu" 
                            size="large" 
                        />
                    </Form.Item>
                    <Form.Item>
                        <Row justify="space-between">
                            <Col>
                                <Form.Item name="remember" valuePropName="checked" noStyle>
                                    <Checkbox>Ghi nhớ tài khoản</Checkbox>
                                </Form.Item>
                            </Col>
                            <Col>
                                <div style={{ textAlign: 'right' }}>
                                    <Button 
                                        type="link" 
                                        onClick={() => navigate('/forgot-password')}
                                    >
                                        Quên mật khẩu?
                                    </Button>
                                </div>
                            </Col>
                        </Row>
                    </Form.Item>
                    <Form.Item>
                        <Button 
                            type="primary" 
                            htmlType="submit" 
                            block 
                            size="large" 
                            loading={loading}
                        >
                            Đăng nhập
                        </Button>
                    </Form.Item>
                </Form>
            </Col>
        </Row>
    );
};

export default Login;
