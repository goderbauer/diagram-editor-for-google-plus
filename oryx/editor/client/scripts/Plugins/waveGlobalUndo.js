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
    
ORYX.Stacks = { 
    "undo": [],
    "redo": [],
    "trash": []
};
    
ORYX.Plugins.WaveGlobalUndo = Clazz.extend({

    facade: undefined,
    
    construct: function(facade){
        this.facade = facade;
        
        this.facade.offer({
            name: ORYX.I18N.Undo.undo,
            description: ORYX.I18N.Undo.undoDesc,
            iconCls: 'pw-toolbar-button pw-toolbar-undo',
            keyCodes: [{
                    metaKeys: [ORYX.CONFIG.META_KEY_META_CTRL],
                    keyCode: 90,
                    keyAction: ORYX.CONFIG.KEY_ACTION_DOWN
                }
             ],
            functionality: this.doGlobalUndo.bind(this),
            group: ORYX.I18N.Undo.group,
            isEnabled: function() { return !this.facade.isReadOnlyMode() && ORYX.Stacks.undo.length > 0; }.bind(this),
            index: 0,
            visibleInViewMode: false
        }); 

        this.facade.offer({
            name: ORYX.I18N.Undo.redo,
            description: ORYX.I18N.Undo.redoDesc,
            iconCls: 'pw-toolbar-button pw-toolbar-redo',
            keyCodes: [{
                    metaKeys: [ORYX.CONFIG.META_KEY_META_CTRL],
                    keyCode: 89,
                    keyAction: ORYX.CONFIG.KEY_ACTION_DOWN
                }
             ],
            functionality: this.doGlobalRedo.bind(this),
            group: ORYX.I18N.Undo.group,
            isEnabled: function(){ return !this.facade.isReadOnlyMode() && ORYX.Stacks.redo.length > 0; }.bind(this),
            index: 1,
            visibleInViewMode: false
        }); 
        
        // Register on event for executing commands --> store all commands in a stack 
        this.facade.registerOnEvent(ORYX.CONFIG.EVENT_EXECUTE_COMMANDS, this.handleExecuteCommands.bind(this));
        this.facade.registerOnEvent(ORYX.CONFIG.EVENT_AFTER_COMMANDS_ROLLBACK, this.handleRollbackCommands.bind(this));
    },
    
    handleExecuteCommands: function handleExecuteCommands(evt) {
        if (!evt.commands || !evt.commands[0].metadata.putOnStack) {
            return;
        }

        ORYX.Stacks.undo.push(evt.commands);
        this.facade.raiseEvent({
            'type' : ORYX.CONFIG.EVENT_COMMAND_ADDED_TO_UNDO_STACK,
            'commands': evt.commands,
            'forceExecution': true
        });
        
        ORYX.Stacks.trash = ORYX.Stacks.trash.concat(ORYX.Stacks.redo);
        ORYX.Stacks.redo = [];
    },
    
    handleRollbackCommands: function handleRollbackCommands(evt) {
        if (!evt.commands || !evt.commands[0].metadata.putOnStack) {
            return;
        }

        ORYX.Stacks.undo = this._deleteCommand(evt.commands[0], ORYX.Stacks.undo);
    },
    
    _deleteCommand: function _deleteCommand(command, array) {
        var returnArray = array;
        for (var i = 0; i < array.length; i++) {
            var cmdArray = array[i];
            var cmd = cmdArray[0];
            if (cmd.getCommandId() === command.getCommandId()) {
                returnArray = array.without(cmdArray);
                break;
            }
        }
        return returnArray;
    },
    
    doGlobalUndo: function doGlobalUndo()  {
        var commandsToUndo = ORYX.Stacks.undo[ORYX.Stacks.undo.length - 1];
        var undoCommand = new ORYX.Core.Commands["WaveGlobalUndo.undoCommand"](commandsToUndo, this.facade);
        this.facade.executeCommands([undoCommand]);      
    },
   
    doGlobalRedo: function doGlobalRedo() {
        var commandsToRedo = ORYX.Stacks.redo[ORYX.Stacks.redo.length - 1];
        var redoCommand = new ORYX.Core.Commands["WaveGlobalUndo.redoCommand"](commandsToRedo, this.facade);
        this.facade.executeCommands([redoCommand]);
    }
});
    
ORYX.Core.Commands["WaveGlobalUndo.undoCommand"] = ORYX.Core.AbstractCommand.extend({
    construct: function construct(commands, facade) {
        arguments.callee.$.construct.call(this, facade, true);
        this.metadata.putOnStack = false;
        this.commands = commands;
    },
    
    execute: function execute() {
        var ids = this.commands.collect(function getIds(command) {
            return command.getCommandId();
        });
        if (this._getCommandsByIds(ORYX.Stacks.undo, ids)) {
            ORYX.Stacks.undo = ORYX.Stacks.undo.without(this.commands);
            ORYX.Stacks.redo.push(this.commands);
            this.commands.each(function doRollback(command) {
                command.metadata.local = this.isLocal();
                command.rollback();
            }.bind(this));
            this.facade.raiseEvent({
                'type' : ORYX.CONFIG.EVENT_COMMAND_MOVED_FROM_UNDO_STACK,
                'commands': this.commands,
                'forceExecution': true
            });
        } 
    },
    
    rollback: function rollback() {
        var ids = this.commands.collect(function getIds(command) {
            return command.getCommandId();
        });
        if (this._getCommandsByIds(ORYX.Stacks.redo, ids) || this._getCommandsByIds(ORYX.Stacks.trash, ids)) {
            ORYX.Stacks.redo = ORYX.Stacks.redo.without(this.commands);
            ORYX.Stacks.trash = ORYX.Stacks.trash.without(this.commands);
            ORYX.Stacks.undo.push(this.commands);
            this.commands.each(function doExecute(command) {
                command.execute();
            });
            this.facade.raiseEvent({
                'type' : ORYX.CONFIG.EVENT_COMMAND_MOVED_FROM_REDO_STACK,
                'commands': this.commands,
                'forceExecution': true
            });
        }
    },
    
    getAffectedShapes: function getAffectedShapes() {
        /*return this.commands.collect(function collectShapes(command) {
            return command.getAffectedShapes();
        });*/
        return [];
    },
    
    getCommandName: function getCommandName() {
        return "WaveGlobalUndo.undoCommand";
    },
    
    _getCommandsByIds: function _getCommandsByIds(stack, ids) {
        for (var i = 0; i < stack.length; i++) {
            var result = ids.detect(function findCommand(id) {
              return stack[i][0].getCommandId() === id;
            });
            if (result) {
                return stack[i];
            }
        }
        return null;
    },
    
    createFromCommandData: function createFromCommandData(facade, cmdData) {
        var allStacks = ORYX.Stacks.undo.concat(ORYX.Stacks.redo, ORYX.Stacks.trash);
        var toUndoCommands = this._getCommandsByIds(allStacks, cmdData.toUndoCommandIds);
        
        // If the command cannot be found on the undo stack, we have a double undo that should not be executed.
        var ids = toUndoCommands.collect(function getIds(command) {
            return command.getCommandId();
        });
        var commandsExist = this._getCommandsByIds(ORYX.Stacks.undo, ids);        
        if (!commandsExist) {
            return undefined;
        }
        
        return new ORYX.Core.Commands["WaveGlobalUndo.undoCommand"](toUndoCommands, facade);
    },
    
    getCommandData: function getCommandData() {
        var ids = this.commands.map(function getIds(command) {
            return command.getCommandId();
        });
        var names = this.commands.map(function getIds(command) {
            return command.getCommandName();
        });
        var cmd = {"toUndoCommandIds": ids, "toUndoCommandNames": names};
        return cmd;
    }
});

ORYX.Core.Commands["WaveGlobalUndo.redoCommand"] = ORYX.Core.AbstractCommand.extend({
    construct: function construct(commands, facade) {
        arguments.callee.$.construct.call(this, facade);
        this.metadata.putOnStack = false;
        this.commands = commands;
    },
    
    execute: function execute() {
        var ids = this.commands.collect(function getIds(command) {
            return command.getCommandId();
        });
        if (this._getCommandsByIds(ORYX.Stacks.redo, ids) || this._getCommandsByIds(ORYX.Stacks.trash, ids)) {
            ORYX.Stacks.redo = ORYX.Stacks.redo.without(this.commands);
            ORYX.Stacks.trash = ORYX.Stacks.trash.without(this.commands);
            ORYX.Stacks.undo.push(this.commands);
            this.commands.each(function doExecute(command) {
                command.metadata.local = this.isLocal();
                command.execute();
            }.bind(this));
            this.facade.raiseEvent({
                'type' : ORYX.CONFIG.EVENT_COMMAND_MOVED_FROM_REDO_STACK,
                'commands': this.commands,
                'forceExecution': true
            });
        }
    },
    
    rollback: function rollback() {
        var ids = this.commands.collect(function getIds(command) {
            return command.getCommandId();
        });
        if (this._getCommandsByIds(ORYX.Stacks.undo, ids)) {
            ORYX.Stacks.undo = ORYX.Stacks.undo.without(this.commands);
            ORYX.Stacks.redo.push(this.commands);
            this.commands.each(function doRollback(command) {
                command.rollback();
            });
            this.facade.raiseEvent({
                'type' : ORYX.CONFIG.EVENT_COMMAND_MOVED_FROM_UNDO_STACK,
                'commands': this.commands,
                'forceExecution': true
            });
        } 
    },
    
    getAffectedShapes: function getAffectedShapes() {
        return [];
    },
    
    getCommandName: function getCommandName() {
        return "WaveGlobalUndo.redoCommand";
    },
    
    _getCommandsByIds: function _getCommandsByIds(stack, ids) {
        for (var i = 0; i < stack.length; i++) {
            var result = ids.detect(function findCommand(id) {
              return stack[i][0].getCommandId() === id;
            });
            if (result) {
                return stack[i];
            }
        }
        return null;
    },
    
    createFromCommandData: function createFromCommandData(facade, cmdData) {
        var allStacks = ORYX.Stacks.undo.concat(ORYX.Stacks.redo, ORYX.Stacks.trash);
        var toRedoCommands = this._getCommandsByIds(allStacks, cmdData.toRedoCommandIds);
        
        // If the command cannot be found on the redo stack, we have a double redo that should not be executed.
        var ids = toRedoCommands.collect(function getIds(command) {
            return command.getCommandId();
        });
        var commandsExist = this._getCommandsByIds(ORYX.Stacks.redo, ids);
        if (!commandsExist) {
            return undefined;
        }      
        
        return new ORYX.Core.Commands["WaveGlobalUndo.redoCommand"](toRedoCommands, facade);
    },
    
    getCommandData: function getCommandData() {
        var ids = this.commands.map(function getIds(command) {
            return command.getCommandId();
        });
        var names = this.commands.map(function getIds(command) {
            return command.getCommandName();
        });
        var cmd = {"toRedoCommandIds": ids, "toRedoCommandNames": names};
        return cmd;
    }
});
