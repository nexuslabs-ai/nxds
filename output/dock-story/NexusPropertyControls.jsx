import { useId } from 'react';

import { NxdsAppearanceColorField } from '@nexus-dock/color-field';
import { PropertySlider } from '@nexus-dock/property-slider';
import {
  BASE_TONE_OPTIONS,
  BRAND_COLOR_PRESETS,
  CORNER_OPTIONS,
  DEFAULT_ICON_LIBRARY,
  DEFAULT_NXDS_APPEARANCE,
  DENSITY_OPTIONS,
  ELEVATION_OPTIONS,
  FONT_OPTIONS,
  ICON_LIBRARY_OPTIONS,
  shuffleNxdsAppearance,
  STROKE_OPTIONS,
} from '@nxds/core';
import {
  Button,
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  NativeSelect,
  Switch,
} from '@nxds/react';

import { setIconLibrary, useIconLibrary } from './icon-library';

const rowClass =
  'nx:min-h-10 nx:flex-row nx:items-center nx:gap-2 nx:rounded-md nx:bg-container nx:px-3 nx:py-1';
const labelClass =
  'nx:min-w-0 nx:flex-1 nx:typography-label-small nx:text-muted-foreground';
const descriptionClass = 'nx:typography-body-small';

const TEXT_FONTS = FONT_OPTIONS.filter((font) => font.category !== 'mono').map(
  ({ family, label }) => ({ value: family, label })
);
const UI_FONTS = [
  { value: DEFAULT_NXDS_APPEARANCE.prefs.uiFont, label: 'System' },
  ...TEXT_FONTS,
];
const HEADING_FONTS = [{ value: '', label: 'Same as UI font' }, ...TEXT_FONTS];

// A font stack set some other way, like the page's own DM Sans, shows as Custom.
function withCustom(options, value) {
  if (options.some((option) => option.value === value)) return options;
  return [...options, { value, label: 'Custom' }];
}

function AppearanceSelect({ label, value, options, onChange, description }) {
  const id = useId();
  return (
    <div className="nx:flex nx:min-w-0 nx:flex-col nx:gap-2">
      <Field orientation="horizontal" className={rowClass}>
        <div className="nx:shrink-0">
          <FieldLabel htmlFor={id} className={labelClass}>
            {label}
          </FieldLabel>
        </div>
        <div className="nx:min-w-0 nx:flex-1">
          <NativeSelect
            size="sm"
            variant="borderless"
            id={id}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            aria-describedby={description ? `${id}-help` : undefined}
            className="nx:bg-transparent nx:autofill-bg-transparent nx:pl-0 nx:text-right nx:typography-label-small nx:enabled:hover:bg-transparent nx:enabled:hover:autofill-bg-transparent"
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </NativeSelect>
        </div>
      </Field>
      {description && (
        <FieldDescription id={`${id}-help`} className={descriptionClass}>
          {description}
        </FieldDescription>
      )}
    </div>
  );
}

function AppearanceRange({ onChange, ...props }) {
  return <PropertySlider {...props} onValueChange={onChange} />;
}

export function NexusPropertyControls({
  tool,
  appearance,
  onChange,
  onReset,
  scopeDescription = 'Applies to the component preview.',
  surfaceToneControl,
  cornersControl,
}) {
  const id = useId();
  const iconLibrary = useIconLibrary();
  const contrastKey =
    appearance.mode === 'dark' ? 'darkContrast' : 'lightContrast';
  function update(name, value) {
    onChange({ ...appearance, [name]: value });
  }
  function updatePrefs(name, value) {
    onChange({ ...appearance, prefs: { ...appearance.prefs, [name]: value } });
  }
  function shuffle() {
    onChange(shuffleNxdsAppearance(appearance));
    const index = Math.floor(Math.random() * ICON_LIBRARY_OPTIONS.length);
    setIconLibrary(ICON_LIBRARY_OPTIONS[index].value);
  }
  function reset() {
    onReset();
    setIconLibrary(DEFAULT_ICON_LIBRARY);
  }
  return (
    <div
      data-slot="nexus-property-controls"
      className="nx:min-w-0 nx:overflow-y-auto nx:p-0.5"
    >
      <FieldGroup className="nx:gap-2">
        {tool === 'Theme' && (
          <>
            <Field orientation="horizontal" className={rowClass}>
              <FieldLabel htmlFor={id} className={labelClass}>
                Dark mode
              </FieldLabel>
              <Switch
                id={id}
                checked={appearance.mode === 'dark'}
                onCheckedChange={(checked) =>
                  update('mode', checked ? 'dark' : 'light')
                }
              />
            </Field>
            <FieldDescription className={descriptionClass}>
              {scopeDescription}
            </FieldDescription>
            <AppearanceRange
              label="Contrast"
              value={appearance[contrastKey]}
              min={0}
              max={100}
              onChange={(value) => update(contrastKey, value)}
            />
          </>
        )}
        {tool === 'Colors' && (
          <>
            <AppearanceSelect
              label="Brand preset"
              value={appearance.brandColor}
              options={[
                ...BRAND_COLOR_PRESETS.map((preset) => ({
                  value: preset.color,
                  label: preset.label,
                })),
                ...(!BRAND_COLOR_PRESETS.some(
                  (preset) => preset.color === appearance.brandColor
                )
                  ? [{ value: appearance.brandColor, label: 'Custom' }]
                  : []),
              ]}
              onChange={(value) => update('brandColor', value)}
            />
            <Field orientation="horizontal" className={rowClass}>
              <FieldLabel asChild className={labelClass}>
                <span>Brand color</span>
              </FieldLabel>
              <NxdsAppearanceColorField
                variant="compact"
                label="Brand color"
                value={appearance.brandColor}
                onChange={(value) => update('brandColor', value)}
              />
            </Field>
            {surfaceToneControl ?? (
              <AppearanceSelect
                label="Surface tone"
                value={appearance.surfaceTone}
                options={BASE_TONE_OPTIONS}
                onChange={(value) => update('surfaceTone', value)}
              />
            )}
          </>
        )}
        {tool === 'Typography' && (
          <>
            <AppearanceSelect
              label="Font"
              value={appearance.prefs.uiFont}
              options={withCustom(UI_FONTS, appearance.prefs.uiFont)}
              onChange={(value) => updatePrefs('uiFont', value)}
            />
            <AppearanceSelect
              label="Heading font"
              value={appearance.prefs.headingFont ?? ''}
              options={withCustom(
                HEADING_FONTS,
                appearance.prefs.headingFont ?? ''
              )}
              onChange={(value) => updatePrefs('headingFont', value || null)}
            />
            <AppearanceSelect
              label="Icons"
              value={iconLibrary}
              options={ICON_LIBRARY_OPTIONS}
              onChange={setIconLibrary}
            />
            <AppearanceRange
              label="UI size"
              value={appearance.prefs.uiFontSize}
              min={12}
              max={20}
              unit="px"
              onChange={(value) => updatePrefs('uiFontSize', value)}
            />
          </>
        )}
        {tool === 'Spacing' && (
          <AppearanceSelect
            label="Density"
            value={appearance.density}
            options={DENSITY_OPTIONS}
            onChange={(value) => update('density', value)}
            description="Changes component spacing. The grid stays in place."
          />
        )}
        {tool === 'Radius' &&
          (cornersControl ?? (
            <AppearanceSelect
              label="Corners"
              value={appearance.corners}
              options={CORNER_OPTIONS}
              onChange={(value) => update('corners', value)}
            />
          ))}
        {tool === 'More' && (
          <>
            <AppearanceSelect
              label="Elevation"
              value={appearance.elevation}
              options={ELEVATION_OPTIONS}
              onChange={(value) => update('elevation', value)}
            />
            <AppearanceSelect
              label="Stroke"
              value={appearance.stroke}
              options={STROKE_OPTIONS}
              onChange={(value) => update('stroke', value)}
            />
          </>
        )}
        <div className="nx:flex nx:flex-wrap nx:gap-2">
          <Button variant="outline" size="sm" onClick={shuffle}>
            Shuffle
          </Button>
          <Button variant="ghost" size="sm" onClick={reset}>
            Reset preview
          </Button>
        </div>
      </FieldGroup>
    </div>
  );
}
