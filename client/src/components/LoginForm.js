import React, { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";

import Auth from "../utils/auth";

// Import the `useMutation()` hook from Apollo Client
import { useMutation } from "@apollo/client";
// Import the GraphQL mutation
import { LOGIN_USER } from "../utils/mutations";

const LoginForm = () => {
	// Set initial form state
	const [userFormData, setUserFormData] = useState({ email: "", password: "" });
	// Set state for form validation
	const [validated] = useState(false);
	// Set state for alert
	const [showAlert, setShowAlert] = useState(false);
	// Invoke `useMutation()` hook to return a Promise-based function and data about the LOGIN_USER mutation
	const [loggedInUser] = useMutation(LOGIN_USER);

	const handleInputChange = (event) => {
		const { name, value } = event.target;
		setUserFormData({ ...userFormData, [name]: value });
	};

	const handleFormSubmit = async (event) => {
		event.preventDefault();

		// Check if form has everything (as per react-bootstrap docs)
		const form = event.currentTarget;
		if (form.checkValidity() === false) {
			event.preventDefault();
			event.stopPropagation();
		}

		// Since mutation function is async, wrap in a `try...catch` to catch any network errors from throwing due to a failed request
		try {
			// Execute mutation and pass in defined parameter data as variables
			const { data } = await loggedInUser({
				variables: { ...userFormData },
			});

			console.log("User logged in.");
			Auth.login(data.login.token);
		} catch (err) {
			console.error(err);
			setShowAlert(true);
		}

		setUserFormData({
			username: "",
			email: "",
			password: "",
		});
	};

	return (
		<>
			<Form noValidate validated={validated} onSubmit={handleFormSubmit}>
				<Alert
					dismissible
					onClose={() => setShowAlert(false)}
					show={showAlert}
					variant="danger"
				>
					Something went wrong with your login credentials!
				</Alert>
				<Form.Group>
					<Form.Label htmlFor="email">Email</Form.Label>
					<Form.Control
						type="text"
						placeholder="Your email"
						name="email"
						onChange={handleInputChange}
						value={userFormData.email}
						required
					/>
					<Form.Control.Feedback type="invalid">
						Email is required!
					</Form.Control.Feedback>
				</Form.Group>

				<Form.Group>
					<Form.Label htmlFor="password">Password</Form.Label>
					<Form.Control
						type="password"
						placeholder="Your password"
						name="password"
						onChange={handleInputChange}
						value={userFormData.password}
						required
					/>
					<Form.Control.Feedback type="invalid">
						Password is required!
					</Form.Control.Feedback>
				</Form.Group>
				<Button
					disabled={!(userFormData.email && userFormData.password)}
					type="submit"
					variant="success"
				>
					Submit
				</Button>
			</Form>
		</>
	);
};

export default LoginForm;
