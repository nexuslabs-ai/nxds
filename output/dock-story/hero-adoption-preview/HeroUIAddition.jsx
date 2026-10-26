import { ListBox, Select } from '@heroui/react';

import '@heroui/styles/css';

const roles = [
  ['viewer', 'Viewer'],
  ['editor', 'Editor'],
  ['admin', 'Admin'],
];

export function Addition({ role, onRoleChange }) {
  return (
    <Select
      aria-label="Default member role"
      selectedKey={role}
      onSelectionChange={(key) => onRoleChange(String(key))}
      fullWidth
    >
      <Select.Trigger>
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover>
        <ListBox>
          {roles.map(([id, label]) => (
            <ListBox.Item key={id} id={id} textValue={label}>
              {label}
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
}
