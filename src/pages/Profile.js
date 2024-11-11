import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Row, Col, Typography, Card, Tooltip, DatePicker, Select, message } from 'antd';
import { UserOutlined, IdcardOutlined, HomeOutlined, BankOutlined, BranchesOutlined, EditOutlined, CloseOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getUserDetail, requestEdit } from '../api';

const { Title } = Typography;
const { Option } = Select;

const occupations = [
    'Công nhân', 'Nhân viên văn phòng', 'Kỹ sư', 'Giáo viên', 'Bác sĩ', 'Luật sư', 'Nông dân', 'Lập trình viên', 
    'Thiết kế đồ họa', 'Kế toán', 'Nhà quản lý', 'Nhà báo', 'Chuyên viên tư vấn', 'Thợ xây', 
    'Nhân viên bán hàng', 'Sinh viên', 'Đầu bếp', 'Thợ điện', 'Thợ cơ khí', 'Khác'
];

const Profile = () => {
    const [form] = Form.useForm();
    const [isEditing, setIsEditing] = useState(false);
    const [userData, setUserData] = useState({});
    const [isOtherOccupation, setIsOtherOccupation] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await getUserDetail({ user_id: localStorage.getItem('user_id') });
                if (response.data.success) {
                    const data = response.data.data;
                    setUserData({
                        ...data,
                        dob: dayjs(data.dob, 'YYYY-MM-DD').format('DD/MM/YYYY'),
                        identityIssueDate: data.identityIssueDate ? dayjs(data.identityIssueDate, 'YYYY-MM-DD').format('DD/MM/YYYY') : dayjs().format('DD/MM/YYYY'),
                        identityIssuePlace: data.cccd_issue_place,
                        address: data.address,
                        occupation: data.occupation,
                    });
                    form.setFieldsValue({
                        ...data,
                        birthdate: dayjs(data.dob, 'YYYY-MM-DD'),
                        identityIssueDate: data.identityIssueDate ? dayjs(data.identityIssueDate, 'YYYY-MM-DD') : dayjs(),
                        identityIssuePlace: data.cccd_issue_place,
                        permanentAddress: data.address,
                        occupation: data.occupation,
                    });
                } else {
                    message.error('Không thể tải thông tin người dùng.');
                }
            } catch (error) {
                message.error('Lỗi khi gọi API.');
            }
        };

        fetchUserData();
    }, [form]);

    const onFinish = (values) => {        
        const birthdate = values.birthdate ? dayjs(values.birthdate) : null;
        const identityIssueDate = values.identityIssueDate ? dayjs(values.identityIssueDate) : null;

        if (!birthdate || !birthdate.isValid()) {
            message.error('Ngày tháng năm sinh không hợp lệ.');
            return;
        }

        if (!identityIssueDate || !identityIssueDate.isValid()) {
            message.error('Ngày cấp không hợp lệ.');
            return;
        }

        const modifiedFields = [];

        // So sánh giá trị cũ và mới để gửi yêu cầu chỉnh sửa
        if (userData.fullName !== values.fullName) {
            modifiedFields.push({ field: 'fullName', oldValue: userData.fullName, newValue: values.fullName });
        }
        if (userData.user_phone !== values.user_phone) {
            modifiedFields.push({ field: 'user_phone', oldValue: userData.user_phone, newValue: values.user_phone });
        }
        if (userData.id_number !== values.id_number) {
            modifiedFields.push({ field: 'id_number', oldValue: userData.id_number, newValue: values.id_number });
        }
        if (userData.identityIssueDate !== values.identityIssueDate.format('DD/MM/YYYY')) {
            modifiedFields.push({ field: 'identityIssueDate', oldValue: userData.identityIssueDate, newValue: values.identityIssueDate.format('DD/MM/YYYY') });
        }
        if (userData.identityIssuePlace !== values.identityIssuePlace) {
            modifiedFields.push({ field: 'identityIssuePlace', oldValue: userData.identityIssuePlace, newValue: values.identityIssuePlace });
        }
        if (userData.permanentAddress !== values.permanentAddress) {
            modifiedFields.push({ field: 'permanentAddress', oldValue: userData.permanentAddress, newValue: values.permanentAddress });
        }
        if (userData.occupation !== values.occupation) {
            modifiedFields.push({ field: 'occupation', oldValue: userData.occupation, newValue: values.occupation });
        }
        if (userData.bank_account_number !== values.bank_account_number) {
            modifiedFields.push({ field: 'bank_account_number', oldValue: userData.bank_account_number, newValue: values.bank_account_number });
        }
        if (userData.bank_name !== values.bank_name) {
            modifiedFields.push({ field: 'bank_name', oldValue: userData.bank_name, newValue: values.bank_name });
        }
        if (userData.bank_account_name !== values.bank_account_name) {
            modifiedFields.push({ field: 'bank_account_name', oldValue: userData.bank_account_name, newValue: values.bank_account_name });
        }
        if (userData.bank_branch !== values.bank_branch) {
            modifiedFields.push({ field: 'bank_branch', oldValue: userData.bank_branch, newValue: values.bank_branch });
        }

        if (modifiedFields.length > 0) {
            const requestData = {
                userId: localStorage.getItem('user_id'),
                modifications: JSON.stringify(modifiedFields), // Chuyển đổi thành chuỗi JSON
                type: 'edit_profile',  // Loại yêu cầu
            };            
            requestEditChange(requestData);
        } else {
            message.info('Không có thay đổi nào cần cập nhật.');
        }

        setIsEditing(false);
    };

    const requestEditChange = async (requestData) => {
        try {
            const response = await requestEdit(requestData);            
            if (response.data.success) {
                message.success('Yêu cầu đã được gửi và đang chờ admin duyệt.');
            } else {
                message.error('Gửi yêu cầu thất bại.');
            }
        } catch (error) {
            console.error('Error:', error);
            message.error('Lỗi khi kết nối tới server.');
        }
    };

    const handleEditClick = () => {
        setIsEditing(!isEditing);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        form.setFieldsValue({
            ...userData,
            birthdate: userData.dob ? dayjs(userData.dob, 'DD/MM/YYYY') : dayjs(),
            identityIssueDate: userData.identityIssueDate ? dayjs(userData.identityIssueDate, 'DD/MM/YYYY') : dayjs(),
        });
        setIsOtherOccupation(false);
    };

    const handleOccupationChange = (value) => {
        if (value === 'Khác') {
            setIsOtherOccupation(true);
            form.setFieldsValue({ occupation: 'Khác' });
        } else {
            setIsOtherOccupation(false);
        }
    };

    return (     
        <div>
            <Title level={2} style={{ textAlign: 'center', marginBottom: '20px' }}>
                Thông tin tài khoản
            </Title>
            <Row justify="center" gutter={16} style={{ marginTop: '50px' }}>
  <Col xs={24} sm={20} md={18} lg={16} xl={12}>
    <Card title="Thông Tin Cá Nhân" extra={
      !isEditing ? (
        <Button icon={<EditOutlined />} onClick={handleEditClick}>Chỉnh sửa</Button>
      ) : (
        <Button icon={<CloseOutlined />} onClick={handleCancelEdit}>Hủy</Button>
      )
    }>
      <Form
        form={form}
        name="profile"
        onFinish={onFinish}
        layout="vertical"
        initialValues={userData}
      >
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item label="Mã số người giới thiệu">
              <Tooltip title={userData.referrer_name}>
                <Input prefix={<UserOutlined />} value={userData.parent_id} disabled />
              </Tooltip>
            </Form.Item>
            <Form.Item label="Mã số nhân viên">
              <Input prefix={<IdcardOutlined />} value={userData.user_id} disabled />
            </Form.Item>
            <Form.Item
              label="Họ và tên"
              name="fullName"
              rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
            >
              <Input prefix={<UserOutlined />} disabled={!isEditing} />
            </Form.Item>
            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, type: 'email', message: 'Vui lòng nhập email hợp lệ!' }]}
            >
              <Input prefix={<MailOutlined />} disabled />
            </Form.Item>
            <Form.Item
              label="Số điện thoại"
              name="user_phone"
              rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
            >
              <Input prefix={<PhoneOutlined />}disabled={!isEditing} />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              label="Ngày tháng năm sinh"
              name="birthdate"
              rules={[{ required: true, message: 'Vui lòng nhập ngày tháng năm sinh!' }]}
            >
              <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} disabled={!isEditing} />
            </Form.Item>
            <Form.Item
              label="Số CCCD/CMND"
              name="id_number"
              rules={[{ required: true, message: 'Vui lòng nhập số CCCD/CMND!' }]}
            >
              <Input prefix={<IdcardOutlined />} disabled={!isEditing} />
            </Form.Item>
            <Form.Item
              label="Ngày cấp"
              name="identityIssueDate"
              rules={[{ required: true, message: 'Vui lòng nhập ngày cấp!' }]}
            >
              <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} disabled={!isEditing} />
            </Form.Item>
            <Form.Item
              label="Nơi cấp"
              name="identityIssuePlace"
              rules={[{ required: true, message: 'Vui lòng nhập nơi cấp!' }]}
            >
              <Input prefix={<IdcardOutlined />} disabled={!isEditing} />
            </Form.Item>
            <Form.Item
              label="Địa chỉ thường trú"
              name="permanentAddress"
              rules={[{ required: true, message: 'Vui lòng nhập địa chỉ thường trú!' }]}
            >
              <Input prefix={<HomeOutlined />} disabled={!isEditing} />
            </Form.Item>
          </Col>
        </Row>

        {/* Nghề nghiệp */}
        <Form.Item
          label="Nghề nghiệp"
          name="occupation"
          rules={[{ required: false, message: 'Vui lòng chọn nghề nghiệp!' }]}
        >
          <Select
            showSearch
            placeholder="Chọn nghề nghiệp"
            optionFilterProp="children"
            disabled={!isEditing}
            onChange={handleOccupationChange}
          >
            {occupations.map(occupation => (
              <Option key={occupation} value={occupation}>{occupation}</Option>
            ))}
          </Select>
        </Form.Item>
        {isOtherOccupation && (
          <Form.Item
            label="Nhập nghề nghiệp"
            name="otherOccupation"
            rules={[{ required: false, message: 'Vui lòng nhập nghề nghiệp!' }]}
          >
            <Input disabled={!isEditing} />
          </Form.Item>
        )}

        {/* Thông tin ngân hàng */}
        <Card title="Thông Tin Ngân Hàng" style={{ marginTop: '20px' }}>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Số tài khoản ngân hàng"
                name="bank_account_number"
                rules={[{ required: true, message: 'Vui lòng nhập số tài khoản ngân hàng!' }]}
              >
                <Input prefix={<BankOutlined />} disabled={!isEditing} />
              </Form.Item>
              <Form.Item
                label="Tên ngân hàng"
                name="bank_name"
                rules={[{ required: true, message: 'Vui lòng nhập tên ngân hàng!' }]}
              >
                <Input prefix={<BankOutlined />} disabled={!isEditing} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Chủ tài khoản ngân hàng"
                name="bank_account_name"
              >
                <Input placeholder="Nhập tên chủ tài khoản ngân hàng" disabled={!isEditing} />
              </Form.Item>
              <Form.Item
                label="Chi nhánh ngân hàng"
                name="bank_branch"
                rules={[{ required: true, message: 'Vui lòng nhập chi nhánh ngân hàng!' }]}
              >
                <Input prefix={<BranchesOutlined />} disabled={!isEditing} />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {isEditing && (
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Yêu cầu sửa thông tin
            </Button>
          </Form.Item>
        )}
      </Form>
    </Card>
  </Col>
</Row>

        </div>   
    );
};

export default Profile;