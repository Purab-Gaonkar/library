// src/components/Navbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import the Auth context
import './Navbar.css'; // Optional: Add your CSS for styling

const Navbar = () => {
    const { user, logout } = useAuth(); // Get user and logout function from context
    const navigate = useNavigate(); // Initialize useNavigate

    const handleLogout = () => {
        logout(); // Call logout functions
        navigate('/login'); // Redirect to login page
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">Library Management</Link>
                <ul className="navbar-menu">
                    {user && user.role === 'admin' && ( // Admin links
                        <>
                            <li><Link to="/admin">Admin Dashboard</Link></li>
                            <li><Link to="/add-book">Add Book</Link></li>
                            <li><Link to="/pending-returns">Pending Returns</Link></li>
                        </>
                    )}
                    {user && user.role === 'user' && ( // User links
                        <>
                            <li><Link to="/user">User Dashboard</Link></li>
                            <li><Link to="/list">List of Books</Link></li>
                            <li><Link to="/pending-returns">Pending Returns</Link></li>
                        </>
                    )}
                    {!user && ( // Links for unauthenticated users
                        <>
                            <li><Link to="/login">Login</Link></li>
                            <li><Link to="/register">Register</Link></li>
                        </>
                    )}
                    {user && <li onClick={handleLogout} style={{ cursor: 'pointer' }}>Logout</li>} {/* Logout link */}
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
