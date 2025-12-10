import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Typography,
  Avatar,
  Divider,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import GroupsIcon from "@mui/icons-material/Groups";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import ShareIcon from "@mui/icons-material/Share";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import CommentSection from "../components/Comments";
import PageLoading from "../components/PageLoading";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { useSnackbar } from "../components/context/SnackbarContext";
import { useConfirmDialog } from "../components/context/ConfirmDialogContext";

function RecipePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  const [recipe, setRecipe] = useState(null);
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [commentsCount, setCommentsCount] = useState(0);
  const [likeUsers, setLikeUsers] = useState([]);
  const [showLikes, setShowLikes] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const { showSnackbar } = useSnackbar();
  const { showConfirmDialog } = useConfirmDialog();
  const videoRefs = useRef([]);

  const getImageUrl = (url) => {
    if (!url) return "/default-user.png";
    return url.startsWith("http") ? url : `http://localhost:5000${url}`;
  };

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/recipes/${id}`);
        const data = await res.json();
        setRecipe(data);
        console.log("📦 Recipe loaded:", recipe);

        setLikes(data.likes || 0);
      } catch (err) {
        console.error("❌ Failed to fetch recipe", err);
      }
    };

    const fetchComments = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/comments/${id}`);
        const data = await res.json();
        setCommentsCount(data.length);
      } catch (err) {
        console.error("❌ Failed to fetch comments", err);
      }
    };

    const fetchLikeStatus = async () => {
      if (!userId) return;
      try {
        const res = await fetch(
          `http://localhost:5000/api/likes/${id}/${userId}`,
        );
        const data = await res.json();
        setLiked(data.liked);
      } catch (err) {}
    };

    fetchRecipe();
    fetchComments();
    fetchLikeStatus();
  }, [id, userId]);

  const handleLike = async () => {
    if (!token || !userId) {
      showSnackbar({
        message: "You must be logged in!",
        severity: "error",
        requireAction: true,
      });
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/likes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ recipe: id, user: userId }),
      });
      const data = await res.json();
      if (res.ok) {
        setLikes(data.liked ? likes + 1 : likes - 1);
        setLiked(data.liked);
      }
    } catch (err) {}
  };

  const handleShowLikes = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/likes/users/${id}`);
      const data = await res.json();
      setLikeUsers(data.users || []);
      setShowLikes(true);
    } catch {}
  };

  useEffect(() => {
    return () => {
      videoRefs.current.forEach((video) => {
        if (video && !video.paused) {
          video.pause();
          video.currentTime = 0;
        }
      });
    };
  }, []);

  if (!recipe) return <PageLoading />;

  return (
    <Box sx={styles.background}>
      <Box sx={styles.overlay}>
        <Box sx={styles.pageWrapper}>
          <Box sx={styles.pageContainer}>
            {/* LEFT: Recipe Image */}
            <Box sx={styles.imageSection}>
              {recipe.media && recipe.media.length > 0 ? (
                <Carousel
                  showThumbs={false}
                  infiniteLoop
                  useKeyboardArrows
                  autoPlay={false}
                  showStatus={false}
                  onChange={() => {
                    videoRefs.current.forEach((video) => {
                      if (video && !video.paused) {
                        video.pause();
                        video.currentTime = 0;
                      }
                    });
                  }}
                >
                  {recipe.media.map((file, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        width: "100%",
                        height: 500,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: "#fff",
                      }}
                    >
                      {file.endsWith(".mp4") ||
                      file.endsWith(".mov") ||
                      file.endsWith(".avi") ? (
                        <video
                          ref={(el) => (videoRefs.current[idx] = el)}
                          src={file}
                          controls
                          style={{
                            maxWidth: "100%",
                            maxHeight: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <img
                          src={file}
                          alt=""
                          style={{
                            maxWidth: "100%",
                            maxHeight: "100%",
                            objectFit: "cover",
                          }}
                        />
                      )}
                    </Box>
                  ))}
                </Carousel>
              ) : (
                <img
                  src="/default-image.png"
                  alt="default"
                  style={{
                    width: "100%",
                    height: "auto",
                    maxHeight: "500px",
                    objectFit: "cover",
                  }}
                />
              )}
            </Box>

            <Box sx={styles.contentSection} position="relative">
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
              <Box sx={styles.header}>
                <Avatar
                  src={getImageUrl(recipe.user?.profileImage)}
                  sx={{ width: 56, height: 56, mr: 2 }}
                />
                <Box>
                  <Typography
                    fontWeight="bold"
                    sx={{ cursor: "pointer", textDecoration: "underline" }}
                    onClick={() => navigate(`/profile/${recipe.user?._id}`)}
                  >
                    {recipe.user?.username || "Unknown"}
                  </Typography>

                  <Typography fontSize={12} color="gray">
                    {recipe.createdAt
                      ? new Date(recipe.createdAt).toLocaleDateString()
                      : "Unknown Date"}
                  </Typography>
                </Box>
              </Box>

              <Typography variant="h4" sx={{ mt: 2, fontWeight: 600 }}>
                {recipe.title}
              </Typography>
              <Typography sx={{ mb: 2, color: "#555" }}>
                {recipe.description}
              </Typography>

              <Box sx={styles.details}>
                <Chip
                  icon={<AccessTimeIcon />}
                  label={`${recipe.cookingTime} mins`}
                  sx={styles.lightChip}
                />
                <Chip
                  icon={<GroupsIcon />}
                  label={`${recipe.servings} servings`}
                  sx={styles.lightChip}
                />
                {recipe.difficulty && (
                  <Chip
                    label={recipe.difficulty}
                    sx={styles.darkChip}
                    onClick={() =>
                      navigate(`/search/difficulty/${recipe.difficulty}`)
                    }
                    clickable
                  />
                )}
                {recipe.category && (
                  <Chip
                    label={recipe.category}
                    sx={styles.darkChip}
                    onClick={() =>
                      navigate(`/search/category/${recipe.category}`)
                    }
                    clickable
                  />
                )}
              </Box>

              {recipe.tags && recipe.tags.length > 0 && (
                <Box sx={styles.tagsContainer}>
                  {recipe.tags.map((tag, i) => (
                    <Typography
                      key={i}
                      sx={styles.tag}
                      onClick={() => navigate(`/search/tag/${tag}`)}
                    >
                      #{tag}
                    </Typography>
                  ))}
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              <Box sx={styles.columns}>
                <Box sx={styles.column}>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: "#333", mb: 1 }}
                  >
                    Ingredients
                  </Typography>
                  <ul style={styles.list}>
                    {recipe.ingredients?.map((ing, i) => (
                      <li key={i} style={styles.listItem}>
                        <Typography sx={{ fontSize: 14, color: "#555" }}>
                          {ing}
                        </Typography>
                      </li>
                    ))}
                  </ul>
                </Box>

                <Box sx={styles.column}>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: "#333", mb: 1 }}
                  >
                    Instructions
                  </Typography>
                  <ol style={styles.list}>
                    {recipe.instructions?.map((step, i) => (
                      <li key={i} style={styles.listItem}>
                        <Typography sx={{ fontSize: 14, color: "#555" }}>
                          {step}
                        </Typography>
                      </li>
                    ))}
                  </ol>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={styles.actions}>
                <Box sx={styles.iconGroup}>
                  <IconButton onClick={handleLike} sx={styles.iconButton}>
                    {liked ? (
                      <FavoriteIcon sx={styles.iconSvg} />
                    ) : (
                      <FavoriteBorderIcon sx={styles.iconSvg} />
                    )}
                  </IconButton>
                  <Typography>{likes}</Typography>
                </Box>

                <IconButton onClick={handleShowLikes} sx={styles.iconButton}>
                  <PeopleAltOutlinedIcon sx={styles.iconSvg} />
                </IconButton>

                <Box sx={styles.iconGroup}>
                  <IconButton
                    onClick={() => setShowComments(!showComments)}
                    sx={styles.iconButton}
                  >
                    <ChatBubbleOutlineIcon sx={styles.iconSvg} />
                  </IconButton>
                  <Typography>{commentsCount}</Typography>
                </Box>

                <IconButton sx={styles.iconButton}></IconButton>
              </Box>
              {recipe.user?._id === userId && (
                <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                  <Chip
                    label="Edit"
                    onClick={() => navigate(`/edit-recipe/${recipe._id}`)}
                    clickable
                    variant="outlined"
                    sx={{
                      color: "#000",
                      borderColor: "#000",
                      fontWeight: "bold",
                      "&:hover": {
                        backgroundColor: "rgba(0, 0, 0, 0.7)",
                      },
                    }}
                  />

                  <Chip
                    label="Delete"
                    onClick={() => {
                      showConfirmDialog({
                        title: "Delete Recipe",
                        message: "Are you sure you want to delete this recipe?",
                        onConfirm: async () => {
                          try {
                            const res = await fetch(
                              `http://localhost:5000/api/recipes/${recipe._id}`,
                              {
                                method: "DELETE",
                                headers: {
                                  Authorization: `Bearer ${token}`,
                                },
                              },
                            );

                            if (res.ok) {
                              showSnackbar({
                                message: "Recipe deleted successfully",
                                severity: "success",
                              });
                              navigate("/");
                            } else {
                              showSnackbar({
                                message: "Failed to delete recipe",
                                severity: "error",
                                requireAction: true,
                              });
                            }
                          } catch (err) {
                            console.error("❌ Delete error:", err);
                            showSnackbar({
                              message: "An error occurred while deleting.",
                              severity: "error",
                              requireAction: true,
                            });
                          }
                        },
                      });
                    }}
                    clickable
                    variant="outlined"
                    sx={{
                      color: "#ff6600",
                      borderColor: "#ff6600",
                      fontWeight: "bold",
                      "&:hover": {
                        backgroundColor: "rgba(255, 102, 0, 0.7)",
                      },
                    }}
                  />
                </Box>
              )}

              {showComments && <CommentSection recipeId={recipe._id} />}
            </Box>
          </Box>

          <Dialog
            open={showLikes}
            onClose={() => setShowLikes(false)}
            sx={{
              "& .MuiDialog-paper": {
                borderRadius: "16px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              },
            }}
          >
            <DialogTitle
              sx={{ fontWeight: "bold", fontSize: "1.25rem", color: "#333" }}
            >
              People who liked this recipe
            </DialogTitle>
            <DialogContent sx={{ padding: "16px" }}>
              {likeUsers.length > 0 ? (
                <List sx={{ maxHeight: "300px", overflowY: "auto" }}>
                  {likeUsers.map((user, i) => (
                    <ListItem
                      key={i}
                      sx={{
                        padding: "8px 0",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Avatar
                        sx={{ width: 32, height: 32, mr: 2 }}
                        alt={user}
                        src={user.profileImage}
                      />
                      <ListItemText
                        primary={
                          <Typography sx={{ fontWeight: 500, color: "#555" }}>
                            {user}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography sx={{ fontStyle: "italic", color: "gray" }}>
                  No likes yet.
                </Typography>
              )}
            </DialogContent>
          </Dialog>
        </Box>
      </Box>
    </Box>
  );
}

export default RecipePage;

const styles = {
  imageSection: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    minHeight: 500,
    maxHeight: 500,
  },

  pageWrapper: {
    minHeight: "100%",
    paddingTop: "1rem",
    paddingBottom: "1rem",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  pageContainer: {
    display: "flex",
    flexDirection: { xs: "column", md: "row" },
    maxWidth: "1100px",
    backgroundColor: "#fff",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
    width: "100%",
  },
  imageSection: {
    flex: 1,
    position: "relative",
  },
  contentSection: {
    flex: 1,
    padding: { xs: "1.5rem", md: "2rem" },
    backgroundColor: "#fff",
  },
  recipeImage: {
    width: "100%",
    height: "100%",
    maxHeight: "100%",
    objectFit: "cover",
  },
  backBtn: {
    position: "absolute",
    top: 16,
    left: 16,
    backgroundColor: "#fff",
    "&:hover": {
      backgroundColor: "#f0f0f0",
    },
  },
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
  container: {
    maxWidth: 900,
    margin: "auto",
    padding: 2,
  },
  image: {
    width: "100%",
    maxHeight: 450,
    objectFit: "cover",
    borderRadius: 8,
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 2,
    mt: 2,
  },
  details: {
    display: "flex",
    gap: 1.5,
    mt: 1,
    flexWrap: "wrap",
  },
  lightChip: {
    backgroundColor: "#f1f1f1",
    fontSize: 13,
    height: 28,
    "& .MuiChip-icon": { fontSize: 18 },
  },
  darkChip: {
    backgroundColor: "#4b4b4b",
    color: "#fff",
    fontSize: 13,
    height: 28,
    cursor: "pointer",
  },
  tagsContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: 1,
    mt: 1,
  },
  tag: {
    color: "#ff8a33",
    fontWeight: "bold",
    fontSize: 14,
    cursor: "pointer",
  },
  columns: {
    display: "flex",
    flexDirection: { xs: "column", md: "row" },
    gap: 4,
    mt: 2,
  },
  column: {
    flex: 1,
    textAlign: "left",
    maxWidth: "100%",
    padding: { xs: "0 1rem", md: "0" },
  },
  list: {
    paddingLeft: "1.5rem",
    marginTop: "1rem",
    listStyleType: "none",
  },
  listItem: {
    marginBottom: "1rem",
    display: "flex",
    alignItems: "center",
  },
  actions: {
    display: "flex",
    alignItems: "center",
    gap: 2,
    mt: 2,
  },
  iconGroup: {
    display: "flex",
    alignItems: "center",
    gap: 0.5,
  },
  iconButton: {
    backgroundColor: "#fff",
    color: "#ff6600",
    padding: "6px",
    transition: "background-color 0.3s ease, transform 0.2s ease",
    "&:hover": {
      backgroundColor: "rgba(255, 102, 0, 0.1)",
      transform: "scale(1.05)",
    },
  },
  iconSvg: {
    fontSize: 20,
  },
};
