function initMap() {

    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 39.6315214,
            lng: 22.4464073
        },
        zoom: 6
    });
}

function geoLocation() {
    if (navigator.geolocation) {
        //ορισμός callback συναρτήσεων για τον χειρισμό επιτυχούς ή ανεπιτυχούς
        //προσδιορισμού θέσης
        navigator.geolocation.getCurrentPosition(cbGetCurPosOK, cbGetCurPosFail);
    } else {
        //o browser δεν υποστηρίζει geolocation
        alert('Your browser doesn\'t support geolocation.')
    }
}
function cbGetCurPosOK(position) {
    //έστω διαβάζουμε την τρέχουσα θέση και φτιάχνουμε ένα σημείο χάρτη
    var lat = position.coords.latitude;
    var long = position.coords.longitude;
    var curPosition = new google.maps.LatLng(lat, long);
    // κεντράρουμε το χάρτη σε αυτό το σημείο
    map.setCenter(curPosition);
    // φτιάχνουμε μια πινέζα (marker) σε αυτό το σημείο
    var curMarker = new google.maps.Marker({
        position: curPosition,
        title: "You are here!",
        draggable: false,
        icon: 'resources/home.png',

    });
    //βάζουμε την πινέζα στο χάρτη
    curMarker.setMap(map);
}

function cbGetCurPosFail(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            alert("User denied the request for Geolocation.");
            break;
        case error.POSITION_UNAVAILABLE:
            alert("Location information is unavailable.");
            break;
        case error.TIMEOUT:
            alert("The request to get user location timed out.");
            break;
        case error.UNKNOWN_ERROR:
            alert("An unknown error occurred.")
            break;
    }
}

function zoomExtends() {
    //ορίζουμε ένα object-ορθογώνιο (για να ζουμάρουμε μετά πάνω του)
    var bounds = new google.maps.LatLngBounds();
    //σαρώνουμε όλα τα markers και αναπροσαρμόζουμε τις συντεταγμένες
    //του παραπάνω ορθογωνίου ώστε τα markers να περιέχονται μέσα του
    for (var i = 0; i < markers.length; i++) {
        bounds.extend(markers[i].position);
    }
    //zoomάρουμε πάνω στο οριστικοποιημένο ορθογώνιο
    map.fitBounds(bounds);
}

function clearMarkers() {
    for (i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    markers = [];
}


function  connectMarkerWithInfoWindow(marker, infowindow) {
    google.maps.event.addListener(marker, 'click', function () {
        infowindow.setContent(marker.content);
        infowindow.open(map, this);
    }
    );
}

function zoomInMarker(gasStationID) {

    var marker = markers.find(function (markerElement) {
        return markerElement.gasStationId == gasStationID;
    });
    console.log(markers);
    map.setZoom(17);
    map.panTo(marker.position);
}

