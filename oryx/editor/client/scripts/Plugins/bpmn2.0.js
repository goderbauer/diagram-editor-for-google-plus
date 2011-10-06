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

ORYX.Plugins.BPMN2_0 = {

	/**
	 *	Constructor
	 *	@param {Object} Facade: The Facade of the Editor
	 */
	construct: function(facade){
		this.facade = facade;
		
		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_DRAGDOCKER_DOCKED, this.handleDockerDocked.bind(this));
		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_PROPWINDOW_PROP_CHANGED, this.handlePropertyChanged.bind(this));
		this.facade.registerOnEvent('layout.bpmn2_0.pool', this.handleLayoutPool.bind(this));
		this.facade.registerOnEvent('layout.bpmn2_0.subprocess', this.handleSubProcess.bind(this));
		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_AFTER_COMMANDS_EXECUTED, this.onCommandExecuted.bind(this));
		
		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_LOADED, this.afterLoad.bind(this));
		
		//this.facade.registerOnEvent('layout.bpmn11.lane', this.handleLayoutLane.bind(this));
	},
	
	/**
	 * Force to update every pool
	 */
	afterLoad: function(){
		this.facade.getCanvas().getChildNodes().each(function(shape){
			if (shape.getStencil().id().endsWith("Pool")) {
				this.handleLayoutPool({
					shape: shape
				});
			}
		}.bind(this))
	},

	onCommandExecuted: function(event) {
        if (event.commands.length < 1) {
            return;
        }
        var command = event.commands[0];
        if ((typeof command.metadata !== "undefined") && (command.metadata.name === "ShapeRepository.DropCommand")) {
            var shape = command.shape;
            if ((typeof shape !== "undefined") && (shape.getStencil().idWithoutNs() === "Pool")) {
				if(shape.getChildNodes().length === 0) {
					// create a lane inside the selected pool
					var option = {
							type: "http://b3mn.org/stencilset/bpmn2.0#Lane",
							position: {x:0,y:0},
							namespace: shape.getStencil().namespace(),
							parent: shape,
                            shapeOptions: {
                                id: shape.id + "_lane",
                                resourceId: shape.resourceId + "_lane"
                            } 
					};
					var newLane = this.facade.createShape(option);
                    newLane.metadata.changedBy.push(command.getCreatorId());
                    newLane.metadata.changedAt.push(command.getCreatedAt());
                    newLane.metadata.commands.push(command.getDisplayName());
                    this.facade.raiseEvent({
                        'type': ORYX.CONFIG.EVENT_SHAPE_METADATA_CHANGED,
                        'shape': newLane
                    });
					this.facade.getCanvas().update();
				}
            }
        }
	},
	
	/**
	 * If a pool is selected and contains no lane,
	 * a lane is created automagically
	 */
	/*onSelectionChanged: function(event) {
		if(event.elements && event.elements.length === 1) {
			var shape = event.elements[0];
			if(shape.getStencil().idWithoutNs() === "Pool") {
				if(shape.getChildNodes().length === 0) {
					// create a lane inside the selected pool
					var option = {
							type: "http://b3mn.org/stencilset/bpmn2.0#Lane",
							position: {x:0,y:0},
							namespace: shape.getStencil().namespace(),
							parent: shape,
                            shapeOptions: {
                                id: shape.id + "_lane",
                                resourceId: shape.resourceId + "_lane"
                            } 
					};
					this.facade.createShape(option);
					this.facade.getCanvas().update();
				}
			}
		}
	},*/
	
	hashedSubProcesses: {},
	
	handleSubProcess : function(option) {
		
		var sh = option.shape;
		
		if (!this.hashedSubProcesses[sh.resourceId]) {
			this.hashedSubProcesses[sh.resourceId] = sh.bounds.clone();
			return;
		}
		
		var offset = sh.bounds.upperLeft();
		offset.x -= this.hashedSubProcesses[sh.resourceId].upperLeft().x;
		offset.y -= this.hashedSubProcesses[sh.resourceId].upperLeft().y;
		
		this.hashedSubProcesses[sh.resourceId] = sh.bounds.clone();
		
		this.moveChildDockers(sh, offset);
		
	},
	
	moveChildDockers: function(shape, offset){
		
		if (!offset.x && !offset.y) {
			return;
		} 
		
		// Get all nodes
		shape.getChildNodes(true)
			// Get all incoming and outgoing edges
			.map(function(node){
				return [].concat(node.getIncomingShapes())
						.concat(node.getOutgoingShapes())
			})
			// Flatten all including arrays into one
			.flatten()
			// Get every edge only once
			.uniq()
			// Get all dockers
			.map(function(edge){
				return edge.dockers.length > 2 ? 
						edge.dockers.slice(1, edge.dockers.length-1) : 
						[];
			})
			// Flatten the dockers lists
			.flatten()
			.each(function(docker){
				if (docker.isChanged){ return }
				docker.bounds.moveBy(offset);
			})
	},
	
	/**
	 * DragDocker.Docked Handler
	 *
	 */	
	handleDockerDocked: function(options) {
		var edge = options.parent;
		var edgeSource = options.target;
		
		if(edge.getStencil().id() === "http://b3mn.org/stencilset/bpmn2.0#SequenceFlow") {
			var isGateway = edgeSource.getStencil().groups().find(function(group) {
					if(group == "Gateways") 
						return group;
				});
			if(!isGateway && (edge.properties["oryx-conditiontype"] == "Expression"))
				// show diamond on edge source
				edge.setProperty("oryx-showdiamondmarker", true);
			else 
				// do not show diamond on edge source
				edge.setProperty("oryx-showdiamondmarker", false);
			
			// update edge rendering
			//edge.update();
			
			this.facade.getCanvas().update();
		}
	},
	
	/**
	 * PropertyWindow.PropertyChanged Handler
	 */
	handlePropertyChanged: function(option) {
		
		var shapes = option.elements;
		var propertyKey = option.key;
		var propertyValue = option.value;
		
		var changed = false;
		shapes.each(function(shape){
			if((shape.getStencil().id() === "http://b3mn.org/stencilset/bpmn2.0#SequenceFlow") &&
				(propertyKey === "oryx-conditiontype")) {
				
				if(propertyValue != "Expression")
					// Do not show the Diamond
					shape.setProperty("oryx-showdiamondmarker", false);
				else {
					var incomingShapes = shape.getIncomingShapes();
					
					if(!incomingShapes) {
						shape.setProperty("oryx-showdiamondmarker", true);
					}
					
					var incomingGateway = incomingShapes.find(function(aShape) {
						var foundGateway = aShape.getStencil().groups().find(function(group) {
							if(group == "Gateways") 
								return group;
						});
						if(foundGateway)
							return foundGateway;
					});
					
					if(!incomingGateway) 
						// show diamond on edge source
						shape.setProperty("oryx-showdiamondmarker", true);
					else
						// do not show diamond
						shape.setProperty("oryx-showdiamondmarker", false);
				}
				
				changed = true;
			}
		});
		
		if(changed) {this.facade.getCanvas().update();}
		
	},
	
	hashedPoolPositions : {},
	hashedLaneDepth : {},
	hashedBounds : {},
	
	/**
	 * Handler for layouting event 'layout.bpmn2_0.pool'
	 * @param {Object} event
	 */
	handleLayoutPool: function(event){
		
		var pool = event.shape;
		var selection = this.facade.getSelection(); 
		var currentShape = selection.first();
		
		currentShape = currentShape || pool;
		
		this.currentPool = pool;
		
		// Check if it is a pool or a lane
		if (!(currentShape.getStencil().id().endsWith("Pool") || currentShape.getStencil().id().endsWith("Lane"))) {
			return;
		}
		
		if (!this.hashedBounds[pool.resourceId]) {
			this.hashedBounds[pool.resourceId] = {};
		}
		
		// Find all child lanes
		var lanes = this.getLanes(pool);
		
		if (lanes.length <= 0) {
			return
		}
		
		// Show/hide caption regarding the number of lanes
		if (lanes.length === 1 && this.getLanes(lanes.first()).length <= 0) {
			// TRUE if there is a caption
			lanes.first().setProperty("oryx-showcaption", lanes.first().properties["oryx-name"].trim().length > 0);
			var rect = lanes.first().node.getElementsByTagName("rect");
			rect[0].setAttributeNS(null, "display", "none");
		} else {
			lanes.invoke("setProperty", "oryx-showcaption", true);
			lanes.each(function(lane){
				var rect = lane.node.getElementsByTagName("rect");
				rect[0].removeAttributeNS(null, "display");
			})
		}
		
		
		
		var allLanes = this.getLanes(pool, true);
		
		var deletedLanes = [];
		var addedLanes = [];
		
		// Get all new lanes
		var i=-1;
		while (++i<allLanes.length) {
			if (!this.hashedBounds[pool.resourceId][allLanes[i].resourceId]){
				addedLanes.push(allLanes[i])
			}
		}
		
		if (addedLanes.length > 0){
			currentShape = addedLanes.first();
		}
		
		
		// Get all deleted lanes
		var resourceIds = $H(this.hashedBounds[pool.resourceId]).keys();
		var i=-1;
		while (++i<resourceIds.length) {
			if (!allLanes.any(function(lane){ return lane.resourceId == resourceIds[i]})){
				deletedLanes.push(this.hashedBounds[pool.resourceId][resourceIds[i]]);
				selection = selection.without(function(r){ return r.resourceId == resourceIds[i] });
			}
		}		
				
		var height, width;
		
		if (deletedLanes.length > 0 || addedLanes.length > 0) {
			
			// Set height from the pool
			height = this.updateHeight(pool);
			// Set width from the pool
			width = this.adjustWidth(lanes, pool.bounds.width());	
			
			pool.update();
		}
		
		/**
		 * Set width/height depending on the pool
		 */
		else if (pool == currentShape) {
			
			// Set height from the pool
			height = this.adjustHeight(lanes, undefined, pool.bounds.height());
			// Set width from the pool
			width = this.adjustWidth(lanes, pool.bounds.width());		
		}
		
		/**‚
		 * Set width/height depending on containing lanes
		 */		
		else {
			// Get height and adjust child heights
			height = this.adjustHeight(lanes, currentShape);
			// Set width from the current shape
			width = this.adjustWidth(lanes, currentShape.bounds.width()+(this.getDepth(currentShape,pool)*30));
		}
		

		this.setDimensions(pool, width, height);
		
		
		
		// Update all dockers
		this.updateDockers(allLanes, pool);
		
		this.hashedBounds[pool.resourceId] = {};
		
		var i=-1;
		while (++i < allLanes.length) {
			// Cache positions
			this.hashedBounds[pool.resourceId][allLanes[i].resourceId] = allLanes[i].absoluteBounds();
			
			this.hashedLaneDepth[allLanes[i].resourceId] = this.getDepth(allLanes[i], pool);
			
			this.forceToUpdateLane(allLanes[i]);
		}
		
		this.hashedPoolPositions[pool.resourceId] = pool.bounds.clone();
		
		
		// Update selection
		//this.facade.setSelection(selection);		
	},
	forceToUpdateLane: function(lane){
		
		if (lane.bounds.height() !== lane._svgShapes[0].height) {	
			lane.isChanged = true;
			lane.isResized = true;
			lane._update();
		}
	},
	
	getDepth: function(child, parent){
		
		var i=0;
		while(child && child.parent && child !== parent){
			child = child.parent;
			++i
		}
		return i;
	},
	
	updateDepth: function(lane, fromDepth, toDepth){
		
		var xOffset = (fromDepth - toDepth) * 30;
		
		lane.getChildNodes().each(function(shape){
			shape.bounds.moveBy(xOffset, 0);
			
			[].concat(children[j].getIncomingShapes())
					.concat(children[j].getOutgoingShapes())
					
		})
		
	},
	
	setDimensions: function(shape, width, height){
		var isLane = shape.getStencil().id().endsWith("Lane");
		// Set the bounds
		shape.bounds.set(
				isLane ? 30 : shape.bounds.a.x, 
				shape.bounds.a.y, 
				width	? shape.bounds.a.x + width - (isLane?30:0) : shape.bounds.b.x, 
				height 	? shape.bounds.a.y + height : shape.bounds.b.y
			);
	},

	setLanePosition: function(shape, y){
		shape.bounds.moveTo(30, y);
	},
		
	adjustWidth: function(lanes, width) {
		
		// Set width to each lane
		(lanes||[]).each(function(lane){
			this.setDimensions(lane, width);
			this.adjustWidth(this.getLanes(lane), width-30);
		}.bind(this));
		
		return width;
	},
	
	
	adjustHeight: function(lanes, changedLane, propagateHeight){
		
		var oldHeight = 0;
		if (!changedLane && propagateHeight){
			var i=-1;
			while (++i<lanes.length){	
				oldHeight += lanes[i].bounds.height();		
			}
		}
		
		var i=-1;
		var height = 0;
		
		// Iterate trough every lane
		while (++i<lanes.length){
			
			if (lanes[i] === changedLane) {
				// Propagate new height down to the children
				this.adjustHeight(this.getLanes(lanes[i]), undefined, lanes[i].bounds.height());
				
				lanes[i].bounds.set({x:30, y:height}, {x:lanes[i].bounds.width()+30, y:lanes[i].bounds.height()+height})
								
			} else if (!changedLane && propagateHeight) {
				
				var tempHeight = (lanes[i].bounds.height() * propagateHeight) / oldHeight;
				// Propagate height
				this.adjustHeight(this.getLanes(lanes[i]), undefined, tempHeight);
				// Set height propotional to the propagated and old height
				this.setDimensions(lanes[i], null, tempHeight);
				this.setLanePosition(lanes[i], height);
			} else {
				// Get height from children
				var tempHeight = this.adjustHeight(this.getLanes(lanes[i]), changedLane, propagateHeight);
				if (!tempHeight) {
					tempHeight = lanes[i].bounds.height();
				}
				this.setDimensions(lanes[i], null, tempHeight);
				this.setLanePosition(lanes[i], height);
			}
			
			height += lanes[i].bounds.height();
		}
		
		return height;
		
	},
	
	
	updateHeight: function(root){
		
		var lanes = this.getLanes(root);
		
		if (lanes.length == 0){
			return root.bounds.height();
		}
		
		var height = 0;
		var i=-1;
		while (++i < lanes.length) {
			this.setLanePosition(lanes[i], height);
			height += this.updateHeight(lanes[i]);
		}
		
		this.setDimensions(root, null, height);
		
		return height;
	},
	
	getOffset: function(lane, includePool, pool){
		
		var offset = {x:0,y:0};
		
		
		/*var parent = lane; 
		 while(parent) {
		 				
			
			var offParent = this.hashedBounds[pool.resourceId][parent.resourceId] ||(includePool === true ? this.hashedPoolPositions[parent.resourceId] : undefined);
			if (offParent){
				var ul = parent.bounds.upperLeft();
				var ulo = offParent.upperLeft();
				offset.x += ul.x-ulo.x;
				offset.y += ul.y-ulo.y;
			}
			
			if (parent.getStencil().id().endsWith("Pool")) {
				break;
			}
			
			parent = parent.parent;
		}	*/
		
		var offset = lane.absoluteXY();
		
		var hashed = this.hashedBounds[pool.resourceId][lane.resourceId] ||(includePool === true ? this.hashedPoolPositions[lane.resourceId] : undefined);
		if (hashed) {
			offset.x -= hashed.upperLeft().x; 	
			offset.y -= hashed.upperLeft().y;		
		} else {
			return {x:0,y:0}
		}		
		return offset;
	},
	
	getNextLane: function(shape){
		while(shape && !shape.getStencil().id().endsWith("Lane")){
			if (shape instanceof ORYX.Core.Canvas) {
				return null;
			}
			shape = shape.parent;
		}
		return shape;
	},
	
	getParentPool: function(shape){
		while(shape && !shape.getStencil().id().endsWith("Pool")){
			if (shape instanceof ORYX.Core.Canvas) {
				return null;
			}
			shape = shape.parent;
		}
		return shape;
	},
	updateDockers: function(lanes, pool){
		
		var absPool = pool.absoluteBounds();
		var oldPool = (this.hashedPoolPositions[pool.resourceId]||absPool).clone();
		
		var i=-1, j=-1, k=-1, l=-1, docker;
		var dockers = {};
		
		while (++i < lanes.length) {
			
			if (!this.hashedBounds[pool.resourceId][lanes[i].resourceId]) {
				continue;
			}
			
			var children = lanes[i].getChildNodes();
			var absBounds = lanes[i].absoluteBounds();
			var oldBounds = (this.hashedBounds[pool.resourceId][lanes[i].resourceId]||absBounds);
			//oldBounds.moveBy((absBounds.upperLeft().x-lanes[i].bounds.upperLeft().x), (absBounds.upperLeft().y-lanes[i].bounds.upperLeft().y));
			var offset = this.getOffset(lanes[i], true, pool);
			var xOffsetDepth = 0;

			var depth = this.getDepth(lanes[i], pool);
			if ( this.hashedLaneDepth[lanes[i].resourceId] !== undefined &&  this.hashedLaneDepth[lanes[i].resourceId] !== depth) {
				xOffsetDepth = (this.hashedLaneDepth[lanes[i].resourceId] - depth) * 30;
				offset.x += xOffsetDepth;
			}
			
			j=-1;
			
			while (++j < children.length) {
				
				if (xOffsetDepth) {
					children[j].bounds.moveBy(xOffsetDepth, 0);
				}
				
				if (children[j].getStencil().id().endsWith("Subprocess")) {
					this.moveChildDockers(children[j], offset);
				}
				
				var edges = [].concat(children[j].getIncomingShapes())
					.concat(children[j].getOutgoingShapes())
					// Remove all edges which are included in the selection from the list
					.findAll(function(r){ return r instanceof ORYX.Core.Edge })

				k=-1;
				while (++k < edges.length) {			
					
					if (edges[k].getStencil().id().endsWith("MessageFlow")) {
						this.layoutEdges(children[j], [edges[k]], offset);
						continue;
					}
					
					l=-1;
					while (++l < edges[k].dockers.length) {
						
						docker = edges[k].dockers[l];
						
						if (docker.getDockedShape()||docker.isChanged){
							continue;
						}
					
					
						pos = docker.bounds.center();
						
						// Check if the modified center included the new position
						var isOverLane = oldBounds.isIncluded(pos);
						// Check if the original center is over the pool
						var isOutSidePool = !oldPool.isIncluded(pos);
						var previousIsOverLane = l == 0 ? isOverLane : oldBounds.isIncluded(edges[k].dockers[l-1].bounds.center());
						var nextIsOverLane = l == edges[k].dockers.length-1 ? isOverLane : oldBounds.isIncluded(edges[k].dockers[l+1].bounds.center());
						
						
						// Check if the previous dockers docked shape is from this lane
						// Otherwise, check if the docker is over the lane OR is outside the lane 
						// but the previous/next was over this lane
						if (isOverLane){
							dockers[docker.id] = {docker: docker, offset:offset};
						} 
						/*else if (l == 1 && edges[k].dockers.length>2 && edges[k].dockers[l-1].isDocked()){
							var dockedLane = this.getNextLane(edges[k].dockers[l-1].getDockedShape());
							if (dockedLane != lanes[i])
								continue;
							dockers[docker.id] = {docker: docker, offset:offset};
						}
						// Check if the next dockers docked shape is from this lane
						else if (l == edges[k].dockers.length-2 && edges[k].dockers.length>2 && edges[k].dockers[l+1].isDocked()){
							var dockedLane = this.getNextLane(edges[k].dockers[l+1].getDockedShape());
							if (dockedLane != lanes[i])
								continue;
							dockers[docker.id] = {docker: docker, offset:offset};
						}
												
						else if (isOutSidePool) {
							dockers[docker.id] = {docker: docker, offset:this.getOffset(lanes[i], true, pool)};
						}*/
						
					
					}
				}
						
			}
		}
		
		// Set dockers
		i=-1;
		var keys = $H(dockers).keys();
		while (++i < keys.length) {
			dockers[keys[i]].docker.bounds.moveBy(dockers[keys[i]].offset);
		}
	},
	
	moveBy: function(pos, offset){
		pos.x += offset.x;
		pos.y += offset.y;
		return pos;
	},
	
	getHashedBounds: function(shape){
		return this.currentPool && this.hashedBounds[this.currentPool.resourceId][shape.resourceId] ? this.hashedBounds[this.currentPool.resourceId][shape.resourceId] : shape.bounds.clone();
	},
	
	/**
	 * Returns a set on all child lanes for the given Shape. If recursive is TRUE, also indirect children will be returned (default is FALSE)
	 * The set is sorted with first child the lowest y-coordinate and the last one the highest.
	 * @param {ORYX.Core.Shape} shape
	 * @param {boolean} recursive
	 */
	getLanes: function(shape, recursive){
		var lanes = shape.getChildNodes(recursive||false).findAll(function(node) { return (node.getStencil().id() === "http://b3mn.org/stencilset/bpmn2.0#Lane"); });
		lanes = lanes.sort(function(a, b){
					// Get y coordinate
					var ay = Math.round(a.bounds.upperLeft().y);
					var by = Math.round(b.bounds.upperLeft().y);
					
					// If equal, than use the old one
					if (ay == by) {
						ay = Math.round(this.getHashedBounds(a).upperLeft().y);
						by = Math.round(this.getHashedBounds(b).upperLeft().y);
					}
					return  ay < by ? -1 : (ay > by ? 1 : 0)
				}.bind(this))
		return lanes;
	}
	
};
	
ORYX.Plugins.BPMN2_0 = ORYX.Plugins.AbstractPlugin.extend(ORYX.Plugins.BPMN2_0);
