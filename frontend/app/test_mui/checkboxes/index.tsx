import { Checkbox } from "@mui/material";
import { pink } from "@mui/material/colors";
import ControlledCheckbox from '../controlled_checkbox';

export default function Checkboxes() {
  const label = { slotProps: { input: { "aria-label": "Checkbox demo" } } };
  return (
    <>
      <ControlledCheckbox {...label} defaultChecked />
      <ControlledCheckbox {...label} defaultChecked color="secondary" />
      <ControlledCheckbox {...label} defaultChecked color="success" />
      <ControlledCheckbox {...label} defaultChecked color="default" />
      <ControlledCheckbox
        {...label}
        defaultChecked
        sx={{
          color: pink[800],
          "&.Mui-checked": {
            color: pink[600],
          },
        }}
      />
    </>
  );
}
