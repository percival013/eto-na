function fadeInOnScroll() {
    const fadeElements = document.querySelectorAll('.fade-in');
  
    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');  
        } else {
          entry.target.classList.remove('visible');  
        }
      });
    }, { threshold: 0.5 });  
  
    fadeElements.forEach(element => {
      observer.observe(element);
    });
  }
  
  fadeInOnScroll();

window.onload = function() {
    checkLoginStatus();
    fetchServices();
};

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
}

async function fetchServices() {
    try {
        const response = await fetch('/api/get-services', {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const services = await response.json();

        // Get current user's location
        const currentUserResponse = await fetch('/api/user', {
            credentials: 'include'
        });

        if (!currentUserResponse.ok) {
            throw new Error('Failed to fetch user location');
        }

        const currentUser  = await currentUserResponse.json();
        const userLat = parseFloat(currentUser.latitude); // Ensure these are numbers
        const userLon = parseFloat(currentUser.longitude); // Ensure these are numbers

        // Check if user location is valid
        if (isNaN(userLat) || isNaN(userLon)) {
            console.error('Invalid user location:', userLat, userLon);
            return; // Exit if user location is invalid
        }

        // Calculate distances and sort services
        const servicesWithDistance = services.map(service => {
            const serviceLat = parseFloat(service.latitude); // Ensure these are numbers
            const serviceLon = parseFloat(service.longitude); // Ensure these are numbers

            // Check if service location is valid
            if (isNaN(serviceLat) || isNaN(serviceLon)) {
                console.error('Invalid service location for service ID:', service._id, 'Lat:', serviceLat, 'Lon:', serviceLon);
                return null; // Skip this service if location is invalid
            }

            const distance = calculateDistance(userLat, userLon, serviceLat, serviceLon);
            return { ...service, distance };
        }).filter(service => service !== null); // Filter out invalid services

        // Sort services by distance (nearest first)
        servicesWithDistance.sort((a, b) => a.distance - b.distance);

        // Display sorted services
        const productList = document.getElementById('product-list');
        productList.innerHTML = ''; // Clear existing services

        servicesWithDistance.forEach(service => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <h3>${service.serviceName}</h3>
                <p>${service.serviceDescription}</p>
                <p>Average Price: $${service.averagePrice}</p>
                <p>Provider: ${service.providerId ? service.providerId.username : 'Unknown'}</p>
                <p>Rating: ${service.averageRating ? service.averageRating.toFixed(1) + '★' : 'Not yet rated'}</p>
                `;
            card.addEventListener('click', () => {
                window.location.href = `service-details.html?id=${service._id}`;
            });
            productList.appendChild(card);
        });
    } catch (error) {
        console.error('Failed to fetch services:', error);
    }
}

async function checkLoginStatus() {
    const response = await fetch('/api/check-login', {
        credentials: 'include'
    });

    if (response.ok) {
        const data = await response.json();
        console.log('Login status data:', data);
    } else {
        console.error('Failed to check login status:', response.status);
    }
}

function filterServices(category) {
  const cards = document.querySelectorAll('.product-card');
  cards.forEach(card => {
      if (card.dataset.category === category || category === 'All') {
          card.style.display = 'block';
      } else {
          card.style.display = 'none';
      }
  });
}

function searchServices() {
  const input = document.getElementById('search-bar').value.toLowerCase();
  const cards = document.querySelectorAll('.product-card');
  cards.forEach(card => {
      const title = card.querySelector('h3').textContent.toLowerCase();
      if (title.includes(input)) {
          card.style.display = 'block';
      } else {
          card.style.display = 'none';
      }
  });
}

