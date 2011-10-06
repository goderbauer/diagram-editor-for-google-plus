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

ORYX.Plugins.Farbrausch = Clazz.extend({
	facade: undefined,
    _userObjects: {}, // From Participants Callback, most up-to-date
    _offlineUserObjects : {}, // From State, to be used when user has left hangout and is not among participants anymore
    _colorMapping: {},
    _firstUpdateReceived: false,
    _colorPalette: ["#cc0000",
                    "#33cc00",
                    "#ff9900",
                    "#9acd32",
                    "#0099cc",
                    "#000099",
                    "#336633",
                    "#cc00cc",
                    "#ffff66",
                    "#990066",
                    "#660000",
                    "#a9a9a9",
                    "#ffffff",
                    "#33ccff",
                    "#ff69b4",
                    "#ff9999",
                    "#2e8b57",
                    "#daa520"],
                    
    _defaultColor: "#000000",
	
	construct: function construct(facade) {
		this.facade = facade;
        this.facade.registerOnEvent(ORYX.CONFIG.EVENT_NEW_POST_MESSAGE_RECEIVED, this.handleNewPostMessageReceived.bind(this));
        this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MODE_CHANGED, this._handleModeChanged.bind(this));
    },
    
    _handleModeChanged: function _handleModeChanged(evt) {
        if (evt.mode.isEditMode() && !(this.facade.getUser().id in this._colorMapping)) {
            this.pickOwnColor();
        }
    },
    
    pickOwnColor: function pickOwnColor() {
        //it is possible that the mode_changed event arrives before the very first stateUpdated
        //since we need the information of the stateUpdated-Callback, we have to wait
        if (!this._firstUpdateReceived) {
            setTimeout(this.pickOwnColor.bind(this), 1000 * Math.random());
            return;
        }
        var user = this.facade.getUser();
        if (!(user.id in this._colorMapping)) {
            this._saveColor(user, this._getNextFreeColor());
        }
    },
    
    handleNewPostMessageReceived: function handleNewPostMessageReceived(event) {
        var data = event.data;
        if (data.target !== "farbrausch") {
            return;
        }
    
        if (data.action === "update") {
            this._firstUpdateReceived = true;
            this._mergeColorMapping(data.message.mapping);
        } else if (data.action === "participants") {
            this._mergeParticipants(data.message.participants);
        } else {
            throw "Unknown farbrausch action: " + data.action;
        }
        this._raiseFarbrauschNewInfosEvent();
    },
    
    _mergeParticipants: function _mergeParticipants(participants) {
        for (var i = 0; i < participants.length; i++) {
            var participant = participants[i];
            if (!this._userObjects.hasOwnProperty(participant.id)) {
                this._userObjects[participant.id] = participant;
            }
        }
    },
    
    _mergeColorMapping: function _mergeColorMapping(mapping) {
        var keys = this._getKeys(mapping);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            this._colorMapping[key] = mapping[key].color;
            this._offlineUserObjects[key] = mapping[key];
        }
        
        this._conflictHandling();
    },
    
    _raiseFarbrauschNewInfosEvent: function _raiseFarbrauschNewInfosEvent() {
        this.facade.raiseEvent({
            type: ORYX.CONFIG.EVENT_FARBRAUSCH_NEW_INFOS,
            users: this._getMergedColorMappingAndUserObjects(),
            ownUserId: this.facade.getUser().id
        });
    },
    
    _getMergedColorMappingAndUserObjects: function _getMergeColorMappingAndUserObjects() {
        var eventData = {};  
        for (var key in this._colorMapping) {
            if (this._colorMapping.hasOwnProperty(key) && this._userObjects.hasOwnProperty(key)) {
                eventData[key] = { 
                    id: this._userObjects[key].id,
                    thumbnailUrl: this._userObjects[key].thumbnailUrl,
                    displayName: this._userObjects[key].displayName,
                    color: this._colorMapping[key]
                };                    
            } else if (this._colorMapping.hasOwnProperty(key) && this._offlineUserObjects.hasOwnProperty(key)) {
                eventData[key] = { 
                    id: this._offlineUserObjects[key].id,
                    thumbnailUrl: this._offlineUserObjects[key].thumbnailUrl,
                    displayName: this._offlineUserObjects[key].displayName + " (offline)",
                    color: this._colorMapping[key]
                };   
            }
        }
        return eventData;
    },
    
    _conflictHandling: function _conflictHandling() {
        var user = this.facade.getUser();
        var ids = this._getKeys(this._colorMapping);
        var selfColor = this._colorMapping[user.id];
        
        if (selfColor === this._defaultColor) {
            // No conflict resolution when default color.
            return;
        }
        
        for (var i = 0; i < ids.length; i++) {
            var id = ids[i];
            if (this._colorMapping[id] === selfColor && user.id < id) {
                this._saveColor(user, this._getNextFreeColor());
                break;
            }
        }
    },
    
    _saveColor: function _saveColor(user, color) {
        this._colorMapping[user.id] = color;
        var mapping = {
                        "id": user.id,
                        "color": color,
                        "displayName": user.displayName,
                        "thumbnailUrl": user.thumbnailUrl	
                      }
        this._offlineUserObjects[user.id] = mapping;
        this.facade.raiseEvent({
            type: ORYX.CONFIG.EVENT_POST_MESSAGE,
            target: "farbrausch",
            action: "setColor",
            message: mapping
        });
    },

    _getNextFreeColor: function _getNextFreeColor() {
        var unusedColors = this._arrayDifference(this._colorPalette, this._getValues(this._colorMapping));
        if (unusedColors.length !== 0) {
            return unusedColors[0];
        }
        return this._defaultColor; 
    },
    
    _getColor: function _getColor(index) {
        if (index < this._colorPalette.length) {
            return this._colorPalette[index];
        }
        return this._defaultColor;
    },
    
    _getKeys: function _getKeys(hash) {
        var keys = [];
        for(i in hash) {
            if (hash.hasOwnProperty(i)) {
                keys.push(i);
            }
        }
        return keys;
    },
    
    _getValues: function _getValues(hash) {
        var values = [];
        for(i in hash) {
            if (hash.hasOwnProperty(i)) {
                values.push(hash[i]);
            }
        }
        return values;
    },
    
    _arrayDifference: function _arrayDifference(a1, a2) {
        var difference = [];
        for (var i = 0; i < a1.length; i++) {
            if (this._notIn(a1[i], a2)) {
                difference.push(a1[i]);
            }
        }        
        return difference;
    },
    
    _notIn: function _notIn(element, array) {
        for (var i = 0; i < array.length; i++) {
            if (array[i] === element) {
                return false;
            }
        }
        return true;
    }
});