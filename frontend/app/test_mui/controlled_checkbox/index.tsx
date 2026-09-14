'use client';
import Checkbox, { CheckboxProps } from '@mui/material/Checkbox';
import { ChangeEvent, useState } from 'react';

export default function ControlledCheckbox({
  children,
  checked: checkedProp,
  defaultChecked,
  onChange,
  ...props
}: React.PropsWithChildren<CheckboxProps>) {
  const [internalChecked, setInternalChecked] = useState(defaultChecked ?? false);

  // Support both controlled (from parent) and uncontrolled usage
  const isControlled = checkedProp !== undefined;
  const checked = isControlled ? checkedProp : internalChecked;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) {
      setInternalChecked(event.target.checked);
    }
    onChange?.(event, event.target.checked);
  };

  return (
    <Checkbox
      {...props}
      checked={checked}
      onChange={handleChange}
      slotProps={{
        input: { 'aria-label': 'controlled' },
        ...props.slotProps,
      }}
    />
  );
}