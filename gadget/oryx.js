/**
 * Copyright (c) 2009-2010
 * processWave.org (Michael Goderbauer, Markus Goetz, Marvin Killing, Martin
 * Kreichgauer, Martin Krueger, Christian Ress, Thomas Zimmermann)
 *
 * based on oryx-project.org (Martin Czuchra, Nicolas Peters, Daniel Polak,
 * Willi Tscheschner, Oliver Kopp, Philipp Giese, Sven Wagner-Boysen, Philipp Berger, Jan-Felix Schwarz)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 **/
var oryx = {
    _dispatcherFunctions: {},
    _oryxLoaded: false,
    _messageBuffer: [],
    _adapter: null,
    
    initialize: function initialize() {
        window.addEventListener("message", oryx.dispatchMessage, false);
        oryx._adapter = adapter.connect("oryx");
        oryx._adapter.setModeCallback(oryx.modeChangedCallback);
        oryx._sendCurrentiewer();
        farbrausch.initialize();
        syncroWave.initialize();
    },
    
    addMessageDispatcher: function addMessageDispatcher(target, dispatcherFunction) {
        oryx._dispatcherFunctions[target] = dispatcherFunction;
    },
    
    dispatchMessage: function dispatchMessage(event) {
        if (event.origin !== "https://pwgoesplus.appspot.com" && event.origin !== "https://pwgoesplus-dev.appspot.com") {
            return;
        }
        var data = gadgets.json.parse(event.data);
        if (data.target === "oryx" && data.action === "loaded") {
            // Oryx has loaded, send initial commands to Oryx
            oryx._oryxLoaded = true;
                       
            for (var i = 0; i < oryx._messageBuffer.length; i++) {
                oryx._postMessage(oryx._messageBuffer[i]);
            }
        } else if (data.target === "oryx" && data.action === "showOryx") {
            splash.showOryx(); //can be found in splash.js
            oryx.sendMessage("oryx", "shown");
        } else {
            if (oryx._dispatcherFunctions.hasOwnProperty(data.target)) {
                oryx._dispatcherFunctions[data.target](data)
            } else {
                throw "Undispatched Message";
            }
        }
    },
    
    sendMessage: function sendMessage(target, action, message) {
        var packedMessage = {
            "target": target,
            "action": action,
            "message": message
        };

        if (!oryx._oryxLoaded) {
            oryx._messageBuffer.push(packedMessage);
        } else {
            oryx._postMessage(packedMessage);
        }
    },

    _postMessage: function _postMessage(message) {
        var oryxFrame = document.getElementById("oryxFrame").contentWindow;
        oryxFrame.postMessage(JSON.stringify(message), "*");
    }, 

    _sendCurrentiewer: function _sendCurrentiewer() {
        var viewer = oryx._adapter.getViewer();
        var viewerObj = {
            "id": viewer.id,
            "displayName": viewer.displayName,
            "thumbnailUrl": viewer.image.url	
        }
        oryx.sendMessage("oryx", "setUser", viewerObj);
    },
    
    modeChangedCallback: function modeChangedCallback(mode) {
        if (mode === oryx._adapter.Mode.VIEW) {
            oryx.sendMessage("oryx", "setMode", "view");
        } else if (mode === oryx._adapter.Mode.EDIT) {
            oryx.sendMessage("oryx", "setMode", "edit");
        }
    }

}