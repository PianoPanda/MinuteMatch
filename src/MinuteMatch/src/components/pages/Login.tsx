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

  const saveUser = (username: string, hashedPassword: string) => {
    // Once Supabase is implemented, we can get rid of this
    // if (localStorage.getItem('users')) {
    //   localStorage.removeItem('users');
    // }
    const userData = `${username}:${hashedPassword}\n`;
    const existingUsers = localStorage.getItem('users') || '';
    localStorage.setItem('users', existingUsers + userData);
    console.log(localStorage.getItem('users'))
  };

  const handleLogin = () => {
    const users = localStorage.getItem('users') || '';
    const lines = users.split('\n');
    const match = lines.find(line => {
      const [storedUser, storedHash] = line.split(':');
      return storedUser === username;
    });

    if (!match) {
      setError('User not found');
      return;
    }

    sha256Hash(username + password).then(hash => {
      const [storedUser, storedHash] = match.split(':');
      if (hash === storedHash) {
        localStorage.setItem('authenticated', 'true');
        navigate('/'); // Or whatever your main page is
      } else {
        setError('Incorrect password');
      }
    });
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
