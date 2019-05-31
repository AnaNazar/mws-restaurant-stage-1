let restaurants,
  neighborhoods,
  cuisines
var newMap
var markers = []

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  initMap(); // added 
  fetchNeighborhoods();
  fetchCuisines();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
}

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
}

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

/**
 * Initialize leaflet map, called from HTML.
 */
initMap = () => {
  self.newMap = L.map('map', {
        center: [40.722216, -73.987501],
        zoom: 12,
        scrollWheelZoom: false
      });
  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
    mapboxToken: 'pk.eyJ1IjoiYW5hbmF6YXIiLCJhIjoiY2p2d3o3OWxoNGg2bDQ4bXVtb25yOGJxbCJ9.h48EfoS7nhYntmf4XkFEMw',
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
      '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
      'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox.streets'
  }).addTo(newMap);

  updateRestaurants();
}
/* window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  updateRestaurants();
} */

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  })
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  if (self.markers) {
    self.markers.forEach(marker => marker.remove());
  }
  self.markers = [];
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
}

/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');

  const boxContainer = document.createElement('div');
  boxContainer.className = 'box-container';
  li.append(boxContainer);

  const picture = document.createElement('picture');
  const imgSource = DBHelper.imageUrlForRestaurant(restaurant).slice(1, DBHelper.imageUrlForRestaurant(restaurant).indexOf('.jpg'));
  const source1 = document.createElement('source');
  source1.setAttribute('media', '(min-width: 1921px)');
  source1.setAttribute('srcset', imgSource + '-800.jpg 1x');
  picture.append(source1);
  const source2 = document.createElement('source');
  source2.setAttribute('media', '(min-width: 1201px)');
  source2.setAttribute('srcset', imgSource + '-800.jpg 2x, ' + imgSource + '-600.jpg 1x');
  picture.append(source2);
  const source3 = document.createElement('source');
  source3.setAttribute('media', '(min-width: 992px)');
  source3.setAttribute('srcset', imgSource + '-700.jpg 2x, ' + imgSource + '-350.jpg 1x');
  picture.append(source3);
  const source4 = document.createElement('source');
  source4.setAttribute('media', '(min-width: 770px)');
  source4.setAttribute('srcset', imgSource + '-800.jpg 2x, ' + imgSource + '-440.jpg 1x');
  picture.append(source4);
  const source5 = document.createElement('source');
  source5.setAttribute('media', '(min-width: 601px)');
  source5.setAttribute('srcset', imgSource + '-660.jpg 2x, ' + imgSource + '-330.jpg 1x');
  picture.append(source5);
  const source6 = document.createElement('source');
  source6.setAttribute('media', '(min-width: 481px)');
  source6.setAttribute('srcset', imgSource + '-800.jpg 2x, ' + imgSource + '-540.jpg 1x');
  picture.append(source6);
  const image = document.createElement('img');
  image.className = 'restaurant-img';
  image.setAttribute('src', imgSource + '-440.jpg');
  image.setAttribute('alt', restaurant.cuisine_type + ' Restaurant');
  image.setAttribute('srcset', imgSource + '-800.jpg 2x, ' + imgSource + '-440.jpg 1x');
  picture.append(image);
  boxContainer.append(picture);

  const name = document.createElement('h1');
  name.innerHTML = restaurant.name;
  boxContainer.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  boxContainer.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  boxContainer.append(address);

  const more = document.createElement('a');
  more.setAttribute('aria-label', 'View ' + restaurant.name + ' Restaurant Details');
  more.innerHTML = 'View Details';
  more.href = DBHelper.urlForRestaurant(restaurant);
  boxContainer.append(more)

  return li
}

/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.newMap);
    marker.on("click", onClick);
    function onClick() {
      window.location.href = marker.options.url;
    }
    self.markers.push(marker);
  });

} 
/* addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    self.markers.push(marker);
  });
}
*/