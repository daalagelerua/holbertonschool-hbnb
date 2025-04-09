document.addEventListener('DOMContentLoaded', () => {
  checkAuthentication();

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
  

  const token = getCookie('token');
  const reviewForm = document.getElementById('review-form');

  if (token && reviewForm) {
    reviewForm.style.display = 'block';  // Afficher le formulaire si connecté
  } else if (reviewForm) {
    reviewForm.style.display = 'none';  // Cacher le formulaire si non connecté
  }

    // get the parameters from place in a dict format
    const params = new URLSearchParams(window.location.search);
    // get the value of id
    const placeId = params.get("id");
    
    // Fetch the place details from the API using the placeId
    fetch(`http://127.0.0.1:5000/api/v1/places/${placeId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    })
      .then(response => response.json())
      .then(place => {
        // if place doesn't exist print an error
        if (!place) { // innerHTML: get full code from html or update its content like below
          document.getElementById("place-details").innerHTML = "<p>Place not found.</p>";
          return;
        }

    const detailsSection = document.getElementById("place-details");
    detailsSection.classList.add("place-details"); // volontary redondancy to ensure class exists

    detailsSection.innerHTML = `
    <h1>${place.title}</h1>
    <p class="place-info"><strong>Description:</strong> ${place.description || 'No description available'}</p>
    <p class="place-info"><strong>Price:</strong> $${place.price} per night</p>
    <p class="place-info"><strong>Latitude:</strong> ${place.latitude}</p>
    <p class="place-info"><strong>Longitude:</strong> ${place.longitude}</p>
    <p class="place-info"><strong>Amenities:</strong> ${place.amenities ? place.amenities.join(", ") : 'No amenities available'}</p>
    <p class="place-info"><strong>Host:</strong> ${place.owner ? place.owner.first_name + ' ' + place.owner.last_name : 'No host information'}</p>
  `;

  // Reviews section
  const reviewsSection = document.getElementById("reviews");

  const reviews = place.reviews || [];

  if (reviews.length === 0) {
    reviewsSection.innerHTML = "<p>No reviews yet. Be the first to add one!</p>";
  } else {
    reviewsSection.innerHTML = '';
    reviews.forEach(review => {
      const reviewCard = document.createElement("div");
      reviewCard.classList.add("review-card");

      reviewCard.innerHTML = `
        <p><strong>User:</strong> ${review.username}</p>
        <p><strong>Rating:</strong> ${review.rating}/5</p>
        <p><strong>Comment:</strong> ${review.comment}</p>
      `;

      reviewsSection.appendChild(reviewCard);
    });
  }

  // show the review form if user is connected
  //if (isUserLoggedIn()) { // Remplace cette fonction par ton propre contrôle de connexion
  //  const addReviewSection = document.getElementById("add-review");
  //  addReviewSection.style.display = "block";
 // }

  // Handle adding a new review
  const reviewForm = document.getElementById('review-form');
  if (reviewForm) {
      reviewForm.addEventListener('submit', function (e) {
          e.preventDefault(); // prevent default behavior (page reload)

          const reviewText = document.getElementById('review').value;
          const rating = document.getElementById('rating').value;

          // Simulate adding a review
          const newReview = {
              reviewText,
              rating: parseInt(rating)
          };

          // Ajouter l'avis à la place spécifique
          console.log(`Review added for place ${placeId}:`, newReview);

          // Redirect to place.html with given ID after adding
          window.location.href = `place.html?id=${placeId}`;
      });
  }
})
.catch(error => {
  console.error('Error fetching place details:', error);
  document.getElementById('place-details').innerHTML = "<p>Place not found.</p>";
});
});
