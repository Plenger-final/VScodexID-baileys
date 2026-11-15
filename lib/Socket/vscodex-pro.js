import makeBaseWASocket from './index.js';
import { DisconnectReason } from '../Types/index.js';
import { Boom } from '@hapi/boom';
import { createAntiBan } from '../Features/anti-ban.js';
import { sendButtonsMessage } from '../Features/buttons.js';
import { sendViewOnceMessage, sendDocumentMessage } from '../Features/media-helpers.js';
import { sendCarouselMessage } from '../Features/carousel.js';
import { sendAlbumMessage } from '../Features/album.js';
import { sendStickerWithExif, addStickerExif } from '../Features/sticker-exif.js';
import { setupAntiDelete } from '../Features/anti-delete.js';
import { runAutoFollow } from '../Features/auto-join.js';
import { resolveLidToJid } from '../Features/lid-to-jid.js';
import { requestCustomPairingCode } from '../Features/custom-pairing.js';
export const makeWASocket = (config) => {
    const { autoReconnect = true, reconnectIntervalMs = 3000, maxReconnectRetries = 15, antiBan = true, typingDelayMs = 1200, antiDelete = true, autofollow = [], ...baseConfig } = config;
    let retryCount = 0;
    let isConnected = false;
    let savedFollowLinks = Array.isArray(autofollow) ? [...autofollow] : [];
    const humanize = createAntiBan(antiBan, typingDelayMs);
    const currentSock = makeBaseWASocket(baseConfig);
    const attachFeatures = (sock) => {
        const origSend = sock.sendMessage.bind(sock);
        sock.sendMessage = async (jid, content, options) => {
            await humanize(sock, jid);
            const additionalNodes = content.aiRich
                ? [...(options?.additionalNodes || []), { tag: 'bot', attrs: { biz_bot: '1' } }]
                : options?.additionalNodes;
            return origSend(jid, content, { ...options, additionalNodes });
        };
        sock.sendButtons = async (jid, opts, quoted) => {
            await humanize(sock, jid);
            return sendButtonsMessage(sock, jid, opts, quoted);
        };
        sock.sendViewOnce = async (jid, type, media, caption, quoted) => {
            await humanize(sock, jid);
            return sendViewOnceMessage(origSend, jid, type, media, caption, quoted);
        };
        sock.sendDocument = async (jid, media, fileName, mimetype, caption, quoted) => {
            await humanize(sock, jid);
            return sendDocumentMessage(origSend, jid, media, fileName, mimetype, caption, quoted);
        };
        sock.sendCarousel = async (jid, body, footer, cards, quoted) => {
            await humanize(sock, jid);
            return sendCarouselMessage(sock, jid, body, footer, cards, quoted);
        };
        sock.sendAlbum = async (jid, medias, quoted) => {
            await humanize(sock, jid);
            return sendAlbumMessage(sock, jid, medias, quoted);
        };
        sock.sendStickerExif = async (jid, webp, meta, quoted) => {
            await humanize(sock, jid);
            return sendStickerWithExif(sock, jid, webp, meta, quoted);
        };
        sock.addStickerExif = addStickerExif;
        sock.lidToJid = (id, groupJid) => resolveLidToJid(sock, id, groupJid);
        sock.requestCustomPairing = (phone, customCode) => requestCustomPairingCode(sock, phone, customCode);
        const autofollowFn = (links) => runAutoFollow(sock, links || savedFollowLinks);
        Object.defineProperty(sock, 'autofollow', {
            configurable: true,
            enumerable: true,
            get: () => autofollowFn,
            set: (links) => {
                if (Array.isArray(links)) {
                    savedFollowLinks = links;
                    if (isConnected)
                        runAutoFollow(sock, savedFollowLinks);
                }
            }
        });
        if (antiDelete) {
            setupAntiDelete(sock, typeof antiDelete === 'object' ? antiDelete : { enabled: true });
        }
        return sock;
    };
    const setupConnection = (sock) => {
        attachFeatures(sock);
        sock.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
            if (connection === 'open') {
                isConnected = true;
                retryCount = 0;
                console.log('[VScodexID-Baileys] Terhubung & Semua Fitur Pro Aktif! 🚀');
                if (savedFollowLinks.length > 0)
                    await runAutoFollow(sock, savedFollowLinks);
            }
            else if (connection === 'close') {
                isConnected = false;
                const statusCode = lastDisconnect?.error?.output?.statusCode;
                const canRetry = autoReconnect &&
                    statusCode !== DisconnectReason.loggedOut &&
                    statusCode !== DisconnectReason.badSession &&
                    retryCount < maxReconnectRetries;
                if (canRetry) {
                    retryCount++;
                    console.log('[VScodexID-Baileys] Terputus (' + statusCode + '). Reconnect ke-' + retryCount + ' dalam ' + reconnectIntervalMs + 'ms... 🔄');
                    setTimeout(() => {
                        const oldEv = currentSock.ev;
                        const newSock = makeBaseWASocket(baseConfig);
                        // Pertahankan EventEmitter lama agar semua listener bot tetap aktif
                        newSock.ev = oldEv;
                        Object.assign(currentSock, attachFeatures(newSock));
                        setupConnection(newSock);
                    }, reconnectIntervalMs);
                }
            }
        });
    };
    setupConnection(currentSock);
    return currentSock;
};
export default makeWASocket;
//# sourceMappingURL=vscodex-pro.js.map