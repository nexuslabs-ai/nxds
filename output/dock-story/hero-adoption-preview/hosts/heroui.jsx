import { useState } from 'react';

import { Button, Card, Chip, ProgressBar } from '@heroui/react';

import { AdditionSection, LocalNote } from '../parts';

import '@heroui/styles/css';

export function Workspace({ Addition, role, onRoleChange, mode }) {
  const [invited, setInvited] = useState(false);
  return (
    <main
      className="adoption-workspace adoption-workspace-heroui"
      data-probe="workspace"
      data-external-ui="heroui"
    >
      <header className="adoption-workspace-header">
        <span className="adoption-overline">ACME / WORKSPACE</span>
        <div className="adoption-title-row">
          <h2 data-probe="title">Design team</h2>
          <Chip color="accent" data-probe="badge">
            Pro
          </Chip>
        </div>
      </header>
      <Card data-probe="usage">
        <Card.Header>
          <Card.Title>Workspace usage</Card.Title>
          <Card.Description data-probe="description">
            This month · 8 of 10 seats
          </Card.Description>
        </Card.Header>
        <Card.Content>
          <ProgressBar aria-label="Seats used" value={80}>
            <ProgressBar.Output />
            <ProgressBar.Track>
              <ProgressBar.Fill data-probe="progress" />
            </ProgressBar.Track>
          </ProgressBar>
        </Card.Content>
        <Card.Footer>
          <Card.Description data-probe="note">
            2 seats available
          </Card.Description>
        </Card.Footer>
      </Card>
      <Button data-probe="invite" onPress={() => setInvited(true)}>
        {invited ? 'Invitation prepared' : 'Invite teammate'}
      </Button>
      <AdditionSection
        Addition={Addition}
        role={role}
        onRoleChange={onRoleChange}
        mode={mode}
      />
      <LocalNote invited={invited} />
    </main>
  );
}
