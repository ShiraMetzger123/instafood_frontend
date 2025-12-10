import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { SnackbarProvider } from "./components/context/SnackbarContext";
import { ConfirmDialogProvider } from "./components/context/ConfirmDialogContext";
import "./styles/authPages.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <SnackbarProvider>
      <ConfirmDialogProvider>
        <App />
      </ConfirmDialogProvider>
    </SnackbarProvider>
  </React.StrictMode>,
);
