// src/components/BorrowBook.js
import React, { useState, useEffect } from 'react';
import api from '../api/api';
import './BorrowBook.css';

const BorrowBook = () => {
    const [books, setBooks] = useState([]);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const response = await api.get('/api/books');
                setBooks(response.data);
            } catch (err) {
                setError('Error fetching books.');
                console.error(err);
            }
        };
        fetchBooks();
    }, []);

    const handleBorrowBook = async (bookId) => {
        try {
            await api.post('/api/borrow', { bookId }); // Ensure this endpoint exists
            setSuccess(true); // Set success message
        } catch (err) {
            setError('Error borrowing book. Please try again.');
            console.error(err);
        }
    };

    return (
        <div className="borrow-book-container">
            <h2>Borrow a Book</h2>
            {error && <p className="error">{error}</p>}
            {success && <p className="success">Book borrowed successfully!</p>}
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
        </div>
    );
};

export default BorrowBook;
