const router = require('express').Router();
const Joi = require('joi');
const { default: validator } = require('validator');
const { ensureUser } = require('../middlewares/auth');
const Room = require('../models/Room');
const User = require('../models/User');

// Ensure Authentication
router.use(ensureUser);

const roomSchema = Joi.object({
    name: Joi.string().trim().required().max(50),
    detail: Joi.string().trim().required().max(300),
    password: Joi.string().min(6).required(),
    password2: Joi.string().required(),
});

router.get('/', async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('rooms');
        res.render('dashboard', {
            rooms: user.rooms,
        });
    } catch (err) {
        console.log(err);
        res.send('Server Error!');
    }
});

router.get('/createRoom', (req, res) => res.render('newRoom'));

router.post('/createRoom', async (req, res) => {
    const roomData = req.body;

    const { error, value } = roomSchema.validate(roomData);

    if (error) {
        res.render('newRoom', {
            roomData,
            error: error.message,
        });
    } else if (value.password === value.password2) {
        value.password2 = undefined;
        value.owner = req.user.id;

        try {
            const room = await Room.create(value);

            let user = await User.findById(req.user.id);
            user.rooms.push(room.id);
            user = await user.save();
            res.redirect('/dashboard');
        } catch (err) {
            console.log(err);
            req.flash('error_msg', 'Server Error');
            res.redirect('/dashboard');
        }
    } else {
        res.render('newRoom', {
            roomData,
            error: 'Password do not match',
        });
    }
});

router.delete('/room/:id', async (req, res) => {
    const { id } = req.params;

    if (!validator.isMongoId(id)) {
        return res.json({
            message: "Cannot delete room id doesn't match!",
            type: 'error',
        });
    }

    try {
        const room = await Room.findById(id);
        if (!room) {
            return res.json({ message: 'Room does not found!' });
        }

        if (!room.owner.equals(req.user.id)) {
            return res.json({ message: 'Room does not found!' });
        }

        await room.deleteOne();
        return res.json({ message: 'Deleted!' });
    } catch (err) {
        console.log(err);
        return res.json({
            message: 'Server Error!',
        });
    }
});

module.exports = router;
