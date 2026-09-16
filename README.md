# ProfilesignGM

Website statik ringan untuk menampilkan foto profil karyawan, lalu bertransisi ke gambar nama dan tanda tangan. Halaman dioptimalkan untuk smartphone, tablet, laptop, dan desktop serta dapat dijalankan langsung melalui GitHub Pages tanpa backend atau build system.

## Mengganti gambar

- Ganti `assets/profile.jpg` dengan foto profil karyawan. Pertahankan nama file dan format `.jpg`.
- Ganti `assets/signature.png` dengan satu gambar yang sudah memuat nama, tanda tangan, dan elemen visual lain. Pertahankan nama file dan format `.png`.

Sebaiknya gunakan gambar yang sudah dikompresi agar halaman tetap cepat. Website akan menampilkan kedua gambar secara utuh tanpa memotong isinya.

## Struktur folder

```text
/
├── index.html
├── assets/
│   ├── profile.jpg
│   └── signature.png
└── README.md
```

## Mengaktifkan GitHub Pages

1. Buka repository **Maleosan/ProfilesignGM** di GitHub.
2. Masuk ke **Settings → Pages**.
3. Pada **Build and deployment**, pilih **Deploy from a branch**.
4. Pilih branch **main** dan folder **/(root)**, kemudian klik **Save**.
5. Tunggu proses publikasi GitHub Pages selesai.

Website akan tersedia di:

<https://maleosan.github.io/ProfilesignGM/>
