import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const sha256Hash = (input: string | undefined) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    return crypto.subtle.digest('SHA-256', data).then((buffer) => {
      const hashArray = Array.from(new Uint8Array(buffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      return hashHex;
    });
  };
  const API_URL = 'http://localhost:3000';
  const saveUser = async (username: string, hashedPassword: string) => {
    try {
      //  build whatever additional fields your table needs
      const payload = {
        username: username,
        password: hashedPassword,
        email: '',          // add real email if you collect it
        ranking: 0,         // defaults that match your /user route
        verified: false,
        groups: [],
        reviews: [],
        last_active: new Date().toISOString(),
        flagged: false,
      };
      console.log(payload)
      const res = await fetch(`${API_URL}/user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      console.log(res.ok)
      if (!res.ok) {
        // backend returns { error: "..."} on failure
        const { error } = await res.json();
        throw new Error(error ?? 'Failed to create user');
      }
  
      // optional – get the user row that the backend echoes back
      const { user } = await res.json();
      console.log('User created:', user);
      // you could store something like user.id in localStorage/session here
    } catch (err) {
      // surface the error in the UI
      setError((err as Error).message);
    }
  };
  
  const handleLogin = async () => {
    try {
      if (!username || !password) {
        setError('Username and password are required');
        return;
      }
  
      // Hash the combination of username + password
      const hash = await sha256Hash(username + password);
  
      // Query Supabase for the user with the matching username
      // const res = await fetch(`${API_URL}/user?username=${encodeURIComponent(username)}`);
      // const users = await res.json();
  
      // if (!Array.isArray(users) || users.length === 0) {
      //   setError('User not found');
      //   return;
      // }

      // const user = users.find(user => user.username === username) // find corresponding user
      // if (user.password !== hash) {
      //   setError('Incorrect password');
      //   return;
      // }

      const res = await fetch(`${API_URL}/user?username=${encodeURIComponent(username)}`);
      const user = await res.json();
  
      if (!user || !user.password) {
        setError('User not found');
        return;
      }
  
      if (user.password !== hash) {
        setError('Incorrect password');
        return;
      }
  
      // If all checks pass
      localStorage.setItem('authenticated', 'true');
      localStorage.setItem('username', username); // optionally store user info
      navigate('/'); // redirect to homepage or dashboard
    } catch (err) {
      console.error(err);
      setError('Login failed');
    }
  };

  const handleRegister = () => {
    if (!username || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    sha256Hash(username + password)
      .then((hashedPassword) => {
        saveUser(username, hashedPassword);
        setIsRegistering(false);
        setUsername('');
        setPassword('');
        setConfirmPassword('');
        setError('');
      })
      .catch((err) => {
        setError('Error creating user: ' + err);
      });
  };

  return (
    <div className="login-box">
      <h2>{isRegistering ? 'Create New Account' : 'Login to MinuteMatch'}</h2>

      <input
        className="login-input"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        className="login-input"
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {isRegistering && (
        <input
          className="login-input"
          placeholder="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      )}

      <button
        className="login-button"
        onClick={isRegistering ? handleRegister : handleLogin}
      >
        {isRegistering ? 'Register' : 'Login'}
      </button>

      <button
        className="make-user-button"
        onClick={() => {
          setIsRegistering(!isRegistering);
          setError('');
          setUsername('');
          setPassword('');
          setConfirmPassword('');
        }}
      >
        {isRegistering ? 'Back to Login' : 'New User'}
      </button>

      <div className="make-user-error">{error}</div>
    </div>
  );
}
