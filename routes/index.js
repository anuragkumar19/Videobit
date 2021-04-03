const router = require('express').Router();
const { default: validator } = require('validator');
const { ensureUser } = require('../middlewares/auth');
const Room = require('../models/Room');

// Auth Routes
router.use('/auth', require('./auth'));

// Dashboard Routes
router.use('/dashboard', require('./dashboard'));

router.get('/', (req, res) => res.render('index'));
router.get('/profile', ensureUser, (req, res) => res.render('profile'));

router.get('/join', (req, res) =>
    res.render('joinRoom', { roomId: req.query.roomId })
);

router.get('/join/room/call', async (req, res) => {
    const { roomId, password, name } = req.query;

    if (!roomId) {
        req.flash('error', 'Please enter room id.');
        return res.redirect('/join');
    }

    if (!password) {
        req.flash('error', 'Please enter password.');
        return res.redirect('/join');
    }

    if (!validator.isMongoId(roomId)) {
        req.flash('error', 'Please enter valid room id.');
        return res.redirect('/join');
    }

    if (typeof name !== 'string') {
        req.flash('error', 'Please enter valid name.');
        return res.redirect('/join');
    }

    if (!name || !name.trim()) {
        req.flash('error', 'Name cannot be empty.');
        return res.redirect('/join');
    }

    try {
        const room = await Room.findById(roomId);

        if (!room) {
            req.flash('error', 'No room found.');
            return res.redirect('/join');
        }

        if (room.password !== password) {
            req.flash('error', 'Password Incorrect.');
            return res.redirect('/join');
        }

        return res.render('call', { room });
    } catch (err) {
        req.flash('error', 'Server Error! Please try again!');
        return res.redirect('/join');
    }
});

module.exports = router;
