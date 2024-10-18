// src/hooks/useBooks.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const useBooks = () => {
    const { user } = useAuth(); // Get user from context
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchBooks = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/books', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`, // Include the token in the headers
                },
            });
            setBooks(response.data);
        } catch (err) {
            setError(err.message);
            console.error('Error fetching books:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBooks();
    }, []);

    return { books, loading, error, refetch: fetchBooks }; // Return refetch function
};

export default useBooks;