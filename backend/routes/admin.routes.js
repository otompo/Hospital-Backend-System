const router = require("express").Router();
const {
  addAdmin,
  regenerateAdminLostPassword,
  trashAndUnTrashUser,
} = require("../controllers/admin.controller");

const { authenticate, isAdmin } = require("../middlewares/authMiddleware");

/**
 * @route   POST /user/admin
 * @desc    Add a new admin user
 * @access  Private (Only authenticated admins)
 * @middleware authenticate - Ensures the user is authenticated
 * @middleware isAdmin - Ensures the user has admin privileges
 */
router.route("/user/admin").post(authenticate, isAdmin, addAdmin);

/**
 * @route   PUT /regenerate/admin-password/:id
 * @desc    Regenerate and reset the password for an admin user
 * @access  Private (Only authenticated admins)
 * @middleware authenticate - Ensures the user is authenticated
 * @middleware isAdmin - Ensures the user has admin privileges
 * @param   {string} id - Admin user ID whose password needs to be reset
 */
router
  .route("/regenerate/admin-password/:id")
  .put(authenticate, isAdmin, regenerateAdminLostPassword);

/**
 * @route   PUT /moveusertotrash/:id
 * @desc    Move a user to trash or restore them from trash
 * @access  Private (Only authenticated admins)
 * @middleware authenticate - Ensures the user is authenticated
 * @middleware isAdmin - Ensures the user has admin privileges
 * @param   {string} id - User ID to be moved to trash or restored
 */
router
  .route("/moveusertotrash/:id")
  .put(authenticate, isAdmin, trashAndUnTrashUser);

module.exports = router;
