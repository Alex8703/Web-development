const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const express = require('express');
const mongoose = require('mongoose');
const homeRoutes = require('./routes/homeRoutes');
const eventRoutes = require('./routes/eventRoutes');
const venueRoutes = require('./routes/venueRoutes');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: false, limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', homeRoutes);
app.use('/', eventRoutes);
app.use('/', venueRoutes);

app.use((req, res, next) => {
    if (req.method === 'GET') {
        return res.status(404).render('error', {
            pageTitle: 'Page not found',
            statusCode: 404,
            message: 'We could not find the page you were looking for.'
        });
    }
    return next(Object.assign(new Error('Page not found.'), { status: 404 }));
});

app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    const statusCode = error.status || 500;
    res.status(statusCode).render('error', {
        pageTitle: statusCode === 404 ? 'Page not found' : 'Something went wrong',
        statusCode,
        message: statusCode === 404
            ? 'The requested record could not be found.'
            : 'We were unable to complete your request. Please try again.'
    });
});

async function start() {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/science-faculty-events';
    const port = Number(process.env.PORT) || 3000;
    await mongoose.connect(mongoUri);
    app.listen(port, () => {
        console.log(`Science Faculty Events is running at http://localhost:${port}`);
    });
}

if (require.main === module) {
    start().catch((error) => {
        console.error('Unable to connect to MongoDB or start the application:', error.message);
        process.exitCode = 1;
    });
}

module.exports = app;
