import { Context, Session } from 'koishi';
import { Sat, User } from './types';
export declare class SAT extends Sat {
    config: Sat.Config;
    private apiClient;
    private memoryManager;
    private portraitManager;
    private ChannelParallelCount;
    private onlineUsers;
    private moodManager;
    private game;
    constructor(ctx: Context, config: Sat.Config);
    private getAPIConfig;
    private getMemoryConfig;
    private getMiddlewareConfig;
    private getFavorabilityConfig;
    private registerCommands;
    private handleSatCommand;
    private handleAuxiliaryDialogue;
    private checkFavorabilityBlock;
    private performPreChecks;
    private checkDuplicateDialogue;
    private handleFixedDialoguesCheck;
    private checkUserDialogueCount;
    private updateChannelParallelCount;
    private getChannelParallelCount;
    private processInput;
    generateResponse(session: Session, prompt: string): Promise<{
        content: string;
        error: boolean;
    }>;
    getChatResponse(user: User, messages: Sat.Msg[]): Promise<{
        content: string;
        error: boolean;
    }>;
    private buildMessages;
    private buildSystemPrompt;
    private getThinkingPrompt;
    private formatResponse;
    private clearSession;
    private addCommonSense;
    private handleUserLevel;
    private handleUserUsage;
    handleRandomMiddleware(session: Session, prompt: string): Promise<string>;
    handleNickNameMiddleware(session: Session, prompt: string): Promise<string>;
    handleChannelMemoryManager(session: Session): Promise<void>;
}
export default SAT;
