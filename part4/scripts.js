document.addEventListener('DOMContentLoaded', () => {
  console.log("Page loaded, checking authentication");
  checkAuthentication();
  setupPriceFilter();
  fetchPlaces();
  loadPriceFilterOptions();

  // Setup login form
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      await loginUser(email, password);
    });
  }
});

async function loginUser(email, password) {
  const errorMessage = document.getElementById('login-error');
  if (errorMessage) errorMessage.style.display = 'none';

  try {
    const response = await fetch('http://127.0.0.1:5000/api/v1/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    if (response.ok) {
      const data = await response.json();
      document.cookie = `token=${data.access_token}; path=/`;
      
      // Check if there's a redirect parameter
      const urlParams = new URLSearchParams(window.location.search);
      const redirectUrl = urlParams.get('redirect');
      
      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        window.location.href = 'index.html';
      }
    } else {
      const errorData = await response.json();
      const errorElement = document.getElementById('login-error');
      if (errorElement) {
        errorElement.textContent = errorData.error || 'Invalid credentials';
        errorElement.style.display = 'block';
      }
    }
  } catch (error) {
    console.error('Connection error:', error);
    const errorElement = document.getElementById('login-error');
    if (errorElement) {
      errorElement.textContent = 'Server or network error';
      errorElement.style.display = 'block';
    }
  }
}

function getCookie(name) {
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith(name + '=')) {
      return cookie.substring(name.length + 1);
    }
  }
  return null;
}

function checkAuthentication() {
  const token = getCookie('token');
  console.log("Checking authentication, token:", token ? "Token exists" : "No token");

  const loginLink = document.getElementById('login-link');
  const logoutLink = document.getElementById('logout-link');

  if (token) {
    console.log("User is logged in");
    
    // Verify if token is valid by checking its expiration
    try {
      const tokenData = parseJwt(token);
      const currentTime = Math.floor(Date.now() / 1000);
      
      if (tokenData.exp && tokenData.exp < currentTime) {
        console.log("Token expired, logging out");
        clearAuthToken();
        if (loginLink) loginLink.style.display = 'block';
        if (logoutLink) logoutLink.style.display = 'none';
        return null;
      }
    } catch (e) {
      console.error("Error parsing token:", e);
      // If token can't be parsed, clear it
      clearAuthToken();
      if (loginLink) loginLink.style.display = 'block';
      if (logoutLink) logoutLink.style.display = 'none';
      return null;
    }
    
    // Token is valid
    if (loginLink) loginLink.style.display = 'none';
    if (logoutLink) {
      logoutLink.style.display = 'block';
      logoutLink.onclick = function(e) {
        e.preventDefault();
        clearAuthToken();
        window.location.reload();
      };
    }
    return token;
  } else {
    if (loginLink) loginLink.style.display = 'block';
    if (logoutLink) logoutLink.style.display = 'none';
    return null;
  }
}

function clearAuthToken() {
  document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

// Parse JWT token to check expiration
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Error parsing JWT:', e);
    return {};
  }
}

async function fetchPlaces() {
  try {
    const token = getCookie('token');
    const headers = {
      "Content-Type": "application/json"
    };
    
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    console.log("Fetching places...");
    const response = await fetch("http://127.0.0.1:5000/api/v1/places/", {
      method: "GET",
      headers: headers
    });

    console.log("Response status:", response.status);

    if (!response.ok) {
      console.warn(`Server responded with ${response.status}`);

      if (response.status === 401) {
        if (token) {
          // Token might be expired
          console.log("Authentication error, clearing token");
          clearAuthToken();
          window.location.reload();
          return;
        } else {
          const placesListElement = document.getElementById('places-list');
          if (placesListElement) {
            placesListElement.innerHTML = `
              <div class="notice-container">
                <p>You need to login to see the list of places.</p>
                <a href="login.html" class="login-button">Login</a>
              </div>
            `;
          }
          return;
        }
      }
      
      throw new Error(`Error retrieving places: ${response.status}`);
    }

    const places = await response.json();
    console.log("Places data received:", places.length, "places");
    displayPlaces(places);
  } catch (error) {
    console.error("Error retrieving places:", error);
    const placesListElement = document.getElementById('places-list');
    if (placesListElement) {
      placesListElement.innerHTML = `
        <div class="error-container">
          <p>Cannot fetch list of places.</p>
          <p>Error: ${error.message}</p>
        </div>
      `;
    }
  }
}

function displayPlaces(places) {
  const placesList = document.getElementById('places-list');
  const loadingIndicator = document.getElementById('loading-indicator');
  
  if (loadingIndicator) {
    loadingIndicator.style.display = 'none';
  }
  
  if (!placesList) return;

  console.log("Displaying places:", places); // Debug

  console.log("Raw place objects:", places);
  places.forEach(place => {
    console.log(`Place ${place.id} - description:`, place.description);
  });

  // Clear previous content
  placesList.innerHTML = '';

  if (!places || places.length === 0) {
    placesList.innerHTML = '<div class="notice-container"><p>No places available at the moment.</p></div>';
    return;
  }

  places.forEach((place, index) => {
    const placeCard = document.createElement('div');
    placeCard.className = 'place-card';
    placeCard.setAttribute('data-price', place.price || 0);

    // Check if all required properties exist
    const title = place.title || 'Unnamed place';
    const description = place.description || 'No description available';
    const price = typeof place.price === 'number' ? `$${place.price}` : 'Price not available';
    const placeId = place.id;

    if (!placeId) {
      console.warn('Place without ID:', place);
      return; // Skip places without ID
    }
    
    // Create a generic colored background instead of using an image placeholder
    const colors = ['#FFD1DC', '#B5EAD7', '#C7CEEA', '#F8B195', '#FFDAC1'];
    const bgColor = colors[index % colors.length];
    
    placeCard.innerHTML = `
      <div class="place-image" style="background-color: ${bgColor}; display: flex; align-items: center; justify-content: center;">
        <i class="fas fa-home" style="font-size: 48px; color: white;"></i>
      </div>
      <div class="place-content">
        <h2 title="${title}">${title}</h2>
        <p class="place-description">${description}</p>
        <p class="place-price"><i class="fas fa-tag"></i> ${price} per night</p>
        <button class="details-button" data-id="${placeId}">
          <i class="fas fa-info-circle"></i> View Details
        </button>
      </div>
    `;

    placesList.appendChild(placeCard);
  });

  // Add event listeners to details buttons
  const detailButtons = document.querySelectorAll('.details-button');
  detailButtons.forEach(button => {
    button.addEventListener('click', function() {
      const placeId = this.getAttribute('data-id');
      if (placeId) {
        window.location.href = `place.html?id=${placeId}`;
      }
    });
  });
}

function loadPriceFilterOptions() {
  const priceFilter = document.getElementById('price-filter');
  if (priceFilter && priceFilter.options.length === 0) {
    const options = [
      { value: '50', text: 'Up to $50' },
      { value: '100', text: 'Up to $100' },
      { value: '200', text: 'Up to $200' },
      { value: 'All', text: 'All Prices' }
    ];
    
    options.forEach(option => {
      const optionElement = document.createElement('option');
      optionElement.value = option.value;
      optionElement.textContent = option.text;
      priceFilter.appendChild(optionElement);
    });
  }
}

function filterPlacesByPrice(maxPrice) {
  const placeCards = document.querySelectorAll('.place-card');
  
  placeCards.forEach(card => {
    const price = parseFloat(card.getAttribute('data-price') || 0);
    
    if (maxPrice === 'All' || price <= parseFloat(maxPrice)) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}

function setupPriceFilter() {
  const priceFilter = document.getElementById('price-filter');
  
  if (priceFilter) {
    priceFilter.addEventListener('change', (event) => {
      const selectedPrice = event.target.value;
      filterPlacesByPrice(selectedPrice);
    });
  }
}
