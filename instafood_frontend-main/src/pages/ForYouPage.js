import React, { useEffect, useState } from "react";
import RecipeCard from "../components/RecipeCard";
import {
  Box,
  Typography,
  Grid,
  Container,
  Snackbar,
  Alert,
} from "@mui/material";
import PageLoading from "../components/PageLoading";
import { useNavigate } from "react-router-dom";

function ForYouPage() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [showLoginAlert, setShowLoginAlert] = useState(false);

  useEffect(() => {
    if (!token) {
      setShowLoginAlert(true);
      setTimeout(() => {
        navigate("/");
      }, 2000);
      return;
    }

    fetch("http://localhost:5000/api/recipes/for-you", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setRecipes(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [token]);

  if (loading && token) return <PageLoading />;

  return (
    <>
      <Snackbar
        open={showLoginAlert}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        autoHideDuration={2000}
      >
        <Alert
          severity="warning"
          variant="filled"
          sx={{
            width: "100%",
            backgroundColor: "#ff6600",
            color: "white",
            fontWeight: "bold",
          }}
        >
          You need to login first to access this page
        </Alert>
      </Snackbar>
      <Box sx={styles.background}>
        <Box sx={styles.overlay}>
          <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography
              variant="h3"
              color="black"
              align="center"
              gutterBottom
              sx={{ fontWeight: "bold", mb: 4 }}
            >
              ✨ For You
            </Typography>

            {error && (
              <Typography variant="body1" color="error" align="center">
                ❌ {error}
              </Typography>
            )}

            {!loading && !error && recipes.length === 0 && (
              <Typography variant="body1" align="center">
                No recommendations yet. Start searching to see suggestions! 🌟
              </Typography>
            )}

            <Grid container spacing={2} justifyContent="center">
              {recipes.map((recipe) => (
                <Grid item key={recipe._id} xs={12} sm={6} md={3}>
                  <RecipeCard recipe={recipe} imageOnly={true} />
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>
      </Box>
    </>
  );
}

export default ForYouPage;

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
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    width: "100%",
    minHeight: "100vh",
    paddingTop: "20px",
    paddingBottom: "20px",
  },
};
