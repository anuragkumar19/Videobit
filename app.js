const express = require('express');
const http = require('http');
const path = require('path');
const dotenv = require('dotenv');
const morgan = require('morgan');
const flash = require('connect-flash');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const socketio = require('socket.io');

const { userMiddleware } = require('./middlewares/auth');
const users = require('./utils/users');
const formatter = require('./utils/message');

// Init App and sever
const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Dotenv config
dotenv.config();

// Connect to database
require('./config/db')();

// Passport config
require('./config/passport')(passport);

// View Engine
app.set('view engine', 'ejs');

// Middlewares
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));

// Express session
app.use(
    session({
        secret: process.env.SECRET,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
        cookie: {
            maxAge: 60 * 60 * 24 * 90 * 1000,
        },
    })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Flash Message
app.use(flash());
app.use((req, res, next) => {
    res.locals.error_flash = req.flash('error');
    res.locals.success_flash = req.flash('success');
    next();
});

// Devlopment Middlewares
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.use(userMiddleware);

// Routes
app.use('/', require('./routes/index'));

io.on('connection', (socket) => {
    socket.on('join-user', ({ roomId, userId, Name }) => {
        users.createUser(socket.id, Name, roomId, userId);

        socket.join(roomId);
        socket.broadcast.to(roomId).emit('user-connected', { userId });

        io.to(roomId).emit('roomUsers', {
            users: users.getRoomUser(roomId),
        });

        socket.on('disconnect', () => {
            socket.broadcast.to(roomId).emit('user-disconnected', userId);
            const user = users.deleteUser(socket.id);
            io.to(user.room).emit('roomUsers', {
                users: users.getRoomUser(user.room),
            });
        });
    });

    socket.on('chatMessage', (msg) => {
        if (typeof msg !== 'string' || !msg.trim() || !msg) {
            return;
        }
        const user = users.getUser(socket.id);

        if (user) {
            io.to(user.room).emit('message', formatter(msg, user));
        }
    });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () =>
    console.log(`Server listening on http://localhost:${PORT}`)
);
