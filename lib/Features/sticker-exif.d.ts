export interface StickerMetadata {
    packName?: string;
    author?: string;
    emojis?: string[];
}
export declare const addStickerExif: (webpBuffer: Buffer, metadata?: StickerMetadata) => Buffer;
export declare const sendStickerWithExif: (sock: any, jid: string, webpBuffer: Buffer, metadata?: StickerMetadata, quoted?: any) => Promise<any>;
//# sourceMappingURL=sticker-exif.d.ts.map