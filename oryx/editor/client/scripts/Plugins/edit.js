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

ORYX.Plugins.Edit = Clazz.extend({
    
    construct: function(facade){
    
        this.facade = facade;
        this.clipboard = new ORYX.Plugins.Edit.ClipBoard(facade);
        this.shapesToDelete = [];

        this.facade.registerOnEvent(ORYX.CONFIG.EVENT_DRAGDROP_END, this.handleDragEnd.bind(this));
        this.facade.registerOnEvent(ORYX.CONFIG.EVENT_SHAPESTODELETE, this.handleShapesToDelete.bind(this));       

        
        this.facade.offer({
         name: ORYX.I18N.Edit.cut,
         description: ORYX.I18N.Edit.cutDesc,
         iconCls: 'pw-toolbar-button pw-toolbar-cut',
		 keyCodes: [{
				metaKeys: [ORYX.CONFIG.META_KEY_META_CTRL],
				keyCode: 88,
				keyAction: ORYX.CONFIG.KEY_ACTION_DOWN
			}
		 ],
         functionality: this.callEdit.bind(this, this.editCut),
         isEnabled: function() { return !this.facade.isReadOnlyMode(); }.bind(this),
         group: ORYX.I18N.Edit.group,
         index: 1,
         minShape: 1,
         visibleInViewMode: false
         });
         
        this.facade.offer({
         name: ORYX.I18N.Edit.copy,
         description: ORYX.I18N.Edit.copyDesc,
         iconCls: 'pw-toolbar-button pw-toolbar-copy',
		 keyCodes: [{
				metaKeys: [ORYX.CONFIG.META_KEY_META_CTRL],
				keyCode: 67,
				keyAction: ORYX.CONFIG.KEY_ACTION_DOWN
			}
		 ],
         functionality: this.callEdit.bind(this, this.editCopy, [true, false]),
         isEnabled: function() { return !this.facade.isReadOnlyMode(); }.bind(this),
         group: ORYX.I18N.Edit.group,
         index: 2,
         minShape: 1,
         visibleInViewMode: false
         });
         
        this.facade.offer({
         name: ORYX.I18N.Edit.paste,
         description: ORYX.I18N.Edit.pasteDesc,
         iconCls: 'pw-toolbar-button pw-toolbar-paste',
		 keyCodes: [{
				metaKeys: [ORYX.CONFIG.META_KEY_META_CTRL],
				keyCode: 86,
				keyAction: ORYX.CONFIG.KEY_ACTION_DOWN
			}
		 ],
         functionality: this.callEdit.bind(this, this.editPaste),
         isEnabled: function() { return !this.facade.isReadOnlyMode() && this.clipboard.isOccupied; }.bind(this),
         group: ORYX.I18N.Edit.group,
         index: 3,
         minShape: 0,
         maxShape: 0,
         visibleInViewMode: false
        });
         
        this.facade.offer({
            name: ORYX.I18N.Edit.del,
            description: ORYX.I18N.Edit.delDesc,
            iconCls: 'pw-toolbar-button pw-toolbar-delete',
			keyCodes: [{
					metaKeys: [ORYX.CONFIG.META_KEY_META_CTRL],
					keyCode: 8,
					keyAction: ORYX.CONFIG.KEY_ACTION_DOWN
				},
				{	
					keyCode: 46,
					keyAction: ORYX.CONFIG.KEY_ACTION_DOWN
				}
			],
            functionality: this.callEdit.bind(this, this.editDelete),
            group: ORYX.I18N.Edit.group,
            index: 4,
            minShape: 1,
            visibleInViewMode: false
        });
    },
	
	callEdit: function(fn, args){
		window.setTimeout(function(){
			fn.apply(this, (args instanceof Array ? args : []));
		}.bind(this), 1);
	},

    handleShapesToDelete: function handleShapesToDelete(event) {
        this.shapesToDelete = this.shapesToDelete.concat(event.deletedShapes);
    },

    handleDragEnd: function handleDragEnd(event) {
        //shapes whose selection were not updated because they were dragged are stored in shapesToDelete
        //delete shapes from shapesToDelete from selection/canvas after dragging is finished
        var selectedShapes = this.facade.getSelection();
        for (var i = 0; i < this.shapesToDelete.length; i++) {
            this.facade.deleteShape(this.shapesToDelete[i]);
            selectedShapes = selectedShapes.without(this.shapesToDelete[i]);
        }
        this.shapesToDelete = [];
        this.facade.setSelection(selectedShapes);
        this.facade.getCanvas().update();
        this.facade.updateSelection();
    },
	
	/**
	 * Handles the mouse down event and starts the copy-move-paste action, if
	 * control or meta key is pressed.
	 */
	handleMouseDown: function(event) {
		if(this._controlPressed) {
			this._controlPressed = false;
			this.editCopy();
			this.editPaste();
			event.forceExecution = true;
			this.facade.raiseEvent(event, this.clipboard.shapesAsJson);
			
		}
	},

    /**
     * Returns a list of shapes which should be considered while copying.
     * Besides the shapes of given ones, edges and attached nodes are added to the result set.
     * If one of the given shape is a child of another given shape, it is not put into the result. 
     */
    getAllShapesToConsider: function(shapes){
        var shapesToConsider = []; // only top-level shapes
        var childShapesToConsider = []; // all child shapes of top-level shapes
        
        shapes.each(function(shape){
            //Throw away these shapes which have a parent in given shapes
            isChildShapeOfAnother = shapes.any(function(s2){
                return s2.hasChildShape(shape);
            });
            if(isChildShapeOfAnother) return;
            
            // This shape should be considered
            shapesToConsider.push(shape);
            // Consider attached nodes (e.g. intermediate events)
            if (shape instanceof ORYX.Core.Node) {
				var attached = shape.getOutgoingNodes();
				attached = attached.findAll(function(a){ return !shapes.include(a) });
                shapesToConsider = shapesToConsider.concat(attached);
            }
            
            childShapesToConsider = childShapesToConsider.concat(shape.getChildShapes(true));
        }.bind(this));
        
        // All edges between considered child shapes should be considered
        // Look for these edges having incoming and outgoing in childShapesToConsider
        var edgesToConsider = this.facade.getCanvas().getChildEdges().select(function(edge){
            // Ignore if already added
            if(shapesToConsider.include(edge)) return false;
            // Ignore if there are no docked shapes
            if(edge.getAllDockedShapes().size() === 0) return false; 
            // True if all docked shapes are in considered child shapes
            return edge.getAllDockedShapes().all(function(shape){
                // Remember: Edges can have other edges on outgoing, that is why edges must not be included in childShapesToConsider
                return shape instanceof ORYX.Core.Edge || childShapesToConsider.include(shape);
            });
        });
        shapesToConsider = shapesToConsider.concat(edgesToConsider);
        
        return shapesToConsider;
    },
    
    /**
     * Performs the cut operation by first copy-ing and then deleting the
     * current selection.
     */
    editCut: function(){
        //TODO document why this returns false.
        //TODO document what the magic boolean parameters are supposed to do.
        
        this.editCopy(false, true);
        this.editDelete(true);
        return false;
    },
    
    /**
     * Performs the copy operation.
     * @param {Object} will_not_update ??
     */
    editCopy: function( will_update, useNoOffset ){
        var selection = this.facade.getSelection();
        
        //if the selection is empty, do not remove the previously copied elements
        if(selection.length == 0) return;
        
        this.clipboard.refresh(selection, this.getAllShapesToConsider(selection), this.facade.getCanvas().getStencil().stencilSet().namespace(), useNoOffset);

        if( will_update ) this.facade.updateSelection(true);
    },
    
    /**
     * Performs the paste operation.
     */
    editPaste: function(){
        // Create a new canvas with childShapes 
		//and stencilset namespace to be JSON Import conform
		var canvas = {
            childShapes: this.clipboard.shapesAsJson,
			stencilset:{
				namespace:this.clipboard.SSnamespace
			}
        }
        // Apply json helper to iterate over json object
        Ext.apply(canvas, ORYX.Core.AbstractShape.JSONHelper);
        
        var childShapeResourceIds =  canvas.getChildShapes(true).pluck("resourceId");
        var outgoings = {};
        // Iterate over all shapes
        canvas.eachChild(function(shape, parent){
            // Throw away these references where referenced shape isn't copied
            shape.outgoing = shape.outgoing.select(function(out){
                return childShapeResourceIds.include(out.resourceId);
            });
			shape.outgoing.each(function(out){
				if (!outgoings[out.resourceId]){ outgoings[out.resourceId] = [] }
				outgoings[out.resourceId].push(shape)
			});
			
            return shape;
        }.bind(this), true, true);
        

        // Iterate over all shapes
        canvas.eachChild(function(shape, parent){
            
        	// Check if there has a valid target
            if(shape.target && !(childShapeResourceIds.include(shape.target.resourceId))){
                shape.target = undefined;
                shape.targetRemoved = true;
            }
    		
    		// Check if the first docker is removed
    		if(	shape.dockers && 
    			shape.dockers.length >= 1 && 
    			shape.dockers[0].getDocker &&
    			((shape.dockers[0].getDocker().getDockedShape() &&
    			!childShapeResourceIds.include(shape.dockers[0].getDocker().getDockedShape().resourceId)) || 
    			!shape.getShape().dockers[0].getDockedShape()&&!outgoings[shape.resourceId])) {
    				
    			shape.sourceRemoved = true;
    		}
			
            return shape;
        }.bind(this), true, true);

		
        // Iterate over top-level shapes
        canvas.eachChild(function(shape, parent){
            // All top-level shapes should get an offset in their bounds
            // Move the shape occording to COPY_MOVE_OFFSET
        	if (this.clipboard.useOffset) {
	            shape.bounds = {
	                lowerRight: {
	                    x: shape.bounds.lowerRight.x + ORYX.CONFIG.COPY_MOVE_OFFSET,
	                    y: shape.bounds.lowerRight.y + ORYX.CONFIG.COPY_MOVE_OFFSET
	                },
	                upperLeft: {
	                    x: shape.bounds.upperLeft.x + ORYX.CONFIG.COPY_MOVE_OFFSET,
	                    y: shape.bounds.upperLeft.y + ORYX.CONFIG.COPY_MOVE_OFFSET
	                }
	            };
        	}
            // Only apply offset to shapes with a target
            if (shape.dockers){
                shape.dockers = shape.dockers.map(function(docker, i){
                    // If shape had a target but the copied does not have anyone anymore,
                    // migrate the relative dockers to absolute ones.
                    if( (shape.targetRemoved === true && i == shape.dockers.length - 1&&docker.getDocker) ||
						(shape.sourceRemoved === true && i == 0&&docker.getDocker)){
                        var id = docker.id;
                        docker = docker.getDocker().bounds.center();
                        docker.id = id;
                    }

					// If it is the first docker and it has a docked shape, 
					// just return the coordinates
				   	if ((i == 0 && docker.getDocker instanceof Function && 
				   		shape.sourceRemoved !== true && (docker.getDocker().getDockedShape() || ((outgoings[shape.resourceId]||[]).length > 0 && (!(shape.getShape() instanceof ORYX.Core.Node) || outgoings[shape.resourceId][0].getShape() instanceof ORYX.Core.Node)))) || 
						(i == shape.dockers.length - 1 && docker.getDocker instanceof Function && 
						shape.targetRemoved !== true && (docker.getDocker().getDockedShape() || shape.target))){
							
						return {
                        	'x': docker.x, 
                        	'y': docker.y,
                        	'getDocker': docker.getDocker,
                            'id': docker.id
						}
					} else if (this.clipboard.useOffset) {
	                    return {
		                        'x': docker.x + ORYX.CONFIG.COPY_MOVE_OFFSET, 
		                        'y': docker.y + ORYX.CONFIG.COPY_MOVE_OFFSET,
	                        	'getDocker': docker.getDocker,
                                'id': docker.id
		                    };
				   	} else {
				   		return {
                        	'x': docker.x, 
                        	'y': docker.y,
                        	'getDocker': docker.getDocker,
                            'id': docker.id
						};
				   	}
                }.bind(this));

            } else if (shape.getShape() instanceof ORYX.Core.Node && shape.dockers && shape.dockers.length > 0 && (!shape.dockers.first().getDocker || shape.sourceRemoved === true || !(shape.dockers.first().getDocker().getDockedShape() || outgoings[shape.resourceId]))){
            	
            	shape.dockers = shape.dockers.map(function(docker, i){
            		
                    if((shape.sourceRemoved === true && i == 0&&docker.getDocker)){
                        var id = docker.id;
                    	docker = docker.getDocker().bounds.center();
                        docker.id = id;
                    }
                    
                    if (this.clipboard.useOffset) {
	            		return {
	                        'x': docker.x + ORYX.CONFIG.COPY_MOVE_OFFSET, 
	                        'y': docker.y + ORYX.CONFIG.COPY_MOVE_OFFSET,
	                    	'getDocker': docker.getDocker,
                            'id': docker.id
	                    };
                    } else {
	            		return {
	                        'x': docker.x, 
	                        'y': docker.y,
	                    	'getDocker': docker.getDocker,
                            'id': docker.id
	                    };
                    }
            	}.bind(this));
            }
            
            return shape;
        }.bind(this), false, true);

        this.clipboard.useOffset = true;
        this.facade.importJSON(canvas);
    },
    
    /**
     * Performs the delete operation. No more asking.
     */
    editDelete: function(){
        var selection = this.facade.getSelection();
        
        var clipboard = new ORYX.Plugins.Edit.ClipBoard();
        clipboard.refresh(selection, this.getAllShapesToConsider(selection));
        
        if (clipboard.shapesAsJson.length > 0) {       
            var command = new ORYX.Core.Commands["Edit.DeleteCommand"](clipboard , this.facade);                                       
            this.facade.executeCommands([command]);
        }
    }
}); 

ORYX.Plugins.Edit.ClipBoard = Clazz.extend({
    construct: function(facade){
        this.shapesAsJson = [];
        this.selection = [];
		this.SSnamespace="";
		this.useOffset=true;
    },
    
    isOccupied: function(){
        return this.shapesAsJson.length > 0;
    },

    refresh: function(selection, shapes, namespace, useNoOffset){
        this.selection = selection;
        this.SSnamespace=namespace;
        // Store outgoings, targets and parents to restore them later on
        this.outgoings = {};
        this.parents = {};
        this.targets = {};
        this.useOffset = useNoOffset !== true;
        
        this.shapesAsJson = shapes.map(function(shape){
            var s = shape.toJSON();
            s.parent = {resourceId : shape.getParentShape().resourceId};
            s.parentIndex = shape.getParentShape().getChildShapes().indexOf(shape)
            return s;
        });
    }
});

ORYX.Core.Commands["Edit.DeleteCommand"] = ORYX.Core.AbstractCommand.extend({
    construct: function construct(clipboard, facade) {
        arguments.callee.$.construct.call(this, facade);
        
        this.clipboard          = clipboard;
        this.shapesAsJson       = clipboard.shapesAsJson;

        var newShapesAsJson = [];
        //add type and namespace to shapesAsJsonEntries
        for (var i = 0; i < this.shapesAsJson.length; i++) {
            var shapeAsJson = this.shapesAsJson[i];
            var shape = this.facade.getCanvas().getChildShapeByResourceId(shapeAsJson.resourceId);
            if (typeof shape !== "undefined") {
                var stencil = shape.getStencil();
                shapeAsJson.type = stencil.type();
                shapeAsJson.namespace = stencil.namespace();
                newShapesAsJson.push(shapeAsJson);
            }
        }

        this.shapesAsJson = newShapesAsJson;

        // Store dockers of deleted shapes to restore connections
        this.dockers            = this.shapesAsJson.map(function(shapeAsJson){
            var shape = facade.getCanvas().getChildShapeByResourceId(shapeAsJson.resourceId);
            if (typeof shape !== "undefined") {

                var incomingDockers = shape.getIncomingShapes().map(function(s){return s.getDockers().last()})
                var outgoingDockers = shape.getOutgoingShapes().map(function(s){return s.getDockers().first()})
                var dockers = shape.getDockers().concat(incomingDockers, outgoingDockers).compact().map(function(docker) {
                    return {
                        object: docker,
                        referencePoint: docker.referencePoint,
                        dockedShape: docker.getDockedShape()
                    };
                });
                return dockers;
            } else {
                return [];
            }
        }).flatten();
    },          
    execute: function execute() {
        var deletedShapes = [];
        var selectedShapes = this.facade.getSelection();
        for (var i = 0; i < this.shapesAsJson.length; i++) {
            var shapeAsJson = this.shapesAsJson[i];
            // Delete shape
            var shape = this.facade.getCanvas().getChildShapeByResourceId(shapeAsJson.resourceId);
            if (typeof shape !== "undefined") {
                deletedShapes.push(shape);

                this.facade.raiseEvent(
                    {
                        "type": ORYX.CONFIG.EVENT_SHAPEDELETED, 
                        "shape": shape
                    }
                );
                this.facade.deleteShape(shape);
            } else {
                ORYX.Log.warn("Trying to delete deleted shape.");
            }
        }
        if (this.isLocal()) {
            this.facade.getCanvas().update();
            this.facade.setSelection([]);
        } else {
            var newSelectedShapes = selectedShapes;
            for (var i = 0; i < deletedShapes.length; i++) {
                newSelectedShapes = newSelectedShapes.without(deletedShapes[i]);
            }
            var isDragging = this.facade.isDragging();
            if (!isDragging) {
                this.facade.setSelection(newSelectedShapes);
            } else {
                //raise event, which assures, that selection and canvas will be updated after dragging is finished
                this.facade.raiseEvent(
                    {
                        "type": ORYX.CONFIG.EVENT_SHAPESTODELETE, 
                        "deletedShapes": deletedShapes
                    }
                );  	
            }
            this.facade.getCanvas().update();
            this.facade.updateSelection(this.isLocal());
        }        
    },
    rollback: function rollback(){
        var selectedShapes = [];
        for (var i = 0; i < this.shapesAsJson.length; i++) {
            var shapeAsJson = this.shapesAsJson[i];
            var shape = shapeAsJson.getShape();
            selectedShapes.push(shape);
            var parent = this.facade.getCanvas().getChildShapeByResourceId(shapeAsJson.parent.resourceId) || this.facade.getCanvas();
            parent.add(shape, shape.parentIndex);
        }
        
        //reconnect shapes
        this.dockers.each(function(d) {
            d.object.setDockedShape(d.dockedShape);
            d.object.setReferencePoint(d.referencePoint);
        }.bind(this));
        this.facade.getCanvas().update();	
        this.facade.updateSelection(this.isLocal());
    },
    
    getCommandData: function getCommandData() {

        var options = {
            shapes: this.shapesAsJson
        };
        
        return options;
    },
    
    createFromCommandData: function createFromCommandData(facade, commandData) {
        var clipboard = new ORYX.Plugins.Edit.ClipBoard(facade);
        var getShape = function getShape(resourceId) {
            var shape = facade.getCanvas().getChildShapeByResourceId(resourceId);
            return shape;
        } 
        
        clipboard.shapesAsJson = commandData.shapes;        
        // Checking if at least one shape that has to be deleted still exists
        var shapesExist = false;
        for (var i = 0; i < clipboard.shapesAsJson.length; i++) {
            var resourceId = clipboard.shapesAsJson[i].resourceId;
            if (typeof facade.getCanvas().getChildShapeByResourceId(resourceId) !== 'undefined') {
                shapesExist = true;
                break;
            }
        }
        if (!shapesExist) {
            return undefined;
        }
        
        clipboard.shapesAsJson.each(function injectGetShape(shapeAsJson) {
           shapeAsJson.template = shapeAsJson.properties;
           shapeAsJson.shapeOptions = { resourceId: shapeAsJson.resourceId };
           var shape = getShape(shapeAsJson.resourceId);
           shapeAsJson.getShape = function() { 
               return shape;
           };
        });
        return new ORYX.Core.Commands["Edit.DeleteCommand"](clipboard, facade);
    },
    
    getCommandName: function getCommandName() {
        return "Edit.DeleteCommand";
    },
    
    getDisplayName: function getDisplayName() {
        return "Shape deleted";
    },
    
    getAffectedShapes: function getAffectedShapes() {
        return this.shapesAsJson.map(function (shapeAsJson) {
            return shapeAsJson.getShape();
//            return this.facade.getCanvas().getChildShapeByResourceId(shapeAsJson.resourceId);
        }.bind(this));
    }
});

ORYX.Core.Commands["Main.JsonImport"] = ORYX.Core.AbstractCommand.extend({
    construct: function(jsonObject, loadSerializedCB, noSelectionAfterImport, facade){
        arguments.callee.$.construct.call(this, facade);
    
        this.jsonObject = jsonObject;
        this.noSelection = noSelectionAfterImport;
        this.shapes;
        this.connections = [];
        this.parents = new Hash();
        this.selection = this.facade.getSelection();
        this.loadSerialized = loadSerializedCB;
    },
    
    getAffectedShapes: function getAffectedShapes() {
        if (this.shapes) {
            return this.shapes;
        }
        return [];
    },
    
    getCommandData: function getCommandData() {
        return {"jsonObject": this.jsonObject};
    },
    
    createFromCommandData: function createFromCommandData(facade, data) {
        return new ORYX.Core.Commands["Main.JsonImport"](data.jsonObject, facade.loadSerialized, true, facade);
    },
    
    getCommandName: function getCommandName() {
        return "Main.JsonImport";
    },
    
    getDisplayName: function getDisplayName() {
        return "Shape pasted";
    },
    
    execute: function(){        
        if (!this.shapes) {
            // Import the shapes out of the serialization		
            this.shapes	= this.loadSerialized( this.jsonObject );		
            
            //store all connections
            this.shapes.each(function(shape) {
                
                if (shape.getDockers) {
                    var dockers = shape.getDockers();
                    if (dockers) {
                        if (dockers.length > 0) {
                            this.connections.push([dockers.first(), dockers.first().getDockedShape(), dockers.first().referencePoint]);
                        }
                        if (dockers.length > 1) {
                            this.connections.push([dockers.last(), dockers.last().getDockedShape(), dockers.last().referencePoint]);
                        }
                    }
                }
                
                //store parents
                this.parents[shape.id] = shape.parent;
            }.bind(this));
        } else {
            this.shapes.each(function(shape) {
                this.parents[shape.id].add(shape);
            }.bind(this));
            
            this.connections.each(function(con) {
                con[0].setDockedShape(con[1]);
                con[0].setReferencePoint(con[2]);
                //con[0].update();
            });
        }
        
        //this.parents.values().uniq().invoke("update");
        this.facade.getCanvas().update();
            
        if(!this.noSelection)
            this.facade.setSelection(this.shapes);
        else
            this.facade.updateSelection(true);
    },
        
    rollback: function(){
        var selection = this.facade.getSelection();
        
        this.shapes.each(function(shape) {
            selection = selection.without(shape);
            this.facade.deleteShape(shape);
        }.bind(this));
        
        this.facade.getCanvas().update();
        
        this.facade.setSelection(selection);
    }
});
