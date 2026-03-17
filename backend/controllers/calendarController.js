const CalendarEvent = require("../models/CalendarEvent");

// @route GET /api/calendar
exports.getEvents = async (req, res) => {
  try {
    const { month, year } = req.query;
    let filter = { user: req.user.id };

    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);
      filter.scheduledDate = { $gte: start, $lte: end };
    }

    const events = await CalendarEvent.find(filter).sort({ scheduledDate: 1 });
    res.status(200).json({ success: true, events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route POST /api/calendar
exports.createEvent = async (req, res) => {
  try {
    const { title, content, type, scheduledDate, status, notes } = req.body;
    if (!title || !scheduledDate) {
      return res.status(400).json({ success: false, message: "Title and date are required" });
    }
    const event = await CalendarEvent.create({
      user: req.user.id, title, content, type, scheduledDate, status, notes,
    });
    res.status(201).json({ success: true, event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route PUT /api/calendar/:id
exports.updateEvent = async (req, res) => {
  try {
    const event = await CalendarEvent.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });
    res.status(200).json({ success: true, event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route DELETE /api/calendar/:id
exports.deleteEvent = async (req, res) => {
  try {
    const event = await CalendarEvent.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });
    res.status(200).json({ success: true, message: "Event deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};