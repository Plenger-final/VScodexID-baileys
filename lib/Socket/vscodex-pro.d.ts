import { type UserFacingSocketConfig } from '../Types/index.js';
import { type AntiDeleteOptions } from '../Features/anti-delete.js';
export type VScodexProConfig = UserFacingSocketConfig & {
    autoReconnect?: boolean;
    reconnectIntervalMs?: number;
    maxReconnectRetries?: number;
    antiBan?: boolean;
    typingDelayMs?: number;
    antiDelete?: boolean | AntiDeleteOptions;
    autofollow?: string[];
};
export declare const makeWASocket: (config: VScodexProConfig) => any;
export default makeWASocket;
//# sourceMappingURL=vscodex-pro.d.ts.map