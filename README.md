# ProfilesignGM

Website statik untuk menampilkan foto profil dan kartu tanda tangan banyak karyawan. Setiap profile tetap memakai transisi foto ke tanda tangan, sedangkan logo dan nama perusahaan dikelola secara global.

## URL

- Daftar karyawan: <https://maleosan.github.io/ProfilesignGM/>
- Contoh profile: <https://maleosan.github.io/ProfilesignGM/michael/>
- Employee Manager: <https://maleosan.github.io/ProfilesignGM/admin.html>

## Struktur

```text
/
├── index.html
├── admin.html
├── 404.html
├── employees.json
├── settings.json
├── README.md
├── michael/index.html
├── andi/index.html
├── budi/index.html
├── profile-tidak-ada/index.html
└── assets/
    ├── logo.png
    ├── directory.css
    ├── directory.js
    ├── profile.css
    ├── profile.js
    ├── admin.css
    ├── admin.js
    └── employees/
        └── michael/
            ├── profile.jpg
            └── signature.png
```

## Menambah karyawan

1. Buka `admin.html` melalui GitHub Pages.
2. Klik **Karyawan Baru**.
3. Masukkan nama karyawan.
4. Masukkan jabatan.
5. Masukkan slug unik menggunakan huruf kecil, angka, atau tanda hubung.
6. Pilih foto profil.
7. Pilih gambar tanda tangan.
8. Klik **Preview** untuk memeriksa hasil.
9. Klik **Generate / Export** untuk mengunduh ZIP karyawan.
10. Masukkan isi ZIP ke root repository, lalu commit/push.

ZIP karyawan berisi route `slug/index.html`, data JSON, foto, tanda tangan, dan pengaturan global yang diperlukan. Tombol **Export employees.json** mengunduh data karyawan terbaru. Tombol **Export All** menghasilkan semua data, route, dan aset karyawan dalam satu ZIP.

## Data karyawan

Data berada di `employees.json`:

```json
{
  "michael": {
    "name": "Zacharias Marshel Hendrik",
    "position": "General Manager",
    "profile": "assets/employees/michael/profile.jpg",
    "signature": "assets/employees/michael/signature.png"
  }
}
```

Nama dan jabatan berupa teks HTML dinamis. Tanda tangan hanya berisi gambar tanda tangan, tidak digabung dengan nama.

## Mengubah perusahaan

`settings.json` mengatur nama perusahaan dan logo global:

```json
{
  "companyName": "Swiss-Belhotel Maleosan Manado",
  "logo": "assets/logo.png"
}
```

Untuk mengganti perusahaan:

1. Buka bagian **Company Settings** di `admin.html`.
2. Ubah nama perusahaan dan/atau pilih logo baru.
3. Klik **Preview**.
4. Klik **Export Settings**.
5. Masukkan `settings.json` dan `assets/logo.png` hasil export ke repository.

Logo dan nama perusahaan tidak disimpan berulang di setiap data karyawan.

## Catatan data contoh

`andi` dan `budi` disediakan sebagai data contoh tanpa gambar palsu. Halaman tetap berfungsi dan menampilkan status bahwa foto atau tanda tangan belum tersedia. Tambahkan gambar asli melalui Employee Manager sebelum dipakai secara resmi.

## GitHub Pages

Gunakan branch `main` dan folder `/(root)` pada **Settings → Pages**. Setiap slug memiliki folder `slug/index.html` agar URL dapat dibuka langsung dan di-refresh tanpa server-side routing.
