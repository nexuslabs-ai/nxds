import {
  NXDS_COLOR_APPEARANCE_KEYS,
  type NxdsAppearanceState,
  type NxdsResolvedAppearanceMode,
} from '@nxds/core';

function toLines(
  state: NxdsAppearanceState,
  resolvedMode: NxdsResolvedAppearanceMode,
  deriveColors: boolean
): { key: string; text: string }[] {
  const lines = [
    { key: 'mode', text: `mode: "${state.mode}",` },
    { key: 'resolvedMode', text: `resolvedMode: "${resolvedMode}",` },
    { key: 'brandColor', text: `brandColor: "${state.brandColor}",` },
    { key: 'surfaceTone', text: `surfaceTone: "${state.surfaceTone}",` },
    { key: 'lightContrast', text: `lightContrast: ${state.lightContrast},` },
    { key: 'darkContrast', text: `darkContrast: ${state.darkContrast},` },
    { key: 'uiScale', text: `uiScale: "${state.uiScale}",` },
    { key: 'textSize', text: `textSize: ${state.textSize},` },
    { key: 'density', text: `density: "${state.density}",` },
    { key: 'corners', text: `corners: "${state.corners}",` },
    { key: 'elevation', text: `elevation: "${state.elevation}",` },
    { key: 'stroke', text: `stroke: "${state.stroke}",` },
  ];
  if (deriveColors) return lines;
  const colorKeys: readonly string[] = NXDS_COLOR_APPEARANCE_KEYS;
  return lines.filter((line) => !colorKeys.includes(line.key));
}

export interface NxdsAppearanceConfigPreviewProps {
  state: NxdsAppearanceState;
  resolvedMode: NxdsResolvedAppearanceMode;
  /**
   * `false` leaves out the brand color, surface tone and contrast. They have
   * no effect when the app sets its own colors.
   */
  deriveColors?: boolean;
}

export function NxdsAppearanceConfigPreview({
  state,
  resolvedMode,
  deriveColors = true,
}: NxdsAppearanceConfigPreviewProps) {
  const lines = toLines(state, resolvedMode, deriveColors);

  return (
    <pre className="nx:m-0 nx:overflow-x-auto nx:rounded-lg nx:border-default nx:border-border-default nx:bg-muted nx:p-3 nx:typography-code-block nx:text-muted-foreground">
      <code>
        <div>{`const appearance = {`}</div>
        {lines.map((line) => (
          <div key={line.key}>{`  ${line.text}`}</div>
        ))}
        <div>{`};`}</div>
      </code>
    </pre>
  );
}
