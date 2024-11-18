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
  const [isNewUser, setIsNewUser] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) navigate("/");
    });
  }, [navigate]);

  const handleLoginOrSignup = async (e) => {
    e.preventDefault();

    setError("");
    setIsLoading(true);

    try {
      if (isNewUser) {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;

        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: user.email,
          createdAt: serverTimestamp(),
        });

        setItem("userID", user.uid);
      } else {
        const signedUser = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        setItem("userID", signedUser.user.uid);
      }
    } catch (error) {
      console.error("Error:", error.message);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      const userDocRef = doc(db, "users", user.uid);
      await setDoc(
        userDocRef,
        {
          uid: user.uid,
          email: user.email,
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );

      setItem("userID", user.uid);
    } catch (error) {
      console.error("Error:", error.message);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setError(
        "Por favor, introduza o seu e-mail para redefinir a palavra-passe."
      );
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setError(
        "Link de redefinição de palavra-passe enviado para o seu e-mail."
      );
    } catch (error) {
      console.error("Error:", error.message);
      setError(error.message);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 sm:flex-row sm:gap-10 lg:px-20">
      {/* Left Section */}
      <div className="w-full max-w-md space-y-6">
        <form
          className="bg-white p-6 shadow-md rounded-lg"
          onSubmit={handleLoginOrSignup}
        >
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-700">
              {isNewUser ? "Sign Up" : "Login"}
            </h2>
            <p className="text-gray-500">
              {isNewUser ? "Create a new account" : "Sign in to your account"}
            </p>
          </div>

          {error && <p className="mt-2 text-center text-red-500">{error}</p>}

          <div className="mt-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@gmail.com"
              className="mt-1 p-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div className="mt-4">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              required
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha"
              className="mt-1 p-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              onClick={handlePasswordReset}
              className="text-sm text-indigo-600 hover:underline"
            >
              Esqueceu-se da sua senha?
            </button>
          </div>

          <button
            type="submit"
            onClick={handleLoginOrSignup}
            disabled={isLoading}
            className="mt-6 w-full rounded-md bg-indigo-600 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {isLoading ? "Loading..." : isNewUser ? "Sign Up" : "Login"}
          </button>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-md border py-2 text-gray-700 hover:bg-gray-100"
          >
            <FcGoogle size={20} />
            Continue with Google
          </button>

          <div className="mt-4 text-center text-sm">
            <p>
              {isNewUser ? "Already have an account?" : "New here?"}{" "}
              <button
                type="button"
                onClick={() => setIsNewUser(!isNewUser)}
                className="text-indigo-600 hover:underline"
              >
                {isNewUser ? "Login" : "Sign Up"}
              </button>
            </p>
          </div>
        </form>
      </div>

      {/* Right Section */}
      <div className="hidden w-full max-w-lg sm:block">
        <img
          src="./assets/images/QR_bg.jpg"
          alt="Illustration"
          className="w-full rounded-lg"
        />
      </div>
    </div>
  );
};

export default Login;
