import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
  Snackbar,
  Alert,
} from "@mui/material";
import { AddCircle, RemoveCircle, ImageOutlined } from "@mui/icons-material";
import "../styles/authPages.css";
import { VolumeUp, VolumeOff, PlayArrow } from "@mui/icons-material";
import { useSnackbar } from "../components/context/SnackbarContext";

function UploadRecipePage() {
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [recipe, setRecipe] = useState({
    title: "",
    description: "",
    cookingTime: "",
    servings: "",
    difficulty: "",
    category: "",
    ingredients: [""],
    instructions: [""],
    tags: [],
  });
  const [mediaFiles, setMediaFiles] = useState([]); // קבצים מרובים
  const [previewUrls, setPreviewUrls] = useState([]); // תצוגות מקדימות מרובות

  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const [location, setLocation] = useState("");
  const { showSnackbar } = useSnackbar();
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
    const token = localStorage.getItem("token");
    if (!token) {
      setShowLoginAlert(true);
      setTimeout(() => {
        navigate("/");
      }, 2000);
    }
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyBZXi0TxIVSgvV-3e3OKjJzDcrluiZsdtg`,
            );
            const data = await response.json();
            console.log("🌍 Full Google Maps API response:", data);
            if (data.status === "OK") {
              const address = data.results[0]?.formatted_address || "";
              console.log("🏡 Detected Address:", address);
              setLocation(address);
            } else {
              console.error("Error with Geocoding API:", data.status);
            }
          } catch (err) {
            console.error("Error fetching address:", err);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
        },
      );
    }
  }, [navigate]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const newFiles = [...mediaFiles, ...files];

    if (newFiles.length > 10) {
      showSnackbar({
        message: "You can upload up to 10 files only.",
        severity: "error",
        requireAction: true,
      });

      return;
    }

    setMediaFiles(newFiles);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...newPreviews]);
  };

  const handleRemoveMedia = (index) => {
    const updatedFiles = [...mediaFiles];
    const updatedPreviews = [...previewUrls];
    updatedFiles.splice(index, 1);
    updatedPreviews.splice(index, 1);
    setMediaFiles(updatedFiles);
    setPreviewUrls(updatedPreviews);
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      setShowLoginAlert(true);
      setTimeout(() => {
        navigate("/");
      }, 2000);
      return;
    }
    if (mediaFiles.length === 0) {
      showSnackbar({
        message: "Please upload at least one image or video.",
        severity: "error",
        requireAction: true,
      });
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("title", recipe.title);
      formData.append("description", recipe.description);
      formData.append("cooking_time", recipe.cookingTime);
      formData.append("servings", recipe.servings);
      formData.append("difficulty", recipe.difficulty);
      formData.append("category", recipe.category);
      formData.append("tags", JSON.stringify(recipe.tags));
      mediaFiles.forEach((file) => {
        formData.append("media", file);
      });
      formData.append("ingredients", JSON.stringify(recipe.ingredients));
      formData.append("instructions", JSON.stringify(recipe.instructions));
      formData.append("location", location);

      const res = await fetch("http://localhost:5000/api/recipes", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Upload failed:", errorData);
        showSnackbar({
          message: "Error uploading recipe.",
          severity: "error",
          requireAction: true,
        });

        return;
      }
      showSnackbar({
        message: "Recipe uploaded!",
        severity: "success",
      });

      navigate("/");
    } catch (err) {
      console.error("Upload error:", err);
      showSnackbar({
        message: "Upload failed.",
        severity: "error",
        requireAction: true,
      });
    } finally {
      setIsUploading(false);
    }
  };

  function VideoPlayer({ src }) {
    const [playing, setPlaying] = useState(true);
    const [muted, setMuted] = useState(true);
    const videoRef = useRef(null);

    const handleTogglePlay = () => {
      if (playing) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setPlaying(!playing);
    };

    const handleToggleMute = (e) => {
      e.stopPropagation();
      setMuted(!muted);
      if (videoRef.current) {
        videoRef.current.muted = !muted;
      }
    };

    return (
      <Box sx={{ position: "relative", width: "100%", height: 220 }}>
        <video
          ref={videoRef}
          src={src}
          autoPlay
          muted={muted}
          loop
          playsInline
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: "10px",
            cursor: "pointer",
          }}
          onClick={handleTogglePlay}
        />
        <IconButton
          onClick={handleToggleMute}
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            backgroundColor: "rgba(255,255,255,0.6)",
            zIndex: 10,
            width: 32,
            height: 32,
          }}
        >
          {muted ? (
            <VolumeOff fontSize="small" />
          ) : (
            <VolumeUp fontSize="small" />
          )}
        </IconButton>
        {!playing && (
          <IconButton
            onClick={handleTogglePlay}
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "rgba(255,255,255,0.7)",
              zIndex: 10,
            }}
          >
            <PlayArrow fontSize="large" />
          </IconButton>
        )}
      </Box>
    );
  }

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
          You need to login first to upload recipes
        </Alert>
      </Snackbar>
      <Box sx={styles.background}>
        <Box sx={styles.overlay}>
          <Box sx={styles.wrapper}>
            <Card sx={styles.card}>
              <CardContent>
                <Box sx={{ textAlign: "center" }}>
                  <img
                    src="/instaFood_logo.png"
                    alt="InstaFood Logo"
                    style={styles.logo}
                  />
                  <Typography variant="h5" component="h2" sx={styles.title}>
                    Upload New Recipe
                  </Typography>
                </Box>

                <form onSubmit={handleSubmit} style={styles.form}>
                  <div style={styles.imageUpload}>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      onChange={handleImageChange}
                      style={{ display: "none" }}
                      id="image-upload"
                    />

                    <label htmlFor="image-upload" style={styles.uploadBox}>
                      <Box sx={styles.uploadPlaceholder}>
                        <ImageOutlined sx={{ fontSize: 48, color: "#aaa" }} />
                        <Typography
                          variant="body1"
                          sx={{ color: "#555", mt: 1 }}
                        >
                          Click to upload recipe media
                        </Typography>
                      </Box>
                    </label>

                    {previewUrls.length > 0 &&
                      previewUrls.map((url, idx) => (
                        <div
                          key={idx}
                          style={{ marginBottom: "10px", position: "relative" }}
                        >
                          {mediaFiles[idx]?.type?.startsWith("video") ? (
                            <VideoPlayer src={url} />
                          ) : (
                            <img
                              src={url}
                              alt={`Preview ${idx}`}
                              style={styles.imagePreview}
                            />
                          )}
                          <IconButton
                            onClick={() => handleRemoveMedia(idx)}
                            sx={{
                              position: "absolute",
                              top: 8,
                              right: 8,
                              backgroundColor: "rgba(255, 255, 255, 0.7)",
                              zIndex: 10,
                            }}
                          >
                            <RemoveCircle sx={{ color: "#ff0000" }} />
                          </IconButton>
                        </div>
                      ))}
                  </div>

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
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
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

                  <div style={styles.row}>
                    <TextField
                      name="cookingTime"
                      label="Cooking Time (minutes) *"
                      type="number"
                      value={recipe.cookingTime}
                      onChange={handleChange}
                      fullWidth
                      required
                      inputProps={{ min: 0 }}
                      sx={styles.input}
                    />
                    <TextField
                      name="servings"
                      label="Servings"
                      type="number"
                      value={recipe.servings}
                      onChange={handleChange}
                      fullWidth
                      inputProps={{ min: 0 }}
                      sx={styles.input}
                    />
                  </div>

                  <div style={styles.row}>
                    <FormControl fullWidth required sx={styles.input}>
                      <InputLabel>Difficulty *</InputLabel>
                      <Select
                        label="Difficulty"
                        name="difficulty"
                        value={recipe.difficulty}
                        onChange={handleChange}
                        required
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
                  </div>

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
                        variant="outlined"
                        label="Tags (optional)"
                        placeholder="Add tags"
                        sx={styles.input}
                      />
                    )}
                  />

                  {recipe.ingredients.map((ing, i) => (
                    <div key={i} style={styles.row}>
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
                    </div>
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
                    <div key={i} style={styles.row}>
                      <TextField
                        fullWidth
                        label={`Step ${i + 1}`}
                        value={step}
                        onChange={(e) =>
                          handleListChange(i, e.target.value, "instructions")
                        }
                        sx={styles.input}
                      />
                      <IconButton
                        onClick={() => removeField(i, "instructions")}
                      >
                        <RemoveCircle />
                      </IconButton>
                    </div>
                  ))}
                  <Button
                    onClick={() => addField("instructions")}
                    startIcon={<AddCircle />}
                    variant="outlined"
                    color="inherit"
                  >
                    Add Step
                  </Button>

                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={isUploading}
                    sx={styles.button}
                  >
                    {isUploading ? "Uploading..." : "Share Recipe"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Box>
    </>
  );
}

export default UploadRecipePage;

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
    padding: 2,
    borderRadius: 3,
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
    marginBottom: "16px",
    backgroundColor: "#fafafa",
  },
  uploadPlaceholder: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#aaa",
    textAlign: "center",
  },
  logo: {
    width: "80px",
    height: "80px",
    objectFit: "cover",
    borderRadius: "16px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
    border: "2px solid #ff6600",
    marginBottom: "12px",
  },
  title: {
    fontWeight: "bold",
    color: "#ff6600",
    marginBottom: "20px",
    fontFamily: "'Roboto', sans-serif",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
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
  imageUpload: {
    textAlign: "center",
  },
  uploadBox: {
    border: "2px dashed #ccc",
    borderRadius: "8px",
    padding: "16px",
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    textAlign: "center",
    boxSizing: "border-box",
    backgroundColor: "#f9f9f9",
  },
  imagePreview: {
    width: "100%",
    maxHeight: 200,
    objectFit: "cover",
    borderRadius: "10px",
  },
};
