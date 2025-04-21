// Global variables
let placeId;
let authToken;

// Document ready function
document.addEventListener('DOMContentLoaded', function() {
  console.log('Page URL:', window.location.href);
  console.log('Search params:', window.location.search);
    // Get place ID from URL
    placeId = getPlaceIdFromURL();

    console.log('Extracted place ID:', placeId);
    
    if (!placeId) {
        displayError('No place ID found in URL');
        return;
    }
    
    // Check authentication
    authToken = getCookie('token');
    handleAuthenticationState();
    
    // Fetch place details
    fetchPlaceDetails();
    
    // Setup review form submission
    setupReviewForm();
});

/**
 * Extract place ID from URL query parameters
 * @returns {string|null} The place ID or null if not found
 */
function getPlaceIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id') || urlParams.get('place_id') || urlParams.get('placeId');
}

/**
 * Get cookie value by name
 * @param {string} name - Name of the cookie
 * @returns {string|null} Cookie value or null if not found
 */
function getCookie(name) {
    const cookieArr = document.cookie.split(';');
    
    for (let i = 0; i < cookieArr.length; i++) {
        const cookiePair = cookieArr[i].split('=');
        const cookieName = cookiePair[0].trim();
        
        if (cookieName === name) {
            return decodeURIComponent(cookiePair[1]);
        }
    }
    
    return null;
}

/**
 * Handle UI elements based on authentication state
 */
function handleAuthenticationState() {
    const addReviewSection = document.getElementById('add-review');
    const loginPrompt = document.getElementById('login-prompt');
    
    if (!authToken) {
        // User is not authenticated
        if (addReviewSection) {
            addReviewSection.style.display = 'none';
        }
        if (loginPrompt) {
            loginPrompt.style.display = 'block';
        }
    } else {
        // User is authenticated
        if (addReviewSection) {
            addReviewSection.style.display = 'block';
        }
        if (loginPrompt) {
            loginPrompt.style.display = 'none';
        }
    }
}

/**
 * Fetch place details from API
 */
async function fetchPlaceDetails() {
    try {
        const url = `http://127.0.0.1:5000/api/v1/places/${placeId}`;
        const headers = {
            'Content-Type': 'application/json'
        };
        
        // Add authorization header if token exists
        if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
        }
        
        console.log('Requesting from URL:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: headers
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const placeData = await response.json();
        displayPlaceDetails(placeData);
    } catch (error) {
        console.error('Error fetching place details:', error);
        displayError('Failed to load place details. Please try again later.');
    }
}

/**
 * Display place details in the UI
 * @param {Object} place - Place data from API
 */
function displayPlaceDetails(place) {
    const placeDetailsContainer = document.getElementById('place-details');
    
    if (!placeDetailsContainer) {
        console.error('Place details container not found');
        return;
    }
    
    // Clear previous content
    placeDetailsContainer.innerHTML = '';
    
    // Create place details HTML
    const detailsHTML = `
        <div class="place-header">
            <h1>${place.name}</h1>
            <div class="place-price">${formatPrice(place.price)}</div>
        </div>
        
        <div class="place-description">
            <p>${place.description}</p>
        </div>
        
        ${place.image ? `<div class="place-image">
            <img src="${place.image}" alt="${place.name}">
        </div>` : ''}
        
        <div class="place-amenities">
            <h2>Amenities</h2>
            <ul class="amenities-list">
                ${displayAmenities(place.amenities)}
            </ul>
        </div>
        
        <div class="place-reviews">
            <h2>Reviews</h2>
            ${place.reviews && place.reviews.length > 0 ? displayReviews(place.reviews) : '<p>No reviews yet. Be the first to leave a review!</p>'}
        </div>
    `;
    
    placeDetailsContainer.innerHTML = detailsHTML;
}

/**
 * Format amenities into list items
 * @param {Array} amenities - List of amenities
 * @returns {string} HTML string of amenity list items
 */
function displayAmenities(amenities) {
    if (!amenities || amenities.length === 0) {
        return '<li>No amenities listed</li>';
    }
    
    return amenities.map(amenity => `<li>${amenity}</li>`).join('');
}

/**
 * Format reviews into HTML
 * @param {Array} reviews - List of review objects
 * @returns {string} HTML string of reviews
 */
function displayReviews(reviews) {
    if (!reviews || reviews.length === 0) {
        return '<p>No reviews yet.</p>';
    }
    
    const reviewsHTML = reviews.map(review => {
        return `
            <div class="review">
                <div class="review-header">
                    <span class="review-author">${review.user_name || 'Anonymous'}</span>
                    <span class="review-date">${formatDate(review.created_at)}</span>
                </div>
                <div class="review-rating">
                    ${displayStars(review.rating)}
                </div>
                <div class="review-text">
                    <p>${review.text}</p>
                </div>
            </div>
        `;
    }).join('');
    
    return reviewsHTML;
}

/**
 * Display star rating
 * @param {number} rating - Rating value (1-5)
 * @returns {string} HTML for star rating
 */
function displayStars(rating) {
    const fullStar = '<span class="star full">★</span>';
    const emptyStar = '<span class="star empty">☆</span>';
    
    rating = Math.round(rating);
    let stars = '';
    
    for (let i = 1; i <= 5; i++) {
        stars += i <= rating ? fullStar : emptyStar;
    }
    
    return stars;
}

/**
 * Format price with currency symbol
 * @param {number|string} price - Price value
 * @returns {string} Formatted price
 */
function formatPrice(price) {
    if (!price) return 'Price not available';
    
    // Convert to number if it's a string
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    
    return `$${numPrice.toFixed(2)} / night`;
}

/**
 * Format date to readable string
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
function formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * Display error message
 * @param {string} message - Error message to display
 */
function displayError(message) {
    const placeDetailsContainer = document.getElementById('place-details');
    
    if (placeDetailsContainer) {
        placeDetailsContainer.innerHTML = `
            <div class="error-message">
                <p>${message}</p>
                <a href="index.html" class="btn">Go back to listings</a>
            </div>
        `;
    }
}

/**
 * Setup review form submission
 */
function setupReviewForm() {
    const reviewForm = document.getElementById('review-form');
    
    if (reviewForm) {
        reviewForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            
            const ratingInput = document.getElementById('rating');
            const reviewTextInput = document.getElementById('review-text');
            
            if (!ratingInput || !reviewTextInput) {
                alert('Form elements not found');
                return;
            }
            
            const rating = parseInt(ratingInput.value);
            const text = reviewTextInput.value.trim();
            
            // Validate inputs
            if (isNaN(rating) || rating < 1 || rating > 5) {
                alert('Please select a rating between 1 and 5');
                return;
            }
            
            if (!text) {
                alert('Please enter a review text');
                return;
            }
            
            // Submit review
            await submitReview(rating, text);
        });
    }
}

/**
 * Submit a new review to the API
 * @param {number} rating - Rating value (1-5)
 * @param {string} text - Review text
 */
async function submitReview(rating, text) {
    try {
        if (!authToken) {
            alert('You must be logged in to submit a review');
            return;
        }
        
        const response = await fetch(`/api/places/${placeId}/reviews`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                rating: rating,
                text: text
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        // Clear form
        document.getElementById('rating').value = '5';
        document.getElementById('review-text').value = '';
        
        // Refresh place details to show the new review
        fetchPlaceDetails();
        
        alert('Review submitted successfully!');
    } catch (error) {
        console.error('Error submitting review:', error);
        alert('Failed to submit review. Please try again later.');
    }
}
