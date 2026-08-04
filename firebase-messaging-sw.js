importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

firebase.initializeApp({
  apiKey: "AIzaSyDgr_nHqvpMsiG4lBkYckzxRErkskXj_6E",
  authDomain: "laporanstartools-c18b2.firebaseapp.com",
  databaseURL: "https://laporanstartools-c18b2-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "laporanstartools-c18b2",
  storageBucket: "laporanstartools-c18b2.firebasestorage.app",
  messagingSenderId: "596585220522",
  appId: "1:596585220522:web:d61e13c60daff6daca43d3",
  measurementId: "G-L22M87LZY4"
});

var messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
    console.log('Notifikasi background:', payload);
    var title = payload.notification?.title || 'Notifikasi Baru';
    var options = {
        body: payload.notification?.body || 'Pesan baru',
        icon: '/logo.jpg'
    };
    self.registration.showNotification(title, options);
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('https://starplatform.github.io/demo-star-tools/')
    );
});
