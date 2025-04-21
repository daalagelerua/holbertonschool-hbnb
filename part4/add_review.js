document.addEventListener('DOMContentLoaded', function() {
  // Check authentication
  const token = getCookie('token');
  if (!token) {
      // Redirect to login page if not authenticated
      window.location.href = 'login.html?redirect=add_review.html';
      return;
  }

  // Update UI based on authentication status
  updateUIBasedOnAuthStatus();
  
  // Get place ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const placeId = urlParams.get('id');
  
  if (!placeId) {
      showError('No place ID specified. Please go back to the places list and select a place.');
      document.getElementById('review-form').style.display = 'none';
      return;
  }
  
  // Store place ID in hidden field
  document.getElementById('place-id').value = placeId;
  
  // Fetch place details to show what place is being reviewed
  fetchPlaceDetails(placeId);
  
  // Set up form submission
  const reviewForm = document.getElementById('review-form');
  if (reviewForm) {
      reviewForm.addEventListener('submit', function(e) {
          e.preventDefault();
          submitReview(placeId);
      });
  }
});

// Get cookie by name
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

// Update UI based on authentication status
function updateUIBasedOnAuthStatus() {
  const token = getCookie('token');
  const loginLink = document.getElementById('login-link');
  const logoutLink = document.getElementById('logout-link');
  
  if (token) {
      // User is logged in
      if (loginLink) loginLink.style.display = 'none';
      if (logoutLink) {
          logoutLink.style.display = 'block';
          logoutLink.onclick = function(e) {
              e.preventDefault();
              document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
              window.location.href = 'index.html';
          };
      }
  } else {
      // User is not logged in
      if (loginLink) loginLink.style.display = 'block';
      if (logoutLink) logoutLink.style.display = 'none';
  }
}

// Fetch place details from API
async function fetchPlaceDetails(placeId) {
  try {
      const token = getCookie('token');
      const response = await fetch(`http://127.0.0.1:5000/api/v1/places/${placeId}`, {
          method: 'GET',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': token ? `Bearer ${token}` : ''
          }
      });
      
      if (!response.ok) {
          throw new Error(`Failed to fetch place details: ${response.status}`);
      }
      
      const place = await response.json();
      displayPlaceInfo(place);
  } catch (error) {
      console.error('Error fetching place details:', error);
      showError(`Error loading place details: ${error.message}`);
  }
}

// Display place information
function displayPlaceInfo(place) {
  const placeInfoDiv = document.getElementById('place-info');
  if (placeInfoDiv) {
      placeInfoDiv.innerHTML = `
          <div class="place-card">
              <h2>You are reviewing: ${place.title || 'Unnamed place'}</h2>
              <p>${place.description || 'No description available'}</p>
              <p>Price per night: $${place.price}</p>
          </div>
      `;
  }
}

// Submit review to API
async function submitReview(placeId) {
  try {
      const token = getCookie('token');
      if (!token) {
          showError('You must be logged in to submit a review.');
          return;
      }
      
      const rating = document.getElementById('rating').value;
      const reviewText = document.getElementById('review').value;
      
      if (!reviewText.trim()) {
          showError('Please enter a review text.');
          return;
      }
      
      // Fetch the current user ID 
      const userInfo = await fetchCurrentUser(token);
      if (!userInfo) {
          throw new Error('Could not retrieve user information');
      }
      
      const userId = userInfo.id;
      
      const response = await fetch('http://127.0.0.1:5000/api/v1/reviews/', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
              text: reviewText,
              rating: parseInt(rating),
              user_id: userId,
              place_id: placeId
          })
      });
      
      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to submit review');
      }
      
      // Show success message and redirect
      alert('Review submitted successfully!');
      window.location.href = `place.html?id=${placeId}`;
  } catch (error) {
      console.error('Error submitting review:', error);
      showError(`Error submitting review: ${error.message}`);
  }
}

// Fetch current user info
async function fetchCurrentUser(token) {
  try {
      // Since we're having issues with /users/ endpoint, let's try another approach
      // Decode the JWT token to get user information
      const payload = parseJwt(token);
      return { 
          id: payload.sub,
          email: payload.email,
          is_admin: payload.is_admin
      };
  } catch (error) {
      console.error('Error fetching user info:', error);
      return null;
  }
}

// Parse JWT token
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
      return null;
  }
}

// Show error message
function showError(message) {
  const errorElement = document.getElementById('error-message');
  if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
  }
}