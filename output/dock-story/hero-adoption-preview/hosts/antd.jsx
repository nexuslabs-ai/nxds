import { useState } from 'react';

import {
  Button,
  Card,
  ConfigProvider,
  Progress,
  Tag,
  theme as antTheme,
  Typography,
} from 'antd';

import { AdditionSection, LocalNote } from '../parts';

import 'antd/dist/reset.css';

export const probeSelectors = {
  progress: '[data-probe="progress"] .ant-progress-track',
};

function Surface({ children }) {
  const { token } = antTheme.useToken();
  return (
    <main
      className="adoption-workspace"
      data-probe="workspace"
      data-external-ui="antd"
      style={{ background: token.colorBgLayout, color: token.colorText }}
    >
      {children}
    </main>
  );
}

export function Workspace({ Addition, role, onRoleChange, mode }) {
  const [invited, setInvited] = useState(false);
  return (
    <ConfigProvider
      theme={{
        algorithm:
          mode === 'dark' ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
      }}
    >
      <Surface>
        <header className="adoption-workspace-header">
          <span className="adoption-overline">ACME / WORKSPACE</span>
          <div className="adoption-title-row">
            <Typography.Title level={2} data-probe="title">
              Design team
            </Typography.Title>
            <Tag color="blue" data-probe="badge">
              Pro
            </Tag>
          </div>
        </header>
        <Card size="small" title="Workspace usage" data-probe="usage">
          <div className="adoption-card-body">
            <Typography.Text type="secondary" data-probe="description">
              This month · 8 of 10 seats
            </Typography.Text>
            <Progress
              percent={80}
              aria-label="Seats used"
              data-probe="progress"
            />
            <Typography.Text type="secondary" data-probe="note">
              2 seats available
            </Typography.Text>
          </div>
        </Card>
        <Button
          type="primary"
          data-probe="invite"
          onClick={() => setInvited(true)}
        >
          {invited ? 'Invitation prepared' : 'Invite teammate'}
        </Button>
        <AdditionSection
          Addition={Addition}
          role={role}
          onRoleChange={onRoleChange}
          mode={mode}
        />
        <LocalNote invited={invited} />
      </Surface>
    </ConfigProvider>
  );
}
