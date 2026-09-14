"use client";

import { Button, CircularProgress, IconButton, Tooltip } from "@mui/material";
import { useEffect, useState } from "react";
import LoopIcon from "@mui/icons-material/Loop";

export default function LoadingIconButton() {
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timeout);
  });
  return (
    <Button
      variant="contained"
      disabled={loading}
      onClick={() => setLoading(true)}
      startIcon={
        loading ? <CircularProgress size={18} color="inherit" /> : <LoopIcon />
      }
      sx={{
        borderRadius: 3,
        textTransform: "none",
        background: "linear-gradient(135deg, #1976d2, #42a5f5)",
        px: 3,
        py: 1.2,
        boxShadow: "0 4px 14px rgba(25, 118, 210, 0.3)",
        "&:hover": {
          boxShadow: "0 6px 20px rgba(25, 118, 210, 0.5)",
        },
      }}
    >
      {loading ? "Загрузка..." : "Обновить"}
    </Button>
  );
}
