function getModal(type) {

    var xmlhttp = initAJAX();

    if (type == "modalOrder") {
        file = "views/fragments/modalOrder.html";

    } else if (type == "priceListModal") {
        file = "views/fragments/pricelistModal.html";

    } else if (type == "viewOrdersModal") {
        file = "views/fragments/viewOrdersModal.html";
    } else if (type == "editProductModal") {
        file = "views/fragments/editProductModal.html";
    } else {

        file = "views/fragments/loginModal.html";
    }
    xmlhttp.open("GET", file, true);
    xmlhttp.send();
    //callback
    xmlhttp.onreadystatechange = function () {

        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var file = this.responseText;

            document.getElementById("modal").innerHTML = file;

            $("#modal").modal()
        }
    }

}
