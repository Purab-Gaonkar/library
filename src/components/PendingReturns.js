// src/components/PendingReturns.js
import React, { useEffect, useState } from 'react';
import api from '../api/api';
import './PendingReturns.css';

const PendingReturns = () => {
    const [pendingReturns, setPendingReturns] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPendingReturns = async () => {
            try {
                const response = await api.get('/api/pending-returns');
                setPendingReturns(response.data);
            } catch (err) {
                setError('Error fetching pending returns.');
                console.error(err);
            }
        };

        fetchPendingReturns();
    }, []);

    if (error) return <p className="error">{error}</p>;
    if (!pendingReturns.length) return <p>No pending returns.</p>;

    return (
        <div className="pending-returns-container">
            <h2>Pending Returns</h2>
            <table>
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Book Title</th>
                        <th>Borrow Date</th>
                        <th>Return Date</th>
                    </tr>
                </thead>
                <tbody>
                    {pendingReturns.map((item, index) => (
                        <tr key={index}>
                            <td>{item.username}</td>
                            <td>{item.title}</td>
                            <td>{new Date(item.borrow_date).toLocaleDateString()}</td>
                            <td>{item.return_date ? new Date(item.return_date).toLocaleDateString() : 'Not Returned'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default PendingReturns;
