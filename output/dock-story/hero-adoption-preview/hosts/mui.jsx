import { useMemo, useState } from 'react';

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  createTheme,
  CssBaseline,
  LinearProgress,
  ThemeProvider,
  Typography,
} from '@mui/material';

import { AdditionSection, LocalNote } from '../parts';

export const probeSelectors = {
  progress: '[data-probe="progress"] .MuiLinearProgress-bar',
};

export function Workspace({ Addition, role, onRoleChange, mode }) {
  const [invited, setInvited] = useState(false);
  const theme = useMemo(() => createTheme({ palette: { mode } }), [mode]);
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        component="main"
        className="adoption-workspace"
        data-probe="workspace"
        data-external-ui="mui"
        sx={{ bgcolor: 'background.default', color: 'text.primary' }}
      >
        <header className="adoption-workspace-header">
          <span className="adoption-overline">ACME / WORKSPACE</span>
          <div className="adoption-title-row">
            <Typography component="h2" variant="h5" data-probe="title">
              Design team
            </Typography>
            <Chip label="Pro" color="primary" size="small" data-probe="badge" />
          </div>
        </header>
        <Card variant="outlined" data-probe="usage">
          <CardContent className="adoption-card-body">
            <Typography component="h3" variant="subtitle1">
              Workspace usage
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary' }}
              data-probe="description"
            >
              This month · 8 of 10 seats
            </Typography>
            <div className="adoption-progress-row">
              <LinearProgress
                variant="determinate"
                value={80}
                aria-label="Seats used"
                data-probe="progress"
              />
              <Typography variant="body2">80%</Typography>
            </div>
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary' }}
              data-probe="note"
            >
              2 seats available
            </Typography>
          </CardContent>
        </Card>
        <Button
          variant="contained"
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
      </Box>
    </ThemeProvider>
  );
}
