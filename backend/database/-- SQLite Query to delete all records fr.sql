-- SQLite Query to delete all records from the Author table
DELETE FROM BookAuthor;
DELETE FROM Book;
DELETE FROM Author;

DELETE FROM sqlite_sequence WHERE name='BookAuthor';
DELETE FROM sqlite_sequence WHERE name='Book';
DELETE FROM sqlite_sequence WHERE name='Author';


