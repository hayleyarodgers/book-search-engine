import React, { useState, useEffect } from "react";
import {
	Jumbotron,
	Container,
	Col,
	Form,
	Button,
	Card,
	CardColumns,
} from "react-bootstrap";

// Import authorisation function
import Auth from "../utils/auth";

// Import helper functions for searching google API and saving to local storage
import { searchGoogleBooks } from "../utils/API";
import { saveBookIds, getSavedBookIds } from "../utils/localStorage";

// Import the `useMutation()` hook from Apollo Client
import { useMutation } from "@apollo/client";
// Import the GraphQL mutation for saving new books
import { SAVE_BOOK } from "../utils/mutations";

const SearchBooks = () => {
	// Create state for holding returned google API data
	const [searchedBooks, setSearchedBooks] = useState([]);
	// Create state for holding our search field data
	const [searchInput, setSearchInput] = useState("");
	// Create state to hold saved bookId values
	const [savedBookIds, setSavedBookIds] = useState(getSavedBookIds());
	// Invoke `useMutation()` hook to return a Promise-based function and data about the SAVE_BOOK mutation
	const [saveBook] = useMutation(SAVE_BOOK);

	// Set up useEffect hook to save `savedBookIds` list to localStorage on component unmount
	useEffect(() => {
		return () => saveBookIds(savedBookIds);
	});

	// Create method to search for books and set state on form submit
	const handleFormSubmit = async (event) => {
		event.preventDefault();

		if (!searchInput) {
			return false;
		}

		try {
			const response = await searchGoogleBooks(searchInput);

			if (!response.ok) {
				throw new Error("Something went wrong.");
			}

			const { items } = await response.json();

			const bookData = items.map((book) => ({
				bookId: book.id,
				authors: book.volumeInfo.authors || ["No author to display."],
				title: book.volumeInfo.title,
				description: book.volumeInfo.description,
				image: book.volumeInfo.imageLinks?.thumbnail || "",
			}));

			setSearchedBooks(bookData);
			setSearchInput("");
		} catch (err) {
			console.error(err);
		}
	};

	// Create function to handle saving a book to our database
	const handleSaveBook = async (bookId) => {
		// Find the book in `searchedBooks` state by the matching id
		const bookToSave = searchedBooks.find((book) => book.bookId === bookId);

		// Get token
		const token = Auth.loggedIn() ? Auth.getToken() : null;

		if (!token) {
			return false;
		}

		try {
			await saveBook({ variables: { input: bookToSave } });

			// If book successfully saves to user's account, save book id to state
			setSavedBookIds([...savedBookIds, bookToSave.bookId]);
		} catch (err) {
			console.error(err);
		}
	};

	return (
		<>
			<Jumbotron fluid className="text-light bg-dark">
				<Container>
					<h1>Search for Books!</h1>
					<Form onSubmit={handleFormSubmit}>
						<Form.Row>
							<Col xs={12} md={8}>
								<Form.Control
									name="searchInput"
									value={searchInput}
									onChange={(e) => setSearchInput(e.target.value)}
									type="text"
									size="lg"
									placeholder="Search for a book"
								/>
							</Col>
							<Col xs={12} md={4}>
								<Button type="submit" variant="success" size="lg">
									Submit Search
								</Button>
							</Col>
						</Form.Row>
					</Form>
				</Container>
			</Jumbotron>

			<Container>
				<h2>
					{searchedBooks.length
						? `Viewing ${searchedBooks.length} results:`
						: "Search for a book to begin"}
				</h2>
				<CardColumns>
					{searchedBooks.map((book) => {
						return (
							<Card key={book.bookId} border="dark">
								{book.image ? (
									<Card.Img
										src={book.image}
										alt={`The cover for ${book.title}`}
										variant="top"
									/>
								) : null}
								<Card.Body>
									<Card.Title>{book.title}</Card.Title>
									<p className="small">Authors: {book.authors}</p>
									<Card.Text>{book.description}</Card.Text>
									{Auth.loggedIn() && (
										<Button
											disabled={savedBookIds?.some(
												(savedBookId) => savedBookId === book.bookId
											)}
											className="btn-block btn-info"
											onClick={() => handleSaveBook(book.bookId)}
										>
											{savedBookIds?.some(
												(savedBookId) => savedBookId === book.bookId
											)
												? "This book has already been saved!"
												: "Save this Book!"}
										</Button>
									)}
								</Card.Body>
							</Card>
						);
					})}
				</CardColumns>
			</Container>
		</>
	);
};

export default SearchBooks;
