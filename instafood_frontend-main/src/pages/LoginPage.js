import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Snackbar,
  Alert,
  IconButton,
  InputAdornment,
  Grid,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { auth, googleProvider } from "../firebase";
import { signInWithPopup } from "firebase/auth";
import { useSnackbar } from "../components/context/SnackbarContext";

function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const { showSnackbar } = useSnackbar();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("fullName", data.fullName);
        localStorage.setItem("profileImage", data.profileImage || "");
        showSnackbar({
          open: true,
          message: "Login successful! Redirecting...",
          severity: "success",
        });

        setTimeout(() => navigate("/profile"), 1500);
      } else {
        showSnackbar({
          open: true,
          message: `Incorrect email or password: ${data.message}`,
          severity: "error",
          requireAction: true,
        });
      }
    } catch (error) {
      showSnackbar({
        open: true,
        message: "Failed to connect to server.",
        severity: "error",
        requireAction: true,
      });
    }
  };

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const fullName = user.displayName || "";
      const email = user.email || "";
      const profileImage = user.photoURL || "";

      const [firstName, lastName] = fullName.split(" ");
      const response = await fetch(
        "http://localhost:5000/api/auth/google-login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("fullName", data.fullName);
        localStorage.setItem("profileImage", data.profileImage || "");
        showSnackbar({
          open: true,
          message: "Login with Google successful! Redirecting...",
          severity: "success",
        });

        setTimeout(() => navigate("/profile"), 1500);
      } else if (response.status === 404) {
        await registerGoogleUser(
          email,
          firstName,
          lastName,
          profileImage,
          user,
        );
      } else {
        throw new Error("Unknown error during Google login");
      }
    } catch (error) {
      console.error("Google login error:", error);
      showSnackbar({
        open: true,
        message: "Google sign-in failed",
        severity: "error",
        requireAction: true,
      });
    }
  };

  const registerGoogleUser = async (
    email,
    firstName,
    lastName,
    profileImage,
    user,
  ) => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: email.split("@")[0],
          firstName: firstName || "First",
          lastName: lastName || "Last",
          email,
          password: user.uid,
          phone: `google-${user.uid}`,
          profileImage,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("fullName", data.fullName);
        localStorage.setItem("profileImage", data.profileImage || "");
        showSnackbar({
          open: true,
          message: "Registered with Google! Redirecting...",
          severity: "success",
        });

        setTimeout(() => navigate("/profile"), 1500);
      } else {
        showSnackbar({
          open: true,
          message: `Registration failed: ${data.message}`,
          severity: "error",
          requireAction: true,
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      showSnackbar({
        open: true,
        message: "Registration failed",
        severity: "error",
        requireAction: true,
      });
    }
  };

  return (
    <Grid container sx={{ minHeight: "100vh" }}>
      <Grid
        item
        xs={12}
        md={5}
        sx={{
          backgroundColor: "#fff",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          px: 4,
          py: 8,
        }}
      >
        <Box sx={{ maxWidth: 420, textAlign: "center" }}>
          <img
            src="/instaFood_small_logo.png"
            alt="instaFood Logo"
            width={50}
            style={{ marginBottom: 20 }}
          />
          <Typography
            variant="h4"
            fontWeight="bold"
            gutterBottom
            sx={{ color: "#ff6600" }}
          >
            Welcome to instaFood
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Save recipes, explore tastes, and organize your cooking life—all in
            one place.
          </Typography>
          <img
            src="/authpic1.png"
            alt="Illustration"
            style={{ width: "100%", margin: "40px 0" }}
          />
        </Box>
      </Grid>

      <Grid
        item
        xs={12}
        md={7}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#fafafa",
          p: 4,
        }}
      >
        <Container maxWidth="sm">
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Sign in to your account
          </Typography>
          <Typography variant="body2" sx={{ mb: 3 }}>
            Don’t have an account?{" "}
            <Link
              to="/register"
              style={{
                color: "#ff6600",
                textDecoration: "none",
                fontWeight: "bold",
              }}
            >
              Get started with instaFood
            </Link>
          </Typography>

          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={loginWithGoogle}
            sx={{
              fontWeight: "bold",
              bgcolor: "#4285F4",
              "&:hover": { bgcolor: "#357ae8" },
              mb: 2,
            }}
          >
            Sign in with Google
          </Button>

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <TextField
              label="Email Address"
              name="email"
              type="email"
              fullWidth
              required
              variant="outlined"
              value={formData.email}
              onChange={handleChange}
            />
            <TextField
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              fullWidth
              variant="outlined"
              value={formData.password}
              onChange={handleChange}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleTogglePassword} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box textAlign="right">
              <Link
                to="/forgot-password"
                style={{
                  color: "#ff6600",
                  fontSize: "0.9rem",
                  textDecoration: "none",
                  fontWeight: "bold",
                }}
              >
                Forgot Password?
              </Link>
            </Box>
            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              sx={{
                fontWeight: "bold",
                bgcolor: "#ff6600",
                "&:hover": { bgcolor: "#e65c00" },
              }}
            >
              Sign in
            </Button>
          </Box>
        </Container>
      </Grid>
    </Grid>
  );
}

export default LoginPage;
