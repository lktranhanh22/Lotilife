import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Typography, message, Row, Col, Card, Result } from 'antd';
import { LockOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { resetPassword, verifyResetToken } from '../api';

const { Title, Text } = Typography;

const ResetPassword = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);

  // Lấy token từ URL params
  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get('token');

  // Verify token khi component mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        message.error('Link không hợp lệ hoặc đã hết hạn!');
        setIsVerifying(false);
        return;
      }

      try {
        const response = await verifyResetToken(token);
        if (response.data.success) {
          setIsValidToken(true);
        } else {
          message.error('Link không hợp lệ hoặc đã hết hạn!');
        }
      } catch (error) {
        message.error('Có lỗi xảy ra, vui lòng thử lại!');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await resetPassword({
        token,
        password: values.password
      });

      if (response.data.success) {
        setIsSuccess(true);
        message.success('Đặt lại mật khẩu thành công!');
      } else {
        message.error(response.data.message || 'Có lỗi xảy ra, vui lòng thử lại!');
      }
    } catch (error) {
      message.error('Có lỗi xảy ra, vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <Row justify="center" align="middle" style={{ minHeight: '100vh' }}>
        <Col>
          <Result
            title="Đang xác thực..."
            subTitle="Vui lòng đợi trong giây lát"
            icon={<div style={{ textAlign: 'center' }}>Loading...</div>}
          />
        </Col>
      </Row>
    );
  }

  if (!isValidToken) {
    return (
      <Row justify="center" align="middle" style={{ minHeight: '100vh' }}>
        <Col>
          <Result
            status="error"
            title="Link không hợp lệ hoặc đã hết hạn"
            subTitle="Vui lòng yêu cầu link mới để đặt lại mật khẩu"
            extra={[
              <Button 
                type="primary" 
                key="forgot-password"
                onClick={() => navigate('/forgot-password')}
              >
                Yêu cầu link mới
              </Button>
            ]}
          />
        </Col>
      </Row>
    );
  }

  if (isSuccess) {
    return (
      <Row justify="center" align="middle" style={{ minHeight: '100vh' }}>
        <Col>
          <Result
            icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            status="success"
            title="Đặt lại mật khẩu thành công!"
            subTitle="Bạn có thể đăng nhập bằng mật khẩu mới"
            extra={[
              <Button 
                type="primary" 
                key="login"
                onClick={() => navigate('/login')}
              >
                Đăng nhập ngay
              </Button>
            ]}
          />
        </Col>
      </Row>
    );
  }

  return (
    <Row justify="center" align="middle" style={{ minHeight: '100vh' }}>
      <Col xs={23} sm={20} md={16} lg={12} xl={8}>
        <Card>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Title level={2}>Đặt lại mật khẩu</Title>
            <Text type="secondary">
              Nhập mật khẩu mới cho tài khoản của bạn
            </Text>
          </div>

          <Form
            form={form}
            name="reset_password"
            onFinish={onFinish}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="password"
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
              ]}
            >
              <Input.Password 
                prefix={<LockOutlined />}
                placeholder="Nhập mật khẩu mới" 
              />
            </Form.Item>

            <Form.Item
              name="confirm"
              dependencies={['password']}
              rules={[
                { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Xác nhận mật khẩu mới"
              />
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                block 
                loading={loading}
              >
                Đặt lại mật khẩu
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Col>
    </Row>
  );
};

export default ResetPassword; 