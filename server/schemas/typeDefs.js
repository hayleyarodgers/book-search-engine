const { gql } = require("apollo-server-express");

const typeDefs = gql`
	# Define which fields are accessible from the User model
	type User {
		_id: ID!
		username: String!
		email: String!
		bookCount: Int
		savedBooks: [Book]
	}

	# Define which fields are accessible from the Book model
	type Book {
		bookId: String!
		authors: [String]
		description: String!
		title: String!
		image: String
		link: String
	}

	# Define which fields are required to save a book via the saveBook Mutation
	input BookInput {
		bookId: String
		authors: [String]
		description: String
		title: String
		image: String
		link: String
	}

	# Set up an Auth type to handle returning data when a user signs up or logs in
	type Auth {
		token: ID!
		user: User
	}

	# Define which queries the front end is allowed to make and what data is returned
	type Query {
		# Find and return the logged in user's data (possible because we have the context functionality in place to check a JWT and decode its data)
		me: User
	}

	# Define which mutations the front end is allowed to make
	type Mutation {
		# Set the required fields for signing up new users
		addUser(username: String!, email: String!, password: String!): Auth

		# Set the required fields for logging in
		login(email: String!, password: String!): Auth

		# Set the required fields for adding and removing a user's saved books
		saveBook(input: BookInput): User
		removeBook(bookId: ID!): User
	}
`;

module.exports = typeDefs;
