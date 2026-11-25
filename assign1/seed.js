const mongoose = require('mongoose');
const Event = require('./models/Event');
const Venue = require('./models/Venue');

async function seed() {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/science-faculty-events';
    await mongoose.connect(mongoUri);

    let venues = await Venue.find().sort({ name: 1 }).limit(3);
    if (!venues.length) {
        venues = await Venue.create([
            {
                name: 'Discovery Lecture Theatre',
                location: 'Building A, Room 101',
                capacity: 180,
                facilities: ['Projector', 'Microphone', 'WiFi', 'Wheelchair Access'],
                description: 'A bright lecture theatre for faculty talks and screenings.'
            },
            {
                name: 'Innovation Lab',
                location: 'Building C, Room 204',
                capacity: 48,
                facilities: ['Projector', 'Whiteboard', 'WiFi', 'Air Conditioning'],
                description: 'A flexible workshop space for hands-on collaboration.'
            },
            {
                name: 'Faculty Courtyard',
                location: 'Central Science Quad',
                capacity: 320,
                facilities: ['Sound System', 'Parking', 'Wheelchair Access'],
                description: 'An open-air gathering space at the heart of campus.'
            }
        ]);
    }

    if (await Event.countDocuments() === 0) {
        const categories = ['Seminar', 'Workshop', 'Lecture', 'Competition', 'Networking', 'Exhibition', 'Conference', 'Volunteer', 'Cultural', 'Career Event', 'Sports', 'Social Event'];
        const titles = [
            'The Future of Clean Energy', 'Field Notes: Urban Biodiversity', 'Build a Tiny Weather Station',
            'Student Research Showcase', 'Science Careers Meet & Greet', 'Microscopy After Hours',
            'Coastal Change Symposium', 'Community Garden Volunteer Day', 'Science on the Lawn',
            'Graduate Opportunities Forum', 'Faculty Fun Run', 'Welcome Back Mixer'
        ];
        const now = new Date();
        await Event.create(titles.map((title, index) => ({
            title,
            category: categories[index],
            description: `Join students and faculty for ${title.toLowerCase()} and meet others who share your curiosity.`,
            speaker: index % 2 === 0 ? 'Science Faculty' : 'Student Research Society',
            dateTime: new Date(now.getTime() + (index - 2) * 86400000 * 3),
            venue: venues[index % venues.length]._id,
            capacity: [180, 48, 320, 90, 72, 36][index % 6],
            status: index < 2 ? 'Completed' : 'Upcoming',
            isHighlighted: index === 2 || index === 4 || index === 7
        })));
    }

    console.log('Seed data is ready.');
}

seed()
    .catch((error) => {
        console.error('Unable to seed the database:', error.message);
        process.exitCode = 1;
    })
    .finally(async () => mongoose.disconnect());
