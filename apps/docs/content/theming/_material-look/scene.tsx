import { useId } from 'react';

import { Button } from './button/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './card/card';
import { Checkbox } from './checkbox/checkbox';
import { Progress } from './progress/progress';
import { Switch } from './switch/switch';
import { TextField } from './text-field/text-field';

/** Material's Add icon. Material's icons are filled shapes, not lines. */
function AddIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
    </svg>
  );
}

const settingRowClass = 'nx:flex nx:items-center nx:justify-between nx:gap-4';
const settingLabelClass =
  'nx:typography-body-default nx:text-[length:var(--nx-typography-size-base)] nx:leading-[var(--nx-typography-line-height-base)]';

/**
 * The settings screen of the Material look page, built with nxds parts inside
 * a wrapper that sets Material's colors. It follows the page's light or dark
 * mode, density and corners.
 */
export function MaterialScene() {
  const id = useId();

  return (
    <div
      data-look="material"
      className="nx:@container nx:rounded-lg nx:border nx:border-border-hairline nx:bg-background nx:p-6 nx:text-foreground"
    >
      <div className="nx:grid nx:grid-cols-1 nx:items-start nx:gap-6 nx:@2xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Shown on your invoices.</CardDescription>
          </CardHeader>
          <CardContent className="nx:flex nx:flex-col nx:gap-6">
            <div className="nx:flex nx:flex-col nx:gap-2">
              <Progress value={60} aria-label="Profile details added" />
              <p className="nx:m-0 nx:typography-body-small nx:leading-[1.66] nx:tracking-[var(--nx-typography-letterspacing-wide)] nx:text-muted-foreground">
                3 of 5 details added
              </p>
            </div>
            <TextField label="Full name" defaultValue="Ada Lovelace" />
            <TextField
              label="Email"
              type="email"
              defaultValue="ada@"
              aria-invalid
              helperText="Enter a full email address."
            />
          </CardContent>
          <CardFooter className="nx:justify-between">
            <Button variant="ghost" color="error">
              Delete account
            </Button>
            <div className="nx:flex nx:gap-2">
              <Button variant="ghost">Cancel</Button>
              <Button>Save</Button>
            </div>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Choose what we email you.</CardDescription>
          </CardHeader>
          <CardContent className="nx:flex nx:flex-col nx:gap-4">
            <div className={settingRowClass}>
              <label htmlFor={`${id}-updates`} className={settingLabelClass}>
                Product updates
              </label>
              <Switch id={`${id}-updates`} defaultChecked />
            </div>
            <div className={settingRowClass}>
              <label htmlFor={`${id}-summary`} className={settingLabelClass}>
                Weekly summary
              </label>
              <Switch id={`${id}-summary`} />
            </div>
            <div className={settingRowClass}>
              <label
                htmlFor={`${id}-offers`}
                className={`${settingLabelClass} nx:text-disabled-foreground`}
              >
                Partner offers
              </label>
              <Switch id={`${id}-offers`} disabled />
            </div>
            <div className="nx:-ml-[11px] nx:flex nx:items-center">
              <Checkbox id={`${id}-team`} defaultChecked />
              <label htmlFor={`${id}-team`} className={settingLabelClass}>
                Send a copy to my team
              </label>
            </div>
            <TextField variant="filled" label="Company" />
          </CardContent>
          <CardFooter className="nx:justify-between nx:p-4">
            <Button variant="outline" color="secondary">
              Mute all
            </Button>
            <Button iconOnly startIcon={<AddIcon />}>
              Add a channel
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
