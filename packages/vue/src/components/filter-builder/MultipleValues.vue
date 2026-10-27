<script setup lang="ts">
import { PopoverRoot, PopoverTrigger } from 'reka-ui';
import { computed, ref, useId } from 'vue';

import type { FilterField } from '../../lib/filter-model';
import { IconChevronDown } from '../../lib/icons';
import { Button } from '../button';
import { Checkbox } from '../checkbox';
import { ChoiceRow } from '../choice-row';
import { Input } from '../input';
import { PopoverContent } from '../popover';

const props = defineProps<{
  field: Extract<FilterField, { type: 'choice' }>;
  value: string[];
  disabled?: boolean;
  invalid?: boolean;
  describedBy?: string;
}>();
const emit = defineEmits<{ 'value-change': [value: string[]] }>();

const id = useId();
const search = ref('');
const options = computed(() =>
  props.field.options.filter((option) =>
    option.label.toLocaleLowerCase().includes(search.value.toLocaleLowerCase())
  )
);

function toggle(option: string) {
  emit(
    'value-change',
    props.value.includes(option)
      ? props.value.filter((item) => item !== option)
      : [...props.value, option]
  );
}

const summary = computed(() =>
  props.value
    .map(
      (item) =>
        props.field.options.find((option) => option.value === item)?.label ??
        item
    )
    .join(', ')
);
</script>

<template>
  <PopoverRoot @update:open="search = ''">
    <PopoverTrigger as-child>
      <Button
        size="sm"
        variant="outline"
        :disabled="disabled"
        :aria-label="`${field.label} values`"
        :aria-invalid="invalid"
        :aria-describedby="describedBy"
        class="nx:h-(--nx-spacing-8) nx:w-full nx:min-w-0 nx:justify-between"
      >
        <span class="nx:truncate">{{ summary || 'Choose values…' }}</span>
        <IconChevronDown aria-hidden="true" />
      </Button>
    </PopoverTrigger>
    <PopoverContent
      align="start"
      :aria-label="`${field.label} values`"
      class="nx:w-64 nx:max-w-(--reka-popover-content-available-width) nx:overflow-hidden nx:p-0"
    >
      <div class="nx:border-b nx:border-border-default nx:p-2">
        <Input
          v-model="search"
          size="sm"
          :aria-label="`Search ${field.label} options`"
          placeholder="Search options…"
          :disabled="disabled"
        />
      </div>
      <div class="nx:max-h-48 nx:overflow-y-auto nx:p-1">
        <ChoiceRow
          v-for="(option, index) in options"
          :key="option.value"
          :for="`${id}-${index}`"
          class="nx:not-has-[:disabled]:hover:bg-popover-hover"
        >
          <Checkbox
            :id="`${id}-${index}`"
            :model-value="value.includes(option.value)"
            :disabled="disabled"
            @update:model-value="toggle(option.value)"
          />
          <span class="nx:min-w-0 nx:break-words">{{ option.label }}</span>
        </ChoiceRow>
        <p
          v-if="!options.length"
          class="nx:m-0 nx:p-2 nx:typography-body-small nx:text-muted-foreground"
        >
          No options found.
        </p>
      </div>
    </PopoverContent>
  </PopoverRoot>
</template>
