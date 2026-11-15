export interface AlbumMediaItem {
    image?: Buffer | {
        url: string;
    };
    video?: Buffer | {
        url: string;
    };
    caption?: string;
}
export declare const sendAlbumMessage: (sock: any, jid: string, medias: AlbumMediaItem[], quoted?: any) => Promise<import("../index.js").WAMessage>;
//# sourceMappingURL=album.d.ts.map