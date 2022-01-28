const express = require('express');

// Controllers
const {
	createUser,
	getUserById,
	updateUser,
	disableUserAccount,
	loginUser,
} = require('../controllers/users.controller');

// Middlewares
const {
	protectSession,
	protectUserOwner,
} = require('../middlewares/auth.middleware');

const {
	createUserValidations,
	updateUserValidations,
	loginUserValidations,
	validateResult,
} = require('../middlewares/validators.middleware');

const router = express.Router();

// POST - Create a new user
router.post('/', createUserValidations, validateResult, createUser);
// POST - Login
router.post('/login', loginUserValidations, validateResult, loginUser);

// Validate the active session
router.use(protectSession);
// GET - Get user by id
// PATCH - Update user profile (email, name)
// DELETE(Soft) - Disable user account
router
	.route('/:id')
	.get(getUserById)

	// Only the logged in user can edit their own account
	.patch(protectUserOwner, updateUserValidations, validateResult, updateUser)
	.delete(protectUserOwner, disableUserAccount);

module.exports = { userRouter: router };
