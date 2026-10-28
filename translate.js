(function () {
  var BAHASA_ASAL = 'id';
  var COOKIE_NAMA = 'googtrans';
  var KUNCI_PILIHAN = 'stools_bahasa';
  var SATU_TAHUN = 365 * 24 * 60 * 60;

  var DAFTAR_BAHASA = [
    { kode: 'id', asli: 'Indonesia', inggris: 'Indonesian' },
    { kode: 'en', asli: 'English', inggris: 'English' },
    { kode: 'ms', asli: 'Bahasa Melayu', inggris: 'Malay' },
    { kode: 'ar', asli: 'العربية', inggris: 'Arabic' },
    { kode: 'zh-CN', asli: '中文 (简体)', inggris: 'Chinese (Simplified)' },
    { kode: 'ja', asli: '日本語', inggris: 'Japanese' },
    { kode: 'ko', asli: '한국어', inggris: 'Korean' },
    { kode: 'es', asli: 'Español', inggris: 'Spanish' },
    { kode: 'fr', asli: 'Français', inggris: 'French' },
    { kode: 'de', asli: 'Deutsch', inggris: 'German' }
  ];

  function bacaCookie() {
    var cocok = document.cookie.match(new RegExp('(?:^|; )' + COOKIE_NAMA + '=([^;]*)'));
    return cocok ? decodeURIComponent(cocok[1]) : '';
  }

  function bacaPilihan() {
    try {
      return localStorage.getItem(KUNCI_PILIHAN);
    } catch (e) {
      return null;
    }
  }

  function simpanPilihan(kode) {
    try {
      localStorage.setItem(KUNCI_PILIHAN, kode);
    } catch (e) {}
  }

  function bahasaAktif() {
    var kode = bacaPilihan();
    if (!kode) kode = bacaCookie().split('/')[2] || BAHASA_ASAL;
    var ada = DAFTAR_BAHASA.some(function (b) { return b.kode === kode; });
    return ada ? kode : BAHASA_ASAL;
  }

  function namaBahasa(kode) {
    for (var i = 0; i < DAFTAR_BAHASA.length; i++) {
      if (DAFTAR_BAHASA[i].kode === kode) return DAFTAR_BAHASA[i].asli;
    }
    return kode;
  }

  function tulisCookie(nilai, detik) {
    var host = location.hostname;
    var akhir = detik > 0
      ? '; max-age=' + detik
      : '; expires=Thu, 01 Jan 1970 00:00:00 UTC';
    var isi = COOKIE_NAMA + '=' + (detik > 0 ? nilai : '') + '; path=/' + akhir;

    document.cookie = isi;
    if (host && host.indexOf('.') !== -1) {
      document.cookie = isi + '; domain=' + host;
      document.cookie = isi + '; domain=.' + host.replace(/^www\./, '');
    }
  }

  function gantiBahasa(kode) {
    simpanPilihan(kode);
    if (kode === BAHASA_ASAL) {
      tulisCookie('', 0);
    } else {
      tulisCookie('/' + BAHASA_ASAL + '/' + kode, SATU_TAHUN);
    }
    location.reload();
  }

  function pasangGaya() {
    var gaya = document.createElement('style');
    gaya.textContent = [
      'iframe.skiptranslate, .skiptranslate iframe, .goog-te-banner-frame, .goog-te-balloon-frame { display: none !important; visibility: hidden !important; }',
      '.VIpgJd-ZVi9od-ORHb-OEVmcd, .VIpgJd-ZVi9od-aZ2wEe-wOHMyf, .VIpgJd-ZVi9od-aZ2wEe-OiiCO, .VIpgJd-ZVi9od-l4eHX-hSRGPd { display: none !important; }',
      '.goog-te-spinner-pos, .goog-te-gadget, #goog-gt-tt, .goog-tooltip, .goog-tooltip:hover { display: none !important; }',
      '.goog-text-highlight { background: none !important; box-shadow: none !important; }',
      'html, html.translated-ltr, html.translated-rtl { margin-top: 0 !important; }',
      'body { top: 0 !important; }',
      'font { background: none !important; box-shadow: none !important; }'
    ].join('\n');
    document.head.appendChild(gaya);
  }

  function tandaiTanpaTerjemah(akar) {
    var elemen = akar.querySelectorAll
      ? akar.querySelectorAll('pre, code, kbd, samp, textarea, .notranslate')
      : [];
    for (var i = 0; i < elemen.length; i++) {
      elemen[i].setAttribute('translate', 'no');
      elemen[i].classList.add('notranslate');
    }
  }

  function pantauElemenBaru() {
    var pengamat = new MutationObserver(function (daftar) {
      daftar.forEach(function (perubahan) {
        perubahan.addedNodes.forEach(function (node) {
          if (node.nodeType === 1) {
            if (node.matches && node.matches('pre, code, kbd, samp, textarea')) {
              node.setAttribute('translate', 'no');
              node.classList.add('notranslate');
            }
            tandaiTanpaTerjemah(node);
          }
        });
      });
    });
    pengamat.observe(document.body, { childList: true, subtree: true });
  }

  function terapkanPilihan(kode) {
    var percobaan = 0;
    var pemeriksa = setInterval(function () {
      var combo = document.querySelector('select.goog-te-combo');
      percobaan++;

      if (combo && combo.options.length > 1) {
        clearInterval(pemeriksa);
        if (combo.value !== kode) {
          combo.value = kode;
          combo.dispatchEvent(new Event('change'));
        }
      } else if (percobaan > 75) {
        clearInterval(pemeriksa);
      }
    }, 200);
  }

  function muatGoogleTranslate(kode) {
    var wadah = document.createElement('div');
    wadah.id = 'google_translate_element';
    wadah.style.cssText = 'position:absolute;left:-9999px;top:0;width:1px;height:1px;overflow:hidden;';
    document.body.appendChild(wadah);

    window.googleTranslateElementInit = function () {
      new google.translate.TranslateElement({
        pageLanguage: BAHASA_ASAL,
        includedLanguages: DAFTAR_BAHASA.map(function (b) { return b.kode; }).join(','),
        autoDisplay: false
      }, 'google_translate_element');
    };

    var skrip = document.createElement('script');
    skrip.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    document.body.appendChild(skrip);
    terapkanPilihan(kode);
  }

  function mulai() {
    var kode = bahasaAktif();
    if (kode === BAHASA_ASAL) return;
    tulisCookie('/' + BAHASA_ASAL + '/' + kode, SATU_TAHUN);
    pasangGaya();
    tandaiTanpaTerjemah(document);
    pantauElemenBaru();
    muatGoogleTranslate(kode);
  }

  window.STranslate = {
    daftar: DAFTAR_BAHASA.filter(function (b) { return b.kode !== BAHASA_ASAL; }),
    aktif: bahasaAktif,
    nama: namaBahasa,
    ganti: gantiBahasa
  };

  mulai();
})();

(function () {
  var KUNCI = {
    temaOtomatis: 'stools_tema_otomatis',
    kurangiAnimasi: 'stools_kurangi_animasi',
    layarMenyala: 'stools_layar_menyala'
  };
  var ID_GAYA_ANIMASI = 'stools-kurangi-animasi';
  var mediaGelap = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  var kunciLayar = null;

  function baca(nama) {
    try {
      return localStorage.getItem(KUNCI[nama]) === '1';
    } catch (e) {
      return false;
    }
  }

  function simpan(nama, nilai) {
    try {
      localStorage.setItem(KUNCI[nama], nilai ? '1' : '0');
    } catch (e) {}
  }

  function didukung(nama) {
    if (nama === 'layarMenyala') return 'wakeLock' in navigator;
    if (nama === 'temaOtomatis') return !!mediaGelap;
    return true;
  }

  function setTema(gelap) {
    document.body.classList.toggle('dark', gelap);
    try {
      localStorage.setItem('theme', gelap ? 'dark' : 'light');
    } catch (e) {}
    if (typeof window.updateThemeLabels === 'function') window.updateThemeLabels(gelap);
  }

  function ikutiSistem() {
    if (baca('temaOtomatis') && mediaGelap) setTema(mediaGelap.matches);
  }

  function terapkanAnimasi() {
    var gaya = document.getElementById(ID_GAYA_ANIMASI);

    if (!baca('kurangiAnimasi')) {
      if (gaya) gaya.remove();
      return;
    }
    if (gaya) return;

    gaya = document.createElement('style');
    gaya.id = ID_GAYA_ANIMASI;
    gaya.textContent = '*, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; scroll-behavior: auto !important; }';
    document.head.appendChild(gaya);
  }

  function mintaLayar() {
    if (!didukung('layarMenyala')) return Promise.resolve(false);
    if (kunciLayar) return Promise.resolve(true);

    return navigator.wakeLock.request('screen').then(function (kunci) {
      kunciLayar = kunci;
      kunci.addEventListener('release', function () { kunciLayar = null; });
      return true;
    }).catch(function () {
      return false;
    });
  }

  function lepasLayar() {
    if (kunciLayar) {
      kunciLayar.release();
      kunciLayar = null;
    }
  }

  function tulis(nama, nilai) {
    if (nilai && !didukung(nama)) return Promise.resolve(false);

    if (nama === 'layarMenyala') {
      if (!nilai) {
        simpan(nama, false);
        lepasLayar();
        return Promise.resolve(true);
      }
      return mintaLayar().then(function (berhasil) {
        simpan(nama, berhasil);
        return berhasil;
      });
    }

    simpan(nama, nilai);
    if (nama === 'temaOtomatis') ikutiSistem();
    if (nama === 'kurangiAnimasi') terapkanAnimasi();
    return Promise.resolve(true);
  }

  function mulai() {
    ikutiSistem();
    terapkanAnimasi();
    if (baca('layarMenyala')) mintaLayar();

    if (mediaGelap) {
      if (mediaGelap.addEventListener) mediaGelap.addEventListener('change', ikutiSistem);
      else if (mediaGelap.addListener) mediaGelap.addListener(ikutiSistem);
    }

    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'visible' && baca('layarMenyala')) mintaLayar();
    });
  }

  window.SPref = {
    baca: baca,
    tulis: tulis,
    didukung: didukung
  };

  mulai();
})();
