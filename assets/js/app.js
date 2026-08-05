// IAQ Learning v2.2 - Fetch from Google Sheets
(function() {
  'use strict';

  // ===== LOAD CONFIG =====
  function loadConfig() {
    // Cek localStorage dulu (untuk halaman config nanti)
    const saved = localStorage.getItem('iaq_config');
    if (saved) {
      try {
        window.IAQ_CONFIG = JSON.parse(saved);
        console.log('✅ Config loaded from localStorage');
        return;
      } catch (e) {
        console.warn('Gagal parse config dari localStorage, pakai default');
      }
    }
    
    // Kalau tidak ada, pakai default dari data.js
    if (!window.IAQ_CONFIG) {
      console.warn('⚠️ IAQ_CONFIG tidak ditemukan, gunakan fallback');
      window.IAQ_CONFIG = {
        NAMA_GURU: 'Guru',
        MAPEL: 'Pelajaran',
        SEMESTER: 'Ganjil',
        TAHUN_AJARAN: '2024/2025',
        SEKOLAH: 'IAQ Learning',
        SEKOLAH_LEVEL: 'SD - SMP',
        SEKOLAH_TAGLINE: 'Islam Akhlaq Qur\'an',
        SHEET_ID: '',
        SHEET_TABS: {
          SISWA: 'MASTER_SISWA',
          JADWAL: 'JADWAL',
          MATERI: 'MATERI_LINK',
          NILAI: 'NILAI',
          ABSENSI: 'ABSENSI',
          BOBOT: 'BOBOT_NILAI'
        },
        PUSTAKA: [],
        KELAS_ONLINE: [],
        QUICK_LINKS: [],
        VERSI: 'v2.2.0'
      };
    }
    console.log('✅ Config loaded from data.js');
  }

  // Panggil load config
  loadConfig();

  // ===== CONFIG =====
  const CFG = window.IAQ_CONFIG;
  const SHEET_ID = CFG.SHEET_ID;
  const TABS = CFG.SHEET_TABS;
  const BASE_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=`;

  // Data cache
  const DATA = {
    siswa: [], jadwal: [], materi: [], nilai: [], absensi: [], bobot: [], kelasList: []
  };

  // DOM
  const $ = id => document.getElementById(id);
  const $$ = sel => document.querySelectorAll(sel);

  // ===== CSV PARSER =====
  function parseCSV(text) {
    const lines = text.trim().split('\n');
    if (!lines.length) return [];
    const headers = parseLine(lines[0]);
    const out = [];
    for (let i = 1; i < lines.length; i++) {
      const vals = parseLine(lines[i]);
      const row = {};
      headers.forEach((h, idx) => row[h] = (vals[idx] || '').trim());
      out.push(row);
    }
    return out;
  }
  function parseLine(line) {
    const res = []; let cur = ''; let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') { inQ = !inQ; continue; }
      if (c === ',' && !inQ) { res.push(cur); cur = ''; continue; }
      cur += c;
    }
    res.push(cur);
    return res;
  }

  // ===== FETCH =====
  async function fetchSheet(name) {
    try {
      const r = await fetch(BASE_URL + encodeURIComponent(name));
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return parseCSV(await r.text());
    } catch (e) {
      console.error('Fetch', name, e);
      showToast('Gagal memuat ' + name);
      return [];
    }
  }

  async function loadAll() {
    const [siswa, jadwal, materi, nilai, absensi, bobot] = await Promise.all([
      fetchSheet(TABS.SISWA),
      fetchSheet(TABS.JADWAL),
      fetchSheet(TABS.MATERI),
      fetchSheet(TABS.NILAI),
      fetchSheet(TABS.ABSENSI),
      fetchSheet(TABS.BOBOT)
    ]);
    DATA.siswa = siswa;
    DATA.jadwal = jadwal;
    DATA.materi = materi;
    DATA.nilai = nilai;
    DATA.absensi = absensi;
    DATA.bobot = bobot;

    // Buat daftar kelas unik dari MASTER_SISWA (pakai Nama_Lengkap sebagai referensi)
    const set = new Set();
    siswa.forEach(s => { 
      if (s.Kelas) set.add(s.Kelas); 
    });
    DATA.kelasList = Array.from(set).sort((a,b) => String(a).localeCompare(String(b), undefined, {numeric:true}));

    console.log('📊 Data loaded:', {
      siswa: DATA.siswa.length,
      jadwal: DATA.jadwal.length,
      materi: DATA.materi.length,
      nilai: DATA.nilai.length,
      absensi: DATA.absensi.length,
      bobot: DATA.bobot.length,
      kelas: DATA.kelasList
    });

    renderAll();
  }

  // ===== RENDER ALL =====
  function renderAll() {
    renderBeranda();
    renderMateri();
    renderAbsensi();
    renderNilai();
    renderBobot();
    renderJadwal();
    renderKelas();
    renderPustaka();
    renderTentang();
    buildFilters();
  }

  // ============================================================
  // 1. BERANDA
  // ============================================================
  function renderBeranda() {
    const now = new Date();
    const days = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
    const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
    $('currentDate').textContent = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
    $('currentDay').textContent = days[now.getDay()];

    // Greeting - Tampilkan NAMA LENGKAP
    const guru = CFG.NAMA_GURU || 'Guru';
    $('welcomeGreeting').textContent = `Assalamu'alaikum, ${guru}!`;
    $('welcomeSub').textContent = `Selamat ${days[now.getDay()]}, siap mengajar ${CFG.MAPEL}?`;

    // Stats - dari MASTER_SISWA
    $('statSiswa').textContent = DATA.siswa.length;
    $('statMateri').textContent = DATA.materi.length;

    // Jadwal hari ini
    const hariIni = days[now.getDay()];
    const jadwalHariIni = DATA.jadwal
      .filter(j => j.Hari === hariIni)
      .sort((a,b) => a.Jam_Mulai.localeCompare(b.Jam_Mulai));
    $('statKelas').textContent = jadwalHariIni.length;

    const jh = $('jadwalHariIni');
    if (!jadwalHariIni.length) {
      jh.innerHTML = `
        <div class="no-class">
          <i class="fas fa-coffee"></i>
          <p><strong>Hari ini tidak ada kelas</strong></p>
          <p style="font-size:.78rem;margin-top:4px">Nikmati waktu istirahat Anda</p>
        </div>`;
    } else {
      jh.innerHTML = jadwalHariIni.map(j => `
        <div class="schedule-item">
          <span class="time">${j.Jam_Mulai}</span>
          <span class="class">Kelas ${j.Kelas} - ${CFG.MAPEL}</span>
        </div>
      `).join('');
    }

    // Siswa perlu perhatian (nilai di bawah 75)
    const perlu = DATA.nilai.filter(n => {
      const akhir = parseFloat(n.Nilai_Akhir);
      return !isNaN(akhir) && akhir < 75;
    }).length;
    $('statPerlu').textContent = perlu;

    // Quick Links
    renderQuickLinks();
  }

  // ============================================================
  // 2. QUICK LINKS
  // ============================================================
  function renderQuickLinks() {
    const grid = $('quickGrid');
    const links = CFG.QUICK_LINKS || [
      { nama: 'Classroom', icon: 'fa-chalkboard', url: 'https://classroom.google.com' },
      { nama: 'Meet', icon: 'fa-video', url: 'https://meet.google.com' },
      { nama: 'Drive', icon: 'fa-cloud', url: 'https://drive.google.com' },
      { nama: 'Form', icon: 'fa-file-alt', url: 'https://forms.google.com' }
    ];
    
    grid.innerHTML = links.map(link => `
      <a href="${link.url}" target="_blank" class="quick-item">
        <i class="fas ${link.icon}"></i>
        <span>${link.nama}</span>
      </a>
    `).join('');
  }

  // ============================================================
  // 3. MATERI
  // ============================================================
  function renderMateri(filterKelas) {
    const grid = $('materiGrid');
    let data = DATA.materi;
    if (filterKelas && filterKelas !== 'all') data = data.filter(m => m.Kelas === filterKelas);

    if (!data.length) {
      grid.innerHTML = '<p class="empty-state">Belum ada materi</p>';
      return;
    }

    const covers = ['','blue','orange','purple','teal','rose'];
    const linksMap = [
      {key:'PPT_URL', icon:'fa-file-powerpoint', label:'Materi'},
      {key:'Worksheet_URL', icon:'fa-file-word', label:'Worksheet'},
      {key:'Kuis_URL', icon:'fa-clipboard-check', label:'Kuis'},
      {key:'Classroom_URL', icon:'fa-chalkboard', label:'Classroom'}
    ];

    grid.innerHTML = data.map((m, i) => {
      const cover = covers[i % covers.length];
      let links = '';
      linksMap.forEach(lm => {
        if (m[lm.key] && m[lm.key].startsWith('http')) {
          links += `<a href="${m[lm.key]}" target="_blank" class="btn btn-outline btn-sm"><i class="fas ${lm.icon}"></i> ${lm.label}</a>`;
        }
      });
      return `
        <div class="materi-card">
          <div class="materi-cover ${cover}"><i class="fas fa-book-open"></i><span class="materi-badge">Kelas ${m.Kelas}</span></div>
          <div class="materi-body">
            <h4>${m.Topik}</h4>
            <p>Materi ${CFG.MAPEL} untuk kelas ${m.Kelas}</p>
            <div class="materi-links">${links}</div>
          </div>
        </div>`;
    }).join('');
  }

  // ============================================================
  // 4. ABSENSI - PAKAI HEADER SHEET: ID_Siswa, Nama, Kelas, Status, Keterangan
  // ============================================================
  function renderAbsensi(tanggalStr, filterKelas) {
    const dateLabel = $('absensiDateLabel');
    dateLabel.textContent = tanggalStr ? 'Tanggal: ' + tanggalStr : 'Pilih tanggal';

    let data = DATA.absensi;
    if (tanggalStr) data = data.filter(a => a.Tanggal === tanggalStr);
    if (filterKelas && filterKelas !== 'all') data = data.filter(a => a.Kelas === filterKelas);

    // Urutkan berdasarkan ID_Siswa
    data.sort((a, b) => (a.ID_Siswa || '').localeCompare(b.ID_Siswa || ''));

    const counts = {Hadir:0,Sakit:0,Izin:0,Alpha:0};
    data.forEach(a => { 
      const status = a.Status || '';
      if (counts[status] !== undefined) counts[status]++; 
    });
    $('absenHadir').textContent = counts.Hadir;
    $('absenSakit').textContent = counts.Sakit;
    $('absenIzin').textContent = counts.Izin;
    $('absenAlpha').textContent = counts.Alpha;

    const tb = $('absensiTbody');
    if (!data.length) {
      tb.innerHTML = `<tr><td colspan="6" class="text-center">Belum ada data absensi${tanggalStr ? ' tanggal ' + tanggalStr : ''}</td></tr>`;
      return;
    }
    tb.innerHTML = data.map((a, i) => `
      <tr>
        <td>${i+1}</td>
        <td><strong>${a.ID_Siswa || '-'}</strong></td>
        <td>${a.Nama || '-'}</td>
        <td>${a.Kelas || '-'}</td>
        <td><span class="tag tag-${(a.Status || '').toLowerCase()}">${a.Status || '-'}</span></td>
        <td>${a.Keterangan || '-'}</td>
      </tr>
    `).join('');
  }

  // ============================================================
  // 5. NILAI SISWA - PAKAI HEADER SHEET: ID_Siswa, Nama, Kelas, UH, PTS, PAS, Listening, Speaking, Reading, Writing, Nilai_Akhir, Predikat
  // ============================================================
  function renderNilai(filterKelas) {
    let data = DATA.nilai;
    if (filterKelas && filterKelas !== 'all') data = data.filter(n => n.Kelas === filterKelas);

    // Urutkan berdasarkan ID_Siswa
    data.sort((a, b) => (a.ID_Siswa || '').localeCompare(b.ID_Siswa || ''));

    const tb = $('nilaiTbody');
    if (!data.length) {
      tb.innerHTML = '<tr><td colspan="13" class="text-center">Belum ada data nilai</td></tr>';
      return;
    }
    tb.innerHTML = data.map((n, i) => `
      <tr>
        <td>${i+1}</td>
        <td><strong>${n.ID_Siswa || '-'}</strong></td>
        <td>${n.Nama || '-'}</td>
        <td>${n.Kelas || '-'}</td>
        <td>${n.UH || '-'}</td>
        <td>${n.PTS || '-'}</td>
        <td>${n.PAS || '-'}</td>
        <td>${n.Listening || '-'}</td>
        <td>${n.Speaking || '-'}</td>
        <td>${n.Reading || '-'}</td>
        <td>${n.Writing || '-'}</td>
        <td><strong>${n.Nilai_Akhir || '-'}</strong></td>
        <td><span class="tag tag-${(n.Predikat || '').toLowerCase()}">${n.Predikat || '-'}</span></td>
      </tr>
    `).join('');
  }

  // ============================================================
  // 6. BOBOT / REKAP KELAS - PAKAI HEADER SHEET: Kelas, UH, PTS, PAS, Listening, Speaking, Reading, Writing, Keterangan
  // ============================================================
  function renderBobot() {
    const bb = $('bobotTbody');
    if (!DATA.bobot.length) {
      bb.innerHTML = '<tr><td colspan="9" class="text-center">Belum ada data rekap</td></tr>';
      return;
    }
    bb.innerHTML = DATA.bobot.map(b => `
      <tr>
        <td><strong>${b.Kelas || '-'}</strong></td>
        <td>${b.UH || '-'}</td>
        <td>${b.PTS || '-'}</td>
        <td>${b.PAS || '-'}</td>
        <td>${b.Listening || '-'}</td>
        <td>${b.Speaking || '-'}</td>
        <td>${b.Reading || '-'}</td>
        <td>${b.Writing || '-'}</td>
        <td>${b.Keterangan || '-'}</td>
      </tr>
    `).join('');
  }

  // ============================================================
  // 7. JADWAL
  // ============================================================
  function renderJadwal() {
    const days = ['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu'];
    const grid = $('jadwalGrid');
    if (!DATA.jadwal.length) {
      grid.innerHTML = '<p class="empty-state">Belum ada jadwal</p>';
      return;
    }
    const byDay = {};
    days.forEach(d => byDay[d] = []);
    DATA.jadwal.forEach(j => { if (byDay[j.Hari]) byDay[j.Hari].push(j); });

    grid.innerHTML = days.filter(d => byDay[d].length).map(d => {
      const slots = byDay[d].sort((a,b) => a.Jam_Mulai.localeCompare(b.Jam_Mulai)).map(j => `
        <div class="class-slot">
          <span class="time">${j.Jam_Mulai} - ${j.Jam_Selesai}</span>
          <span class="class-name">Kelas ${j.Kelas} - ${CFG.MAPEL}</span>
        </div>
      `).join('');
      return `<div class="day-column"><h4>${d}</h4>${slots}</div>`;
    }).join('');
  }

  // ============================================================
  // 8. KELAS ONLINE
  // ============================================================
  function renderKelas() {
    const grid = $('classroomGrid');
    const kelasOnline = CFG.KELAS_ONLINE || [];
    if (!kelasOnline.length) {
      grid.innerHTML = '<p class="empty-state">Belum ada link classroom</p>';
      return;
    }

    const grads = [
      'linear-gradient(135deg,#0d2818,#1a4d2e)',
      'linear-gradient(135deg,#1a4d2e,#2d6a4f)',
      'linear-gradient(135deg,#2d6a4f,#40916c)',
      'linear-gradient(135deg,#d4af37,#c9a227)',
      'linear-gradient(135deg,#1e3a5f,#2563eb)',
      'linear-gradient(135deg,#7c2d12,#ea580c)'
    ];

    grid.innerHTML = kelasOnline.map((k, i) => {
      const siswaCount = DATA.siswa.filter(s => s.Kelas === k.kelas).length;
      const grad = grads[i % grads.length];
      return `
        <div class="classroom-card">
          <div class="classroom-header" style="background:${grad}">
            <h4>Kelas ${k.kelas} - ${CFG.MAPEL}</h4>
            <p>${siswaCount} Siswa</p>
          </div>
          <div class="classroom-body">
            <div class="classroom-actions">
              <a href="${k.url}" target="_blank" class="btn btn-primary btn-sm"><i class="fas fa-door-open"></i> Classroom</a>
              <a href="${k.meet}" target="_blank" class="btn btn-gold btn-sm"><i class="fas fa-video"></i> Meet</a>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // ============================================================
  // 9. PUSTAKA
  // ============================================================
  function renderPustaka() {
    const grid = $('pustakaGrid');
    const pustaka = CFG.PUSTAKA || [];
    if (!pustaka.length) {
      grid.innerHTML = '<p class="empty-state">Belum ada pustaka</p>';
      return;
    }
    grid.innerHTML = pustaka.map(p => `
      <a href="${p.url}" target="_blank" class="pustaka-card">
        <div class="pustaka-icon"><i class="fas ${p.icon}"></i></div>
        <h4>${p.nama}</h4>
        <p>Klik untuk membuka</p>
      </a>
    `).join('');
  }

  // ============================================================
  // 10. TENTANG / PROFIL
  // ============================================================
  // --- TENTANG / PROFIL ---
function renderTentang() {
  console.log('🔄 renderTentang() dipanggil');
  console.log('CFG:', CFG);
  
  try {
    const sekolah = document.getElementById('aboutSekolah');
    const level = document.getElementById('aboutLevel');
    const version = document.getElementById('aboutVersion');
    const guru = document.getElementById('aboutGuru');
    const mapel = document.getElementById('aboutMapel');
    const semester = document.getElementById('aboutSemester');
    const tahun = document.getElementById('aboutTahun');

    console.log('Element aboutSekolah:', sekolah);
    console.log('CFG.SEKOLAH:', CFG.SEKOLAH);

    if (sekolah) sekolah.textContent = CFG.SEKOLAH || 'IAQ Learning';
    if (level) level.textContent = CFG.SEKOLAH_LEVEL || 'SD - SMP';
    if (version) version.textContent = CFG.VERSI || 'v2.2.0';
    if (guru) guru.textContent = CFG.NAMA_GURU || '-';
    if (mapel) mapel.textContent = CFG.MAPEL || '-';
    if (semester) semester.textContent = (CFG.SEMESTER || '') + ' ' + (CFG.TAHUN_AJARAN || '') || '-';
    if (tahun) tahun.textContent = CFG.TAHUN_AJARAN || '-';

    console.log('✅ Tentang selesai diisi');
  } catch (e) {
    console.error('❌ Error di renderTentang:', e);
  }
}

  // ============================================================
  // 11. FILTERS
  // ============================================================
  function buildFilters() {
    // Materi filter
    const mf = $('materiFilter');
    const allBtn = document.createElement('button');
    allBtn.className = 'filter-btn active';
    allBtn.dataset.kelas = 'all';
    allBtn.textContent = 'Semua';
    allBtn.onclick = () => {
      $$('#materiFilter .filter-btn').forEach(b => b.classList.remove('active'));
      allBtn.classList.add('active');
      renderMateri('all');
    };
    mf.innerHTML = '';
    mf.appendChild(allBtn);
    DATA.kelasList.forEach(k => {
      const btn = document.createElement('button');
      btn.className = 'filter-btn';
      btn.dataset.kelas = k;
      btn.textContent = 'Kelas ' + k;
      btn.onclick = () => {
        $$('#materiFilter .filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderMateri(k);
      };
      mf.appendChild(btn);
    });

    // Absensi kelas select
    const as = $('absensiKelasSelect');
    as.innerHTML = '<option value="all">Semua Kelas</option>';
    DATA.kelasList.forEach(k => {
      const opt = document.createElement('option');
      opt.value = k;
      opt.textContent = 'Kelas ' + k;
      as.appendChild(opt);
    });

    // Nilai kelas select
    const ns = $('nilaiKelasSelect');
    ns.innerHTML = '<option value="all">Semua Kelas</option>';
    DATA.kelasList.forEach(k => {
      const opt = document.createElement('option');
      opt.value = k;
      opt.textContent = 'Kelas ' + k;
      ns.appendChild(opt);
    });
  }

  // ============================================================
  // 12. NAVIGATION
  // ============================================================
  function openSidebar() {
    $('sidebar').classList.add('open');
    $('overlay').classList.add('show');
    document.body.style.overflow = 'hidden';
  }
  function closeSidebar() {
    $('sidebar').classList.remove('open');
    $('overlay').classList.remove('show');
    document.body.style.overflow = '';
  }
  function navigateTo(pageId) {
    $$('.nav-item').forEach(item => item.classList.remove('active'));
    $$('.nav-subitem').forEach(item => item.classList.remove('active'));
    $$('.page').forEach(page => page.classList.remove('active'));

    const navItem = $(`nav-item-${pageId}`);
    if (navItem) navItem.classList.add('active');

    const page = $(pageId);
    if (page) page.classList.add('active');

    // Close sidebar di mobile
    if (window.innerWidth < 768) {
      closeSidebar();
    }
    window.scrollTo({top:0,behavior:'smooth'});
  }

  // Submenu toggle
  function toggleSubmenu(id) {
    const el = $(id);
    if (el) el.classList.toggle('open');
  }

  // ============================================================
  // 13. BOTTOM NAVIGATION
  // ============================================================
  function initBottomNav() {
    const navItems = document.querySelectorAll('.bottom-nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', function(e) {
        e.preventDefault();
        const page = this.dataset.page;
        if (page) {
          navItems.forEach(n => n.classList.remove('active'));
          this.classList.add('active');
          navigateTo(page);
        }
      });
    });
  }

  // ============================================================
  // 14. TOAST
  // ============================================================
  window.showToast = function(msg) {
    const toast = $('toast');
    const toastMsg = $('toastMsg');
    if (!toast || !toastMsg) return;
    toastMsg.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  };

  // ============================================================
  // 15. DATE PICKER
  // ============================================================
  function initDatePicker() {
    const dp = $('absensiDate');
    if (!dp) return;

    const today = new Date();
    const dd = String(today.getDate()).padStart(2,'0');
    const mm = String(today.getMonth()+1).padStart(2,'0');
    const yyyy = today.getFullYear();
    dp.value = `${yyyy}-${mm}-${dd}`;

    dp.addEventListener('change', function() {
      const parts = this.value.split('-');
      const tanggalStr = `${parts[2]}/${parts[1]}/${parts[0]}`;
      const kelas = $('absensiKelasSelect').value;
      renderAbsensi(tanggalStr, kelas);
    });

    const as = $('absensiKelasSelect');
    if (as) {
      as.addEventListener('change', function() {
        const dpVal = dp.value;
        const parts = dpVal.split('-');
        const tanggalStr = `${parts[2]}/${parts[1]}/${parts[0]}`;
        renderAbsensi(tanggalStr, this.value);
      });
    }

    const ns = $('nilaiKelasSelect');
    if (ns) {
      ns.addEventListener('change', function() {
        renderNilai(this.value);
      });
    }

    const parts = dp.value.split('-');
    const tanggalStr = `${parts[2]}/${parts[1]}/${parts[0]}`;
    renderAbsensi(tanggalStr, 'all');
  }

  // ============================================================
  // 16. INSTALL PROMPT
  // ============================================================
  let deferredPrompt;
  function initInstallPrompt() {
    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault();
      deferredPrompt = e;
      const prompt = $('installPrompt');
      if (prompt) prompt.classList.add('show');
    });

    const installBtn = $('installBtn');
    if (installBtn) {
      installBtn.addEventListener('click', async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          $('installPrompt').classList.remove('show');
        }
        deferredPrompt = null;
      });
    }

    const closePrompt = $('closePrompt');
    if (closePrompt) {
      closePrompt.addEventListener('click', () => {
        $('installPrompt').classList.remove('show');
      });
    }
  }

  // ============================================================
  // 17. SERVICE WORKER
  // ============================================================
  function initServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }
  }

  // ============================================================
  // 18. DARK MODE
  // ============================================================
  function initDarkMode() {
    if (localStorage.getItem('darkMode') === 'true') {
      document.documentElement.classList.add('dark');
    }
  }

  // ============================================================
  // 19. INIT
  // ============================================================
  function init() {
    initDarkMode();
    initServiceWorker();
    initInstallPrompt();
    initBottomNav();

    // Splash
    setTimeout(() => {
      const splash = $('splash');
      const app = $('app');
      if (splash) splash.classList.add('hidden');
      if (app) app.classList.remove('hidden');
    }, 2000);

    // Header brand click → beranda
    const headerBrand = $('headerBrand');
    if (headerBrand) headerBrand.addEventListener('click', () => navigateTo('beranda'));

    // Profile click → tentang
    const profileBtn = $('profileBtn');
    if (profileBtn) profileBtn.addEventListener('click', () => navigateTo('tentang'));

    // Menu
    const menuBtn = $('menuBtn');
    if (menuBtn) menuBtn.addEventListener('click', openSidebar);
    
    const overlay = $('overlay');
    if (overlay) overlay.addEventListener('click', closeSidebar);

    // Nav items
    $$('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        const page = item.dataset.page;
        if (page) navigateTo(page);
      });
    });
    $$('.nav-subitem').forEach(item => {
      item.addEventListener('click', () => {
        const page = item.dataset.page;
        if (page) navigateTo(page);
      });
    });

    // Load data
    loadAll().then(() => {
      initDatePicker();
    });
  }

  // Export untuk submenu toggle
  window.toggleSubmenu = toggleSubmenu;

  // Run
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
