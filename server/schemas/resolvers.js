const { AuthenticationError } = require("apollo-server-express");
const { User } = require("../models");
const { signToken } = require("../utils/auth");

const resolvers = {
	Query: {
		// Get current user and their saved books by their id
		me: async (_, _, context) => {
			if (context.user) {
				return User.findOne({ _id: context.user._id }).populate("savedBooks");
			}
			throw new AuthenticationError("You need to be logged in.");
		},
	},

	Mutation: {
		// Create a new user, sign a token and send it back (to client/src/components/SignUpForm.js)
		addUser: async (_, { username, email, password }, _) => {
			const user = await User.create({ username, email, password });
			const token = signToken(user);
			return { token, user };
		},
		// Log in an existing user, sign a token and send it back (to client/src/components/LoginForm.js)
		login: async (_, { email, password }, _) => {
			const user = await User.findOne({ email });

			if (!user) {
				throw new AuthenticationError("No user found with this email address.");
			}

			const correctPw = await user.isCorrectPassword(password);

			if (!correctPw) {
				throw new AuthenticationError("Incorrect password.");
			}

			const token = signToken(user);

			return { token, user };
		},
		// Save a book to a user's `savedBooks` by adding it to the set (to prevent duplicates)
		saveBook: async (_, { book }, context) => {
			if (context.user) {
				const updatedUser = await User.findOneAndUpdate(
					{ _id: context.user._id },
					{ $addToSet: { savedBooks: book } },
					{ new: true, runValidators: true }
				);

				return updatedUser;
			}
			throw new AuthenticationError("You need to be logged in.");
		},
		// Remove a book from `savedBooks`
		removeBook: async (_, { book }, context) => {
			if (context.user) {
				const updatedUser = await User.findOneAndUpdate(
					{ _id: context.user._id },
					{ $pull: { savedBooks: { book } } },
					{ new: true }
				);

				return updatedUser;
			}
			throw new AuthenticationError("You need to be logged in.");
		},
	},
};

module.exports = resolvers;
