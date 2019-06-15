function closeMessage(elementId){
        document.getElementById(elementId).style.display = "none";

}

function openMessage(elementId, message) {
  var messageElement = document.getElementById(elementId);
    messageElement.style.display = "block";
    messageElement.innerHTML = " <a  class=\"close\" onclick=\"closeMessage('"+elementId +"')\">&times;</a>"+message;
}
