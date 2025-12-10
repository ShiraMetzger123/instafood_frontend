import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "../components/context/SnackbarContext";
import "../styles/authPages.css";

function EmailVerifiedPage() {
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    const hasShown = sessionStorage.getItem("emailVerifiedToast");

    if (!hasShown) {
      showSnackbar({
        message: "Email verified! Redirecting...",
        severity: "success",
      });
      sessionStorage.setItem("emailVerifiedToast", "true");
    }

    const timer = setTimeout(() => {
      const token = localStorage.getItem("token");
      navigate(token ? "/profile" : "/login");
    }, 4000);

    return () => clearTimeout(timer);
  }, [navigate, showSnackbar]);

  return (
    <div style={styles.background}>
      <div style={styles.overlay}>
        <div className="auth-form-box">
          <img
            src="/instaFood_small_logo.png"
            alt="InstaFood Logo"
            className="auth-logo"
          />
          <h1 className="auth-title">Email Verified Successfully!</h1>
          <p style={{ textAlign: "center" }}>
            Your email has been verified.
            <br />
            Redirecting shortly...
          </p>
        </div>
      </div>
    </div>
  );
}

export default EmailVerifiedPage;

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
    alignItems: "center",
    padding: "30px 20px",
  },
};
