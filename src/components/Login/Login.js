// Login.js
import { useState, useEffect } from 'react';
import { auth } from '../../firebase/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isNewUser, setIsNewUser] = useState(false); // Toggle login/signup
  const navigate = useNavigate();

  useEffect(() => {
    // Check login state and redirect if user is logged in
    onAuthStateChanged(auth, (user) => {
      if (user) navigate('/menu'); // Redirect to menu page on login
    });
  }, [navigate]);

  const handleLoginOrSignup = async () => {
    try {
      if (isNewUser) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
  };

  return (
    <div>
      <h2>{isNewUser ? 'Sign Up' : 'Login'}</h2>
      <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleLoginOrSignup}>
        {isNewUser ? 'Sign Up' : 'Login'}
      </button>
      <button onClick={() => setIsNewUser(!isNewUser)}>
        {isNewUser ? 'Switch to Login' : 'Switch to Sign Up'}
      </button>
    </div>
  );
};

export default Login;
