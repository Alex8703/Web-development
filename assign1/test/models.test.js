const test = require('node:test');
const assert = require('node:assert/strict');
const Event = require('../models/Event');
const Venue = require('../models/Venue');

test('event model requires valid category, date and integer capacity', async () => {
    const valid = new Event({
        title: 'Faculty Seminar',
        category: 'Seminar',
        dateTime: new Date(),
        capacity: 25
    });
    await valid.validate();

    const invalid = new Event({
        title: 'Not an event',
        category: 'Meetup',
        dateTime: 'not-a-date',
        capacity: 1.5
    });
    await assert.rejects(invalid.validate(), (error) => {
        assert.ok(error.errors.category);
        assert.ok(error.errors.dateTime);
        assert.ok(error.errors.capacity);
        return true;
    });
});

test('venue model validates integer capacity and supported facilities', async () => {
    const valid = new Venue({
        name: 'Lecture Hall',
        location: 'Building A, Room 101',
        capacity: 100,
        facilities: ['Projector', 'WiFi']
    });
    await valid.validate();

    const invalid = new Venue({
        name: 'Invalid room',
        location: 'Building Z',
        capacity: 4.5,
        facilities: ['Teleportation']
    });
    await assert.rejects(invalid.validate(), (error) => {
        assert.ok(error.errors.capacity);
        assert.ok(error.errors['facilities.0']);
        return true;
    });
});
