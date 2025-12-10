import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Grid,
  CircularProgress,
} from "@mui/material";
import RecipeCard from "../components/RecipeCard";
import { IconButton } from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { useNavigate } from "react-router-dom";

function SearchResultsPage() {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const { type, value } = useParams();
  const location = useLocation();
  useEffect(() => {
    setLoading(true);

    const query = new URLSearchParams(location.search);
    const searchTerm = query.get("q");

    if (
      (type === "tag" || type === "category" || type === "difficulty") &&
      value
    ) {
      fetch("http://localhost:5000/api/recipes")
        .then((res) => res.json())
        .then((data) => {
          let filtered = [];

          if (type === "tag") {
            filtered = data.filter((recipe) =>
              recipe.tags?.some(
                (tag) => tag.toLowerCase() === value.toLowerCase(),
              ),
            );
          } else if (type === "category") {
            filtered = data.filter(
              (recipe) =>
                recipe.category?.toLowerCase() === value.toLowerCase(),
            );
          } else if (type === "difficulty") {
            filtered = data.filter(
              (recipe) =>
                recipe.difficulty?.toLowerCase() === value.toLowerCase(),
            );
          }

          setResults(filtered || []);
          const uniqueCategories = [
            ...new Set(
              filtered.map((recipe) => recipe.category).filter(Boolean),
            ),
          ];
          setCategories(uniqueCategories);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Search failed", err);
          setResults([]);
          setCategories([]);
          setLoading(false);
        });
    } else if (searchTerm) {
      fetch(`http://localhost:5000/api/recipes/search?q=${searchTerm}`)
        .then((res) => res.json())
        .then((data) => {
          setResults(data || []);
          const uniqueCategories = [
            ...new Set(data.map((recipe) => recipe.category).filter(Boolean)),
          ];
          setCategories(uniqueCategories);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Search failed", err);
          setResults([]);
          setCategories([]);
          setLoading(false);
        });
    } else {
      setLoading(false);
      setCategories([]);
    }
  }, [type, value, location.search]);

  const filteredResults = selectedCategory
    ? results.filter((recipe) => recipe.category === selectedCategory)
    : results;

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

        <Box sx={{ maxWidth: 1000, mx: "auto", px: 2 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            {type === "tag" ? `Results for tag: #${value}` : "Search Results"}
            {selectedCategory && ` • Category: ${selectedCategory}`}
          </Typography>

          <Box sx={{ mb: 4 }}>
            <FormControl variant="standard" sx={{ minWidth: 180 }}>
              <InputLabel>Filter by Category</InputLabel>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                disableUnderline
                inputProps={{ disableUnderline: true }}
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))
                ) : (
                  <>
                    <MenuItem value="Breakfast">Breakfast</MenuItem>
                    <MenuItem value="Lunch">Lunch</MenuItem>
                    <MenuItem value="Dinner">Dinner</MenuItem>
                    <MenuItem value="Dessert">Dessert</MenuItem>
                    <MenuItem value="Drinks">Drinks</MenuItem>
                  </>
                )}
              </Select>
            </FormControl>
          </Box>

          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "300px",
              }}
            >
              <CircularProgress color="warning" />
              <Typography variant="body1" color="text.secondary" sx={{ ml: 2 }}>
                Searching recipes...
              </Typography>
            </Box>
          ) : filteredResults.length === 0 ? (
            <Typography
              sx={{
                textAlign: "center",
                mt: 4,
                fontWeight: "bold",
                color: "gray",
              }}
            >
              😕 No recipes found matching your search
            </Typography>
          ) : (
            <Grid container spacing={3}>
              {filteredResults.map((recipe) => (
                <Grid item xs={12} sm={6} md={4} key={recipe._id}>
                  <RecipeCard
                    recipe={recipe}
                    uploader={recipe.user?.username || "Unknown"}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default SearchResultsPage;

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
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    width: "100%",
    minHeight: "100vh",
    paddingTop: "60px",
    paddingBottom: "60px",
  },
};
