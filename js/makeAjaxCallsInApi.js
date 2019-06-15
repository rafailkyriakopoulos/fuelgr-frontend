//var apiRoot="http://localhost:8080/"; βρίσκεται στο auth.js που είναι το πρώτο js αρχείο που φορτώνεται
//var map; βρίσκεται στο mappAndGeoLocation.js που είναι το πρώτο js αρχείο που φορτώνεται
//var markers = [];βρίσκεται στο mappAndGeoLocation.js που είναι το πρώτο js αρχείο που φορτώνεται

//getStatistics();

function getGasStations(fuelTypeID) {
    var endPoint = apiRoot + "gasstations/pricedata/" + fuelTypeID;
    var xmlhttp = initAJAX();
    xmlhttp.open("get", endPoint, true);
    xmlhttp.send();
    //callbacks
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var gasStationsArray = JSON.parse(this.responseText);
            setGasStationsInMap.getGasStationsOnReceive(gasStationsArray);
        }

    }
}


function getFuelTypes() {
    var endPoint = apiRoot + "priceData/fuelTypes";
    var xmlhttp = initAJAX();
    xmlhttp.open("get", endPoint, true);
    xmlhttp.send();
    //callback
    xmlhttp.onreadystatechange = function () {

        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var priceDataResultFromAPi = JSON.parse(this.responseText);
            setFuelTypesInSelectElement(priceDataResultFromAPi);//application.js
            setGasStationsInMap();//application.js
        }
    }


}

function getStatistics() {
    var endPoint = apiRoot + "statistics";
    var xmlhttp = initAJAX();
    xmlhttp.open("get", endPoint, true);
    xmlhttp.send();
    //callback
    xmlhttp.onreadystatechange = function () {

        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var statistics = JSON.parse(this.responseText);
            setStatisticsInElements(statistics);//application.js

        }
    }
}

function makeAnOrder(productID) {
    if (!isLoggedIn()) {
        $('#modal').modal('toggle');
        openMessage("messageErrorFromApi", "To make an order, you must first sign in");
        return;
    }
    var endPoint = apiRoot + "orders";
    var jwt = "Bearer " + JSON.parse(localStorage.getItem('jwtToken')).token;
    elementId = "productID" + productID;
    quantityValue = document.getElementById(elementId).value;


    var sendObject = JSON.stringify({
        quantity: quantityValue,
        priceData: {
            productID: productID
        }
    });
    xmlhttp.open('POST', endPoint, true);
    xmlhttp.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    xmlhttp.setRequestHeader('Authorization', jwt);
    xmlhttp.send(sendObject);

    //callback
    xmlhttp.onreadystatechange = function () {

        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var json = JSON.parse(this.responseText);
            document.getElementById("messagefromApi").innerHTML = "<a class='close' onclick='closeMessage(\"messagefromApi\")'>&times;</a>" + json.message;
            document.getElementById("messagefromApi").style.display = "block";


        }
        if (xmlhttp.readyState == 4 && xmlhttp.status == 403) {
            console.log(this.responseText);
            jwtExpired();
        }

    }
    $('#modal').modal('toggle');

}

function getPriceList(gasStationID) {
    var endPoint = apiRoot + "gasstations/" + gasStationID + "/pricelist";
    var xmlhttp = initAJAX();
    xmlhttp.open("get", endPoint, true);
    xmlhttp.send();
    //callback
    xmlhttp.onreadystatechange = function () {

        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var gasStation = JSON.parse(this.responseText);
            priceData = gasStation.priceData;
            gasStationOwner = gasStation.user;
            openPriceListModalAndSetItems.getPriceListOnReceived(priceData, gasStationOwner);//application.js
        }
    }
}
function getOrders(gasStationID) {
    if (!isLoggedIn()) {
        openMessage("messageErrorFromApi", "To view  orders, you must first sign in");
        return;
    }
    var endPoint = apiRoot + "orders/" + gasStationID;
    var xmlhttp = initAJAX();
    xmlhttp.open("get", endPoint, true);
    var jwt = "Bearer " + JSON.parse(localStorage.getItem('jwtToken')).token;
    xmlhttp.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    xmlhttp.setRequestHeader('Authorization', jwt);
    xmlhttp.send();
    //callback
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var orders = JSON.parse(this.responseText);
            viewOrders.getOrdersOnReceived(orders);
        }
        if (xmlhttp.readyState == 4 && xmlhttp.status == 403) {
            $('#modal').modal('toggle');
            jwtExpired();
        }
    }
}
function getProduct(productID) {
    var endPoint = apiRoot + "priceData/" + productID;
    var xmlhttp = initAJAX();
    xmlhttp.open("get", endPoint, true);

    xmlhttp.send();
    //callback
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var product = JSON.parse(this.responseText);
            editProductModal.getProductOnReceived(product);


        }
    }

}
function editProduct(product) {
    var fuelNormalNameValue = document.getElementById("fuelNormalName").value;
    var fuelNameValue = document.getElementById("fuelName").value;
    var fuelPriceValue = document.getElementById("fuelPrice").value;
    var endPoint = apiRoot + "pricedata/" + product.productID;
    var xmlhttp = initAJAX();
    xmlhttp.open("PUT", endPoint, true);
    var jwt = "Bearer " + JSON.parse(localStorage.getItem('jwtToken')).token;
    xmlhttp.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    xmlhttp.setRequestHeader('Authorization', jwt);
    var sendObject = JSON.stringify({
        fuelNormalName: fuelNormalNameValue,
        fuelName: fuelNameValue,
        fuelPrice: parseFloat(fuelPriceValue)
    });
    xmlhttp.send(sendObject);
    //callback
    xmlhttp.onreadystatechange = function () {

        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var json = JSON.parse(this.responseText);
            openMessage("messagefromApi", "<strong>" + json.message + "</strong>");
            setGasStationsInMap(product.gasStation);
           

        }
        if (xmlhttp.readyState == 4 && xmlhttp.status == 403) {

            jwtExpired();
        }

    }
    $('#modal').modal('toggle');
    setGasStationsInMap();//application.js

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
