import React, { useState } from 'react';
import { Form, Input, Button, Typography, message, Row, Col, Card } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { forgotPassword } from '../api';

const { Title, Text } = Typography;

const ForgotPassword = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Gọi API reset password
      const response = await forgotPassword(values.email);
      
      if (response.data.success) {
        setEmailSent(true);
        message.success('Vui lòng kiểm tra email của bạn để đặt lại mật khẩu!');
      } else {
        message.error(response.data.message || 'Có lỗi xảy ra, vui lòng thử lại!');
      }
    } catch (error) {
      message.error('Có lỗi xảy ra, vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Row justify="center" align="middle" style={{ minHeight: '100vh' }}>
      <Col xs={23} sm={20} md={16} lg={12} xl={8}>
        <Card>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Title level={2}>Quên mật khẩu</Title>
            {!emailSent ? (
              <Text type="secondary">
                Nhập email đăng ký để nhận link đặt lại mật khẩu
              </Text>
            ) : (
              <Text type="success">
                Email đã được gửi! Vui lòng kiểm tra hộp thư của bạn
              </Text>
            )}
          </div>

          {!emailSent ? (
            <Form
              form={form}
              name="forgot_password"
              onFinish={onFinish}
              layout="vertical"
              size="large"
            >
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: 'Vui lòng nhập email!' },
                  { type: 'email', message: 'Email không hợp lệ!' }
                ]}
              >
                <Input 
                  prefix={<MailOutlined />} 
                  placeholder="Nhập email" 
                />
              </Form.Item>

              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  block 
                  loading={loading}
                >
                  Gửi yêu cầu
                </Button>
              </Form.Item>

              <div style={{ textAlign: 'center' }}>
                <Button 
                  type="link" 
                  onClick={() => navigate('/login')}
                >
                  Quay lại đăng nhập
                </Button>
              </div>
            </Form>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ marginBottom: 24 }}>
                <LockOutlined style={{ fontSize: 48, color: '#52c41a' }} />
              </div>
              <Text>
                Link đặt lại mật khẩu đã được gửi đến email của bạn.
                <br />
                Vui lòng kiểm tra cả thư mục spam.
              </Text>
              <div style={{ marginTop: 24 }}>
                <Button 
                  type="primary" 
                  onClick={() => navigate('/login')}
                >
                  Quay lại đăng nhập
                </Button>
              </div>
            </div>
          )}
        </Card>
      </Col>
    </Row>
  );
};

export default ForgotPassword;