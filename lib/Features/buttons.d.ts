export interface ProButton {
    type: 'reply' | 'url' | 'copy';
    displayText: string;
    id?: string;
    url?: string;
    copyCode?: string;
}
export interface ProInteractiveOptions {
    title?: string;
    body: string;
    footer?: string;
    buttons: ProButton[];
    aiBadge?: boolean;
}
export declare const sendButtonsMessage: (sock: any, jid: string, opts: ProInteractiveOptions, quoted?: any) => Promise<import("../index.js").WAMessage>;
//# sourceMappingURL=buttons.d.ts.map