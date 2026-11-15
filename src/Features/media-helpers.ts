export const sendViewOnceMessage = async (
    originalSendMessage: any,
    jid: string,
    mediaType: 'image' | 'video' | 'audio',
    bufferOrUrl: Buffer | { url: string },
    caption?: string,
    quoted?: any
) => {
    return originalSendMessage(
        jid,
        {
            [mediaType]: bufferOrUrl,
            caption: caption || '',
            viewOnce: true
        },
        { quoted }
    )
}

export const sendDocumentMessage = async (
    originalSendMessage: any,
    jid: string,
    bufferOrUrl: Buffer | { url: string },
    fileName: string,
    mimetype = 'application/pdf',
    caption?: string,
    quoted?: any
) => {
    return originalSendMessage(
        jid,
        {
            document: bufferOrUrl,
            fileName,
            mimetype,
            caption: caption || ''
        },
        { quoted }
    )
}
