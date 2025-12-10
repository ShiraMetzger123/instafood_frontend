import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  TextField,
  Button,
  IconButton,
  InputLabel,
  MenuItem,
  FormControl,
  Select,
  Autocomplete,
  Box,
  Card,
  CardContent,
  Typography,
} from "@mui/material";
import { AddCircle, RemoveCircle, Delete } from "@mui/icons-material";
import { useSnackbar } from "../components/context/SnackbarContext";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";

function EditRecipePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const { showSnackbar } = useSnackbar();

  const [recipe, setRecipe] = useState(null);
  const [newMediaFiles, setNewMediaFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const tagOptions = [
    "בשרי",
    "חלבי",
    "פרווה",
    "ילדים",
    "טבעוני",
    "צמחוני",
    "מתוק",
    "תוספת",
    "עיקרית",
    "חגים",
    "שבת",
  ];

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/recipes/${id}`);
        if (!res.ok) throw new Error("Failed to fetch recipe");
        const data = await res.json();
        setRecipe({
          ...data,
          ingredients: data.ingredients || [""],
          instructions: data.instructions || [""],
          tags: data.tags || [],
        });
      } catch (err) {
        console.error(err);
        showSnackbar({
          message: "Error loading recipe",
          severity: "error",
          requireAction: true,
        });
      }
    };
    fetchRecipe();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRecipe((prev) => ({ ...prev, [name]: value }));
  };

  const handleListChange = (index, value, field) => {
    const updated = [...recipe[field]];
    updated[index] = value;
    setRecipe({ ...recipe, [field]: updated });
  };

  const addField = (field) => {
    setRecipe({ ...recipe, [field]: [...recipe[field], ""] });
  };

  const removeField = (index, field) => {
    const updated = recipe[field].filter((_, i) => i !== index);
    setRecipe({ ...recipe, [field]: updated });
  };

  const handleAddMedia = (e) => {
    const files = Array.from(e.target.files);
    setNewMediaFiles((prev) => [...prev, ...files]);
    setPreviewUrls((prev) => [
      ...prev,
      ...files.map((file) => URL.createObjectURL(file)),
    ]);
  };

  const handleRemoveMedia = (index, isExisting) => {
    if (isExisting) {
      const updated = recipe.media.filter((_, i) => i !== index);
      setRecipe({ ...recipe, media: updated });
    } else {
      setNewMediaFiles((prev) => prev.filter((_, i) => i !== index));
      setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSave = async () => {
    if (!recipe.title || !recipe.cookingTime || !recipe.difficulty) {
      showSnackbar({
        message: "Please fill in all required fields",
        severity: "error",
        requireAction: true,
      });
      return;
    }

    const formData = new FormData();
    formData.append("title", recipe.title);
    formData.append("description", recipe.description);
    formData.append("cookingTime", recipe.cookingTime);
    formData.append("servings", recipe.servings);
    formData.append("difficulty", recipe.difficulty);
    formData.append("category", recipe.category);
    formData.append("location", recipe.location || "");
    formData.append("ingredients", JSON.stringify(recipe.ingredients));
    formData.append("instructions", JSON.stringify(recipe.instructions));
    formData.append("tags", JSON.stringify(recipe.tags));
    formData.append("existingMedia", JSON.stringify(recipe.media));
    newMediaFiles.forEach((file) => formData.append("newMedia", file));

    try {
      const res = await fetch(`http://localhost:5000/api/recipes/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to update recipe");

      showSnackbar({ message: "Recipe updated!", severity: "success" });
      setTimeout(() => navigate(`/recipe/${id}`), 1500);
    } catch (err) {
      console.error(err);
      showSnackbar({
        message: "Error saving changes",
        severity: "error",
        requireAction: true,
      });
    }
  };

  if (!recipe) return null;

  return (
    <Box sx={styles.background}>
      <Box sx={styles.overlay}>
        <Box sx={styles.wrapper}>
          <Card sx={styles.card}>
            <CardContent>
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
                <ArrowBackIosIcon sx={{ transform: "rotate(180deg)" }} />
              </IconButton>

              <Typography variant="h5" sx={styles.title}>
                Edit Recipe
              </Typography>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSave();
                }}
                style={styles.form}
              >
                <TextField
                  name="title"
                  label="Recipe Title *"
                  value={recipe.title}
                  onChange={handleChange}
                  fullWidth
                  required
                  sx={styles.input}
                />
                <TextField
                  name="location"
                  label="Location (optional)"
                  value={recipe.location || ""}
                  onChange={handleChange}
                  fullWidth
                  sx={styles.input}
                />
                <TextField
                  name="description"
                  label="Description"
                  value={recipe.description}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={3}
                  sx={styles.input}
                />

                <Box sx={styles.row}>
                  <TextField
                    name="cookingTime"
                    label="Cooking Time (minutes) *"
                    type="number"
                    value={recipe.cookingTime}
                    onChange={handleChange}
                    required
                    fullWidth
                    sx={styles.input}
                  />
                  <TextField
                    name="servings"
                    label="Servings"
                    type="number"
                    value={recipe.servings}
                    onChange={handleChange}
                    fullWidth
                    sx={styles.input}
                  />
                </Box>

                <Box sx={styles.row}>
                  <FormControl fullWidth required sx={styles.input}>
                    <InputLabel>Difficulty *</InputLabel>
                    <Select
                      label="Difficulty"
                      name="difficulty"
                      value={recipe.difficulty}
                      onChange={handleChange}
                    >
                      <MenuItem value="Easy">Easy</MenuItem>
                      <MenuItem value="Medium">Medium</MenuItem>
                      <MenuItem value="Hard">Hard</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth sx={styles.input}>
                    <InputLabel>Category</InputLabel>
                    <Select
                      label="Category"
                      name="category"
                      value={recipe.category}
                      onChange={handleChange}
                    >
                      <MenuItem value="Breakfast">Breakfast</MenuItem>
                      <MenuItem value="Lunch">Lunch</MenuItem>
                      <MenuItem value="Dinner">Dinner</MenuItem>
                      <MenuItem value="Dessert">Dessert</MenuItem>
                      <MenuItem value="Drinks">Drinks</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                <Autocomplete
                  multiple
                  freeSolo
                  options={tagOptions}
                  value={recipe.tags}
                  onChange={(e, newValue) =>
                    setRecipe({ ...recipe, tags: newValue })
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Tags (optional)"
                      sx={styles.input}
                    />
                  )}
                />

                {recipe.ingredients.map((ing, i) => (
                  <Box key={i} sx={styles.row}>
                    <TextField
                      fullWidth
                      label={`Ingredient ${i + 1}`}
                      value={ing}
                      onChange={(e) =>
                        handleListChange(i, e.target.value, "ingredients")
                      }
                      sx={styles.input}
                    />
                    <IconButton onClick={() => removeField(i, "ingredients")}>
                      <RemoveCircle />
                    </IconButton>
                  </Box>
                ))}
                <Button
                  onClick={() => addField("ingredients")}
                  startIcon={<AddCircle />}
                  variant="outlined"
                  color="inherit"
                >
                  Add Ingredient
                </Button>

                {recipe.instructions.map((step, i) => (
                  <Box key={i} sx={styles.row}>
                    <TextField
                      fullWidth
                      label={`Step ${i + 1}`}
                      value={step}
                      onChange={(e) =>
                        handleListChange(i, e.target.value, "instructions")
                      }
                      sx={styles.input}
                    />
                    <IconButton onClick={() => removeField(i, "instructions")}>
                      <RemoveCircle />
                    </IconButton>
                  </Box>
                ))}
                <Button
                  onClick={() => addField("instructions")}
                  startIcon={<AddCircle />}
                  variant="outlined"
                  color="inherit"
                >
                  Add Step
                </Button>

                <Box>
                  <Typography fontWeight="bold" sx={{ mt: 2 }}>
                    Existing Media:
                  </Typography>
                  {recipe.media?.map((url, i) => (
                    <Box key={i} sx={{ position: "relative", mt: 1 }}>
                      {url.endsWith(".mp4") ? (
                        <video src={url} style={styles.media} controls />
                      ) : (
                        <img src={url} alt="media" style={styles.media} />
                      )}
                      <IconButton
                        onClick={() => handleRemoveMedia(i, true)}
                        size="small"
                        sx={styles.deleteBtn}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                  <Typography fontWeight="bold" sx={{ mt: 2 }}>
                    New Media:
                  </Typography>
                  {previewUrls.map((url, i) => (
                    <Box key={i} sx={{ position: "relative", mt: 1 }}>
                      <img src={url} style={styles.media} alt="preview" />
                      <IconButton
                        onClick={() => handleRemoveMedia(i, false)}
                        size="small"
                        sx={styles.deleteBtn}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    sx={{ mt: 2 }}
                  >
                    Add More Media
                    <input
                      hidden
                      accept="image/*,video/*"
                      multiple
                      type="file"
                      onChange={handleAddMedia}
                    />
                  </Button>
                </Box>

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  sx={styles.button}
                >
                  Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}

export default EditRecipePage;

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
    paddingBottom: "30px",
  },
  wrapper: {
    width: "100%",
    maxWidth: "600px",
    margin: "auto",
    padding: "0 20px",
  },
  card: {
    position: "relative",
    padding: 2,
    borderRadius: 3,
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    backgroundColor: "#fafafa",
  },
  title: {
    fontWeight: "bold",
    color: "#ff6600",
    marginBottom: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  row: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
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
  media: {
    width: "100%",
    borderRadius: 8,
  },
  deleteBtn: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "white",
  },
};
