import { proto } from '../../WAProto/index.js'
import { generateWAMessageFromContent, prepareWAMessageMedia } from '../Utils/messages'

export interface CarouselButton {
    type: 'reply' | 'url' | 'copy'
    displayText: string
    id?: string
    url?: string
    copyCode?: string
}

export interface CarouselCardItem {
    headerTitle?: string
    body: string
    footer?: string
    imageUrl?: string
    buttons: CarouselButton[]
}

export const sendCarouselMessage = async (
    sock: any,
    jid: string,
    bodyText: string,
    footerText: string,
    cards: CarouselCardItem[],
    quoted?: any
) => {
    const builtCards = await Promise.all(
        cards.map(async (card) => {
            let imageMessage: any = undefined
            if (card.imageUrl) {
                const media = await prepareWAMessageMedia(
                    { image: { url: card.imageUrl } },
                    { upload: sock.waUploadToServer }
                )
                imageMessage = media.imageMessage
            }

            const buttons = card.buttons.map((btn, idx) => {
                if (btn.type === 'url') {
                    return {
                        name: 'cta_url',
                        buttonParamsJson: JSON.stringify({
                            display_text: btn.displayText,
                            url: btn.url,
                            merchant_url: btn.url
                        })
                    }
                }
                if (btn.type === 'copy') {
                    return {
                        name: 'cta_copy',
                        buttonParamsJson: JSON.stringify({
                            display_text: btn.displayText,
                            id: btn.id || 'copy_' + idx,
                            copy_code: btn.copyCode
                        })
                    }
                }
                return {
                    name: 'quick_reply',
                    buttonParamsJson: JSON.stringify({
                        display_text: btn.displayText,
                        id: btn.id || 'btn_' + idx
                    })
                }
            })

            return proto.Message.InteractiveMessage.create({
                body: proto.Message.InteractiveMessage.Body.create({ text: card.body }),
                footer: proto.Message.InteractiveMessage.Footer.create({ text: card.footer || '' }),
                header: proto.Message.InteractiveMessage.Header.create({
                    title: card.headerTitle || '',
                    hasMediaAttachment: Boolean(imageMessage),
                    imageMessage
                }),
                nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                    buttons
                })
            })
        })
    )

    const msg = generateWAMessageFromContent(
        jid,
        {
            viewOnceMessage: {
                message: {
                    messageContextInfo: {
                        deviceListMetadata: {},
                        deviceListMetadataVersion: 2
                    },
                    interactiveMessage: proto.Message.InteractiveMessage.create({
                        body: proto.Message.InteractiveMessage.Body.create({ text: bodyText }),
                        footer: proto.Message.InteractiveMessage.Footer.create({ text: footerText }),
                        carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.create({
                            cards: builtCards
                        })
                    })
                }
            }
        },
        { quoted, userJid: sock.user?.id || jid }
    )

    await sock.relayMessage(jid, msg.message!, {
        messageId: msg.key.id!,
        additionalNodes: [
            {
                tag: 'biz',
                attrs: {},
                content: [
                    {
                        tag: 'interactive',
                        attrs: { type: 'native_flow', v: '1' },
                        content: [{ tag: 'native_flow', attrs: { name: 'quick_reply' } }]
                    }
                ]
            }
        ]
    })

    return msg
}
