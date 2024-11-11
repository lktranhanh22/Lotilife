import React from 'react';
import { Form, Input, DatePicker, Select } from 'antd';

const PersonalInfoForm = ({ form, referrer_id, isOtherOccupation, handleOccupationChange, occupations }) => {
  return (
    <>
       <Form.Item label="Người giới thiệu" name="referrer_id">
            <Input disabled />
          </Form.Item>
          <Form.Item
            label="Họ và tên"
            name="display_name"
            rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Số điện thoại"
            name="user_phone"
            rules={[
              { required: true, message: "Vui lòng nhập số điện thoại!" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Email"
            name="user_email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input placeholder="Nhập email của bạn" />
          </Form.Item>
          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu!" },
              { min: 6, message: "Mật khẩu tối thiểu 6 ký tự!" },
            ]}
            hasFeedback
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            label="Xác nhận mật khẩu"
            name="confirm"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Mật khẩu không khớp!"));
                },
              }),
            ]}
            hasFeedback
          >
            <Input.Password placeholder="Xác nhận mật khẩu" />
          </Form.Item>
          <Form.Item
            label="Ngày tháng năm sinh"
            name="dob"
            rules={[
              { required: true, message: "Vui lòng chọn ngày tháng năm sinh!" },
            ]}
          >
            <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
          </Form.Item>
          
          <Form.Item
            label="Số CMND hoặc CCCD"
            name="id_number"
            rules={[
              { required: true, message: "Vui lòng nhập số CMND hoặc CCCD!" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Ngày cấp CCCD"
            name="identityIssueDate"
            rules={[
              { required: true, message: "Vui lòng nhập ngày cấp CCCD!" },
            ]}
          >
            <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            label="Nơi cấp"
            name="identityIssuePlace"
            rules={[{ required: true, message: "Vui lòng nhập nơi cấp!" }]}
          >
            <Input placeholder="Nhập nơi cấp" />
          </Form.Item>
      <Form.Item
        label="Nghề nghiệp"
        name="occupation"
        rules={[{ required: true, message: 'Vui lòng chọn nghề nghiệp!' }]}
      >
        <Select
          placeholder="Chọn nghề nghiệp"
          onChange={handleOccupationChange}
        >
          {occupations.map(occupation => (
            <Select.Option key={occupation} value={occupation}>{occupation}</Select.Option>
          ))}
          <Select.Option value="Khác">Khác</Select.Option>
        </Select>
      </Form.Item>
      {isOtherOccupation && (
        <Form.Item
          label="Nhập nghề nghiệp khác"
          name="otherOccupation"
          rules={[{ required: false, message: 'Vui lòng nhập nghề nghiệp!' }]}
        >
          <Input />
        </Form.Item>
      )}
    </>
  );
};

export default PersonalInfoForm; 