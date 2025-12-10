import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Typography,
  Button,
} from "@mui/material";
import { useSnackbar } from "../components/context/SnackbarContext";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const { showSnackbar } = useSnackbar();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/api/auth/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        },
      );

      const data = await res.json();

      if (res.ok) {
        showSnackbar({ message: data.message, severity: "success" });
      } else {
        showSnackbar({
          message: data.message,
          severity: "error",
          requireAction: true,
        });
      }
    } catch (err) {
      console.error("Forgot password error", err);
      showSnackbar({
        message: "Server error",
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
                  Forgot Password
                </Typography>
              </Box>
              <form onSubmit={handleSubmit} style={styles.form}>
                <TextField
                  type="email"
                  label="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  Send Reset Link
                </Button>
              </form>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}

export default ForgotPasswordPage;

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
