import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBV_yn6F-EUS2PL7UqU84x3d3RUS71EXCY",
  authDomain: "instafoodnew.firebaseapp.com",
  projectId: "instafoodnew",
  storageBucket: "instafoodnew.firebasestorage.app",
  messagingSenderId: "777134798899",
  appId: "1:777134798899:web:2b303de93cf0a6ec27cb46",
  measurementId: "G-1K0H7ENFCP",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
