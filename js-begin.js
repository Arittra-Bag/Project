document.addEventListener('DOMContentLoaded', () => {
    const apiKey = 'YzbvUkbxukWA42ZdCxVxjlE4cWySckrW5eZxKpIs';
    const apiUrl = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}`;
  
    const nasaImage = document.getElementById('nasa-image');
    const refreshButton = document.getElementById('refresh-button');
  
    // Function to fetch a new image from the API
    const fetchImage = () => {
      fetch(apiUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          nasaImage.src = data.url;
        })
        .catch(error => {
          console.error('There was a problem fetching the data:', error);
        });
    };
  
    // Call fetchImage once on page load to display the initial image
    fetchImage();
  
    // Add event listener to refresh button to fetch a new image when clicked
    refreshButton.addEventListener('click', fetchImage);
  });
  