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

if (!ORYX.Plugins) {
    ORYX.Plugins = new Object();
}

ORYX.Core.Commands["ShapeRepository.DropCommand"] = ORYX.Core.AbstractCommand.extend({
    construct: function construct(option, currentParent, canAttach, position, facade) {
        // call construct method of parent
        arguments.callee.$.construct.call(this, facade);
        
        this.option = option;
        this.currentParent = currentParent;
        this.canAttach = canAttach;
        this.position = position;
        this.selection = this.facade.getSelection();
        this.shape;
        this.parent;
    },
    
    getAffectedShapes: function getAffectedShapes() {
        if (typeof this.shape !== "undefined") {
            return [this.shape];
        }
        return [];
    },
    
    getCommandName: function getCommandName() {
        return "ShapeRepository.DropCommand";
    },
    
    getDisplayName: function getDisplayName() {
        return "Shape created";
    },
    
    getCommandData: function getCommandData() {
        var commandData = {
            id : this.shape.id,
            resourceId : this.shape.resourceId,
            parent : this.parent.resourceId,
            currentParent : this.currentParent.resourceId,
            position: this.position,
            optionsPosition : this.option.position,
            namespace : this.option.namespace,
            type : this.option.type,
            canAttach : this.canAttach
        };
        
        return commandData;
    },
    
    createFromCommandData: function createFromCommandData(facade, commandData) {
        var currentParent = facade.getCanvas().getChildShapeOrCanvasByResourceId(commandData.currentParent);
        var parent = facade.getCanvas().getChildShapeOrCanvasByResourceId(commandData.parent);
        
        // Checking if the shape we drop the new shape into still exists.
        if (typeof parent === 'undefined' || typeof currentParent === 'undefined' ) {
            return undefined;
        }
        
        var options = {
            'shapeOptions': {
                'id': commandData.id,
                'resourceId': commandData.resourceId
            },
            'position': commandData.optionsPosition,
            'namespace': commandData.namespace,
            'type': commandData.type
        };
        options.parent = parent;
        
        return new ORYX.Core.Commands["ShapeRepository.DropCommand"](options, currentParent, commandData.canAttach, commandData.position, facade);
    },
    
    execute: function execute() {
        if (!this.shape) {
            this.shape      = this.facade.createShape(this.option);
            this.parent = this.shape.parent;
        } else {
            this.parent.add(this.shape);
        }
        
        if (this.canAttach && this.currentParent instanceof ORYX.Core.Node && this.shape.dockers.length > 0) {
            var docker = this.shape.dockers[0];

            if (this.currentParent.parent instanceof ORYX.Core.Node) {
                this.currentParent.parent.add( docker.parent );
            }
            var relativePosition = this.facade.getCanvas().node.ownerSVGElement.createSVGPoint();
            relativePosition.x = (this.currentParent.absoluteBounds().lowerRight().x - this.position.x) / this.currentParent.bounds.width();
            relativePosition.y = (this.currentParent.absoluteBounds().lowerRight().y - this.position.y) / this.currentParent.bounds.height();

            var absolutePosition;
            if (typeof this.currentParent !== "undefined") {
                absolutePosition = this.facade.getCanvas().node.ownerSVGElement.createSVGPoint();
                if ((0 > relativePosition.x) || (relativePosition.x > 1) || (0 > relativePosition.y) || (relativePosition.y > 1)) {
                    relativePosition.x = 0;
                    relativePosition.y = 0;
                } 
                absolutePosition.x = Math.abs(this.currentParent.absoluteBounds().lowerRight().x - relativePosition.x * this.currentParent.bounds.width());
                absolutePosition.y = Math.abs(this.currentParent.absoluteBounds().lowerRight().y - relativePosition.y * this.currentParent.bounds.height());
            } else {
                absolutePosition = relativePosition;
            }

            docker.bounds.centerMoveTo(absolutePosition);
            docker.setDockedShape( this.currentParent );
        }

        this.facade.getCanvas().update();
        this.facade.updateSelection(this.isLocal());
    },

    rollback: function rollback() {
        // If syncro tells us to revert a command, we have to pick necessary references ourselves.
        if (typeof this.shape === 'undefined') {
            this.shape = this.facade.getCanvas().getChildShapeByResourceId(this.option.shapeOptions.resourceId);
            if (typeof this.shape === 'undefined') {
                throw "Could not revert Shaperepository.DropCommand. this.shape is undefined.";
            }
        }
        this.facade.deleteShape(this.shape);
        this.facade.raiseEvent(
            {
                "type": ORYX.CONFIG.EVENT_SHAPEDELETED, 
                "shape": this.shape
            }
        );
        var selectedShapes = this.facade.getSelection();
        var newSelectedShapes = selectedShapes.without(this.shape);
        this.facade.getCanvas().update();
        if (this.isLocal()) {
            this.facade.setSelection(newSelectedShapes);
        } else {
            var isDragging = this.facade.isDragging();
            if (!isDragging) {
                this.facade.setSelection(newSelectedShapes);
            } else {
                //raise event, which assures, that selection and canvas will be updated after dragging is finished
                this.facade.raiseEvent(
                    {
                        "type": ORYX.CONFIG.EVENT_SHAPESTODELETE, 
                        "deletedShapes": [this.shape]
                    }
                );
            }
        }
        this.facade.updateSelection(this.isLocal());
    }
});

ORYX.Plugins.NewShapeRepository = {
    construct: function(facade) {
        arguments.callee.$.construct.call(this, facade); // super()
    
        this.facade = facade;
        this._currentParent;
        this._canContain = undefined;
        this._canAttach  = undefined;

        this.canvasContainer = $$(".ORYX_Editor")[0].parentNode;
        this.shapeList = document.createElement('div');
        this.shapeList.id = 'pwave-repository';
        this.canvasContainer.appendChild(this.shapeList);
        this.groupStencils = [];
        
        // Create a Drag-Zone for Drag'n'Drop
        var dragZone = new Ext.dd.DragZone(this.shapeList, {shadow: !Ext.isMac, hasOuterHandles: true});
        dragZone.onDrag = function() { this.groupStencils.each(this._hideGroupStencil); }.bind(this);
        dragZone.afterDragDrop = this.drop.bind(this, dragZone);
        dragZone.beforeDragOver = this.beforeDragOver.bind(this, dragZone);
        dragZone.beforeDragEnter = function() { this._lastOverElement = false; return true; }.bind(this);
        
        // Load all Stencilssets
        this.setStencilSets();
        
        this.hoverTimeout = undefined;

        this.timesHidden = 0;
        
        this.facade.registerOnEvent(ORYX.CONFIG.EVENT_STENCIL_SET_LOADED, this.setStencilSets.bind(this));
        this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MODE_CHANGED, this._handleModeChanged.bind(this));
    },
    
    _handleModeChanged: function _handleModeChanged(event) {
        this._setVisibility(event.mode.isEditMode()  && !event.mode.isPaintMode());
    },
    
    getVisibleCanvasHeight: function getVisibleCanvasHeight() {
        var canvasContainer = $$(".ORYX_Editor")[0].parentNode;
        return canvasContainer.offsetHeight;
    },
    
    /**
     * Load all stencilsets in the shaperepository
     */
    setStencilSets: function() {
        // Remove all childs
        var child = this.shapeList.firstChild;
        while(child) {
            this.shapeList.removeChild(child);
            child = this.shapeList.firstChild;
        }

        // Go thru all Stencilsets and stencils
        this.facade.getStencilSets().values().each((function(sset) {
            
            var typeTitle = sset.title();
            var extensions = sset.extensions();
            if (extensions && extensions.size() > 0) {
                typeTitle += " / " + ORYX.Core.StencilSet.getTranslation(extensions.values()[0], "title");
            } 
            
            // For each Stencilset create and add a new Tree-Node
            var stencilSetNode = document.createElement('div');
            this.shapeList.appendChild(stencilSetNode);
            
            // Get Stencils from Stencilset
            var stencils = sset.stencils(this.facade.getCanvas().getStencil(),
                                         this.facade.getRules());   
            var treeGroups = new Hash();
            
            // Sort the stencils according to their position and add them to the repository
            stencils = stencils.sortBy(function(value) { return value.position(); } );
            stencils.each((function(stencil) {
                var groups = stencil.groups();
                groups.each((function(group) {                  
                    var firstInGroup = !treeGroups[group];
                    var groupStencil = undefined;
                    if(firstInGroup) {
                        // add large shape icon to shape repository
                        groupStencil = this.createGroupStencilNode(stencilSetNode, stencil, group);
                        // Create a new group
                        var groupElement = this.createGroupElement(groupStencil, group);
                        treeGroups[group] = groupElement;
                        this.addGroupStencilHoverListener(groupStencil);
                        this.groupStencils.push(groupStencil);
                    }
                    
                    // Create the Stencil-Tree-Node
                    var stencilTreeNode = this.createStencilTreeNode(treeGroups[group], stencil);
                    var handles = [];
                    for (var i = 0; i < stencilTreeNode.childNodes.length; i++) {
                        handles.push(stencilTreeNode.childNodes[i]);
                    }
                    if (firstInGroup) {
                        handles.push(groupStencil.firstChild);
                    }
                    // Register the Stencil on Drag and Drop
                    Ext.dd.Registry.register(stencilTreeNode, {
                        'handles': handles, // Set the Handles
                        'isHandle': true,
                        'type': stencil.id(),           // Set Type of stencil 
                        namespace: stencil.namespace()      // Set Namespace of stencil
                    });
                    
                }).bind(this));
            }).bind(this));
        }).bind(this));
    },
    
    addGroupStencilHoverListener: function addGroupStencilHoverListener(groupStencil) {
        var timer = {};
        
        var hideGroupElement = function hideGroupElement(event) {
            // Hide the extended groupElement if the mouse is not moving to the groupElement
            clearTimeout(timer);
            this._hideGroupStencil(groupStencil);
        }.bind(this);
        
        var handleMouseOver = function handleMouseOver(event) {
            var showGroupElement = function showGroupElement() {
                var groupElement = jQuery(groupStencil).children(".new-repository-group");
                var groupLeftBar = jQuery(groupElement).children(".new-repository-group-left-bar");
                var groupHeader = jQuery(groupElement).children(".new-repository-group-header");
                var stencilBoundingRect = groupStencil.getBoundingClientRect();
                groupElement.css('top', stencilBoundingRect.top + 'px');
                groupElement.css('left', stencilBoundingRect.right - 1 + 'px');
                groupElement.addClass('new-repository-group-visible');
                // Position the groupElement so its lower bound is not lower than 460px
                var groupBoundingRect = groupHeader[0].getBoundingClientRect();
                var lowestPosition = 530;
                if (groupBoundingRect.bottom > lowestPosition) {
                    var invisibleOffset = groupBoundingRect.bottom - lowestPosition;
                    groupElement.css('top', groupBoundingRect.top - invisibleOffset + 'px');
                    groupLeftBar.css('height', stencilBoundingRect.bottom + 1 - groupElement.position().top + 'px'); // +1 for border
                }
            };
            timer = setTimeout(showGroupElement, 500);
        };
        
        jQuery(groupStencil).bind('mouseenter', handleMouseOver);
        jQuery(groupStencil).bind('mouseleave', hideGroupElement);
    },

    createGroupStencilNode: function createGroupStencilNode(parentTreeNode, stencil, groupname) {
        // Create and add the Stencil to the Group
        var newElement = document.createElement('div');
        newElement.className = 'new-repository-group-stencil';
        var stencilImage = document.createElement('div');
        stencilImage.className = 'new-repository-group-stencil-bg';
        stencilImage.style.backgroundImage = 'url(' + stencil.bigIcon() + ')';
        newElement.appendChild(stencilImage);
        parentTreeNode.appendChild(newElement);
        return newElement;
    },

    createStencilTreeNode: function createStencilTreeNode(parentTreeNode, stencil) {
        // Create and add the Stencil to the Group
        var newRow = jQuery('<div class="new-repository-group-row"></div>');
        newRow.append('<div class="new-repository-group-row-lefthighlight"></div>');
        var entry = jQuery('<div class="new-repository-group-row-entry"></div>');
        // entry.attr("title", stencil.description()); no tooltips
        var icon = jQuery('<img></img>');
        icon.attr('src', stencil.icon());
        entry.append(icon);
        entry.append(stencil.title());
        newRow.append(entry);
        newRow.append('<div class="new-repository-group-row-righthighlight"></div>');
        jQuery(parentTreeNode).find(".new-repository-group-entries:first").append(newRow);
        return entry[0];
    },
    
    createGroupElement: function createGroupElement(groupStencilNode, group) {
        // Create the div that appears on the right side of the shape repository containing additional shapes of the group.
        var groupElement = jQuery("<div class='new-repository-group'>" +
                // left bar
                "<div class='new-repository-group-left-bar'>" +
                    "<div class='new-repository-group-left-bar-bottom-gradient'></div>" +
                    "<div class='new-repository-group-left-bar-bottom-highlight'></div>" +
                "</div>" +
                // header
                "<div class='new-repository-group-header'>" +
                    "<div style='position: relative; width: 100%'>" +
                        "<div class='new-repository-group-header-left-highlight'></div>" +
                        "<div class='new-repository-group-header-label'></div>" +
                        "<div class='new-repository-group-header-right-highlight'></div>" +
                        "<div class='new-repository-group-content'>" +
                            "<div class='new-repository-group-entries'></div>" +
                        "</div>" +
                    "</div>" +
                "</div>" +
            "</div>"
        );
        groupElement.find(".new-repository-group-header-label").text(group);
        // Add the Group to the ShapeRepository
        jQuery(groupStencilNode).append(groupElement);
        return groupElement[0];
    },
    
    _hideGroupStencil: function _hideGroupStencil(groupStencil) {
        var groupElement = jQuery(groupStencil).children(".new-repository-group:first");
        groupElement.removeClass('new-repository-group-visible');
    },
    
    drop: function(dragZone, target, event) {
        this._lastOverElement = undefined;
        
        // Hide the highlighting
        this.facade.raiseEvent({type: ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE, highlightId:'shapeRepo.added'});
        this.facade.raiseEvent({type: ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE, highlightId:'shapeRepo.attached'});
        
        // Check if drop is allowed
        var proxy = dragZone.getProxy();
        if(proxy.dropStatus == proxy.dropNotAllowed) { return; }
        
        // Check if there is a current Parent
        if(!this._currentParent) { return; }
        
        var option = Ext.dd.Registry.getHandle(target.DDM.currentTarget);
        
        // Make sure, that the shapeOptions of the last DropCommand are not reused.
        option.shapeOptions = undefined;
        
        var xy = event.getXY();
        var pos = {x: xy[0], y: xy[1]};

        var a = this.facade.getCanvas().node.getScreenCTM();

        // Correcting the UpperLeft-Offset
        pos.x -= a.e; pos.y -= a.f;
        // Correcting the Zoom-Faktor
        pos.x /= a.a; pos.y /= a.d;
        // Correting the ScrollOffset
        pos.x -= document.documentElement.scrollLeft;
        pos.y -= document.documentElement.scrollTop;
        // Correct position of parent
        var parentAbs = this._currentParent.absoluteXY();
        pos.x -= parentAbs.x;
        pos.y -= parentAbs.y;

        // Set position
        option['position'] = pos;
        
        // Set parent
        if( this._canAttach &&  this._currentParent instanceof ORYX.Core.Node ){
            option['parent'] = undefined;   
        } else {
            option['parent'] = this._currentParent;
        }
        
        var position = this.facade.eventCoordinates( event.browserEvent );
        var command = new ORYX.Core.Commands["ShapeRepository.DropCommand"](option, this._currentParent, this._canAttach, position, this.facade);
        this.facade.executeCommands([command]);
        this._currentParent = undefined;
    },

    beforeDragOver: function(dragZone, target, event){
        var pr;
        var coord = this.facade.eventCoordinates(event.browserEvent);
        var aShapes = this.facade.getCanvas().getAbstractShapesAtPosition( coord );

        if(aShapes.length <= 0) {
            pr = dragZone.getProxy();
            pr.setStatus(pr.dropNotAllowed);
            pr.sync();
            return false;
        }
        
        var el = aShapes.last();
        
        if(aShapes.lenght == 1 && aShapes[0] instanceof ORYX.Core.Canvas) {            
            return false;
        } else {
            // check containment rules
            var option = Ext.dd.Registry.getHandle(target.DDM.currentTarget);
            var stencilSet = this.facade.getStencilSets()[option.namespace];
            var stencil = stencilSet.stencil(option.type);

            if(stencil.type() === "node") {                
                var parentCandidate = aShapes.reverse().find(function(candidate) {
                    return (candidate instanceof ORYX.Core.Canvas 
                            || candidate instanceof ORYX.Core.Node
                            || candidate instanceof ORYX.Core.Edge);
                });
                
                if (parentCandidate !== this._lastOverElement) {
                    this._canAttach  = undefined;
                    this._canContain = undefined;
                }
                
                if( parentCandidate ) {
                    //check containment rule
                    if (!(parentCandidate instanceof ORYX.Core.Canvas) && parentCandidate.isPointOverOffset(coord.x, coord.y) && this._canAttach == undefined) {
                    
                        this._canAttach = this.facade.getRules().canConnect({
                                                sourceShape: parentCandidate,
                                                edgeStencil: stencil,
                                                targetStencil: stencil
                                            });
                        
                        if( this._canAttach ){
                            // Show Highlight
                            this.facade.raiseEvent({
                                type: ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW,
                                highlightId: "shapeRepo.attached",
                                elements: [parentCandidate],
                                style: ORYX.CONFIG.SELECTION_HIGHLIGHT_STYLE_RECTANGLE,
                                color: ORYX.CONFIG.SELECTION_VALID_COLOR
                            });
                            
                            this.facade.raiseEvent({
                                type: ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,
                                highlightId: "shapeRepo.added"
                            });
                            
                            this._canContain    = undefined;
                        }                   
                        
                    }
                    
                    if(!(parentCandidate instanceof ORYX.Core.Canvas) && !parentCandidate.isPointOverOffset(coord.x, coord.y)){
                        this._canAttach     = this._canAttach == false ? this._canAttach : undefined;                       
                    }
                    
                    if( this._canContain == undefined && !this._canAttach) {                                            
                        this._canContain = this.facade.getRules().canContain({
                                                            containingShape:parentCandidate, 
                                                            containedStencil:stencil
                                                            });
                        
                        // Show Highlight
                        this.facade.raiseEvent({
                                                type:       ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW, 
                                                highlightId:'shapeRepo.added',
                                                elements:   [parentCandidate],
                                                color:      this._canContain ? ORYX.CONFIG.SELECTION_VALID_COLOR : ORYX.CONFIG.SELECTION_INVALID_COLOR
                                              });
                        this.facade.raiseEvent({
                                                type:       ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,
                                                highlightId:"shapeRepo.attached"
                                              });
                    }
                    
                    this._currentParent = this._canContain || this._canAttach ? parentCandidate : undefined;
                    this._lastOverElement = parentCandidate;
                    pr = dragZone.getProxy();
                    pr.setStatus(this._currentParent ? pr.dropAllowed : pr.dropNotAllowed );
                    pr.sync();
                }
            } else { //Edge
                this._currentParent = this.facade.getCanvas();
                pr = dragZone.getProxy();
                pr.setStatus(pr.dropAllowed);
                pr.sync();
            }
        }
        
        return false;
    },
    
    _setVisibility: function _setVisibility(show) {
        if (show) {
            this.shapeList.show();
        } else {
            this.shapeList.hide();
        }
    }
};

ORYX.Plugins.NewShapeRepository = Clazz.extend(ORYX.Plugins.NewShapeRepository);
