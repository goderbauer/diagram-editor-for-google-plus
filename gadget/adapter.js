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

var adapter = {
    _modeCallbacks: [],
    _participantsCallbacks: [],
    _modes: {VIEW : "view", EDIT : "edit"},
    _mode: null,
    _stateCallbacks: [],
    _delimiter: "\\",
    
    _gadgetState: {},

    initialize: function initialize() {
        adapter._mode = adapter._currentMode();
        gapi.hangout.addAppParticipantsListener(adapter._participantUpdatedCallback);
        gapi.hangout.data.addStateChangeListener(adapter._stateUpdatedCallback);
        adapter._gadgetState = gapi.hangout.data.getState();
    },
    
    connect: function connect(prefix) {
        if (typeof prefix !== "string") {
            throw "type of prefix must be string";
        }
        if (prefix != "") {
            prefix = prefix + adapter._delimiter;
        }
        
        return  {   
                    getParticipants: function getParticipants() {
                        return gapi.hangout.getParticipants();
                    },
                    
                    getState: function getState() {
                        return  { 
                                    get: function get(key) {
                                        return adapter._get(prefix, key);
                                    },
                    
                                    getKeys: function getKeys() {
                                        return adapter._getKeys(prefix);
                                    },
        
                                    submitDelta: function submitDelta(delta) {
                                        return adapter._submitDelta(prefix, delta);
                                    },
                    
                                    submitValue: function submitValue(key, value) {
                                        return adapter._submitValue(prefix, key, value);
                                    }
                                 };
                    },
                    
                    getViewer: function getViewer() {
                        return gapi.hangout.getParticipantById(gapi.hangout.getParticipantId());
                    },
                    
                    setModeCallback: function setModeCallback(callback) {
                        adapter._modeCallbacks.push(callback);
                        callback(adapter._mode);
                    },
                    
                    setParticipantCallback: function setParticipantCallback(callback) {
                        adapter._participantsCallbacks.push(callback);
                        callback(gapi.hangout.getParticipants());
                    },
                    
                    setStateCallback: function setStateCallback(callback) {
                        adapter._stateCallbacks.push(callback);
                        callback();
                    },
                    
                    Mode: adapter._modes
                };
    },
    
    _get: function _get(prefix, key) {
        var finalKey = prefix + key;
        return adapter._gadgetState[finalKey];
    },
    
    _getKeys: function _getKeys(prefix) {
        var keys = [];
        for (var key in adapter._gadgetState) {
            if (adapter._gadgetState.hasOwnProperty(key) && key.indexOf(prefix) === 0) {
                keys.push(key);
            }
        }
        return adapter._removePrefixFromKeys(prefix, keys);
    },
    
    _removePrefixFromKeys: function _removePrefixFromKeys(prefix, keys) {
        var returnKeys = [];
        
        for (var i = 0; i < keys.length; i++) {
            if (keys[i].substr(0,prefix.length) === prefix) {
                returnKeys.push(keys[i].substring(prefix.length));
            }
        }

        return returnKeys;
    },
    
    _submitDelta: function _submitDelta(prefix, delta) {
        var newDelta = {};
        for (var key in delta) {
            if (delta.hasOwnProperty(key)) {
                newDelta[prefix + key] = delta[key];
            }
        }
        gapi.hangout.data.submitDelta(newDelta, []);
    },
    
    _submitValue: function _submitValue(prefix, key, value) {
        var delta = {};
        delta[key] = value;
        adapter._submitDelta(prefix, delta);
    },
    
    _participantUpdatedCallback: function _participantUpdatedCallback(participants) {
        // Participant Callback can also mean, that current viewer (de-)installed App -> mode change required?
        var newMode = adapter._currentMode();
        if (adapter._mode != newMode) {
            adapter._mode = newMode;
            adapter._invokeModeCallbacks();
        }
        
        for (var i = 0; i < adapter._participantsCallbacks.length; i++) {
            adapter._participantsCallbacks[i](participants);
        }
    },

    _stateUpdatedCallback: function _stateUpdatedCallback(adds, removes, state, metadata) {
        adapter._gadgetState = state;
        adapter._invokeStateCallbacks();
    },
    
    _invokeStateCallbacks: function _invokeStateCallbacks() {
        for (var i = 0; i < adapter._stateCallbacks.length; i++) {
            adapter._stateCallbacks[i]();
        }
    },
    
    _invokeModeCallbacks: function _invokeModeCallbacks() {
        for (var i = 0; i < adapter._participantsCallbacks.length; i++) {
            adapter._modeCallbacks[i](adapter._mode);
        }
    },
   
    _currentMode: function _currentMode() {
        var currentViewer = gapi.hangout.getParticipantById(gapi.hangout.getParticipantId());
        var mode = adapter._modes.VIEW;
        if (currentViewer.hasAppInstalled) {
            mode = adapter._modes.EDIT;
        }
        return mode;
    }
}