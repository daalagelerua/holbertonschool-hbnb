document.addEventListener('DOMContentLoaded', () => {
  // Check authentication status
  checkAuthentication();

  // Get place ID from URL
  const params = new URLSearchParams(window.location.search);
  const placeId = params.get("id");
  
  if (!placeId) {
    showError("Place ID is missing. Please go back to the places list.");
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
  
  // Fetch place details
  fetchPlaceDetails(placeId);

  // Setup review section
  setupReviewSection(placeId);
});

function showError(message) {
  const detailsSection = document.getElementById("place-details");
  const loadingIndicator = document.getElementById("loading-indicator");
  
  if (loadingIndicator) {
    loadingIndicator.style.display = 'none';
  }
  
  if (detailsSection) {
    detailsSection.innerHTML = `
      <div class="error-message">
        <p><i class="fas fa-exclamation-triangle"></i> ${message}</p>
        <button onclick="window.location.href='index.html'" class="back-button">
          <i class="fas fa-home"></i> Back to Home
        </button>
      </div>
    `;
  }
}

function checkAuthentication() {
  const token = getCookie('token');
  const loginLink = document.getElementById('login-link');
  
  if (token) {
    // Check if token is valid (not expired)
    try {
      const tokenData = parseJwt(token);
      const currentTime = Math.floor(Date.now() / 1000);
      
      if (tokenData.exp && tokenData.exp < currentTime) {
        // Token is expired
        clearAuthToken();
        updateUIForLoggedOutUser();
        return false;
      }
      
      // Token is valid
      updateUIForLoggedInUser();
      return true;
    } catch (e) {
      console.error("Error checking token:", e);
      clearAuthToken();
      updateUIForLoggedOutUser();
      return false;
    }
  } else {
    updateUIForLoggedOutUser();
    return false;
  }
}

function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
  return JSON.parse(jsonPayload);
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

function clearAuthToken() {
  document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

function updateUIForLoggedInUser() {
  const loginLink = document.getElementById('login-link');
  const addReviewButton = document.getElementById('to-add-review-page');
  
  if (loginLink) {
    loginLink.innerHTML = '<button class="login-button" type="button">Logout</button>';
    loginLink.onclick = function(e) {
      e.preventDefault();
      clearAuthToken();
      window.location.reload();
    };
  }
  
  // Show the add review form or button
  const reviewForm = document.getElementById('review-form');
  if (reviewForm) {
    reviewForm.style.display = 'block';
  }
  
  if (addReviewButton) {
    addReviewButton.style.display = 'none';
  }
}

function updateUIForLoggedOutUser() {
  const loginLink = document.getElementById('login-link');
  
  if (loginLink) {
    loginLink.innerHTML = '<button class="login-button" type="button">Login</button>';
    loginLink.href = 'login.html';
  }
  
  // Hide review form, show add review button
  const reviewForm = document.getElementById('review-form');
  if (reviewForm) {
    reviewForm.style.display = 'none';
  }
  
  const addReviewButton = document.getElementById('to-add-review-page');
  if (addReviewButton) {
    addReviewButton.style.display = 'block';
    // Add event listener to redirect to login page when clicked
    addReviewButton.onclick = function() {
      const placeId = new URLSearchParams(window.location.search).get("id");
      window.location.href = `login.html?redirect=add_review.html?id=${placeId}`;
    };
  }
}

async function fetchPlaceDetails(placeId) {
  try {
    const token = getCookie('token');
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`http://127.0.0.1:5000/api/v1/places/${placeId}`, {
      method: 'GET',
      headers: headers
    });
    
    if (!response.ok) {
      // Handle 401 Unauthorized error (expired token)
      if (response.status === 401 && token) {
        clearAuthToken();
        showError("Your session has expired. Please login again.");
        return;
      }
      
      const errorText = await response.text();
      let errorMessage = `Server error: ${response.status}`;
      
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error || errorJson.message || errorMessage;
      } catch (e) {
        // If not JSON, use the text
        if (errorText) {
          errorMessage = errorText;
        }
      }
      
      throw new Error(errorMessage);
    }
    
    const placeData = await response.json();
    displayPlaceDetails(placeData);
    
  } catch (error) {
    console.error("Error fetching place details:", error);
    showError(`Failed to load place details: ${error.message}`);
  }
}

function displayPlaceDetails(place) {
  const detailsSection = document.getElementById("place-details");
  const loadingIndicator = document.getElementById("loading-indicator");
  
  console.log("Raw place object for details:", place);
  console.log("Description property:", place.description);

  if (loadingIndicator) {
    loadingIndicator.style.display = 'none';
  }
  
  if (!detailsSection) return;
  
  if (!place || !place.id) {
    showError("Invalid place data received from server.");
    return;
  }
  
  // Format price
  const price = place.price !== undefined ? `$${place.price}` : 'Price not available';
  
  // Get description or default
  const description = place.description || 'No description available';
  
  // Handle amenities
  let amenitiesHtml = '<p>No amenities listed</p>';
  if (place.amenities && place.amenities.length > 0) {
    const amenitiesList = place.amenities.map(amenity => {
      return typeof amenity === 'string' 
        ? `<li>${amenity}</li>` 
        : `<li>${amenity.name || 'Unnamed amenity'}</li>`;
    }).join('');
    
    amenitiesHtml = `<ul class="amenities-list">${amenitiesList}</ul>`;
  }
  
  // Handle owner information
  let ownerInfo = 'Unknown owner';
  if (place.owner) {
    const firstName = place.owner.first_name || '';
    const lastName = place.owner.last_name || '';
    if (firstName || lastName) {
      ownerInfo = `${firstName} ${lastName}`.trim();
    }
  }
  
  // Create place details HTML without a placeholder image that might cause errors
  detailsSection.innerHTML = `
    <div class="place-image" style="background-color: #f5f5f5; height: 300px; display: flex; align-items: center; justify-content: center;">
      <i class="fas fa-home" style="font-size: 64px; color: #ddd;"></i>
    </div>
    
    <h1 class="place-title">
      <i class="fas fa-home"></i> ${place.title || 'Unnamed Place'}
    </h1>
    
    <div class="place-info-container">
      <p class="place-info">
        <i class="fas fa-tag"></i> <strong>Price:</strong> ${price} per night
      </p>
      <p class="place-info">
        <i class="fas fa-map-marker-alt"></i> <strong>Location:</strong> ${place.latitude}, ${place.longitude}
      </p>
      <p class="place-info">
        <i class="fas fa-user"></i> <strong>Host:</strong> ${ownerInfo}
      </p>
    </div>
    
    <div class="place-description">
      <h2><i class="fas fa-info-circle"></i> Description</h2>
      <p>${description}</p>
    </div>
    
    <div class="place-amenities">
      <h2><i class="fas fa-concierge-bell"></i> Amenities</h2>
      ${amenitiesHtml}
    </div>
  `;
  
  
  fetchPlaceReviews(place.id);
}

async function fetchPlaceReviews(placeId) {
  try {
    const token = getCookie('token');
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    console.log(`Fetching reviews for place ${placeId}`);
    
    // Try first with the plural endpoint
    let response = await fetch(`http://127.0.0.1:5000/api/v1/reviews/places/${placeId}/reviews`, {
      method: 'GET',
      headers: headers
    });
    
    // If that fails, try the singular endpoint
    if (!response.ok) {
      console.log(`Plural endpoint failed, trying singular endpoint`);
      response = await fetch(`http://127.0.0.1:5000/api/v1/reviews/${placeId}`, {
        method: 'GET',
        headers: headers
      });
      
      if (!response.ok) {
        console.warn(`Failed to fetch reviews: ${response.status}`);
        // Don't throw error for reviews, just show empty reviews section
        displayReviews([]);
        return;
      }
    }
    
    const reviewsData = await response.json();
    console.log("Reviews data:", reviewsData);
    
    // If we got a single review object
    if (reviewsData && typeof reviewsData === 'object' && reviewsData.id) {
      displayReviews([reviewsData]); // Pass it as an array with one item
    } 
    // If we got an array of reviews
    else if (Array.isArray(reviewsData)) {
      displayReviews(reviewsData);
    }
    // If the data structure is something else (maybe a wrapper object)
    else if (reviewsData && typeof reviewsData === 'object') {
      // Check for common response structures
      if (reviewsData.reviews && Array.isArray(reviewsData.reviews)) {
        displayReviews(reviewsData.reviews);
      } else if (reviewsData.data && Array.isArray(reviewsData.data)) {
        displayReviews(reviewsData.data);
      } else if (reviewsData.results && Array.isArray(reviewsData.results)) {
        displayReviews(reviewsData.results);
      } else {
        // Try to extract any array or review-like objects
        const possibleReviews = Object.values(reviewsData).filter(
          val => Array.isArray(val) || (typeof val === 'object' && val !== null && 'text' in val)
        );
        
        if (possibleReviews.length > 0) {
          displayReviews(Array.isArray(possibleReviews[0]) ? possibleReviews[0] : possibleReviews);
        } else {
          displayReviews([]);
        }
      }
    } else {
      displayReviews([]);
    }
  } catch (error) {
    console.error("Error fetching reviews:", error);
    displayReviews([]);
  }
}

function displayReviews(reviews) {
  const reviewsSection = document.getElementById('reviews');
  if (!reviewsSection) return;
  
  console.log("Displaying reviews:", reviews);
  
  reviewsSection.innerHTML = '<h2><i class="fas fa-comments"></i> Reviews</h2>';
  
  // Make sure reviews is an array and has elements
  if (!Array.isArray(reviews) || reviews.length === 0 || 
      (reviews.length === 1 && Object.keys(reviews[0]).length === 0)) {
    reviewsSection.innerHTML += '<p>No reviews yet. Be the first to leave a review!</p>';
    return;
  }
  
  let reviewsCount = 0;
  
  reviews.forEach(review => {
    // Skip empty or invalid reviews
    if (!review || typeof review !== 'object' || (!review.text && !review.rating)) {
      return;
    }
    
    reviewsCount++;
    const reviewCard = document.createElement('div');
    reviewCard.className = 'review-card';
    
    // Format review data
    const rating = review.rating || 0;
    const text = review.text || 'No comment provided';
    const userId = review.user_id || 'Anonymous';
    
    // Create stars display
    let starsHtml = '';
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        starsHtml += '<span class="star filled">★</span>';
      } else {
        starsHtml += '<span class="star">☆</span>';
      }
    }
    
    reviewCard.innerHTML = `
      <div class="review-header">
        <p class="review-author"><i class="fas fa-user-circle"></i> ${userId}</p>
        <div class="review-rating">${starsHtml}</div>
      </div>
      <div class="review-content">
        <p>${text}</p>
      </div>
    `;
    
    reviewsSection.appendChild(reviewCard);
  });
  
  // If after filtering we end up with no valid reviews
  if (reviewsCount === 0) {
    reviewsSection.innerHTML += '<p>No reviews yet. Be the first to leave a review!</p>';
  }
}

function setupReviewSection(placeId) {
  const isAuthenticated = checkAuthentication();
  const addReviewSection = document.getElementById('add-review');
  
  if (!addReviewSection) return;
  
  const reviewForm = document.getElementById('review-form');
  const addReviewButton = document.getElementById('to-add-review-page');
  
  if (isAuthenticated) {
    // Show review form for authenticated users
    if (reviewForm) {
      reviewForm.style.display = 'block';
      reviewForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        await submitReview(placeId);
      });
    }
    
    if (addReviewButton) {
      addReviewButton.style.display = 'none';
    }
  } else {
    // Show button to login for unauthenticated users
    if (reviewForm) {
      reviewForm.style.display = 'none';
    }
    
    if (addReviewButton) {
      addReviewButton.style.display = 'block';
      addReviewButton.addEventListener('click', function() {
        window.location.href = `login.html?redirect=add_review.html?id=${placeId}`;
      });
    }
  }
}

async function submitReview(placeId) {
  try {
    const token = getCookie('token');
    if (!token) {
      alert('You must be logged in to submit a review');
      window.location.href = `login.html?redirect=place.html?id=${placeId}`;
      return;
    }
    
    const rating = document.getElementById('review-rating')?.value;
    const text = document.getElementById('review-text')?.value;
    
    if (!rating || !text) {
      alert('Please provide both a rating and review text');
      return;
    }
    
    // Get user ID from token
    const userData = parseJwt(token);
    const userId = userData.sub;
    
    if (!userId) {
      alert('Unable to identify user. Please login again.');
      clearAuthToken();
      window.location.reload();
      return;
    }
    
    const response = await fetch('http://127.0.0.1:5000/api/v1/reviews/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        text: text,
        rating: parseInt(rating),
        user_id: userId,
        place_id: placeId
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to submit review');
    }
    
    // Success! Reload the page to show the new review
    alert('Review submitted successfully!');
    window.location.reload();
    
  } catch (error) {
    console.error('Error submitting review:', error);
    alert(`Error submitting review: ${error.message}`);
  }
}
