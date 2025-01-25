const emergencies = [
  

"Sakit Dada yang Teruk (Serangan Jantung)",
"Luka Terbakar",  
"Keracunan",  
"Pengambilan Dadah Berlebihan",  
"Kecemasan Diabetes",  
"Lemas",  
"Strok Haba",  
"Hipotermia",  
"Strok (Kecederaan Cerebrovaskular)",
"Reaksi Alergi Teruk (Anaphylaxis)",
"Serangan Asma",
"Tercekik",
"Pendarahan Teruk (Hemorrhage)",
"Kecederaan Kepala",
"Sawan",
"Kejutan (Shock)",
"Patah Tulang (Fraktur)",
"Jantung Terhenti (Cardiac Arrest)",
"Sakit Dada (Angina)",
"Radang Apendiks (Appendicitis)",
"Sakit Perut Teruk",
"Kecederaan Tulang Belakang",
"Kecederaan Mata",
"Renjatan Elektrik",
"Eklampsia (Tekanan Darah Tinggi Berkaitan Kehamilan)",
"Pneumotoraks (Paru-paru Terkempis)",
"Pengsan (Syncope)"


];

document.addEventListener("DOMContentLoaded", function() {
  const searchInput = document.getElementById("emergencySearch");
  const emergencyList = document.getElementById("emergencyList");

  if (searchInput) {
    searchInput.addEventListener("input", function() {
      const searchText = this.value.toLowerCase();
      const matchingEmergencies = emergencies.filter(emergency =>
        emergency.toLowerCase().includes(searchText)
      );

      emergencyList.innerHTML = "";  // Clear previous options

      if (searchText && matchingEmergencies.length > 0) {
        matchingEmergencies.forEach(emergency => {
          const option = document.createElement("div");
          
          // Highlight the matched text in the option
          const startIdx = emergency.toLowerCase().indexOf(searchText);
          const highlightedText = emergency.substring(0, startIdx) + 
            "<strong>" + emergency.substring(startIdx, startIdx + searchText.length) + "</strong>" +
            emergency.substring(startIdx + searchText.length);
          
          option.innerHTML = highlightedText;
          option.addEventListener("click", function() {
            searchInput.value = emergency;
            emergencyList.innerHTML = "";  // Clear the list after selection
          });
          emergencyList.appendChild(option);
        });
      } else {
        const noMatchOption = document.createElement("div");
        noMatchOption.classList.add("no-matches");
        noMatchOption.textContent = "No matching emergencies found.";
        emergencyList.appendChild(noMatchOption);
      }
    });

    document.getElementById("emergencyForm").addEventListener("submit", function(event) {
      event.preventDefault();
      const selectedEmergency = searchInput.value;
      window.location.href = `second_pageBM.html?emergency=${encodeURIComponent(selectedEmergency)}`;
    });
  }
});


document.addEventListener("DOMContentLoaded", function() {
  const urlParams = new URLSearchParams(window.location.search);
  const selectedEmergency = urlParams.get("emergency");
  const instructionsDiv = document.getElementById("instructions");

  // Fetch instructions from the JSON file
  fetch('instructionsBM.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch instructions.');
      }
      return response.json();
    })
    .then(data => {
      const emergencyInstructions = data[selectedEmergency.toLowerCase()];
      if (emergencyInstructions) {
        instructionsDiv.innerHTML = `
  <div class="alert alert-danger">
    <i class="fas fa-phone-alt"></i> <strong>Kecemasan!</strong> ${emergencyInstructions.emergency}
  </div>
  <div class="alert alert-info">
    <i class="fas fa-info-circle"></i> <h5>Langkah-langkah yang perlu diambil sementara menunggu ambulans tiba:</h5>
  </div>
`;

// Append each instruction separately
emergencyInstructions.steps.forEach(step => {
  const stepDiv = document.createElement('div');
  stepDiv.classList.add('instruction-box');
  stepDiv.textContent = step;
  instructionsDiv.appendChild(stepDiv);
});

      } else {
        instructionsDiv.innerHTML = "No instructions available for this emergency.";
      }
    })
    .catch(error => {
      console.error('Error loading instructions:', error);
      instructionsDiv.innerHTML = "Failed to load instructions.";
    });
});


// Initialize the map and find nearby hospitals
function initMap() {
  // Check if the user's browser supports geolocation
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      const userLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      const map = new google.maps.Map(document.getElementById('map'), {
        center: userLocation,
        zoom: 14
      });

      const service = new google.maps.places.PlacesService(map);

      const request = {
        location: userLocation,
        radius: '5000',
        type: ['hospital']
      };

      service.nearbySearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          const hospitalList = document.getElementById('hospitalList');
          hospitalList.innerHTML = "<h3>Nearest Hospitals:</h3><ul>";

          results.forEach(place => {
            // Get details for each place
            service.getDetails({ placeId: place.place_id }, (details, detailsStatus) => {
              if (detailsStatus === google.maps.places.PlacesServiceStatus.OK) {
                createMarker(details);

                const distance = calculateDistance(userLocation, details.geometry.location);
                const phoneNumber = details.formatted_phone_number || "Phone number not available";

                hospitalList.innerHTML += `<li>
                  <strong>${details.name}</strong> - ${distance.toFixed(2)} km<br>
                  Phone: ${phoneNumber}
                </li>`;
              }
            });
          });

          hospitalList.innerHTML += "</ul>";
        }
      });

      function createMarker(place) {
        const marker = new google.maps.Marker({
          map: map,
          position: place.geometry.location
        });

        google.maps.event.addListener(marker, 'click', function() {
          const infoWindow = new google.maps.InfoWindow({
            content: `<strong>${place.name}</strong><br>${place.formatted_phone_number || "Phone number not available"}`
          });
          infoWindow.open(map, marker);
        });
      }

      function calculateDistance(origin, destination) {
        const R = 6371; // Radius of the Earth in km
        const dLat = (destination.lat() - origin.lat) * Math.PI / 180;
        const dLng = (destination.lng() - origin.lng) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(origin.lat * Math.PI / 180) * Math.cos(destination.lat() * Math.PI / 180) *
                  Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
      }
    }, () => {
      handleLocationError(true, map.getCenter());
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, map.getCenter());
  }
}

function handleLocationError(browserHasGeolocation, pos) {
  const errorMessage = browserHasGeolocation
    ? 'Error: The Geolocation service failed.'
    : 'Error: Your browser doesn\'t support geolocation.';
  console.error(errorMessage);
}


const button = document.getElementById('redirectButton');

// Add a click event listener
button.addEventListener('click', () => {
    // Redirect to the new page
    window.location.href = "page3.html";
});
