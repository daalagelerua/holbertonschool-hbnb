const placesData = {
  1: {
    title: "Cloudy Floating Hut",
    description: "A peaceful retreat in the clouds.",
    price: 620,
    latitude: 45.123,
    longitude: 5.678,
    amenities: ["Blue Sky", "Wi-Fi", "Hot Tub"],
    owner_id: "Zeus"
  },
  2: {
    title: "Underground Moutain Cavern",
    description: "Enjoy the echo of the cave and the beautiful indoor waterfall.",
    price: 185,
    latitude: 42.456,
    longitude: 3.141,
    amenities: ["Indoor Pool", "Air Conditioning", "Breakfast"],
    owner_id: "Ourea"
  },
  3: {
    title: "Subaquatic Turtle Studio",
    description: "Stunning fish sighting from the sea bed.",
    price: 385,
    latitude: 47.159,
    longitude: 9.753,
    amenities: ["Mermaid Pole Dance", "Air Tank", "Unlimited Seafood"],
    owner_id: "Poseidon"
  }
};

document.addEventListener('DOMContentLoaded', () => {
    // get the parameters from place in a dict format
    const params = new URLSearchParams(window.location.search);
    // get the value of id
    const placeId = params.get("id");
    // get the complete data of the place
    const place = placesData[placeId];

    // if place doesn't exist print an error
    if (!place) { // innerHTML: get full code from html or update its content like below
      document.getElementById("place-details").innerHTML = "<p>Place not found.</p>";
      return;
    }

    const detailsSection = document.getElementById("place-details");
    detailsSection.classList.add("place-details"); // volontary redondancy to ensure class exists

    detailsSection.innerHTML = `
    <h1>${place.title}</h1>
    <p class="place-info"><strong>Description:</strong> ${place.description}</p>
    <p class="place-info"><strong>Price:</strong> $${place.price} per night</p>
    <p class="place-info"><strong>Latitude:</strong> $${place.latitude}</p>
    <p class="place-info"><strong>Longitude:</strong> $${place.longitude}</p>
    <p class="place-info"><strong>Amenities:</strong> ${place.amenities.join(", ")}</p>
    <p class="place-info"><strong>Host:</strong> ${place.owner_id}</p>
  `;

  // Reviews section
  const reviewsSection = document.getElementById("reviews");

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
  if (isUserLoggedIn()) { // Remplace cette fonction par ton propre contrôle de connexion
    const addReviewSection = document.getElementById("add-review");
    addReviewSection.style.display = "block";
  }

  const reviewForm = document.getElementById('review-form');
  if (reviewForm) {
      reviewForm.addEventListener('submit', function (e) {
          e.preventDefault(); // prevent default behavior (page reload)

          const reviewText = document.getElementById('review').value;
          const rating = document.getElementById('rating').value;
          const placeId = new URLSearchParams(window.location.search).get('id');

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
});