import React from 'react';
import { Modal, Row, Col, Image, Descriptions, Button, Tag as AntTag } from 'antd';
import { formatCurrency } from '../../utils';

const OrderDetailsModal = ({ visible, order, onClose }) => {    
  if (!order) return null;

  const isScrollable = order.items.length > 3; // Kiểm tra nếu số lượng sản phẩm > 5

  return (
    <Modal
      visible={visible}
      title={`Thông tin đơn hàng: #${order.orderId}`}
      onCancel={onClose}
      footer={[
        <Button key="close" type="primary" onClick={onClose}>
          THOÁT
        </Button>,
      ]}
      width="90%"
      style={{
        maxWidth: '900px',
        top: 0,  // Để modal xuất hiện ở phía trên cùng của màn hình
        height: '100vh',  // Chiếm toàn bộ chiều cao màn hình
        padding: 0,  // Loại bỏ padding mặc định của modal
        margin: 'auto',
        zIndex: 1000  // Loại bỏ margin mặc định của modal
      }}
      bodyStyle={{
        padding: 16,  // Padding bên trong modal
        maxHeight: isScrollable ? 'calc(100vh - 110px)' : 'auto', // Điều chỉnh chiều cao phần body để phù hợp với thiết bị di động
        overflowY: isScrollable ? 'scroll' : 'visible', // Kích hoạt cuộn dọc nếu cần
      }}
      className="custom-modal" // Thêm class để áp dụng CSS tùy chỉnh
    >
      <div>
        {order.items.map((item, index) => (
          <Row key={index} gutter={[16, 16]} style={{ marginBottom: 16 }}>
            <Col xs={24} sm={6} style={{ textAlign: 'center' }}>
              <Image
                width={100}
                src={item.image||'https://via.placeholder.com/150'}
                alt={item.name}
                style={{ maxWidth: '100%' }}
              />
            </Col>
            <Col xs={24} sm={18}>
              <strong style={{ fontSize: '1.2em' }}>{item.name}</strong>
              <div style={{ marginTop: '8px' }}>
                <AntTag color="blue">Số lượng: {item.quantity}</AntTag>
                <AntTag color="purple">{formatCurrency(item.price)}</AntTag>
              </div>
              <div style={{ marginTop: '8px' }}>
                {item.attributes && item.attributes.map((attr, attrIndex) => (
                  <div key={attrIndex}>
                    <strong>{attr.name}:</strong> {attr.value}
                  </div>
                ))}
              </div>
            </Col>
          </Row>
        ))}
      </div>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={12}>
          <Descriptions title="Giá trị đơn hàng" bordered column={1}>
            <Descriptions.Item label="Tiền hàng">{formatCurrency(order.totalOrderValue)}</Descriptions.Item>
            <Descriptions.Item label="Phí ship">{formatCurrency(order.shippingCost)}</Descriptions.Item>
            <Descriptions.Item label="Tổng đơn">{formatCurrency(order.totalItemsValue)}</Descriptions.Item>
          </Descriptions>
        </Col>

        <Col xs={24} sm={12}>
          <Descriptions title="Thông tin người nhận" bordered column={1}>
            <Descriptions.Item label="Điện thoại">{order.recipientPhone}</Descriptions.Item>
            <Descriptions.Item label="Họ tên">{order.recipientName}</Descriptions.Item>
            <Descriptions.Item label="Địa chỉ">{order.recipientAddress}</Descriptions.Item>
          </Descriptions>
        </Col>
      </Row>
    </Modal>
  );
};

export default OrderDetailsModal;
