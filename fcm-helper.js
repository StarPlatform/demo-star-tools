// KONFIGURASI FIREBASE
var firebaseConfig = {
  apiKey: "AIzaSyDgr_nHqvpMsiG4lBkYckzxRErkskXj_6E",
  authDomain: "laporanstartools-c18b2.firebaseapp.com",
  databaseURL: "https://laporanstartools-c18b2-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "laporanstartools-c18b2",
  storageBucket: "laporanstartools-c18b2.firebasestorage.app",
  messagingSenderId: "596585220522",
  appId: "1:596585220522:web:d61e13c60daff6daca43d3",
  measurementId: "G-L22M87LZY4"
};

// INISIALISASI - CEK APAKAH SUDAH ADA
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

var messaging;

// PASTIKAN FIREBASE SUDAH SIAP SEBELUM PAKAI MESSAGING
function getMessagingInstance() {
    if (!messaging) {
        try {
            messaging = firebase.messaging();
            console.log('Messaging instance siap');
        } catch (e) {
            console.log('Gagal init messaging:', e);
        }
    }
    return messaging;
}

// VAPID KEY
var VAPID_KEY = "BMDeVPW5lXflflwgl2Aey_5GWsNVWyGRMSvvJ0LZ4pvS0Lt-zh3464ylJzY1ICTj-xNvZQ1JUhfCAWTc1NCxfxk";

// MINTA IZIN NOTIFIKASI
function requestPermission() {
    console.log('Minta izin notifikasi...');
    Notification.requestPermission().then(function(permission) {
        if (permission === 'granted') {
            console.log('Izin notifikasi diberikan');
            getToken();
        } else {
            console.log('Izin notifikasi ditolak');
        }
    });
}

// AMBIL FCM TOKEN
function getToken() {
    var msg = getMessagingInstance();
    if (!msg) {
        console.log('Messaging tidak tersedia');
        return;
    }
    
    msg.getToken({ vapidKey: VAPID_KEY })
        .then(function(token) {
            console.log('FCM Token:', token);
            localStorage.setItem('fcmToken', token);
            var display = document.getElementById('tokenDisplay');
            if (display) display.innerText = token;
        })
        .catch(function(err) {
            console.log('Gagal ambil token:', err);
        });
}

// HANDLE NOTIFIKASI SAAT FOREGROUND
function setupOnMessage() {
    var msg = getMessagingInstance();
    if (!msg) return;
    
    msg.onMessage(function(payload) {
        console.log('Notifikasi diterima:', payload);
        if (payload.notification) {
            alert(payload.notification.title + '\n\n' + payload.notification.body);
        }
    });
}

// FUNGSI AMBIL TOKEN DARI STORAGE
function getStoredToken() {
    return localStorage.getItem('fcmToken') || 'Belum ada token';
}

// FUNGSI DARI NATIVE (WebView)
function setupFCM(token) {
    console.log('Token dari Native:', token);
    localStorage.setItem('fcmToken', token);
    var display = document.getElementById('tokenDisplay');
    if (display) display.innerText = token;
}

// REGISTRASI SERVICE WORKER
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/firebase-messaging-sw.js')
        .then(function(registration) {
            console.log('Service Worker registrasi berhasil');
            // Setelah SW berhasil, baru init FCM
            getMessagingInstance();
            setupOnMessage();
        })
        .catch(function(error) {
            console.log('Service Worker registrasi gagal:', error);
        });
}

// AUTO START
window.addEventListener('load', function() {
    console.log('Inisialisasi FCM...');
    var hasNativeToken = localStorage.getItem('fcmToken') !== null;
    if (hasNativeToken) {
        console.log('Mode WebView: Token dari Native siap');
        var display = document.getElementById('tokenDisplay');
        if (display) display.innerText = localStorage.getItem('fcmToken');
    } else {
        console.log('Mode Browser: Minta izin notifikasi...');
        // TUNGGU BEBERAPA DETIK BIAR FIREBASE SIAP
        setTimeout(function() {
            requestPermission();
        }, 1000);
    }
});

// TOMBOL TAMPILKAN TOKEN
function showToken() {
    var token = getStoredToken();
    alert('Token FCM:\n\n' + token);
}