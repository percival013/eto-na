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
    const R = 6371; 
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; 
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

        
        const currentUserResponse = await fetch('/api/user', {
            credentials: 'include'
        });

        if (!currentUserResponse.ok) {
            throw new Error('Failed to fetch user location');
        }

        const currentUser  = await currentUserResponse.json();
        const userLat = parseFloat(currentUser.latitude); 
        const userLon = parseFloat(currentUser.longitude); 

        
        if (isNaN(userLat) || isNaN(userLon)) {
            console.error('Invalid user location:', userLat, userLon);
            return; 
        }

        
        const servicesWithDistance = services.map(service => {
            const serviceLat = parseFloat(service.latitude); 
            const serviceLon = parseFloat(service.longitude); 

            
            if (isNaN(serviceLat) || isNaN(serviceLon)) {
                console.error('Invalid service location for service ID:', service._id, 'Lat:', serviceLat, 'Lon:', serviceLon);
                return null; 
            }

            const distance = calculateDistance(userLat, userLon, serviceLat, serviceLon);
            return { ...service, distance };
        }).filter(service => service !== null); 

        
        servicesWithDistance.sort((a, b) => a.distance - b.distance);

        
        const productList = document.getElementById('product-list');
        productList.innerHTML = ''; 

        servicesWithDistance.forEach(service => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.setAttribute('data-category', service.serviceCategory);
            card.innerHTML = `
                <img src="Fixer.png" style="width: 100%; height: auto; border-radius: 20px; padding: 10px; background-color: white;">
                <h3>${service.serviceName}</h3>
                <h4>${service.serviceCategory}</h4>
                <p>Average Price: $${service.averagePrice}</p>
                <p>Provider: ${service.providerId ? service.providerId.username : 'Unknown'}</p>
                <p>Rating: ${service.averageRating ? service.averageRating.toFixed(1) + '★' : 'Not yet rated'}</p>
                <p>Distance: ${service.distance.toFixed(2)} km</p>
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

document.addEventListener('DOMContentLoaded', () => {
    
    filterServices('All');

    document.querySelectorAll('.service-category li').forEach(item => {
        item.addEventListener('click', () => {
            const category = item.textContent; 
            filterServices(category); 
        });
    });
});

function filterServices(category) {
    const cards = document.querySelectorAll('.product-card'); 
    cards.forEach(card => {
        const cardCategory = card.dataset.category; 
        
        if(category === 'All'){
            fetchServices();
        }
        if (cardCategory === category) {
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
document.getElementById('search-bar').addEventListener('keyup', searchServices);
