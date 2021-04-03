const router = require('express').Router();
const passport = require('passport');
const { ensureGuest } = require('../middlewares/auth');

// @route   GET /auth
// @desc    Login/Signup Page
// @access  Guest
router.get('/', ensureGuest, (req, res) => res.render('signup'));

router.get(
    '/google',
    ensureGuest,
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
    '/google/callback',
    ensureGuest,
    passport.authenticate('google', {
        failureRedirect: '/auth',
        failureFlash: true,
    }),
    (req, res) => {
        res.redirect('/dashboard');
    }
);

router.get(
    '/facebook',
    ensureGuest,
    passport.authenticate('facebook', { scope: ['email', 'user_photos'] })
);

router.get(
    '/facebook/callback',
    ensureGuest,
    passport.authenticate('facebook', {
        failureRedirect: '/auth',
        failureFlash: true,
    }),
    (req, res) => {
        res.redirect('/dashboard');
    }
);

router.post('/logout', (req, res) => {
    req.logout();
    res.redirect('/auth');
});

module.exports = router;
