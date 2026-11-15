import { proto } from '../../WAProto/index.js'
import { generateWAMessage, generateWAMessageFromContent } from '../Utils/messages'

export interface AlbumMediaItem {
    image?: Buffer | { url: string }
    video?: Buffer | { url: string }
    caption?: string
}

export const sendAlbumMessage = async (
    sock: any,
    jid: string,
    medias: AlbumMediaItem[],
    quoted?: any
) => {
    const imageCount = medias.filter((m) => m.image).length
    const videoCount = medias.filter((m) => m.video).length

    const albumParent = generateWAMessageFromContent(
        jid,
        {
            albumMessage: proto.Message.AlbumMessage.create({
                expectedImageCount: imageCount,
                expectedVideoCount: videoCount
            })
        },
        { quoted, userJid: sock.user?.id || jid }
    )

    await sock.relayMessage(jid, albumParent.message!, {
        messageId: albumParent.key.id!
    })

    for (const item of medias) {
        const mediaMsg = await generateWAMessage(jid, item as any, {
            upload: sock.waUploadToServer,
            userJid: sock.user?.id || jid
        })

        mediaMsg.message!.messageContextInfo = {
            messageAssociation: {
                associationType: 1,
                parentMessageKey: albumParent.key
            }
        }

        await sock.relayMessage(jid, mediaMsg.message!, {
            messageId: mediaMsg.key.id!
        })
    }

    return albumParent
}
