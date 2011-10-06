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

ORYX.Plugins.FarbrauschLegend = ORYX.Plugins.AbstractPlugin.extend({

    _users: {},
    usersDiv: null,
    tabEntriesLastActivity: {},
    tabEntries: {},
    
    construct: function construct() {
        arguments.callee.$.construct.apply(this, arguments);
        
        this.usersDiv = this.createUsersTab();
        Element.extend(this.usersDiv);
        
        this.facade.registerOnEvent(ORYX.CONFIG.EVENT_FARBRAUSCH_NEW_INFOS, this.handleFarbrauschEvent.bind(this));
        this.facade.registerOnEvent(ORYX.CONFIG.EVENT_AFTER_COMMANDS_EXECUTED, this.handleEventExecuted.bind(this));
    },
    
    onLoaded: function onLoaded(event) {
        this.addUsersTab();
    },
    
    addUsersTab: function addUsersTab() {
        this.facade.raiseEvent({
            'tabid': 'pwave-users',
            'type': ORYX.CONFIG.EVENT_SIDEBAR_NEW_TAB,
            'forceExecution': true,
            'tabTitle': 'Editors',
            'tabOrder': 0,
            'tabDivEl': this.usersDiv
        });
    },
    
    createUsersTab: function createUsersTab() {
        return document.createElement('div');
    },
    
    addEntryForId: function addEntryForId(userId) {
        var entry = Element.extend(document.createElement('div'));
        entry.className = "entry";
        
        var colorDiv = Element.extend(document.createElement('div'));
        colorDiv.className = "userColor";
        entry.appendChild(colorDiv);
        
        var imgDiv = Element.extend(document.createElement('div'));
        imgDiv.className = "userAvatar";
        var img = Element.extend(document.createElement('img'));
        imgDiv.appendChild(img);
        entry.appendChild(imgDiv);
        
        var infoDiv = Element.extend(document.createElement('div'));
        infoDiv.className = "userInfo";
        entry.appendChild(infoDiv);
        
        var lastActivity = Element.extend(document.createElement('div'));
        lastActivity.className = "userLastActivity";
        this.tabEntriesLastActivity[userId] = lastActivity;
        
        entry.appendChild(lastActivity);
        
        this.tabEntries[userId] = entry;
        this.updateEntryForId(userId);
        
        this.usersDiv.appendChild(entry);
    },
    
    updateEntryForId: function updateEntryForId(userId) {
        var entry = this.tabEntries[userId];
        if (typeof entry === "undefined") {
            return;
        }
        entry.getElementsByClassName("userColor")[0].style.backgroundColor = this._getColorById(userId);
        entry.getElementsByClassName("userAvatar")[0].firstChild.setAttribute("src", this._getThumbnailUrlById(userId));
        entry.getElementsByClassName("userInfo")[0].update(this._getDisplayNameById(userId));
    },
    
    handleFarbrauschEvent: function handleFarbrauschEvent(evt) {
        for (var userId in evt.users) {
            if (!evt.users.hasOwnProperty(userId)) {
                return;
            }
            
            var evtUser = evt.users[userId];
            var user = this._users[userId];
            
            if (typeof user === "undefined") {
                this._users[userId] = evtUser;
                this.addEntryForId(userId);
            } else if (evtUser.color !== user.color || evtUser.displayName !== user.displayName || evtUser.thumbnailUrl !== user.thumbnailUrl){
                this._users[userId] = evtUser;
                this.updateEntryForId(userId);
            }
        }
    },
    
    handleEventExecuted: function handleEventExecuted(evt) {
        var command = evt.commands[0];
        var userId = command.getCreatorId()
        this.updateLastAction(userId, command.getCreatedAt());
    },
    
    updateLastAction: function updateLastAction(userId, timestamp) {
        var date = new Date(timestamp);
        var day = String(date.getDate());
        if (day.length === 1) {
            day = "0" + day;
        }
        var month = String(date.getMonth() + 1);
        if (month.length === 1) {
            month = "0" + month;
        }
        var year = String(date.getFullYear());
        var hour = String(date.getHours());
        if (hour.length === 1) {
            hour = "0" + hour;
        }
        var minute = String(date.getMinutes());
        if (minute.length === 1) {
            minute = "0" + minute;
        }
        var userEntry = this.tabEntriesLastActivity[userId];
        if (typeof userEntry !== "undefined") {
            this.tabEntriesLastActivity[userId].update("Last Action: " + day + "." + month + "." + year + ", " + hour + ":" + minute);
        }
    },

    _getThumbnailUrlById: function _getThumbnailUrlById(id) {
        var user = this._users[id];
        if (user) {
            return user.thumbnailUrl;
        }
        return "https://wave.google.com/wave/static/images/unknown.jpg";
    },
    
    _getColorById: function _getColorById(id) {
        var user = this._users[id];
        if (user) {
            return user.color;
        }
        return "#000000";
    },
    
    _getDisplayNameById: function _getThumbnailUrlById(id) {
        var user = this._users[id];
        if (user) {
            return user.displayName;
        }
        return "Anonymous";
    }
});
