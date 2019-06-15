/*Global μεταβλητές */
/*--------------------------------------------------------------------------------------------------*/
var hasJwtToken = false;
//Το σημείο που τρέχει ο server
var apiRoot = "http://localhost:8080/";
var map; //Για το google maps
var markers = [];////Για το google maps
/*-----------------------------------------------------------------------------------τέλος Global μεταβλητές*/

/*Οπτικές ρυθμίσεις*/
/*--------------------------------------------------------------------------------------------------*/
document.getElementById("logoutSection").style.display = "none";
hasToken();//auth.js
/*------------------------------------------------------------------------------------τέλος Οπτικές ρυθμίσεις*/





/*------------------------------------Main πρόγραμμα----------------------------------------------------------*/

//Κλήσεις στο api = makeAjaxCallsInApi.js
getFuelTypes();//Καλεί με callback την setFuelTypesInSelectElement και την setGasStationsInMap
getStatistics();//Καλέι με callback την setStatisticsInElements()


/*--------------------------------------------------------------------------------------τέλος Main πρόγραμμα*/






/*---------------------------------Συναρτήσεις-----------------------------------------------------------------*/

function setFuelTypesInSelectElement(priceDataResultFromAPi) {
    var select = document.getElementById("fuelTypeSelect");
    for (i = 0; i < priceDataResultFromAPi.length; i++) {

        var opt = document.createElement('option');
        opt.value = priceDataResultFromAPi[i].fuelTypeID;
        opt.innerHTML = priceDataResultFromAPi[i].fuelNormalName;
        select.appendChild(opt);
    }

}

/*καλείται στην αρχή το getFuelTypes() αλλά και όταν ο χρήστης αλλάξει fueltype στην index.html στο select element */
function setGasStationsInMap(zoomInGasStationID) {
    //Αδείαζουμε τους markers από τον χάρτη
    clearMarkers();//mappAndGeoLocation.js
    var select = document.getElementById("fuelTypeSelect");
    var fuelTypeID = select.options[select.selectedIndex].value;
    getGasStations(fuelTypeID);

    //callback του getGasStations(fuelTypeID)
    function getGasStationsOnReceive(gasStationsArray) {
        var infowindow = new google.maps.InfoWindow(
                {
                    map: map
                }
        );
        for (i = 0; i < gasStationsArray.length; i++) {

            //gasstation info
            lat = gasStationsArray[i].gasStationLat;
            long = gasStationsArray[i].gasStationLong;
            gasStationID = gasStationsArray[i].gasStationID;
            gasStationOwner = gasStationsArray[i].user;
            fuelCompNormalName = gasStationsArray[i].fuelCompNormalName;
            fuelCompID = gasStationsArray[i].fuelCompID;
            gaStationPicture = 'resources/' + fuelCompID + '.png';
            address = gasStationsArray[i].gasStationAddress;
            phone = "";
            if (gasStationsArray[i].phone1) {
                phone = gasStationsArray[i].phone1;
            }

            //priceData info
            price = gasStationsArray[i].priceData[0].fuelPrice;
            fuelNormalName = gasStationsArray[i].priceData[0].fuelNormalName;

            marker = new MarkerWithLabel({

                position: {
                    lat: lat,
                    lng: long
                },
                labelContent: '<div><img src="' + gaStationPicture + '"/></div><div class="price">' + price + "&euro;</div>",
                map: map,
                visible: true,
                title: fuelCompNormalName,
                labelAnchor: new google.maps.Point(17, 50),
                labelStyle: {
                    opacity: 1
                },
                labelVisible: true,

                icon: {
                    url: gaStationPicture,
                    anchor: new google.maps.Point(17, 50)
                }

            });
            marker.gasStationId = gasStationID;
            var orderButton = "";
            //Εάν είναι ο ιδιοκτήτης τότε δείξε το κουμπί orders
            if (isLoggedIn() && getUserName() == gasStationOwner) {
                orderButton = "<button style=\"width:80%;margin-top:10px;\" class=\"btn btn-danger\" onclick=\"viewOrders('" + gasStationID + "')\">orders</button>";
            }
            //Το content που θα δείχνει το infowindow
            var content = '<div id="iw-container">' +
                    '<div class="iw-title">' + fuelCompNormalName + '</div>' +
                    '<div class="iw-content">' +
                    '<div class="iw-subTitle">' + fuelNormalName + ' : ' + price + '&euro;</div>' +
                    '<img src="' + gaStationPicture + '"/>' +
                    '<button style="width:80%" class="btn btn-primary" onclick="openPriceListModalAndSetItems(' + gasStationID + ')">pricelist</button>' +
                    orderButton +
                    '<div class="iw-subTitle">Επικοινωνία</div>' +
                    '<p>Διεύθυνση : ' + address + '<br>' +
                    '<br>Τηλέφωνο : ' + phone + '</p>' +
                    '</div>' +
                    '<div class="iw-bottom-gradient"></div>' +
                    '</div>';
            /*
             * Επειδή η js είναι δυναμική γλώσσα μπορούμε on the fly να φτιάξουμε καινούριο 
             * πεδίο ώστε να το χρησιμοποιήσουμε αργότερα στην  connectMarkerWithInfoWindow(marker, infowindow);
             */
            marker.content = content;
            markers.push(marker);
            connectMarkerWithInfoWindow(marker, infowindow);


        }
        /*Αν καλεστεί η συνάρτηση  setGasStationsInMap με παράμετρο τότε θα κάνεις zoom στον marker */
        if (typeof zoomInGasStationID === 'undefined' || zoomInGasStationID === null) {
            zoomExtends();

        } else {
            zoomInMarker(zoomInGasStationID);
        }


    }
    //Το κάνουμε για να μπορέσουμε να καλέσουμε συνάρτηση μέσα σε συνάρτηση από  έξω
    setGasStationsInMap.getGasStationsOnReceive = getGasStationsOnReceive;

}


function openPriceListModalAndSetItems(gasStationID) {
    if (!isLoggedIn()) {
        setGasStationsInMap();
        return;
    }
    getModal("priceListModal");
    getPriceList(gasStationID);

    function getPriceListOnReceived(priceData, gasStationOwner) {
        var priceListBody = document.getElementById("priceListBody");


        content = "";
        for (i = 0; i < priceData.length; i++) {
            var editButton = "";
            //Εάν είναι ο ιδιοκτήτης τότε δείξε το κουμπί edit
            if (isLoggedIn() && getUserName() == gasStationOwner) {
                editButton = '<br/><button style="width:100%;margin-bottom:10px;"class="btn btn-warning" onclick="editProductModal(\'' + priceData[i].productID + '\')">edit</button>';
            }
            content += '<section class="row" style="padding:10px;background:#c9d3d4"><div class="col-sm-8"><img style="display:block" src="resources/fuelsmallIcon.png"><strong style="font-size:18px"> ' + priceData[i].fuelNormalName +
                    '</strong><span style="color:red;font-size:18px"> <br/>price &euro;' + priceData[i].fuelPrice + '</span></div></div>' +
                    '<div class="col-sm-4" style="font-size:17px;text-align:center">quantity<input id="productID' + priceData[i].productID + '" class="form-control" type="number"size="1"min="0" max="999"/>' +
                    editButton +
                    '<br/><button style="width:100%"class="btn btn-primary" onclick="makeAnOrder(\'' + priceData[i].productID + '\')">buy</button></div></section><hr/>';

        }
        priceListBody.innerHTML = content;

    }
    //Το κάνουμε για να μπορέσουμε να καλέσουμε συνάρτηση μέσα σε συνάρτηση από  έξω
    openPriceListModalAndSetItems.getPriceListOnReceived = getPriceListOnReceived;
}
function viewOrders(gasStationID) {
    getModal("viewOrdersModal");
    getOrders(gasStationID);
    function getOrdersOnReceived(orders) {
        var ordersListBody = document.getElementById("ordersListBody");
        var tableElement = "<table class=\"table table-dark\">" +
                "<thead>" +
                "<tr>" +
                "<th scope=\"col\">#</th>" +
                "<th scope=\"col\">order id</th>" +
                "<th scope=\"col\">product id</th>" +
                "<th scope=\"col\">customer</th>" +
                "<th scope=\"col\">quantity</th>" +
                "<th scope=\"col\">order date</th>" +
                "</tr>" +
                "</thead>"
        "<tbody>";
        var rows = "";

        for (i = 0; i < orders.length; i++) {
            row = "<tr>" +
                    "<th scope=\"row\">" + i + "</th>" +
                    "<td>" + orders[i].orderID + "</td>" +
                    "<td>" + orders[i].priceData.productID + "</td>" +
                    "<td>" + orders[i].user.username + "</td>" +
                    "<td>" + orders[i].quantity + "</td>" +
                    "<td>" + orders[i].when + "</td>" +
                    "</tr>";
            rows += row;

        }
        tableElement += rows + "</thead></tbody>";
        ordersListBody.innerHTML = tableElement;

    }
    viewOrders.getOrdersOnReceived = getOrdersOnReceived;
}
function editProductModal(productID) {
    getModal("editProductModal");
    getProduct(productID);//makeAjaxCallsInApi.js
    function getProductOnReceived(product) {
        document.getElementById("fuelNormalName").value = product.fuelNormalName;
        document.getElementById("fuelName").value = product.fuelName;
        document.getElementById("fuelPrice").value = product.fuelPrice;
        document.getElementById("editProductButton").addEventListener("click", function () {
            editProduct(product)
        });


    }
    editProductModal.getProductOnReceived = getProductOnReceived;
}



function setStatisticsInElements(statistics) {
    document.getElementById("totalGasStations").innerHTML = statistics.allGasStations;
    document.getElementById("avgPrice").innerHTML = statistics.avgPrice;
    document.getElementById("minPrice").innerHTML = statistics.minPrice;
    document.getElementById("maxPrice").innerHTML = statistics.maxPrice;
}
