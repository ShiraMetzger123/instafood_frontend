import React, { useEffect, useState } from "react";
import RecipeCard from "../components/RecipeCard";
import { Container, Typography, Grid, Box, Fade } from "@mui/material";
import PageLoading from "../components/PageLoading";

function HomePage() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/recipes")
      .then((res) => res.json())
      .then((data) => {
        setRecipes(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <PageLoading />;

  return (
    <Box sx={styles.background}>
      <Box sx={styles.overlay}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={6} px={2}>
            <Typography
              variant="h3"
              fontWeight={700}
              color="text.primary"
              gutterBottom
              sx={{
                fontSize: {
                  xs: "1.8rem",
                  sm: "2.2rem",
                  md: "2.8rem",
                  lg: "3.2rem",
                },
              }}
            >
              Discover Recipes
            </Typography>

            <Typography
              variant="subtitle1"
              color="text.secondary"
              sx={{
                fontSize: {
                  xs: "0.9rem",
                  sm: "1rem",
                  md: "1.1rem",
                  lg: "1.2rem",
                },
                maxWidth: "700px",
                mx: "auto",
              }}
            >
              Browse, cook, and thrive.
            </Typography>
          </Box>

          {error && (
            <Box textAlign="center" mb={6} px={2}>
              <Typography color="error" variant="h6">
                <span role="img" aria-label="cross mark">
                  ❌
                </span>{" "}
                {error}
              </Typography>
            </Box>
          )}

          <Grid container spacing={6} alignItems="stretch">
            {recipes.length > 0 ? (
              recipes.map((recipe, index) => (
                <Fade in timeout={400 + index * 100} key={recipe._id}>
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    lg={3}
                    sx={{ display: "flex" }}
                  >
                    <Box
                      sx={{
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <RecipeCard
                        recipe={recipe}
                        uploader={recipe.user?.username || "Anonymous"}
                      />
                    </Box>
                  </Grid>
                </Fade>
              ))
            ) : (
              <Grid item xs={12}>
                <Box
                  textAlign="center"
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  height="40vh"
                  px={2}
                >
                  <Typography variant="h6">
                    No recipes found. Be the first to share one!{" "}
                    <span role="img" aria-label="plate with cutlery">
                      🍽️
                    </span>
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}

export default HomePage;

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
    paddingTop: "60px",
    paddingBottom: "60px",
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
