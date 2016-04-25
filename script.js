var app = {};
var form = document.getElementById('filesForm');
var submitBtn = document.getElementById('submitBtn');

(function () {
  function init() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://localhost:3000/features', true);
    xhr.send(null);
    
    xhr.onreadystatechange = function () {
      var DONE = 4; // readyState 4 means the request is done.
      var OK = 200; // status 200 is a successful return.
      if (xhr.readyState === DONE) {
        if (xhr.status === OK) {
          var responseObj = JSON.parse(xhr.responseText); 
          //console.log(responseObj);
          app.insertLine(responseObj, document.getElementById('filesFormInner'));
        } else {
          console.log('Error: ' + xhr.status); // An error occurred during the request.
        }
      }
    };
  }
  
  return app.requestFiles = init;
})();

(function() {
  function insertLine(obj, parent) {
   
    function insertCb(attrObj) {
      var cb = document.createElement('input')
      var label = document.createElement('label');
      var text = (typeof attrObj.labelText === 'string')? document.createTextNode(attrObj.labelText) : attrObj.labelText;
      cb.setAttribute('id',attrObj.id);
      cb.setAttribute('type','checkbox');
      if (attrObj.className.length) {cb.setAttribute('class',attrObj.className);}
      if (attrObj.checked) {cb.setAttribute('checked','checked');}
      cb.setAttribute('data-path', obj[attrObj.value].path);
      cb.setAttribute('data-type', obj[attrObj.value].type);
      label.setAttribute('for', attrObj.id);
      label.appendChild(text);
      attrObj.parent.appendChild(cb);
      attrObj.parent.appendChild(label);
    }
    
    for (value in obj) {
      if (obj[value].type === 'file') {
        insertCb({
          value: value,
          labelText: value,
          className: 'line',
          id: value,
          parent: parent 
        });
      } else {
        var fieldset = document.createElement('fieldset');
        var legend = document.createElement('legend');
        var text = document.createTextNode(value);
        var div = document.createElement('div');
        var closeContainer = document.createElement('span');
        var openContainer = document.createElement('span');
        var openCloseContainer = document.createElement('span');
        var openText = document.createTextNode('open');
        var closeText = document.createTextNode('close');
        openContainer.appendChild(openText);
        openContainer.setAttribute('class', 'openTxt');
        closeContainer.appendChild(closeText);
        closeContainer.setAttribute('class', 'closeTxt');
        openCloseContainer.appendChild(openContainer);
        openCloseContainer.appendChild(closeContainer);
        legend.appendChild(text);
        fieldset.appendChild(legend);
        parent.appendChild(fieldset);
        insertCb({
           value: value,
           labelText: openCloseContainer,
           className: 'closeBtn',
           id: value+'_close',
           checked: true,
           parent: fieldset
         });
        insertCb({
           value: value,
           labelText: 'ENTIRE FOLDER',
           className: 'folderBtn',
           id: value+'_entire',
           parent: fieldset
         });
        fieldset.appendChild(div);
        insertLine(obj[value].subDir, div);
      }
    }
  }
  
  return app.insertLine = insertLine;
})();

(function(){

  function ajaxPost (form, url, callback) {
      var xhr = new XMLHttpRequest();
      var objToSend = {};
          
      [].filter.call(form.querySelectorAll('.line, .folderBtn'), function(el) {
          return el.checked;
      })
      //.filter(function(el) { return !!el.name; } //Nameless elements die.
      //.filter(function(el) { return el.disabled; }) //Disabled elements die.
      .forEach(function(el) {
          //Map each field into a name=value string, make sure to properly escape!
          objToSend[el.id] = {
            type: el.getAttribute('data-type'),
            path: el.getAttribute('data-path')
          };
      });
  
      xhr.open('POST', url);
      xhr.setRequestHeader('Content-type', 'application/json; charset=UTF-8');
  
      //.bind ensures that this inside of the function is the XHR object.
      xhr.onload = callback.bind(xhr); 
  
      //All preperations are clear, send the request!
      xhr.send(JSON.stringify(objToSend));
  }
  
  return app.ajaxPost = ajaxPost;
})();

(function(){
  function init() {
    submitBtn.addEventListener('click', function(e) {
      e.preventDefault();
      app.ajaxPost(form, form.action, function() {
        console.log('form submitted');  
      });
    });
  }
  
  return app.handleFormSubmit = init;
  
})();

app.requestFiles();
app.handleFormSubmit();



