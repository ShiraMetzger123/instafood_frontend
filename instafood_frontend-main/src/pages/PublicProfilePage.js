import React, { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Typography,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  Snackbar,
  Alert,
} from "@mui/material";
import { useParams } from "react-router-dom";
import RecipeCard from "../components/RecipeCard";
import PageLoading from "../components/PageLoading";
import { IconButton } from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { useNavigate } from "react-router-dom";

function PublicProfilePage() {
  const navigate = useNavigate();

  const { userId } = useParams();

  const [user, setUser] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "error",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchUser = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load user profile");
        setUser(await res.json());
      } catch (err) {
        console.error(err);
        setSnackbar({
          open: true,
          message: "Unable to load profile.",
          severity: "error",
        });
      }
    };

    const fetchRecipes = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/recipes/users/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (!res.ok) throw new Error("Failed to load recipes");
        setRecipes(await res.json());
      } catch (err) {
        console.error(err);
      }
    };

    fetchUser();
    fetchRecipes();
  }, [userId]);

  const handleCloseSnackbar = () => setSnackbar((s) => ({ ...s, open: false }));

  if (!user) return <PageLoading />;

  return (
    <Box sx={styles.background}>
      <Box sx={styles.overlay}>
        <IconButton
          onClick={() => navigate(-1)}
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            backgroundColor: "#fff",
            boxShadow: 2,
            zIndex: 10,
            "&:hover": {
              backgroundColor: "rgba(170, 170, 170, 0.1)",
            },
          }}
        >
          <ArrowForwardIosIcon sx={{ transform: "rotate(0deg)" }} />
        </IconButton>

        <Box sx={{ maxWidth: 1100, margin: "auto", p: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  mb: 3,
                  p: 3,
                  boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
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
                      alt={`${user.firstName} ${user.lastName}`}
                      sx={{
                        width: 120,
                        height: 120,
                        borderRadius: "50%",
                        border: "5px solid #ff6600",
                        transition: "transform 0.3s ease",
                        "&:hover": { transform: "scale(1.1)" },
                      }}
                    />

                    <Box sx={{ textAlign: "center" }}>
                      <Typography
                        variant="h5"
                        fontWeight={700}
                        color="primary"
                        sx={{ mb: 1 }}
                      >
                        {`${user.firstName} ${user.lastName}` || "Full Name"}
                      </Typography>
                      <Typography
                        variant="subtitle1"
                        fontWeight={500}
                        color="secondary"
                        sx={{ mb: 1 }}
                      >
                        @{user.username}
                      </Typography>
                      <Typography color="text.secondary">
                        {user.email}
                      </Typography>

                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          gap: 4,
                          mt: 3,
                        }}
                      >
                        <Box sx={{ textAlign: "center" }}>
                          <Typography fontWeight={700} sx={{ fontSize: 18 }}>
                            {recipes.length}
                          </Typography>
                          <Typography fontSize={14} color="text.secondary">
                            Recipes
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={8}>
              <Tabs
                value={selectedTab}
                onChange={(e, v) => setSelectedTab(v)}
                centered
                TabIndicatorProps={{
                  style: {
                    backgroundColor: "#ff6600",
                    height: 3,
                    borderRadius: 2,
                  },
                }}
                textColor="inherit"
                sx={{ borderBottom: "1px solid #ddd", pb: 1 }}
              >
                <Tab
                  label="Recipes"
                  sx={{
                    color: selectedTab === 0 ? "#ff6600" : "gray",
                    fontWeight: selectedTab === 0 ? "bold" : "normal",
                    textTransform: "none",
                    fontSize: 16,
                    transition: "color 0.3s,font-weight 0.3s",
                    "&:hover": { color: "#ff6600", fontWeight: "bold" },
                  }}
                />
              </Tabs>

              <Card
                sx={{
                  mt: 3,
                  p: 3,
                  boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                  borderRadius: 2,
                }}
              >
                <Grid container spacing={2}>
                  {selectedTab === 0 ? (
                    recipes.length ? (
                      recipes.map((r) => (
                        <Grid
                          item
                          xs={12}
                          sm={6}
                          md={6}
                          key={r._id}
                          sx={{ p: 3 }}
                        >
                          <RecipeCard
                            recipe={r}
                            uploader={user.username || user.email}
                          />
                        </Grid>
                      ))
                    ) : (
                      <Typography align="center" mt={2} sx={{ width: "100%" }}>
                        No recipes yet.
                      </Typography>
                    )
                  ) : (
                    <Typography align="center" mt={2} sx={{ width: "100%" }}>
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
              variant="outlined"
              sx={{
                bgcolor: "white",
                color: "#ff6600",
                border: "1px solid #ff6600",
                fontWeight: "bold",
                width: "100%",
              }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Box>
      </Box>
    </Box>
  );
}

export default PublicProfilePage;

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
    position: "relative",
    backgroundColor: "rgba(255,255,255,0.8)",
    width: "100%",
    minHeight: "100vh",
    pt: "30px",
    pb: "30px",
  },
};
