"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const websocket_1 = __importDefault(require("@fastify/websocket"));
const cors_1 = __importDefault(require("@fastify/cors"));
const config_1 = require("./config");
const websocket_handler_1 = require("./handlers/websocket.handler");
const auth_routes_1 = require("./routes/auth.routes");
const user_routes_1 = require("./routes/user.routes");
const message_routes_1 = require("./routes/message.routes");
const game_routes_1 = require("./routes/game.routes");
const server = (0, fastify_1.default)({ logger: true });
// Register plugins
server.register(cors_1.default, {
    origin: config_1.config.corsOrigins,
    credentials: true
});
server.register(websocket_1.default);
// Setup WebSocket handler
(0, websocket_handler_1.setupWebSocket)(server);
// Register routes
server.register(auth_routes_1.authRoutes);
server.register(user_routes_1.userRoutes);
server.register(message_routes_1.messageRoutes);
server.register(game_routes_1.gameRoutes);
// Start server
const start = async () => {
    try {
        await server.listen({ port: config_1.config.port, host: config_1.config.host });
        console.log(`Server running on http://${config_1.config.host}:${config_1.config.port}`);
    }
    catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};
start();
//# sourceMappingURL=server.js.map