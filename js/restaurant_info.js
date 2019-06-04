let restaurant;
var newMap;

/**
 * Initialize map as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {  
  initMap();
});

/**
 * Initialize leaflet map
 */
initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {      
      self.newMap = L.map('map', {
        center: [restaurant.latlng.lat, restaurant.latlng.lng],
        zoom: 16,
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
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
    }
  });
}  
 
/* window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
} */

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const picture = document.getElementById('restaurant-picture');
  const imgSource = DBHelper.imageUrlForRestaurant(restaurant).slice(1, DBHelper.imageUrlForRestaurant(restaurant).indexOf('.jpg'));
  const source1 = document.createElement('source');
  source1.setAttribute('media', '(min-width: 1441px)');
  source1.setAttribute('srcset', imgSource + '-800.jpg 1x');
  picture.append(source1);
  const source2 = document.createElement('source');
  source2.setAttribute('media', '(min-width: 1201px)');
  source2.setAttribute('srcset', imgSource + '-800.jpg 2x, ' + imgSource + '-660.jpg 1x');
  picture.append(source2);
  const source3 = document.createElement('source');
  source3.setAttribute('media', '(min-width: 992px)');
  source3.setAttribute('srcset', imgSource + '-800.jpg 2x, ' + imgSource + '-540.jpg 1x');
  picture.append(source3);
  const source4 = document.createElement('source');
  source4.setAttribute('media', '(min-width: 768px)');
  source4.setAttribute('srcset', imgSource + '-800.jpg 2x, ' + imgSource + '-440.jpg 1x');
  picture.append(source4);
  const source5 = document.createElement('source');
  source5.setAttribute('media', '(min-width: 601px)');
  source5.setAttribute('srcset', imgSource + '-800.jpg 2x, ' + imgSource + '-700.jpg 1x');
  picture.append(source5);
  const source6 = document.createElement('source');
  source6.setAttribute('media', '(min-width: 481px)');
  source6.setAttribute('srcset', imgSource + '-800.jpg 2x, ' + imgSource + '-540.jpg 1x');
  picture.append(source6);
  const image = document.createElement('img');
  image.className = 'restaurant-img';
  image.setAttribute('src', imgSource + '-440.jpg');
  image.setAttribute('alt', restaurant.name + ' Restaurant');
  image.setAttribute('srcset', imgSource + '-800.jpg 2x, ' + imgSource + '-440.jpg 1x');
  picture.append(image);

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h2');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');

  const boxContainer = document.createElement('div');
  boxContainer.className = 'box-container';
  li.append(boxContainer);

  const name = document.createElement('h4');
  name.innerHTML = review.name;
  boxContainer.appendChild(name);

  const date = document.createElement('span');
  date.className = 'date';
  date.innerHTML = review.date;
  name.appendChild(date);

  const rating = document.createElement('h5');
  rating.innerHTML = `Rating: ${review.rating}`;
  boxContainer.appendChild(rating);

  const comments = document.createElement('p');
  comments.className = 'comments';
  comments.innerHTML = review.comments;
  boxContainer.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  li.setAttribute('aria-current', 'page');
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
