const Event = require('../models/Event');

exports.getHome = async (req, res, next) => {
    try {
        const now = new Date();
        const [highlighted, recentEvents, trendingEvents, upcomingEvents] = await Promise.all([
            Event.find({ isHighlighted: true }).sort({ dateTime: 1 }).limit(5).populate('venue'),
            Event.find().sort({ createdAt: -1 }).limit(6).populate('venue'),
            Event.find({ dateTime: { $gte: now }, status: 'Upcoming' })
                .sort({ capacity: -1, dateTime: 1 }).limit(6).populate('venue'),
            Event.find({ dateTime: { $gte: now }, status: 'Upcoming' })
                .sort({ dateTime: 1 }).limit(6).populate('venue')
        ]);
        res.render('home', {
            pageTitle: 'Science Faculty Events',
            highlighted,
            recentEvents,
            trendingEvents,
            upcomingEvents
        });
    } catch (error) {
        next(error);
    }
};
