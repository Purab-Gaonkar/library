// src/components/AddBook.js
import React, { useState } from 'react';
import api from '../api/api';
import './AddBook.css';

const AddBook = () => {
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [isbn, setIsbn] = useState('');
    const [availableCopies, setAvailableCopies] = useState(1); // New state for available copies
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        try {
            await api.post('/api/books', { title, author, isbn, available_copies: availableCopies }); // Include available copies
            setSuccess(true);
            setTitle('');
            setAuthor('');
            setIsbn('');
            setAvailableCopies(1); // Reset available copies
        } catch (err) {
            setError('Error adding book. Please try again.');
            console.error(err);
        }
    };

    return (
        <div className="add-book-container">
            <h2>Add a New Book</h2>
            {error && <p className="error">{error}</p>}
            {success && <p className="success">Book added successfully!</p>}
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                <input type="text" placeholder="Author" value={author} onChange={(e) => setAuthor(e.target.value)} required />
                <input type="text" placeholder="ISBN" value={isbn} onChange={(e) => setIsbn(e.target.value)} required />
                <input type="number" placeholder="Available Copies" value={availableCopies} onChange={(e) => setAvailableCopies(e.target.value)} min="1" required /> {/* New input for available copies */}
                <button type="submit">Add Book</button>
            </form>
        </div>
    );
};

export default AddBook;