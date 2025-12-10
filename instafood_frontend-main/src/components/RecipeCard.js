import React, { useState, useEffect } from "react";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  Button,
} from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import GroupsIcon from "@mui/icons-material/Groups";
import { useNavigate } from "react-router-dom";
import CommentSection from "./Comments";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";

function RecipeCard({ recipe, uploader = "Anonymous", imageOnly = false }) {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  const [likes, setLikes] = useState(recipe.likes || 0);
  const [liked, setLiked] = useState(false);
  const [showLikes, setShowLikes] = useState(false);
  const [likeUsers, setLikeUsers] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [commentsCount, setCommentsCount] = useState(0);

  useEffect(() => {
    if (!userId || imageOnly) return;
    fetch(`http://localhost:5000/api/likes/${recipe._id}/${userId}`)
      .then((res) => res.json())
      .then((data) => setLiked(data.liked))
      .catch(() => {});
  }, [recipe._id, userId, imageOnly]);

  useEffect(() => {
    if (imageOnly) return;
    fetch(`http://localhost:5000/api/comments/${recipe._id}`)
      .then((res) => res.json())
      .then((data) => setCommentsCount(data.length))
      .catch(() => {});
  }, [recipe._id, imageOnly]);

  const handleLike = async () => {
    if (!token || !userId) return alert("Login required");
    try {
      const res = await fetch("http://localhost:5000/api/likes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ recipe: recipe._id, user: userId }),
      });
      const data = await res.json();
      if (res.ok) {
        setLikes(data.liked ? likes + 1 : likes - 1);
        setLiked(data.liked);
      }
    } catch {}
  };

  const handleShowLikes = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/likes/users/${recipe._id}`,
      );
      const data = await res.json();
      setLikeUsers(data.users || []);
      setShowLikes(true);
    } catch {}
  };

  const getFirstMediaFile = (recipe) => {
    if (!recipe.media || recipe.media.length === 0) {
      return { url: "/default-image.png", type: "image" };
    }
    const firstFile = recipe.media[0];
    const isVideo =
      firstFile.endsWith(".mp4") ||
      firstFile.endsWith(".mov") ||
      firstFile.endsWith(".avi");
    const url = firstFile.startsWith("http")
      ? firstFile
      : `http://localhost:5000${firstFile}`;
    return { url, type: isVideo ? "video" : "image" };
  };

  if (imageOnly) {
    const { url, type } = getFirstMediaFile(recipe);
    return (
      <Card
        sx={{
          width: "100%",
          borderRadius: "12px",
          boxShadow: "none",
          overflow: "hidden",
          m: 0,
          p: 0,
          lineHeight: 0,
        }}
      >
        <Box
          sx={{
            position: "relative",
            width: "100%",
            paddingTop: "65%",
            overflow: "hidden",
          }}
        >
          {type === "image" ? (
            <CardMedia
              component="img"
              image={url}
              alt={recipe.title}
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center",
                cursor: "pointer",
                transition: "transform 0.3s ease-in-out",
                "&:hover": { transform: "scale(1.05)" },
              }}
              onClick={() => navigate(`/recipe/${recipe._id}`)}
              onError={(e) => {
                e.target.src = "/default-image.png";
              }}
            />
          ) : (
            <video
              src={url}
              muted
              autoPlay
              loop
              playsInline
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center",
                borderRadius: "12px",
                cursor: "pointer",
              }}
              onClick={() => navigate(`/recipe/${recipe._id}`)}
              onError={(e) => {
                e.target.poster = "/default-image.png";
              }}
            />
          )}
        </Box>
      </Card>
    );
  }

  const { url, type } = getFirstMediaFile(recipe);

  return (
    <Card sx={styles.card}>
      {type === "image" ? (
        <CardMedia
          component="img"
          image={url}
          alt={recipe.title}
          sx={styles.image}
          onClick={() => navigate(`/recipe/${recipe._id}`)}
          onError={(e) => {
            e.target.src = "/default-image.png";
          }}
        />
      ) : (
        <video
          src={url}
          controls
          style={{ ...styles.image, objectFit: "contain" }}
          onClick={() => navigate(`/recipe/${recipe._id}`)}
          onError={(e) => {
            e.target.poster = "/default-image.png";
          }}
        />
      )}

      <CardContent
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Box sx={styles.uploaderBox}>
            <Avatar
              src={
                recipe.user?.profileImage?.startsWith("/uploads")
                  ? `http://localhost:5000${recipe.user.profileImage}`
                  : recipe.user?.profileImage || "/default-user.png"
              }
            />
            <Box sx={{ ml: 1 }}>
              <Typography variant="subtitle2" fontWeight="bold">
                {uploader}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <CalendarTodayIcon
                  sx={{ fontSize: 16, color: "gray", mr: 0.5 }}
                />
                <Typography variant="caption" color="text.secondary">
                  {recipe.createdAt
                    ? new Date(recipe.createdAt).toLocaleDateString()
                    : "Unknown Date"}
                </Typography>
              </Box>
              {recipe.location && (
                <Box sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
                  <LocationOnIcon
                    sx={{ fontSize: 16, color: "gray", mr: 0.5 }}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    noWrap
                    sx={{
                      maxWidth: "120px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {recipe.location}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          <Typography
            variant="h6"
            sx={{ ...styles.title, cursor: "pointer" }}
            onClick={() => navigate(`/recipe/${recipe._id}`)}
          >
            {recipe.title}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 1,
              height: "40px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {recipe.description || "No description provided"}
          </Typography>

          <Box sx={styles.tagsBox}>
            {recipe.tags?.length > 0 ? (
              <>
                {recipe.tags.slice(0, 3).map((tag, index) => (
                  <Typography
                    key={index}
                    variant="caption"
                    sx={styles.tag}
                    onClick={() => navigate(`/search/tag/${tag}`)}
                  >
                    #{tag}
                  </Typography>
                ))}
                {recipe.tags.length > 3 && (
                  <Typography
                    variant="caption"
                    sx={{
                      ...styles.tag,
                      backgroundColor: "#ff8a33",
                      color: "#fff",
                    }}
                    onClick={() => navigate(`/recipe/${recipe._id}`)}
                  >
                    +{recipe.tags.length - 3}
                  </Typography>
                )}
              </>
            ) : (
              <Typography
                variant="caption"
                sx={{
                  ...styles.tag,
                  backgroundColor: "#f0f0f0",
                  color: "#999",
                }}
              >
                No tags
              </Typography>
            )}
          </Box>

          <Box sx={styles.recipeInfo}>
            <Box sx={styles.infoItem}>
              <AccessTimeIcon sx={{ fontSize: 16 }} />
              <Typography variant="caption" sx={{ ml: 0.5 }}>
                {recipe.cookingTime || 25} mins
              </Typography>
            </Box>
            <Box sx={styles.infoItem}>
              <GroupsIcon sx={{ fontSize: 16 }} />
              <Typography variant="caption" sx={{ ml: 0.5 }}>
                {recipe.servings || 4} servings
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ marginTop: "auto", paddingTop: "0px" }}>
          <Box sx={styles.actions}>
            <Box sx={styles.iconGroup}>
              <IconButton onClick={handleLike} sx={styles.iconButton}>
                {liked ? (
                  <FavoriteIcon sx={styles.iconSvg} />
                ) : (
                  <FavoriteBorderIcon sx={styles.iconSvg} />
                )}
              </IconButton>
              <Typography variant="body2">{likes}</Typography>
            </Box>

            <Box sx={styles.iconGroup}>
              <IconButton onClick={handleShowLikes} sx={styles.iconButton}>
                <PeopleAltOutlinedIcon sx={styles.iconSvg} />
              </IconButton>
            </Box>

            <Box sx={styles.iconGroup}>
              <IconButton
                onClick={() => setShowComments(!showComments)}
                sx={styles.iconButton}
              >
                <ChatBubbleOutlineIcon sx={styles.iconSvg} />
              </IconButton>
              <Typography variant="body2">{commentsCount}</Typography>
            </Box>
          </Box>

          {showComments && <CommentSection recipeId={recipe._id} />}
        </Box>
      </CardContent>

      <Dialog open={showLikes} onClose={() => setShowLikes(false)}>
        <DialogTitle>People who liked this recipe</DialogTitle>
        <DialogContent>
          {likeUsers.length > 0 ? (
            <List>
              {likeUsers.map((user, i) => (
                <ListItem key={i}>
                  <ListItemText primary={user} />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography>No likes yet.</Typography>
          )}
          <Button onClick={() => setShowLikes(false)}>Close</Button>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export default RecipeCard;

const styles = {
  card: {
    width: "100%",
    maxWidth: 500,
    height: 550,
    margin: "auto",
    borderRadius: "15px",
    overflow: "hidden",
    boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.08)",
    backgroundColor: "#fff",
    display: "flex",
    flexDirection: "column",
  },
  image: {
    width: "100%",
    height: 260,
    objectFit: "cover",
    objectPosition: "center",
    cursor: "pointer",
    aspectRatio: "3/2",
  },
  uploaderBox: {
    display: "flex",
    alignItems: "center",
    marginBottom: 1,
  },
  title: {
    fontWeight: "bold",
    marginTop: 1,
    height: "28px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "-webkit-box",
    WebkitLineClamp: 1,
    WebkitBoxOrient: "vertical",
  },
  recipeInfo: {
    display: "flex",
    gap: 2,
    marginTop: 1,
    marginBottom: 0,
  },
  infoItem: {
    display: "flex",
    alignItems: "center",
  },
  actions: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 0,
  },
  iconGroup: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  iconButton: {
    color: "#ff6600",
  },
  iconSvg: {
    fontSize: 20,
  },
  tagsBox: {
    display: "flex",
    flexWrap: "nowrap",
    gap: "6px",
    marginBottom: "8px",
    overflow: "hidden",
  },
  tag: {
    backgroundColor: "#f2f2f2",
    color: "#ff8a33",
    borderRadius: "12px",
    padding: "4px 8px",
    fontWeight: "bold",
    fontSize: "0.75rem",
    cursor: "pointer",
  },
};
