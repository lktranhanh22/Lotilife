import React, { useState, useEffect, useCallback } from "react";
import {
  Form,
  Button,
  Row,
  Col,  
  Typography,
  message,  
  Spin,
} from "antd";
import dayjs from "dayjs";
import { occupations } from "../components/Register/constants";
import PersonalInfoForm from "../components/Register/PersonalInfoForm";
import AddressForm from "../components/Register/AddressForm";
import BankInfoForm from "../components/Register/BankInfoForm";
import { register } from "../api";
import { useNavigate } from "react-router-dom";
import "dayjs/locale/vi";
dayjs.locale("vi");

const { Title } = Typography;

// Custom hook để lấy dữ liệu địa chỉ
const useAddressData = () => {
  const [addressData, setAddressData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAddressData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("https://raw.githubusercontent.com/madnh/hanhchinhvn/master/dist/tree.json");
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();        
        setAddressData(data);
      } catch (error) {
        console.error("Error loading address data:", error);
        setError(error.message);
        message.error("Có lỗi khi tải dữ liệu địa chỉ!");
      } finally {
        setLoading(false);
      }
    };
    
    fetchAddressData();
  }, []);

  return { addressData, loading, error };
};

const Register = () => {
  const [form] = Form.useForm();
  const [referrer_id, setReferrer_id] = useState("");
  const navigate = useNavigate();
  const [isOtherOccupation, setIsOtherOccupation] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // State for address selection
  const [selectedTempCity, setSelectedTempCity] = useState(null);
  const [selectedTempDistrict, setSelectedTempDistrict] = useState(null);
  const [tempDistricts, setTempDistricts] = useState([]);
  const [tempWards, setTempWards] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);

  const { addressData, loading, error } = useAddressData();

  useEffect(() => {
    document.title = "Đăng Ký Tài Khoản";
    const originalTitle = document.title;
  
    // Xử lý referrer_id
    const hash = window.location.hash;
    const urlParams = new URLSearchParams(hash.split("?")[1]);
    const ref = urlParams.get("ref");
    if (ref) {
      setReferrer_id(ref);
      form.setFieldsValue({ referrer_id: ref });
    }

    return () => {
      document.title = originalTitle;
    };
  }, [form]);

  const fetchDistricts = async (cityCode, addressData) => {
    try {
      if (!addressData || !cityCode) {        
        return [];
      }
      
      const districts = Object.entries(addressData[cityCode]?.['quan-huyen'] || {}).map(([code, district]) => ({
        code: code,
        name: district.name_with_type,
      }));          
      return districts;
    } catch (error) {
      console.error("Error fetching districts:", error);
      return [];
    }
  };
  
  const fetchWards = async (districtCode, cityCode, addressData) => {
    try {
      if (!addressData || !districtCode || !cityCode) {        
        return [];
      }
      
      const wards = Object.entries(
        addressData[cityCode]?.['quan-huyen']?.[districtCode]?.['xa-phuong'] || {}
      ).map(([code, ward]) => ({
        code: code,
        name: ward.name_with_type,
      }));
      
      return wards;
    } catch (error) {
      console.error("Error fetching wards:", error);
      return [];
    }
  };

  const handleCityChange = useCallback(async (value, type) => {
    try {
      if (type === 'permanent') {
        setSelectedCity(value);
        setSelectedDistrict(null);
        setWards([]);
        
        const districtData = await fetchDistricts(value, addressData);
        setDistricts(districtData);
        form.setFieldsValue({
          permanent_district: undefined,
          permanent_ward: undefined,
        });
      } else {
        setSelectedTempCity(value);
        setSelectedTempDistrict(null);
        setTempWards([]);
        
        const districtData = await fetchDistricts(value, addressData);
        setTempDistricts(districtData);
        form.setFieldsValue({
          temporary_district: undefined,
          temporary_ward: undefined,
        });
      }
    } catch (error) {
      console.error("Error in handleCityChange:", error);
      message.error("Có lỗi khi tải dữ liệu quận/huyện!");
    }
  }, [addressData, form]);
  
  const handleDistrictChange = useCallback(async (value, type) => {    
    try {
      if (type === 'permanent') {
        setSelectedDistrict(value);        
        const wardData = await fetchWards(value, selectedCity, addressData);    
        setWards(wardData);
        form.setFieldsValue({
          permanent_ward: undefined,
        });
      } else {
        setSelectedTempDistrict(value);
        
        const wardData = await fetchWards(value, selectedTempCity, addressData);        
        setTempWards(wardData);
        form.setFieldsValue({
          temporary_ward: undefined,
        });
      }
    } catch (error) {
      console.error("Error in handleDistrictChange:", error);
      message.error("Có lỗi khi tải dữ liệu phường/xã!");
    }
  }, [addressData, selectedCity, selectedTempCity, form]);

  const handleOccupationChange = (value) => {
    setIsOtherOccupation(value === "Khác");
  };

  const formatAddress = (addressDetail, wardData, districtData, cityData) => {
    return [
      addressDetail,
      wardData?.name,
      districtData?.name,
      cityData?.name_with_type
    ].filter(Boolean).join(", ");
  };

  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      const formattedValues = {
        ...values,
        dob: values.dob ? dayjs(values.dob).format("YYYY-MM-DD") : "",
        identityIssueDate: values.identityIssueDate
          ? dayjs(values.identityIssueDate).format("YYYY-MM-DD")
          : "",
      };

      // Xử lý địa chỉ thường trú
      const permanentAddress = formatAddress(
        values.permanent_address,
        wards.find(w => w.code === values.permanent_ward),
        districts.find(d => d.code === values.permanent_district),
        addressData[values.permanent_city]
      );

      // Xử lý địa chỉ tạm trú
      const temporaryAddress = formatAddress(
        values.temporary_address,
        tempWards.find(w => w.code === values.temporary_ward),
        tempDistricts.find(d => d.code === values.temporary_district),
        addressData[values.temporary_city]
      );

      const occupation = isOtherOccupation
        ? values.otherOccupation
        : values.occupation;

      const response = await register({
        ...formattedValues,
        occupation,
        permanent_address: permanentAddress,
        temporary_address: temporaryAddress,
      });

      if (response.data.success) {        
        navigate('/register-success', { 
          state: { 
            email: values.user_email,
            fullname: values.display_name ,
            phone: values.user_phone,
            permanent_address: permanentAddress,
            temporary_address: temporaryAddress
          },
          replace: true
        });
      } else {
        message.error(`Đăng ký thất bại: ${response.data.data}`);
      }
    } catch (error) {
      message.error("Có lỗi xảy ra, vui lòng thử lại!");
    } finally {
      setSubmitting(false);
    }
  };

  if (error) {
    return <div>Error loading address data: {error}</div>;
  }

  return (
    <Row justify="center" style={{ marginTop: "50px" }}>
      <Col xs={24} sm={20} md={16} lg={12} xl={8}>
        <Title level={2} style={{ textAlign: "center", marginBottom: "20px" }}>
          Đăng Ký Tài Khoản
        </Title>
        {loading ? (
          <Spin size="large" />
        ) : (
          <Form
            form={form}
            name="register"
            onFinish={onFinish}
            layout="vertical"
            size="large"
            validateTrigger={['onChange', 'onBlur']}
            scrollToFirstError
          >
            <PersonalInfoForm              
              referrer_id={referrer_id}
              isOtherOccupation={isOtherOccupation}
              handleOccupationChange={handleOccupationChange}
              occupations={occupations}
            />
            <AddressForm              
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
              addressData={addressData}
            />
            <BankInfoForm />
            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                block 
                loading={submitting}
              >
                Đăng ký
              </Button>
            </Form.Item>
          </Form>
        )}
      </Col>
    </Row>
  );
};

export default Register;
