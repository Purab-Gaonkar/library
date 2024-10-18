-- Create Users Table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user'
);

-- Create Books Table
CREATE TABLE books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    isbn VARCHAR(20) NOT NULL UNIQUE,
    available_copies INT DEFAULT 1
);

-- Create Borrows Table
CREATE TABLE borrows (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    book_id INT,
    borrow_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    return_date DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (book_id) REFERENCES books(id)
);

-- Stored Procedure to Borrow a Book
DELIMITER //
CREATE PROCEDURE BorrowBook(
    IN userId INT,
    IN bookId INT
)
BEGIN
    DECLARE availableCopies INT;
    DECLARE borrowedCopies INT;

    -- Get the total number of copies of the book
    SELECT available_copies INTO availableCopies FROM books WHERE id = bookId;

    -- Check how many copies are currently borrowed
    SELECT COUNT(*) INTO borrowedCopies FROM borrows WHERE book_id = bookId AND return_date IS NULL;

    -- Calculate available copies
    SET availableCopies = availableCopies - borrowedCopies;

    IF availableCopies > 0 THEN
        INSERT INTO borrows (user_id, book_id, borrow_date)
        VALUES (userId, bookId, NOW());
    ELSE
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Book is currently borrowed by someone else.';
    END IF;
END //
DELIMITER ;

-- Trigger for Updating Available Copies After a Book is Borrowed
DELIMITER //
CREATE TRIGGER AfterBookBorrow
AFTER INSERT ON borrows
FOR EACH ROW
BEGIN
    UPDATE books
    SET available_copies = available_copies - 1
    WHERE id = NEW.book_id;
END //
DELIMITER ;

-- Trigger for Updating Available Copies After a Book is Returned
DELIMITER //
CREATE TRIGGER AfterBookReturn
AFTER UPDATE ON borrows
FOR EACH ROW
BEGIN
    IF NEW.return_date IS NOT NULL THEN
        UPDATE books
        SET available_copies = available_copies + 1
        WHERE id = NEW.book_id;
    END IF;
END //
DELIMITER ;

-- Stored Procedure to Return a Book
DELIMITER $$

DELIMITER //
CREATE PROCEDURE ReturnBook(
    IN borrowId INT
)
BEGIN
    DECLARE borrow_date DATETIME;
    DECLARE due_date DATETIME;
    DECLARE fine_per_day INT DEFAULT 10; -- Fine per day if overdue
    DECLARE overdue_days INT;
    DECLARE total_fine INT;

    -- Get the borrow date from the borrows table
    SELECT borrow_date INTO borrow_date 
    FROM borrows 
    WHERE id = borrowId;

    -- Calculate the due date (e.g., 14 days after the borrow date)
    SET due_date = DATE_ADD(borrow_date, INTERVAL 14 DAY);

    -- Calculate overdue days (if any)
    SET overdue_days = DATEDIFF(NOW(), due_date);

    -- If the book is overdue, calculate the fine
    IF overdue_days > 0 THEN
        SET total_fine = overdue_days * fine_per_day;
    ELSE
        SET total_fine = 0;
    END IF;

    -- Update the return date and fine in the borrows table
    UPDATE borrows
    SET return_date = NOW(), fine = total_fine
    WHERE id = borrowId;
END //
DELIMITER ;



SHOW TRIGGERS;


ALTER TABLE borrows ADD COLUMN fine INT DEFAULT 0;

CALL ReturnBook(8);


