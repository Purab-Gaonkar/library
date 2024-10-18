// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MySQL connection
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'library_management',
});

// Secret key for JWT
const JWT_SECRET = 'your_jwt_secret_key';



// Register route
app.post('/api/register', async (req, res) => {
    console.log('Request body:', req.body); // Log the request body
    const { name, email, password, role } = req.body; // Update to match incoming fields

    if (!name || !email) {
        return res.status(400).json({ message: 'Name and email are required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const [result] = await db.query(
            'INSERT INTO users (username, password, role) VALUES (?, ?, ?)', 
            [email, hashedPassword, role || 'user'] // Use email as username
        );
        res.status(201).json({ id: result.insertId, username: email, role });
    } catch (error) {
        console.error('Registration error:', error.message);
        console.error(error.stack);
        res.status(500).json({ message: 'User registration failed' });
    }
});

// Login route
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    console.log('Login attempt:', { username, password }); // Log the login attempt

    try {
        const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
        const user = rows[0];
        console.log('User found:', user); // Log the user found

        if (user && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
            res.json({ token, user }); // Ensure user object includes role
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Login error:', error.message);
        res.status(500).json({ message: 'Login failed' });
    }
});

// Middleware to authenticate JWT
const authenticateJWT = (req, res, next) => {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1]; // Get token from headers
    if (!token) {
        return res.sendStatus(401); // No token, unauthorized
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.sendStatus(403); // Token is invalid, forbidden
        }
        req.user = user; // Save user info to request
        next(); // Proceed to the next middleware or route handler
    });
};

// Middleware to check if user is admin
const checkAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
    }
    next();
};

// Fetch borrowed books for the authenticated user
app.get('/api/borrowed-books', authenticateJWT, async (req, res) => {
    const userId = req.user.id;

    try {
        // Test query to ensure DB connection works
        await db.query("SELECT 1");

        const [borrowedBooks] = await db.query(`
            SELECT 
                b.id, 
                b.user_id, 
                b.book_id, 
                b.borrow_date, 
                b.return_date, 
                b.fine, 
                bk.title, 
                bk.author 
            FROM borrows b
            JOIN books bk ON b.book_id = bk.id
            WHERE b.user_id = ?`, [userId]);

        res.status(200).json(borrowedBooks);
    } catch (err) {
        console.error('Error fetching borrowed books:', err);
        res.status(500).json({ message: 'Error fetching borrowed books.' });
    }
});

// Get all books
app.get('/api/books', authenticateJWT, async (req, res) => {
    try {
        const [books] = await db.query('SELECT * FROM books');
        res.json(books);
    } catch (error) {
        console.error('Error fetching books:', error.message);
        res.status(500).json({ message: 'Error fetching books' });
    }
});

// Add a new book
app.post('/api/books', authenticateJWT, checkAdmin, async (req, res) => {
    const { title, author, isbn, available_copies } = req.body; // Include available_copies

    try {
        const [result] = await db.query(
            'INSERT INTO books (title, author, isbn, available_copies) VALUES (?, ?, ?, ?)', 
            [title, author, isbn, available_copies] // Insert available_copies into the database
        );
        res.status(201).json({ id: result.insertId, title, author, isbn, available_copies });
    } catch (error) {
        console.error('Error adding book:', error.message);
        res.status(500).json({ message: 'Error adding book' });
    }
});
   // Get a specific book by ID
   app.get('/api/books/:id', authenticateJWT, async (req, res) => {
    const { id } = req.params; // Get the book ID from the request parameters

    try {
        const [book] = await db.query('SELECT * FROM books WHERE id = ?', [id]);
        if (book.length === 0) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.json(book[0]); // Return the first book found
    } catch (error) {
        console.error('Error fetching book:', error.message);
        res.status(500).json({ message: 'Error fetching book' });
    }
});
// Delete a book
app.delete('/api/books/:id', authenticateJWT, checkAdmin, async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await db.query('DELETE FROM books WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.sendStatus(204); // No content
    } catch (error) {
        console.error('Error deleting book:', error.message);
        res.status(500).json({ message: 'Error deleting book' });
    }
});

// Borrow a book
app.post('/api/borrow', authenticateJWT, async (req, res) => {
    const { bookId } = req.body;

    try {
        const [result] = await db.query('CALL BorrowBook(?, ?)', [req.user.id, bookId]);
        res.status(201).json({ message: 'Book borrowed successfully' });
    } catch (error) {
        console.error('Error borrowing book:', error.message);
        res.status(500).json({ message: error.message });
    }
});

// Return a book
app.post('/api/return', authenticateJWT, async (req, res) => {
    const { borrowId } = req.body;

    try {
        await db.query('CALL ReturnBook(?)', [borrowId]); // Ensure this is executed without errors
        res.status(200).json({ message: 'Book returned successfully' });
    } catch (error) {
        console.error('Error returning book:', error.message);
        res.status(500).json({ message: error.message });
    }
});


// Get pending returns (books borrowed by users)
app.get('/api/pending-returns', authenticateJWT, async (req, res) => {
    try {
        const [pendingReturns] = await db.query(`
            SELECT users.username, books.title, borrows.borrow_date, borrows.return_date
            FROM borrows
            JOIN users ON borrows.user_id = users.id
            JOIN books ON borrows.book_id = books.id
            WHERE borrows.return_date IS NULL
        `);
        res.json(pendingReturns);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching pending returns' });
    }
});

// Update a book
app.put('/api/books/:id', authenticateJWT, async (req, res) => {
    const { id } = req.params;
    const { title, author, isbn, available_copies } = req.body;

    try {
        const [result] = await db.query(
            'UPDATE books SET title = ?, author = ?, isbn = ?, available_copies = ? WHERE id = ?',
            [title, author, isbn, available_copies, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Book not found' });
        }

        res.status(200).json({ message: 'Book updated successfully' });
    } catch (error) {
        console.error('Error updating book:', error.message);
        res.status(500).json({ message: 'Error updating book' });
    }
});

// Server listening
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
