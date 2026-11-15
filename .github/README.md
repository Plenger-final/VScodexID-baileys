# @soft/vscodexid-baileys 🚀

Library WhatsApp Web API berbasis **Baileys** (TypeScript / ES Module) yang sudah dimodifikasi dengan fitur kelas profesional, sistem anti-ban bawaan, dan helper pesan interaktif lengkap. Dikembangkan oleh **VScodexID** ([@Plenger-final](https://github.com)).

---

## ✨ Fitur Ekstra (VScodexID Pro Edition)
- **Auto-Reconnect Anti-Hilang Event**: Koneksi putus langsung nyambung ulang otomatis tanpa bikin *event listener* bot mati.
- **Built-in Anti-Ban (`humanize`)**: Simulasi mengetik (*composing*) + jeda otomatis antar pesan biar nomor aman dari deteksi spam.
- **Interactive Buttons**: Kirim tombol *Quick Reply*, *URL*, dan *Copy Code* tanpa pusing rakit Protobuf manual.
- **Carousel Message**: Kirim kartu produk/menu geser lengkap dengan gambar dan tombol.
- **Album Media**: Kirim banyak foto/video sekaligus jadi satu kotak album rapi.
- **AI Rich Badge**: Tambah label/badge AI di bubble pesan (`aiRich: true`).
- **ViewOnce & Document Helper**: Kirim pesan 1x lihat dan file PDF/dokumen dalam satu baris kode.
- **Sticker EXIF Murni**: Suntik metadata *Pack Name* & *Author* ke stiker `.webp` tanpa dependensi berat.
- **Anti-Delete Otomatis**: Deteksi pesan yang dihapus pengirim dan langsung *forward* balik pesan aslinya.
- **Auto-Follow Saluran & Grup**: Otomatis *follow* banyak link saluran & *join* grup sekaligus.
- **LID to JID Resolver**: Ubah ID `@lid` WhatsApp terbaru menjadi nomor HP `@s.whatsapp.net`.
- **Custom Pairing Code**: Login pakai nomor HP dengan kode pairing 8 karakter kustom buatan sendiri.

---

## 📦 Instalasi

Pastikan proyek kamu menggunakan **Node.js v20+** dan format **ES Module (`"type": "module"`)**.

```bash
npm install github:Plenger-final/VScodexID-baileys
```

---

## 🛠️ Contoh Penggunaan Fitur Pro

### 1. Setup Dasar + Auto-Reconnect + Anti-Ban + Anti-Delete
```javascript
import makeWASocket, { useMultiFileAuthState } from "@soft/vscodexid-baileys"

const { state, saveCreds } = await useMultiFileAuthState("sesi_bot")

const sock = makeWASocket({
    auth: state,
    autoReconnect: true,        // Otomatis nyambung ulang kalau putus
    reconnectIntervalMs: 3000,  // Jeda 3 detik tiap reconnect
    antiBan: true,              // Simulasi ngetik + jeda kirim pesan
    typingDelayMs: 1200,        // Durasi status mengetik (ms)
    antiDelete: true            // Otomatis kirim ulang pesan yang dihapus user
})

sock.ev.on("creds.update", saveCreds)

// Auto-follow banyak saluran & join grup sekaligus saat bot terhubung
sock.autofollow = [
    "https://whatsapp.com",
    "https://whatsapp.com"
]
```

### 2. Custom Pairing Code (8 Karakter Bebas)
```javascript
if (!sock.authState.creds.registered) {
    const code = await sock.requestCustomPairing("6281234567890", "VSCODEX1")
    console.log("Kode Pairing Kamu:", code)
}
```

### 3. Kirim Buttons (Reply, URL, Copy)
```javascript
await sock.sendButtons(jid, {
    title: "Menu Utama VScodexID",
    body: "Silakan pilih tombol di bawah ini:",
    footer: "Powered by VScodexID",
    aiBadge: true, // Opsional: tampilkan icon AI
    buttons: [
        { type: "reply", displayText: "Cek Ping 🏓", id: ".ping" },
        { type: "url", displayText: "GitHub Owner", url: "https://github.com" },
        { type: "copy", displayText: "Salin Kode Promo", copyCode: "VSCODEX2026" }
    ]
})
```

### 4. Kirim Carousel (Kartu Geser)
```javascript
await sock.sendCarousel(
    jid,
    "Katalog Layanan Bot",
    "Geser ke samping untuk melihat paket",
    [
        {
            headerTitle: "Paket VIP",
            body: "Akses penuh semua fitur bot tanpa batas.",
            footer: "Rp 25.000 / bulan",
            imageUrl: "https://example.com",
            buttons: [{ type: "reply", displayText: "Beli VIP", id: ".buyvip" }]
        },
        {
            headerTitle: "Sewa Bot Grup",
            body: "Masukkan bot ke dalam grup kamu 24 jam nonstop.",
            footer: "Rp 15.000 / bulan",
            imageUrl: "https://example.com",
            buttons: [{ type: "url", displayText: "Hubungi Admin", url: "https://wa.me" }]
        }
    ]
)
```

### 5. Kirim Album (Gabungan Banyak Foto/Video)
```javascript
await sock.sendAlbum(jid, [
    { image: { url: "./foto1.jpg" }, caption: "Foto pertama" },
    { image: { url: "./foto2.jpg" }, caption: "Foto kedua" },
    { video: { url: "./video1.mp4" }, caption: "Video ketiga" }
])
```

### 6. ViewOnce, Dokumen PDF, AI Rich & Sticker EXIF
```javascript
// Pesan 1x Lihat (Foto/Video/Audio)
await sock.sendViewOnce(jid, "image", { url: "./rahasia.jpg" }, "Cuma bisa dilihat sekali!")

// Kirim File PDF / Dokumen
await sock.sendDocument(jid, { url: "./panduan.pdf" }, "Panduan-Bot.pdf", "application/pdf", "Ini filenya!")

// Kirim Teks dengan Badge AI
await sock.sendMessage(jid, { text: "Halo! Ada yang bisa AI bantu?", aiRich: true })

// Kirim Stiker WebP dengan Metadata EXIF
import fs from "fs"
const webpBuffer = fs.readFileSync("./stiker.webp")
await sock.sendStickerExif(jid, webpBuffer, {
    packName: "VScodexID Pack",
    author: "Plenger-final"
})
```

### 7. Konversi `@lid` ke Nomor Asli (`@s.whatsapp.net`)
```javascript
const realJid = await sock.lidToJid("12345678901234@lid", groupJid)
console.log("Nomor Asli:", realJid)
```

---

## 📖 Dokumentasi Dasar Baileys (Bahasa Indonesia)

- **Tanpa Browser (WebSocket Murni)**: Baileys tidak memakai Selenium atau Puppeteer, melainkan terhubung langsung ke server WebSocket WhatsApp sehingga sangat hemat RAM & CPU.
- **Mendengarkan Pesan Masuk (`messages.upsert`)**: Gunakan `sock.ev.on("messages.upsert", ({ messages }) => { ... })` untuk menangkap setiap pesan baru.
- **Kirim Pesan Standar**: Gunakan `sock.sendMessage(jid, { text: "Halo!" })`, `{ image: { url } }`, `{ video: { url } }`, atau `{ audio: { url }, ptt: true }` untuk voice note.
- **Manajemen Grup**: Mendukung pembuatan grup (`groupCreate`), tambah/keluarkan anggota (`groupParticipantsUpdate`), ubah judul/deskripsi, hingga ambil kode undangan (`groupInviteCode`).
- **Penyimpanan Sesi**: Gunakan `useMultiFileAuthState` untuk testing lokal, atau buat adapter database (Redis/MongoDB/SQL) untuk skala produksi.

---

<details>
<summary><b>▶️ Klik untuk melihat Dokumentasi Asli Baileys (English Version)</b></summary>

<br>

<h1><img alt="Baileys logo" src="https://raw.githubusercontent.com/VScodexID/Baileys/refs/heads/master/Media/logo.png" height="75"/></h1>


> [!CAUTION]
> NOTICE OF BREAKING CHANGE.
>
> As of 7.0.0, multiple breaking changes were introduced into the library.
>
> Please check out https://whiskey.so/migrate-latest for more information.

Baileys is a WebSockets-based TypeScript library for interacting with the WhatsApp Web API.

Join the VScodexID community via the link: https://whiskey.so/discord

# Usage & Guide

> [!IMPORTANT]
> The new guide is a work in progress. Expect missing pages/content. [Report missing or incorrect content.](https://github.com/VScodexID/baileys.wiki-site/issues/new)
>
> **You can still access the old guide here:** [README.md](https://github.com/VScodexID/Baileys/tree/master/README.md), or the [NPM homepage](https://npmjs.com/package/baileys).

The new guide is posted at https://baileys.wiki .

# Get Support

If you'd like business to enterprise-level support from Rajeh, the current maintainer of Baileys, you can book a video chat. Book a 1 hour time slot by contacting him on Discord or pre-ordering [here](https://purpshell.dev/book). The earlier you pre-order the better, as his time slots usually fill up very quickly. He offers immense value per hour and will answer all your questions before the time runs out.

If you are a business, we encourage you to contribute back to the high development costs of the project and to feed the maintainers who dump tens of hours a week on this. You can do so by booking meetings or sponsoring below. All support, even in bona fide / contribution hours, is welcome by businesses of all sizes. This is not condoning or endorsing businesses to use the library. See the Disclaimer below.

# Sponsor

If you'd like to financially support this project, you can do so by supporting the current maintainer [here](https://purpshell.dev/sponsor).

# Disclaimer
> [!CAUTION]
> This project is not affiliated, associated, authorized, endorsed by, or in any way officially connected with WhatsApp or any of its subsidiaries or its affiliates.
> The official WhatsApp website can be found at whatsapp.com. "WhatsApp" as well as related names, marks, emblems and images are registered trademarks of their respective owners.
>
> The maintainers of Baileys do not in any way condone the use of this application in practices that violate the Terms of Service of WhatsApp. The maintainers of this application call upon the personal responsibility of its users to use this application in a fair way, as it is intended to be used.
> Use at your own discretion. Do not spam people with this. We discourage any stalkerware, bulk or automated messaging usage.

# License
Copyright (c) 2026 Rajeh Taher/VScodexID

Licensed under the MIT License:
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

Thus, the maintainers of the project can't be held liable for any potential misuse of this project.


</details>
