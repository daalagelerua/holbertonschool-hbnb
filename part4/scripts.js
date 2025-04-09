document.addEventListener('DOMContentLoaded', () => {
  checkAuthentication();

  // when click on button 'view details'
  const detailButtons = document.querySelectorAll('.details-button');

  detailButtons.forEach(button => {
    button.addEventListener('click', function () {
      const placeId = button.getAttribute('data-id');
      if (placeId) {
        // complete URL = place.html + place_id
        window.location.href = `place.html?id=${placeId}`;
      }
    });
  });

  // Login form
  const loginForm = document.getElementById('login-form');

  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault(); // 🛑 stop the page from reloading

      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      await loginUser(email, password);
    });
  }

    // Adding price filter options
    const priceFilter = document.getElementById('price-filter');
    if (priceFilter) {
      const priceOptions = [10, 50, 100, 'All'];
      priceOptions.forEach(optionValue => {
        const option = document.createElement('option');
        option.value = optionValue;
        option.textContent = optionValue;
        priceFilter.appendChild(option);
      });
  
      // Listening to changes in places
      priceFilter.addEventListener('change', (event) => {
        const selectedPrice = event.target.value;
        const allPlaces = document.querySelectorAll('.place-card');
  
        allPlaces.forEach(place => {
          const priceText = place.querySelector('p').textContent;
          const match = priceText.match(/€(\d+)/);
          const price = match ? parseInt(match[1], 10) : 0;
  
          if (selectedPrice === 'All' || price <= parseInt(selectedPrice)) {
            place.style.display = 'block';
          } else {
            place.style.display = 'none';
          }
        });
      });
    }
});

async function loginUser(email, password) {
  const errorMessage = document.getElementById('login-error');

  try {
    const response = await fetch('http://127.0.0.1:5000/api/v1/login', {
      method: 'POST', // sending POST request (to send data)
      headers: {
        'Content-Type': 'application/json' // data we wish to send are JSON
      },
      body: JSON.stringify({ email, password }) // convert data to json string
    });

    if (response.ok) {
      const data = await response.json(); // retrieve data in format json (JWT)

      // store token in a cookie 🍪
      document.cookie = `token=${data.access_token}; path=/`;

      // redirect to index.html
      window.location.href = 'index.html';
    } else {
      const errorData = await response.json(); // retrieve error message
      errorMessage.textContent = errorData.error || 'Identifiants incorrects';
    }
    // if error during fetch
  } catch (error) {
    console.error('Erreur de connexion :', error);
    alert('Erreur server ou reseau');
  }
}

// extract value of a cookie (here the token)
function getCookie(name) {
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    // check if cookie start with "name="
    if (cookie.startsWith(name + '=')) {
      return cookie.substring((name + '=').length);
    }
  }
  return null;
}


// control login display
function checkAuthentication() {
  const token = getCookie('token');
  const loginLink = document.getElementById('login-link');

  if (loginLink) {
    if (!token) {
      loginLink.style.display = 'block';
    } else {
      loginLink.style.display = 'none';
      // Fetch places data if the user is authenticated
      fetchPlaces(token);
    }
  }
}


async function fetchPlaces() {
  const token = getCookie('token');  // retrieve token from cookie

  if (!token) {
    console.log("Utilisateur non authentifié.");
    alert("Vous devez être connecté pour voir les lieux.");
    return;  // if no token stop function here
  }

  try {
    const response = await fetch("http://127.0.0.1:5000/api/v1/places/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` // Ajoute le token dans l'en-tete
      }
    });

    if (!response.ok) {
      throw new Error("Échec de récupération des lieux");
    }

    const places = await response.json();

    // call this function to show places
    displayPlaces(places);
  } catch (error) {
    console.error("Erreur lors du fetch des places :", error);
    alert("Impossible de récupérer les lieux. Veuillez réessayer.");
  }
}

function displayPlaces(places) {
  const placesList = document.getElementById('places-list');
  if (!placesList) return;

  // Clear last results
  placesList.innerHTML = '';

  places.forEach(place => {
    const placeCard = document.createElement('div');
    placeCard.className = 'place-card';
    placeCard.setAttribute('data-price', place.price); // useful for filter

    placeCard.innerHTML = `
      <h2>${place.title}</h2>
      <p>${place.description ? place.description : 'No description available'}</p>
      <p>Price per night: €${place.price}</p>
      <button class="details-button" data-id="${place.id}">View Details</button>
    `;

    placesList.appendChild(placeCard);
  });

  // Réattacher les events "View Details" après avoir créé dynamiquement les boutons
  const detailButtons = document.querySelectorAll('.details-button');
  detailButtons.forEach(button => {
    button.addEventListener('click', function () {
      const placeId = button.getAttribute('data-id');
      if (placeId) {
        window.location.href = `place.html?id=${placeId}`;
      }
    });
  });
}
