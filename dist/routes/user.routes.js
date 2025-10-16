"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = userRoutes;
const database_service_1 = require("../services/database.service");
async function userRoutes(fastify) {
    // Get user profile
    fastify.get('/api/users/:id', async (request, reply) => {
        const { id } = request.params;
        try {
            const user = await database_service_1.databaseService.getUserById(parseInt(id));
            if (!user) {
                reply.code(404).send({ error: 'User not found' });
                return;
            }
            reply.send(user);
        }
        catch (error) {
            reply.code(404).send({ error: 'User not found' });
        }
    });
    // Update user profile
    fastify.put('/api/users/:id', async (request, reply) => {
        const { id } = request.params;
        const { bio, avatar } = request.body;
        try {
            await database_service_1.databaseService.updateUserProfile(parseInt(id), bio, avatar);
            reply.send({ success: true });
        }
        catch (error) {
            reply.code(500).send({ error: 'Failed to update profile' });
        }
    });
    // Get all users with blocked status for the requesting user
    fastify.get('/api/users', async (request, reply) => {
        const { userId } = request.query;
        try {
            const users = await database_service_1.databaseService.getAllUsers();
            // If userId is provided, check which users are blocked
            if (userId) {
                const blockedUsers = await database_service_1.databaseService.getBlockedUsers(parseInt(userId));
                const blockedIds = new Set(blockedUsers.map(u => u.id));
                const usersWithBlockStatus = users.map(user => ({
                    ...user,
                    isBlocked: blockedIds.has(user.id)
                }));
                reply.send(usersWithBlockStatus);
            }
            else {
                reply.send(users);
            }
        }
        catch (error) {
            reply.code(500).send({ error: 'Failed to fetch users' });
        }
    });
    // Block user
    fastify.post('/api/users/:userId/block/:targetId', async (request, reply) => {
        const { userId, targetId } = request.params;
        try {
            await database_service_1.databaseService.blockUser(parseInt(userId), parseInt(targetId));
            reply.send({ success: true });
        }
        catch (error) {
            reply.code(400).send({ error: 'Failed to block user' });
        }
    });
    // Unblock user
    fastify.post('/api/users/:userId/unblock/:targetId', async (request, reply) => {
        const { userId, targetId } = request.params;
        try {
            await database_service_1.databaseService.unblockUser(parseInt(userId), parseInt(targetId));
            reply.send({ success: true });
        }
        catch (error) {
            reply.code(500).send({ error: 'Failed to unblock user' });
        }
    });
    // Get blocked users
    fastify.get('/api/blocked/:userId', async (request, reply) => {
        const { userId } = request.params;
        try {
            const users = await database_service_1.databaseService.getBlockedUsers(parseInt(userId));
            reply.send(users);
        }
        catch (error) {
            reply.code(500).send({ error: 'Failed to fetch blocked users' });
        }
    });
}
//# sourceMappingURL=user.routes.js.map