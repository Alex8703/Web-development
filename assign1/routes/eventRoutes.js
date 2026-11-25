const express = require('express');
const eventController = require('../controllers/eventController');

const router = express.Router();

router.get('/events', eventController.getEvents);
router.get('/event/add', eventController.getAddEvent);
router.post('/event', eventController.postAddEvent);
router.get('/event/edit/:id', eventController.getEditEvent);
router.post('/event/:id', eventController.postEditEvent);
router.post('/event/delete/:id', eventController.postDeleteEvent);
router.get('/event/detail/:id', eventController.getEventDetail);

module.exports = router;
