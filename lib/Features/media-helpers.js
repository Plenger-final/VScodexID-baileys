export const sendViewOnceMessage = async (originalSendMessage, jid, mediaType, bufferOrUrl, caption, quoted) => {
    return originalSendMessage(jid, {
        [mediaType]: bufferOrUrl,
        caption: caption || '',
        viewOnce: true
    }, { quoted });
};
export const sendDocumentMessage = async (originalSendMessage, jid, bufferOrUrl, fileName, mimetype = 'application/pdf', caption, quoted) => {
    return originalSendMessage(jid, {
        document: bufferOrUrl,
        fileName,
        mimetype,
        caption: caption || ''
    }, { quoted });
};
//# sourceMappingURL=media-helpers.js.map