export interface CarouselButton {
    type: 'reply' | 'url' | 'copy';
    displayText: string;
    id?: string;
    url?: string;
    copyCode?: string;
}
export interface CarouselCardItem {
    headerTitle?: string;
    body: string;
    footer?: string;
    imageUrl?: string;
    buttons: CarouselButton[];
}
export declare const sendCarouselMessage: (sock: any, jid: string, bodyText: string, footerText: string, cards: CarouselCardItem[], quoted?: any) => Promise<import("../index.js").WAMessage>;
//# sourceMappingURL=carousel.d.ts.map