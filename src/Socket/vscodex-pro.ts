import makeBaseWASocket from './index'
import { DisconnectReason, type UserFacingSocketConfig, type AnyMessageContent, type MiscMessageGenerationOptions } from '../Types'
import { Boom } from '@hapi/boom'
import { createAntiBan } from '../Features/anti-ban'
import { sendButtonsMessage, type ProInteractiveOptions } from '../Features/buttons'
import { sendViewOnceMessage, sendDocumentMessage } from '../Features/media-helpers'
import { sendCarouselMessage, type CarouselCardItem } from '../Features/carousel'
import { sendAlbumMessage, type AlbumMediaItem } from '../Features/album'
import { sendStickerWithExif, addStickerExif, type StickerMetadata } from '../Features/sticker-exif'
import { setupAntiDelete, type AntiDeleteOptions } from '../Features/anti-delete'
import { runAutoFollow } from '../Features/auto-join'
import { resolveLidToJid } from '../Features/lid-to-jid'
import { requestCustomPairingCode } from '../Features/custom-pairing'

export type VScodexProConfig = UserFacingSocketConfig & {
    autoReconnect?: boolean
    reconnectIntervalMs?: number
    maxReconnectRetries?: number
    antiBan?: boolean
    typingDelayMs?: number
    antiDelete?: boolean | AntiDeleteOptions
    autofollow?: string[]
}

export const makeWASocket = (config: VScodexProConfig) => {
    const {
        autoReconnect = true,
        reconnectIntervalMs = 3000,
        maxReconnectRetries = 15,
        antiBan = true,
        typingDelayMs = 1200,
        antiDelete = true,
        autofollow = [],
        ...baseConfig
    } = config

    let retryCount = 0
    let isConnected = false
    let savedFollowLinks: string[] = Array.isArray(autofollow) ? [...autofollow] : []
    const humanize = createAntiBan(antiBan, typingDelayMs)
    const currentSock: any = makeBaseWASocket(baseConfig)

    const attachFeatures = (sock: any) => {
        const origSend = sock.sendMessage.bind(sock)

        sock.sendMessage = async (
            jid: string,
            content: AnyMessageContent & { aiRich?: boolean },
            options?: MiscMessageGenerationOptions & { additionalNodes?: any[] }
        ) => {
            await humanize(sock, jid)
            const additionalNodes = content.aiRich
                ? [...(options?.additionalNodes || []), { tag: 'bot', attrs: { biz_bot: '1' } }]
                : options?.additionalNodes
            return origSend(jid, content, { ...options, additionalNodes } as any)
        }

        sock.sendButtons = async (jid: string, opts: ProInteractiveOptions, quoted?: any) => {
            await humanize(sock, jid)
            return sendButtonsMessage(sock, jid, opts, quoted)
        }

        sock.sendViewOnce = async (jid: string, type: 'image' | 'video' | 'audio', media: any, caption?: string, quoted?: any) => {
            await humanize(sock, jid)
            return sendViewOnceMessage(origSend, jid, type, media, caption, quoted)
        }

        sock.sendDocument = async (jid: string, media: any, fileName: string, mimetype?: string, caption?: string, quoted?: any) => {
            await humanize(sock, jid)
            return sendDocumentMessage(origSend, jid, media, fileName, mimetype, caption, quoted)
        }

        sock.sendCarousel = async (jid: string, body: string, footer: string, cards: CarouselCardItem[], quoted?: any) => {
            await humanize(sock, jid)
            return sendCarouselMessage(sock, jid, body, footer, cards, quoted)
        }

        sock.sendAlbum = async (jid: string, medias: AlbumMediaItem[], quoted?: any) => {
            await humanize(sock, jid)
            return sendAlbumMessage(sock, jid, medias, quoted)
        }

        sock.sendStickerExif = async (jid: string, webp: Buffer, meta?: StickerMetadata, quoted?: any) => {
            await humanize(sock, jid)
            return sendStickerWithExif(sock, jid, webp, meta, quoted)
        }

        sock.addStickerExif = addStickerExif
        sock.lidToJid = (id: string, groupJid?: string) => resolveLidToJid(sock, id, groupJid)
        sock.requestCustomPairing = (phone: string, customCode?: string) => requestCustomPairingCode(sock, phone, customCode)

        const autofollowFn: any = (links?: string[]) => runAutoFollow(sock, links || savedFollowLinks)
        Object.defineProperty(sock, 'autofollow', {
            configurable: true,
            enumerable: true,
            get: () => autofollowFn,
            set: (links: string[]) => {
                if (Array.isArray(links)) {
                    savedFollowLinks = links
                    if (isConnected) runAutoFollow(sock, savedFollowLinks)
                }
            }
        })

        if (antiDelete) {
            setupAntiDelete(sock, typeof antiDelete === 'object' ? antiDelete : { enabled: true })
        }

        return sock
    }

    const setupConnection = (sock: any) => {
        attachFeatures(sock)

        sock.ev.on('connection.update', async ({ connection, lastDisconnect }: any) => {
            if (connection === 'open') {
                isConnected = true
                retryCount = 0
                console.log('[VScodexID-Baileys] Terhubung & Semua Fitur Pro Aktif! 🚀')
                if (savedFollowLinks.length > 0) await runAutoFollow(sock, savedFollowLinks)
            } else if (connection === 'close') {
                isConnected = false
                const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode
                const canRetry =
                    autoReconnect &&
                    statusCode !== DisconnectReason.loggedOut &&
                    statusCode !== DisconnectReason.badSession &&
                    retryCount < maxReconnectRetries

                if (canRetry) {
                    retryCount++
                    console.log('[VScodexID-Baileys] Terputus (' + statusCode + '). Reconnect ke-' + retryCount + ' dalam ' + reconnectIntervalMs + 'ms... 🔄')
                    setTimeout(() => {
                        const oldEv = currentSock.ev
                        const newSock: any = makeBaseWASocket(baseConfig)
                        // Pertahankan EventEmitter lama agar semua listener bot tetap aktif
                        newSock.ev = oldEv
                        Object.assign(currentSock, attachFeatures(newSock))
                        setupConnection(newSock)
                    }, reconnectIntervalMs)
                }
            }
        })
    }

    setupConnection(currentSock)
    return currentSock
}

export default makeWASocket
