'use strict';

(function () {
    var app = {};
    var form = document.getElementById('filesForm');
    var submitBtn = document.getElementById('submitBtn');
    var includedFeaturesWrapper = document.getElementById('includedFeatures');
    var excludedFeaturesWrapper = document.getElementById('excludeddFeatures');
    var featureListReady = new Event('featureListReady');
    var tags = [];
    var featuresObj = {};

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

    (function() {
        function printFeature(featureArray, parent) {
            parent.innerHTML = '';

            featureArray.forEach(function(feature) {
                var featureEl = document.createElement('li');
                var featureTxt = document.createTextNode(feature);
                featureEl.appendChild(featureTxt);
                parent.appendChild(featureEl);
            })
        }

        app.printFeature = printFeature;
    })();
    (function () {

        function insertTags(tagsArr, parent) {
            tagsArr.forEach(function (tag) {
                var tagEl = document.createElement('li');
                var tagText = document.createTextNode(tag);
                tagEl.appendChild(tagText);
                tagEl.setAttribute('draggable', true);
                tagEl.id = tag;
                tagEl.className = 'tag';
                parent.appendChild(tagEl);
                tagEl.addEventListener('dragstart', function (e) {
                    console.log('dragstart');
                    e.dataTransfer.setData("text/plain", e.target.id);
                    e.dataTransfer.dropEffect = "move";
                    e.dataTransfer.effectAllowed = "move";
                })
            });
        }

        function arrayIntersect(arr1, arr2) {
            var arrays = [arr1, arr2];

            return arrays.sort().shift().filter(function(v) {
                return arrays.every(function(a) {
                    return a.indexOf(v) !== -1;
                });
            });
        }



        function updateSelectedFeatures() {
            var includedTag = app.getTags().included;
            var excludedTag = app.getTags().excluded;
            var includedFeature = [];
            var excludedFeature = [];

            (function parseFeature(featuresObj) {
                Object.keys(featuresObj).forEach(function(key){
                   if (featuresObj[key].type === 'file' && featuresObj[key].tags) {
                       if (arrayIntersect(featuresObj[key].tags, includedTag).length) {
                           includedFeature.push(featuresObj[key].path.replace(/^.*features/,''));
                       }
                       if (arrayIntersect(featuresObj[key].tags, excludedTag).length) {
                           excludedFeature.push(featuresObj[key].path.replace(/^.*features/,''));
                       }
                       return;
                   } else {
                       if (!featuresObj[key].subDir) {
                           return;
                       } else {
                           return parseFeature(featuresObj[key].subDir)
                       }
                   }
                });
            })(featuresObj);

            app.printFeature(includedFeature, includedFeaturesWrapper);
            app.printFeature(excludedFeature, excludedFeaturesWrapper);
        }

        function init(tagsArr) {
            insertTags(tagsArr, document.getElementById('tagsList'));
            document.addEventListener('dragover', function (e) {
                e.preventDefault();
            });
            document.addEventListener('dragenter', function (e) {
                e.preventDefault();
            });
            document.addEventListener('drop', function (e) {
                e.preventDefault();
                if (e.target.classList.contains('tagsDropArea') || e.target.parentNode.classList.contains('tagsDropArea')) {
                    var data = e.dataTransfer.getData("text");
                    var el = (e.target.classList.contains('tagsDropArea'))? e.target : e.target.parentNode;
                    el.querySelector('ul').appendChild(document.getElementById(data));
                    updateSelectedFeatures();
                }
            });

            //Show container
            document.getElementById('tagsFormWrapper').style = '';
        }

        return app.manageTags = init;
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
                if (obj[attrObj.value].path) {
                    cb.setAttribute('data-path', obj[attrObj.value].path);
                }
                if (attrObj.dataType) {
                    cb.setAttribute('data-type', attrObj.dataType);
                }
                label.setAttribute('for', attrObj.id);
                if (attrObj.labelClass) {
                    label.className = attrObj.labelClass;
                }
                label.appendChild(text);
                attrObj.parent.appendChild(cb);
                attrObj.parent.appendChild(label);
            }

            for (value in obj) {
                switch (obj[value].type) {
                    case 'file':
                        let localTags = obj[value].tags;
                        let localTagsLabel = '';
                        if (localTags && localTags.length) {
                            tags = tags.concat(localTags);
                            localTagsLabel = ' (TAG: ' + localTags.join(', ') + ')';
                        }
                        insertInput({
                            type: 'radio',
                            name: 'selectFile',
                            value: value,
                            labelText: value + localTagsLabel,
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
                            checked: (value === 'chrome') ? 'checked' : false,
                            parent: parent
                        });
                        break;
                    default: //directories
                        var fieldset = document.createElement('fieldset');
                        var legend = document.createElement('legend');
                        var text = document.createTextNode(value);
                        var div = document.createElement('div');
                        var closeContainer = document.createElement('span');
                        var openContainer = document.createElement('span');
                        var openCloseContainer = document.createElement('span');
                        var openText = document.createTextNode('open');
                        var closeText = document.createTextNode('close');
                        fieldset.className = 'folderWrapper';
                        div.setAttribute('class', 'featureFiles');
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
                            labelClass: 'button',
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
                            labelClass: 'button',
                            dataType: 'dir',
                            id: value + '_entire',
                            parent: fieldset
                        });
                        insertInput({
                            type: 'checkbox',
                            value: value,
                            labelText: 'exclude folder',
                            className: 'folderBtn',
                            labelClass: 'button',
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
        function init() {
            var tagsIncluded = [].map.call(document.querySelectorAll('#tagsIncluded li'), function (tagEl) {
                return tagEl.id;
            });
            var tagsExcluded = [].map.call(document.querySelectorAll('#tagsExcluded li'), function (tagEl) {
                return tagEl.id;
            });

            return {
                included: tagsIncluded,
                excluded: tagsExcluded
            }
        }

        return app.getTags = init;
    })();

    (function () {

        function ajaxPost(form, url, callback) {
            var xhr = new XMLHttpRequest();
            var objToSend = {
                environments: [],
                dir: ''
            };
            var tagsIncluded = app.getTags().included;
            var tagsExcluded = app.getTags().excluded;


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
                            objToSend.file = el.getAttribute('data-path')
                    }
                });

            if (tagsIncluded.length) {
                objToSend.tagsIncluded = tagsIncluded;
            }

            if (tagsExcluded.length) {
                objToSend.tagsExcluded = tagsExcluded;
            }

            xhr.open('POST', url);
            xhr.setRequestHeader('Content-type', 'application/json; charset=UTF-8');

            //.bind ensures that this inside of the function is the XHR object.
            xhr.onreadystatechange = function () {
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
                    setTimeout(function () {
                        testRunningMsg.style = 'display: none;';
                    }, 2000);
                    console.log('form submitted');
                });
            });
        }

        return app.handleFormSubmit = init;

    })();

    (function () {
        function init() {
            document.addEventListener('featureListReady', function () {
                function getSiblingBtn(btn) {
                    return (function processNextSibling(el) {
                        if (el !== btn && el.classList.contains('folderBtn')) {
                            return el;
                        }
                        else {
                            if (!el.nextElementSibling) {
                                return null;
                            } else {
                                return processNextSibling(el.nextElementSibling);
                            }
                        }
                    })(btn.parentElement.firstElementChild);
                }

                [].forEach.call(document.querySelectorAll('.folderBtn'), function (btn) {
                    btn.addEventListener('click', function (e) {
                        if (e.currentTarget.checked) {
                            //Uncheck sibling button
                            let siblingBtn = getSiblingBtn(e.currentTarget);
                            if (siblingBtn && siblingBtn.checked) {
                                siblingBtn.checked = false;
                            }

                            //Uncheck file selection
                            let elType = e.currentTarget.dataset.type;
                            if (elType && (elType === 'dir' || elType === 'exclude')) {
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

    (function() {
        function getParentFolderBtn(el, elType) {
            if (el.dataset.type && el.dataset.type === elType) {
                return el
            } else {
                return getParentFolderBtn(el.nextElementSibling, elType);
            }
        };

        return app.getParentFolderBtn = getParentFolderBtn;
    })();

    (function () {
        function init() {
            document.addEventListener('featureListReady', function () {

                [].forEach.call(document.querySelectorAll('[name="selectFile"]'), function (btn) {
                    btn.addEventListener('click', function (e) {
                        let parentFolderBtn = app.getParentFolderBtn(e.currentTarget.closest('fieldset').firstElementChild, 'dir');
                        let parentExcludeFolderBtn = app.getParentFolderBtn(e.currentTarget.closest('fieldset').firstElementChild, 'exclude');

                        if (!parentFolderBtn.checked) {
                            parentFolderBtn.checked = true;
                        }

                        if (parentExcludeFolderBtn.checked) {
                            parentExcludeFolderBtn.checked = false;
                        }
                    });
                });
            });
        }

        return app.handleFileClick = init;
    })();

    (function () {
        function init() {
            document.getElementById('resetButton').addEventListener('click', function () {
                var tagList = document.getElementById('tagsList');

                [].forEach.call(document.querySelectorAll('.tagsDropAreaWrapper li'), function (tag) {
                    tagList.appendChild(tag);
                });

                app.printFeature([], includedFeaturesWrapper);
                app.printFeature([], excludedFeaturesWrapper);
            });
        }

        return app.resetClick = init;
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
        featuresObj = responseObj;
        app.insertLine(responseObj, document.getElementById('filesFormInner'));
        if (tags.length) {
            let uniqueTags = tags.sort().filter(function (item, pos, self) {
                return self.indexOf(item) === pos;
            });
            app.manageTags(uniqueTags);
        }
        document.dispatchEvent(featureListReady);
    });
    app.handleFormSubmit();
    app.handleFolderClick();
    app.handleFileClick();
    app.resetClick();

})();
