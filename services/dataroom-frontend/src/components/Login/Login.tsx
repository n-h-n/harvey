// src/views/Login/Login.tsx
import React, { useState } from 'react';
import { useAuthContext } from '../../context/AuthContext';

const Login: React.FC = () => {
  const { login } = useAuthContext();
  const [username, setUsername] = useState('');


  const handleLogin = () => {
    login(username);
  };

  return (
    <div>
      <h1>Login</h1>
      <label>
        Username:
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
      </label>
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default Login;
