import { proto } from '../../WAProto/index.js';
import { generateWAMessage, generateWAMessageFromContent } from '../Utils/messages.js';
export const sendAlbumMessage = async (sock, jid, medias, quoted) => {
    const imageCount = medias.filter((m) => m.image).length;
    const videoCount = medias.filter((m) => m.video).length;
    const albumParent = generateWAMessageFromContent(jid, {
        albumMessage: proto.Message.AlbumMessage.create({
            expectedImageCount: imageCount,
            expectedVideoCount: videoCount
        })
    }, { quoted, userJid: sock.user?.id || jid });
    await sock.relayMessage(jid, albumParent.message, {
        messageId: albumParent.key.id
    });
    for (const item of medias) {
        const mediaMsg = await generateWAMessage(jid, item, {
            upload: sock.waUploadToServer,
            userJid: sock.user?.id || jid
        });
        mediaMsg.message.messageContextInfo = {
            messageAssociation: {
                associationType: 1,
                parentMessageKey: albumParent.key
            }
        };
        await sock.relayMessage(jid, mediaMsg.message, {
            messageId: mediaMsg.key.id
        });
    }
    return albumParent;
};
//# sourceMappingURL=album.js.map