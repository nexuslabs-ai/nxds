import { useState } from 'react';

import { Badge } from '../../comparison-ui/badge';
import { Button } from '../../comparison-ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../comparison-ui/card';
import { AdditionSection, LocalNote } from '../parts';

import '../shadcn-host.css';

export function Workspace({ Addition, role, onRoleChange, mode }) {
  const [invited, setInvited] = useState(false);
  return (
    <main
      className="adoption-workspace adoption-workspace-shadcn"
      data-probe="workspace"
      data-external-ui="shadcn"
    >
      <header className="adoption-workspace-header">
        <span className="adoption-overline">ACME / WORKSPACE</span>
        <div className="adoption-title-row">
          <h2 data-probe="title">Design team</h2>
          <Badge data-probe="badge">Pro</Badge>
        </div>
      </header>
      <Card data-probe="usage">
        <CardHeader>
          <CardTitle>Workspace usage</CardTitle>
          <CardDescription data-probe="description">
            This month · 8 of 10 seats
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="adoption-progress-row">
            <div
              role="progressbar"
              aria-label="Seats used"
              aria-valuenow={80}
              aria-valuemin={0}
              aria-valuemax={100}
              className="bg-primary/20 relative h-2 w-full overflow-hidden rounded-full"
            >
              <div
                data-probe="progress"
                className="bg-primary h-full w-4/5 rounded-full"
              />
            </div>
            <span className="text-sm">80%</span>
          </div>
        </CardContent>
        <CardFooter>
          <CardDescription data-probe="note">2 seats available</CardDescription>
        </CardFooter>
      </Card>
      <Button data-probe="invite" onClick={() => setInvited(true)}>
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
