// ============================================
// IAQ LEARNING v2.2 - DATA KONFIGURASI
// ============================================
// Edit bagian di bawah ini sesuai kebutuhan.
// Setelah diubah, refresh halaman (Ctrl+F5)

window.IAQ_CONFIG = {
  // ==========================================
  // [EDIT AREA] Identitas Sekolah & Guru
  // ==========================================
  NAMA_GURU: "Mr. Ahmad Zaman Huri",
  MAPEL: "Bahasa Inggris",
  SEMESTER: "Ganjil",
  TAHUN_AJARAN: "2026/2027",
  SEKOLAH: "SD-SMP IAQ",
  SEKOLAH_LEVEL: "Islam Akhlaq Qur'an",
  SEKOLAH_TAGLINE: "Islam Akhlaq Qur'an",

  // ==========================================
  // [EDIT AREA] Google Sheet ID
  // ==========================================
  // Cara dapatkan: buka Spreadsheet → lihat URL → ambil ID di antara /d/ dan /edit
  // Contoh: https://docs.google.com/spreadsheets/d/ABC123/edit → ID = ABC123
  SHEET_ID: "1-OiqWBQIxJ37A4e2ceFvxR28xfOMbMr6s8lKvLJXZ24",

  // ==========================================
  // [EDIT AREA] Nama Tab di Google Sheet
  // ==========================================
  // Pastikan nama tab di Google Sheet SAMA PERSIS dengan di bawah ini
  SHEET_TABS: {
    SISWA: "MASTER_SISWA",
    JADWAL: "JADWAL",
    MATERI: "MATERI_LINK",
    NILAI: "NILAI",
    ABSENSI: "ABSENSI",
    BOBOT: "BOBOT_NILAI"
  },

  // ==========================================
  // [EDIT AREA] Pustaka Digital
  // ==========================================
  // Tambah/ubah sesuai kebutuhan
  PUSTAKA: [
    { nama: "Buku Pelajaran", icon: "fa-book", url: "https://drive.google.com/drive/folders/PLACEHOLDER_BUKU" },
    { nama: "Silabus & RPP", icon: "fa-file-alt", url: "https://drive.google.com/drive/folders/PLACEHOLDER_SILABUS" },
    { nama: "Video Pembelajaran", icon: "fa-video", url: "https://drive.google.com/drive/folders/PLACEHOLDER_VIDEO" },
    { nama: "Lagu & Audio", icon: "fa-music", url: "https://drive.google.com/drive/folders/PLACEHOLDER_AUDIO" },
    { nama: "Soal & Kisi-kisi", icon: "fa-clipboard-check", url: "https://drive.google.com/drive/folders/PLACEHOLDER_SOAL" },
    { nama: "Media Pembelajaran", icon: "fa-image", url: "https://drive.google.com/drive/folders/PLACEHOLDER_MEDIA" }
  ],

  // ==========================================
  // [EDIT AREA] Link Kelas Online
  // ==========================================
  // Format: { kelas: "5", url: "https://classroom.google.com/c/...", meet: "https://meet.google.com/..." }
  KELAS_ONLINE: [
    { kelas: "1B", url: "https://classroom.google.com/c/PLACEHOLDER_1B", meet: "https://meet.google.com/PLACEHOLDER_MEET_1B" },
    { kelas: "4", url: "https://classroom.google.com/c/PLACEHOLDER_4", meet: "https://meet.google.com/PLACEHOLDER_MEET_4" },
    { kelas: "5", url: "https://classroom.google.com/c/PLACEHOLDER_5", meet: "https://meet.google.com/PLACEHOLDER_MEET_5" },
    { kelas: "6", url: "https://classroom.google.com/c/PLACEHOLDER_6", meet: "https://meet.google.com/PLACEHOLDER_MEET_6" },
    { kelas: "7", url: "https://classroom.google.com/c/PLACEHOLDER_7", meet: "https://meet.google.com/PLACEHOLDER_MEET_7" },
    { kelas: "8", url: "https://classroom.google.com/c/PLACEHOLDER_8", meet: "https://meet.google.com/PLACEHOLDER_MEET_8" }
  ],

  // ==========================================
  // [EDIT AREA] Akses Cepat (Quick Links di Beranda)
  // ==========================================
  QUICK_LINKS: [
    { nama: "Classroom", icon: "fa-chalkboard", url: "https://classroom.google.com" },
    { nama: "Meet", icon: "fa-video", url: "https://meet.google.com" },
    { nama: "Drive", icon: "fa-cloud", url: "https://drive.google.com" },
    { nama: "Form", icon: "fa-file-alt", url: "https://forms.google.com" }
  ],

  // ==========================================
  // [EDIT AREA] Versi Aplikasi
  // ==========================================
  VERSI: "v2.2.0"
};

// ============================================
// JANGAN UBAH DI BAWAH INI!
// ============================================
// Untuk kompatibilitas dengan app.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = window.IAQ_CONFIG;
}

console.log('✅ IAQ_CONFIG loaded:', window.IAQ_CONFIG.NAMA_GURU);
