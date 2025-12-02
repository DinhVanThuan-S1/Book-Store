/**
 * ==============================================
 * ADDRESS SELECTOR COMPONENT
 * ==============================================
 * Component chọn địa chỉ giao hàng
 */

import React, { useState, useEffect } from 'react';
import { Modal, List, Button, Radio, Tag, Space, Empty } from 'antd';
import { PlusOutlined, EnvironmentOutlined, CheckOutlined } from '@ant-design/icons';
import { addressApi } from '@api';
import { useMessage } from '@utils/notification';
import './AddressSelector.scss';

/**
 * AddressSelector Component
 * @param {Object} props
 * @param {Boolean} props.visible - Hiển thị modal
 * @param {Function} props.onCancel - Callback đóng modal
 * @param {Function} props.onSelect - Callback khi chọn địa chỉ
 * @param {Function} props.onAddNew - Callback thêm địa chỉ mới
 * @param {String} props.selectedAddressId - ID địa chỉ đang chọn
 */
const AddressSelector = ({ visible, onCancel, onSelect, onAddNew, selectedAddressId }) => {
  const { message } = useMessage();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);

  /**
   * Fetch addresses
   */
  useEffect(() => {
    if (visible) {
      fetchAddresses();
    }
  }, [visible]);

  /**
   * Update selected address when prop changes
   */
  useEffect(() => {
    if (selectedAddressId && addresses.length > 0) {
      if (addresses.some(addr => addr._id === selectedAddressId)) {
        setSelectedAddress(selectedAddressId);
      }
    }
  }, [selectedAddressId, addresses]);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await addressApi.getMyAddresses();
      const addressList = response.data.addresses || [];
      setAddresses(addressList);

      // Nếu có selectedAddressId từ prop, dùng nó
      if (selectedAddressId && addressList.some(addr => addr._id === selectedAddressId)) {
        setSelectedAddress(selectedAddressId);
      } else {
        // Nếu không, tự động chọn địa chỉ mặc định
        const defaultAddr = addressList.find(addr => addr.isDefault);
        if (defaultAddr) {
          setSelectedAddress(defaultAddr._id);
        } else if (addressList.length > 0) {
          setSelectedAddress(addressList[0]._id);
        }
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      message.error('Không thể tải danh sách địa chỉ');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle select address
   */
  const handleSelectAddress = (address) => {
    setSelectedAddress(address._id);
  };

  /**
   * Handle confirm
   */
  const handleConfirm = () => {
    const address = addresses.find((addr) => addr._id === selectedAddress);
    if (address) {
      onSelect(address);
      onCancel();
    }
  };

  /**
   * Handle add new
   */
  const handleAddNew = () => {
    if (onAddNew) {
      onAddNew();
    }
  };

  /**
   * Handle set default
   */
  const handleSetDefault = async (addressId) => {
    try {
      await addressApi.setDefaultAddress(addressId);
      await fetchAddresses();
      message.success('Đã đặt làm địa chỉ mặc định');
    } catch {
      message.error('Không thể cập nhật địa chỉ mặc định');
    }
  };

  return (
    <Modal
      title="Chọn địa chỉ giao hàng"
      open={visible}
      onCancel={onCancel}
      width={700}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Hủy
        </Button>,
        <Button
          key="confirm"
          type="primary"
          onClick={handleConfirm}
          disabled={!selectedAddress}
        >
          Xác nhận
        </Button>,
      ]}
    >
      <div className="address-selector">
        {/* Add New Button */}
        <Button
          type="dashed"
          block
          icon={<PlusOutlined />}
          onClick={handleAddNew}
          style={{ marginBottom: 16 }}
        >
          Thêm địa chỉ mới
        </Button>

        {/* Address List */}
        {addresses.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Chưa có địa chỉ nào"
          />
        ) : (
          <Radio.Group
            value={selectedAddress}
            onChange={(e) => setSelectedAddress(e.target.value)}
            style={{ width: '100%' }}
          >
            <List
              loading={loading}
              dataSource={addresses}
              renderItem={(address) => (
                <List.Item
                  key={address._id}
                  className={`address-item ${selectedAddress === address._id ? 'selected' : ''
                    }`}
                  onClick={() => handleSelectAddress(address)}
                >
                  <div className="address-content">
                    <Radio value={address._id}>
                      <Space direction="vertical" size="small">
                        <Space>
                          <span className="recipient-name">
                            {address.recipientName}
                          </span>
                          <span className="phone">{address.phone}</span>
                          {address.isDefault && (
                            <Tag color="green" icon={<CheckOutlined />}>
                              Mặc định
                            </Tag>
                          )}
                        </Space>
                        <div className="address-detail">
                          <EnvironmentOutlined style={{ marginRight: 8 }} />
                          {address.detailAddress}, {address.ward},{' '}
                          {address.district}, {address.province}
                        </div>
                      </Space>
                    </Radio>
                    {!address.isDefault && (
                      <Button
                        type="link"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetDefault(address._id);
                        }}
                      >
                        Đặt làm mặc định
                      </Button>
                    )}
                  </div>
                </List.Item>
              )}
            />
          </Radio.Group>
        )}
      </div>
    </Modal>
  );
};

export default AddressSelector;

