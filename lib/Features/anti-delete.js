export const setupAntiDelete = (sock, opts = {}) => {
    const { enabled = true, forwardTo, maxCache = 500 } = opts;
    if (!enabled)
        return;
    const messageCache = new Map();
    sock.ev.on('messages.upsert', async ({ messages }) => {
        for (const msg of messages) {
            if (!msg.message || msg.key.fromMe)
                continue;
            // Simpan pesan masuk ke cache
            if (msg.key.id) {
                if (messageCache.size >= maxCache) {
                    const oldestKey = messageCache.keys().next().value;
                    if (oldestKey)
                        messageCache.delete(oldestKey);
                }
                messageCache.set(msg.key.id, msg);
            }
            // Deteksi pesan ditarik (protocolMessage type 0 = REVOKE)
            const protocolMsg = msg.message?.protocolMessage;
            if (protocolMsg && protocolMsg.type === 0 && protocolMsg.key?.id) {
                const deletedId = protocolMsg.key.id;
                const originalMsg = messageCache.get(deletedId);
                if (originalMsg) {
                    const targetJid = forwardTo || msg.key.remoteJid;
                    const sender = originalMsg.key.participant || originalMsg.key.remoteJid;
                    await sock.sendMessage(targetJid, {
                        text: '🚨 *[ANTI-DELETE DETECTED]*\nPesan dari @' + sender.split('@')[0] + ' baru saja dihapus:',
                        mentions: [sender]
                    }, { quoted: originalMsg });
                    await sock.sendMessage(targetJid, { forward: originalMsg });
                }
            }
        }
    });
};
//# sourceMappingURL=anti-delete.js.map