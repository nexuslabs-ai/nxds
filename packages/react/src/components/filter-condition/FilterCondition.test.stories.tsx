import { Canvas, Source, Title } from '@storybook/addon-docs/blocks';
import type { StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import filterConditionMeta, {
  Anatomy,
  LongContent,
} from './FilterCondition.stories';

const anatomySource = `import { FilterCondition, FilterConditionField, FilterConditionSegment, FilterConditionRemove } from '.';

// Connect each callback to your editor or application state.
<FilterCondition>
  <FilterConditionField>Status</FilterConditionField>
  <FilterConditionSegment aria-label="Edit status operator" onClick={openOperator}>is</FilterConditionSegment>
  <FilterConditionSegment aria-label="Edit status value" onClick={openValue}>Paid</FilterConditionSegment>
  <FilterConditionRemove onClick={removeCondition}>Remove status filter</FilterConditionRemove>
</FilterCondition>`;

const meta = {
  ...filterConditionMeta,
  title: 'Tests/FilterCondition',
  parameters: {
    ...filterConditionMeta.parameters,
    docs: {
      ...filterConditionMeta.parameters.docs,
      page: () => (
        <>
          <Title />
          <p>
            The shared parts of an editable condition: field, operator, value
            and removal. ChoiceFilter and NumberRangeFilter use these same parts
            and add working editors. FilterCondition alone does not select
            values or filter data.
          </p>
          <Canvas of={Anatomy} />
          <p>
            One compact size follows nxds density. The field, operator, value
            and remove button share the h-8 height token; there is no size prop.
            Change density in the toolbar to see them adapt together. Inputs
            inside an editor retain their own appropriate control size.
          </p>
          <p>
            Field names identify the condition. The operator and value are
            separate buttons; each opens its own editor. The final button
            removes it. This anatomy example demonstrates button callbacks only.
          </p>
          <Source code={anatomySource} language="tsx" />
          <h2>Use a working block</h2>
          <p>
            Six copyable blocks build on this anatomy. Each adds its own editor
            and decides when a change applies.
          </p>
          <ul>
            <li>
              <a
                href="/?path=/docs/blocks-filtering-choice-filter-choicefilter--docs"
                target="_top"
              >
                ChoiceFilter
              </a>
              : one value from a short list, applied immediately.
            </li>
            <li>
              <a
                href="/?path=/docs/blocks-filtering-multi-choice-filter-multichoicefilter--docs"
                target="_top"
              >
                MultiChoiceFilter
              </a>
              : several values, applied with Apply.
            </li>
            <li>
              <a
                href="/?path=/docs/blocks-filtering-text-filter-textfilter--docs"
                target="_top"
              >
                TextFilter
              </a>
              : text a record contains, starts with or equals.
            </li>
            <li>
              <a
                href="/?path=/docs/blocks-filtering-number-comparison-filter-numbercomparisonfilter--docs"
                target="_top"
              >
                NumberComparisonFilter
              </a>
              : one number compared with a threshold.
            </li>
            <li>
              <a
                href="/?path=/docs/blocks-filtering-number-range-filter-numberrangefilter--docs"
                target="_top"
              >
                NumberRangeFilter
              </a>
              : a number between a minimum and a maximum.
            </li>
            <li>
              <a
                href="/?path=/docs/blocks-filtering-date-range-filter-daterangefilter--docs"
                target="_top"
              >
                DateRangeFilter
              </a>
              : a range of calendar days.
            </li>
          </ul>
          <h2>Compose a custom editor</h2>
          <p>
            Use these parts directly for an editor the blocks do not provide,
            such as Location / within / a distance opening a location-and-radius
            editor. Import the parts from @nxds/react. Supply your own editor,
            controlled values, open state, validation, and focus after removal.
            Use FilterChip when editing happens elsewhere and the chip only
            removes.
          </p>
          <p>
            <a href="/?path=/docs/patterns-filtering--docs" target="_top">
              Compare both approaches in the Filtering pattern
            </a>
          </p>
        </>
      ),
    },
  },
};

export default meta;
type Story = StoryObj<typeof filterConditionMeta>;

export const LongContentFits: Story = {
  ...LongContent,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', {
      name: `Edit Workspace value: ${args.value}`,
    });
    await expect(trigger.scrollWidth).toBeLessThanOrEqual(
      trigger.clientWidth + 1
    );
    const condition = canvas.getByTestId('condition');
    await expect(condition.scrollWidth).toBeLessThanOrEqual(
      condition.clientWidth + 1
    );
  },
};
