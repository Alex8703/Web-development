const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, maxlength: 100 },
    location: { type: String, required: true, trim: true },
    capacity: {
        type: Number,
        required: true,
        min: 1,
        validate: { validator: Number.isInteger, message: 'Capacity must be a whole number.' }
    },
    facilities: [{
        type: String, 
        enum: ['Projector', 'Whiteboard', 'Microphone', 'WiFi', 'Air Conditioning', 'Video Conferencing', 'Sound System', 'Parking', 'Wheelchair Access']
    }],
    description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Venue', venueSchema);