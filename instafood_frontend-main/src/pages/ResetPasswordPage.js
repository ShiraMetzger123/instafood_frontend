import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Typography,
  Button,
} from "@mui/material";
import { useSnackbar } from "../components/context/SnackbarContext";

function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      showSnackbar({
        message: "Passwords do not match",
        severity: "error",
        requireAction: true,
      });
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/auth/reset-password/${token}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        showSnackbar({
          message: "Password reset successfully!",
          severity: "success",
        });
        setTimeout(() => {
          navigate("/login");
        }, 2500);
      } else {
        showSnackbar({
          message: data.message || "Reset failed",
          severity: "error",
          requireAction: true,
        });
      }
    } catch (error) {
      console.error("Reset error:", error);
      showSnackbar({
        message: "An error occurred",
        severity: "error",
        requireAction: true,
      });
    }
  };

  return (
    <Box sx={styles.background}>
      <Box sx={styles.overlay}>
        <Box sx={styles.wrapper}>
          <Card sx={styles.card}>
            <CardContent>
              <Box sx={{ textAlign: "center" }}>
                <img
                  src="/instaFood_small_logo.png"
                  alt="InstaFood Logo"
                  style={styles.logo}
                />
                <Typography variant="h5" sx={styles.title}>
                  Reset Password
                </Typography>
              </Box>
              <form onSubmit={handleSubmit} style={styles.form}>
                <TextField
                  type="password"
                  label="New Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  fullWidth
                  required
                  sx={styles.input}
                />
                <TextField
                  type="password"
                  label="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  fullWidth
                  required
                  sx={styles.input}
                />
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={styles.button}
                >
                  Reset Password
                </Button>
              </form>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}

export default ResetPasswordPage;

const styles = {
  background: {
    backgroundImage: 'url("/background.jpg")',
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    backgroundPosition: "center",
    minHeight: "100vh",
  },
  overlay: {
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "start",
    paddingTop: "30px",
  },
  wrapper: {
    width: "100%",
    maxWidth: "500px",
    padding: "0 20px",
  },
  card: {
    padding: 3,
    borderRadius: 3,
    backgroundColor: "#fafafa",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  },
  logo: {
    width: "70px",
    height: "70px",
    marginBottom: "16px",
  },
  title: {
    fontWeight: "bold",
    color: "#ff6600",
    marginBottom: "24px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  input: {
    borderRadius: "8px",
  },
  button: {
    backgroundColor: "#ff6600",
    color: "white",
    fontWeight: "bold",
    borderRadius: "8px",
    "&:hover": {
      backgroundColor: "#e05500",
    },
  },
};
