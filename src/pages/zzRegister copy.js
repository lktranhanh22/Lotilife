import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Row,
  Col,
  DatePicker,
  Typography,
  message,
  Select,
} from "antd";
import dayjs from "dayjs";
import { cityMapping, occupations } from "../components/Register/constants";
import PersonalInfoForm from "../components/Register/PersonalInfoForm";
import AddressForm from "../components/Register/AddressForm";
import BankInfoForm from "../components/Register/BankInfoForm";
import { register } from "../api";
import { useNavigate } from "react-router-dom";
import "dayjs/locale/vi";
dayjs.locale("vi");

const { Title } = Typography;

const Register = () => {
  const [form] = Form.useForm();
  const [referrer_id, setReferrer_id] = useState("");
  const navigate = useNavigate();
  const [isOtherOccupation, setIsOtherOccupation] = useState(false);

  // State for address selection
  const [selectedTempCity, setSelectedTempCity] = useState(null);
  const [selectedTempDistrict, setSelectedTempDistrict] = useState(null);
  const [tempDistricts, setTempDistricts] = useState([]);
  const [tempWards, setTempWards] = useState([]);

const [addressData, setAddressData] = useState({});
const [cities, setCities] = useState([]);
const [districts, setDistricts] = useState([]);
const [wards, setWards] = useState([]);
const [selectedCity, setSelectedCity] = useState(null);
const [selectedDistrict, setSelectedDistrict] = useState(null);

  useEffect(() => {
    document.title = "Đăng Ký Tài Khoản"; // Cập nhật tiêu đề của trang

    // Fetch JSON data for provinces, districts, and wards
    fetch(
      "https://lotilife.com/wp-content/plugins/devvn-woo-ghtk/vietnam-checkout/cities/devvn-vn-address.json"
    )
      .then((response) => response.json())
      .then((data) => {
        setAddressData(data); // Store the fetched data
        setCities(Object.keys(data)); // Populate city dropdown
        setDistricts([]);
        setWards([]);
      })
      .catch((error) => message.error("Có lỗi khi tải dữ liệu địa chỉ!"));

    const hash = window.location.hash;
    const urlParams = new URLSearchParams(hash.split("?")[1]);
    const ref = urlParams.get("ref");
    if (ref) {
      setReferrer_id(ref);
      form.setFieldsValue({ referrer_id: ref });
    }
  }, [form]);
  // Thêm các hàm này sau useEffect
const fetchDistricts = async (cityCode) => {
    if (addressData[cityCode] && addressData[cityCode].districts) {
      return Object.entries(addressData[cityCode].districts).map(([code, data]) => ({
        code,
        name: data.name
      }));
    }
    return [];
  };
  
  const fetchWards = async (districtCode) => {
    const city = Object.keys(addressData).find(cityCode => 
      addressData[cityCode].districts[districtCode]
    );
    
    if (city && addressData[city].districts[districtCode].wards) {
      return Object.entries(addressData[city].districts[districtCode].wards).map(([code, name]) => ({
        code,
        name
      }));
    }
    return [];
  };

  const handleCityChange = (value, type) => {
    if (type === 'permanent') {
      setSelectedCity(value);
      setSelectedDistrict(null);
      setDistricts([]); // Reset districts
      setWards([]); // Reset wards
      // Fetch districts for permanent address
      fetchDistricts(value).then(data => setDistricts(data));
    } else {
      setSelectedTempCity(value);
      setSelectedTempDistrict(null);
      setTempDistricts([]); // Reset temp districts
      setTempWards([]); // Reset temp wards
      // Fetch districts for temporary address
      fetchDistricts(value).then(data => setTempDistricts(data));
    }
  };

  const handleDistrictChange = (value, type) => {
    if (type === 'permanent') {
      setSelectedDistrict(value);
      setWards([]); // Reset wards
      // Fetch wards for permanent address
      fetchWards(value).then(data => setWards(data));
    } else {
      setSelectedTempDistrict(value);
      setTempWards([]); // Reset temp wards
      // Fetch wards for temporary address
      fetchWards(value).then(data => setTempWards(data));
    }
  };
  const handleOccupationChange = (value) => {
    setIsOtherOccupation(value === "Khác");
  };

  const onFinish = async (values) => {
    // Định dạng lại ngày tháng năm sinh
    const formattedValues = {
      ...values,
      dob: values.dob ? dayjs(values.dob).format("YYYY-MM-DD") : "",
      identityIssueDate: values.identityIssueDate
        ? dayjs(values.identityIssueDate).format("YYYY-MM-DD")
        : "",
    };
  
    // Xử lý địa chỉ thường trú
    const permanentAddress = `${values.permanent_address}, ${
      wards.find((w) => w.code === values.permanent_ward)?.name || ""
    }, ${districts.find((d) => d.code === values.permanent_district)?.name || ""}, ${
      cityMapping[values.permanent_city]
    }`;
  
    // Xử lý địa chỉ tạm trú
    const temporaryAddress = values.sameAsPermanent 
      ? permanentAddress 
      : `${values.temporary_address}, ${
          tempWards.find((w) => w.code === values.temporary_ward)?.name || ""
        }, ${tempDistricts.find((d) => d.code === values.temporary_district)?.name || ""}, ${
          cityMapping[values.temporary_city]
        }`;
  
    const occupation = isOtherOccupation
      ? values.otherOccupation
      : values.occupation;
  
    try {
      const response = await register({
        ...formattedValues,
        occupation,
        permanent_address: permanentAddress,
        temporary_address: temporaryAddress,
      });
      
      if (response.data.success) {
        message.success("Đăng ký thành công!");
        navigate("/login", { replace: true });
      } else {
        message.error(`Đăng ký thất bại: ${response.data.data}`);
      }
    } catch (error) {
      message.error("Có lỗi xảy ra, vui lòng thử lại!");
    }
  };

  return (
    <Row justify="center" style={{ marginTop: "50px" }}>
      <Col xs={24} sm={20} md={16} lg={12} xl={8}>
        <Title level={2} style={{ textAlign: "center", marginBottom: "20px" }}>
          Đăng Ký Tài Khoản
        </Title>
        <Form
          form={form}
          name="register"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <PersonalInfoForm  form={form}
                        referrer_id={referrer_id}
                        isOtherOccupation={isOtherOccupation}
                        handleOccupationChange={handleOccupationChange}
                        occupations={occupations} />
          {/* Address Section */}
          <AddressForm 
  form={form}
  cityMapping={cityMapping}
  districts={districts}
  wards={wards}
  selectedCity={selectedCity}
  selectedDistrict={selectedDistrict}
  tempDistricts={tempDistricts}
  tempWards={tempWards}
  selectedTempCity={selectedTempCity}
  selectedTempDistrict={selectedTempDistrict}
  handleCityChange={handleCityChange}
  handleDistrictChange={handleDistrictChange}
  addressData={addressData}  // Thêm prop này
/>
          {/* <Title level={4}>Địa chỉ thường trú</Title>
          <Form.Item
            label="Tỉnh/Thành phố"
            name="city"
            rules={[
              { required: true, message: "Vui lòng chọn tỉnh/thành phố!" },
            ]}
          >
            <Select
              placeholder="Chọn tỉnh/thành phố"
              onChange={handleCityChange}
            >
              {Object.entries(cityMapping).map(([key, value]) => (
                <Select.Option key={key} value={key}>
                  {value}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="Quận/Huyện"
            name="district"
            rules={[{ required: true, message: "Vui lòng chọn quận/huyện!" }]}
          >
            <Select
              placeholder="Chọn quận/huyện"
              onChange={handleDistrictChange}
              disabled={!selectedCity}
            >
              {districts.map((district) => (
                <Select.Option key={district.id} value={district.id}>
                  {district.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="Xã/Phường/Thị trấn"
            name="ward"
            rules={[
              { required: true, message: "Vui lòng chọn xã/phường/thị trấn!" },
            ]}
          >
            <Select
              placeholder="Chọn xã/phường/thị trấn"
              disabled={!selectedDistrict}
            >
              {wards.map((ward) => (
                <Select.Option key={ward.id} value={ward.id}>
                  {ward.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="Địa chỉ"
            name="permanentAddress"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập tên đường, tòa nhà, số nhà!",
              },
            ]}
          >
            <Input placeholder="Nhập tên đường, tòa nhà, số nhà" />
          </Form.Item>          
          {isOtherOccupation && (
            <Form.Item
              label="Nhập nghề nghiệp khác"
              name="otherOccupation"
              rules={[
                { required: false, message: "Vui lòng nhập nghề nghiệp!" },
              ]}
            >
              <Input />
            </Form.Item>
          )} */}
          {/* Bank Information Section */}
          <BankInfoForm />
          {/* <Title level={4}>Thông tin ngân hàng</Title>
          <Form.Item
            label="Số tài khoản"
            name="bank_account_number"
            rules={[{ required: true, message: "Vui lòng nhập số tài khoản!" }]}
          >
            <Input placeholder="Nhập số tài khoản" />
          </Form.Item>
          <Form.Item
            label="Chủ tài khoản"
            name="bank_account_name"
            rules={[
              { required: true, message: "Vui lòng nhập Tên chủ tài khoản!" },
            ]}
          >
            <Input placeholder="Nhập tên chủ tài khoản" />
          </Form.Item>
          <Form.Item
            label="Tên ngân hàng"
            name="bank_name"
            rules={[
              { required: true, message: "Vui lòng nhập tên ngân hàng!" },
            ]}
          >
            <Input placeholder="Nhập tên ngân hàng" />
          </Form.Item>
          <Form.Item
            label="Chi nhánh ngân hàng"
            name="bank_branch"
            rules={[
              { required: true, message: "Vui lòng nhập chi nhánh ngân hàng!" },
            ]}
          >
            <Input placeholder="Nhập chi nhánh ngân hàng" />
          </Form.Item> */}

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Đăng ký
            </Button>
          </Form.Item>
        </Form>
      </Col>
    </Row>
  );
};

export default Register;
