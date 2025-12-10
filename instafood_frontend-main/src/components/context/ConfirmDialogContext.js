import React, { createContext, useContext, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

const ConfirmDialogContext = createContext();

export function useConfirmDialog() {
  return useContext(ConfirmDialogContext);
}

export function ConfirmDialogProvider({ children }) {
  const [dialogConfig, setDialogConfig] = useState({
    open: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  const showConfirmDialog = ({ title, message, onConfirm }) => {
    setDialogConfig({
      open: true,
      title,
      message,
      onConfirm,
    });
  };

  const handleClose = () => {
    setDialogConfig((prev) => ({ ...prev, open: false }));
  };

  const handleConfirm = () => {
    if (dialogConfig.onConfirm) dialogConfig.onConfirm();
    handleClose();
  };

  return (
    <ConfirmDialogContext.Provider value={{ showConfirmDialog }}>
      {children}
      <Dialog open={dialogConfig.open} onClose={handleClose}>
        <DialogTitle>
          <Typography sx={{ color: "#ff6600", fontWeight: "bold" }}>
            {dialogConfig.title}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography>{dialogConfig.message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} sx={{ color: "#555" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            sx={{ backgroundColor: "#ff6600" }}
            onClick={handleConfirm}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </ConfirmDialogContext.Provider>
  );
}
