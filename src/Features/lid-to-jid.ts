export const resolveLidToJid = async (sock: any, id: string, groupJid?: string): Promise<string> => {
    if (!id) return id
    if (!id.endsWith('@lid')) return id

    // 1. Cek di cache internal sock jika tersedia
    if (sock.signalRepository?.lidMapping?.getPNForLID) {
        try {
            const pn = await sock.signalRepository.lidMapping.getPNForLID(id)
            if (pn) return pn.includes('@') ? pn : pn + '@s.whatsapp.net'
        } catch {
            // Lanjut ke pencarian metadata grup
        }
    }

    // 2. Cek melalui metadata grup
    if (groupJid && groupJid.endsWith('@g.us')) {
        try {
            const meta = await sock.groupMetadata(groupJid)
            const found = meta.participants.find((p: any) => p.lid === id || p.id === id)
            if (found && found.jid && found.jid.endsWith('@s.whatsapp.net')) {
                return found.jid
            }
        } catch {
            // Abaikan jika gagal mengambil metadata grup
        }
    }

    return id
}
