function Flash(msg){
    $('#flash').html(msg).show().delay(700).fadeOut(1000);
}

function GetSavedElevation(lat,lng){
    var d;
      jQuery.ajax({
        type: 'POST',
        url: '/svc',
        data: { long: lng.toFixed(3), lat: lat.toFixed(3) },
        success: function(data) {
          d = data;
        },
        async:false
      });
   return d;
}
function SaveElevation(lat,lng,elevation){
    $.post("/svc", { long: lng.toFixed(3), lat: lat.toFixed(3), elevation:elevation },
   function(data) {
        return;
   });
}

function Search(){
    window.location = '/?q=' + htmlEscape($('#search').val());
}



function initPoint(lat,lng){
    map.setCenter(new google.maps.LatLng(lat,lng));    
    map.setZoom(12);
}

function mapClick(event){
    google.maps.Map.prototype.clearMarkers = function() {
        for(var i=0; i < this.markers.length; i++){
            this.markers[i].setMap(null);
        }
        this.markers = new Array();
    };
    var locations = [];
    locations.push(event.latLng);
    
    // Check for cached lnglat lookup
    s = GetSavedElevation(event.latLng.lat(),event.latLng.lng());
    if (s == "ERROR"){
        var positionalRequest = {'locations': locations};
        elevator = new google.maps.ElevationService();
          elevator.getElevationForLocations(positionalRequest, function(results, status) {
            if (status == google.maps.ElevationStatus.OK) {
                var m = results[0].elevation;
                var ft = m * 3.28084;
                $('#elevation').html(ft.toFixed(2) + ' ft (' + m.toFixed(2) + 'm)');
              if (marker != undefined) {marker.setMap(null);}
              marker = new google.maps.Marker({
                  map: map
                }); 
              marker.setPosition(event.latLng);   
              SaveElevation(event.latLng.lat(),event.latLng.lng(),ft);
            }
          });  
    }
    else {
        var ft = parseFloat(s);
        var m = ft / 3.28084
        $('#elevation').html(ft.toFixed(2) + ' ft (' + m.toFixed(2) + 'm)');
    }      
}
    
    function drawMap(canvasId,lat,lng,zoom){
        zoom = typeof zoom !== 'undefined' ? zoom: 10;
        var mapLatLng = new google.maps.LatLng(lat,lng);
        var mapOptions = {
        center: mapLatLng,
        zoom: zoom,
        mapTypeId: google.maps.MapTypeId.ROADMAP
        };        
        map = new google.maps.Map(document.getElementById(canvasId),mapOptions);
        marker = new google.maps.Marker({
              position: mapLatLng,
              map: map
        }); 
    }    
    
    function initGroup(lat1,lng1,z1,lat2,lng2,z2){
        drawMap("map_high",lat1,lng1,z1);
        drawMap("map_low",lat2,lng2,z2);        
    }
    
    function init(loc){
        loc = typeof loc !== 'undefined' ? loc : false;
        
        $('#search').focus();
        /*
        if (loc){
            var mapOptions = {
            center: new google.maps.LatLng({{loc.lat}},{{loc.long}}),
            zoom: {{loc.zoom_lvl}},
            mapTypeId: google.maps.MapTypeId.ROADMAP
            };
        } else {
        */
            var mapOptions = {
            center: new google.maps.LatLng(38.1,-96.1),
            zoom: 4,
            mapTypeId: google.maps.MapTypeId.ROADMAP
            };        
        //}
        map = new google.maps.Map(document.getElementById("map_canvas"),mapOptions);

        var defaultBounds = new google.maps.LatLngBounds(
          new google.maps.LatLng(-33.8902, 151.1759),
          new google.maps.LatLng(-33.8474, 151.2631));
        google.maps.event.addListener(map, 'click', mapClick);
        var input = document.getElementById('search');
        var options = {
          bounds: defaultBounds,
          types: ['geocode']
        };
        autocomplete = new google.maps.places.Autocomplete(input, options);

        
        google.maps.event.addListener(autocomplete, 'place_changed', function() {
          var place = autocomplete.getPlace();
          if (!place.geometry) {
            // Inform the user that a place was not found and return.
            return;
          }
          window.location = '/?q=' + htmlEscape($('#search').val()) + '&lat=' + place.geometry.location.lat() + '&lng=' + place.geometry.location.lng();
        }); 
        if (typeof lat !== 'undefined'){
            initPoint(lat,lng);
        }
    }

function htmlEscape(str) {
    return String(str)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
}