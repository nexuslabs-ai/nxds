import { useId } from 'react';

import { Label } from '@/components/label/label';
import { IconPlus } from '@/lib/icons';

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
import { Input } from './input/input';
import { Progress } from './progress/progress';
import { Switch } from './switch/switch';

const settingRowClass = 'nx:flex nx:items-center nx:justify-between nx:gap-4';

/**
 * The Material look, live: a settings screen inside a wrapper that sets
 * Material's colors. Label is the stock nxds part. The preview follows the
 * page's light or dark mode, density and corners.
 */
export function MaterialLookPreview() {
  const id = useId();

  return (
    <div
      data-md-skip
      data-look="material"
      className="nx:@container nx:mb-8 nx:rounded-lg nx:border nx:border-border-hairline nx:bg-background nx:p-6 nx:text-foreground"
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
              <p className="nx:m-0 nx:typography-body-small nx:text-muted-foreground">
                3 of 5 details added
              </p>
            </div>
            <Input label="Full name" defaultValue="Ada Lovelace" />
            <Input
              label="Email"
              type="email"
              defaultValue="ada@"
              aria-invalid
              helperText="Enter a full email address."
            />
            <Input variant="filled" label="Company" />
          </CardContent>
          <CardFooter className="nx:justify-between">
            <Button variant="text" color="error">
              Delete account
            </Button>
            <div className="nx:flex nx:gap-2">
              <Button variant="text">Cancel</Button>
              <Button>Save</Button>
            </div>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Choose what we email you.</CardDescription>
          </CardHeader>
          <CardContent className="nx:flex nx:flex-col nx:gap-5">
            <div className={settingRowClass}>
              <Label htmlFor={`${id}-updates`}>Product updates</Label>
              <Switch id={`${id}-updates`} defaultChecked />
            </div>
            <div className={settingRowClass}>
              <Label htmlFor={`${id}-summary`}>Weekly summary</Label>
              <Switch id={`${id}-summary`} />
            </div>
            <div className={settingRowClass}>
              <Label htmlFor={`${id}-offers`}>Partner offers</Label>
              <Switch id={`${id}-offers`} disabled />
            </div>
            <div className="nx:flex nx:items-center nx:gap-3">
              <Checkbox id={`${id}-team`} defaultChecked />
              <Label htmlFor={`${id}-team`}>Send a copy to my team</Label>
            </div>
          </CardContent>
          <CardFooter className="nx:justify-between nx:p-4">
            <Button variant="outlined" color="secondary">
              Mute all
            </Button>
            <Button iconOnly size="lg" startIcon={<IconPlus />}>
              Add a channel
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
