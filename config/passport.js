const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;

const User = require('../models/User');

module.exports = function (passport) {
    // Google Strategy
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: '/auth/google/callback',
            },
            async (accessToken, refreshToken, profile, done) => {
                const { id, displayName: name, emails, photos } = profile;

                try {
                    let user = await User.findOne({ email: emails[0].value });

                    if (user) {
                        if (user.provider !== 'google')
                            return done(
                                null,
                                false,
                                `It's Look like you used facebook for sign in. Please use facebook to login.`
                            );

                        return done(null, user);
                    }
                    user = await User.findOne({
                        googleId: id,
                    });

                    if (user) return done(null, user);

                    user = await User.create({
                        name,
                        provider: 'google',
                        googleId: id,
                        email: emails[0].value,
                        image: photos[0].value,
                    });

                    return done(null, user);
                } catch (err) {
                    console.log(err);
                    return done(null, false, 'Server Error.');
                }
            }
        )
    );

    // Facebook Strategy
    passport.use(
        new FacebookStrategy(
            {
                clientID: process.env.FACEBOOK_APP_ID,
                clientSecret: process.env.FACEBOOK_APP_SECRET,
                callbackURL: '/auth/facebook/callback',
                profileFields: ['id', 'displayName', 'photos', 'email'],
            },
            async (accessToken, refreshToken, profile, done) => {
                const { displayName, photos, emails, id } = profile;

                if (emails && emails[0] && emails[0].value) {
                    const email = emails[0].value;

                    let image;

                    if (photos && photos[0] && photos[0].value) {
                        image = photos[0].value;
                    }

                    try {
                        let user = await User.findOne({ email });

                        if (user) {
                            if (user.provider !== 'facebook')
                                return done(
                                    null,
                                    false,
                                    `It's Look like you used google for sign in. Please use google to login.`
                                );

                            return done(null, user);
                        }

                        user = await User.findOne({
                            facebookId: id,
                        });

                        if (user) return done(null, user);

                        user = await User.create({
                            name: displayName,
                            provider: 'facebook',
                            email,
                            image,
                            facebookId: id,
                        });

                        return done(null, user);
                    } catch (err) {
                        console.log(err);
                        return done(null, false, 'Server Error.');
                    }
                } else {
                    return done(
                        null,
                        false,
                        'Please give access to your email.'
                    );
                }
            }
        )
    );

    // Serialize and deserialize user
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user);
        });
    });
};
