
var title = document.getElementById('post-title');
var description = document.getElementById('post-description');
var displayPosts = document.getElementById('display-posts');

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

var submitButton = document.getElementById('submitButton');
var closeButton = document.getElementById('closeButton');
var toastLiveExample = document.getElementById('liveToast');

submitButton.addEventListener('click', function() {
  // if (deferredPrompt) {
  //   deferredPrompt.prompt();
  // }
  if (title.value === '') {
    const toast = new bootstrap.Toast(toastLiveExample)
    closeButton.click();
    return toast.show();
  }

  postData(title.value, description.value);

  title.value = '';
  description.value = '';

  closeButton.click();
});

function updateUI() {
  displayPosts.innerHTML = '';

  fetch('http://localhost:3000/posts')
    .then(function(res) {
      return res.json();
    })
    .then(function (data) {
      for (item of data) {
        createCard(item.title, item.description);
      }
    })
} 

updateUI();

function postData (title, description) {
  fetch('http://localhost:3000/posts', {
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
