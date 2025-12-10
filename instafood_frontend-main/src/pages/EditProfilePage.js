import React, { useEffect, useState } from "react";
import {
  TextField,
  Button,
  Avatar,
  Box,
  Typography,
  IconButton,
  InputAdornment,
  Snackbar,
  Alert,
  Card,
  CardContent,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  ArrowBackIosNew,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import PageLoading from "../components/PageLoading";
import { useSnackbar } from "../components/context/SnackbarContext";

function EditProfilePage() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    profileImage: null,
  });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [passwordConfirmed, setPasswordConfirmed] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { showSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("http://localhost:5000/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setUser(data);
        setForm({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          phone: data.phone || "",
          profileImage: null,
        });
        setPreviewUrl(data.profileImage || null);
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to fetch user", err);
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [token]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, profileImage: file });
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleVerifyPassword = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/users/verify-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ password: currentPassword }),
        },
      );
      const data = await res.json();
      if (res.ok) {
        setPasswordConfirmed(true);

        showSnackbar({
          message: "Password verified successfully ",
          severity: "success",
        });
      } else {
        showSnackbar({
          message: data.message || "Incorrect password ",
          severity: "error",
          requireAction: true,
        });
      }
    } catch (err) {
      showSnackbar({
        message: "Server error during password verification ",
        severity: "error",
        requireAction: true,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("firstName", form.firstName);
      formData.append("lastName", form.lastName);
      formData.append("phone", form.phone);
      if (form.profileImage) {
        formData.append("image", form.profileImage);
      }

      const uploadRes = await fetch(
        "http://localhost:5000/api/upload?folder=profile_pictures",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        },
      );
      const uploadData = await uploadRes.json();

      const profileUpdate = {
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        profileImage: uploadData.imageUrl || user.profileImage,
      };

      const res = await fetch("http://localhost:5000/api/users/edit", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileUpdate),
      });

      if (!res.ok) throw new Error();

      showSnackbar({
        message: "Profile updated successfully ",
        severity: "success",
      });
      localStorage.setItem("profileImage", uploadData.imageUrl);
      localStorage.setItem("fullName", `${form.firstName} ${form.lastName}`);
      setTimeout(() => navigate("/profile"), 1000);
    } catch {
      showSnackbar({
        message: "Error updating profile ",
        severity: "error",
      });
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword.length < 6) {
      showSnackbar({
        message: "Password must be at least 6 characters ",
        severity: "error",
        requireAction: true,
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      showSnackbar({
        message: "Passwords don't match ",
        severity: "error",
        requireAction: true,
      });
      return;
    }

    try {
      const res = await fetch(
        "http://localhost:5000/api/users/change-password",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ password: newPassword }),
        },
      );
      if (!res.ok) throw new Error();
      showSnackbar({
        message: "Password changed successfully ",
        severity: "success",
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordConfirmed(false);
    } catch {
      showSnackbar({
        message: "Failed to change password ",
        severity: "error",
        requireAction: true,
      });
    }
  };

  if (isLoading) {
    return <PageLoading />;
  }

  return (
    <Box sx={styles.background}>
      <Box sx={styles.overlay}>
        <Box sx={{ maxWidth: 1200, mx: "auto", p: 2, position: "relative" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              mb: 2,
            }}
          >
            <IconButton
              onClick={() => navigate("/profile")}
              sx={{
                backgroundColor: "white",
                borderRadius: "50%",
                boxShadow: 2,
                "&:hover": {
                  backgroundColor: "#ffe3d2",
                },
                mr: 2,
              }}
            >
              <ArrowBackIosNew
                sx={{ transform: "rotate(180deg)", color: "#666" }}
              />
            </IconButton>

            <Typography variant="h5" fontWeight="bold" color="#ff6600">
              Edit Profile
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 4, width: "100%" }}>
            <Card sx={{ flex: 1, mb: 3 }}>
              <CardContent sx={{ textAlign: "center" }}>
                <Box
                  sx={{
                    mb: 3,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    id="profile-img"
                    hidden
                  />
                  <label htmlFor="profile-img" style={{ cursor: "pointer" }}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center",
                      }}
                    >
                      <Avatar
                        src={
                          previewUrl
                            ? previewUrl.startsWith("blob:")
                              ? previewUrl
                              : previewUrl.startsWith("http")
                                ? previewUrl
                                : `http://localhost:5000${previewUrl}`
                            : "/default-user.png"
                        }
                        sx={{
                          width: 120,
                          height: 120,
                          mb: 1,
                          border: "3px solid #ff6600",
                        }}
                      />

                      <Typography variant="caption" color="primary">
                        Click to change profile picture
                      </Typography>
                    </Box>
                  </label>
                </Box>

                <form onSubmit={handleSubmit}>
                  <TextField
                    name="firstName"
                    label="First Name"
                    value={form.firstName}
                    onChange={handleChange}
                    fullWidth
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    name="lastName"
                    label="Last Name"
                    value={form.lastName}
                    onChange={handleChange}
                    fullWidth
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    name="phone"
                    label="Phone"
                    value={form.phone}
                    onChange={handleChange}
                    fullWidth
                    sx={{ mb: 3 }}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    sx={{
                      backgroundColor: "#ff6600",
                      "&:hover": { backgroundColor: "#e65c00" },
                      mb: 4,
                    }}
                  >
                    Save Changes
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card sx={{ flex: 1, mb: 3 }}>
              <CardContent>
                <Typography variant="h6" mb={2}>
                  Change Password
                </Typography>

                {!passwordConfirmed ? (
                  <>
                    <TextField
                      label="Current Password"
                      type={showPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      fullWidth
                      sx={{ mb: 2 }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={handleVerifyPassword}
                      sx={{
                        backgroundColor: "#ff6600",
                        color: "#fff",
                        "&:hover": { backgroundColor: "#e65c00" },
                      }}
                    >
                      Verify Password
                    </Button>
                  </>
                ) : (
                  <>
                    <TextField
                      label="New Password (min. 6 characters)"
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      fullWidth
                      sx={{ mb: 2 }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    <TextField
                      label="Confirm Password"
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      fullWidth
                      sx={{ mb: 2 }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />

                    <Box sx={{ display: "flex", gap: 2 }}>
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={() => {
                          setPasswordConfirmed(false);
                          setCurrentPassword("");
                        }}
                        sx={{
                          backgroundColor: "#ff6600",
                          color: "#fff",
                          "&:hover": { backgroundColor: "#e65c00" },
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={handlePasswordChange}
                        sx={{
                          backgroundColor: "#ff6600",
                          "&:hover": { backgroundColor: "#e65c00" },
                        }}
                      >
                        Change Password
                      </Button>
                    </Box>
                  </>
                )}
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default EditProfilePage;

const styles = {
  background: {
    backgroundImage: 'url("/background.jpg")',
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    backgroundPosition: "center",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    width: "100%",
    minHeight: "100vh",
    paddingTop: "30px",
    paddingBottom: "30px",
  },
  cardWrapper: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    height: "100%",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    "&:hover": {
      transform: "translateY(-6px)",
      boxShadow: "0 12px 24px rgba(0,0,0,0.1)",
    },
  },
};
