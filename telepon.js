(function() {
  if (window.StoolsTelepon) return;

  const ICE_SERVER = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ];
  const ICE_TAMBAHAN = [];
  const BATAS_DERING = 45000;
  const BATAS_KONEKSI = 25000;
  const BATAS_PUTUS = 10000;
  const JEDA_DETAK = 20000;

  let tdb = null;
  let uid = '';
  let telp = null;
  let offsetWaktu = 0;
  let dering = null;
  let tandaAkhir = 0;
  let diperiksa = '';
  let judulAsli = '';
  const cacheUser = {};

  const CSS = '' +
    '.stp-overlay{position:fixed;inset:0;z-index:2147483000;display:none;flex-direction:column;align-items:center;justify-content:space-between;padding:calc(70px + env(safe-area-inset-top,0px)) 24px calc(56px + env(safe-area-inset-bottom,0px));background:#FFFFFF;color:#0F172A;text-align:center;font-family:Inter,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}' +
    '.stp-overlay.gelap{background:#111827;color:#F1F5F9}' +
    '.stp-tengah{display:flex;flex-direction:column;align-items:center;gap:12px}' +
    '.stp-avatar{width:120px;height:120px;border-radius:50%;background:#EFF6FF;color:#2563EB;display:flex;align-items:center;justify-content:center;font-size:48px;font-weight:800;overflow:hidden;margin-bottom:18px}' +
    '.gelap .stp-avatar{background:#1D2B4A;color:#60A5FA}' +
    '.stp-avatar img{width:100%;height:100%;object-fit:cover}' +
    '.stp-nama{font-size:26px;font-weight:800;max-width:86vw;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}' +
    '.stp-status{font-size:15px;color:#64748B;min-height:22px;font-variant-numeric:tabular-nums}' +
    '.gelap .stp-status{color:#94A3B8}' +
    '.stp-baris{display:none;align-items:flex-start;justify-content:center;gap:44px}' +
    '.stp-tombol{display:flex;flex-direction:column;align-items:center;gap:8px;font-size:12px;color:#64748B}' +
    '.gelap .stp-tombol{color:#94A3B8}' +
    '.stp-tombol button{width:68px;height:68px;border-radius:50%;border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#0F172A;background:#F1F5F9;transition:transform .15s}' +
    '.gelap .stp-tombol button{color:#F1F5F9;background:#1E293B}' +
    '.stp-tombol button:active{transform:scale(.94)}' +
    '.stp-tombol button svg{width:28px;height:28px}' +
    '.stp-tombol .merah,.gelap .stp-tombol .merah{background:#DC2626;color:#fff}' +
    '.stp-tombol .hijau,.gelap .stp-tombol .hijau{background:#16A34A;color:#fff}' +
    '.stp-tombol.nyala button,.gelap .stp-tombol.nyala button{background:#2563EB;color:#fff}' +
    '.stp-pesan{position:fixed;inset:0;z-index:2147483100;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.6);padding:24px;font-family:Inter,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}' +
    '.stp-kartu{width:min(92vw,360px);background:#fff;color:#0F172A;border-radius:24px;padding:26px 22px 20px;text-align:center}' +
    '.stp-kartu.gelap{background:#111827;color:#F1F5F9}' +
    '.stp-kartu h3{font-size:18px;font-weight:800;margin:0 0 8px}' +
    '.stp-kartu p{font-size:14px;line-height:1.6;color:#64748B;margin:0 0 18px}' +
    '.stp-kartu.gelap p{color:#94A3B8}' +
    '.stp-kartu button{width:100%;border:none;border-radius:14px;padding:13px;background:#2563EB;color:#fff;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit}';

  const IKON_TELEPON = '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>';
  const IKON_MIK = '<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>';

  const HTML = '' +
    '<div class="stp-overlay" id="stpOverlay">' +
    '<div class="stp-tengah"><div class="stp-avatar" id="stpAvatar"></div><div class="stp-nama" id="stpNama">Pengguna</div><div class="stp-status" id="stpStatus"></div></div>' +
    '<div class="stp-baris" id="stpMasuk">' +
    '<div class="stp-tombol"><button class="merah" id="stpTolak" aria-label="Tolak"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transform:rotate(135deg)">' + IKON_TELEPON + '</svg></button><span>Tolak</span></div>' +
    '<div class="stp-tombol"><button class="hijau" id="stpAngkat" aria-label="Angkat"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + IKON_TELEPON + '</svg></button><span>Angkat</span></div>' +
    '</div>' +
    '<div class="stp-baris" id="stpAktif">' +
    '<div class="stp-tombol" id="stpBisu"><button id="stpBisuTombol" aria-label="Bisukan mikrofon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + IKON_MIK + '</svg></button><span id="stpBisuTeks">Bisukan</span></div>' +
    '<div class="stp-tombol"><button class="merah" id="stpAkhiri" aria-label="Akhiri"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="transform:rotate(135deg)">' + IKON_TELEPON + '</svg></button><span>Akhiri</span></div>' +
    '</div>' +
    '<audio id="stpAudio" autoplay playsinline></audio>' +
    '</div>' +
    '<div class="stp-pesan" id="stpPesan"><div class="stp-kartu" id="stpKartu"><h3 id="stpPesanJudul"></h3><p id="stpPesanIsi"></p><button id="stpPesanTutup">Mengerti</button></div></div>';

  function $t(id) {
    return document.getElementById(id);
  }

  function esc(teks) {
    return String(teks == null ? '' : teks)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function modeGelap() {
    let ls = '';
    try { ls = localStorage.getItem('theme'); } catch (e) {}
    return document.body.classList.contains('dark') || ls === 'dark';
  }

  function sisipkanUI() {
    if ($t('stpOverlay')) return;
    const gaya = document.createElement('style');
    gaya.textContent = CSS;
    document.head.appendChild(gaya);
    const wadah = document.createElement('div');
    wadah.innerHTML = HTML;
    while (wadah.firstChild) document.body.appendChild(wadah.firstChild);
    $t('stpTolak').addEventListener('click', tolak);
    $t('stpAngkat').addEventListener('click', angkat);
    $t('stpAkhiri').addEventListener('click', tutup);
    $t('stpBisuTombol').addEventListener('click', togelBisu);
    $t('stpPesanTutup').addEventListener('click', function() { $t('stpPesan').style.display = 'none'; });
  }

  function pesan(judul, isi) {
    sisipkanUI();
    $t('stpKartu').classList.toggle('gelap', modeGelap());
    $t('stpPesanJudul').innerText = judul;
    $t('stpPesanIsi').innerText = isi;
    $t('stpPesan').style.display = 'flex';
  }

  function ambilUser(id, callback) {
    if (cacheUser[id]) { callback(cacheUser[id]); return; }
    tdb.ref('users/' + id).once('value').then(function(snap) {
      cacheUser[id] = snap.val() || {};
      callback(cacheUser[id]);
    }).catch(function() { callback({}); });
  }

  function namaDari(data) {
    return (data && data.profile && data.profile.nama) || 'Pengguna';
  }

  function waktuServer() {
    return Date.now() + offsetWaktu;
  }

  function pasangPresensi() {
    const online = tdb.ref('users/' + uid + '/online');
    const terakhir = tdb.ref('users/' + uid + '/lastSeen');
    const tandai = function() {
      online.set(true).catch(function() {});
      terakhir.set(Date.now()).catch(function() {});
    };
    let terhubung = false;
    tdb.ref('.info/connected').on('value', function(snap) {
      if (snap.val() !== true) { terhubung = false; return; }
      if (terhubung) return;
      terhubung = true;
      try {
        online.onDisconnect().set(false);
        terakhir.onDisconnect().set(firebase.database.ServerValue.TIMESTAMP);
      } catch (e) {}
      tandai();
    });
    setInterval(tandai, JEDA_DETAK);
    document.addEventListener('visibilitychange', function() {
      if (!document.hidden) tandai();
    });
  }

  function pasangPanggilanMasuk() {
    try {
      tdb.ref('.info/serverTimeOffset').on('value', function(snap) {
        offsetWaktu = Number(snap.val()) || 0;
      });
    } catch (e) {}
    tdb.ref('panggilan/' + uid).on('value', function(snap) {
      tanganiSlotMasuk(snap.val());
    }, function() {});
    window.addEventListener('pagehide', function() {
      if (!telp) return;
      try { tdb.ref('panggilan/' + telp.slot).remove(); } catch (e) {}
    });
    window.addEventListener('beforeunload', function(e) {
      if (telp && telp.status === 'tersambung') {
        e.preventDefault();
        e.returnValue = '';
      }
    });
  }

  function ambilMikrofon() {
    return navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      video: false
    });
  }

  function hentikanStream(stream) {
    try { stream.getTracks().forEach(function(t) { t.stop(); }); } catch (e) {}
  }

  function galatMikrofon(err) {
    const nama = err && err.name;
    return nama === 'NotAllowedError' || nama === 'PermissionDeniedError' || nama === 'NotFoundError' || nama === 'DevicesNotFoundError' || nama === 'SecurityError';
  }

  function pesanGalat(err) {
    const nama = err && err.name;
    if (nama === 'NotAllowedError' || nama === 'PermissionDeniedError' || nama === 'SecurityError') return 'Izin mikrofon ditolak. Izinkan mikrofon di pengaturan peramban lalu coba lagi.';
    if (nama === 'NotFoundError' || nama === 'DevicesNotFoundError') return 'Mikrofon tidak ditemukan di perangkat ini.';
    return 'Panggilan gagal: ' + ((err && err.message) || 'terjadi kesalahan');
  }

  function adaMikrofon() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return Promise.resolve(true);
    return navigator.mediaDevices.enumerateDevices().then(function(daftar) {
      return daftar.some(function(d) { return d.kind === 'audioinput'; });
    }).catch(function() { return true; });
  }

  function tampilkan(lawan, mode, teks) {
    sisipkanUI();
    tandaAkhir++;
    const overlay = $t('stpOverlay');
    overlay.classList.toggle('gelap', modeGelap());
    overlay.style.display = 'flex';
    document.documentElement.style.overflow = 'hidden';
    $t('stpNama').innerText = 'Memuat...';
    const av = $t('stpAvatar');
    av.innerHTML = '';
    ambilUser(lawan, function(user) {
      if (!telp || telp.lawan !== lawan) return;
      const profile = user.profile || {};
      const nama = profile.nama || 'Pengguna';
      $t('stpNama').innerText = nama;
      if (profile.foto) av.innerHTML = '<img src="' + esc(profile.foto) + '">';
      else av.innerText = nama.charAt(0).toUpperCase();
    });
    atur(mode, teks);
  }

  function atur(mode, teks) {
    $t('stpMasuk').style.display = mode === 'masuk' ? 'flex' : 'none';
    $t('stpAktif').style.display = mode === 'masuk' || mode === 'akhir' ? 'none' : 'flex';
    $t('stpBisu').style.display = mode === 'aktif' ? 'flex' : 'none';
    $t('stpBisu').classList.remove('nyala');
    $t('stpBisuTeks').innerText = 'Bisukan';
    if (teks != null) $t('stpStatus').innerText = teks;
  }

  function setStatus(teks) {
    $t('stpStatus').innerText = teks;
  }

  function tampilAkhir(teks) {
    atur('akhir', teks);
    const tanda = ++tandaAkhir;
    setTimeout(function() {
      if (tanda !== tandaAkhir) return;
      $t('stpOverlay').style.display = 'none';
      document.documentElement.style.overflow = '';
    }, 1800);
  }

  function buatSesi(peran, lawan, slot) {
    return {
      peran: peran, lawan: lawan, slot: slot, status: '', pc: null, stream: null, refs: [], data: null,
      antreanKeluar: [], antreanMasuk: [], dilihat: {}, remoteSiap: false, slotDibuat: false, jawabanDipakai: false,
      mulai: 0, timer: null, batas: null, batasKoneksi: null, putus: null, bisu: false
    };
  }

  function mulai(target) {
    if (!uid || !tdb) { pesan('Telepon', 'Kamu harus login terlebih dahulu.'); return; }
    if (telp) { pesan('Telepon', 'Kamu sedang dalam panggilan.'); return; }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !window.RTCPeerConnection) {
      pesan('Tidak Didukung', 'Peramban ini belum mendukung telepon suara.');
      return;
    }
    const sesi = buatSesi('pemanggil', target, target);
    sesi.status = 'meminta';
    telp = sesi;
    tampilkan(target, 'keluar', 'Meminta izin mikrofon...');
    ambilMikrofon().then(function(stream) {
      if (telp !== sesi) { hentikanStream(stream); return null; }
      sesi.stream = stream;
      return bangunPemanggil(sesi);
    }).catch(function(err) {
      if (telp !== sesi) return;
      akhiri(sesi, 'Panggilan gagal', { hapus: sesi.slotDibuat });
      if (err && /permission_denied/i.test(String(err.code || '') + ' ' + String(err.message || ''))) {
        pesan('Telepon', 'Temanmu sedang di telepon lain atau tidak dapat dihubungi saat ini.');
        return;
      }
      pesan('Telepon', pesanGalat(err));
    });
  }

  function buatPc(sesi) {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVER.concat(ICE_TAMBAHAN) });
    sesi.pc = pc;
    pc.ontrack = function(e) {
      const audio = $t('stpAudio');
      audio.srcObject = e.streams && e.streams[0] ? e.streams[0] : new MediaStream([e.track]);
      const p = audio.play();
      if (p && p.catch) p.catch(function() {});
    };
    pc.onicecandidate = function(e) {
      if (e.candidate) kirimIce(sesi, e.candidate);
    };
    pc.onconnectionstatechange = function() { statusKoneksi(sesi); };
    pc.oniceconnectionstatechange = function() { statusKoneksi(sesi); };
    sesi.stream.getTracks().forEach(function(t) { pc.addTrack(t, sesi.stream); });
    return pc;
  }

  function kirimIce(sesi, kandidat) {
    const data = { c: kandidat.candidate, m: kandidat.sdpMid || '0', i: kandidat.sdpMLineIndex == null ? 0 : kandidat.sdpMLineIndex };
    if (sesi.peran === 'pemanggil' && !sesi.slotDibuat) { sesi.antreanKeluar.push(data); return; }
    tulisIce(sesi, data);
  }

  function tulisIce(sesi, data) {
    const sisi = sesi.peran === 'pemanggil' ? 'pemanggil' : 'penerima';
    tdb.ref('panggilan/' + sesi.slot + '/ice/' + sisi).push().set(data).catch(function() {});
  }

  function terimaIce(sesi, snap) {
    snap.forEach(function(c) {
      if (sesi.dilihat[c.key]) return;
      sesi.dilihat[c.key] = true;
      const v = c.val() || {};
      if (!v.c) return;
      sesi.antreanMasuk.push({ candidate: v.c, sdpMid: v.m || '0', sdpMLineIndex: v.i || 0 });
    });
    keringkanIce(sesi);
  }

  function keringkanIce(sesi) {
    if (!sesi.remoteSiap || !sesi.pc) return;
    while (sesi.antreanMasuk.length) {
      sesi.pc.addIceCandidate(sesi.antreanMasuk.shift()).catch(function() {});
    }
  }

  function bangunPemanggil(sesi) {
    const pc = buatPc(sesi);
    let tawaran = null;
    return pc.createOffer().then(function(o) {
      tawaran = o;
      return pc.setLocalDescription(o);
    }).then(function() {
      if (telp !== sesi) return null;
      return tdb.ref('panggilan/' + sesi.lawan).set({
        dari: uid,
        dibuat: firebase.database.ServerValue.TIMESTAMP,
        status: 'memanggil',
        offer: { type: tawaran.type, sdp: tawaran.sdp }
      }).then(function() { return true; });
    }).then(function(ok) {
      if (!ok) return;
      if (telp !== sesi) { tdb.ref('panggilan/' + sesi.lawan).remove().catch(function() {}); return; }
      sesi.slotDibuat = true;
      sesi.status = 'memanggil';
      setStatus('Memanggil...');
      sesi.antreanKeluar.splice(0).forEach(function(d) { tulisIce(sesi, d); });
      const ref = tdb.ref('panggilan/' + sesi.lawan);
      const refIce = tdb.ref('panggilan/' + sesi.lawan + '/ice/penerima');
      sesi.refs.push(ref, refIce);
      ref.on('value', function(snap) {
        if (telp !== sesi) return;
        tanganiSlotPemanggil(sesi, snap.val());
      }, function() {});
      refIce.on('value', function(snap) {
        if (telp !== sesi) return;
        terimaIce(sesi, snap);
      }, function() {});
      sesi.batas = setTimeout(function() {
        akhiri(sesi, 'Tidak dijawab', { hapus: true });
      }, BATAS_DERING);
    });
  }

  function tanganiSlotPemanggil(sesi, v) {
    if (!v) {
      akhiri(sesi, sesi.status === 'tersambung' ? 'Panggilan berakhir' : 'Panggilan dibatalkan', { hapus: false });
      return;
    }
    if (v.status === 'ditolak') { akhiri(sesi, 'Panggilan ditolak', { hapus: true }); return; }
    if (v.status === 'sibuk') { akhiri(sesi, 'Sedang di telepon lain', { hapus: true }); return; }
    if (v.status === 'tanpamik') { akhiri(sesi, 'Teman tidak bisa menjawab (mikrofon tidak tersedia)', { hapus: true }); return; }
    if (v.status === 'selesai') { akhiri(sesi, 'Panggilan berakhir', { hapus: true }); return; }
    if (v.jawaban && !sesi.jawabanDipakai) {
      sesi.jawabanDipakai = true;
      clearTimeout(sesi.batas);
      setStatus('Menyambungkan...');
      sesi.batasKoneksi = setTimeout(function() {
        akhiri(sesi, 'Koneksi gagal. Coba lagi nanti.', { hapus: true });
      }, BATAS_KONEKSI);
      sesi.pc.setRemoteDescription({ type: 'answer', sdp: v.jawaban.sdp }).then(function() {
        sesi.remoteSiap = true;
        keringkanIce(sesi);
      }).catch(function() {
        akhiri(sesi, 'Koneksi gagal. Coba lagi nanti.', { hapus: true });
      });
    }
  }

  function tanganiSlotMasuk(v) {
    if (!v) {
      if (telp && telp.peran === 'penerima') {
        akhiri(telp, telp.status === 'tersambung' ? 'Panggilan berakhir' : 'Panggilan dibatalkan', { hapus: false });
      }
      return;
    }
    if (telp && telp.peran === 'penerima') {
      if (v.dari !== telp.lawan) return;
      if (v.status === 'selesai' || v.status === 'ditolak') akhiri(telp, 'Panggilan berakhir', { hapus: true });
      else if (v.status === 'diangkat' && telp.status === 'dering') akhiri(telp, 'Dijawab di perangkat lain', { hapus: false });
      return;
    }
    if (v.status !== 'memanggil' || !v.offer || !v.dari) return;
    if (waktuServer() - (v.dibuat || 0) > BATAS_DERING + 5000) return;
    if (telp) {
      tdb.ref('panggilan/' + uid + '/status').set('sibuk').catch(function() {});
      return;
    }
    const kunci = v.dari + '_' + v.dibuat;
    if (diperiksa === kunci) return;
    diperiksa = kunci;
    adaMikrofon().then(function(ada) {
      if (telp) return;
      if (!ada) { tolakTanpaMik(v); return; }
      const sesi = buatSesi('penerima', v.dari, uid);
      sesi.status = 'dering';
      sesi.data = v;
      telp = sesi;
      tampilkan(v.dari, 'masuk', 'Panggilan suara masuk');
      mulaiDering();
      sesi.batas = setTimeout(function() {
        akhiri(sesi, 'Panggilan terlewat', { hapus: true });
      }, BATAS_DERING + 5000);
    });
  }

  function laporTanpaMik() {
    tdb.ref('panggilan/' + uid + '/status').set('tanpamik').catch(function() {
      tdb.ref('panggilan/' + uid).remove().catch(function() {});
    });
    setTimeout(function() {
      tdb.ref('panggilan/' + uid).once('value').then(function(snap) {
        const v = snap.val();
        if (v && v.status === 'tanpamik') tdb.ref('panggilan/' + uid).remove();
      }).catch(function() {});
    }, 4000);
  }

  function tolakTanpaMik(v) {
    laporTanpaMik();
    ambilUser(v.dari, function(user) {
      pesan('Panggilan Tidak Bisa Diterima', 'Ada panggilan suara dari ' + namaDari(user) + ', tetapi perangkat ini tidak memiliki mikrofon sehingga panggilan diakhiri.');
    });
  }

  function angkat() {
    const sesi = telp;
    if (!sesi || sesi.peran !== 'penerima' || sesi.status !== 'dering') return;
    sesi.status = 'menjawab';
    berhentiDering();
    clearTimeout(sesi.batas);
    atur('keluar', 'Menyambungkan...');
    ambilMikrofon().then(function(stream) {
      if (telp !== sesi) { hentikanStream(stream); return null; }
      sesi.stream = stream;
      const pc = buatPc(sesi);
      return pc.setRemoteDescription({ type: 'offer', sdp: sesi.data.offer.sdp }).then(function() {
        sesi.remoteSiap = true;
        return pc.createAnswer();
      }).then(function(jawaban) {
        return pc.setLocalDescription(jawaban).then(function() { return jawaban; });
      }).then(function(jawaban) {
        if (telp !== sesi) return null;
        return tdb.ref('panggilan/' + uid + '/jawaban').set({ type: jawaban.type, sdp: jawaban.sdp }).then(function() { return true; });
      }).then(function(ok) {
        if (telp !== sesi || !ok) return null;
        return tdb.ref('panggilan/' + uid + '/status').set('diangkat').then(function() {
          if (telp !== sesi) return;
          const refIce = tdb.ref('panggilan/' + uid + '/ice/pemanggil');
          sesi.refs.push(refIce);
          refIce.on('value', function(snap) {
            if (telp !== sesi) return;
            terimaIce(sesi, snap);
          }, function() {});
          sesi.batasKoneksi = setTimeout(function() {
            akhiri(sesi, 'Koneksi gagal. Coba lagi nanti.', { hapus: true });
          }, BATAS_KONEKSI);
        });
      });
    }).catch(function(err) {
      if (telp !== sesi) return;
      if (galatMikrofon(err)) {
        laporTanpaMik();
        akhiri(sesi, 'Panggilan diakhiri', { hapus: false });
      } else {
        akhiri(sesi, 'Panggilan gagal', { hapus: true });
      }
      pesan('Telepon', pesanGalat(err));
    });
  }

  function tolak() {
    const sesi = telp;
    if (!sesi || sesi.peran !== 'penerima') return;
    berhentiDering();
    tdb.ref('panggilan/' + uid + '/status').set('ditolak').catch(function() {});
    akhiri(sesi, 'Panggilan ditolak', { hapus: false });
    setTimeout(function() {
      tdb.ref('panggilan/' + uid).once('value').then(function(snap) {
        const v = snap.val();
        if (v && v.status === 'ditolak') tdb.ref('panggilan/' + uid).remove();
      }).catch(function() {});
    }, 4000);
  }

  function tutup() {
    const sesi = telp;
    if (!sesi) return;
    if (sesi.peran === 'penerima' && sesi.status === 'dering') { tolak(); return; }
    akhiri(sesi, sesi.status === 'tersambung' ? 'Panggilan berakhir' : 'Panggilan dibatalkan', { hapus: true });
  }

  function togelBisu() {
    const sesi = telp;
    if (!sesi || !sesi.stream) return;
    sesi.bisu = !sesi.bisu;
    sesi.stream.getAudioTracks().forEach(function(t) { t.enabled = !sesi.bisu; });
    $t('stpBisu').classList.toggle('nyala', sesi.bisu);
    $t('stpBisuTeks').innerText = sesi.bisu ? 'Bunyikan' : 'Bisukan';
  }

  function keadaanKoneksi(pc) {
    if (pc.connectionState) return pc.connectionState;
    const peta = { connected: 'connected', completed: 'connected', disconnected: 'disconnected', failed: 'failed' };
    return peta[pc.iceConnectionState] || '';
  }

  function statusKoneksi(sesi) {
    if (telp !== sesi || !sesi.pc) return;
    const s = keadaanKoneksi(sesi.pc);
    if (s === 'connected') {
      clearTimeout(sesi.putus);
      clearTimeout(sesi.batasKoneksi);
      if (sesi.status !== 'tersambung') {
        sesi.status = 'tersambung';
        sesi.mulai = Date.now();
        atur('aktif', '00:00');
        sesi.timer = setInterval(function() {
          if (telp !== sesi) return;
          const d = Math.floor((Date.now() - sesi.mulai) / 1000);
          setStatus(String(Math.floor(d / 60)).padStart(2, '0') + ':' + String(d % 60).padStart(2, '0'));
        }, 500);
      }
    } else if (s === 'disconnected') {
      if (sesi.status !== 'tersambung') return;
      setStatus('Koneksi terputus...');
      clearTimeout(sesi.putus);
      sesi.putus = setTimeout(function() {
        akhiri(sesi, 'Koneksi terputus', { hapus: true });
      }, BATAS_PUTUS);
    } else if (s === 'failed') {
      akhiri(sesi, 'Koneksi gagal. Coba lagi nanti.', { hapus: true });
    }
  }

  function akhiri(sesi, teks, opsi) {
    if (telp !== sesi) return;
    telp = null;
    clearTimeout(sesi.batas);
    clearTimeout(sesi.batasKoneksi);
    clearTimeout(sesi.putus);
    clearInterval(sesi.timer);
    berhentiDering();
    sesi.refs.forEach(function(r) { try { r.off(); } catch (e) {} });
    if (sesi.pc) {
      try {
        sesi.pc.onconnectionstatechange = null;
        sesi.pc.oniceconnectionstatechange = null;
        sesi.pc.close();
      } catch (e) {}
    }
    if (sesi.stream) hentikanStream(sesi.stream);
    $t('stpAudio').srcObject = null;
    if (opsi && opsi.hapus && (sesi.slotDibuat || sesi.peran === 'penerima')) {
      tdb.ref('panggilan/' + sesi.slot).remove().catch(function() {});
    }
    tampilAkhir(teks);
  }

  function mulaiDering() {
    berhentiDering();
    let ctx = null;
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ctx = null; }
    judulAsli = document.title;
    let kedip = false;
    const bunyi = function() {
      kedip = !kedip;
      document.title = kedip ? 'Panggilan masuk...' : judulAsli;
      if (ctx) {
        try {
          if (ctx.state === 'suspended') ctx.resume();
          [0, 0.4].forEach(function(jeda, i) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.frequency.value = i ? 480 : 440;
            osc.connect(gain);
            gain.connect(ctx.destination);
            const t = ctx.currentTime + jeda;
            gain.gain.setValueAtTime(0.0001, t);
            gain.gain.exponentialRampToValueAtTime(0.18, t + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
            osc.start(t);
            osc.stop(t + 0.35);
          });
        } catch (e) {}
      }
      try { if (navigator.vibrate) navigator.vibrate([400, 200, 400]); } catch (e) {}
    };
    bunyi();
    dering = { ctx: ctx, timer: setInterval(bunyi, 2400) };
  }

  function berhentiDering() {
    if (!dering) return;
    clearInterval(dering.timer);
    try { if (dering.ctx) dering.ctx.close(); } catch (e) {}
    try { if (navigator.vibrate) navigator.vibrate(0); } catch (e) {}
    document.title = judulAsli;
    dering = null;
  }

  function sedangTelepon() {
    return !!telp;
  }

  function mulaiModul() {
    tdb = firebase.database();
    firebase.auth().onAuthStateChanged(function(user) {
      if (!user || uid === user.uid) return;
      uid = user.uid;
      pasangPresensi();
      pasangPanggilanMasuk();
    });
    if (document.body) sisipkanUI();
    else document.addEventListener('DOMContentLoaded', sisipkanUI);
  }

  function tunggu() {
    if (window.firebase && firebase.apps && firebase.apps.length && firebase.auth && firebase.database) mulaiModul();
    else setTimeout(tunggu, 200);
  }

  window.StoolsTelepon = { mulai: mulai, sedangTelepon: sedangTelepon };
  tunggu();
})();
