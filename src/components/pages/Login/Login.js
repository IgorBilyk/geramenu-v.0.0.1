import { useState, useEffect } from "react";
import { FcGoogle } from "react-icons/fc";

import { auth, db } from "../../../firebase/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth";
import { setDoc, doc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { setItem } from "../../../utils/localStorage";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isNewUser, setIsNewUser] = useState(false); // Toggle login/signup
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const navigate = useNavigate();

  useEffect(() => {
    // Check login state and redirect if user is logged in
    onAuthStateChanged(auth, (user) => {
      if (user) navigate("/menu"); // Redirect to menu page on login
    });
  }, [navigate]);

  const handleLoginOrSignup = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors
    setIsLoading(true); // Set loading state

    try {
      if (isNewUser) {
        // Create new user
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        // Add user to Firestore database
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: user.email,
          createdAt: serverTimestamp(), // Store timestamp
        });

        setItem("userID", user.uid);
      } else {
        // Sign in existing user
        const signedUser = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        setItem("userID", signedUser.user.uid);
      }
    } catch (error) {
      console.error("Error:", error.message);
      setError(error.message); // Set error message
    } finally {
      setIsLoading(false); // Remove loading state
    }
  };

  const handleGoogleSignIn = async () => {
    setError(""); // Clear previous errors
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      // Add or update user info in Firestore
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(
        userDocRef,
        {
          uid: user.uid,
          email: user.email,
          createdAt: serverTimestamp(),
        },
        { merge: true } // Ensures existing users don't overwrite createdAt if already set
      );

      setItem("userID", user.uid);
    } catch (error) {
      console.error("Error:", error.message);
      setError(error.message); // Display error message to the user
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setError("Please enter your email to reset password.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setError("Password reset link sent to your email.");
    } catch (error) {
      console.error("Error:", error.message);
      setError(error.message);
    }
  };

  return (
    <div className="flex min-h-[100vh] justify-center items-center bg-gray-100 lg:gap-5 lg:px-20 rounded-md shadow-sm">
      <div class="sm:flex-1">
        <form className="  bg-white px-20">
          <h5>Icon</h5>
          <h2 className="text-2xl font-sbold mb-5 text-center">
            {isNewUser ? "Sign Up" : "Login"}
          </h2>
          <h2 className="m-4 text-gray-600">Transforme o seu <span className="font-bold">menu</span> em um QR Code em segundos – fácil, rápido e pronto para compartilhar!</h2>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <div className="flex flex-col gap-4 mb-5 ">
            <input
              required
              type="email"
              placeholder="Email"
              className="border p-3 rounded-md"
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              required
              type="password"
              placeholder="Password"
              className="border p-3 rounded-md"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="flex flex-col justify-around mb-5">
            <button
              onClick={handleLoginOrSignup}
              className="bg-[#16425b] text-white px-6 py-3 mb-2 rounded-md hover:bg-[#2c607e]"
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : isNewUser ? "Sign Up" : "Login"}
            </button>
            <button
              type="button"
              onClick={() => setIsNewUser(!isNewUser)}
              className="text-gray-500"
            >
              {isNewUser ? "Switch to Login" : "or Sign Up with email"}
            </button>
          </div>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className=" flex w-full text-[#16425b] py-2 px-6 rounded-md mb-5 border justify-center items-center"
          >
            <FcGoogle  className="mr-5"/>
            Sign in with Google
          </button>
          <div className="text-center">
            <button
              type="button"
              onClick={handlePasswordReset}
              className="text-gray-500"
            >
              Forgot Password?
            </button>
          </div>
        </form>
      </div>
      <div className="lg:flex-1 lg:block hidden">
        <h1>Crie Teu QR Menu </h1>

      </div>
    </div>
  );
};

export default Login;
