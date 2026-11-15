const delay = (ms) => new Promise((res) => setTimeout(res, ms));
export const createAntiBan = (enabled = true, typingDelayMs = 1200) => {
    let lastSendTime = 0;
    return async (sock, jid) => {
        if (!enabled)
            return;
        const now = Date.now();
        const diff = now - lastSendTime;
        if (diff < 1000) {
            await delay(1000 - diff);
        }
        try {
            await sock.presenceSubscribe(jid);
            await sock.sendPresenceUpdate('composing', jid);
            await delay(typingDelayMs);
            await sock.sendPresenceUpdate('paused', jid);
        }
        catch {
            // Abaikan error presence
        }
        lastSendTime = Date.now();
    };
};
//# sourceMappingURL=anti-ban.js.map