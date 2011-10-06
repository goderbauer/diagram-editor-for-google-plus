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
    
ORYX.Core.Commands["DragDropResize.DockCommand"] = ORYX.Core.AbstractCommand.extend({
    construct: function construct(docker, relativePosition, newDockedShape, facade) {
        arguments.callee.$.construct.call(this, facade);
    
        this.docker         = docker;
        this.newPosition    = relativePosition;
        this.newDockedShape = newDockedShape;
        this.newParent         = newDockedShape.parent || facade.getCanvas();
        this.newParent 		= newDockedShape.parent || facade.getCanvas();
        this.oldDockedShape    = docker.getDockedShape();
        if (typeof this.oldDockedShape === "undefined") {
            this.oldPosition	= docker.parent.bounds.center()
        } else {
            // if oldDockedShape was not the canvas, i.e. results in undefined, calculate relative position
            this.oldPosition = this.facade.getCanvas().node.ownerSVGElement.createSVGPoint();
            this.oldPosition.x = Math.abs((this.oldDockedShape.absoluteBounds().lowerRight().x - docker.parent.absoluteBounds().center().x) / this.oldDockedShape.bounds.width());
            this.oldPosition.y = Math.abs((this.oldDockedShape.absoluteBounds().lowerRight().y - docker.parent.absoluteBounds().center().y) / this.oldDockedShape.bounds.height());
        }
        this.oldParent 		= docker.parent.parent || facade.getCanvas();
        this.facade         = facade;
    },
    
    execute: function execute() {
        this.dock(this.newDockedShape, this.newParent,  this.newPosition);
        
        // Raise Event for having the docked shape on top of the other shape
        this.facade.raiseEvent(
            {
                "type": ORYX.CONFIG.EVENT_ARRANGEMENTLIGHT_TOP, 
                "shape": this.docker.parent
            }
        )									
    },
    
    rollback: function rollback() {
        this.dock( this.oldDockedShape, this.oldParent, this.oldPosition );
    },
    
    getCommandName: function getCommandName() {
        return "DragDropResize.DockCommand";
    },
    
    getDisplayName: function getDisplayName() {
        return "Event docked";
    },
        
    dock: function(toDockShape, parent, relativePosition) {
        var relativePos = relativePosition;

        /* if shape should be attached to a shape, calculate absolute position, otherwise relativePosition is relative to canvas, i.e. absolute
         values are expected to be between 0 and 1, if faulty values are found, they are set manually - with x = 0 and y = 0, shape will be docked at lower right corner*/
        if (typeof toDockShape !== "undefined") {
            var absolutePosition = this.facade.getCanvas().node.ownerSVGElement.createSVGPoint();
            if ((0 > relativePos.x) || (relativePos.x > 1) || (0 > relativePos.y) || (relativePos.y > 1)) {
                relativePos.x = 0;
                relativePos.y = 0;
            } 
            absolutePosition.x = Math.abs(toDockShape.absoluteBounds().lowerRight().x - relativePos.x * toDockShape.bounds.width());
            absolutePosition.y = Math.abs(toDockShape.absoluteBounds().lowerRight().y - relativePos.y * toDockShape.bounds.height());
        } else {
            var absolutePosition = relativePosition;
        }        

        // Add to the same parent Shape
        parent.add(this.docker.parent)
                
        //it seems that for docker to be moved, the dockedShape need to be cleared first
        this.docker.setDockedShape(undefined);
        this.docker.bounds.centerMoveTo(absolutePosition);
        this.docker.setDockedShape(toDockShape);
        //this.docker.update();
        if (this.isLocal()) {
            this.facade.setSelection([this.docker.parent]);
        }
        this.facade.getCanvas().update();
        this.facade.updateSelection(this.isLocal());            
    },
    
    getCommandData: function getCommandData() {
        var getDockerId = function(docker) {
            var dockerId; 
            if (typeof docker !== "undefined") {
                dockerId = docker.id;
            }
            return dockerId;
        };
    
        var cmd = {
            "dockerParentId": this.docker.parent.resourceId,
            "newPosition": this.newPosition,
            "newDockedShapeId": this.newDockedShape.resourceId          
        };
        return cmd;
    },
    
    createFromCommandData: function jsonDeserialize(facade, commandData) {        
        var docker, parent, newShape, newPosition;
        var canvas = facade.getCanvas();
        
        newShape = canvas.getChildShapeByResourceId(commandData.newDockedShapeId);
        
        // Don't instantiate a new command when the shape to be resized doesn't exist anymore.
        if (typeof newShape === 'undefined') {
            return undefined;
        }        
        parent = canvas.getChildShapeByResourceId(commandData.dockerParentId);
        newPosition = canvas.node.ownerSVGElement.createSVGPoint();
        newPosition.x = commandData.newPosition.x;
        newPosition.y = commandData.newPosition.y;
        
        for (var i = 0; i < newShape.dockers.length; i++) {
            if (newShape.dockers[i].id == commandData.dockerId) {
                docker = newShape.dockers[i];
            }
        }
    
        var newCommand = new ORYX.Core.Commands["DragDropResize.DockCommand"](parent.dockers[0], newPosition, newShape, facade);
        return newCommand;
    },
    
    getAffectedShapes: function getAffectedShapes() {
        return [this.docker.parent];
    }
});

ORYX.Plugins.DragDropResize = ORYX.Plugins.AbstractPlugin.extend({

    /**
     *    Constructor
     *    @param {Object} Facade: The Facade of the Editor
     */
    construct: function(facade) {
        this.facade = facade;

        // Initialize variables
        this.currentShapes         = [];            // Current selected Shapes
        //this.pluginsData         = [];            // Available Plugins
        this.toMoveShapes         = [];            // Shapes there will be moved
        this.distPoints         = [];            // Distance Points for Snap on Grid
        this.isResizing         = false;        // Flag: If there was currently resized
        this.dragEnable         = false;        // Flag: If Dragging is enabled
        this.dragIntialized     = false;        // Flag: If the Dragging is initialized
        this.edgesMovable        = true;            // Flag: If an edge is docked it is not movable
        this.offSetPosition     = {x: 0, y: 0};    // Offset of the Dragging
        this.faktorXY             = {x: 1, y: 1};    // The Current Zoom-Faktor
        this.containmentParentNode;                // the current future parent node for the dragged shapes
        this.isAddingAllowed     = false;        // flag, if adding current selected shapes to containmentParentNode is allowed
        this.isAttachingAllowed = false;        // flag, if attaching to the current shape is allowed
        
        this.callbackMouseMove    = this.handleMouseMove.bind(this);
        this.callbackMouseUp    = this.handleMouseUp.bind(this);
        
        // Get the SVG-Containernode 
        var containerNode = this.facade.getCanvas().getSvgContainer();
        
        // Create the Selected Rectangle in the SVG
        this.selectedRect = new ORYX.Plugins.SelectedRect(containerNode);
        
        // Show grid line if enabled
        if (ORYX.CONFIG.SHOW_GRIDLINE) {
            this.vLine = new ORYX.Plugins.GridLine(containerNode, ORYX.Plugins.GridLine.DIR_VERTICAL);
            this.hLine = new ORYX.Plugins.GridLine(containerNode, ORYX.Plugins.GridLine.DIR_HORIZONTAL);
        }

        // Get a HTML-ContainerNode
        containerNode = this.facade.getCanvas().getHTMLContainer();
        
        this.scrollNode = this.facade.getCanvas().rootNode.parentNode.parentNode;
        
        // Create the southeastern button for resizing
        this.resizerSE = new ORYX.Plugins.Resizer(containerNode, "southeast", this.facade);
        this.resizerSE.registerOnResize(this.onResize.bind(this)); // register the resize callback
        this.resizerSE.registerOnResizeEnd(this.onResizeEnd.bind(this, "southeast")); // register the resize end callback
        this.resizerSE.registerOnResizeStart(this.onResizeStart.bind(this)); // register the resize start callback
        
        // Create the northwestern button for resizing
        this.resizerNW = new ORYX.Plugins.Resizer(containerNode, "northwest", this.facade);
        this.resizerNW.registerOnResize(this.onResize.bind(this)); // register the resize callback
        this.resizerNW.registerOnResizeEnd(this.onResizeEnd.bind(this, "northwest")); // register the resize end callback
        this.resizerNW.registerOnResizeStart(this.onResizeStart.bind(this)); // register the resize start callback
        
        // For the Drag and Drop
        // Register on MouseDown-Event on a Shape
        this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEDOWN, this.handleMouseDown.bind(this));

        // register for layouting event
        // this.facade.registerOnEvent(ORYX.CONFIG.EVENT_LAYOUT_EDGES, this.handleLayoutEdges.bind(this));

        // listen for canvas resizes causing moving of shapes
        this.facade.registerOnEvent(ORYX.CONFIG.EVENT_CANVAS_RESIZE_SHAPES_MOVED, this.onCanvasResizeShapesMoved.bind(this));
    },

    handleLayoutEdges: function(event) {
        this.layoutEdges(event.node, event.edges, event.offset);
    },

    /**
     * On Mouse Down
     *
     */
    handleMouseDown: function(event, uiObj) {
        // If the selection Bounds not intialized and the uiObj is not member of current selectio
        // then return
        if(!this.dragBounds || !this.currentShapes.member(uiObj) || !this.toMoveShapes.length) {return};
        
        // Start Dragging
        this.dragEnable = true;
        this.dragIntialized = true;
        this.edgesMovable = true;

        // Calculate the current zoom factor
        var a = this.facade.getCanvas().node.getScreenCTM();
        this.faktorXY.x = a.a;
        this.faktorXY.y = a.d;

        // Set the offset position of dragging
        var upL = this.dragBounds.upperLeft();
        this.offSetPosition =  {
            x: Event.pointerX(event) - (upL.x * this.faktorXY.x),
            y: Event.pointerY(event) - (upL.y * this.faktorXY.y)};
        
        this.offsetScroll    = {x:this.scrollNode.scrollLeft,y:this.scrollNode.scrollTop};
            
        // Register on Global Mouse-MOVE Event
        document.documentElement.addEventListener(ORYX.CONFIG.EVENT_MOUSEMOVE, this.callbackMouseMove, false);    
        // Register on Global Mouse-UP Event
        document.documentElement.addEventListener(ORYX.CONFIG.EVENT_MOUSEUP, this.callbackMouseUp, true);            
    },

    /**
     * On Key Mouse Up
     *
     */
    handleMouseUp: function(event) {
        
        //disable containment highlighting
        this.facade.raiseEvent({ type:ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,
                                 highlightId:"dragdropresize.contain" });
                                
        this.facade.raiseEvent({ type:ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,
                                 highlightId:"dragdropresize.attached" });

        // If Dragging is finished
        if (this.dragEnable) {
            var position = this.calculateDragPosition(event);        
            this.dragBounds.moveTo(position);

            // and update the current selection
            if (!this.dragIntialized) {
                this.afterDrag();
                
                // Check if the Shape is allowed to dock to the other Shape                        
                if (this.isAttachingAllowed &&
                    this.toMoveShapes.length == 1 && this.toMoveShapes[0] instanceof ORYX.Core.Node  &&
                    this.toMoveShapes[0].dockers.length > 0) {
                    
                    // Get the position and the docker                    
                    var position     = this.facade.eventCoordinates( event );    
            
                    // calculate the relative position of the docker within the newDockedShape
                    var newDockedShape = this.containmentParentNode;
		            var relativePosition = this.facade.getCanvas().node.ownerSVGElement.createSVGPoint();
		            relativePosition.x = (newDockedShape.absoluteBounds().lowerRight().x - position.x) / newDockedShape.bounds.width();
		            relativePosition.y = (newDockedShape.absoluteBounds().lowerRight().y - position.y) / newDockedShape.bounds.height();
	
					var docker 		= this.toMoveShapes[0].dockers[0];
                    // Instantiate the dockCommand
                    var command = new ORYX.Core.Commands["DragDropResize.DockCommand"](docker, relativePosition, this.containmentParentNode, this.facade);
                    this.facade.executeCommands([command]);    
                    
                // Check if adding is allowed to the other Shape    
                } else if( this.isAddingAllowed ) {
                    // Refresh all Shapes --> Set the new Bounds
                    this.refreshSelectedShapes();
                }
                
				this.facade.updateSelection(true);
                            
                this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_DRAGDROP_END});
            }    

            if (this.vLine)
                this.vLine.hide();
            if (this.hLine)
                this.hLine.hide();
                
            this.facade.updateSelection(true);
        }

        // Disable 
        this.dragEnable = false;    

        // UnRegister on Global Mouse-UP/-Move Event
        document.documentElement.removeEventListener(ORYX.CONFIG.EVENT_MOUSEUP, this.callbackMouseUp, true);    
        document.documentElement.removeEventListener(ORYX.CONFIG.EVENT_MOUSEMOVE, this.callbackMouseMove, false);                
    },

    /**
    * On Key Mouse Move
    *
    */
    handleMouseMove: function(event) {
        if (!this.dragEnable) { 
            return;
        };

        if (this.dragIntialized) {
            // Raise Event: Drag will be started
            this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_DRAGDROP_START});
            this.dragIntialized = false;
            
            // And hide the resizers and the highlighting
            this.resizerSE.hide();
            this.resizerNW.hide();
            
            // if only edges are selected, containmentParentNode must be the canvas
            this._onlyEdges = this.currentShapes.all(function(currentShape) {
                return (currentShape instanceof ORYX.Core.Edge);
            });
            
            // Do method before Drag
            this.beforeDrag();
            
            this._currentUnderlyingNodes = [];
        }
    
        var position = this.calculateDragPosition(event);        
        this.dragBounds.moveTo(position);

        // Update the selection rectangle
        this.resizeRectangle(this.dragBounds);

        this.isAttachingAllowed = false;

        //check, if a node can be added to the underlying node
        var underlyingNodes = $A(this.facade.getCanvas().getAbstractShapesAtPosition(this.facade.eventCoordinates(event)));
        
        var checkIfAttachable = this.toMoveShapes.length == 1 && this.toMoveShapes[0] instanceof ORYX.Core.Node && this.toMoveShapes[0].dockers.length > 0
        checkIfAttachable    = checkIfAttachable && underlyingNodes.length != 1

        if (!checkIfAttachable &&
            underlyingNodes.length === this._currentUnderlyingNodes.length  &&
            underlyingNodes.all(function(node, index){return this._currentUnderlyingNodes[index] === node}.bind(this))) {
            return;
        } else if(this._onlyEdges) {
            this.isAddingAllowed = true;
            this.containmentParentNode = this.facade.getCanvas();
        } else {
            /* Check the containment and connection rules */
            var options = { event : event,
                            underlyingNodes : underlyingNodes,
                            checkIfAttachable : checkIfAttachable };
            this.checkRules(options);
        }
        
        this._currentUnderlyingNodes = underlyingNodes.reverse();
        
        //visualize the containment result
        if (this.isAttachingAllowed) {
            this.facade.raiseEvent({ type: ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW,
                                     highlightId: "dragdropresize.attached",
                                     elements: [this.containmentParentNode],
                                     style: ORYX.CONFIG.SELECTION_HIGHLIGHT_STYLE_RECTANGLE,
                                     color:    ORYX.CONFIG.SELECTION_VALID_COLOR });
        } else {
            this.facade.raiseEvent({ type: ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,
                                     highlightId: "dragdropresize.attached" });
        }
        
        if( !this.isAttachingAllowed ){
            if( this.isAddingAllowed ) {
                this.facade.raiseEvent({ type: ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW,
                                         highlightId: "dragdropresize.contain",
                                         elements: [this.containmentParentNode],
                                         color: ORYX.CONFIG.SELECTION_VALID_COLOR });
            } else {
                this.facade.raiseEvent({ type: ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW,
                                         highlightId: "dragdropresize.contain",
                                         elements: [this.containmentParentNode],
                                         color: ORYX.CONFIG.SELECTION_INVALID_COLOR });
            }
        } else {
            this.facade.raiseEvent({ type: ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,
                                     highlightId: "dragdropresize.contain" });            
        }
    },
    
    calculateDragPosition : function(event) {
        var position = { x: Event.pointerX(event) - this.offSetPosition.x,
                         y: Event.pointerY(event) - this.offSetPosition.y };

        position.x -= this.offsetScroll.x - this.scrollNode.scrollLeft; 
        position.y -= this.offsetScroll.y - this.scrollNode.scrollTop;
        
        // If not the Control-Key are pressed
        var modifierKeyPressed = event.shiftKey || event.ctrlKey;
        if(ORYX.CONFIG.GRID_ENABLED && !modifierKeyPressed) {
            // Snap the current position to the nearest Snap-Point
            position = this.snapToGrid(position);
        } else {
            if (this.vLine) {
                this.vLine.hide();
            }
            if (this.hLine) {
                this.hLine.hide();
            }
        }

        // Adjust the point by the zoom faktor 
        position.x /= this.faktorXY.x;
        position.y /= this.faktorXY.y;

        // Set that the position is not lower than zero
        position.x = Math.max(0, position.x)
        position.y = Math.max(0, position.y)

        // Set that the position is not bigger than the canvas
        var c = this.facade.getCanvas();
        position.x = Math.min(c.bounds.width() - this.dragBounds.width(), position.x);
        position.y = Math.min(c.bounds.height() - this.dragBounds.height(), position.y);
        
        return position;
    },
    
//    /**
//     * Rollbacks the docked shape of an edge, if the edge is not movable.
//     */
//    redockEdges: function() {
//        this._undockedEdgesCommand.dockers.each(function(el){
//            el.docker.setDockedShape(el.dockedShape);
//            el.docker.setReferencePoint(el.refPoint);
//        })
//    },
    
    /**
     *  Checks the containment and connection rules for the selected shapes.
     */
    checkRules : function(options) {
        var event = options.event;
        var underlyingNodes = options.underlyingNodes;
        var checkIfAttachable = options.checkIfAttachable;
        var noEdges = options.noEdges;
        
        //get underlying node that is not the same than one of the currently selected shapes or
        // a child of one of the selected shapes with the highest z Order.
        // The result is a shape or the canvas
        this.containmentParentNode = underlyingNodes.reverse().find((function(node) {
            return (node instanceof ORYX.Core.Canvas) || 
                    (((node instanceof ORYX.Core.Node) || ((node instanceof ORYX.Core.Edge) && !noEdges)) 
                    && (!(this.currentShapes.member(node) || 
                            this.currentShapes.any(function(shape) {
                                return (shape.children.length > 0 && shape.getChildNodes(true).member(node));
                            }))));
        }).bind(this));
                                
        if (checkIfAttachable && typeof this.containmentParentNode !== "undefined") {
                
            this.isAttachingAllowed = this.facade.getRules().canConnect({
                                                sourceShape:    this.containmentParentNode, 
                                                edgeShape:        this.toMoveShapes[0], 
                                                targetShape:    this.toMoveShapes[0]
                                                });                        
            
            if (this.isAttachingAllowed) {
                var point = this.facade.eventCoordinates(event);
                this.isAttachingAllowed = this.containmentParentNode.isPointOverOffset(point.x, point.y);
            }                        
        }
        
        if( !this.isAttachingAllowed ){
            //check all selected shapes, if they can be added to containmentParentNode
            this.isAddingAllowed = this.toMoveShapes.all((function(currentShape) {
                if(currentShape instanceof ORYX.Core.Edge ||
                    currentShape instanceof ORYX.Core.Controls.Docker ||
                    this.containmentParentNode === currentShape.parent) {
                    return true;
                } else if(this.containmentParentNode !== currentShape) {
                    
                    if(!(this.containmentParentNode instanceof ORYX.Core.Edge) || !noEdges) {
                    
                        if(this.facade.getRules().canContain({containingShape:this.containmentParentNode,
                                                              containedShape:currentShape})) {          
                            return true;
                        }
                    }
                }
                return false;
            }).bind(this));                
        }
        
        if(!this.isAttachingAllowed && !this.isAddingAllowed && 
                (this.containmentParentNode instanceof ORYX.Core.Edge)) {
            options.noEdges = true;
            options.underlyingNodes.reverse();
            this.checkRules(options);            
        }
    },

    onCanvasResizeShapesMoved: function(event) {
        var oldShapePositionsWithOffset = {};
        var oldPos;
        var shapeId;

        // add offsets to drag origin
        if (typeof this.oldDragBounds !== "undefined") {
            this.oldDragBounds.moveBy(event.offsetX, event.offsetY);
        }

        // add offsets to original shape positions
        if (typeof this.oldShapePositions !== "undefined") {
            for (shapeId in this.oldShapePositions) {
                if (this.oldShapePositions.hasOwnProperty(shapeId)) {
                    oldPos = this.oldShapePositions[shapeId];
                    oldShapePositionsWithOffset[shapeId] = { x: oldPos.x + event.offsetX,
                                                             y: oldPos.y + event.offsetY };
                }
            }
            this.oldShapePositions = oldShapePositionsWithOffset;
        }
       
        // update selection rectangle visuals
        if (this.dragEnable && (typeof this.dragBounds !== "undefined")) { 
            // update bounds
            this.dragBounds.moveBy(event.offsetX, event.offsetY);
            this.resizeRectangle(this.dragBounds);
    
            // update highlighting
            this.facade.raiseEvent({ type: ORYX.CONFIG.EVENT_CANVAS_RESIZE_UPDATE_HIGHLIGHTS,
                                     elements: this.toMoveShapes });
        }
    },
    
    /**
     * Redraw the selected Shapes.
     *
     */
    refreshSelectedShapes: function() {
        // If the selection bounds not initialized, return
        if(!this.dragBounds) {return}

        // Calculate the offset between the selection's new drag bounds and old drag bounds:
        var newDragBoundsCenter = this.dragBounds.center();
        var oldDragBoundsCenter = this.oldDragBounds.center();
        var offset = {
            x: newDragBoundsCenter.x - oldDragBoundsCenter.x,
            y: newDragBoundsCenter.y - oldDragBoundsCenter.y 
        };
        var getTargetPosition = function getTargetPosition(shape, offset) {
            // Add the calculated drag bounds offset to the shape bounds to get the target position for the shape:
            var oldShapeCenter = this.oldShapePositions[shape.id];
            return { x: oldShapeCenter.x + offset.x, y: oldShapeCenter.y + offset.y };
        }.bind(this);

        var aliveMoveShapes = this.removeDeadShapes(this.toMoveShapes);
        if (aliveMoveShapes.length > 0) {
            // Instantiate the Move Command
            var moveShapes = aliveMoveShapes.map(function addTargetPositionToShapes(shape) {
                return { shape: shape, 
                         origin: this.oldShapePositions[shape.id], 
                         target: getTargetPosition(shape, offset) };
            }.bind(this));

            var commands = [new ORYX.Core.Commands["DragDropResize.MoveCommand"](moveShapes, this.containmentParentNode, this.currentShapes, this.facade)];
            // If the undocked edges command is setted, add this command
            if( this._undockedEdgesCommand instanceof ORYX.Core.Command ){
                commands.unshift( this._undockedEdgesCommand );
            }
            // Execute the commands            
            this.facade.executeCommands( commands );    

            // copy the bounds to the old bounds
            if( this.dragBounds )
                this.oldDragBounds = this.dragBounds.clone();
        }
    },
    

    removeDeadShapes: function removeDeadShapes(moveShapes) {
        var canvas = this.facade.getCanvas();
        var getShape = function getShape(resourceId) {
            var shape = canvas.getChildShapeByResourceId(resourceId);
            return shape;
        };
        var getDocker = function getDocker(shape, dockerId) {
            var docker = undefined;
            for (var i = 0; i < shape.dockers.length; i++) {
                if (shape.dockers[i].id == dockerId) {
                    docker = shape.dockers[i];                
                }
            }
            return docker;
        };
        var aliveMoveShapes = [];
        for (var i = 0; i < moveShapes.length; i++) {
            var currentShape = moveShapes[i];
            if (currentShape instanceof ORYX.Core.Node || currentShape instanceof ORYX.Core.Edge) {
                var currentShapeOnCanvas = getShape(currentShape.resourceId);
                if (typeof currentShapeOnCanvas !== "undefined") {
                    aliveMoveShapes.push(moveShapes[i]);
                }
            } else if (currentShape instanceof ORYX.Core.Controls.Docker) {
                var parentShapeOnCanvas = getShape(currentShape.parent.resourceId);
                if (typeof parentShapeOnCanvas === "undefined") {
                    continue;
                } else {
                    var dockerOnCanvas = getDocker(parentShapeOnCanvas, currentShape.id);
                    if (typeof dockerOnCanvas !== "undefined") {
                        aliveMoveShapes.push(moveShapes[i]);
                    }
                }
            }
        }
        return aliveMoveShapes; 
    },

    /**
     * Callback for Resize
     *
     */
    onResize: function(bounds) {
        // If the selection bounds not initialized, return
        if(!this.dragBounds) {return}
        
        this.dragBounds = bounds;
        this.isResizing = true;

        // Update the rectangle 
        this.resizeRectangle(this.dragBounds);
    },
    
    onResizeStart: function() {
        this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_RESIZE_START});
    },

    onResizeEnd: function(orientation) {
        if (!(this.currentShapes instanceof Array)||this.currentShapes.length<=0) {
            return;
        }
        // If Resizing finished, the Shapes will be resize
        if (this.isResizing) {

                if (((orientation === "southeast") && (this.dragBounds.b.x === this.oldDragBounds.b.x) && (this.dragBounds.b.y === this.oldDragBounds.b.y)) || ((orientation === "northwest") && (this.dragBounds.a.x == this.oldDragBounds.a.x) && (this.dragBounds.a.y == this.oldDragBounds.a.y))) {
                var bounds = this.dragBounds.clone();
                var shape = this.currentShapes[0];
                if (shape.parent) {
                    var parentPosition = shape.parent.absoluteXY();
                    bounds.moveBy(-parentPosition.x, -parentPosition.y);
                }
                var aliveShapeArray = this.removeDeadShapes([shape]);
                if (aliveShapeArray.length > 0) {
                    var oldBounds = shape.bounds.clone();
                    var command = new ORYX.Core.Commands["DragDropResize.ResizeCommand"](shape, bounds, oldBounds, this.facade, orientation);
                    this.facade.executeCommands([command]);            
                    this.isResizing = false;            
                    this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_RESIZE_END});
                }
            }
        }
    },
    

    /**
     * Prepare the Dragging
     *
     */
    beforeDrag: function(){
        
        this._undockedEdgesCommand = new ORYX.Core.Commands["DragDropResize.UndockEdgeCommand"](this.toMoveShapes, this.facade);
        this._undockedEdgesCommand.execute();    
        
    },

    hideAllLabels: function(shape) {
            
            // Hide all labels from the shape
            shape.getLabels().each(function(label) {
                label.hide();
            });
            // Hide all labels from docked shapes
            shape.getAllDockedShapes().each(function(dockedShape) {
                var labels = dockedShape.getLabels();
                if(labels.length > 0) {
                    labels.each(function(label) {
                        label.hide();
                    });
                }
            });

            // Do this recursive for all child shapes
            // EXP-NICO use getShapes
            shape.getChildren().each((function(value) {
                if(value instanceof ORYX.Core.Shape)
                    this.hideAllLabels(value);
            }).bind(this));
    },

    /**
     * Finished the Dragging
     *
     */
    afterDrag: function(){
                
    },

    /**
     * Show all Labels at these shape
     * 
     */
    showAllLabels: function(shape) {

            // Show the label of these shape
            //shape.getLabels().each(function(label) {
            for(var i=0; i<shape.length ;i++){
                var label = shape[i];
                label.show();
            }//);
            // Show all labels at docked shapes
            //shape.getAllDockedShapes().each(function(dockedShape) {
            var allDockedShapes = shape.getAllDockedShapes()
            for(var i=0; i<allDockedShapes.length ;i++){
                var dockedShape = allDockedShapes[i];                
                var labels = dockedShape.getLabels();
                if(labels.length > 0) {
                    labels.each(function(label) {
                        label.show();
                    });
                }
            }//);

            // Do this recursive
            //shape.children.each((function(value) {
            for(var i=0; i<shape.children.length ;i++){
                var value = shape.children[i];    
                if(value instanceof ORYX.Core.Shape)
                    this.showAllLabels(value);
            }//).bind(this));
    },

    /**
     * Intialize Method, if there are new Plugins
     *
     */
    /*registryChanged: function(pluginsData) {
        // Save all new Plugin, sorted by group and index
        this.pluginsData = pluginsData.sortBy( function(value) {
            return (value.group + "" + value.index);
        });
    },*/

    /**
     * On the Selection-Changed
     *
     */
    onSelectionChanged: function(event) {
        var elements = event.elements;
        
        // Reset the drag-variables
        this.dragEnable = false;
        this.dragIntialized = false;
        this.resizerSE.hide();
        this.resizerNW.hide();

        // If there is no elements
        if(!elements || elements.length == 0) {
            // Hide all things and reset all variables
            this.selectedRect.hide();
            this.currentShapes = [];
            this.toMoveShapes = [];
            this.dragBounds = undefined;
            this.oldDragBounds = undefined;
            this.oldShapePositions = {};
        } else {

            // Set the current Shapes
            this.currentShapes = elements;

            // Get all shapes with the highest parent in object hierarchy (canvas is the top most parent)
            var topLevelElements = this.facade.getCanvas().getShapesWithSharedParent(elements);
            this.toMoveShapes = topLevelElements;
            
            this.toMoveShapes = this.toMoveShapes.findAll( function(shape) { return shape instanceof ORYX.Core.Node && 
                                                                            (shape.dockers.length === 0 || !elements.member(shape.dockers.first().getDockedShape()))});        
                
            elements.each((function(shape){
                if(!(shape instanceof ORYX.Core.Edge)) {return}
                
                var dks = shape.getDockers() 
                                
                var hasF = elements.member(dks.first().getDockedShape());
                var hasL = elements.member(dks.last().getDockedShape());    
                        
//                if(!hasL) {
//                    this.toMoveShapes.push(dks.last());
//                }
//                if(!hasF){
//                    this.toMoveShapes.push(dks.first())
//                } 
                /* Enable movement of undocked edges */
                if(!hasF && !hasL) {
                    var isUndocked = !dks.first().getDockedShape() && !dks.last().getDockedShape()
                    if(isUndocked) {
                        this.toMoveShapes = this.toMoveShapes.concat(dks);
                    }
                }
                
                if( shape.dockers.length > 2 && hasF && hasL){
                    this.toMoveShapes = this.toMoveShapes.concat(dks.findAll(function(el,index){ return index > 0 && index < dks.length-1}))
                }
                
            }).bind(this));

            // store old shape positions to cope with the problem that remote collaborators
            // could remove these shapes while they are being dragged around
            this.oldShapePositions = {};
            this.toMoveShapes.each(function storeShapePosition(shape) {
                this.oldShapePositions[shape.id] = shape.absoluteBounds().center(); 
            }.bind(this));
            
            // Calculate the new area-bounds of the selection
            var newBounds = undefined;
            this.toMoveShapes.each(function(value) {
                var shape = value;
                if(value instanceof ORYX.Core.Controls.Docker) {
                    /* Get the Shape */
                    shape = value.parent;
                }
                
                if(!newBounds){
                    newBounds = shape.absoluteBounds();
                }
                else {
                    newBounds.include(shape.absoluteBounds());
                }
            }.bind(this));
            
            if(!newBounds){
                elements.each(function(value){
                    if(!newBounds) {
                        newBounds = value.absoluteBounds();
                    } else {
                        newBounds.include(value.absoluteBounds());
                    }
                });
            }
            
            // Set the new bounds
            this.dragBounds = newBounds;
            this.oldDragBounds = newBounds.clone();

            // Update and show the rectangle
            this.resizeRectangle(newBounds);
            this.selectedRect.show();
            
            // Show the resize button, if there is only one element and this is resizeable
            if(elements.length == 1 && elements[0].isResizable) {
                var aspectRatio = elements[0].getStencil().fixedAspectRatio() ? elements[0].bounds.width() / elements[0].bounds.height() : undefined;
                this.resizerSE.setBounds(this.dragBounds, elements[0].minimumSize, elements[0].maximumSize, aspectRatio);
                this.resizerSE.show();
                this.resizerNW.setBounds(this.dragBounds, elements[0].minimumSize, elements[0].maximumSize, aspectRatio);
                this.resizerNW.show();
            } else {
                this.resizerSE.setBounds(undefined);
                this.resizerNW.setBounds(undefined);
            }

            // If Snap-To-Grid is enabled, the Snap-Point will be calculate
            if(ORYX.CONFIG.GRID_ENABLED) {

                // Reset all points
                this.distPoints = [];

                if (this.distPointTimeout)
                    window.clearTimeout(this.distPointTimeout)
                
                this.distPointTimeout = window.setTimeout(function(){
                    // Get all the shapes, there will consider at snapping
                    // Consider only those elements who shares the same parent element
                    var distShapes = this.facade.getCanvas().getChildShapes(true).findAll(function(value){
                        var parentShape = value.parent;
                        while(parentShape){
                            if(elements.member(parentShape)) return false;
                            parentShape = parentShape.parent
                        }
                        return true;
                    })
                    
                    // The current selection will delete from this array
                    //elements.each(function(shape) {
                    //    distShapes = distShapes.without(shape);
                    //});

                    // For all these shapes
                    distShapes.each((function(value) {
                        if(!(value instanceof ORYX.Core.Edge)) {
                            var ul = value.absoluteXY();
                            var width = value.bounds.width();
                            var height = value.bounds.height();

                            // Add the upperLeft, center and lowerRight - Point to the distancePoints
                            this.distPoints.push({
                                ul: {
                                    x: ul.x,
                                    y: ul.y
                                },
                                c: {
                                    x: ul.x + (width / 2),
                                    y: ul.y + (height / 2)
                                },
                                lr: {
                                    x: ul.x + width,
                                    y: ul.y + height
                                }
                            });
                        }
                    }).bind(this));
                    
                }.bind(this), 10)


            }
        }
    },

    /**
     * Adjust an Point to the Snap Points
     *
     */
    snapToGrid: function(position) {

        // Get the current Bounds
        var bounds = this.dragBounds;
        
        var point = {};

        var ulThres = 6;
        var cThres = 10;
        var lrThres = 6;

        var scale = this.vLine ? this.vLine.getScale() : 1;
        
        var ul = { x: (position.x/scale), y: (position.y/scale)};
        var c = { x: (position.x/scale) + (bounds.width()/2), y: (position.y/scale) + (bounds.height()/2)};
        var lr = { x: (position.x/scale) + (bounds.width()), y: (position.y/scale) + (bounds.height())};

        var offsetX, offsetY;
        var gridX, gridY;
        
        // For each distant point
        this.distPoints.each(function(value) {

            var x, y, gx, gy;
            if (Math.abs(value.c.x-c.x) < cThres){
                x = value.c.x-c.x;
                gx = value.c.x;
            }/* else if (Math.abs(value.ul.x-ul.x) < ulThres){
                x = value.ul.x-ul.x;
                gx = value.ul.x;
            } else if (Math.abs(value.lr.x-lr.x) < lrThres){
                x = value.lr.x-lr.x;
                gx = value.lr.x;
            } */
            

            if (Math.abs(value.c.y-c.y) < cThres){
                y = value.c.y-c.y;
                gy = value.c.y;
            }/* else if (Math.abs(value.ul.y-ul.y) < ulThres){
                y = value.ul.y-ul.y;
                gy = value.ul.y;
            } else if (Math.abs(value.lr.y-lr.y) < lrThres){
                y = value.lr.y-lr.y;
                gy = value.lr.y;
            } */

            if (x !== undefined) {
                offsetX = offsetX === undefined ? x : (Math.abs(x) < Math.abs(offsetX) ? x : offsetX);
                if (offsetX === x)
                    gridX = gx;
            }

            if (y !== undefined) {
                offsetY = offsetY === undefined ? y : (Math.abs(y) < Math.abs(offsetY) ? y : offsetY);
                if (offsetY === y)
                    gridY = gy;
            }
        });
        
        
        if (offsetX !== undefined) {
            ul.x += offsetX;    
            ul.x *= scale;
            if (this.vLine&&gridX)
                this.vLine.update(gridX);
        } else {
            ul.x = (position.x - (position.x % (ORYX.CONFIG.GRID_DISTANCE/2)));
            if (this.vLine)
                this.vLine.hide()
        }
        
        if (offsetY !== undefined) {    
            ul.y += offsetY;
            ul.y *= scale;
            if (this.hLine&&gridY)
                this.hLine.update(gridY);
        } else {
            ul.y = (position.y - (position.y % (ORYX.CONFIG.GRID_DISTANCE/2)));
            if (this.hLine)
                this.hLine.hide();
        }
        
        return ul;
    },
    
    showGridLine: function(){
        
    },


    /**
     * Redraw of the Rectangle of the SelectedArea
     * @param {Object} bounds
     */
    resizeRectangle: function(bounds) {
        // Resize the Rectangle
        this.selectedRect.resize(bounds);
    }

});


ORYX.Plugins.SelectedRect = Clazz.extend({

    construct: function(parentId) {

        this.parentId = parentId;

        this.node = ORYX.Editor.graft("http://www.w3.org/2000/svg", $(parentId),
                    ['g']);

        this.dashedArea = ORYX.Editor.graft("http://www.w3.org/2000/svg", this.node,
            ['rect', {x: 0, y: 0,
                'stroke-width': 1, stroke: '#777777', fill: 'none',
                'stroke-dasharray': '2,2',
                'pointer-events': 'none'}]);

        this.hide();

    },

    hide: function() {
        this.node.setAttributeNS(null, 'display', 'none');
    },

    show: function() {
        this.node.setAttributeNS(null, 'display', '');
    },

    resize: function(bounds) {
        var upL = bounds.upperLeft();

        var padding = ORYX.CONFIG.SELECTED_AREA_PADDING;

        this.dashedArea.setAttributeNS(null, 'width', bounds.width() + 2*padding);
        this.dashedArea.setAttributeNS(null, 'height', bounds.height() + 2*padding);
        this.node.setAttributeNS(null, 'transform', "translate("+ (upL.x - padding) +", "+ (upL.y - padding) +")");
    }


});



ORYX.Plugins.GridLine = Clazz.extend({
    
    construct: function(parentId, direction) {

        if (ORYX.Plugins.GridLine.DIR_HORIZONTAL !== direction && ORYX.Plugins.GridLine.DIR_VERTICAL !== direction) {
            direction = ORYX.Plugins.GridLine.DIR_HORIZONTAL
        }
        
    
        this.parent = $(parentId);
        this.direction = direction;
        this.node = ORYX.Editor.graft("http://www.w3.org/2000/svg", this.parent,
                    ['g']);

        this.line = ORYX.Editor.graft("http://www.w3.org/2000/svg", this.node,
            ['path', {
                'stroke-width': 1, stroke: 'silver', fill: 'none',
                'stroke-dasharray': '5,5',
                'pointer-events': 'none'}]);

        this.hide();

    },

    hide: function() {
        this.node.setAttributeNS(null, 'display', 'none');
    },

    show: function() {
        this.node.setAttributeNS(null, 'display', '');
    },

    getScale: function(){
        try {
            return this.parent.parentNode.transform.baseVal.getItem(0).matrix.a;
        } catch(e) {
            return 1;
        }
    },
    
    update: function(pos) {
        
        if (this.direction === ORYX.Plugins.GridLine.DIR_HORIZONTAL) {
            var y = pos instanceof Object ? pos.y : pos; 
            var cWidth = this.parent.parentNode.parentNode.width.baseVal.value/this.getScale();
            this.line.setAttributeNS(null, 'd', 'M 0 '+y+ ' L '+cWidth+' '+y);
        } else {
            var x = pos instanceof Object ? pos.x : pos; 
            var cHeight = this.parent.parentNode.parentNode.height.baseVal.value/this.getScale();
            this.line.setAttributeNS(null, 'd', 'M'+x+ ' 0 L '+x+' '+cHeight);
        }
        
        this.show();
    }


});

ORYX.Plugins.GridLine.DIR_HORIZONTAL = "hor";
ORYX.Plugins.GridLine.DIR_VERTICAL = "ver";

ORYX.Plugins.Resizer = Clazz.extend({

    construct: function(parentId, orientation, facade) {

        this.parentId         = parentId;
        this.orientation    = orientation;
        this.facade            = facade;
        this.node = ORYX.Editor.graft("http://www.w3.org/1999/xhtml", $(this.parentId),
            ['div', {'class': 'resizer_'+ this.orientation, style:'left:0px; top:0px;'}]);

        this.node.addEventListener(ORYX.CONFIG.EVENT_MOUSEDOWN, this.handleMouseDown.bind(this), true);
        document.documentElement.addEventListener(ORYX.CONFIG.EVENT_MOUSEUP,     this.handleMouseUp.bind(this),         true);
        document.documentElement.addEventListener(ORYX.CONFIG.EVENT_MOUSEMOVE,     this.handleMouseMove.bind(this),     false);

        this.dragEnable = false;
        this.offSetPosition = {x: 0, y: 0};
        this.bounds = undefined;

        this.canvasNode = this.facade.getCanvas().node;

        this.minSize = undefined;
        this.maxSize = undefined;
        
        this.aspectRatio = undefined;

        this.resizeCallbacks         = [];
        this.resizeStartCallbacks     = [];
        this.resizeEndCallbacks     = [];
        this.hide();
        
        // Calculate the Offset
        this.scrollNode = this.node.parentNode.parentNode.parentNode;


    },

    handleMouseDown: function(event) {
        this.dragEnable = true;

        this.offsetScroll    = {x:this.scrollNode.scrollLeft,y:this.scrollNode.scrollTop};
            
        this.offSetPosition =  {
            x: Event.pointerX(event) - this.position.x,
            y: Event.pointerY(event) - this.position.y};
        
        this.resizeStartCallbacks.each((function(value) {
            value(this.bounds);
        }).bind(this));

    },

    handleMouseUp: function(event) {
        this.dragEnable = false;
        this.containmentParentNode = null;
        this.resizeEndCallbacks.each((function(value) {
            value(this.bounds);
        }).bind(this));
                
    },

    handleMouseMove: function(event) {
        if(!this.dragEnable) { return }
        
        if(event.shiftKey || event.ctrlKey) {
            this.aspectRatio = this.bounds.width() / this.bounds.height();
        } else {
            this.aspectRatio = undefined;
        }

        var position = {
            x: Event.pointerX(event) - this.offSetPosition.x,
            y: Event.pointerY(event) - this.offSetPosition.y}


        position.x     -= this.offsetScroll.x - this.scrollNode.scrollLeft; 
        position.y     -= this.offsetScroll.y - this.scrollNode.scrollTop;
        
        position.x  = Math.min( position.x, this.facade.getCanvas().bounds.width())
        position.y  = Math.min( position.y, this.facade.getCanvas().bounds.height())
        
        var offset = {
            x: position.x - this.position.x,
            y: position.y - this.position.y
        }
        
        if(this.aspectRatio) {
            // fixed aspect ratio
            newAspectRatio = (this.bounds.width()+offset.x) / (this.bounds.height()+offset.y);
            if(newAspectRatio>this.aspectRatio) {
                offset.x = this.aspectRatio * (this.bounds.height()+offset.y) - this.bounds.width();
            } else if(newAspectRatio<this.aspectRatio) {
                offset.y = (this.bounds.width()+offset.x) / this.aspectRatio - this.bounds.height();
            }
        }
        
        // respect minimum and maximum sizes of stencil
        if(this.orientation==="northwest") {
            if(this.bounds.width()-offset.x > this.maxSize.width) {
                offset.x = -(this.maxSize.width - this.bounds.width());
                if(this.aspectRatio)
                    offset.y = this.aspectRatio * offset.x;
            }
            if(this.bounds.width()-offset.x < this.minSize.width) {
                offset.x = -(this.minSize.width - this.bounds.width());
                if(this.aspectRatio)
                    offset.y = this.aspectRatio * offset.x;
            }
            if(this.bounds.height()-offset.y > this.maxSize.height) {
                offset.y = -(this.maxSize.height - this.bounds.height());
                if(this.aspectRatio)
                    offset.x = offset.y / this.aspectRatio;
            }
            if(this.bounds.height()-offset.y < this.minSize.height) {
                offset.y = -(this.minSize.height - this.bounds.height());
                if(this.aspectRatio)
                    offset.x = offset.y / this.aspectRatio;
            }
        } else { // defaults to southeast
            if(this.bounds.width()+offset.x > this.maxSize.width) {
                offset.x = this.maxSize.width - this.bounds.width();
                if(this.aspectRatio)
                    offset.y = this.aspectRatio * offset.x;
            }
            if(this.bounds.width()+offset.x < this.minSize.width) {
                offset.x = this.minSize.width - this.bounds.width();
                if(this.aspectRatio)
                    offset.y = this.aspectRatio * offset.x;
            }
            if(this.bounds.height()+offset.y > this.maxSize.height) {
                offset.y = this.maxSize.height - this.bounds.height();
                if(this.aspectRatio)
                    offset.x = offset.y / this.aspectRatio;
            }
            if(this.bounds.height()+offset.y < this.minSize.height) {
                offset.y = this.minSize.height - this.bounds.height();
                if(this.aspectRatio)
                    offset.x = offset.y / this.aspectRatio;
            }
        }

        if(this.orientation==="northwest") {
            var oldLR = {x: this.bounds.lowerRight().x, y: this.bounds.lowerRight().y};
            this.bounds.extend({x:-offset.x, y:-offset.y});
            this.bounds.moveBy(offset);
        } else { // defaults to southeast
            this.bounds.extend(offset);
        }

        this.update();

        this.resizeCallbacks.each((function(value) {
            value(this.bounds);
        }).bind(this));

        Event.stop(event);

    },
    
    registerOnResizeStart: function(callback) {
        if(!this.resizeStartCallbacks.member(callback)) {
            this.resizeStartCallbacks.push(callback);
        }
    },
    
    unregisterOnResizeStart: function(callback) {
        if(this.resizeStartCallbacks.member(callback)) {
            this.resizeStartCallbacks = this.resizeStartCallbacks.without(callback);
        }
    },

    registerOnResizeEnd: function(callback) {
        if(!this.resizeEndCallbacks.member(callback)) {
            this.resizeEndCallbacks.push(callback);
        }
    },
    
    unregisterOnResizeEnd: function(callback) {
        if(this.resizeEndCallbacks.member(callback)) {
            this.resizeEndCallbacks = this.resizeEndCallbacks.without(callback);
        }
    },
        
    registerOnResize: function(callback) {
        if(!this.resizeCallbacks.member(callback)) {
            this.resizeCallbacks.push(callback);
        }
    },

    unregisterOnResize: function(callback) {
        if(this.resizeCallbacks.member(callback)) {
            this.resizeCallbacks = this.resizeCallbacks.without(callback);
        }
    },

    hide: function() {
        this.node.style.display = "none";
    },

    show: function() {
        if(this.bounds)
            this.node.style.display = "";
    },

    setBounds: function(bounds, min, max, aspectRatio) {
        this.bounds = bounds;

        if(!min)
            min = {width: ORYX.CONFIG.MINIMUM_SIZE, height: ORYX.CONFIG.MINIMUM_SIZE};

        if(!max)
            max = {width: ORYX.CONFIG.MAXIMUM_SIZE, height: ORYX.CONFIG.MAXIMUM_SIZE};

        this.minSize = min;
        this.maxSize = max;
        
        this.aspectRatio = aspectRatio;

        this.update();
    },

    update: function() {
        if(!this.bounds) { return; }

        var upL = this.bounds.upperLeft();

        if(this.bounds.width() < this.minSize.width)    { this.bounds.set(upL.x, upL.y, upL.x + this.minSize.width, upL.y + this.bounds.height())};
        if(this.bounds.height() < this.minSize.height)    { this.bounds.set(upL.x, upL.y, upL.x + this.bounds.width(), upL.y + this.minSize.height)};
        if(this.bounds.width() > this.maxSize.width)    { this.bounds.set(upL.x, upL.y, upL.x + this.maxSize.width, upL.y + this.bounds.height())};
        if(this.bounds.height() > this.maxSize.height)    { this.bounds.set(upL.x, upL.y, upL.x + this.bounds.width(), upL.y + this.maxSize.height)};

        var a = this.canvasNode.getScreenCTM();
        // a is undefined when canvas is not displayed (happens during loading). In this case we pray and hope that a.a and a.d equal 1 (zoom level 100%).
        if (!a) {
            a = {
                'a': 1,
                'd': 1
            };
        }
        
        upL.x *= a.a;
        upL.y *= a.d;
        
        if(this.orientation==="northwest") {
            upL.x -= 13;
            upL.y -= 26;
        } else { // defaults to southeast
            upL.x +=  (a.a * this.bounds.width()) + 3 ;
            upL.y +=  (a.d * this.bounds.height())  + 3;
        }
        
        this.position = upL;

        this.node.style.left = this.position.x + "px";
        this.node.style.top = this.position.y + "px";
    }
});



/**
 * Implements a Command to move shapes
 * 
 */ 
ORYX.Core.Commands["DragDropResize.MoveCommand"] = ORYX.Core.AbstractCommand.extend({
    /**
     *  @param {Array} moveShapes An array of { shape: <shape object>, origin: <origin position>, target: <target position> } objects
     */
    construct: function(moveShapes, parent, selectedShapes, facade){
        // super constructor call
        arguments.callee.$.construct.call(this, facade);
        
        this.moveShapes = moveShapes;
        this.selectedShapes = selectedShapes;
        this.parent     = parent;
        // Defines the old/new parents for the particular shape
        this.newParents    = moveShapes.collect(function(t){ return parent || t.shape.parent });
        this.oldParents    = moveShapes.collect(function(shape){ return shape.shape.parent });
        this.dockedNodes= moveShapes.findAll(function(shape) {
            return shape.shape instanceof ORYX.Core.Node && shape.shape.dockers.length == 1
        }).collect(function(shape) {
            return {
                docker: shape.shape.dockers[0],
                dockedShape: shape.shape.dockers[0].getDockedShape(),
                refPoint: shape.shape.dockers[0].referencePoint
            }
        });
    },
    
    
    getAffectedShapes: function getAffectedShapes() {
        // return only the shapes from the objects inside the moveShapes Array
        var getShapes = function getShapes(obj) {
            if (obj.shape instanceof ORYX.Core.Controls.Docker) {
                return obj.shape.parent;
            } 
            return obj.shape;
        }
        var allShapes = this.moveShapes.collect(getShapes);
        var flows = [];
        for (var i = 0; i < allShapes.length; i++) {
            var shape = allShapes[i];
            if (shape instanceof ORYX.Core.Node) {
                flows = flows.concat(shape.outgoing).concat(shape.incoming);
            }
        }
        return allShapes.concat(flows);
    },
    
    getCommandName: function getCommandName() {
        return "DragDropResize.MoveCommand";
    },
    
    getDisplayName: function getDisplayName() {
        return "Shape moved";
    },
    
    getCommandData: function getCommandData() {
        var mapShapeToId = function convertShapeToId(obj) {
            var shapeData = {
                origin: obj.origin, 
                target: obj.target
            };
            if (obj.shape instanceof ORYX.Core.Controls.Docker) {
                /* A docker does not have a resourceId and therefore cannot be found via getChildShapeOrCanvasByResourceId.
                 Thus, we have to additonally store a reference to the Edge, i.e. the parent of the docker. */
                shapeData.shapeId = obj.shape.parent.resourceId;
                shapeData.dockerId = obj.shape.id;
            } else {
                shapeData.shapeId = obj.shape.resourceId;
            }
            return shapeData;
        };
        var parentId = null;
        if (this.parent) {
            parentId = this.parent.resourceId;
        }        
        var cmdData = {
            parentId : parentId,
            shapeTargetPositions : this.moveShapes.map(mapShapeToId)
        };
        
        return cmdData;
    },
    
    createFromCommandData: function createFromCommandData(facade, cmdData) {
        var i;
        var canvas = facade.getCanvas();
        var getShape = canvas.getChildShapeByResourceId.bind(canvas);
        var mapIdToShape = function mapIdToShape(obj) {
            return { shape: getShape(obj.shapeId), origin: obj.origin, target: obj.target } 
        };

        var getDocker = function getDocker(shape, dockerId) {
            var docker;
            for (var i = 0; i < shape.dockers.length; i++) {
                if (shape.dockers[i].id == dockerId) {
                    docker = shape.dockers[i];                
                }
            }
            return docker;
        };
        var parent = facade.getCanvas().getChildShapeOrCanvasByResourceId(cmdData.parentId);
        
        // There seems to be no map for the parsed array, so we'll just iterate over it.
        var moveShapes = [];
        for (i = 0; i < cmdData.shapeTargetPositions.length; i++) {
            var shape = mapIdToShape(cmdData.shapeTargetPositions[i]);
            if (shape.shape instanceof ORYX.Core.Edge) {
                var docker = getDocker(shape.shape, cmdData.shapeTargetPositions[i].dockerId);
                if (typeof docker!== "undefined") {
                    var newShape = {
                        shape: docker,
                        origin: shape.origin,
                        target: shape.target
                    };
                    moveShapes.push(newShape);
                }
            } else {
                if (typeof shape.shape !== "undefined") {
                    moveShapes.push(shape);
                } else {
                    ORYX.Log.warn("Trying to move deleted shape");
                }
            }
        }
        
        // Checking if any of the shapes to be moved still exists.
        // If not, we don't want to instantiate a command and return undefined instead.
        var shapesExist = false;
        for (var i = 0; i < moveShapes.length; i++) {
            var movingShape = moveShapes[i].shape;
            if (movingShape instanceof ORYX.Core.Controls.Docker) {
                var resourceId = movingShape.parent.resourceId;
                var parentShape = facade.getCanvas().getChildShapeByResourceId(resourceId);
                if (typeof parentShape !== 'undefined') {
                    var docker = getDocker(parentShape, movingShape.id);
                    if (typeof docker !== "undefined") {
                        shapesExist = true;
                        break;
                    }
                }
            } else {
                var resourceId = movingShape.resourceId;
                if (typeof facade.getCanvas().getChildShapeByResourceId(resourceId) !== 'undefined') {
                    shapesExist = true;
                    break;
                }
            }
        }
        if (!shapesExist) {
            return undefined;
        }
        
        var selectedShapes = []; // We don't want a remote move to change the current selection.
        return new ORYX.Core.Commands["DragDropResize.MoveCommand"](moveShapes, parent, selectedShapes, facade);
    },
    execute: function(){
        var aliveMoveShapesWithParents = this.removeDeadShapes(this.moveShapes, this.newParents);
        var aliveMoveShapes = aliveMoveShapesWithParents.moveShapes;
        var newParents = aliveMoveShapesWithParents.parents;
        this.dockAllShapes();
        // Moves all shapes in moveShapes to their targets
		this.move(aliveMoveShapes);
        // Addes to the new parents
		this.addShapeToParent(aliveMoveShapes, newParents); 
        // Set the selection to the current selection
        this.selectCurrentShapes();
        this.facade.getCanvas().update();
        this.facade.updateSelection(this.isLocal());
    },
    rollback: function(){
        // Moves by the inverted offset
        var invertedMoveShapes = this.moveShapes.map(function setTargetToOrigin(obj) {
            return { shape: obj.shape, target: obj.origin }
        });
        var aliveInvertedMoveShapesWithParents = this.removeDeadShapes(invertedMoveShapes, this.oldParents);
        var aliveInvertedMoveShapes = aliveInvertedMoveShapesWithParents.moveShapes;
        var oldParents = aliveInvertedMoveShapesWithParents.parents;
        this.move(invertedMoveShapes);
        // Addes to the old parents
		this.addShapeToParent(aliveInvertedMoveShapes, oldParents);
        this.dockAllShapes(true);
        // Set the selection to the current selection   
		this.selectCurrentShapes();
        this.facade.getCanvas().update();
        this.facade.updateSelection(this.isLocal());
        
    },
    removeDeadShapes: function removeDeadShapes(moveShapes, parents) {
        var canvas = this.facade.getCanvas();
        var getShape = function getShape(resourceId) {
            var shape = canvas.getChildShapeByResourceId(resourceId);
            return shape;
        };
        var getDocker = function getDocker(shape, dockerId) {
            var docker = undefined;
            for (var i = 0; i < shape.dockers.length; i++) {
                if (shape.dockers[i].id == dockerId) {
                    docker = shape.dockers[i];                
                }
            }
            return docker;
        };
        var aliveMoveShapes = [];
        var newParents = [];
        for (var i = 0; i < moveShapes.length; i++) {
            var currentShape = moveShapes[i].shape;
            if (currentShape instanceof ORYX.Core.Node || currentShape instanceof ORYX.Core.Edge) {
                var currentShapeOnCanvas = getShape(currentShape.resourceId);
                if (typeof currentShapeOnCanvas !== "undefined") {
                    aliveMoveShapes.push(moveShapes[i]);
                    newParents.push(parents[i]);
                }
            } else if (currentShape instanceof ORYX.Core.Controls.Docker) {
                var parentShapeOnCanvas = getShape(currentShape.parent.resourceId);
                if (typeof parentShapeOnCanvas === "undefined") {
                    continue;
                } else {
                    var dockerOnCanvas = getDocker(parentShapeOnCanvas, currentShape.id);
                    if (typeof dockerOnCanvas !== "undefined") {
                        aliveMoveShapes.push(moveShapes[i]);
                        newParents.push(parents[i]);
                    }
                }
            }
        }
        return {"moveShapes": aliveMoveShapes, "parents": newParents}; 
    },

    /**
     * @param {Array} moveShapes An array of { shape: <shape instance to move>, target: <target point> } objects
     */
    move: function(moveShapes) {
        for(var i = 0; i < moveShapes.length ; i++){
            var movingShape = moveShapes[i].shape;
            var oldCenter = movingShape.absoluteBounds().center();
            var targetCenter = moveShapes[i].target;
                        
            // Calculate the offset between the target bounds and the current bounds
            var offset = {
                x: (targetCenter.x - oldCenter.x),
                y: (targetCenter.y - oldCenter.y) 
            };
            movingShape.bounds.moveBy(offset);

            if (movingShape instanceof ORYX.Core.Node) {
                (movingShape.dockers||[]).each(function(d){
                    d.bounds.moveBy(offset);
                });

                // handleLayoutEdges results in inconsistent results between local and remote version - remote version moves undocked (added) docker twice the intended offset 
                // when it is in line with a start or enddocker

				/*var allEdges = [].concat(movingShape.getIncomingShapes())
                    .concat(movingShape.getOutgoingShapes())
                    // Remove all edges which are included in the selection from the list
                    .findAll(function(r){ return    r instanceof ORYX.Core.Edge && !moveShapes.any(function(d){ return d == r || (d instanceof ORYX.Core.Controls.Docker && d.parent == r)}) }.bind(this))
                    // Remove all edges which are between the node and a node contained in the selection from the list
                    .findAll(function(r){ return     (r.dockers.first().getDockedShape() == movingShape || !moveShapes.include(r.dockers.first().getDockedShape())) &&  
                                                    (r.dockers.last().getDockedShape() == movingShape || !moveShapes.include(r.dockers.last().getDockedShape()))}.bind(this))
                                                    
                // Layout all outgoing/incoming edges
                // this.plugin.layoutEdges(node, allEdges, offset);
                
                this.facade.raiseEvent({
                    type : ORYX.CONFIG.EVENT_LAYOUT_EDGES,
                    node : movingShape,
                    edges : allEdges,
                    offset : offset
                });*/	
            }
        }
                                        
    },
    dockAllShapes: function(shouldDocked){
        // Undock all Nodes
        for (var i = 0; i < this.dockedNodes.length; i++) {
            var docker = this.dockedNodes[i].docker;
            
            docker.setDockedShape( shouldDocked ? this.dockedNodes[i].dockedShape : undefined )
            if (docker.getDockedShape()) {
                docker.setReferencePoint(this.dockedNodes[i].refPoint);
                //docker.update();
            }
        }
    },
    
	addShapeToParent:function addShapeToParent(moveShapes, parents) {
        // For every Shape, add this and reset the position        
		for(var i=0; i < moveShapes.length ;i++){
			var currentShape = moveShapes[i].shape;
            var currentParent = parents[i];
			if((currentShape instanceof ORYX.Core.Node) && (currentShape.parent !== parents[i])) {
			    // Calc the new position
			    var unul = parents[i].absoluteXY();
			    var csul = currentShape.absoluteXY();
			    var x = csul.x - unul.x;
			    var y = csul.y - unul.y;

			    // Add the shape to the new contained shape
			    parents[i].add(currentShape);
			    // Add all attached shapes as well
			    currentShape.getOutgoingShapes((function(shape) {
				    if(shape instanceof ORYX.Core.Node && !moveShapes.member(shape)) {
					    parents[i].add(shape);
				    }
			    }).bind(this));

			    // Set the new position
			    if(currentShape.dockers.length == 1){
				    var b = currentShape.bounds;
				    x += b.width()/2;y += b.height()/2
				    currentShape.dockers.first().bounds.centerMoveTo(x, y);
			    } else {
				    currentShape.bounds.moveTo(x, y);
			    }		
                
            } 
        }
    },
    selectCurrentShapes: function selectCurrentShapes() {
        var canvas = this.facade.getCanvas();
        var getShape = function getShape(resourceId) {
            var shape = canvas.getChildShapeByResourceId(resourceId);
            return shape;
        };
        var getDocker = function getDocker(shape, dockerId) {
            for (var i = 0; i < shape.dockers.length; i++) {
                if (shape.dockers[i].id == dockerId) {
                    docker = shape.dockers[i];                
                }
            }
        };
        if (this.isLocal()) {
            //remove dead shapes from selection
            var newSelection = [];
            for (var i = 0; i < this.selectedShapes.length; i++) {
                var currentShape = this.selectedShapes[i];
                if (currentShape instanceof ORYX.Core.Node || currentShape instanceof ORYX.Core.Edge) {
                    var currentShapeOnCanvas = getShape(currentShape.resourceId);
                    if (typeof currentShapeOnCanvas !== "undefined") {
                        newSelection.push(this.selectedShapes[i]);
                    }
                } else if (currentShape instanceof ORYX.Core.Controls.Docker) {
                    var parentShapeOnCanvas = getShape(currentShape.parent.resourceId);
                    if (typeof parentShapeOnCanvas === "undefined") {
                        continue;
                    } else {
                        var dockerOnCanvas = getDocker(parentShapeOnCanvas, currentShape.id);
                        if (typeof dockerOnCanvas !== "undefined") {
                            newSelection.push(this.selectedShapes[i]);
                        }
                    }
                }
            }
            this.facade.setSelection(newSelection);  
        }
	}    
});

ORYX.Core.Commands["DragDropResize.UndockEdgeCommand"] = ORYX.Core.AbstractCommand.extend({
    construct: function construct(moveShapes, facade) {
        arguments.callee.$.construct.call(this, facade);
        this.dockers = moveShapes.collect(function(shape){ return shape instanceof ORYX.Core.Controls.Docker ? {docker:shape, dockedShape:shape.getDockedShape(), refPoint:shape.referencePoint} : undefined }).compact();
    },

    getCommandData: function getCommandData() {
        var dockerParents = this.dockers.map(function (docker) {
            return docker.parent;
        }.bind(this));
        var getId = function getId(docker) {
            return docker.id;
        };
        var getResourceId = function getResourceId(shape) {
            return shape.resourceId;
        };  
        var cmd = {
            "dockerIds": this.dockers.map(getId),
            "dockerParentsResourceIds": dockerParents.map(getResourceId)
        };
        return cmd;
    },
    
    createFromCommandData: function createFromCommandData(facade, commandObject) {
        var getShape = function getShape(resourceId) {
            var shape = facade.getCanvas().getChildShapeByResourceId(resourceId);
            return shape;
        };
        var getDocker = function getDocker(shape, dockerId) {
            for (var i = 0; i < shape.dockers.length; i++) {
                if (shape.dockers[i].id == dockerId) {
                    docker = shape.dockers[i];                
                }
            }
        };

        var moveShapes = [];
        for (var i = 0; i < commandObject.dockerIds; i++) {
            var shape = getShape(dockerParentsResourceIds[i]);
            moveShapes.push(getDocker(shape, dockerIds[i]));
        }        
        return new ORYX.Core.Commands["DragDropResize.UndockEdgeCommand"](moveShapes, facade);
    },
    
    getCommandName: function getCommandName() {
        return "DragDropResize.UndockEdgeCommand";
    },
    
    getAffectedShapes: function getAffectedShapes() {
        //only DockerObjects should be affected
        return [];
    },            
    execute: function execute() {
        this.dockers.each(function(el){
            el.docker.setDockedShape(undefined);
        })
    },
    rollback: function execute() {
        this.dockers.each(function(el){
        el.docker.setDockedShape(el.dockedShape);
        el.docker.setReferencePoint(el.refPoint);
        //el.docker.update();
        })
    }
});




/**
  * Implements a command class for the Resize Command.
  */
ORYX.Core.Commands["DragDropResize.ResizeCommand"] = ORYX.Core.AbstractCommand.extend({
    construct: function construct(shape, newBounds, oldBounds, facade, orientation) {
        arguments.callee.$.construct.call(this, facade);
        this.orientation = orientation;
        this.shape = shape;
        this.newBounds = newBounds;
        this.oldBounds = oldBounds;
    },
    
    getCommandData: function getCommandData() {
        var cmd = {
            "shapeId": this.shape.resourceId,
            "newBounds": {
                "width": this.newBounds.b.x - this.newBounds.a.x,
                "height": this.newBounds.b.y - this.newBounds.a.y
            },
            "oldBounds": {
                "a": this.oldBounds.upperLeft(),
                "b": this.oldBounds.lowerRight()
            },
            "orientation": this.orientation
        };
        return cmd;
    },
    
    createFromCommandData: function createFromCommandData(facade, commandObject) {
        var shape = facade.getCanvas().getChildShapeByResourceId(commandObject.shapeId);
        // if shape is undefined (i.e. has been deleted) we cannot instantiate the command
        if (typeof shape === 'undefined') {
            return undefined;
        }
        var newBoundsObj = shape.bounds.clone();
        newBoundsObj.resize(commandObject.orientation, commandObject.newBounds);
        var oldBoundsObj = shape.absoluteBounds().clone();
        oldBoundsObj.set(commandObject.oldBounds);
        return new ORYX.Core.Commands["DragDropResize.ResizeCommand"](shape, newBoundsObj, oldBoundsObj, facade);
    },
    
    getCommandName: function getCommandName() {
        return "DragDropResize.ResizeCommand";
    },
    
    getDisplayName: function getDisplayName() {
        return "Shape resized";
    },
    
    getAffectedShapes: function getAffectedShapes() {
        return [this.shape];
    },
    
    execute: function execute() {
        this.shape.bounds.set(this.newBounds.a, this.newBounds.b);
        this.update(this.getOffset(this.oldBounds, this.newBounds));
    },
    
    rollback: function rollback(){
        this.shape.bounds.set(this.oldBounds.a, this.oldBounds.b);
        this.update(this.getOffset(this.newBounds, this.oldBounds))
    },
    
    getOffset: function getOffset(b1, b2){
        return {
            x: b2.a.x - b1.a.x,
            y: b2.a.y - b1.a.y,
            xs: b2.width() / b1.width(),
            ys: b2.height() / b1.height()
        }
    },
    
    update: function update(offset) {
        this.shape.getLabels().each(function(label) {
            label.changed();
        });
        var allEdges = [];
        allEdges.concat(this.shape.getIncomingShapes());
        allEdges.concat(this.shape.getOutgoingShapes());
        // Remove all edges which are included in the selection from the list
        allEdges.findAll(function(r){ return r instanceof ORYX.Core.Edge }.bind(this));
        // Layout all outgoing/incoming edges
        /*this.facade.raiseEvent({
            type: ORYX.CONFIG.EVENT_LAYOUT_EDGES,
            node: this.shape,
            edges: allEdges,
            offset: offset
        });*/

        this.facade.getCanvas().update();
        if (this.isLocal()) {
            this.facade.setSelection([this.shape]);
        }
        this.facade.updateSelection(this.isLocal());
    }
});
