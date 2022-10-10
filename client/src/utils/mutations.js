import { gql } from "@apollo/client";

// Execute the addUser mutation to add a new user
export const ADD_USER = gql`
	mutation addUser($username: String!, $email: String!, $password: String!) {
		addUser(username: $username, email: $email, password: $password) {
			token
			user {
				_id
				username
			}
		}
	}
`;

// Execute the login mutation to log in an existing user
export const LOGIN_USER = gql`
	mutation login($email: String!, $password: String!) {
		login(email: $email, password: $password) {
			token
			user {
				_id
				username
			}
		}
	}
`;

// Execute the saveBook mutation to allow user to save book to their saved books
export const SAVE_BOOK = gql`
	mutation saveBook($book: BookInput) {
		saveBook(book: $book) {
			savedBooks {
				bookId
				authors
				description
				title
				image
				link
			}
		}
	}
`;

// Execute the removeBook mutation to allow user to remove book from their saved books
export const REMOVE_BOOK = gql`
	mutation removeBook($bookId: ID!) {
		removeBook(bookId: $bookId) {
			savedBooks {
				bookId
			}
		}
	}
`;
