import sqlite3 from 'sqlite3';
import { User, Message, GameInvitation, Tournament } from '../types';
export declare class DatabaseService {
    private db;
    constructor();
    private initializeTables;
    createUser(username: string, hashedPassword: string): Promise<number>;
    getUserByCredentials(username: string, hashedPassword: string): Promise<User | undefined>;
    getUserById(id: number): Promise<User | undefined>;
    getAllUsers(): Promise<User[]>;
    updateUserProfile(id: number, bio: string, avatar: string): Promise<void>;
    updateUserStatus(id: number, status: 'online' | 'offline'): Promise<void>;
    createMessage(senderId: number, receiverId: number, content: string): Promise<number>;
    getMessageById(id: number): Promise<Message | undefined>;
    getConversation(userId1: number, userId2: number): Promise<any[]>;
    isBlocked(blockerId: number, blockedId: number): Promise<boolean>;
    blockUser(blockerId: number, blockedId: number): Promise<void>;
    unblockUser(blockerId: number, blockedId: number): Promise<void>;
    getBlockedUsers(userId: number): Promise<User[]>;
    createGameInvitation(senderId: number, receiverId: number): Promise<number>;
    updateGameInvitationStatus(inviteId: number, status: string): Promise<void>;
    getGameInvitation(inviteId: number): Promise<GameInvitation | undefined>;
    createTournament(name: string, participants: number[]): Promise<number>;
    getTournament(id: number): Promise<Tournament | undefined>;
    getDatabase(): sqlite3.Database;
}
export declare const databaseService: DatabaseService;
//# sourceMappingURL=database.service.d.ts.map