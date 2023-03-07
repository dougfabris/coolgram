
var appInstaller;
var notificationBtn = document.getElementById('notificationButton');

// Registro do service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/serviceWorker.js')
    .then(function() {
      console.log('Service Worker Registerd');
    });
}

// Declaração do appInstaller para uso na aplicação
window.addEventListener('beforeinstallprompt', function(event) {
  event.preventDefault();
  appInstaller = event;
  return false;
});

// Função para mostrar notificação
function displayConfirmation() {
  var options = {
    body: 'Congratulations you subscribed to your notification service',
    icon: './src/images/icons/cg-icon72x72.png',
    tag: 'dispatchNotification',
    renotify: true,
    actions: [
      { action: 'confirm', title: 'Okay' },
      { action: 'cancel', title: 'Cancel' }
    ]
  }

  navigator.serviceWorker.ready
    .then(function(sw) {
      sw.showNotification('Successfully subscribed', options);
    })
}

// Evento para disparar requisição de permissão para notificações
notificationBtn.addEventListener('click', function(e) {
  if ("Notification" in window) {
    Notification.requestPermission(function(result) {
      if (result !== 'granted') {
        console.log('No permission');
      }

      displayConfirmation();
    });
  }
})
