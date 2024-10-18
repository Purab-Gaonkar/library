// src/components/UserDashboard.js
import React, { useState, useEffect } from 'react';
import useBooks from '../hooks/useBooks';
import api from '../api/api';
import './UserDashboard.css';

const UserDashboard = () => {
    const { books, loading, error } = useBooks();
    const [borrowedBooks, setBorrowedBooks] = useState([]);

    // Fetch borrowed books on component mount
    useEffect(() => {
        const fetchBorrowedBooks = async () => {
            try {
                const response = await api.get('/api/borrowed-books');
                setBorrowedBooks(response.data);
            } catch (err) {
                console.error('Error fetching borrowed books:', err.response ? err.response.data : err);
                alert('Error fetching borrowed books. Please try again.');
            }
        };
        fetchBorrowedBooks();
    }, []); // Empty dependency array means this runs once on mount

    const handleBorrowBook = async (bookId) => {
        try {
            await api.post('/api/borrow', { bookId });
            // Fetch the updated borrowed books list after borrowing
            const response = await api.get('/api/borrowed-books');
            setBorrowedBooks(response.data);
            alert('Book borrowed successfully!');
        } catch (err) {
            console.error('Error borrowing book:', err);
            alert('Error borrowing book. Please try again.');
        }
    };

    const handleReturnBook = async (borrowId) => {
        try {
            await api.post('/api/return', { borrowId });
            // Fetch the updated borrowed books list after returning
            const response = await api.get('/api/borrowed-books');
            setBorrowedBooks(response.data);
            alert('Book returned successfully!');
        } catch (err) {
            console.error('Error returning book:', err);
            alert('Error returning book. Please try again.');
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error fetching books: {error}</p>;
    if (!books || books.length === 0) return <p>No books available.</p>; // Handle empty books

    return (
        <div className="user-dashboard">
            <h2>User Dashboard</h2>
            <h3>Available Books</h3>
            <table>
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Author</th>
                        <th>ISBN</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {books.map((book) => (
                        <tr key={book.id}>
                            <td>{book.title}</td>
                            <td>{book.author}</td>
                            <td>{book.isbn}</td>
                            <td>
                                <button onClick={() => handleBorrowBook(book.id)}>Borrow</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <h3>Borrowed Books</h3>
            <table>
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Borrow Date</th>
                        <th>Return Date</th>
                        <th>Fine</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {borrowedBooks.map((book) => (
                        <tr key={book.id}>
                            <td>{book.title || 'Unknown'}</td>
                            <td>{new Date(book.borrow_date).toLocaleDateString()}</td>
                            <td>{book.return_date ? new Date(book.return_date).toLocaleDateString() : 'Not returned'}</td>
                            <td>{book.fine}</td>
                            <td>
                                <button onClick={() => handleReturnBook(book.id)}>Return</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default UserDashboard;
