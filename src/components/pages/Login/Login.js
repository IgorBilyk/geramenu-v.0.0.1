import { useState, useEffect } from "react";
import { auth, db } from "../../../firebase/firebase"; // Import Firestore (db)
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth";
import { setDoc, doc } from "firebase/firestore"; // Firestore functions
import { useNavigate } from "react-router-dom";

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
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Add user to Firestore database
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: user.email,
        });

      } else {
        // Sign in existing user
        await signInWithEmailAndPassword(auth, email, password);
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
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error:", error.message);
      setError(error.message);
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
    <div className="flex min-h-[100vh] justify-center items-center bg-gray-100">
      <form className="w-[40%] p-8 bg-white shadow-md rounded-md border-2">
        <h2 className="text-2xl font-bold mb-5 text-center">
          {isNewUser ? "Sign Up" : "Login"}
        </h2>
        
        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="flex flex-col gap-4 mb-5">
          <input
            type="email"
            placeholder="Email"
            className="border p-3 rounded-md"
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="border p-3 rounded-md"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="flex justify-around mb-5">
          <button
            onClick={handleLoginOrSignup}
            className="bg-blue-500 text-white py-2 px-6 rounded-md hover:bg-blue-600"
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : isNewUser ? "Sign Up" : "Login"}
          </button>
          <button
            type="button"
            onClick={() => setIsNewUser(!isNewUser)}
            className="text-blue-500 underline"
          >
            {isNewUser ? "Switch to Login" : "Switch to Sign Up"}
          </button>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full bg-red-500 text-white py-2 px-6 rounded-md hover:bg-red-600 mb-5"
        >
          Sign in with Google
        </button>

        <div className="text-center">
          <button
            type="button"
            onClick={handlePasswordReset}
            className="text-blue-500 underline"
          >
            Forgot Password?
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;
