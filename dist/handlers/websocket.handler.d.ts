import type { FastifyInstance } from 'fastify';
import type { WebSocket } from 'ws';
declare const connections: Map<number, WebSocket>;
export declare function broadcastToUser(userId: number, data: any): void;
export declare function setupWebSocket(fastify: FastifyInstance): void;
export { connections };
//# sourceMappingURL=websocket.handler.d.ts.map