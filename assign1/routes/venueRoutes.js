const express = require('express');
const venueController = require('../controllers/venueController');

const router = express.Router();

router.get('/venues', venueController.getVenues);
router.get('/venue/add', venueController.getAddVenue);
router.post('/venue', venueController.postAddVenue);
router.get('/venue/edit/:id', venueController.getEditVenue);
router.post('/venue/:id', venueController.postEditVenue);
router.post('/venue/delete/:id', venueController.postDeleteVenue);

module.exports = router;
