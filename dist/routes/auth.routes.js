"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = authRoutes;
const database_service_1 = require("../services/database.service");
const crypto_1 = require("../utils/crypto");
async function authRoutes(fastify) {
    // usr regis
    fastify.post('/api/register', async (request, reply) => {
        const { username, password } = request.body;
        const hashedPassword = (0, crypto_1.hashPassword)(password);
        try {
            const id = await database_service_1.databaseService.createUser(username, hashedPassword);
            reply.send({ id, username });
        }
        catch (error) {
            reply.code(400).send({ error: 'Username already exists' });
        }
    });
    // urs login
    fastify.post('/api/login', async (request, reply) => {
        const { username, password } = request.body;
        const hashedPassword = (0, crypto_1.hashPassword)(password);
        try {
            const user = await database_service_1.databaseService.getUserByCredentials(username, hashedPassword);
            if (!user) {
                reply.code(401).send({ error: 'Invalid credentials' });
                return;
            }
            await database_service_1.databaseService.updateUserStatus(user.id, 'online');
            reply.send({ id: user.id, username: user.username });
        }
        catch (error) {
            reply.code(401).send({ error: 'Invalid credentials' });
        }
    });
}
//# sourceMappingURL=auth.routes.js.map