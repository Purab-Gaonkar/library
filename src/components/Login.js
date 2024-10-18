// src/components/Login.js
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import './Login.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/login', {
                username: email, // Ensure this matches the expected field
                password: password,
            });
            console.log('Login successful:', response.data);
            login(response.data); // Call the login function to set user data

            // Check user role and redirect accordingly
            if (response.data.user.role === 'admin') {
                navigate('/admin'); // Redirect to Admin Dashboard
            } else {
                navigate('/user'); // Redirect to User Dashboard
            }
        } catch (error) {
            console.error('Login error:', error);
            setError('Invalid credentials. Please try again.'); // Set error message
        }
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default Login;
