export declare const sendViewOnceMessage: (originalSendMessage: any, jid: string, mediaType: "image" | "video" | "audio", bufferOrUrl: Buffer | {
    url: string;
}, caption?: string, quoted?: any) => Promise<any>;
export declare const sendDocumentMessage: (originalSendMessage: any, jid: string, bufferOrUrl: Buffer | {
    url: string;
}, fileName: string, mimetype?: string, caption?: string, quoted?: any) => Promise<any>;
//# sourceMappingURL=media-helpers.d.ts.map