const express = require('express');
const router = express.Router();
const EventController = require('../controllers/eventController');

// POST /api/events - create event
router.post('/', EventController.createEvent);

// GET /api/events - list events
router.get('/', EventController.getEvents);

// GET /api/events/upcoming - get upcoming events
router.get('/upcoming', EventController.getUpcomingEvents);

// GET /api/events/creator/:creatorId - get events by creator
router.get('/creator/:creatorId', EventController.getEventsByCreator);

// GET /api/events/:id - get event details
router.get('/:id', EventController.getEventById);

// PUT /api/events/:id - update event
router.put('/:id', EventController.updateEvent);

// DELETE /api/events/:id - delete event
router.delete('/:id', EventController.deleteEvent);

// GET /api/events/:id/qrcode - generate QR code for event (returns JSON with data URL)
router.get('/:id/qrcode', EventController.generateQRCode);

// GET /api/events/:id/qrcode/image - get QR code as image file
router.get('/:id/qrcode/image', EventController.getQRCodeImage);

// POST /api/events/:id/checkin - check in to event
router.post('/:id/checkin', EventController.checkInMember);

// GET /api/events/:id/attendance - get attendance list
router.get('/:id/attendance', EventController.getEventAttendance);

module.exports = router;

