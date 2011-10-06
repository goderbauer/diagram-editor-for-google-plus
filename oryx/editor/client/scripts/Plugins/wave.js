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
 
if (!ORYX.Plugins) 
    ORYX.Plugins = new Object();
	
ORYX.Plugins.Wave = Clazz.extend({
    facade: undefined,
    
    construct: function construct(facade) {
        this.facade = facade;
        
        // Send Message to outer gadget frame via POST-Message using this event
        this.facade.registerOnEvent(ORYX.CONFIG.EVENT_POST_MESSAGE, this.handlePostMessage.bind(this));
        this.facade.registerOnEvent(ORYX.CONFIG.EVENT_SYNCRO_INITIALIZATION_DONE, this.handleInitializationDone.bind(this));
        window.addEventListener("message", this.handleIncomingCommand.bind(this), false);
        this.postMessage("oryx", "loaded");
        
        //Do not dispatch scrolling to wave
        /*jQuery($$(".ORYX_Editor")[0].parentNode).mousewheel(function (event, delta) {
            event.stopPropagation();
            return (
                    (event.originalEvent.wheelDeltaY < 0 && event.currentTarget.scrollTop + event.currentTarget.clientHeight < event.currentTarget.scrollHeight) ||
                    (event.originalEvent.wheelDeltaY > 0 && event.currentTarget.scrollTop > 0) ||
                    (event.originalEvent.wheelDeltaX > 0) ||
                    (event.originalEvent.wheelDeltaX < 0)
                   );
        });*/
    },
    
    handlePostMessage: function handlePostMessage(event) {
        this.postMessage(event.target, event.action, event.message);
    },
    
    postMessage: function postMessage(target, action, message) {
        var postMessage = {
                    'target': target,
                    'action': action,
                    'message': message
                };
        window.parent.postMessage(Object.toJSON(postMessage), "*");
    },
    
    handleIncomingCommand: function handleIncomingCommand(event) {
        var data = event.data.evalJSON();
        
        if (data.target === "oryx" && data.action === "setUser") {
            this.facade.raiseEvent({
                'type': ORYX.CONFIG.EVENT_USER_CHANGED,
                'user': data.message
            });
        } else if (data.target === "oryx" && data.action === "setMode") {
            this.setModeTo(data.message);
        } else if ((data.target === "oryx" && data.action === "shown")) {
            this.facade.raiseEvent({
                'type': ORYX.CONFIG.EVENT_ORYX_SHOWN
            });
            if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
                this.updateLablesForFirefox();
            }
        } else if (data.target === "oryx" && data.action === "import") {
			console.log("Import message received:" + data.message);
            this.facade.importJSON(data.message, true);
        } else {
            this.facade.raiseEvent({
                'type': ORYX.CONFIG.EVENT_NEW_POST_MESSAGE_RECEIVED,
                'data': data
            });
        }
    },
    
    // FireFox has a text wrapping-Bug: It cannot wrap text, that is not visible.
    // We therefore have to update each label after it is displayed.
    updateLablesForFirefox: function updateLablesForFirefox() {
        var labels = ORYX.Core.SVG.Labels;
        for (var i = 0; i < labels.length; i++) {
            labels[i]._isChanged = true;
            labels[i].update();
        }
    },
    
    setModeTo: function setModeTo(mode) {
        if (mode === "edit") {
            this.facade.raiseEvent({
                'type': ORYX.CONFIG.EVENT_HIDE_SCHLAUMEIER
            });
            this.facade.raiseEvent({
                'type': ORYX.CONFIG.EVENT_BLIP_TOGGLED,
                'editMode': true
            });
        } else {
            this.facade.raiseEvent({
                'type': ORYX.CONFIG.EVENT_DISPLAY_SCHLAUMEIER,
                'message': "Install \"Diagram Editor\" app to edit diagramm.",
                'showtimes': "always",
                'duration': "infinite"
            });
            this.facade.raiseEvent({
                'type': ORYX.CONFIG.EVENT_BLIP_TOGGLED,
                'editMode': false
            });
        }
    },
    
    handleInitializationDone: function handleInitializationDone(evt) {
        this.postMessage("oryx", "showOryx");
    }
});