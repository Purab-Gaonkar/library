import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar'; // Import the Navbar
import Login from './components/Login';
import Register from './components/Register';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import BorrowBook from './components/BorrowBook';
import ListOfBooks from './components/ListOfBooks';
import AddBook from './components/AddBook';
import PendingReturns from './components/PendingReturns';
import PrivateRoute from './components/PrivateRoute';
import EditBook from './components/EditBook';

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <Navbar /> {/* Include the Navbar here */}
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route element={<PrivateRoute />}>
                        <Route path="/admin" element={<AdminDashboard />} />
                        <Route path="/user" element={<UserDashboard />} />
                        <Route path="/borrow" element={<BorrowBook />} />
                        <Route path="/list" element={<ListOfBooks />} />
                        <Route path="/add-book" element={<AddBook />} />
                        <Route path="/pending-returns" element={<PendingReturns />} />
                        <Route path="/edit-book/:id" element={<EditBook />} />
                    </Route>
                    <Route path="/" element={<Login />} /> {/* Redirect to Login */}
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default App;
