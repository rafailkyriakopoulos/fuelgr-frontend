
function isLoggedIn() {
    if (localStorage.getItem('jwtToken') == null) {
        return false
    } else {
        return true;
    }
}



function hasToken() {
    if (localStorage.getItem('jwtToken') != null) {
        hasJwtToken = true;
        document.getElementById("loginSection").style.display = "none";
        document.getElementById("logoutSection").style.display = "block";
        openMessage("messagefromApi", "<strong>You are successfully logged in!</strong>");
        setUsernameInfoFromToken();
    } else {
        document.getElementById("loginSection").style.display = "block";
        document.getElementById("logoutSection").style.display = "none";
        document.getElementById("usernameInfoSection").style.display = "none";

    }
}

function login() {

    username = document.getElementById("username").value;
    password = document.getElementById("passwordId").value;

    var endPoint = apiRoot + "auth/login";
    var xmlhttp = initAJAX();

    xmlhttp.open('POST', endPoint, true);
    xmlhttp.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');

    var sendObject = JSON.stringify({
        username: username,
        password: password
    });

    xmlhttp.send(sendObject);
    //callback
    xmlhttp.onreadystatechange = function () {

        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var jwtToken = this.responseText;
            hasJwtToken = true;
            localStorage.setItem('jwtToken', jwtToken);
            hasToken();
            openMessage("messagefromApi", "  <strong>You are successfully logged in!</strong>");
            closeMessage("messageErrorFromApi");
            closeMessage("messageLogout");
            setUsernameInfoFromToken();
            setGasStationsInMap();//Επαναφορτώνουμε τον χάρτη ώστε να υπάρχουν τα κουμπία orders για τους ιδιοκτήτες

        }
        if (xmlhttp.readyState == 4 && xmlhttp.status == 403) {
            hasJwtToken = false;
            hasToken();
            openMessage("messageErrorFromApi", "<strong>username or password is not correct</strong>");
            closeMessage("messageLogout");
            closeMessage("messagefromApi");
        }

    }
    $('#modal').modal('toggle');

}

function logout() {
    window.localStorage.removeItem('jwtToken');
    hasJwtToken = false;
    hasToken();
    closeMessage("messagefromApi");
    openMessage("messageLogout", "<strong>You are successfully logged out!</strong>");
    setGasStationsInMap();//Επαναφορτώνουμε τον χάρτη ώστε να φύγουν τα κουμπία orders για τους ιδιοκτήτες
}

function jwtExpired() {
    window.localStorage.removeItem('jwtToken');
    hasJwtToken = false;
    hasToken();
    closeMessage("messagefromApi");
    openMessage("messageErrorFromApi", "<strong>Your session has expired. Please log in again </strong>");
    setGasStationsInMap();//Επαναφορτώνουμε τον χάρτη ώστε να φύγουν τα κουμπία orders για τους ιδιοκτήτες
}

function setUsernameInfoFromToken() {
    var username = JSON.parse(localStorage.getItem('jwtToken')).username;
    document.getElementById("usernameInfoSection").style.display = "block";
    document.getElementById("usernameInfo").innerHTML = username;
}
function getUserName() {
    return JSON.parse(localStorage.getItem('jwtToken')).username;
}


function initAJAX() {
    if (window.XMLHttpRequest) { // all modern browsers
        return xmlhttp = new XMLHttpRequest();
    } else if (window.ActiveXObject) { //for IE5, IE6
        return xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    } else { //AJAX not supported
        alert("Your browser does not support AJAX calls!");
        return false;
    }


}
