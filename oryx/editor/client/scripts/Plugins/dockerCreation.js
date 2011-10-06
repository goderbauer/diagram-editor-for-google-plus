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
    
ORYX.Core.Commands["DockerCreation.NewDockerCommand"] = ORYX.Core.AbstractCommand.extend({
    construct: function construct(addEnabled, deleteEnabled, edge, docker, pos, facade, args){            
        // call construct method of parent
        arguments.callee.$.construct.call(this, facade);
        
        this.addEnabled = addEnabled;
        this.deleteEnabled = deleteEnabled;
        this.edge = edge;
        this.docker = docker;
        this.pos = pos;
        this.facade = facade;
        this.id = args.dockerId;
        this.index = args.index;
        this.options = args.options;
    },
    execute: function(){
        if (this.addEnabled) {
            this.docker = this.edge.addDocker(this.pos, this.docker, this.id);
            if (typeof this.docker === "undefined") {
                this.docker = this.edge.createDocker(this.index, this.pos, this.id);
            } else {
                this.index = this.edge.dockers.indexOf(this.docker);
            }
        } else if (this.deleteEnabled) {
            if (typeof this.docker !== "undefined") {
			    this.index = this.edge.dockers.indexOf(this.docker);
                this.pos = this.docker.bounds.center();
                this.edge.removeDocker(this.docker);
            }
        }
        this.facade.getCanvas().update();
        this.facade.updateSelection();
        this.options.docker = this.docker;
    },
    rollback: function(){  
        if (this.addEnabled) {
            if (this.docker instanceof ORYX.Core.Controls.Docker) {
                    this.edge.removeDocker(this.docker);
            }         
        } else if (this.deleteEnabled) {
            if (typeof this.docker !== "undefined") {
                this.edge.add(this.docker, this.index);
            }
        }
        this.facade.getCanvas().update();
        this.facade.updateSelection(); 
    },
    getCommandData: function getCommandData() {
        var getId = function(shape) { return shape.resourceId; };
        var getDockerId = function(docker) {
            var dockerId; 
            if (typeof docker !== "undefined") {
                dockerId = docker.id;
            }
            return dockerId;
        };

        var cmd = {
            "index": this.index,
            "name": "DockerCreation.NewDockerCommand",
            "addEnabled": this.addEnabled,
            "deleteEnabled": this.deleteEnabled,
            "edgeId": getId(this.edge),
            "dockerPositionArray": this.pos,
            "dockerId": getDockerId(this.docker)
        };
        return cmd;      
    } ,
    createFromCommandData: function createFromCommandData(facade, cmdData){
        var addEnabled = cmdData.addEnabled;
        var deleteEnabled = cmdData.deleteEnabled;
        
        var canvas = facade.getCanvas();
        var getShape = canvas.getChildShapeByResourceId.bind(canvas);

        var edge = getShape(cmdData.edgeId);
        var docker;

        if (typeof edge === 'undefined') {
            // Trying to add a docker to a already deleted edge.
            return undefined;
        }      
        if (deleteEnabled) {
            for (var i = 0; i < edge.dockers.length; i++) {
                if (edge.dockers[i].id == cmdData.dockerId) {
                    docker = edge.dockers[i];                
                }
            }
        } 
        if (addEnabled) {
            var dockerPositionArray = cmdData.dockerPositionArray;
		    var position = canvas.node.ownerSVGElement.createSVGPoint();
		    position.x = dockerPositionArray.x;
		    position.y = dockerPositionArray.y;
        }
        var args = {
            "dockerId": cmdData.dockerId,
            "index": cmdData.index,
            "options": {}
        };
        return new ORYX.Core.Commands["DockerCreation.NewDockerCommand"](addEnabled, deleteEnabled, edge, docker, position, facade, args);
    },        
    getCommandName: function getCommandName() {
        return "DockerCreation.NewDockerCommand";
    },    
    getDisplayName: function getDisplayName() {
        if (this.addEnabled) {
            return "Docker added";
        }
        return "Docker deleted";
    },        
    getAffectedShapes: function getAffectedShapes() {
        return [this.edge];
    }
});

ORYX.Plugins.DockerCreation = Clazz.extend({
	
	construct: function( facade ){
		this.facade = facade;		
		this.active = false; //true-> a ghostdocker is shown; false->ghostdocker is hidden
		this.point = {x:0, y:0}; //Ghostdocker
        this.ctrlPressed = false;
        this.creationAllowed = true; // should be false if the addDocker button is pressed, otherwise there are always two dockers added when ALT+Clicking in docker-mode!
		
		//visual representation of the Ghostdocker
		this.circle = ORYX.Editor.graft("http://www.w3.org/2000/svg", null ,
				['g', {"pointer-events":"none"},
					['circle', {cx: "8", cy: "8", r: "3", fill:"yellow"}]]); 	
        this.facade.offer({
            keyCodes: [{
                keyCode: 18,
                keyAction: ORYX.CONFIG.KEY_ACTION_UP 
             }],
             functionality: this.keyUp.bind(this)
         });
        this.facade.offer({
            keyCodes: [{
                metaKeys: [ORYX.CONFIG.META_KEY_ALT],
                keyCode: 18,
                keyAction: ORYX.CONFIG.KEY_ACTION_DOWN 
             }],
             functionality: this.keyDown.bind(this)
         });
        this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEDOWN, this.handleMouseDown.bind(this));
		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEOVER, this.handleMouseOver.bind(this));
		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEOUT, this.handleMouseOut.bind(this));
		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEMOVE, this.handleMouseMove.bind(this));
        this.facade.registerOnEvent(ORYX.CONFIG.EVENT_DISABLE_DOCKER_CREATION, this.handleDisableDockerCreation.bind(this));
        this.facade.registerOnEvent(ORYX.CONFIG.EVENT_ENABLE_DOCKER_CREATION, this.handleEnableDockerCreation.bind(this));
		/*
		 * Double click is reserved for label access, so abort action
		 */
		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_DBLCLICK, function() { window.clearTimeout(this.timer); }.bind(this));
		/*
		 * click is reserved for selecting, so abort action when mouse goes up
		 */
		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEUP, function() { window.clearTimeout(this.timer); }.bind(this));
    },

    keyDown: function keyDown(event) {
        this.ctrlPressed = true;
    },

    keyUp: function keyUp(event) {
        this.ctrlPressed = false;
    	this.hideOverlay();
    	this.active = false;
    },
    
    handleDisableDockerCreation: function handleDisableDockerCreation(event) {
        this.creationAllowed = false;
    },
    
    handleEnableDockerCreation: function handleEnableDockerCreation(event) {
        this.creationAllowed = true;
    },

    /**
     * MouseOut Handler
     * 
     *hide the Ghostpoint when Leaving the mouse from an edge
     */
    handleMouseOut: function handleMouseOut(event, uiObj) {
    	if (this.active) {		
    		this.hideOverlay();
    		this.active = false;
    	}	
    },

    /**
     * MouseOver Handler
     * 
     *show the Ghostpoint if the edge is selected
     */
    handleMouseOver: function handleMouseOver(event, uiObj) {
        this.point.x = this.facade.eventCoordinates(event).x;
        this.point.y = this.facade.eventCoordinates(event).y;

        // show the Ghostdocker on the edge
        if (uiObj instanceof ORYX.Core.Edge && this.ctrlPressed && this.creationAllowed) {
            this.showOverlay(uiObj, this.point);
            //ghostdocker is active
            this.active = true;
        }
    },

    /**
     * MouseDown Handler
     * 
     *create a Docker when clicking on a selected edge
     */
    handleMouseDown: function handleMouseDown(event, uiObj) {
        if (this.ctrlPressed && this.creationAllowed && event.which==1) {
            if (uiObj instanceof ORYX.Core.Edge){
                this.addDockerCommand({
                    edge: uiObj,
                    event: event,
                    position: this.facade.eventCoordinates(event)
                });
                this.hideOverlay();
            } else if (uiObj instanceof ORYX.Core.Controls.Docker && uiObj.parent instanceof ORYX.Core.Edge) {
             //check if uiObj is not the first or last docker of its parent, if not so instanciate deleteCommand
            if ((uiObj.parent.dockers.first() !== uiObj) && (uiObj.parent.dockers.last() !== uiObj)) {
                this.deleteDockerCommand({
                    edge: uiObj.parent,
                    docker: uiObj
                });
            }
            }
        }
    },

    //
    /**
     * MouseMove Handler
     * 
     *refresh the ghostpoint when moving the mouse over an edge
     */
    handleMouseMove: function handleMouseMove(event, uiObj) {
        if (uiObj instanceof ORYX.Core.Edge && this.ctrlPressed && this.creationAllowed) {
            this.point.x = this.facade.eventCoordinates(event).x;
            this.point.y = this.facade.eventCoordinates(event).y;

            if (this.active) {
                //refresh Ghostpoint
                this.hideOverlay();
                this.showOverlay(uiObj, this.point);
            } else {
                this.showOverlay(uiObj, this.point);
            }
        }
    },

    /**
     * Command for creating a new Docker
     * 
     * @param {Object} options
     */
    addDockerCommand: function addDockerCommand(options){
        if(!options.edge)
            return;
        var args = {
            "options": options
        };
        var command = new ORYX.Core.Commands["DockerCreation.NewDockerCommand"](true, false, options.edge, options.docker, options.position, this.facade, args);    
        this.facade.executeCommands([command]);
    
        this.facade.raiseEvent({
                uiEvent: options.event,
                type: ORYX.CONFIG.EVENT_DOCKERDRAG
            }, options.docker );    
    },

    deleteDockerCommand: function deleteDockerCommand(options){
        if(!options.edge) {
            return;
        }
        
        var args = { "options": options };
        var command = new ORYX.Core.Commands["DockerCreation.NewDockerCommand"](false, true, options.edge, options.docker, options.position, this.facade, args);    
        this.facade.executeCommands([command]);
    },

    /**
     *show the ghostpoint overlay
     *
     *@param {Shape} edge
     *@param {Point} point
     */
    showOverlay: function showOverlay(edge, point) {
        if (this.facade.isReadOnlyMode()) {
            return;
        }
        
        this.facade.raiseEvent({
                type: ORYX.CONFIG.EVENT_OVERLAY_SHOW,
                id: "ghostpoint",
                shapes: [edge],
                node: this.circle,
                ghostPoint: point,
                dontCloneNode: true
        });
    },

    /**
     *hide the ghostpoint overlay
     */
    hideOverlay: function hideOverlay() {
        this.facade.raiseEvent({
            type: ORYX.CONFIG.EVENT_OVERLAY_HIDE,
            id: "ghostpoint"
        });
    }

});

