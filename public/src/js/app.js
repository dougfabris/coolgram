
var appInstaller;

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/serviceWorker.js')
    .then(function() {
      console.log('Service Worker Registerd');
    });
}

window.addEventListener('beforeinstallprompt', function(event) {
  event.preventDefault();
  appInstaller = event;
  return false;
})

