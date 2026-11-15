const delay = (ms) => new Promise((res) => setTimeout(res, ms));
export const runAutoFollow = async (sock, links = []) => {
    if (!Array.isArray(links) || links.length === 0)
        return;
    for (const rawLink of links) {
        const item = rawLink?.trim();
        if (!item)
            continue;
        try {
            // 1. Deteksi Link Saluran (https://whatsapp.com) atau JID @newsletter
            if (item.includes('/channel/') || item.endsWith('@newsletter')) {
                let nlJid = item;
                if (item.includes('/channel/')) {
                    const code = item.split('/channel/')[1]?.split(/[/?#]/)[0];
                    if (code && typeof sock.newsletterMetadata === 'function') {
                        const meta = await sock.newsletterMetadata('invite', code);
                        nlJid = meta?.id;
                    }
                }
                if (nlJid && typeof sock.newsletterFollow === 'function') {
                    await sock.newsletterFollow(nlJid);
                    console.log('[VScodexID] Berhasil follow saluran: ' + nlJid);
                }
            }
            // 2. Deteksi Link Grup (https://whatsapp.com) atau kode invite
            else {
                const cleanCode = item
                    .replace(/https?:\/\/chat\.whatsapp\.com\//gi, '')
                    .split(/[/?#]/)[0]
                    ?.trim();
                if (cleanCode) {
                    await sock.groupAcceptInvite(cleanCode);
                    console.log('[VScodexID] Berhasil join grup: ' + cleanCode);
                }
            }
        }
        catch {
            // Abaikan jika sudah join/follow atau link tidak valid
        }
        // Jeda aman 1.5 detik per link agar tidak kena limit saat 10+ link
        await delay(1500);
    }
};
//# sourceMappingURL=auto-join.js.map