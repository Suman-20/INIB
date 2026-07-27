const express = require("express");
const protect = require("../middleware/authMiddleware");

const {
  getMessages,
} = require("../controllers/messageController");

const router = express.Router();

router.get("/:userId", protect, getMessages);

module.exports = router;