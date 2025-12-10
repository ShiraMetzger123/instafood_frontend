import React, { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Typography,
  Tabs,
  Tab,
  Button,
  Modal,
  Grid,
  Snackbar,
  Alert,
  Card,
  CardContent,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import RecipeCard from "../components/RecipeCard";
import UploadRecipePage from "./UploadRecipePage";
import PageLoading from "../components/PageLoading";

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [myRecipes, setMyRecipes] = useState([]);
  const [likedRecipes, setLikedRecipes] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [open, setOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "error",
  });

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Unauthorized or failed to fetch user");
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error(err);
        setSnackbar({
          open: true,
          message: "Failed to load profile.",
          severity: "error",
        });
      }
    };

    const fetchMyRecipes = async () => {
      try {
        const res = await fetch(
          "http://localhost:5000/api/recipes/my-recipes",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const data = await res.json();
        setMyRecipes(data);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchLiked = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/users/liked", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setLikedRecipes(data.recipes || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchProfile();
    fetchMyRecipes();
    fetchLiked();
  }, [token, navigate]);

  const handleRecipeUpload = (newRecipe) => {
    setMyRecipes([newRecipe, ...myRecipes]);
    setSelectedTab(0);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (!user) {
    return <PageLoading />;
  }

  return (
    <Box sx={styles.background}>
      <Box sx={styles.overlay}>
        <Box sx={{ maxWidth: 1100, margin: "auto", p: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  mb: 3,
                  padding: 3,
                  boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
                  borderRadius: 2,
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 3,
                      mb: 3,
                    }}
                  >
                    <Avatar
                      src={
                        user.profileImage?.startsWith("/uploads")
                          ? `http://localhost:5000${user.profileImage}`
                          : user.profileImage
                      }
                      alt="Profile"
                      sx={{
                        width: 120,
                        height: 120,
                        borderRadius: "50%",
                        border: "5px solid #ff6600",
                        transition: "transform 0.3s ease",
                        "&:hover": {
                          transform: "scale(1.1)",
                        },
                      }}
                    />

                    <Box sx={{ textAlign: "center" }}>
                      <Typography
                        variant="h5"
                        fontWeight="700"
                        color="primary"
                        sx={{ mb: 1 }}
                      >
                        {`${user.firstName} ${user.lastName}` ||
                          "Full Name Not Available"}
                      </Typography>
                      <Typography
                        variant="subtitle1"
                        fontWeight="500"
                        color="secondary"
                        sx={{ mb: 1 }}
                      >
                        @{user.username || "username"}
                      </Typography>
                      <Typography color="text.secondary" sx={{ mb: 2 }}>
                        {user.email}
                      </Typography>

                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          gap: 4,
                          mt: 2,
                        }}
                      >
                        <Box sx={{ textAlign: "center" }}>
                          <Typography
                            fontWeight="700"
                            color="text.primary"
                            sx={{ fontSize: 18 }}
                          >
                            {myRecipes.length}
                          </Typography>
                          <Typography fontSize={14} color="text.secondary">
                            Recipes
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: "center" }}>
                          <Typography
                            fontWeight="700"
                            color="text.primary"
                            sx={{ fontSize: 18 }}
                          >
                            {likedRecipes.length}
                          </Typography>
                          <Typography fontSize={14} color="text.secondary">
                            Liked
                          </Typography>
                        </Box>
                      </Box>

                      <Button
                        onClick={() => navigate("/edit-profile")}
                        size="medium"
                        sx={{
                          mt: 3,
                          textTransform: "none",
                          backgroundColor: "#ff6600",
                          color: "white",
                          borderRadius: 2,
                          padding: "5px 30px",
                          fontWeight: "bold",
                          "&:hover": {
                            backgroundColor: "#e65c00",
                            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
                          },
                        }}
                        variant="contained"
                      >
                        Edit Profile
                      </Button>

                      <Box display="flex" justifyContent="center" mt={3}>
                        <Button
                          variant="contained"
                          onClick={() => setOpen(true)}
                          sx={{
                            backgroundColor: "#ff6600",
                            color: "white",
                            textTransform: "none",
                            padding: "5px 30px",
                            borderRadius: "8px",
                            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                            fontWeight: "600",
                            fontSize: "16px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            "&:hover": {
                              backgroundColor: "#e65c00",
                              boxShadow: "0 6px 12px rgba(0, 0, 0, 0.15)",
                              transform: "translateY(-2px)",
                            },
                            "&:active": {
                              backgroundColor: "#cc5200",
                              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                              transform: "translateY(0)",
                            },
                          }}
                        >
                          Upload Recipe{" "}
                          <span
                            role="img"
                            aria-label="camera"
                            style={{ marginLeft: "8px" }}
                          >
                            📸
                          </span>
                        </Button>
                      </Box>

                      <Modal open={open} onClose={() => setOpen(false)}>
                        <Box
                          sx={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            bgcolor: "white",
                            width: "55%",
                            maxHeight: "80vh",
                            overflowY: "auto",
                          }}
                        >
                          <UploadRecipePage
                            open={open}
                            onClose={() => setOpen(false)}
                            onRecipeUpload={handleRecipeUpload}
                          />
                        </Box>
                      </Modal>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={8}>
              <Tabs
                value={selectedTab}
                onChange={(e, newVal) => setSelectedTab(newVal)}
                centered
                TabIndicatorProps={{
                  style: {
                    backgroundColor: "#ff6600",
                    height: 3,
                    borderRadius: "2px",
                  },
                }}
                textColor="inherit"
                sx={{
                  borderBottom: "1px solid #ddd",
                  paddingBottom: 1,
                }}
              >
                <Tab
                  label="My Recipes"
                  sx={{
                    color: selectedTab === 0 ? "#ff6600" : "gray",
                    fontWeight: selectedTab === 0 ? "bold" : "normal",
                    textTransform: "none",
                    fontSize: "16px",
                    transition: "color 0.3s, font-weight 0.3s",
                    "&:hover": {
                      color: "#ff6600",
                      fontWeight: "bold",
                    },
                  }}
                />
                <Tab
                  label="Liked Recipes"
                  sx={{
                    color: selectedTab === 1 ? "#ff6600" : "gray",
                    fontWeight: selectedTab === 1 ? "bold" : "normal",
                    textTransform: "none",
                    fontSize: "16px",
                    transition: "color 0.3s, font-weight 0.3s",
                    "&:hover": {
                      color: "#ff6600",
                      fontWeight: "bold",
                    },
                  }}
                />
              </Tabs>
              <Card
                sx={{
                  mt: 3,
                  padding: 3,
                  boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
                  borderRadius: 2,
                }}
              >
                <Grid container spacing={2}>
                  {selectedTab === 0 ? (
                    myRecipes.length > 0 ? (
                      myRecipes.map((r) => (
                        <Grid
                          item
                          xs={12}
                          sm={6}
                          md={6}
                          key={r._id}
                          sx={{ padding: 3 }}
                        >
                          <RecipeCard
                            recipe={r}
                            uploader={user.username || user.email}
                          />
                        </Grid>
                      ))
                    ) : (
                      <Typography align="center" mt={2}>
                        No recipes yet.
                      </Typography>
                    )
                  ) : likedRecipes.length > 0 ? (
                    likedRecipes.map((r) => (
                      <Grid
                        item
                        xs={12}
                        sm={6}
                        md={6}
                        key={r._id}
                        sx={{ padding: 3 }}
                      >
                        <RecipeCard
                          recipe={r}
                          uploader={r.user?.username || r.username || "Unknown"}
                        />
                      </Grid>
                    ))
                  ) : (
                    <Typography align="center" mt={2}>
                      No liked recipes yet.
                    </Typography>
                  )}
                </Grid>
              </Card>
            </Grid>
          </Grid>

          <Snackbar
            open={snackbar.open}
            autoHideDuration={4000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
          >
            <Alert
              onClose={handleCloseSnackbar}
              severity={snackbar.severity}
              sx={{
                bgcolor: "white",
                color: "#ff6600",
                border: "1px solid #ff6600",
                fontWeight: "bold",
                width: "100%",
              }}
              variant="outlined"
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Box>
      </Box>
    </Box>
  );
}

export default ProfilePage;

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
};
