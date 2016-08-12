// Model
var summits = [
  // 1000ft plus
  {title: 'Cadillac Mountain', location: {lat: 44.352643, lng: -68.224610}, group: '5'},
  {title: 'Sargent Mountain', location: {lat: 44.3425796, lng: -68.2727932}, group: '5'},
  {title: 'Dorr Mountain', location: {lat: 44.3545241, lng: -68.215569}, group: '5'},
  {title: 'Pemetic Mountain', location: {lat: 44.335082, lng: -68.243838}, group: '5'},
  {title: 'Penobscot Mountain', location: {lat: 44.332858, lng: -68.266682}, group: '5'},
  {title: 'Bernard Mountain', location: {lat: 44.300259, lng: -68.37252}, group: '5'},
  {title: 'Champlain Mountain', location: {lat: 44.3506355, lng: -68.1930676}, group: '5'},
  {title: 'Gilmore Peak', location: {lat: 44.338413, lng: -68.279182}, group: '5'},
  // 700 to 999
  {title: 'Bald Peak', location: {lat: 44.335095, lng: -68.283668}, group: '4'},
  {title: 'Mansell Mountain', location: {lat: 44.307024, lng: -68.360295}, group: '4'},
  {title: 'Cedar Swamp Mountain', location: {lat: 44.328413, lng: -68.275849}, group: '4'},
  {title: 'Knight Nubble', location: {lat: 44.304524, lng: -68.370018}, group: '4'},
  {title: 'Parkman Mountain', location: {lat: 44.338253, lng: -68.285903}, group: '4'},
  {title: 'North Bubble', location: {lat: 44.344246, lng: -68.256682}, group: '4'},
  {title: 'Norumbega Mountain', location: {lat: 44.324071, lng: -68.295601}, group: '4'},
  {title: 'Beech Mountain', location: {lat: 44.311469, lng: -68.346128}, group: '4'},
  {title: 'South Bubble', location: {lat: 44.338691, lng: -68.254182}, group: '4'},
  {title: 'Huguenot Head', location: {lat: 44.353135, lng: -68.199457}, group: '4'},
  {title: 'McFarland Mountain', location: {lat: 44.38202, lng: -68.264953}, group: '4'},
  // 500 to 699
  {title: 'The Triad', location: {lat: 44.320913, lng: -68.236959}, group: '3'},
  {title: 'Acadia Mountain', location: {lat: 44.323746, lng: -68.317482}, group: '3'},
  {title: 'Youngs Mountain', location: {lat: 44.391746, lng: -68.266404}, group: '3'},
  {title: 'St. Sauveur Mountain', location: {lat: 44.309524, lng: -68.321683}, group: '3'},
  {title: 'Conners Nubble', location: {lat: 44.356263, lng: -68.256524}, group: '3'},
  {title: 'Day Mountain', location: {lat: 44.31008, lng: -68.231681}, group: '3'},
  {title: 'Valley Peak', location: {lat: 44.30508, lng: -68.319183}, group: '3'},
  {title: 'Gorham Mountain', location: {lat: 44.326895, lng: -68.193268}, group: '3'},
  {title: 'The Beehive', location: {lat: 44.333414, lng: -68.188345}, group: '3'},
  // 500ft and under
  {title: 'Kebo Mountain', location: {lat: 44.373413, lng: -68.218347}, group: '2'},
  {title: 'Bald Mountain', location: {lat: 44.294524, lng: -68.384185}, group: '2'},
  {title: 'Flying Mountain', location: {lat: 44.304876, lng: -68.313323}, group: '2'},
  {title: 'Great Head', location: {lat: 44.328412, lng: -68.174172}, group: '2'}
];

// Initialize the map using google maps api
var map;
function initMap() {
  // Constructor creates a new map - only center and zoom are required.
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 44.3386, lng: -68.2733},
    zoom: 12,
    mapTypeId: google.maps.MapTypeId.TERRAIN
  });
  // Knockout bindings
  ko.applyBindings(new ViewModel());
}

// Function to grab photos from flickr
function inputImage(tag) {
  var flickerAPI = "http://api.flickr.com/services/feeds/photos_public.gne?jsoncallback=?";
  $.getJSON(flickerAPI, {
    tags: tag,
    tagmode: "any",
    format: "json"
  })
    .done(function(data) {
        console.log("posted");
        $.each(data.items, function( i, item ) {
          $( "<img>" ).attr( "src", item.media.m ).appendTo( "#images" );
          if ( i === 0 ) {
            return false;
          }
        });
    })
    .fail(function(jqxhr, textStatus, error) {
      console.log("failed");
      $( "<img>" ).attr({src: 'imgs/acadiaGeneric.jpg', alt: 'Acadia National Park'}).appendTo( "#images" );
  });
}

// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function populateInfoWindow(marker, infowindow) {
  // Check to make sure the infowindow is not already opened on this marker.
  if (infowindow.marker != marker) {
    infowindow.marker = marker;
    infowindow.setContent('<div id="images"><div class="infowindowTitle">' + marker.title + '</div></div>');
    // plug in image
    inputImage(marker.title);
    infowindow.open(map, marker);
    // Make sure the marker property is cleared if the infowindow is closed.
    infowindow.addListener('closeclick',function(){
      infowindow.close();
      marker.setAnimation(null);
    });
  }
}
// Marker animation when clicked
function toggleBounce(marker) {
  if (marker.getAnimation() != null) {
    marker.setAnimation(null);
  }
  else {
    marker.setAnimation(google.maps.Animation.BOUNCE);
  }
}

// View Model
function ViewModel() {
  var largeInfowindow = new google.maps.InfoWindow();
  var bounds = new google.maps.LatLngBounds();

  // List View
  this.locations = ko.observableArray(summits.slice(0));
  // create markers
  this.locations().forEach(function(summit) {
    var marker = new google.maps.Marker({
        map: map,
        position: summit.location,
        title: summit.title,
        animation: google.maps.Animation.DROP
      });
    // make marker an attribute of the summit
    summit.marker = marker;

    // Create an onclick event to open an infowindow at each marker.
    marker.addListener('click', function() {
      // make all other marker animations null
      for (var i = 0; i < summits.length; i++) {
        summits[i].marker.setAnimation(null);
      }
      populateInfoWindow(this, largeInfowindow);
      toggleBounce(this);
    });
    bounds.extend(summit.marker.position);
  });

  // Extend the boundaries of the map for each marker
  map.fitBounds(bounds);

  // if a summit is clicked in the list view bring up the infowindow
  openWindow = function() {
    // make all other marker animations null
    for (var i = 0; i < summits.length; i++) {
      summits[i].marker.setAnimation(null);
    }
    populateInfoWindow(this.marker, largeInfowindow);
    toggleBounce(this.marker);
  }
  // TODO: Get any open infowindows to exit
  // filter through the list based on the dropdown value
  filter = function() {
    var dropdown = document.getElementById('dificulty');
    var dropdownValue = dropdown.options[dropdown.selectedIndex].value;
    this.locations.removeAll();
    for (var i = 0; i < summits.length; i++) {
      if (dropdownValue === '1'){
        this.locations.push(summits[i]);
        summits[i].marker.setVisible(true);
      }
      else if (summits[i].group === dropdownValue) {
        this.locations.push(summits[i]);
        summits[i].marker.setVisible(true);
      }
      else {
        summits[i].marker.setVisible(false);
      }
    }
  }
}
