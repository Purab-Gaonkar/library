// src/components/ListOfBooks.js
import React, { useEffect, useState } from 'react';
import api from '../api/api';
import './ListOfBooks.css';

const ListOfBooks = () => {
    const [books, setBooks] = useState([]);
    const [error, setError] = useState(null);

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

    if (error) return <p className="error">{error}</p>;

    return (
        <div className="list-of-books-container">
            <h2>List of Books</h2>
            <table>
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Author</th>
                        <th>ISBN</th>
                    </tr>
                </thead>
                <tbody>
                    {books.map((book) => (
                        <tr key={book.id}>
                            <td>{book.title}</td>
                            <td>{book.author}</td>
                            <td>{book.isbn}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ListOfBooks;
