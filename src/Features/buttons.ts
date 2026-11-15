import { proto } from '../../WAProto/index.js'
import { generateWAMessageFromContent } from '../Utils/messages'

export interface ProButton {
    type: 'reply' | 'url' | 'copy'
    displayText: string
    id?: string
    url?: string
    copyCode?: string
}

export interface ProInteractiveOptions {
    title?: string
    body: string
    footer?: string
    buttons: ProButton[]
    aiBadge?: boolean
}

export const sendButtonsMessage = async (sock: any, jid: string, opts: ProInteractiveOptions, quoted?: any) => {
    const nativeButtons = opts.buttons.map((btn, idx) => {
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
                        body: proto.Message.InteractiveMessage.Body.create({ text: opts.body }),
                        footer: proto.Message.InteractiveMessage.Footer.create({ text: opts.footer || '' }),
                        header: proto.Message.InteractiveMessage.Header.create({
                            title: opts.title || '',
                            subtitle: '',
                            hasMediaAttachment: false
                        }),
                        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                            buttons: nativeButtons
                        })
                    })
                }
            }
        },
        { quoted, userJid: sock.user?.id || jid }
    )

    const additionalNodes: any[] = [
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

    if (opts.aiBadge) {
        additionalNodes.push({ tag: 'bot', attrs: { biz_bot: '1' } })
    }

    await sock.relayMessage(jid, msg.message!, {
        messageId: msg.key.id!,
        additionalNodes
    })

    return msg
}
