document.addEventListener('DOMContentLoaded', function() {
    initAutocomplete(); // Call this when the document is ready
});
const inputs = document.querySelectorAll('.input');

function focusFunc(){
    let parent = this.parentNode.parentNode;
    parent.classList.add('focus');
}

function blurFunc(){
    let parent = this.parentNode.parentNode;
    if(this.value==""){
        parent.classList.remove('focus');
    }
   
}

inputs.forEach(input => {
    input.addEventListener('focus',focusFunc);
    input.addEventListener('blur',blurFunc);
});

function initAutocomplete() {
    const addressInput = document.getElementById('address');
    const autocomplete = new google.maps.places.Autocomplete(addressInput);
  
    autocomplete.addListener('place_changed', function() {
      const place = autocomplete.getPlace();
      if (!place.geometry) {
        window.alert("No details found for input: '" + place.name + "'");
        return;
      }
  
      // Get latitude and longitude from the place object
      const latitude = place.geometry.location.lat();
      const longitude = place.geometry.location.lng();

      document.getElementById('latitude').value = latitude
      document.getElementById('longitude').value = longitude
  
      // Optionally, populate city and province fields from place.address_components
      populateCityAndProvince(place.address_components);
    });
  }
  
  function populateCityAndProvince(addressComponents) {
    let city = '';
    let province = '';
    addressComponents.forEach(component => {
      if (component.types.includes('locality')) {
        city = component.long_name; 
      } else if (component.types.includes('administrative_area_level_1')) {
        province = component.long_name; 
      }
    });
  
    // Update the city and province input fields
    document.getElementById('city').value = city;
    document.getElementById('province').value = province;
  }