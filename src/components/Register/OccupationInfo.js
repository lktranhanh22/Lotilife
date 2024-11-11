import React from 'react';
import { Form, Select, Input } from 'antd';
import { occupations } from './constants';

const OccupationInfo = ({ isOtherOccupation, handleOccupationChange }) => {
    return (
        <>
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
                    rules={[{ required: true, message: 'Vui lòng nhập nghề nghiệp!' }]}
                >
                    <Input />
                </Form.Item>
            )}
        </>
    );
};

export default OccupationInfo; 