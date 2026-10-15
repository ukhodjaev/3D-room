# Setap 3D

Interaktiv 3D kompyuter setapi: terminal, klaviatura, kamera, telefon paroli, VR olami.

## Ishga tushirish

Brauzer kamerasi va rasmlar ishlashi uchun saytni lokal server orqali oching (faylni ikki marta bosib emas):

```bash
npm start
```

Keyin brauzerda http://localhost:5173 ni oching.

Node.js bo'lmasa: `python -m http.server 5173`

## Sozlash

`js/config.js` faylida Instagram, Telegram, telefon raqami, FPS hisoblagich va RGB rangini o'zgartirasiz.

## Tuzilishi

- `index.html` — sahifa
- `js/setup3d.js` — 3D dvigatel (three.js r169 + sahna)
- `js/component.js` — mantiq (terminal, quvvat, kamera, VR, telefon)
- `js/app.js` — holatni sahifaga bog'lovchi
- `js/config.js` — sozlamalar
- `assets/` — rasmlar

## Vercel'ga joylash

```bash
npm i -g vercel
vercel        # birinchi marta: loyihani bog'lash
vercel --prod # asosiy manzilga chiqarish
```

Yoki GitHub'ga yuklab, vercel.com → Add New → Project orqali import qiling (Framework: Other, Build command bo'sh).
