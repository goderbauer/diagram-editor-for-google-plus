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

if(!ORYX.Plugins)
	ORYX.Plugins = new Object();

ORYX.Plugins.Changelog = 
{
    construct: function construct() {
        arguments.callee.$.construct.apply(this, arguments);
        
        this.changelogDiv = document.createElement('div');
        this.isEmpty = true;
        
        var emptyDiv = Element.extend(document.createElement('div'));
        emptyDiv.update("No changes so far.");
        emptyDiv.className = "empty";
        this.changelogDiv.appendChild(emptyDiv);
        
        this.undologDiv = document.createElement('div');
        this.undologDiv.className = "undolog";
        this.changelogDiv.appendChild(this.undologDiv);
        
        this.redologDiv = document.createElement('div');
        this.redologDiv.className = "redolog";
        this.changelogDiv.appendChild(this.redologDiv);
        
        
        
        this.undolog = {};
        this.redolog = {};
        
        this.facade.registerOnEvent(ORYX.CONFIG.EVENT_COMMAND_ADDED_TO_UNDO_STACK, this.addCommandToUndolog.bind(this));
        this.facade.registerOnEvent(ORYX.CONFIG.EVENT_COMMAND_MOVED_FROM_UNDO_STACK, this.moveCommandToRedolog.bind(this));
        this.facade.registerOnEvent(ORYX.CONFIG.EVENT_COMMAND_MOVED_FROM_REDO_STACK, this.moveCommandToUndolog.bind(this));
        this.facade.registerOnEvent(ORYX.CONFIG.EVENT_AFTER_COMMANDS_ROLLBACK, this.removeCommandFromUndolog.bind(this)); // syncro reverted a command
        this.facade.registerOnEvent(ORYX.CONFIG.EVENT_FARBRAUSCH_NEW_INFOS, this.updateFarbrauschInfos.bind(this));
    },
    
    onLoaded: function onLoaded(event) {
        this.createChangelogTab();
    },
    
    createChangelogTab: function createChangelogTab() {
        this.facade.raiseEvent({
            'tabid': 'pwave-changelog',
            'type': ORYX.CONFIG.EVENT_SIDEBAR_NEW_TAB,
            'forceExecution': true,
            'tabTitle': 'Changelog',
            'tabOrder': 1,
            'tabDivEl': this.changelogDiv,
            'displayHandler': this.refreshChangelog.bind(this)
        });
    },
    
    addCommandToUndolog: function addCommandToUndolog(event) {
        var command = event.commands[0];
        var entry = this.createCommandDiv(command);
        
        if (this.isEmpty) {
            this.isEmpty = false;
            this.changelogDiv.removeChild(this.changelogDiv.firstChild);
        }
        
        this.undologDiv.appendChild(entry);
        this.undolog[command.getCommandId()] = entry;
        this.refreshChangelog();
        this.clearRedolog();
    },
    
    moveCommandToRedolog: function moveCommandToRedolog(event) {
        var command = event.commands[0];
        var commandDiv = this.undolog[command.getCommandId()];
        if (typeof commandDiv === 'undefined') {
            ORYX.Log.warn("Could not find command " + command.getCommandName() + " " + command.getCommandId() + " in undolog.");
            return;
        }
        this.undologDiv.removeChild(commandDiv);
        delete this.undolog[command.getCommandId()];
        this.redologDiv.insertBefore(commandDiv, this.redologDiv.firstChild);
        this.redolog[command.getCommandId()] = commandDiv;
    },
    
    moveCommandToUndolog: function moveCommandToUndolog(event) {
        var command = event.commands[0];
        var commandDiv = this.redolog[command.getCommandId()];
        if (typeof commandDiv === 'undefined') {
            ORYX.Log.warn("Could not find command " + command.getCommandName() + " " + command.getCommandId() + " in redolog.");
            return;
        }
        this.redologDiv.removeChild(commandDiv);
        delete this.redolog[command.getCommandId()];
        this.undologDiv.appendChild(commandDiv);
        this.undolog[command.getCommandId()] = commandDiv;
    },
    
    removeCommandFromUndolog: function removeCommandFromUndolog(event) {
        var command = event.commands[0];
        var commandDiv = this.undolog[command.getCommandId()];
        if (typeof commandDiv === 'undefined') {
            ORYX.Log.warn("Could not find command " + command.getCommandName() + " " + command.getCommandId() + " in undolog.");
            return;
        }
        this.undologDiv.removeChild(commandDiv);
        delete this.undolog[command.getCommandId()];
    },
    
    clearRedolog: function clearRedolog() {
        while (this.redologDiv.firstChild) {
            this.redologDiv.removeChild(this.redologDiv.firstChild);
        }
        this.redolog = {};
    },
    
    createCommandDiv: function createCommandDiv(command) {
        var userId = command.getCreatorId();
        var entry = Element.extend(document.createElement('div'));
        entry.className = "entry";
        
        var colorDiv = Element.extend(document.createElement('div'));
        colorDiv.className = "userColor";
        colorDiv.style.backgroundColor = this.getColorForUserId(userId);
        entry.appendChild(colorDiv);
        
        var commandNameDiv = Element.extend(document.createElement('div'));
        commandNameDiv.className = "commandName";
        commandNameDiv.update(command.getDisplayName());
        entry.appendChild(commandNameDiv);
        
        var date = this.getDateString(command.getCreatedAt())
        
        var dateDiv = Element.extend(document.createElement('div'));
        dateDiv.className = "date";
        dateDiv.update(date.date);
        entry.appendChild(dateDiv);
        
        var usernameDiv = Element.extend(document.createElement('div'));
        usernameDiv.className = "username";
        usernameDiv.update("by " + this.getDisplayNameForUserId(userId));
        entry.appendChild(usernameDiv);
        
        var timeDiv = Element.extend(document.createElement('div'));
        timeDiv.className = "time";
        timeDiv.update(date.time);
        entry.appendChild(timeDiv);
    
        entry.onclick = this.getOnClickFunction(command.getCommandId()).bind(this);
        return entry;
    },
    
    getDateString: function getDateString(timestamp) {
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
        return {'date': day + "." + month + "." + year,
                'time': hour + ":" + minute};
    },
    
    getOnClickFunction: function getOnClickFunction(commandId){
        return function onClick() {
            if (typeof this.undolog[commandId] !== "undefined") {
                var toUndo = this.getFollowingCommands(ORYX.Stacks.undo, commandId);
                toUndo.pop();
                var commands = toUndo.map(function (command) {
                    return new ORYX.Core.Commands["WaveGlobalUndo.undoCommand"](command, this.facade);
                }.bind(this));
            } else if (typeof this.redolog[commandId] !== "undefined") {
                var toRedo = this.getFollowingCommands(ORYX.Stacks.redo, commandId);
                var commands = toRedo.map(function (command) {
                    return new ORYX.Core.Commands["WaveGlobalUndo.redoCommand"](command, this.facade);
                }.bind(this));
            } else {
                throw "Changelog: Command not found on undo or redo stack";
            }
            
            if (commands.length > 0) {
                this.facade.executeCommands(commands);
            }
        }
    },
    
    getFollowingCommands: function(stack, commandId) {
        for (var i = 0; i < stack.length; i++) {
            var cmd = stack[i][0];
            if (cmd.getCommandId() === commandId && i < stack.length) { 
                return stack.slice(i).reverse();
            }
        }
        return [];
    },
    
    updateFarbrauschInfos: function updateFarbrauschInfos(evt) {
        this.users = evt.users;
    },
    
    getColorForUserId: function getColorForUserId(userId) {
        var user = this.users[userId];
        if(typeof user  === 'undefined' || typeof user.color  === 'undefined') {
            return "#000000"; //DefaultColor
        }
        return user.color;
    },
    
    getDisplayNameForUserId: function getDisplayNameForUserId(userId) {
        var user = this.users[userId];
        if(typeof user  === 'undefined' || typeof user.displayName  === 'undefined') {
            return "Anonymous"; 
        }
        return user.displayName;
    },
    
    refreshChangelog: function refreshChangelog() {
        try {
            this.changelogDiv.parentNode.scrollTop = this.changelogDiv.parentNode.scrollHeight;
        } catch(e) {
            // changelog has not yet been redered
        }
    }
};

ORYX.Plugins.Changelog = ORYX.Plugins.AbstractPlugin.extend(ORYX.Plugins.Changelog);