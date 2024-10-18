   // src/components/EditBook.js
   import React, { useEffect, useState } from 'react';
   import api from '../api/api';
   import { useParams, useNavigate } from 'react-router-dom'; // Import useNavigate

   const EditBook = () => {
       const { id } = useParams(); // Get the book ID from the URL
       const [book, setBook] = useState(null);
       const [error, setError] = useState(null);
       const [title, setTitle] = useState('');
       const [author, setAuthor] = useState('');
       const [isbn, setIsbn] = useState('');
       const [availableCopies, setAvailableCopies] = useState(1);
       const navigate = useNavigate(); // Initialize useNavigate

       useEffect(() => {
           const fetchBook = async () => {
               try {
                   const response = await api.get(`/api/books/${id}`);
                   setBook(response.data);
                   setTitle(response.data.title);
                   setAuthor(response.data.author);
                   setIsbn(response.data.isbn);
                   setAvailableCopies(response.data.available_copies);
               } catch (err) {
                   setError('Error fetching book details.');
                   console.error(err);
               }
           };

           fetchBook();
       }, [id]);

       const handleSubmit = async (e) => {
           e.preventDefault();
           try {
               await api.put(`/api/books/${id}`, { title, author, isbn, available_copies: availableCopies });
               alert('Book updated successfully!');
               navigate('/admin'); // Redirect to admin dashboard after successful update
           } catch (err) {
               setError('Error updating book.');
               console.error('Update error:', err.response ? err.response.data : err);
           }
       };

       // Update availableCopies to be a number
       const handleAvailableCopiesChange = (e) => {
           setAvailableCopies(Number(e.target.value)); // Convert to number
       };

       if (error) return <p>{error}</p>;
       if (!book) return <p>Loading...</p>;

       return (
           <div>
               <h2>Edit Book</h2>
               <form onSubmit={handleSubmit}>
                   <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
                   <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} required />
                   <input type="text" value={isbn} onChange={(e) => setIsbn(e.target.value)} required />
                   <input type="number" value={availableCopies} onChange={handleAvailableCopiesChange} required />
                   <button type="submit">Save Changes</button>
               </form>
           </div>
       );
   };

   export default EditBook;
