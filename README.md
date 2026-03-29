**Geek Text: An Online Bookstore API Service**

Geek Text is an API service that supports an online web application bookstore that targets books related to technology. This system allows users to browse and sort books, manage profiles, interact with shopping carts, provide ratings and comments on books, and maintain wish lists.

The application is designed by utilizing Node.js and SQLite.

**Features**

**1) Book Browsing and Sorting**

Users can search and sort books using multiple criteria.

API capabilities include:
Retrieve books by genre
Retrieve top 10 best-selling books
Retrieve books with ratings greater than or equal to a specified value
Apply discounts to books by publisher

**2) Profile Management**

Users can create and manage personal profiles that store their information.

API capabilities include:
Create user account with username, password, and optional fields
Retrieve user profile information
Update user profile fields (except for mail)
Create credit card information associated with a user

**3) Shopping Cart**

Users can manage books they plan on purchasing.

API capabilities include:
Add books to shopping cart
Remove books from shopping cart
Retrieve books currently in shopping cart
Calculate subtotal price of items in cart

**4) Book Details**

Administrators can manage detailed information about books and authors.

API capabilities include:
Create books with ISBN, title, description, price, author, genre, publisher, year published, and copies sold
Retrieve book details using ISBN
Create authors with biography and publisher information
Retrieve books associated with an author

**5) Book Rating and Commenting**

Users can provide feedback and comment on books.

API capabilities include:
Create 5-star ratings for books
Create comments with datestamps
Retrieve all comments for a particular book
Calculate and retrieve average rating for a book

**6) Wish List Management**

Users can create wish lists to save books for future interest.

API capabilities include:
Create wish lists associated with a user
Add books to wish list
Remove books from wish list
Move books from wish list to shopping cart
Retrieve books in wish list
