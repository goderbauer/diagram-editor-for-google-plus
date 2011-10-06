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

ORYX.Core.Commands["DragDocker.DragDockerCommand"] = ORYX.Core.AbstractCommand.extend({
	construct: function construct(docker, newPos, oldPos, newDockedShape, oldDockedShape, facade){
		// call construct method of parent
        arguments.callee.$.construct.call(this, facade);
        
        this.docker 		= docker;
		this.index			= docker.parent.dockers.indexOf(docker);
		this.newPosition	= newPos;
        this.oldPosition    = oldPos;
		this.newDockedShape = newDockedShape;
        this.oldDockedShape	= oldDockedShape;
		this.facade			= facade;
		this.index			= docker.parent.dockers.indexOf(docker);
		this.shape			= docker.parent;
		
	},		
    
    getAffectedShapes: function getAffectedShapes() {
        return [this.shape];
    },
    
    getCommandName: function getCommandName() {
        return "DragDocker.DragDockerCommand";
    },
    
    getDisplayName: function getDisplayName() {
        return "Docker moved";
    },
    
	getCommandData: function getCommandData() {
		var getId = function(shape) { 
			if (typeof shape !== "undefined") {
				return shape.resourceId
			}				
		};
		var commandData = {
			"dockerId": this.docker.id,
			"index": this.index,
			"newPosition": this.newPosition,
            "oldPosition": this.oldPosition,			
			"newDockedShapeId": getId(this.newDockedShape),
            "oldDockedShapeId": getId(this.oldDockedShape),
			"shapeId": getId(this.shape)
		};
		return commandData;
	},
    
	createFromCommandData: function createFromCommandData(facade, commandData) {
		var canvas = facade.getCanvas();
		var getShape = canvas.getChildShapeByResourceId.bind(canvas);
		var newDockedShape = getShape(commandData.newDockedShapeId);
        if (typeof commandData.newDockedShapeId !== 'undefined' && typeof newDockedShape === 'undefined') {
            // Trying to dock to a shape that doesn't exist anymore.
            return undefined;
        }        
		var oldDockedShape = getShape(commandData.oldDockedShapeId);
		var shape = getShape(commandData.shapeId);
        if (typeof shape === 'undefined') {
            // Trying to move a docker of a shape that doesn't exist anymore.
            return undefined;
        }        
		var docker;
		for (var i = 0; i < shape.dockers.length; i++) {
			if (shape.dockers[i].id == commandData.dockerId) {
				docker = shape.dockers[i];                
			}
		}
		return new ORYX.Core.Commands["DragDocker.DragDockerCommand"](docker, commandData.newPosition, commandData.oldPosition, newDockedShape, oldDockedShape, facade);
	},
    
	execute: function execute(){
        if (typeof this.docker !== "undefined") {
		    if (!this.docker.parent){
			    this.docker = this.shape.dockers[this.index];
		    }
		    this.dock( this.newDockedShape, this.newPosition );
		    // TODO locally deleting dockers might create inconsistent states across clients
		    //this.removedDockers = this.shape.removeUnusedDockers();
		    this.facade.updateSelection(this.isLocal());
        }
	},
    
	rollback: function rollback(){
        if (typeof this.docker !== "undefined") {
		    this.dock( this.oldDockedShape, this.oldPosition );
		    (this.removedDockers||$H({})).each(function(d){
			    this.shape.add(d.value, Number(d.key));
			    this.shape._update(true);
		    }.bind(this))
		    this.facade.updateSelection(this.isLocal());
        }
	},
    
	dock: function dock(toDockShape, relativePosition){
        var relativePos = relativePosition;
        if (typeof toDockShape !== "undefined") {
            /* if docker should be attached to a shape, calculate absolute position, otherwise relativePosition is relative to canvas, i.e. absolute
             values are expected to be between 0 and 1, if faulty values are found, they are set manually - with x = 0.5 and y = 0.5, shape will be docked at center*/
            var absolutePosition = this.facade.getCanvas().node.ownerSVGElement.createSVGPoint();
            if ((0 > relativePos.x) || (relativePos.x > 1) || (0 > relativePos.y) || (relativePos.y > 1)) {
                relativePos.x = 0.5;
                relativePos.y = 0.5;
            } 
            absolutePosition.x = Math.abs(toDockShape.absoluteBounds().lowerRight().x - relativePos.x * toDockShape.bounds.width());
            absolutePosition.y = Math.abs(toDockShape.absoluteBounds().lowerRight().y - relativePos.y * toDockShape.bounds.height());
        } else {
            var absolutePosition = relativePosition;
        }
        //it seems that for docker to be moved, the dockedShape need to be cleared first
        this.docker.setDockedShape(undefined);	
	    //this.docker.setReferencePoint(absolutePosition);			
        this.docker.bounds.centerMoveTo(absolutePosition);
	    this.docker.setDockedShape(toDockShape);	   
	    this.docker.update();	
		this.docker.parent._update();
		this.facade.getCanvas().update();					
	}
});
	
ORYX.Plugins.DragDocker = Clazz.extend({

	/**
	 *	Constructor
	 *	@param {Object} Facade: The Facade of the Editor
	 */
	construct: function(facade) {
		this.facade = facade;
		
		// Set the valid and invalid color
		this.VALIDCOLOR 	= ORYX.CONFIG.SELECTION_VALID_COLOR;
		this.INVALIDCOLOR 	= ORYX.CONFIG.SELECTION_INVALID_COLOR;
		
		// Define Variables 
		this.shapeSelection = undefined;
		this.docker 		= undefined;
		this.dockerParent   = undefined;
		this.dockerSource 	= undefined;
		this.dockerTarget 	= undefined;
		this.lastUIObj 		= undefined;
		this.isStartDocker 	= undefined;
		this.isEndDocker 	= undefined;
		this.undockTreshold	= 10;
		this.initialDockerPosition = undefined;
		this.outerDockerNotMoved = undefined;
		this.isValid 		= false;
		
		// For the Drag and Drop
		// Register on MouseDown-Event on a Docker
		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEDOWN, this.handleMouseDown.bind(this));
        this.facade.registerOnEvent(ORYX.CONFIG.EVENT_DOCKERDRAG, this.handleDockerDrag.bind(this));
		
		// Register on over/out to show / hide a docker
		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEOVER, this.handleMouseOver.bind(this));
		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEOUT, this.handleMouseOut.bind(this));		
		
		
	},
	
    /**
     * DockerDrag Handler
     * delegates the uiEvent of the drag event to the mouseDown function
     */
    handleDockerDrag: function handleDockerDrag(event, uiObj) {
        this.handleMouseDown(event.uiEvent, uiObj);
    },
    
	/**
	 * MouseOut Handler
	 *
	 */
	handleMouseOut: function(event, uiObj) {
		// If there is a Docker, hide this
		if(!this.docker && uiObj instanceof ORYX.Core.Controls.Docker) {
			uiObj.hide()	
		} else if(!this.docker && uiObj instanceof ORYX.Core.Edge) {
			uiObj.dockers.each(function(docker){
				docker.hide();
			})
		}
	},

	/**
	 * MouseOver Handler
	 *
	 */
	handleMouseOver: function(event, uiObj) {
		// If there is a Docker, show this		
		if(!this.docker && uiObj instanceof ORYX.Core.Controls.Docker) {
			uiObj.show()	
		} else if(!this.docker && uiObj instanceof ORYX.Core.Edge) {
			uiObj.dockers.each(function(docker){
				docker.show();
			})
		}
	},
	
	/**
	 * MouseDown Handler
	 *
	 */	
	handleMouseDown: function(event, uiObj) {
		// If there is a Docker
		if(uiObj instanceof ORYX.Core.Controls.Docker && uiObj.isMovable) {
			
			/* Buffering shape selection and clear selection*/
			this.shapeSelection = this.facade.getSelection();
			this.facade.setSelection();
			
			this.docker = uiObj;
			this.initialDockerPosition = this.docker.bounds.center();
			this.outerDockerNotMoved = false;			
			this.dockerParent = uiObj.parent;
			
			// Define command arguments
			this._commandArg = {docker:uiObj, dockedShape:uiObj.getDockedShape(), refPoint:uiObj.referencePoint || uiObj.bounds.center()};

			// Show the Docker
			this.docker.show();
			
			// If the Dockers Parent is an Edge, 
			//  and the Docker is either the first or last Docker of the Edge
			if(uiObj.parent instanceof ORYX.Core.Edge && 
			   	(uiObj.parent.dockers.first() == uiObj || uiObj.parent.dockers.last() == uiObj)) {
				
				// Get the Edge Source or Target
				if(uiObj.parent.dockers.first() == uiObj && uiObj.parent.dockers.last().getDockedShape()) {
					this.dockerTarget = uiObj.parent.dockers.last().getDockedShape()
				} else if(uiObj.parent.dockers.last() == uiObj && uiObj.parent.dockers.first().getDockedShape()) {
					this.dockerSource = uiObj.parent.dockers.first().getDockedShape()
				}
				
			} else {
				// If there parent is not an Edge, undefined the Source and Target
				this.dockerSource = undefined;
				this.dockerTarget = undefined;				
			}
		
			this.isStartDocker = this.docker.parent.dockers.first() === this.docker
			this.isEndDocker = this.docker.parent.dockers.last() === this.docker
					
			// add to canvas while dragging
			this.facade.getCanvas().add(this.docker.parent);
			
			// Hide all Labels from Docker
			this.docker.parent.getLabels().each(function(label) {
				label.hide();
			});
			
			// Undocked the Docker from current Shape
			if ((!this.isStartDocker && !this.isEndDocker) || !this.docker.isDocked()) {
				
				this.docker.setDockedShape(undefined)
				// Set the Docker to the center of the mouse pointer
				var evPos = this.facade.eventCoordinates(event);
				this.docker.bounds.centerMoveTo(evPos);
				//this.docker.update()
				//this.facade.getCanvas().update();
				this.dockerParent._update();
			} else {
				this.outerDockerNotMoved = true;
			}
			
			var option = {movedCallback: this.dockerMoved.bind(this), upCallback: this.dockerMovedFinished.bind(this)}
				
			// Enable the Docker for Drag'n'Drop, give the mouseMove and mouseUp-Callback with
			ORYX.Core.UIEnableDrag(event, uiObj, option);
		}
	},
	
	/**
	 * Docker MouseMove Handler
	 *
	 */
	dockerMoved: function(event) {
		this.outerDockerNotMoved = false;
		var snapToMagnet = undefined;
		
		if (this.docker.parent) {
			if (this.isStartDocker || this.isEndDocker) {
			
				// Get the EventPosition and all Shapes on these point
				var evPos = this.facade.eventCoordinates(event);
				
				if(this.docker.isDocked()) {
					/* Only consider start/end dockers if they are moved over a treshold */
					var distanceDockerPointer = 
						ORYX.Core.Math.getDistancePointToPoint(evPos, this.initialDockerPosition);
					if(distanceDockerPointer < this.undockTreshold) {
						this.outerDockerNotMoved = true;
						return;
					}
					
					/* Undock the docker */
					this.docker.setDockedShape(undefined)
					// Set the Docker to the center of the mouse pointer
					//this.docker.bounds.centerMoveTo(evPos);
					this.dockerParent._update();
				}
				
				var shapes = this.facade.getCanvas().getAbstractShapesAtPosition(evPos);
				
				// Get the top level Shape on these, but not the same as Dockers parent
				var uiObj = shapes.pop();
				if (this.docker.parent === uiObj) {
					uiObj = shapes.pop();
				}
				
				
				
				// If the top level Shape the same as the last Shape, then return
				if (this.lastUIObj == uiObj) {
				//return;
				
				// If the top level uiObj instance of Shape and this isn't the parent of the docker 
				}
				else 
					if (uiObj instanceof ORYX.Core.Shape) {
					
						// Get the StencilSet of the Edge
						var sset = this.docker.parent.getStencil().stencilSet();
						
						// Ask by the StencilSet if the source, the edge and the target valid connections.
						if (this.docker.parent instanceof ORYX.Core.Edge) {
							
							var highestParent = this.getHighestParentBeforeCanvas(uiObj);
							/* Ensure that the shape to dock is not a child shape 
							 * of the same edge.
							 */
							if(highestParent instanceof ORYX.Core.Edge 
									&& this.docker.parent === highestParent) {
								this.isValid = false;
								this.dockerParent._update();
								return;
							}
							this.isValid = false;
							var curObj = uiObj, orgObj = uiObj;
							while(!this.isValid && curObj && !(curObj instanceof ORYX.Core.Canvas)){
								uiObj = curObj;
								this.isValid = this.facade.getRules().canConnect({
											sourceShape: this.dockerSource ? // Is there a docked source 
															this.dockerSource : // than set this
															(this.isStartDocker ? // if not and if the Docker is the start docker
																uiObj : // take the last uiObj
																undefined), // if not set it to undefined;
											edgeShape: this.docker.parent,
											targetShape: this.dockerTarget ? // Is there a docked target 
											this.dockerTarget : // than set this
														(this.isEndDocker ? // if not and if the Docker is not the start docker
															uiObj : // take the last uiObj
															undefined) // if not set it to undefined;
										});
								curObj = curObj.parent;
							}
							
							// Reset uiObj if no 
							// valid parent is found
							if (!this.isValid){
								uiObj = orgObj;
							}

						}
						else {
							this.isValid = this.facade.getRules().canConnect({
								sourceShape: uiObj,
								edgeShape: this.docker.parent,
								targetShape: this.docker.parent
							});
						}
						
						// If there is a lastUIObj, hide the magnets
						if (this.lastUIObj) {
							this.hideMagnets(this.lastUIObj)
						}
						
						// If there is a valid connection, show the magnets
						if (this.isValid) {
							this.showMagnets(uiObj)
						}
						
						// Set the Highlight Rectangle by these value
						this.showHighlight(uiObj, this.isValid ? this.VALIDCOLOR : this.INVALIDCOLOR);
						
						// Buffer the current Shape
						this.lastUIObj = uiObj;
					}
					else {
						// If there is no top level Shape, then hide the highligting of the last Shape
						this.hideHighlight();
						this.lastUIObj ? this.hideMagnets(this.lastUIObj) : null;
						this.lastUIObj = undefined;
						this.isValid = false;
					}
				
				// Snap to the nearest Magnet
				if (this.lastUIObj && this.isValid && !(event.shiftKey || event.ctrlKey)) {
					snapToMagnet = this.lastUIObj.magnets.find(function(magnet){
						return magnet.absoluteBounds().isIncluded(evPos)
					});
					
					if (snapToMagnet) {
						this.docker.bounds.centerMoveTo(snapToMagnet.absoluteCenterXY());
					//this.docker.update()
					}
				}
			}
		}
		// Snap to on the nearest Docker of the same parent
		if(!(event.shiftKey || event.ctrlKey) && !snapToMagnet) {
			var minOffset = ORYX.CONFIG.DOCKER_SNAP_OFFSET;
			var nearestX = minOffset + 1
			var nearestY = minOffset + 1
			
			var dockerCenter = this.docker.bounds.center();
			
			if (this.docker.parent) {
				
				this.docker.parent.dockers.each((function(docker){
					if (this.docker == docker) {
						return
					};
					
					var center = docker.referencePoint ? docker.getAbsoluteReferencePoint() : docker.bounds.center();
					
					nearestX = Math.abs(nearestX) > Math.abs(center.x - dockerCenter.x) ? center.x - dockerCenter.x : nearestX;
					nearestY = Math.abs(nearestY) > Math.abs(center.y - dockerCenter.y) ? center.y - dockerCenter.y : nearestY;
					
					
				}).bind(this));
				
				if (Math.abs(nearestX) < minOffset || Math.abs(nearestY) < minOffset) {
					nearestX = Math.abs(nearestX) < minOffset ? nearestX : 0;
					nearestY = Math.abs(nearestY) < minOffset ? nearestY : 0;
					
					this.docker.bounds.centerMoveTo(dockerCenter.x + nearestX, dockerCenter.y + nearestY);
					//this.docker.update()
				} else {
					
					
					
					var previous = this.docker.parent.dockers[Math.max(this.docker.parent.dockers.indexOf(this.docker)-1, 0)]
					var next = this.docker.parent.dockers[Math.min(this.docker.parent.dockers.indexOf(this.docker)+1, this.docker.parent.dockers.length-1)]
					
					if (previous && next && previous !== this.docker && next !== this.docker){
						var cp = previous.bounds.center();
						var cn = next.bounds.center();
						var cd = this.docker.bounds.center();
						
						// Checks if the point is on the line between previous and next
						if (ORYX.Core.Math.isPointInLine(cd.x, cd.y, cp.x, cp.y, cn.x, cn.y, 10)) {
							// Get the rise
							var raise = (Number(cn.y)-Number(cp.y))/(Number(cn.x)-Number(cp.x));
							// Calculate the intersection point
							var intersecX = ((cp.y-(cp.x*raise))-(cd.y-(cd.x*(-Math.pow(raise,-1)))))/((-Math.pow(raise,-1))-raise);
							var intersecY = (cp.y-(cp.x*raise))+(raise*intersecX);
							
							if(isNaN(intersecX) || isNaN(intersecY)) {return;}
							
							this.docker.bounds.centerMoveTo(intersecX, intersecY);
						}
					}
					
				}
			}
		}
		//this.facade.getCanvas().update();
		this.dockerParent._update();
	},

	/**
	 * Docker MouseUp Handler
	 *
	 */
	dockerMovedFinished: function(event) {
        // check if parent edge still exists on canvas, skip if not 
        var currentShape = this.facade.getCanvas().getChildShapeByResourceId(this.dockerParent.resourceId);
        if (typeof currentShape !== "undefined") {     
		    /* Reset to buffered shape selection */
		    this.facade.setSelection(this.shapeSelection);
		
		    // Hide the border
		    this.hideHighlight();
		
		    // Show all Labels from Docker
		    this.dockerParent.getLabels().each(function(label){
			    label.show();
			    //label.update();
		    });
	
		    // If there is a last top level Shape
		    if(this.lastUIObj && (this.isStartDocker || this.isEndDocker)){				
			    // If there is a valid connection, the set as a docked Shape to them
			    if(this.isValid) {

				    this.docker.setDockedShape(this.lastUIObj);	
				    this.facade.raiseEvent({
					    type 	:ORYX.CONFIG.EVENT_DRAGDOCKER_DOCKED, 
					    docker	: this.docker,
					    parent	: this.docker.parent,
					    target	: this.lastUIObj
				    });
			    }
			
			    this.hideMagnets(this.lastUIObj)
		    }
		
		    // Hide the Docker
		    this.docker.hide();
		
		    if(this.outerDockerNotMoved) {
			    // Get the EventPosition and all Shapes on these point
			    var evPos = this.facade.eventCoordinates(event);
			    var shapes = this.facade.getCanvas().getAbstractShapesAtPosition(evPos);
			
			    /* Remove edges from selection */
			    var shapeWithoutEdges = shapes.findAll(function(node) {
				    return node instanceof ORYX.Core.Node;
			    });
			    shapes = shapeWithoutEdges.length ? shapeWithoutEdges : shapes;
			    this.facade.setSelection(shapes);
		    } else {
			    if (this.docker.parent){
                    var oldDockedShape = this._commandArg.dockedShape;
                    var newPositionAbsolute = this.docker.bounds.center();
                    var oldPositionAbsolute = this._commandArg.refPoint;
                    var newDockedShape = this.docker.getDockedShape();               
                    if (typeof newDockedShape !== "undefined") {
	                    var newPositionRelative = this.facade.getCanvas().node.ownerSVGElement.createSVGPoint();
	                    newPositionRelative.x = Math.abs((newDockedShape.bounds.lowerRight().x - newPositionAbsolute.x) / newDockedShape.bounds.width());
	                    newPositionRelative.y = Math.abs((newDockedShape.bounds.lowerRight().y - newPositionAbsolute.y) / newDockedShape.bounds.height());
                    } else {
                        // if newDockedShape is not defined, i.e. it is the canvas, use absolutePositions, because positions relative to the canvas are absolute
                        newPositionRelative = newPositionAbsolute;
                    }

                    if (typeof oldDockedShape !== "undefined") {
                        var oldPositionRelative = this.facade.getCanvas().node.ownerSVGElement.createSVGPoint();
                        oldPositionRelative.x = Math.abs((oldDockedShape.bounds.lowerRight().x - oldPositionAbsolute.x) / oldDockedShape.bounds.width());
                        oldPositionRelative.y = Math.abs((oldDockedShape.bounds.lowerRight().y - oldPositionAbsolute.y) / oldDockedShape.bounds.height());
                    } else {
                        // if oldDockedShape is not defined, i.e. it is the canvas, use absolutePositions, because positions relative to the canvas are absolute
                        oldPositionRelative = oldPositionAbsolute;
                    }

			        // instanciate the dockCommand
			        var command = new ORYX.Core.Commands["DragDocker.DragDockerCommand"](this.docker, newPositionRelative, oldPositionRelative, newDockedShape, oldDockedShape, this.facade);
			        this.facade.executeCommands([command]);    
	    		}
            }
		}	

		// Update all Shapes
		//this.facade.updateSelection();
			
		// Undefined all variables
		this.docker 		= undefined;
		this.dockerParent   = undefined;
		this.dockerSource 	= undefined;
		this.dockerTarget 	= undefined;	
		this.lastUIObj 		= undefined;		
	},
	
	/**
	 * Hide the highlighting
	 */
	hideHighlight: function() {
		this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE, highlightId:'validDockedShape'});
	},

	/**
	 * Show the highlighting
	 *
	 */
	showHighlight: function(uiObj, color) {
		
		this.facade.raiseEvent({
										type:		ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW, 
										highlightId:'validDockedShape',
										elements:	[uiObj],
										color:		color
									});
	},
	
	showMagnets: function(uiObj){
		uiObj.magnets.each(function(magnet) {
			magnet.show();
		});
	},
	
	hideMagnets: function(uiObj){
		uiObj.magnets.each(function(magnet) {
			magnet.hide();
		});
	},
	
	getHighestParentBeforeCanvas: function(shape) {
		if(!(shape instanceof ORYX.Core.Shape)) {return undefined;}
		
		var parent = shape.parent;
		while(parent && !(parent.parent instanceof ORYX.Core.Canvas)) {
			parent = parent.parent;
		}	
		
		return parent;		
	}	

});

