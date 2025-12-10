import React, { useState, useEffect, useCallback, forwardRef } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  IconButton,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  Slide,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import DeleteIcon from "@mui/icons-material/Delete";
import ReplyIcon from "@mui/icons-material/Reply";
import CloseIcon from "@mui/icons-material/Close";
import { useSnackbar } from "../components/context/SnackbarContext";
import { useConfirmDialog } from "../components/context/ConfirmDialogContext";

/* ---------- Dialog transition (נחמדות UX) ---------- */
const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="down" ref={ref} {...props} />;
});

/* ---------- Component ---------- */
function CommentSection({ recipeId, onClose }) {
  /* UI state */
  const [open, setOpen] = useState(true); // Dialog visibility
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const { showSnackbar } = useSnackbar();
  const { showConfirmDialog } = useConfirmDialog();

  /* Auth */
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  /* Helpers ------------------------------------------------------------ */
  const getImageUrl = (url) =>
    !url
      ? "/default-user.png"
      : url.startsWith("http")
        ? url
        : `http://localhost:5000${url}`;

  /* Fetch & build tree -------------------------------------------------- */
  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/comments/${recipeId}`);
      const data = await res.json();
      setComments(buildCommentTree(data));
    } catch (err) {
      console.error("❌ Error fetching comments:", err);
    }
  }, [recipeId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const buildCommentTree = (flat) => {
    const map = {};
    flat.forEach((c) => (map[c._id] = { ...c, replies: [] }));
    const tree = [];
    flat.forEach((c) => {
      c.parentComment && map[c.parentComment]
        ? map[c.parentComment].replies.push(map[c._id])
        : tree.push(map[c._id]);
    });
    return tree;
  };

  /* Actions ------------------------------------------------------------- */
  const handleAddComment = async () => {
    if (!token) {
      showSnackbar({
        message: "You must be logged in to comment!",
        severity: "error",
        requireAction: true,
      });
      return;
    }
    try {
      const res = await fetch(
        `http://localhost:5000/api/comments/${recipeId}${replyingTo ? `/${replyingTo}` : ""}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: newComment }),
        },
      );
      if (res.ok) {
        setNewComment("");
        setReplyingTo(null);
        fetchComments();
      }
    } catch {
      showSnackbar({
        message: "Failed to add comment",
        severity: "error",
        requireAction: true,
      });
    }
  };
  const handleDeleteComment = async (id) => {
    if (!token) {
      showSnackbar({
        message: "You must be logged in to delete a comment!",
        severity: "error",
        requireAction: true,
      });
      return;
    }

    showConfirmDialog({
      title: "Delete Comment",
      message: "Are you sure you want to delete this comment?",
      onConfirm: async () => {
        try {
          const res = await fetch(`http://localhost:5000/api/comments/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            showSnackbar({
              message: "Comment deleted successfully",
              severity: "success",
            });
            fetchComments();
          } else {
            showSnackbar({
              message: "Failed to delete comment",
              severity: "error",
              requireAction: true,
            });
          }
        } catch {
          showSnackbar({
            message: "An error occurred while deleting the comment",
            severity: "error",
            requireAction: true,
          });
        }
      },
    });
  };
  const handleLikeComment = async (id) => {
    if (!token) {
      showSnackbar({
        message: "You must be logged in to like a comment!",
        severity: "error",
        requireAction: true,
      });
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/comments/like/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        fetchComments();
      } else {
        showSnackbar({
          message: "Failed to like comment.",
          severity: "error",
          requireAction: true,
        });
      }
    } catch {
      showSnackbar({
        message: "Server error while liking comment.",
        severity: "error",
        requireAction: true,
      });
    }
  };

  /* Render -------------------------------------------------------------- */
  const renderComment = (c, level = 0) => (
    <Box key={c._id} sx={{ ...sx.commentBox, ml: level * 4 }}>
      {/* header */}
      <Box sx={sx.commentHeader}>
        <Avatar src={getImageUrl(c.user?.profileImage)} sx={sx.avatar} />
        <Typography variant="body2" sx={sx.username}>
          <strong>{c.user?.username || "User"}:</strong>
        </Typography>
      </Box>

      <Typography variant="body2" sx={sx.commentText}>
        {c.text}
      </Typography>

      {/* actions */}
      <Box sx={sx.actions}>
        <IconButton
          onClick={() => handleLikeComment(c._id)}
          sx={{
            ...sx.iconButton,
            color: c.likes?.some((id) => id.toString() === userId)
              ? "#ff6600"
              : "inherit",
          }}
        >
          <FavoriteIcon fontSize="small" />
          <Typography variant="caption" sx={{ ml: 0.5 }}>
            {c.likes?.length || 0}
          </Typography>
        </IconButton>

        <IconButton onClick={() => setReplyingTo(c._id)} sx={sx.iconButton}>
          <ReplyIcon fontSize="small" />
        </IconButton>

        {c.user?._id === userId && (
          <IconButton
            onClick={() => handleDeleteComment(c._id)}
            sx={sx.iconButton}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      {/* nested replies */}
      {c.replies?.map((r) => renderComment(r, level + 1))}
    </Box>
  );

  /* Close handler – informs parent (RecipeCard) */
  const handleClose = () => {
    setOpen(false);
    onClose && onClose();
  };

  /* -------------------------------------------------------------------- */
  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      fullWidth
      maxWidth="sm"
      onClose={handleClose}
      PaperProps={{ sx: { p: 2 } }}
    >
      <DialogTitle
        sx={{ m: 0, p: 0, mb: 2, display: "flex", alignItems: "center" }}
      >
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, pl: 1 }}>
          Comments
        </Typography>
        <IconButton onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers={false} sx={{ p: 0 }}>
        {/* ----- List / Empty state ----- */}
        {comments.length === 0 ? (
          <Typography sx={sx.noCommentsText}>
            No comments yet. Be the first to comment! 💬
          </Typography>
        ) : (
          <Box sx={{ mt: 3 }}>{comments.map((c) => renderComment(c))}</Box>
        )}
        {/* ----- Add comment box ----- */}
        <Box sx={sx.writeArea}>
          <TextField
            label={replyingTo ? "Reply to comment…" : "Add a comment…"}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            fullWidth
            required
            multiline
            rows={3}
            variant="outlined"
            sx={sx.input}
          />
          <Button onClick={handleAddComment} variant="contained" sx={sx.button}>
            Post
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default CommentSection;

/* ---------- styles ---------- */
const sx = {
  /* dialog layout */
  writeArea: {
    mb: 3,
    px: 1,
    display: "flex",
    flexDirection: "column",
    gap: 1,
  },
  /* comments list */
  commentBox: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    mb: "15px",
    p: "12px",
    backgroundColor: "#fff",
    borderRadius: 4,
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  commentHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  avatar: { width: 32, height: 32 },
  username: { fontWeight: 500, color: "#333", fontSize: "14px" },
  commentText: { color: "#555", fontSize: "14px" },
  /* input */
  input: { backgroundColor: "#fafafa", borderRadius: 2 },
  button: {
    alignSelf: "flex-end",
    mt: 1,
    backgroundColor: "#ff6600",
    color: "#fff",
    fontSize: "14px",
    borderRadius: 20,
    "&:hover": { backgroundColor: "#ff5722" },
  },
  /* actions */
  actions: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  iconButton: {
    color: "#ff6600",
    p: "8px",
    borderRadius: "50%",
    "&:hover": {
      backgroundColor: "rgba(255,102,0,0.1)",
      transform: "scale(1.1)",
    },
  },
  noCommentsText: {
    fontStyle: "italic",
    color: "#666",
    textAlign: "center",
    mt: 4,
  },
};
