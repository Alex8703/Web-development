const mongoose = require('mongoose');
const Event = require('../models/Event');
const Venue = require('../models/Venue');

const PAGE_SIZE = 9;
const facilities = Venue.schema.path('facilities.0').enumValues;

function formValues(body) {
    return {
        name: body.name || '',
        location: body.location || '',
        capacity: body.capacity || '',
        facilities: Array.isArray(body.facilities) ? body.facilities : body.facilities ? [body.facilities] : [],
        description: body.description || ''
    };
}

function invalid(message, status = 400) {
    return Object.assign(new Error(message), { status });
}

async function renderVenueForm(res, { pageTitle, venue, errors = [], status = 200 }) {
    res.status(status).render('venues/form', {
        pageTitle,
        venue,
        facilities,
        errors,
        isEditing: Boolean(venue._id)
    });
}

async function findVenue(id) {
    if (!mongoose.isValidObjectId(id)) throw invalid('Venue not found.', 404);
    const venue = await Venue.findById(id);
    if (!venue) throw invalid('Venue not found.', 404);
    return venue;
}

exports.getVenues = async (req, res, next) => {
    try {
        const parsedPage = Number.parseInt(req.query.page, 10);
        const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
        const [venues, count] = await Promise.all([
            Venue.find().sort({ name: 1 }).skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE),
            Venue.countDocuments()
        ]);
        res.render('venues/list', {
            pageTitle: 'Venues',
            venues,
            page,
            totalPages: Math.max(1, Math.ceil(count / PAGE_SIZE))
        });
    } catch (error) {
        next(error);
    }
};

exports.getAddVenue = (req, res) => renderVenueForm(res, {
    pageTitle: 'Add a Venue',
    venue: { facilities: [] }
});

exports.postAddVenue = async (req, res, next) => {
    try {
        const venue = new Venue(formValues(req.body));
        await venue.validate();
        await venue.save();
        res.redirect('/venues');
    } catch (error) {
        if (error.name === 'ValidationError' || error.name === 'CastError') {
            const messages = error.name === 'ValidationError'
                ? Object.values(error.errors).map((item) => item.message)
                : [error.message];
            await renderVenueForm(res, {
                pageTitle: 'Add a Venue',
                venue: formValues(req.body),
                errors: messages,
                status: 400
            }).catch(next);
            return;
        }
        next(error);
    }
};

exports.getEditVenue = async (req, res, next) => {
    try {
        await renderVenueForm(res, { pageTitle: 'Edit Venue', venue: await findVenue(req.params.id) });
    } catch (error) {
        next(error);
    }
};

exports.postEditVenue = async (req, res, next) => {
    try {
        const venue = await findVenue(req.params.id);
        Object.assign(venue, formValues(req.body));
        await venue.validate();
        await venue.save();
        res.redirect('/venues');
    } catch (error) {
        if (error.name === 'ValidationError' || error.name === 'CastError') {
            const messages = error.name === 'ValidationError'
                ? Object.values(error.errors).map((item) => item.message)
                : [error.message];
            await renderVenueForm(res, {
                pageTitle: 'Edit Venue',
                venue: { ...formValues(req.body), _id: req.params.id },
                errors: messages,
                status: 400
            }).catch(next);
            return;
        }
        next(error);
    }
};

exports.postDeleteVenue = async (req, res, next) => {
    try {
        const venue = await findVenue(req.params.id);
        await Promise.all([
            Event.updateMany({ venue: venue._id }, { $unset: { venue: 1 } }),
            venue.deleteOne()
        ]);
        res.redirect('/venues');
    } catch (error) {
        next(error);
    }
};
