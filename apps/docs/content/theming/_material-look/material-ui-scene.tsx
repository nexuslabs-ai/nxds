'use client';

import { useId, useMemo } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Checkbox from '@mui/material/Checkbox';
import Fab from '@mui/material/Fab';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import SvgIcon from '@mui/material/SvgIcon';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

// Material UI drops its letter spacing when the font family is not its default
// string, so the theme sets each variant's default spacing again.
const TYPOGRAPHY = {
  fontFamily: '"Roboto Variable", "Helvetica", "Arial", sans-serif',
  h5: { letterSpacing: '0em' },
  body1: { letterSpacing: '0.00938em' },
  button: { letterSpacing: '0.02857em' },
  caption: { letterSpacing: '0.03333em' },
};

const settingRowSx = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 2,
};

/**
 * The settings screen of the Material look page, built with Material UI and
 * its default theme. It is the reference the nxds version is compared with.
 */
export default function MaterialUiScene({ mode }: { mode: 'light' | 'dark' }) {
  const id = useId();
  const theme = useMemo(
    () => createTheme({ palette: { mode }, typography: TYPOGRAPHY }),
    [mode]
  );

  return (
    <ThemeProvider theme={theme}>
      <Box
        data-reference="material-ui"
        sx={{
          containerType: 'inline-size',
          bgcolor: 'background.default',
          color: 'text.primary',
          border: 1,
          borderColor: 'divider',
          borderRadius: '6px',
          p: 3,
        }}
      >
        <Box
          sx={{
            display: 'grid',
            alignItems: 'start',
            gap: 3,
            gridTemplateColumns: '1fr',
            '@container (min-width: 42rem)': {
              gridTemplateColumns: '1fr 1fr',
            },
          }}
        >
          <Card>
            <CardHeader title="Profile" subheader="Shown on your invoices." />
            <CardContent sx={{ pt: 0 }}>
              <Stack spacing={3}>
                <Stack spacing={1}>
                  <LinearProgress
                    variant="determinate"
                    value={60}
                    aria-label="Profile details added"
                  />
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary' }}
                  >
                    3 of 5 details added
                  </Typography>
                </Stack>
                <TextField
                  fullWidth
                  label="Full name"
                  defaultValue="Ada Lovelace"
                />
                <TextField
                  fullWidth
                  error
                  label="Email"
                  type="email"
                  defaultValue="ada@"
                  helperText="Enter a full email address."
                />
              </Stack>
            </CardContent>
            <CardActions sx={{ justifyContent: 'space-between' }}>
              <Button color="error">Delete account</Button>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button>Cancel</Button>
                <Button variant="contained">Save</Button>
              </Box>
            </CardActions>
          </Card>

          <Card>
            <CardHeader
              title="Notifications"
              subheader="Choose what we email you."
            />
            <CardContent sx={{ pt: 0 }}>
              <Stack spacing={2}>
                <Box sx={settingRowSx}>
                  <Typography component="label" htmlFor={`${id}-updates`}>
                    Product updates
                  </Typography>
                  <Switch id={`${id}-updates`} defaultChecked />
                </Box>
                <Box sx={settingRowSx}>
                  <Typography component="label" htmlFor={`${id}-summary`}>
                    Weekly summary
                  </Typography>
                  <Switch id={`${id}-summary`} />
                </Box>
                <Box sx={settingRowSx}>
                  <Typography
                    component="label"
                    htmlFor={`${id}-offers`}
                    sx={{ color: 'text.disabled' }}
                  >
                    Partner offers
                  </Typography>
                  <Switch id={`${id}-offers`} disabled />
                </Box>
                <FormGroup>
                  <FormControlLabel
                    control={<Checkbox defaultChecked />}
                    label="Send a copy to my team"
                  />
                </FormGroup>
                <TextField fullWidth variant="filled" label="Company" />
              </Stack>
            </CardContent>
            <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
              <Button variant="outlined" color="secondary">
                Mute all
              </Button>
              <Fab color="primary" size="medium" aria-label="Add a channel">
                <SvgIcon>
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                </SvgIcon>
              </Fab>
            </CardActions>
          </Card>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
