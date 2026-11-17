'use client';

import { useId } from 'react';

import {
  Button,
  Collapse,
  ConfigProvider,
  Descriptions,
  Flex,
  Layout,
  Menu,
  Slider,
  Tag,
  theme,
  Typography,
} from 'antd';

const menuItems = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'orders', label: 'Orders' },
  { key: 'customers', label: 'Customers' },
  { key: 'settings', label: 'Settings' },
];

const orderItems = [
  { key: 'customer', label: 'Customer', children: 'Ada Lovelace' },
  { key: 'email', label: 'Email', children: 'ada@example.com' },
  { key: 'placed', label: 'Placed', children: '12 March 2026' },
  { key: 'total', label: 'Total', children: '$1,280.00' },
];

const sectionItems = [
  {
    key: 'shipping',
    label: 'Shipping',
    children: 'Express, two business days. Sent to 12 Analytical Row, London.',
  },
  {
    key: 'payment',
    label: 'Payment',
    children: 'Card ending 4242, charged on 12 March 2026.',
  },
];

const sliderMarks = { 25: ' ', 50: ' ', 75: ' ' };

function AdminPage() {
  const id = useId();
  const { token } = theme.useToken();

  return (
    <div
      data-reference="ant-design"
      style={{
        overflowX: 'auto',
        border: `1px solid ${token.colorSplit}`,
        borderRadius: token.borderRadiusLG,
      }}
    >
      <Layout hasSider style={{ minWidth: 672 }}>
        <Layout.Sider width={176} theme="dark">
          <Typography.Text
            style={{ display: 'block', padding: '12px 16px', color: '#fff' }}
          >
            Acme admin
          </Typography.Text>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={['orders']}
            items={menuItems}
          />
        </Layout.Sider>
        <Layout.Content style={{ padding: 24 }}>
          <Flex vertical gap={24}>
            <Flex align="center" gap={12}>
              <Typography.Title level={5} style={{ margin: 0 }}>
                Order 20418
              </Typography.Title>
              <Tag color="success" variant="outlined">
                Paid
              </Tag>
              <Button type="primary" style={{ marginInlineStart: 'auto' }}>
                Edit order
              </Button>
            </Flex>
            <Descriptions bordered column={2} items={orderItems} />
            <Collapse
              accordion
              defaultActiveKey="shipping"
              items={sectionItems}
            />
            <Flex vertical gap={4}>
              <Typography.Text id={`${id}-refund`}>
                Refund share
              </Typography.Text>
              <Slider
                defaultValue={30}
                marks={sliderMarks}
                ariaLabelledByForHandle={`${id}-refund`}
                style={{ margin: 0 }}
              />
            </Flex>
          </Flex>
        </Layout.Content>
      </Layout>
    </div>
  );
}

/**
 * The admin page of the Ant Design look page, built with Ant Design and its
 * default theme. It is the reference the nxds version is compared with.
 */
export default function AntDesignScene({ mode }: { mode: 'light' | 'dark' }) {
  return (
    <ConfigProvider
      theme={{
        algorithm:
          mode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <AdminPage />
    </ConfigProvider>
  );
}
