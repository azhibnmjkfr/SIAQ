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
  SHEET_ID: "1-OiqWBQIxJ37A4e2ceFvxR28xfOMbMr6s8lKvLJXZ24",

  // ==========================================
  // [EDIT AREA] Nama Tab di Google Sheet
  // ==========================================
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
  PUSTAKA: [
    { nama: "Buku Pelajaran", icon: "fa-book", url: "coming-soon.html" },
    { nama: "Silabus & RPP", icon: "fa-file-alt", url: "coming-soon.html" },
    { nama: "Video Pembelajaran", icon: "fa-video", url: "coming-soon.html" },
    { nama: "Lagu & Audio", icon: "fa-music", url: "coming-soon.html" },
    { nama: "Soal & Kisi-kisi", icon: "fa-clipboard-check", url: "coming-soon.html" },
    { nama: "Media Pembelajaran", icon: "fa-image", url: "coming-soon.html" }
  ],

  // ==========================================
  // [EDIT AREA] Link Kelas Online
  // ==========================================
  KELAS_ONLINE: [
    { 
      kelas: "4", 
      url: "https://classroom.google.com/c/ODcxMzc1ODE0NzY3?cjc=6wpayed7", 
      meet: "coming-soon.html" 
    },
    { 
      kelas: "5", 
      url: "https://classroom.google.com/c/ODcwODcwMTg1NDcx?cjc=uv2d6nn4", 
      meet: "coming-soon.html" 
    },
    { 
      kelas: "6", 
      url: "https://classroom.google.com/c/ODcwODY5MzcyMTU4?cjc=ptxln3x6", 
      meet: "coming-soon.html" 
    },
    { 
      kelas: "7", 
      url: "https://classroom.google.com/c/ODcwODY5MDcwMTU0?cjc=2skohewr", 
      meet: "coming-soon.html" 
    },
    { 
      kelas: "8", 
      url: "https://classroom.google.com/c/ODU1NTk5NDcyODA3?cjc=bg6n5gkn", 
      meet: "coming-soon.html" 
    }
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
if (typeof module !== 'undefined' && module.exports) {
  module.exports = window.IAQ_CONFIG;
}

console.log('✅ IAQ_CONFIG loaded:', window.IAQ_CONFIG.NAMA_GURU);
