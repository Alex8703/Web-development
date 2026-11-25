const mongoose = require('mongoose');
const Event = require('../models/Event');
const Venue = require('../models/Venue');

const PAGE_SIZE = 9;
const categories = Event.schema.path('category').enumValues;
const statuses = Event.schema.path('status').enumValues;

function formValues(body) {
    return {
        title: body.title || '',
        description: body.description || '',
        bannerImage: body.bannerImage || '',
        category: body.category || '',
        speaker: body.speaker || '',
        dateTime: body.dateTime || '',
        venue: body.venue || undefined,
        capacity: body.capacity || '',
        status: body.status || 'Upcoming',
        isHighlighted: body.isHighlighted === 'on'
    };
}

function invalid(message, status = 400) {
    return Object.assign(new Error(message), { status });
}

async function renderEventForm(res, { pageTitle, event, errors = [], status = 200 }) {
    const venues = await Venue.find().sort({ name: 1 });
    return res.status(status).render('events/form', {
        pageTitle,
        event,
        venues,
        categories,
        statuses,
        errors,
        isEditing: Boolean(event._id)
    });
}

async function findEvent(id) {
    if (!mongoose.isValidObjectId(id)) throw invalid('Event not found.', 404);
    const event = await Event.findById(id).populate('venue');
    if (!event) throw invalid('Event not found.', 404);
    return event;
}

exports.getEvents = async (req, res, next) => {
    try {
        const parsedPage = Number.parseInt(req.query.page, 10);
        const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
        const [events, count] = await Promise.all([
            Event.find().sort({ dateTime: 1 }).skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE).populate('venue'),
            Event.countDocuments()
        ]);
        res.render('events/list', {
            pageTitle: 'All Events',
            events,
            page,
            totalPages: Math.max(1, Math.ceil(count / PAGE_SIZE))
        });
    } catch (error) {
        next(error);
    }
};

exports.getAddEvent = async (req, res, next) => {
    try {
        await renderEventForm(res, {
            pageTitle: 'Create an Event',
            event: { status: 'Upcoming', isHighlighted: false }
        });
    } catch (error) {
        next(error);
    }
};

exports.postAddEvent = async (req, res, next) => {
    try {
        const event = new Event(formValues(req.body));
        await event.validate();
        if (event.venue && !(await Venue.exists({ _id: event.venue }))) {
            throw invalid('Please choose an available venue.');
        }
        await event.save();
        res.redirect(`/event/detail/${event._id}`);
    } catch (error) {
        if (error.name === 'ValidationError' || error.name === 'CastError' || error.status === 400) {
            try {
                const messages = error.name === 'ValidationError'
                    ? Object.values(error.errors).map((item) => item.message)
                    : [error.message];
                await renderEventForm(res, {
                    pageTitle: 'Create an Event',
                    event: formValues(req.body),
                    errors: messages,
                    status: 400
                });
            } catch (renderError) {
                next(renderError);
            }
            return;
        }
        next(error);
    }
};

exports.getEditEvent = async (req, res, next) => {
    try {
        const event = await findEvent(req.params.id);
        await renderEventForm(res, { pageTitle: 'Edit Event', event });
    } catch (error) {
        next(error);
    }
};

exports.postEditEvent = async (req, res, next) => {
    try {
        const event = await findEvent(req.params.id);
        Object.assign(event, formValues(req.body));
        await event.validate();
        if (event.venue && !(await Venue.exists({ _id: event.venue }))) {
            throw invalid('Please choose an available venue.');
        }
        await event.save();
        res.redirect(`/event/detail/${event._id}`);
    } catch (error) {
        if (error.name === 'ValidationError' || error.name === 'CastError' || error.status === 400) {
            try {
                const messages = error.name === 'ValidationError'
                    ? Object.values(error.errors).map((item) => item.message)
                    : [error.message];
                await renderEventForm(res, {
                    pageTitle: 'Edit Event',
                    event: { ...formValues(req.body), _id: req.params.id },
                    errors: messages,
                    status: 400
                });
            } catch (renderError) {
                next(renderError);
            }
            return;
        }
        next(error);
    }
};

exports.postDeleteEvent = async (req, res, next) => {
    try {
        const event = await findEvent(req.params.id);
        await event.deleteOne();
        res.redirect('/events');
    } catch (error) {
        next(error);
    }
};

exports.getEventDetail = async (req, res, next) => {
    try {
        const event = await findEvent(req.params.id);
        res.render('events/detail', { pageTitle: event.title, event });
    } catch (error) {
        next(error);
    }
};
