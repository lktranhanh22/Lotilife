import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Typography, message, Spin } from 'antd';

const { Title } = Typography;
const { Option } = Select;

const BankInfoForm = () => {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBanks = async () => {
      setLoading(true);
      try {
        const response = await fetch('https://api.vietqr.io/v2/banks');
        const data = await response.json();
        if (data.code === '00') {
          const sortedBanks = data.data.sort((a, b) => 
            a.name.localeCompare(b.name, 'vi-VN')
          );
          setBanks(sortedBanks);
        } else {
          throw new Error('Failed to fetch banks');
        }
      } catch (error) {
        console.error('Error fetching banks:', error);
        message.error('Không thể tải danh sách ngân hàng');
      } finally {
        setLoading(false);
      }
    };

    fetchBanks();
  }, []);

  const filterOption = (input, option) => {
    const searchValue = input.toLowerCase();
    const bank = banks.find(b => b.code === option.value);
    
    return (
      bank.name.toLowerCase().includes(searchValue) ||
      bank.shortName.toLowerCase().includes(searchValue)
    );
  };

  return (
    <>
      <Title level={4}>Thông tin ngân hàng</Title>
      
      <Form.Item
        label="Tên ngân hàng"
        name="bank_code"
        rules={[{ required: true, message: "Vui lòng chọn ngân hàng!" }]}
      >
        <Select
          showSearch
          placeholder="Tìm kiếm theo tên hoặc tên viết tắt"
          loading={loading}
          optionFilterProp="children"
          filterOption={filterOption}
          notFoundContent={loading ? <Spin size="small" /> : null}
        >
          {banks.map(bank => (
            <Option 
              key={bank.code} 
              value={bank.code}
              label={`${bank.name} (${bank.shortName})`}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <img 
                  src={bank.logo} 
                  alt={bank.name} 
                  style={{ 
                    width: 24, 
                    height: 24, 
                    objectFit: 'contain' 
                  }} 
                />
                <div>
                  <div>{bank.name}</div>
                  {/* <div style={{ fontSize: '12px', color: '#666' }}>{bank.shortName}</div> */}
                </div>
              </div>
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        label="Số tài khoản"
        name="bank_account_number"
        rules={[
          { required: true, message: "Vui lòng nhập số tài khoản!" },
          { pattern: /^\d+$/, message: "Số tài khoản chỉ được chứa số!" }
        ]}
      >
        <Input 
          placeholder="Nhập số tài khoản" 
          maxLength={20}
        />
      </Form.Item>
      
      <Form.Item
        label="Chủ tài khoản"
        name="bank_account_name"
        rules={[
          { required: true, message: "Vui lòng nhập tên chủ tài khoản!" },
          { whitespace: true, message: "Tên chủ tài khoản không được chỉ chứa khoảng trắng!" }
        ]}
      >
        <Input 
          placeholder="Nhập tên chủ tài khoản"
          
        />
      </Form.Item>

      <Form.Item
        label="Chi nhánh ngân hàng"
        name="bank_branch"
        rules={[
          { required: false, message: "Nhập chi nhánh ngân hàng!" },
          { whitespace: true, message: "Chi nhánh không được chỉ chứa khoảng trắng!" }
        ]}
      >
        <Input placeholder="Nhập chi nhánh ngân hàng" />
      </Form.Item>
    </>
  );
};

export default BankInfoForm;