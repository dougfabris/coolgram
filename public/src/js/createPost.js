
var API_URL = 'http://localhost:3000/posts';

// Declaração dos elementos para manipulação
var title = document.getElementById('post-title');
var description = document.getElementById('post-description');
var displayPosts = document.getElementById('display-posts');
var submitButton = document.getElementById('submitButton');
var closeButton = document.getElementById('closeButton');
var errorToast = document.getElementById('errorToast');
var syncToast = document.getElementById('syncToast');
var installBtn = document.getElementById('installBtn');
var locationBtn = document.getElementById('location-button');
var locationField = document.getElementById('recipient-location');

// Pegar localização do usuário
locationBtn.addEventListener('click', function(event) {
  if (!('geolocation' in navigator)) {
    return;
  }

  navigator.geolocation.getCurrentPosition(function (position) {
    console.log(position);
    locationBtn.style.display = 'none';
    locationField.value = 'Belo Horizonte';
  }, function (error) {
    console.log(error);
  })
})

// Evento para disparar a instalação do app
installBtn.addEventListener('click', function (e) {
  e.preventDefault();

  if (appInstaller) {
    appInstaller.prompt();

    appInstaller.userChoice
      .then(function (choiceResult) {
        if (choiceResult.outcome === 'dismissed') {
          console.log('User cancelled installation');
        } else {
          console.log('User added to home screen');
        }
      });
    
    appInstaller = null;
  }
})

// Função para criação dos cards na página HTML
function createCard (title, description) {
  var column = document.createElement('div');
  column.classList.add('col-sm-12');
  column.classList.add('col-xl-4');

  var card = document.createElement('div');
  card.classList.add('card');
  card.classList.add('mt-3');

  var cardBody = document.createElement('div');
  cardBody.classList.add('card-body');

  var htmlTitle = document.createElement('h5'); 
  htmlTitle.classList.add('card-title');
  htmlTitle.innerText = title;

  var htmlDescription = document.createElement('p');
  htmlDescription.classList.add('card-text');
  htmlDescription.innerText = description;

  // Adicionando como filhos
  column.appendChild(card);
  card.appendChild(cardBody);
  cardBody.appendChild(htmlTitle);
  cardBody.appendChild(htmlDescription);

  displayPosts.appendChild(column);
}

// Função para atualizar a página HTML
function updateUI(data) {
  // Remove todos os posts
  displayPosts.innerHTML = '';

  // Percorre o array e adiciona os posts
  for (item of data) {
    createCard(item.title, item.description);
  }
} 

var networkDataReceived = false;

// Fetch inicial da aplicação
fetch(API_URL)
  .then(function(res) {
    return res.json();
  })
  .then(function (data) {
    networkDataReceived = true;
    console.log('FROM API REST');
    updateUI(data);
  })
  .catch(function (error) {
    console.log(error);
  })

// Update da UI pelo indexedDB
if ('indexedDB' in window) {
  readAllData('posts')
    .then(function (data) {
      if (!networkDataReceived) {
        console.log('FROM CACHE');
        updateUI(data);
      }
    })
    .catch(function (error) {
      console.log(error);
    })
}

// Evento de Click do Modal
submitButton.addEventListener('click', function() {
  if (title.value === '') {
    const toastError = new bootstrap.Toast(errorToast);
    closeButton.click();
    return toastError.show();
  }

  closeButton.click();

  // Envia o post para fila do service worker
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    navigator.serviceWorker.ready
      .then(function(sw) {
        var post = {
          id: Math.random(),
          title: title.value,
          description: description.value
        }
        writeData('sync-posts', post)
          .then(function() {
            return sw.sync.register('sync-new-posts');
          })
          .then(function() {
            resetForm();

            // Retorna um alerta para o usuário
            const toastSync = new bootstrap.Toast(syncToast);
            return toastSync.show();
          })
          .catch(function(error) {
            console.log(error);
          })
      })
  } else {
    postData(title.value, description.value);
  }  
});

// Função para resetar o form
function resetForm () {
  title.value = '';
  description.value = '';
}

// Fetch para enviar posts para o servidor local
function postData (title, description) {
  fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': "application/json"
    },
    body: JSON.stringify({
      id: Math.random(),
      title: title,
      description: description
    })
  })
  .then(function (res) {
    return res.json()
  })
  .then(function(res) {
    console.log('Sent data', res);
    updateUI();
  })
}  
