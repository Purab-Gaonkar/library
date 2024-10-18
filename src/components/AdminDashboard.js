// src/components/AdminDashboard.js
import React from 'react';
import useBooks from '../hooks/useBooks'; // Correct import
import api from '../api/api';
import './AdminDashboard.css';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const { books, loading, error, refetch } = useBooks();
    const navigate = useNavigate();

    const handleDeleteBook = async (id) => {
        try {
            await api.delete(`/api/books/${id}`);
            refetch(); // Refresh the book list
        } catch (err) {
            console.error('Error deleting book:', err);
        }
    };

    const handleEditBook = (id) => {
        navigate(`/edit-book/${id}`); // Navigate to edit book page
    };

    const handleViewBorrowedBooks = () => {
        navigate('/pending-returns'); // Navigate to the list of borrowed books
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error fetching books: {error.message}</p>;

    // Check if books is defined and is an array
    if (!books || !Array.isArray(books)) {
        return <p>No books available.</p>; // Handle the case where books is undefined or not an array
    }

    return (
        <div className="admin-dashboard">
            <h2>Admin Dashboard</h2>
            <h3>List of Books</h3>
            <table>
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Author</th>
                        <th>ISBN</th>
                        <th>Available</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {books.map((book) => (
                        <tr key={book.id}>
                            <td>{book.title}</td>
                            <td>{book.author}</td>
                            <td>{book.available_copies}</td>
                            <td>{book.isbn}</td>
                            <td>
                                <button onClick={() => handleEditBook(book.id)}>Edit</button>
                                <button onClick={() => handleDeleteBook(book.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <button onClick={() => navigate('/add-book')}>Add New Book</button>
            <button onClick={handleViewBorrowedBooks}>View Borrowed Books</button>
        </div>
    );
};

export default AdminDashboard;
