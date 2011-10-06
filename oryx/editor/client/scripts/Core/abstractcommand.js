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

/**
 * Init namespaces
 */
if (!ORYX) {
    var ORYX = {};
}
if (!ORYX.Core) {
    ORYX.Core = {};
}

// command repository
ORYX.Core.Commands = {};

/**
 * Glossary:
 *   commandObject = Metadata + commandData
 */
ORYX.Core.AbstractCommand = Clazz.extend({
     /**
     * Call this from the child class with:
     *     arguments.callee.$.construct.call(this, facade);
     * The doNotAddMetadataToShapes is optional. In most cases it should be set to false.
     */
    construct: function construct(facade, doNotAddMetadata) {
        this.metadata = {};
        this.metadata.id = ORYX.Editor.provideId();
        this.metadata.name = this.getCommandName();
        this.metadata.creatorId = facade.getUser().id;
        this.metadata.createdAt = new Date().getTime();
        this.metadata.local = true;
        this.metadata.putOnStack = true;
        this.facade = facade;
        
        
        /*this.execute2 = this.execute;
        
        this.execute = function() {
            this.execute2();
            var shapes = this.getAffectedShapes();
            for (var i = 0; i < shapes.length; i++) {
                shapes[i].metadata = {
                    'changedAt': this.getCreatedAt(),
                    'changedBy': this.getCreatorId()
                };
            }
        }.bind(this);*/
        
        if (!doNotAddMetadata) {
            this.execute = function wrappedExecute(executeFunction) {
                executeFunction();
                this.getAffectedShapes().each(function injectMetadataIntoShape(shape) {
                    if (typeof shape.metadata === "undefined") {
                        return;
                    };
                    shape.metadata.changedAt.push(this.getCreatedAt());
                    shape.metadata.changedBy.push(this.getCreatorId());
                    shape.metadata.commands.push(this.getDisplayName());
                    shape.metadata.isLocal = this.isLocal();
                    this.facade.raiseEvent({
                        'type': ORYX.CONFIG.EVENT_SHAPE_METADATA_CHANGED,
                        'shape': shape
                    });
                }.bind(this));
            }.bind(this, this.execute.bind(this));
            
            this.rollback = function wrappedExecute(rollbackFunction) {
                rollbackFunction();
                this.getAffectedShapes().each(function injectMetadataIntoShape(shape) {
                    if (typeof shape.metadata === "undefined") {
                        return;
                    };
                    shape.metadata.changedAt.pop();
                    shape.metadata.changedBy.pop();
                    shape.metadata.commands.pop();
                    shape.metadata.isLocal = this.isLocal();
                    this.facade.raiseEvent({
                        'type': ORYX.CONFIG.EVENT_SHAPE_METADATA_CHANGED,
                        'shape': shape
                    });
                }.bind(this));
            }.bind(this, this.rollback.bind(this));
        }
    },

    getCommandId: function getCommandId() {
        return this.metadata.id;
    },
    
    getCreatorId: function getCreatorId() {
        return this.metadata.creatorId;
    },
    
    getCreatedAt: function getCreatedAt() {
        return this.metadata.createdAt;
    },

    /**
     * Create a command object from the commandData object.
     * commandData is an object provided by the getCommandData() method.
     *
     * @static
     */
    createFromCommandData: function createFromCommandData(facade, commandData) {
        throw "AbstractCommand.createFromCommandData() has to be implemented";
    },

    /**
     * @return Array(Oryx.Core.Shape) All shapes modified by this command
     */
    getAffectedShapes: function getAffectedShapes() {
        throw "AbstractCommand.getAffectedShapes() has to be implemented";
    },

    /**
     * Should return a string/object/... that allows the command to be reconstructed
     * Basically:
     *    createFromCommandData(this.getCommandData) === this
     * @return Object has to be serializable
     */
    getCommandData: function getCommandData() {
        throw "AbstractCommand.getCommandData() has to be implemented";
    },

    /**
     * Name of this command, usually in the from of <plugin name>.<command description>
     * e.g.:
     *   DragDropResize.DropCommand
     *   ShapeMenu.CreateCommand
     * @return string
     */
    getCommandName: function getCommandName() {
        throw "AbstractCommand.getCommandName() has to be implemented";
    },

    
    /**
    * Should be overwritten by subclasses and return the command name in a human readable format.
    * e.g.:
    *    Shape deleted
    * @return string
    */
    getDisplayName: function getDisplayName() {
        return this.getCommandName();
    },
    
    execute: function execute() {
        throw "AbstractCommand.execute() has to be implemented";
    },

    rollback: function rollback() {
        throw "AbstractCommand.rollback() has to be implemented!";
    },

    /**
     * @return Boolean
     */
    isLocal: function isLocal() {
        return this.metadata.local;
    },

    jsonSerialize: function jsonSerialize() {
        var commandData = this.getCommandData();
        var commandObject = {
            'id': this.getCommandId(),
            'name': this.getCommandName(),
            'creatorId': this.getCreatorId(),
            'createdAt': this.getCreatedAt(),
            'data': commandData,
            'putOnStack': this.metadata.putOnStack
        };
        return Object.toJSON(commandObject);
    },

    /**
     * @static
     */
    jsonDeserialize: function jsonDeserialize(facade, commandString) {
        var commandObject = commandString.evalJSON();
        
        var commandInstance = ORYX.Core.Commands[commandObject.name].prototype.createFromCommandData(facade, commandObject.data);
        if (typeof commandInstance !== 'undefined') {
            commandInstance.setMetadata({
                'id': commandObject.id,
                'name': commandObject.name,
                'creatorId': commandObject.creatorId,
                'createdAt': commandObject.createdAt,
                'putOnStack': commandObject.putOnStack,
                'local': false
            });
        }
        
        return commandInstance;
    },

    setMetadata: function setMetadata(metadata) {
        this.metadata = Object.clone(metadata);
    }
});
