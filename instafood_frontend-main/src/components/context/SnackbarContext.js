import React, { createContext, useState, useContext } from "react";
import { Snackbar, Alert } from "@mui/material";

const SnackbarContext = createContext();

export function useSnackbar() {
  return useContext(SnackbarContext);
}

export function SnackbarProvider({ children }) {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
    requireAction: false,
  });

  const showSnackbar = ({
    message,
    severity = "info",
    requireAction = false,
  }) => {
    setSnackbar({ open: true, message, severity, requireAction });
  };

  const handleClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={snackbar.requireAction ? null : 3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={snackbar.requireAction ? handleClose : undefined}
          variant="outlined"
          sx={{
            width: "100%",
            backgroundColor: "#fff",
            border: "2px solid #ff6600",
            color: "#ff6600",
            fontWeight: "bold",
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
}
