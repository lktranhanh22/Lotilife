import React from 'react';
import { Form, Select, Input, Typography } from 'antd';

const { Title } = Typography;

const AddressForm = ({ 
  addressData,
  districts,
  tempDistricts, 
  wards,
  tempWards, 
  selectedCity,
  selectedTempCity, 
  selectedDistrict,
  selectedTempDistrict,
  handleCityChange, 
  handleDistrictChange 
}) => {
  const filterOption = (input, option) => {
    return (option?.children ?? '').toLowerCase().includes(input.toLowerCase());
  };

  const renderAddressFields = (prefix) => {
    const currentDistricts = prefix === 'permanent' ? districts : tempDistricts;
    const currentWards = prefix === 'permanent' ? wards : tempWards;
    const currentSelectedCity = prefix === 'permanent' ? selectedCity : selectedTempCity;
    const currentSelectedDistrict = prefix === 'permanent' ? selectedDistrict : selectedTempDistrict;

    return (
      <>
        <Form.Item
          label="Tỉnh/Thành phố"
          name={`${prefix}_city`}
          rules={[{ required: true, message: 'Vui lòng chọn tỉnh/thành phố!' }]}
        >
          <Select
            showSearch
            placeholder="Tìm kiếm và chọn tỉnh/thành phố"
            optionFilterProp="children"
            onChange={(value) => handleCityChange(value, prefix)}
            filterOption={filterOption}
            allowClear
          >
            {Object.entries(addressData || {}).map(([code, city]) => (
              <Select.Option key={code} value={code}>
                {city.name_with_type}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Quận/Huyện"
          name={`${prefix}_district`}
          rules={[{ required: true, message: 'Vui lòng chọn quận/huyện!' }]}
        >
          <Select
            showSearch
            placeholder="Tìm kiếm và chọn quận/huyện"
            optionFilterProp="children"
            onChange={(value) => handleDistrictChange(value, prefix)}
            filterOption={filterOption}
            disabled={!currentSelectedCity}
            allowClear
          >
            {currentDistricts.map((district) => (
              <Select.Option key={district.code} value={district.code}>
                {district.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Phường/Xã"
          name={`${prefix}_ward`}
          rules={[{ required: true, message: 'Vui lòng chọn phường/xã!' }]}
        >
          <Select
            showSearch
            placeholder="Tìm kiếm và chọn phường/xã"
            optionFilterProp="children"
            filterOption={filterOption}
            disabled={!currentSelectedDistrict}
            allowClear
          >
            {currentWards.map((ward) => (
              <Select.Option key={ward.code} value={ward.code}>
                {ward.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Địa chỉ cụ thể"
          name={`${prefix}_address`}
          rules={[{ required: true, message: 'Vui lòng nhập địa chỉ cụ thể!' }]}
        >
          <Input 
            placeholder="Số nhà, tên đường..." 
            allowClear 
          />
        </Form.Item>
      </>
    );
  };

  return (
    <>
      <Title level={4}>Địa chỉ thường trú</Title>
      {renderAddressFields('permanent')}

      <Title level={4}>Địa chỉ tạm trú</Title>
      {renderAddressFields('temporary')}
    </>
  );
};

export default AddressForm;