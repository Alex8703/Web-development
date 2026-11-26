# Science Faculty Events

A responsive event and venue management app built with Express, EJS, Bootstrap 5 and MongoDB/Mongoose.

## Requirements

- Node.js 18 or later
- MongoDB running locally, or a MongoDB connection string

## Run locally

```sh
npm install
```

Set `MONGODB_URI` in a local `.env` file in the project root:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/science-faculty-events
```

Then run:

```sh
npm run seed
npm start
```

Open [http://localhost:3000](http://localhost:3000). Set `PORT` to use another port. If `MONGODB_URI` is omitted, the app uses the local database shown above. Environment variables already set by the shell take precedence over `.env`.

The seed command creates three venues and twelve sample events only when the corresponding collections are empty. It is safe to run again without overwriting existing records.

## Pages

- `/` — highlighted carousel, six recent events, six trending events and six upcoming events.
- `/events` — paginated event directory; create, edit and delete events with the event forms.
- `/venues` — paginated venue directory; create, edit and delete venues.

Trending is calculated from upcoming events ordered by venue capacity (highest first), because the event model has no views or RSVP metric.

All application mutations use POST forms; pages and details use GET. The application includes custom 404 and server-error pages.

## Project layout

```text
assign1/
  app.js
  controllers/
  models/
  public/
  routes/
  views/
```


