var xhr = new XMLHttpRequest();
xhr.open('GET', 'http://localhost:3000/features', true);
xhr.send(null);

xhr.onload = function () {
  var DONE = 4; // readyState 4 means the request is done.
  var OK = 200; // status 200 is a successful return.
  if (xhr.readyState === DONE) {
    if (xhr.status === OK) {
      console.log(xhr.responseText); // 'This is the returned text.'
    } else {
      console.log('Error: ' + xhr.status); // An error occurred during the request.
    }
  }
};

//function getCORS(url, success) {
//    var xhr = new XMLHttpRequest();
//    xhr.open('GET', url);
//    xhr.onload = success;
//    xhr.send();
//    return xhr;
//}
//
//// example request
//getCORS('http://localhost:3000/features', function(request){
//    var response = request.currentTarget.response || request.target.responseText;
//    console.log(response);
//});