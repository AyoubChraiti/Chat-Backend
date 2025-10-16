"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageRoutes = messageRoutes;
const database_service_1 = require("../services/database.service");
async function messageRoutes(fastify) {
    // Get conversation history
    fastify.get('/api/messages/:userId/:otherUserId', async (request, reply) => {
        const { userId, otherUserId } = request.params;
        try {
            const messages = await database_service_1.databaseService.getConversation(parseInt(userId), parseInt(otherUserId));
            reply.send(messages);
        }
        catch (error) {
            reply.code(500).send({ error: 'Failed to fetch messages' });
        }
    });
}
//# sourceMappingURL=message.routes.js.map