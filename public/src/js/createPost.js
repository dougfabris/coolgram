
var API_URL = 'http://localhost:3000/posts';

// Elements manipulation
var title = document.getElementById('post-title');
var description = document.getElementById('post-description');
var displayPosts = document.getElementById('display-posts');
var submitButton = document.getElementById('submitButton');
var closeButton = document.getElementById('closeButton');
var errorToast = document.getElementById('errorToast');
var syncToast = document.getElementById('syncToast');
var installBtn = document.getElementById('installBtn');

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


function updateUI(data) {
  displayPosts.innerHTML = '';

  for (item of data) {
    createCard(item.title, item.description);
  }
} 

var networkDataReceived = false;

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

submitButton.addEventListener('click', function() {
  if (title.value === '') {
    const toastError = new bootstrap.Toast(errorToast);
    closeButton.click();
    return toastError.show();
  }

  closeButton.click();

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
            const toastSync = new bootstrap.Toast(syncToast);
            return toastSync.show();
            // retornar uma mensagem para o usuário
          })
          .catch(function(error) {
            console.log(error);
          })
      })
  } else {
    postData(title.value, description.value);
  }

  resetForm();
});

function resetForm () {
  title.value = '';
  description.value = '';
}

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
