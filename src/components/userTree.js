import React, { useState, useMemo } from 'react';
import { Tree, Modal, Tooltip } from 'antd';
import { MyOrders } from './order';
import { formatCurrency } from '../utils';

const UserTree = ({ treeData }) => {
    const [selectedNode, setSelectedNode] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const onSelect = (selectedKeys, { node }) => {
        if (node.status === 'locked') return; // Prevent click on locked nodes
        setSelectedNode(node);
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setSelectedNode(null);
    };

    const renderTitle = (node) => (
        <Tooltip title={`ID: ${node.key}`}>
            <span 
                style={{ 
                    textDecoration: node.status === 'locked' ? 'line-through' : 'none',
                    color: node.status === 'locked' ? 'red' : 'inherit',
                }}
            >
                {node.title} ({formatCurrency(node.sales)})
            </span>
        </Tooltip>
    );

    const enhancedTreeData = useMemo(() => treeData.map((item) => ({
        ...item,
        title: renderTitle(item),
        key: item.key,
        customer_name: item.title,
        children: item.children ? item.children.map((child) => ({
            ...child,
            customer_name: child.title,
            title: renderTitle(child),
            key: child.key,
        })) : [],
    })), [treeData]);

    const modalColumns = ['orderId', 'orderDate', 'status', 'totalValue', 'pvPoints'];

    return (
        <>
            <Tree
                treeData={enhancedTreeData}
                onSelect={onSelect}
                showLine={{ showLeafIcon: true }}
                blockNode
            />
            <Modal
                title="Danh sách đơn hàng"
                visible={isModalVisible}
                onCancel={handleCancel}
                footer={null}
                width={1000}
            >                
               {selectedNode && (
                    <MyOrders 
                        userId={selectedNode.key} 
                        selectedColumns={modalColumns} 
                        title={`Đơn hàng của ${selectedNode.customer_name}`} 
                    />
                )}
            </Modal>
        </>
    );
};

export default UserTree;
