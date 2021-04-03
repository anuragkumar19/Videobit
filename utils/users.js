class Users {
    constructor() {
        this.users = [];
    }

    createUser(id, user, room, userId) {
        this.users.push({
            id,
            user,
            room,
            userId,
        });
    }

    getUser(id) {
        return this.users.find((u) => u.id === id);
    }

    deleteUser(id) {
        const user = this.getUser(id);

        if (user) {
            const i = this.users.indexOf(user);
            if (i !== -1) {
                this.users.splice(i, 1);
                return user;
            }
        }
    }

    getRoomUser(room) {
        return this.users.filter((u) => u.room === room);
    }
}

module.exports = new Users();
