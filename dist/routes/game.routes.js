"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gameRoutes = gameRoutes;
const database_service_1 = require("../services/database.service");
const websocket_handler_1 = require("../handlers/websocket.handler");
async function gameRoutes(fastify) {
    // Send game invitation
    fastify.post('/api/game-invite', async (request, reply) => {
        const { senderId, receiverId } = request.body;
        try {
            // Check if sender is blocked by receiver
            const blocked = await database_service_1.databaseService.isBlocked(receiverId, senderId);
            if (blocked) {
                reply.code(403).send({ error: 'Cannot send invitation to this user' });
                return;
            }
            const inviteId = await database_service_1.databaseService.createGameInvitation(senderId, receiverId);
            // Notify receiver via WebSocket
            const sender = await database_service_1.databaseService.getUserById(senderId);
            if (sender) {
                (0, websocket_handler_1.broadcastToUser)(receiverId, {
                    type: 'game_invitation',
                    inviteId,
                    senderId,
                    senderUsername: sender.username
                });
            }
            reply.send({ success: true, inviteId });
        }
        catch (error) {
            reply.code(500).send({ error: 'Failed to send invitation' });
        }
    });
    // Respond to game invitation
    fastify.post('/api/game-invite/respond', async (request, reply) => {
        const { inviteId, status } = request.body;
        try {
            await database_service_1.databaseService.updateGameInvitationStatus(inviteId, status);
            // Notify sender
            const invite = await database_service_1.databaseService.getGameInvitation(inviteId);
            if (invite) {
                (0, websocket_handler_1.broadcastToUser)(invite.sender_id, {
                    type: 'game_invitation_response',
                    inviteId,
                    status,
                    opponentId: invite.receiver_id
                });
            }
            reply.send({ success: true });
        }
        catch (error) {
            reply.code(500).send({ error: 'Failed to respond to invitation' });
        }
    });
    // Create tournament
    fastify.post('/api/tournament', async (request, reply) => {
        const { name, participants } = request.body;
        try {
            const tournamentId = await database_service_1.databaseService.createTournament(name, participants);
            reply.send({ success: true, tournamentId });
        }
        catch (error) {
            reply.code(500).send({ error: 'Failed to create tournament' });
        }
    });
    // Notify next tournament match
    fastify.post('/api/tournament/:id/notify', async (request, reply) => {
        const { id } = request.params;
        const { player1Id, player2Id, round } = request.body;
        try {
            const tournament = await database_service_1.databaseService.getTournament(parseInt(id));
            if (!tournament) {
                reply.code(404).send({ error: 'Tournament not found' });
                return;
            }
            const notification = {
                type: 'tournament_match',
                tournamentId: parseInt(id),
                tournamentName: tournament.name,
                round
            };
            (0, websocket_handler_1.broadcastToUser)(player1Id, { ...notification, opponentId: player2Id });
            (0, websocket_handler_1.broadcastToUser)(player2Id, { ...notification, opponentId: player1Id });
            reply.send({ success: true });
        }
        catch (error) {
            reply.code(404).send({ error: 'Tournament not found' });
        }
    });
}
//# sourceMappingURL=game.routes.js.map