const express = require("express");
const router = express.Router();
const { getEvents, createEvent, updateEvent, deleteEvent } = require("../controllers/calendarController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getEvents);
router.post("/", protect, createEvent);
router.put("/:id", protect, updateEvent);
router.delete("/:id", protect, deleteEvent);

module.exports = router;