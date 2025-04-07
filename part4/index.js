/* 
  This is a SAMPLE FILE to get you started.
  Please, follow the project instructions to complete the tasks.
*/

document.addEventListener('DOMContentLoaded', () => {
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
});