const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true },
    bannerImage: { type: String, trim: true, default: '' },
    category: {
        type: String,
        required: true,
        enum: ['Workshop', 'Seminar', 'Competition', 'Career Event', 'Social Event', 'Conference', 'Lecture', 'Exhibition', 'Cultural', 'Sports', 'Volunteer', 'Networking']
    },
    speaker: { type: String, trim: true },
    dateTime: { type: Date, required: true },
    venue: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue' },
    capacity: {
        type: Number,
        required: true,
        min: 1,
        validate: { validator: Number.isInteger, message: 'Capacity must be a whole number.' }
    },
    status: {
        type: String,
        default: 'Upcoming',
        enum: ['Upcoming', 'Ongoing', 'Completed', 'Cancelled']
    },
    isHighlighted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);