"use client";

import { ToggleButton } from "@mui/material";
import { useState } from "react";
import CheckIcon from "@mui/icons-material/Check";

export default function SetDoneButton() {
  const [selected, setSelected] = useState<boolean>(false);

  return (
    <ToggleButton
      size="small"
      value="check"
      selected={selected}
      onChange={() => setSelected((prevSelected) => !prevSelected)}
      sx={{
        minWidth: 32,
        width: 32,
        height: 32,
        padding: 0,
        borderRadius: "8px",
        "&.Mui-selected": {
          backgroundColor: "#4caf50",
          color: "#fff",
          "&:hover": {
            backgroundColor: "#43a047",
          },
        },
      }}
    >
      <CheckIcon fontSize="small" />
    </ToggleButton>
  );
}