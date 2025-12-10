import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  InputBase,
  IconButton,
  Paper,
  Divider,
  Chip,
  Tabs,
  Grid,
  Tab,
  Card,
  CardContent,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";
import RecipeCard from "../components/RecipeCard";

function AdvancedSearchPage() {
  const [query, setQuery] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [results, setResults] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    fetchRecipes();
    loadHistory();
  }, []);

  useEffect(() => {
    performSearch();
  }, [query, activeCategory]);

  const fetchRecipes = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/recipes");
      const data = await res.json();
      setRecipes(data);
    } catch (err) {
      console.error("❌ Failed to fetch recipes", err);
    }
  };

  const performSearch = () => {
    const lower = query.toLowerCase();
    let filtered =
      lower !== ""
        ? recipes.filter(
            (r) =>
              r.title?.toLowerCase().includes(lower) ||
              r.description?.toLowerCase().includes(lower) ||
              r.ingredients?.some((ing) => ing.toLowerCase().includes(lower)) ||
              r.tags?.some((tag) => tag.toLowerCase().includes(lower)) ||
              r.category?.toLowerCase().includes(lower),
          )
        : recipes;

    if (activeCategory !== "All") {
      filtered = filtered.filter((r) => r.category === activeCategory);
    }

    setResults(filtered);

    if (query.length > 1) {
      const history = [
        query,
        ...searchHistory.filter((term) => term !== query),
      ].slice(0, 10);
      setSearchHistory(history);
      localStorage.setItem("searchHistory", JSON.stringify(history));

      fetch("http://localhost:5000/api/recipes/search-history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ searchTerm: query }),
      });
    }
  };

  const loadHistory = () => {
    const saved = localStorage.getItem("searchHistory");
    if (saved) setSearchHistory(JSON.parse(saved));
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem("searchHistory");
  };

  const handleQuery = (e) => setQuery(e.target.value);

  const categories = [
    "All",
    "Breakfast",
    "Lunch",
    "Dinner",
    "Dessert",
    "Drinks",
  ];

  return (
    <Box sx={styles.background}>
      <Box sx={styles.overlay}>
        <Box sx={{ maxWidth: 1000, mx: "auto", px: 2 }}>
          <Card elevation={6}>
            <CardContent sx={{ py: 4, px: { xs: 2, sm: 4 } }}>
              <Paper
                sx={{ p: 1.5, display: "flex", alignItems: "center", mb: 3 }}
              >
                <SearchIcon sx={{ mr: 1 }} />
                <InputBase
                  placeholder="Start typing to search"
                  value={query}
                  onChange={handleQuery}
                  sx={{ flex: 1 }}
                />
                {query && (
                  <IconButton onClick={() => setQuery("")}>
                    <ClearIcon />
                  </IconButton>
                )}
              </Paper>

              <Typography fontWeight="bold" sx={{ mb: 1 }}>
                Filter by Category:
              </Typography>
              <Tabs
                value={activeCategory}
                onChange={(e, val) => setActiveCategory(val)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  mb: 3,
                  ".MuiTabs-indicator": {
                    display: "none",
                  },
                }}
              >
                {categories.map((cat) => (
                  <Tab
                    key={cat}
                    label={cat}
                    value={cat}
                    disableFocusRipple
                    sx={{
                      textTransform: "capitalize",
                      fontWeight: 500,
                      borderRadius: 2,
                      px: 2,
                      mx: 0.5,
                      bgcolor: activeCategory === cat ? "#000" : "#f0f0f0",
                      color:
                        activeCategory === cat ? "#fff !important" : "#333",
                      transition: "all 0.2s",
                      "&:hover": {
                        bgcolor: activeCategory === cat ? "#222" : "#e0e0e0",
                      },
                      "&.Mui-focusVisible": {
                        outline: "none",
                        borderBottom: "none",
                        boxShadow: "none",
                      },
                    }}
                  />
                ))}
              </Tabs>

              {query === "" && searchHistory.length > 0 && (
                <Box sx={{ mb: 4 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 1,
                    }}
                  >
                    <Typography fontWeight="bold">Recent Searches</Typography>
                    <IconButton onClick={clearHistory} size="small">
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    {searchHistory.map((term, i) => (
                      <Chip
                        key={i}
                        label={term}
                        onClick={() => setQuery(term)}
                        variant="outlined"
                        sx={{
                          color: "#555",
                          borderColor: "#aaa",
                          fontWeight: "bold",
                          "&:hover": {
                            backgroundColor: "rgba(0, 0, 0, 0.08)",
                          },
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}

              <Divider sx={{ my: 3 }} />

              {results.length === 0 && query && (
                <Box sx={{ textAlign: "center", mt: 5 }}>
                  <SentimentDissatisfiedIcon
                    sx={{ fontSize: 48, color: "gray", mb: 1 }}
                  />
                  <Typography color="text.secondary">
                    No recipes were found matching your search
                  </Typography>
                </Box>
              )}

              <Grid container spacing={2}>
                {results.map((recipe) => (
                  <Grid
                    item
                    key={recipe._id}
                    xs={12}
                    sm={6}
                    md={4}
                    lg={4}
                    sx={{ padding: 3 }}
                  >
                    <RecipeCard
                      recipe={recipe}
                      uploader={recipe.user?.username || "Unknown"}
                    />
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}

export default AdvancedSearchPage;

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
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    width: "100%",
    minHeight: "100vh",
    paddingTop: "30px",
    paddingBottom: "30px",
  },
};
