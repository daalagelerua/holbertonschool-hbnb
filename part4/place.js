document.addEventListener('DOMContentLoaded', () => {
  // Vérifier l'authentification et gérer les tokens expirés
  checkAndRefreshAuthentication();

  // Retrieve page parameters
  const params = new URLSearchParams(window.location.search);
  const placeId = params.get("id");
  
  if (!placeId) {
    document.getElementById("place-details").innerHTML = "<p>Place id missing.</p>";
    return;
  }
  
  // Show loading state
  const detailsSection = document.getElementById("place-details");
  if (detailsSection) {
    detailsSection.innerHTML = `
      <div class="loading-indicator">
        <p>Loading place details...</p>
      </div>
    `;
  }
  
  // Try to retrieve place details
  fetchPlaceDetailsWithFallback(placeId);
});

// Fonction principale pour récupérer les détails avec fallbacks
async function fetchPlaceDetailsWithFallback(placeId) {
  try {
    const token = getCookie('token');
    
    if (token) {
      try {
        const place = await fetchPlaceDetails(placeId, token);
        renderPlaceDetails(place);
        setupReviewForm(placeId);
        return;
      } catch (error) {
        console.log("Attempt with token failed:", error.message);
        // Si l'erreur est liée à un token expiré, on supprime le token
        if (error.message.includes('expired') || error.message.includes('401')) {
          console.log("Token appears to be expired, clearing it");
          clearAuthToken();
        }
      }
    }
    
    // Ensuite essayer sans token
    try {
      console.log("Attempting to fetch without authentication");
      const place = await fetchPlaceDetails(placeId);
      renderPlaceDetails(place);
      setupReviewForm(placeId);
      return;
    } catch (error) {
      console.log("Public access attempt failed:", error.message);
      throw error; 
    }
  } catch (error) {
    console.error("All attempts to fetch place details failed:", error);
    document.getElementById("place-details").innerHTML = `
      <div class="error-message">
        <p>Impossible de récupérer les détails du logement.</p>
        <p>Erreur: ${error.message || "Erreur inconnue"}</p>
        <button onclick="window.location.href='index.html'" class="back-button">Retour à l'accueil</button>
      </div>
    `;
  }
}

// Function to retrieve place details
async function fetchPlaceDetails(placeId, token = null) {
  const headers = {
    "Content-Type": "application/json"
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  const response = await fetch(`http://127.0.0.1:5000/api/v1/places/${placeId}`, {
    method: "GET",
    headers: headers
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    let errorMsg = `Server responded with ${response.status}`;
    
    try {
      // Trying to parse error in json
      const errorJson = JSON.parse(errorText);
      if (errorJson.msg && errorJson.msg.includes("expired")) {
        throw new Error("Token has expired");
      }
      errorMsg = errorJson.error || errorJson.msg || errorMsg;
    } catch (e) {
      // if not json use text
      if (errorText) {
        errorMsg = errorText;
      }
    }
    
    throw new Error(errorMsg);
  }
  
  return await response.json();
}

// Function to show place details
function renderPlaceDetails(place) {
  if (!place) {
    document.getElementById("place-details").innerHTML = "<p>No data to show for this place.</p>";
    return;
  }
  
  const detailsSection = document.getElementById("place-details");
  detailsSection.classList.add("place-details");
  
  // manage amenities
  let amenitiesHtml = "No available amenities";
  if (place.amenities && Array.isArray(place.amenities) && place.amenities.length > 0) {
    const amenityNames = place.amenities.map(a => {
      if (typeof a === 'string') return a;
      return a.name || 'Amenity';
    });
    amenitiesHtml = amenityNames.join(", ");
  }
  
  // manage owner infos
  let ownerHtml = "Unknown owner";
  if (place.owner) {
    const firstName = place.owner.first_name || '';
    const lastName = place.owner.last_name || '';
    if (firstName || lastName) {
      ownerHtml = `${firstName} ${lastName}`.trim();
    }
  }
  
  // Built HTML
  detailsSection.innerHTML = `
    <h1>${place.title || 'Logement'}</h1>
    <p class="place-info"><strong>Description:</strong> ${place.description || 'No description'}</p>
    <p class="place-info"><strong>Prix:</strong> $${place.price} per night</p>
    <p class="place-info"><strong>Latitude:</strong> ${place.latitude}</p>
    <p class="place-info"><strong>Longitude:</strong> ${place.longitude}</p>
    <p class="place-info"><strong>Équipements:</strong> ${amenitiesHtml}</p>
    <p class="place-info"><strong>Hôte:</strong> ${ownerHtml}</p>
  `;
  
  // Show reviews
  renderReviews(place);
}

// Function to show reviews
function renderReviews(place) {
  const reviewsSection = document.getElementById("reviews");
  if (!reviewsSection) return;
  
  // Vérifier si reviews est un tableau
  const reviews = Array.isArray(place.reviews) ? place.reviews : [];
  
  if (reviews.length === 0) {
    reviewsSection.innerHTML = "<h2>Avis</h2><p>No reviews yet. Be the first !</p>";
    return;
  }
  
  reviewsSection.innerHTML = '<h2>Reviews</h2>';
  
  reviews.forEach(review => {
    const reviewCard = document.createElement("div");
    reviewCard.classList.add("review-card");
    
    reviewCard.innerHTML = `
      <p><strong>Utilisateur:</strong> ${review.user_id || 'Anonymous'}</p>
      <p><strong>Note:</strong> ${review.rating}/5</p>
      <p><strong>Commentaire:</strong> ${review.text || 'No comment'}</p>
    `;
    
    reviewsSection.appendChild(reviewCard);
  });
}

// Configurer le formulaire d'avis
function setupReviewForm(placeId) {
  const token = getCookie('token');
  const reviewForm = document.getElementById('review-form');
  const addReviewBtn = document.getElementById('to-add-review-page');
  
  if (!reviewForm) return;
  
  if (token) {
    reviewForm.style.display = 'block';
    if (addReviewBtn) addReviewBtn.style.display = 'none';
    
    reviewForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const reviewText = document.getElementById('review-text').value;
      const rating = document.getElementById('review-rating').value;
      
      try {
        const response = await fetch('http://127.0.0.1:5000/api/v1/reviews/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            text: reviewText,
            rating: parseInt(rating),
            user_id: 'current_user', // À remplacer par l'ID réel si disponible
            place_id: placeId
          })
        });
        
        if (response.ok) {
          alert("Review added successfully!");
          window.location.reload();
        } else {
          // Check for expired token
          if (response.status === 401) {
            const errorData = await response.json();
            if (errorData.msg && errorData.msg.includes("expired")) {
              clearAuthToken();
              alert("Your session expired. Please reconnect.");
              window.location.href = 'login.html';
              return;
            }
          }
          
          throw new Error("Error while sending review");
        }
      } catch (error) {
        console.error("Error submitting review:", error);
        alert("Error while sending review. >Please try again.");
      }
    });
  } else {
    reviewForm.style.display = 'none';
    if (addReviewBtn) {
      addReviewBtn.style.display = 'block';
      addReviewBtn.addEventListener('click', () => {
        window.location.href = 'login.html';
      });
    }
  }
}

// Vérifier l'authentification et gérer les tokens expirés
function checkAndRefreshAuthentication() {
  const token = getCookie('token');
  
  if (token) {
    // Vérifier si le token est valide
    fetch('http://127.0.0.1:5000/api/v1/users/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => {
      if (!response.ok && response.status === 401) {
        // Token invalide ou expiré
        return response.json().then(data => {
          if (data.msg && data.msg.includes("expired")) {
            console.log("Token expired during validation check");
            clearAuthToken();
            updateUIForLoggedOutUser();
          }
        });
      }
    })
    .catch(error => {
      console.error("Error checking token:", error);
    });
  }
  
  updateUIBasedOnAuthStatus();
}

// Mettre à jour l'interface en fonction du statut d'authentification
function updateUIBasedOnAuthStatus() {
  const token = getCookie('token');
  const loginLink = document.getElementById('login-link');
  
  if (loginLink) {
    if (token) {
      loginLink.innerHTML = '<button class="login-button" type="button">Logout</button>';
      loginLink.href = '#';
      loginLink.onclick = function() {
        clearAuthToken();
        window.location.reload();
      };
    } else {
      loginLink.innerHTML = '<button class="login-button" type="button">Login</button>';
      loginLink.href = 'login.html';
    }
  }
}

// Mettre à jour l'interface pour un utilisateur déconnecté
function updateUIForLoggedOutUser() {
  const loginLink = document.getElementById('login-link');
  const reviewForm = document.getElementById('review-form');
  const addReviewBtn = document.getElementById('to-add-review-page');
  
  if (loginLink) {
    loginLink.innerHTML = '<button class="login-button" type="button">Login</button>';
    loginLink.href = 'login.html';
    loginLink.onclick = null;
  }
  
  if (reviewForm) {
    reviewForm.style.display = 'none';
  }
  
  if (addReviewBtn) {
    addReviewBtn.style.display = 'block';
  }
}

// Supprimer le token d'authentification
function clearAuthToken() {
  document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

async function fetchPlaces() {
  console.log("Fetching places...");
  try {
    // Recuperer le token d'auth
    const token = getCookie('token');
    console.log("Token for places request:", token ? "Token exists" : "No token");

    const headers = {
      'Content-Type': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Send request to API
    console.log("Sending request to API...");
    const response = await fetch('http://127.0.0.1:5000/api/v1/places/', {
      method: 'GET',
      headers: headers
    });

    console.log("Response status:", response.status);

    if (!response.ok) {
      throw new Error(`Error while retrieving places: ${response.status}`);
    }

    // convert response to json
    const placesData = await response.json();
    console.log("Places data received:", placesData.length, "places");

    // Show places
    displayPlaces(placesData);

    return placesData;
  } catch (error) {
    console.error("Error while retrieving places:", error);

    // Show error message to user
    const placesListSection = document.getElementById('places-list');
    if (placesListSection) {
      placesListSection.innerHTML = `
        <div class="error-message">
          <p>Impossible to fetch places list.</p>
          <p>${error.message}</p>
        </div>
      `;
    } 
  }
}

// Récupérer un cookie par son nom
function getCookie(name) {
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith(name + '=')) {
      return cookie.substring((name + '=').length);
    }
  }
  return null;
}

function displayPlaces(places) {
  console.log("Displaying places:", places); // Afficher les données brutes pour déboguer
  // Retrieve section containing places
  const placesListSection = document.getElementById('place-list');
  if (!placesListSection) return;

  // Empty actuel content
  placesListSection.innerHTML = '';

  if (!places || places.length === 0) {
    placesListSection.innerHTML = '<p>No places available at the moment.</p>';
    return;
  }

  places.forEach(place => {
    console.log("Place data:", place); // Afficher chaque logement pour déboguer
    // Create a car with place infos
    const placeCard = document.createElement('div');
    placeCard.classname = 'place-card';
    // Gérer le cas où le prix n'est pas défini
    const price = place.price !== undefined ? `${place.price}€` : 'Prix non spécifié';
    placeCard.setAttribute('data-price', place.price || 0); // Pour le filtrage

    // Fill card with place infos
    placeCard.innerHTML = `
      <h2>${place.title || 'No title'}</h2>
      <p>${place.description || 'No description available'}</p>
      <p>Price per night: ${price}€</p>
      <button class="details-button" data-id="${place.id}">View details</button>
      `;

      // Add card to section
      placesListSection.appendChild(placeCard);
  });

  // Add eventlistener to view details buttons
  setupDetailsButtons();
}

// Config buttons 'view details'
function setupDetailsButtons() {
  const detailButtons = document.querySelectorAll('.details-button');

  detailButtons.forEach(button => {
    button.addEventListener('click', function() {
      const placeId = this.getAttribute('data-id');
      if (placeId) {
        // Redirect to details page with place id
        window.location.href = `place.html?id=${placeId}`;
      }
    });
  })
}