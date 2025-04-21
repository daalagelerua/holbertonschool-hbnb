document.addEventListener('DOMContentLoaded', () => {
  console.log("Page loaded, checking authentication"); // Debug
  checkAuthentication();
  setupPriceFilter();
  fetchPlaces();
  loadPriceFilterOptions();

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
      const errorElement = document.getElementById('login-error');
      if (errorElement) {
        errorElement.textContent = errorData.error || 'Incorrect IDs';
        errorElement.style.display = 'block';
      }
    }
    // if error during fetch
  } catch (error) {
    console.error('Erreur de connexion :', error);
    alert('Erreur server ou reseau');
  }
}

// Gestionnaire de soumission du formulaire de connexion
if (document.getElementById('login-form')) {
  document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    loginUser(email, password);
  });
}

// extract value of a cookie (here the token)
function getCookie(name) {
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    // check if cookie start with "name="
    if (cookie.startsWith(name + '=')) {
      return cookie.substring(name.length + 1);
    }
  }
  return null;
}


// control login display
function checkAuthentication() {
  const token = getCookie('token');

  // interface element to update
  const loginLink = document.getElementById('login-link');
  const logoutLink = document.getElementById('logout-link');

  console.log("Checking authentication, token:", token); // Debug

  if (token) {
    // L'utilisateur est authentifié
    console.log("User is logged in"); // Debug

    if (loginLink) loginLink.style.display = 'none';
    if (logoutLink) logoutLink.style.display = 'block';
    return token;
      
      // Ajouter l'événement de déconnexion
      //logoutLink.onclick = function(e) {
      //  e.preventDefault();
      //  document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      //  window.location.reload();
     // };
   // }
    
    // Load data that need auth
    //fetchPlaces(token);
  } else {
    // User not auth
    if (loginLink) loginLink.style.display = 'block';
    if (logoutLink) logoutLink.style.display = 'none';
    return null;
  }
}



async function fetchPlaces() {
  try {
    const token = getCookie('token');
    const headers = {
      "Content-Type": "application/json"
    };
    
    // Add a token if it exist
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch("http://127.0.0.1:5000/api/v1/places/", {
      method: "GET",
      headers: headers
    });

    if (!response.ok) {
      console.warn(`Server responded with ${response.status}`);

      if (response.status === 401 && !token) {
        const placesListElement = document.getElementById('places-list');
        if (placesListElement) {
          placesListElement.innerHTML = `
            <div class="notice-container">
              <p>You need to connect to see the list of places.</p>
              <a href="login.html" class="login-button">Login</a>
            </div>
          `;
        }
        return;
      }
      
      throw new Error(`error while retrieving places: ${response.status}`);
    }

    const places = await response.json();
    displayPlaces(places);
  } catch (error) {
    console.error("Error while retrieving places :", error);
    const placesListElement = document.getElementById('places-list');
    if (placesListElement) {
      placesListElement.innerHTML = `
        <div class="error-container">
          <p>Cannot fetch list of places.</p>
          <p>Erreur: ${error.message}</p>
        </div>
      `;
    }
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

// Fonction pour charger les options du filtre de prix
function loadPriceFilterOptions() {
  const priceFilter = document.getElementById('price-filter');
  if (priceFilter && priceFilter.options.length === 0) {

    const options = [
      { value: '10', text: '10' },
      { value: '50', text: '50' },
      { value: '100', text: '100' },
      { value: 'All', text: 'All' }
    ];
    
    options.forEach(option => {
      const optionElement = document.createElement('option');
      optionElement.value = option.value;
      optionElement.textContent = option.text;
      priceFilter.appendChild(optionElement);
    });
  }
}

// Fonction pour filtrer les logements par prix
function filterPlacesByPrice(maxPrice) {
  console.log("Filtering by price:", maxPrice);

  const placeCards = document.querySelectorAll('.place-card');
  
  placeCards.forEach(card => {
    // Récupérer le prix à partir de l'attribut data-price
    const price = parseFloat(card.getAttribute('data-price') || 0);
    
    if (maxPrice === 'All' || price <= parseFloat(maxPrice)) {
      // Montrer le logement
      card.style.display = 'block';
    } else {
      // Cacher le logement
      card.style.display = 'none';
    }
  });
}

// Add eventListener to price filter
function setupPriceFilter() {
  const priceFilter = document.getElementById('price-filter');
  
  if (priceFilter) {
    priceFilter.addEventListener('change', (event) => {
      const selectedPrice = event.target.value;
      filterPlacesByPrice(selectedPrice);
    });
  }
}
