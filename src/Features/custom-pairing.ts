export const requestCustomPairingCode = async (
    sock: any,
    phoneNumber: string,
    customCode?: string
): Promise<string> => {
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '')

    // Jika customCode diisi, pastikan panjangnya tepat 8 karakter alfanumerik huruf besar
    let formattedCustom: string | undefined = undefined
    if (customCode) {
        formattedCustom = customCode
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, '')
            .padEnd(8, 'X')
            .slice(0, 8)
    }

    const code = await sock.requestPairingCode(cleanNumber, formattedCustom)
    return code
}
