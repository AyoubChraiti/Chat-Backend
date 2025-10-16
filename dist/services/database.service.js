"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.databaseService = exports.DatabaseService = void 0;
const sqlite3_1 = __importDefault(require("sqlite3"));
const config_1 = require("../config");
class DatabaseService {
    constructor() {
        this.db = new sqlite3_1.default.Database(config_1.config.dbPath);
        this.initializeTables();
    }
    initializeTables() {
        this.db.serialize(() => {
            // Users table
            this.db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        bio TEXT,
        avatar TEXT,
        status TEXT DEFAULT 'offline',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);
            // Messages table
            this.db.run(`CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender_id INTEGER NOT NULL,
        receiver_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        message_type TEXT DEFAULT 'text',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id) REFERENCES users(id),
        FOREIGN KEY (receiver_id) REFERENCES users(id)
      )`);
            // Blocked users table
            this.db.run(`CREATE TABLE IF NOT EXISTS blocked_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        blocker_id INTEGER NOT NULL,
        blocked_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (blocker_id) REFERENCES users(id),
        FOREIGN KEY (blocked_id) REFERENCES users(id),
        UNIQUE(blocker_id, blocked_id)
      )`);
            // Game invitations table
            this.db.run(`CREATE TABLE IF NOT EXISTS game_invitations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender_id INTEGER NOT NULL,
        receiver_id INTEGER NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id) REFERENCES users(id),
        FOREIGN KEY (receiver_id) REFERENCES users(id)
      )`);
            // Tournament table
            this.db.run(`CREATE TABLE IF NOT EXISTS tournaments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        current_round INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);
            // Tournament participants table
            this.db.run(`CREATE TABLE IF NOT EXISTS tournament_participants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tournament_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        position INTEGER,
        next_match_id INTEGER,
        FOREIGN KEY (tournament_id) REFERENCES tournaments(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )`);
        });
    }
    // User operations
    createUser(username, hashedPassword) {
        return new Promise((resolve, reject) => {
            this.db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], function (err) {
                if (err)
                    reject(err);
                else
                    resolve(this.lastID);
            });
        });
    }
    getUserByCredentials(username, hashedPassword) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, hashedPassword], (err, row) => {
                if (err)
                    reject(err);
                else
                    resolve(row);
            });
        });
    }
    getUserById(id) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT id, username, bio, avatar, status, created_at FROM users WHERE id = ?', [id], (err, row) => {
                if (err)
                    reject(err);
                else
                    resolve(row);
            });
        });
    }
    getAllUsers() {
        return new Promise((resolve, reject) => {
            this.db.all('SELECT id, username, status FROM users', [], (err, rows) => {
                if (err)
                    reject(err);
                else
                    resolve(rows);
            });
        });
    }
    updateUserProfile(id, bio, avatar) {
        return new Promise((resolve, reject) => {
            this.db.run('UPDATE users SET bio = ?, avatar = ? WHERE id = ?', [bio, avatar, id], (err) => {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    }
    updateUserStatus(id, status) {
        return new Promise((resolve, reject) => {
            this.db.run('UPDATE users SET status = ? WHERE id = ?', [status, id], (err) => {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    }
    // Message operations
    createMessage(senderId, receiverId, content) {
        return new Promise((resolve, reject) => {
            this.db.run('INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)', [senderId, receiverId, content], function (err) {
                if (err)
                    reject(err);
                else
                    resolve(this.lastID);
            });
        });
    }
    getMessageById(id) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM messages WHERE id = ?', [id], (err, row) => {
                if (err)
                    reject(err);
                else
                    resolve(row);
            });
        });
    }
    getConversation(userId1, userId2) {
        return new Promise((resolve, reject) => {
            this.db.all(`SELECT m.*, u.username as sender_username 
         FROM messages m 
         JOIN users u ON m.sender_id = u.id
         WHERE (m.sender_id = ? AND m.receiver_id = ?) 
            OR (m.sender_id = ? AND m.receiver_id = ?)
         ORDER BY m.created_at ASC`, [userId1, userId2, userId2, userId1], (err, rows) => {
                if (err)
                    reject(err);
                else
                    resolve(rows);
            });
        });
    }
    // Blocking operations
    isBlocked(blockerId, blockedId) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM blocked_users WHERE blocker_id = ? AND blocked_id = ?', [blockerId, blockedId], (err, row) => {
                if (err)
                    reject(err);
                else
                    resolve(!!row);
            });
        });
    }
    blockUser(blockerId, blockedId) {
        return new Promise((resolve, reject) => {
            this.db.run('INSERT INTO blocked_users (blocker_id, blocked_id) VALUES (?, ?)', [blockerId, blockedId], (err) => {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    }
    unblockUser(blockerId, blockedId) {
        return new Promise((resolve, reject) => {
            this.db.run('DELETE FROM blocked_users WHERE blocker_id = ? AND blocked_id = ?', [blockerId, blockedId], (err) => {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    }
    getBlockedUsers(userId) {
        return new Promise((resolve, reject) => {
            this.db.all(`SELECT u.id, u.username FROM users u
         JOIN blocked_users b ON u.id = b.blocked_id
         WHERE b.blocker_id = ?`, [userId], (err, rows) => {
                if (err)
                    reject(err);
                else
                    resolve(rows);
            });
        });
    }
    // Game invitation operations
    createGameInvitation(senderId, receiverId) {
        return new Promise((resolve, reject) => {
            this.db.run('INSERT INTO game_invitations (sender_id, receiver_id) VALUES (?, ?)', [senderId, receiverId], function (err) {
                if (err)
                    reject(err);
                else
                    resolve(this.lastID);
            });
        });
    }
    updateGameInvitationStatus(inviteId, status) {
        return new Promise((resolve, reject) => {
            this.db.run('UPDATE game_invitations SET status = ? WHERE id = ?', [status, inviteId], (err) => {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    }
    getGameInvitation(inviteId) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT sender_id, receiver_id FROM game_invitations WHERE id = ?', [inviteId], (err, row) => {
                if (err)
                    reject(err);
                else
                    resolve(row);
            });
        });
    }
    // Tournament operations
    async createTournament(name, participants) {
        const tournamentId = await new Promise((resolve, reject) => {
            this.db.run('INSERT INTO tournaments (name, status) VALUES (?, ?)', [name, 'pending'], function (err) {
                if (err)
                    reject(err);
                else
                    resolve(this.lastID);
            });
        });
        const stmt = this.db.prepare('INSERT INTO tournament_participants (tournament_id, user_id, position) VALUES (?, ?, ?)');
        for (let i = 0; i < participants.length; i++) {
            stmt.run(tournamentId, participants[i], i + 1);
        }
        return new Promise((resolve, reject) => {
            stmt.finalize((err) => {
                if (err)
                    reject(err);
                else
                    resolve(tournamentId);
            });
        });
    }
    getTournament(id) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT name FROM tournaments WHERE id = ?', [id], (err, row) => {
                if (err)
                    reject(err);
                else
                    resolve(row);
            });
        });
    }
    getDatabase() {
        return this.db;
    }
}
exports.DatabaseService = DatabaseService;
exports.databaseService = new DatabaseService();
//# sourceMappingURL=database.service.js.map