'use strict';

var app = {};
var form = document.getElementById('filesForm');
var submitBtn = document.getElementById('submitBtn');
var domReady = new Event('domReady');

(function () {
    function init(url, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.send(null);

        xhr.onreadystatechange = function () {
            var DONE = 4; // readyState 4 means the request is done.
            var OK = 200; // status 200 is a successful return.
            if (xhr.readyState === DONE) {
                if (xhr.status === OK) {
                    var responseObj = JSON.parse(xhr.responseText);
                    callback(responseObj);
                } else {
                    console.log('Error: ' + xhr.status);
                }
            }
        };
    }

    return app.getRequest = init;
})();

(function () {
    function insertLine(obj, parent) {
        var value;

        function insertInput(attrObj) {
            var cb = document.createElement('input')
            var label = document.createElement('label');
            var text = (typeof attrObj.labelText === 'string') ? document.createTextNode(attrObj.labelText) : attrObj.labelText;
            cb.setAttribute('id', attrObj.id);
            cb.setAttribute('type', attrObj.type);
            if (attrObj.name) {
                cb.setAttribute('name', attrObj.name);
            }
            if (attrObj.className.length) {
                cb.setAttribute('class', attrObj.className);
            }
            if (attrObj.checked) {
                cb.setAttribute('checked', 'checked');
            }
            if ( obj[attrObj.value].path) {cb.setAttribute('data-path', obj[attrObj.value].path);}
            if (attrObj.dataType) {cb.setAttribute('data-type', attrObj.dataType);}
            label.setAttribute('for', attrObj.id);
            label.appendChild(text);
            attrObj.parent.appendChild(cb);
            attrObj.parent.appendChild(label);
        }

        for (value in obj) {
            switch (obj[value].type) {
                case 'file':
                    insertInput({
                        type: 'radio',
                        name: 'selectFile',
                        value: value,
                        labelText: value,
                        className: 'line',
                        dataType: 'file',
                        id: value,
                        parent: parent
                    });
                    break;
                case  'environment':
                    insertInput({
                        type: 'checkbox',
                        value: value,
                        labelText: value,
                        className: 'line',
                        dataType: 'environment',
                        id: value,
                        checked: (value === 'chrome')? 'checked' : false,
                        parent: parent
                    });
                    break;
                default:
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
                    insertInput({
                        type: 'checkbox',
                        value: value,
                        labelText: openCloseContainer,
                        className: 'closeBtn',
                        dataType: 'close',
                        id: value + '_close',
                        checked: true,
                        parent: fieldset
                    });
                    insertInput({
                        type: 'radio',
                        name: 'selectFolder',
                        value: value,
                        labelText: 'select folder',
                        className: 'folderBtn',
                        dataType: 'dir',
                        id: value + '_entire',
                        parent: fieldset
                    });
                    insertInput({
                        type: 'checkbox',
                        value: value,
                        labelText: 'exclude folder',
                        className: 'folderBtn',
                        dataType: 'exclude',
                        id: value + '_entireExclude',
                        parent: fieldset
                    });
                    fieldset.appendChild(div);
                    insertLine(obj[value].subDir, div);
            }
        }
    }

    return app.insertLine = insertLine;
})();

(function () {

    function ajaxPost(form, url, callback) {
        var xhr = new XMLHttpRequest();
        var objToSend = {
            environments: [],
            dir: ''
        };


        [].filter.call(form.querySelectorAll('.line, .folderBtn'), function (el) {
                return el.checked;
            })
            //.filter(function(el) { return !!el.name; } //Nameless elements die.
            //.filter(function(el) { return el.disabled; }) //Disabled elements die.
            .forEach(function (el) {
                //Map each field into a name=value string, make sure to properly escape!
                switch (el.getAttribute('data-type')) {
                    case 'environment':
                        objToSend.environments.push(el.id);
                        break;
                    case 'dir':
                        objToSend.dir = el.getAttribute('data-path');
                        break;
                    case 'exclude':
                        if (!objToSend.exclude) {
                            objToSend.exclude = [];
                        }
                        objToSend.exclude.push(el.getAttribute('data-path'))
                        break;
                    default:
                        console.log(el.getAttribute('data-path'));
                        objToSend.file = el.getAttribute('data-path')
                }
            });

        xhr.open('POST', url);
        xhr.setRequestHeader('Content-type', 'application/json; charset=UTF-8');

        //.bind ensures that this inside of the function is the XHR object.
        xhr.onreadystatechange = function() {
            if (xhr.status !== 200) {
                alert('App not responding, check if it\'s running');
                return;
            }
            callback.call(null, xhr);
        }

        //All preperations are clear, send the request!
        xhr.send(JSON.stringify(objToSend));
    }

    return app.ajaxPost = ajaxPost;
})();

(function () {
    function init() {
        submitBtn.addEventListener('click', function (e) {
            e.preventDefault();
            app.ajaxPost(form, form.action, function () {
                var testRunningMsg = document.getElementById('testRunningMsg');
                testRunningMsg.style = '';
                setTimeout(function() {
                    testRunningMsg.style = 'display: none;';
                },2000);
                console.log('form submitted');
            });
        });
    }

    return app.handleFormSubmit = init;

})();

(function () {
    function init() {
        document.addEventListener('domReady', function() {
            function getSiblingBtn(btn) {
                return (function processNextSibling(el) {
                    if (el !== btn && el.classList.contains('folderBtn')) {return el;}
                    else {
                        if (!el.nextElementSibling) {return null;} else {return processNextSibling(el.nextElementSibling);}
                    }
                })(btn.parentElement.firstElementChild);
            }

            [].forEach.call(document.querySelectorAll('.folderBtn'), function (btn) {
                btn.addEventListener('click', function (e) {
                    if (e.currentTarget.checked) {
                        //Uncheck sibling button
                        var siblingBtn = getSiblingBtn(e.currentTarget);
                        if (siblingBtn && siblingBtn.checked) {
                            siblingBtn.checked = false;
                        }

                        //Uncheck file selection
                        if (e.currentTarget.dataset.type && e.currentTarget.dataset.type === 'dir') {
                            let fileBtnChecked = document.querySelector('[data-type="file"]:checked');
                            if (fileBtnChecked) {
                                fileBtnChecked.checked = false;
                            }
                        }
                    }
                });
            });
        });
    }

    return app.handleFolderClick = init;
})();

(function () {
    function init() {
        document.addEventListener('domReady', function() {

            [].forEach.call(document.querySelectorAll('[name="selectFile"]'), function (btn) {
                btn.addEventListener('click', function (e) {
                    let dirBtnChecked = document.querySelector('[data-type="dir"]:checked');
                    if (dirBtnChecked) {dirBtnChecked.checked = false;}
                });
            });
        });
    }

    return app.handleFileClick = init;
})();


app.getRequest('http://localhost:3000/environments', function (responseObj) {
    var envObj = {};
    Object.keys(responseObj).forEach(function (key) {
        envObj[key] = {};
        envObj[key].type = 'environment'
    });
    app.insertLine(envObj, document.getElementById('environmentsFormInner'));
});
app.getRequest('http://localhost:3000/features', function (responseObj) {
    app.insertLine(responseObj, document.getElementById('filesFormInner'));
    document.dispatchEvent(domReady);
});
app.handleFormSubmit();
app.handleFolderClick();
app.handleFileClick();



