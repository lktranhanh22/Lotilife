import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';

const RegisterSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { email,fullname,phone } = location.state || {};

  return (
    <div style={{ 
      maxWidth: 800, 
      margin: '50px auto', 
      padding: '0 20px' 
    }}>
      <Result
        status="success"
        title="Đăng ký tài khoản thành công!"
        subTitle={
          <div style={{ textAlign: 'left' }}>
            <p>Chúc mừng bạn đã đăng ký thành công tài khoản tại hệ thống của chúng tôi!</p>
            <div style={{ marginTop: 16 }}>
              <h4>Thông tin tài khoản:</h4>
              <ul>
                <li>Họ tên: {fullname}</li>
                <li>Email: {email}</li>            
                <li>Số điện thoại: {phone}</li>
                {/* <li>Trạng thái: Chờ xác thực</li> */}
              </ul>
            </div>
            {/* <div style={{ marginTop: 16 }}>
              <h4>Các bước tiếp theo:</h4>
              <ol>
                <li>Kiểm tra email để xác thực tài khoản</li>
                <li>Đăng nhập vào hệ thống</li>
                <li>Cập nhật thêm thông tin cá nhân (nếu cần)</li>
              </ol>
            </div> */}
            {/* <div style={{ 
              marginTop: 16, 
              padding: 16, 
              background: '#f0f5ff', 
              border: '1px solid #d6e4ff',
              borderRadius: 4
            }}>
              <h4>Lưu ý quan trọng:</h4>
              <ul>
                <li>Link xác thực tài khoản sẽ hết hạn sau 24 giờ</li>
                <li>Vui lòng kiểm tra cả hộp thư spam</li>
                <li>Nếu không nhận được email, bạn có thể yêu cầu gửi lại</li>
              </ul>
            </div> */}
          </div>
        }
        extra={[
          <Button 
            type="primary" 
            key="login" 
            onClick={() => navigate('/login')}
          >
            Đăng nhập ngay
          </Button>,
          <Button 
            key="home" 
            onClick={() => navigate('/')}
          >
            Về trang chủ
          </Button>
        ]}
      />
    </div>
  );
};

export default RegisterSuccess; 