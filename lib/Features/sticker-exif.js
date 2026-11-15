export const addStickerExif = (webpBuffer, metadata = {}) => {
    const json = {
        'sticker-pack-id': 'com.vscodexid.baileys.' + Date.now(),
        'sticker-pack-name': metadata.packName || 'VScodexID Pack',
        'sticker-pack-publisher': metadata.author || 'VScodexID',
        emojis: metadata.emojis || ['🔥', '🚀']
    };
    const exifAttr = Buffer.from([
        0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00,
        0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00,
        0x00, 0x00, 0x16, 0x00, 0x00, 0x00
    ]);
    const jsonBuff = Buffer.from(JSON.stringify(json), 'utf-8');
    const exif = Buffer.concat([exifAttr, jsonBuff]);
    exif.writeUIntLE(jsonBuff.length, 14, 4);
    // Cari chunk RIFF/WEBP dan sisipkan chunk EXIF
    const riffHeader = webpBuffer.subarray(0, 4).toString('ascii');
    const webpHeader = webpBuffer.subarray(8, 12).toString('ascii');
    if (riffHeader !== 'RIFF' || webpHeader !== 'WEBP') {
        return webpBuffer;
    }
    const exifChunkHeader = Buffer.alloc(8);
    exifChunkHeader.write('EXIF', 0, 4, 'ascii');
    exifChunkHeader.writeUInt32LE(exif.length, 4);
    const pad = exif.length % 2 === 1 ? Buffer.from([0x00]) : Buffer.alloc(0);
    const newWebp = Buffer.concat([webpBuffer, exifChunkHeader, exif, pad]);
    newWebp.writeUInt32LE(newWebp.length - 8, 4);
    return newWebp;
};
export const sendStickerWithExif = async (sock, jid, webpBuffer, metadata, quoted) => {
    const finalSticker = addStickerExif(webpBuffer, metadata);
    return sock.sendMessage(jid, { sticker: finalSticker }, { quoted });
};
//# sourceMappingURL=sticker-exif.js.map