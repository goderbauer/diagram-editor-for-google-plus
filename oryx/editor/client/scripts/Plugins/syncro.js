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

/**
* This plugin implements the syncro algorithm for concurrent editing
**/

ORYX.Plugins.Syncro = Clazz.extend({
    facade: undefined,

    LAMPORT_OFFSET : 3,
    lamportClock : 1,
    localState : {},
    
    initialized : false, // Lib (locaState, etc.) has not been initialized yet.
    
    construct: function construct(facade) {
        this.facade = facade;
        
        this.facade.registerOnEvent(ORYX.CONFIG.EVENT_NEW_POST_MESSAGE_RECEIVED, this.handleNewPostMessageReceived.bind(this));
        this.facade.registerOnEvent(ORYX.CONFIG.EVENT_SYNCRO_NEW_COMMANDS_FOR_REMOTE_STATE, this.handleNewCommandForRemoteState.bind(this));
    },
    
    
    /** Direction: Wave -> Oryx (New remote commands in Wave State) **/
    
    handleNewPostMessageReceived: function handleNewPostMessageReceived(event) {
        var data = event.data;
        if (data.target !== "syncro") {
            return;
        }
        
        var commandsArray = data.message;
        this.handleRemoteCommands(commandsArray);
    },
    
    handleRemoteCommands: function handleRemoteCommands(remoteCommands) {
        // new commands appeared in wave state -> run syncro algorithm
        var remoteCommand;
        var newCommand;
        var localCommand;
        var localCommands;
        
        var newCommands = [];
        var revertCommands;
        var applyCommands;
        
        // fetch new commands obtained from other users, merge into local state
        for (var i = 0; i < remoteCommands.length; i++) {
            remoteCommand = remoteCommands[i];
            if (typeof this.localState[remoteCommand.id] === "undefined") {
                this.localState[remoteCommand.id] = remoteCommand;
                newCommands.push(remoteCommand);
            }
        }
        
        // bring new and local commands into chronological order
        newCommands.sort(this.compareCommands);
        localCommands = this.getValuesFromDict(this.localState);
        localCommands.sort(this.compareCommands);
        
        // set lamportClock accordingly
        this.lamportClock = this.getClockValueFromSortedCommands(localCommands);
        
        if (!this.initialized) {
            // When snycro is not initialized, all comands are new, no need to run algorithm
            this.initialized = true;
            this.sendCommandsToOryx(null, [], newCommands);
            this.facade.raiseEvent({'type': ORYX.CONFIG.EVENT_SYNCRO_INITIALIZATION_DONE});
            return;
        }
        
        // For each new command find all subsequent applied commands and mark them as to be
        // reverted. Pass them and the new command to Oryx for execution.
        localCommands.reverse();
        for (var n = 0; n < newCommands.length; n++) {
            newCommand = newCommands[n];
            revertCommands = [];
            applyCommands = [];
            for (var j = 0; j < localCommands.length; j++) {
                localCommand = localCommands[j];
                if (localCommand === newCommand) {
                    applyCommands.push(localCommand);
                    applyCommands.reverse();
                    // pass everythin to Oryx for execution
                    this.sendCommandsToOryx(newCommand, revertCommands, applyCommands);
                    break;
                } else if (!this.inArray(localCommand, newCommands)) {
                    // only commands that have already been applied and therefore are not
                    // part of the new commands need to be reverted
                    applyCommands.push(localCommand);
                    revertCommands.push(localCommand);
                }
            }
        }

    },
    
    sendCommandsToOryx: function sendCommandsToOryx(newCommand, revertCommands, applyCommands) {
        this.facade.raiseEvent({
            'type': ORYX.CONFIG.EVENT_SYNCRO_NEW_REMOTE_COMMANDS,
            'newCommand': newCommand,
            'revertCommands': revertCommands,
            'applyCommands': applyCommands,
            'forceExecution': true
        });
    },
    
    
    /** Direction: Oryx -> Wave (New local command needs to be pushed into Wave State) **/
    
    handleNewCommandForRemoteState: function handleNewCommandForRemoteState(event) {
        this.pushCommands(event.commands);
    },
    
    pushCommands: function pushCommands(commands) {
        // new commands executed on the local client are pushed into wave state
        var commandId = this.getNextCommandId();
        var delta = {
            'commands': commands,
            'userId': this.facade.getUser().id,
            'id': commandId,
            'clock': this.lamportClock
        };
        
        // push into local state
        this.localState[commandId] = delta;
        // push into wave state
        this.facade.raiseEvent({
            'type': ORYX.CONFIG.EVENT_POST_MESSAGE,
            'target': 'syncroWave',
            'action': 'save',
            'message': delta
        });
        // adjust Lamport clock for new command
        this.lamportClock += this.LAMPORT_OFFSET;
    },
    
    
    /** helper functions **/ 
    
    compareCommands: function compareCommands(command1, command2) {
        // compare-function to sort commands chronologically
        var delta = command1.clock - command2.clock;
        if (delta === 0) {
            if (command1.userId < command2.userId) {
                return -1;
            } else {
                return 1;
            }
        }
        return delta;
    },
    
    getClockValueFromSortedCommands: function getClockValueFromSortedCommands(commands) {
        // return max(highest clock in commands, current lamportClock) + lamport offset
        var lamportClock = this.lamportClock;
        
        if (commands.length === 0) {
            return lamportClock;
        }
        
        var lastCommand = commands[commands.length - 1];
        var lastClock = lastCommand.clock;
            
        if (lastClock >= lamportClock) {
            return lastClock + this.LAMPORT_OFFSET;
        }
        return lamportClock;
    },
    
    getNextCommandId: function getNextCommandId() {
        return this.lamportClock + "\\" + this.facade.getUser().id;
    },
    
    
    /** util **/
    
    getValuesFromDict: function getValuesFromDict(dict) {
        var values = [];
        for (var key in dict) {
            if (dict.hasOwnProperty(key)) {
                values.push(dict[key]);
            }
        }
        return values;
    },
    
    inArray: function inArray(value, array) {
        for (var i = 0; i < array.length; i++) {
            if (array[i] === value) {
                return true;
            }
        }
        return false;
    }
    
});
