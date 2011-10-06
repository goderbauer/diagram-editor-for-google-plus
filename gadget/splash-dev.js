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

var splash = {

    gOryxXhtmlPath: "https://pwgoesplus.appspot.com/gadget/oryx-dev.xhtml",

    gStatusMessages: [  "Loading core features", 
                        "Loading the user experience",
                        "Loading stencil set",
                        "Loading your model",
                        "Loading good karma into your browser",
                        "Calculating the answer to life",
                        "Man, this takes like for ever to load...",
                        "Time for coffee!",
                        "Hello? Anybody at home?",
                        "That's it! I am out of messages..."
                     ],
                     
    gCurrentStatusMessage: 0,
    gStencilSetSelected: false,

    initialize: function initialize(bool) {
        // When the user clicks on a stencilset button load the editor with the corresponding stencilset
        $(".selection-button").click(
            function onStencilsetClicked() {
                var stencilset = $(this).attr('id').substr(10); // strip selection_ from the id to get the stencilset name
                splash.loadOryx(stencilset);
            }
        );
        gapi.hangout.data.addStateChangeListener(splash.stateUpdatedCallback);
        // Google+ does not throw callback at the beginning, wave did.
        splash.stateUpdatedCallback(null, null, gapi.hangout.data.getState(), null);
    },

    stateUpdatedCallback: function stateUpdatedCallback(adds, removes, state, metadata) {
        if (splash.gStencilSetSelected) {
            return;
        }
        var stencilSet = state["stencilSet"];
        var importURL = state["wavethis_referer"];
        //var importURL = "http://oryx-project.org/backend/poem/model/9496/json"; //for testing (bpmn2.0-model)
        if (stencilSet) {
            splash.loadOryx(stencilSet);
        } else if (importURL) {
            var params = {};
            importURL = importURL + "?" + Math.random();
            params[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.JSON;
            gadgets.io.makeRequest(importURL, splash.processModelJSON, params); 
        } else {
            splash.showStencilSetSelection();
        }
    },
    
    processModelJSON: function processModelJSON(obj) {
        importJSON = obj.data;
        stencilSetURL = importJSON.stencilset.url;
        var stencilSet;
        var match = stencilSetURL.match(/\/([^\/]+).json/);
        if (match) {
            stencilSet = match[1];
			if (stencilSet === "petrinet") {
				stencilSet = "petrinets";
				// For some reason, we use petrinets/petrinets.json, while Oryx uses the singular...
			}
            splash.loadOryx(stencilSet, importJSON);
        } else {
            // This should not happen, if it does show the stencilsetselection
            splash.showStencilSetSelection();
        }
    },

    showStencilSetSelection: function showStencilSetSelection() {
        $("#splash-loading").hide();
        $("#stencilset-selection").show();
    },

    loadOryx: function loadOryx(stencilSet, importJSON) {
        gapi.hangout.data.submitDelta({"stencilSet" : stencilSet}, []);
        $("#stencilset-selection").hide();
        $("#splash-loading").show();
        splash.gStencilSetSelected = true;
        window.setTimeout(splash.changeStatusMessage, 1500);
        var oryxUrl = splash.gOryxXhtmlPath + "?stencilSetName=" + stencilSet;
        splash.loadJavaScriptsAndThenOryx(oryxUrl, stencilSet, importJSON);
    },

    changeStatusMessage: function changeStatusMessage() {
        if (splash.gCurrentStatusMessage >= splash.gStatusMessages.length) {
            return;
        }
        $("#statusMessage").fadeOut(callback = function changeStatusMessageCallback() {
            $("#statusMessage").html(splash.gStatusMessages[splash.gCurrentStatusMessage++]).fadeIn();
            window.setTimeout(changeStatusMessage, 3900);
        });
    },

    showOryx: function showOryx() {
        $("#oryx").show();
        $("#splashScreen").hide();
        splash.adjustSizeOfOryx();
        $(window).resize(splash.adjustSizeOfOryx)
    },
    
    adjustSizeOfOryx: function adjustSizeOfOryx() {
        var height = document.documentElement.clientHeight;
        $('#oryxFrame').height(height + 'px');
    },
    
    loadJavaScriptsAndThenOryx: function loadJavaScriptsAndThenOryx(oryxUrl, stencilSet, importJSON) {
        adapter.initialize();
        gapi.hangout.data.removeStateChangeListener(splash.stateUpdatedCallback);
        stencilsetPolice.initialize(stencilSet);
        oryx.initialize();
        if (typeof importJSON !== "undefined") {
            oryx.sendMessage("oryx", "import", importJSON);
        }
        $("#oryxFrame").attr("src", oryxUrl);
    }
}

window.onload = function onLoad() {
    gapi.hangout.addApiReadyListener(splash.initialize);
}