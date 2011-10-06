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
* This implements the interface between the syncro algorithm (syncro.js) 
* and the Oryx editor
**/
    
ORYX.Plugins.SyncroOryx = Clazz.extend({
    facade: undefined,
    debug: false, //Set to true to see Apply/Revert-Log in console
    
    construct: function construct(facade) {
        this.facade = facade;
        
        this.facade.registerOnEvent(ORYX.CONFIG.EVENT_SYNCRO_NEW_REMOTE_COMMANDS, this.handleNewRemoteCommands.bind(this));
        this.facade.registerOnEvent(ORYX.CONFIG.EVENT_AFTER_COMMANDS_EXECUTED, this.handleAfterCommandsExecuted.bind(this));
    },
    
    
    /** Direction: Wave -> Oryx (New remote commands in Wave State) **/
    
    handleNewRemoteCommands: function handleNewRemoteCommands(event) {
        this.newCommand(event.newCommand, event.revertCommands, event.applyCommands);
    },
    
    newCommand: function newCommand(newCommand, revertCommands, applyCommands) {
        if (this.debug) console.log("-----");
        
        // Revert all commands in revertCommands
        for (var i = 0; i < revertCommands.length; i++) {
            if (this.debug) console.log({'revert':revertCommands[i]});
            
            // Get command object from stack, if it exists, otherwise unpack/deserialize it
            var commands = this.getCommandsFromStack(revertCommands[i]);
            if (typeof commands === "undefined") {
                commands = this.unpackToCommands(revertCommands[i]);
            }
            
            this.facade.rollbackCommands(commands);
        }
        
        // Apply all commands in applyCommands
        for (var i = 0; i < applyCommands.length; i++) {
            if (this.debug) console.log({'apply':applyCommands[i]});
            
            // Get command object from stack, if it exists, otherwise unpack/deserialize it
            var unpackedCommands = this.unpackToCommands(applyCommands[i]);
            if (unpackedCommands.length !== 0) {
                this.facade.executeCommands(unpackedCommands);
            }
        }
    },
    
    getCommandsFromStack: function getCommandsFromStack(stackItem) {
        //Try to get command object from stack, avoids unnecessary deserialisation
        var commandArrayOfStrings = stackItem.commands;
        var commandDataArray = [];        
        
        for (var i = 0; i < commandArrayOfStrings.length; i++) {
            commandDataArray.push(commandArrayOfStrings[i].evalJSON());
        }
        
        if (!commandDataArray[0].putOnStack) {
            return undefined;
        }
        
        var stack = ORYX.Stacks.undo;
        var ids = this.getIdsFromCommandArray(commandDataArray);
        
        for (i = 0; stack.length; i++) {
            for (var j = 0; j < ids.length; j++) {
                if (ids[j] === stack[i][0].getCommandId()) {
                    return stack[i];
                }
            }
        }
        
        return [];
    },
    
    unpackToCommands: function unpackToCommands(stackItem) {
        // deserialize a command and create command object
        var commandArrayOfStrings = stackItem.commands;

        var commandArray = [];
        for (var i = 0; i < commandArrayOfStrings.length; i++) {
            var cmdObj = commandArrayOfStrings[i].evalJSON();
            var commandInstance = ORYX.Core.Commands[cmdObj.name].prototype.jsonDeserialize(this.facade, commandArrayOfStrings[i]);
            if (typeof commandInstance === 'undefined') {
                return [];
            }
            commandArray.push(commandInstance);
        }

        return commandArray;
    },
    
    
    /** Direction: Wave -> Oryx (New remote commands in Wave State) **/
    
    handleAfterCommandsExecuted: function handleAfterCommandsExecuted(evt) {
        // All commands executed locally need to be pushed to wave state
        if (!evt.commands || !evt.commands[0].isLocal()) { 
            return;
        }

        var serializedCommands = [];
        for (var i = 0; i < evt.commands.length; i++) {
            if (evt.commands[i] instanceof ORYX.Core.AbstractCommand) {
                //serialize commands
                serializedCommands.push(evt.commands[i].jsonSerialize());
            }
        }
        
        // pass serialized commands to syncro
        this.facade.raiseEvent({
            'type': ORYX.CONFIG.EVENT_SYNCRO_NEW_COMMANDS_FOR_REMOTE_STATE,
            'commands': serializedCommands,
            'forceExecution': true
        });
    },
    
    
    /** helper functions **/
    
    getIdsFromCommandArray: function getIdsFromCommandArray(commandArray) {
        var commandIds = [];        
        for (var i = 0; i < commandArray.length; i++) {
            commandIds.push(commandArray[i].id);
        }        
        return commandIds;
    }
});