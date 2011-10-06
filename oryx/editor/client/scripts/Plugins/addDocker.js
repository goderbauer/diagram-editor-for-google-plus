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

if(!ORYX.Plugins) {
	ORYX.Plugins = new Object();
}

ORYX.Plugins.AddDocker = Clazz.extend({

	/**
	 *	Constructor
	 *	@param {Object} Facade: The Facade of the Editor
	 */
	construct: function(facade) {
		this.facade = facade;

		this.facade.offer({
			'name':ORYX.I18N.AddDocker.add,
			'functionality': this.enableAddDocker.bind(this),
			'group': ORYX.I18N.AddDocker.group,
			'iconCls': 'pw-toolbar-button pw-toolbar-add-docker',
			'description': ORYX.I18N.AddDocker.addDesc,
			'index': 1,
            'toggle': true,
			'minShape': 0,
			'maxShape': 0,
            'visibleInViewMode': false
        });


		this.facade.offer({
			'name':ORYX.I18N.AddDocker.del,
			'functionality': this.enableDeleteDocker.bind(this),
			'group': ORYX.I18N.AddDocker.group,
			'iconCls': 'pw-toolbar-button pw-toolbar-remove-docker',
			'description': ORYX.I18N.AddDocker.delDesc,
			'index': 2,
            'toggle': true,
			'minShape': 0,
			'maxShape': 0,
            'visibleInViewMode': false
        });
		
		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEDOWN, this.handleMouseDown.bind(this));
	},
	
	enableAddDocker: function(button, pressed) {
        //FIXME This should be done while construct, but this isn't possible right now!
        this.addDockerButton = button;
        
        if (pressed) {
            this.facade.raiseEvent({
                'type': ORYX.CONFIG.EVENT_DISPLAY_SCHLAUMEIER,
                'message': "Try Alt+Click on an edge to add docker."
            });
            this.facade.raiseEvent({
                'type': ORYX.CONFIG.EVENT_DISABLE_DOCKER_CREATION
            });
        } else if (!(this.enabledDelete())){
            // AddDocker button was deselected, so allow for docker creation with ALT+click again.
            this.facade.raiseEvent({
                'type': ORYX.CONFIG.EVENT_ENABLE_DOCKER_CREATION
            });
        }
        // Unpress deleteDockerButton
        if(pressed && this.deleteDockerButton)
            this.deleteDockerButton.toggle(false);
	},
    enableDeleteDocker: function(button, pressed) {
        //FIXME This should be done while construct, but this isn't possible right now!
        this.deleteDockerButton = button;
        
        if (pressed) {
            this.facade.raiseEvent({
                'type': ORYX.CONFIG.EVENT_DISPLAY_SCHLAUMEIER,
                'message': "Try Alt+Click on a docker to remove it."
            });
            this.facade.raiseEvent({
                'type': ORYX.CONFIG.EVENT_DISABLE_DOCKER_CREATION
            });
        }
        
        // Unpress addDockerButton
        if(pressed && this.addDockerButton) {        
            this.addDockerButton.toggle(false);
        } else if (!pressed && !(this.enabledAdd())) {
            // if the deletebutton has been unpressed and the addbutton is not enabled, docker creation should be possible
            this.facade.raiseEvent({
                'type': ORYX.CONFIG.EVENT_ENABLE_DOCKER_CREATION
            });
        }
            
    },
    
    enabledAdd: function(){
        return this.addDockerButton ? this.addDockerButton.pressed : false;
    },
    enabledDelete: function(){
        return this.deleteDockerButton ? this.deleteDockerButton.pressed : false;
    },
	
	/**
	 * MouseDown Handler
	 *
	 */	
	handleMouseDown: function(event, uiObj) {
		if (this.enabledAdd() && uiObj instanceof ORYX.Core.Edge) {
            this.newDockerCommand({
                edge: uiObj,
                position: this.facade.eventCoordinates(event)
            });
		} else if (this.enabledDelete() &&	uiObj instanceof ORYX.Core.Controls.Docker && uiObj.parent instanceof ORYX.Core.Edge) {
            //check if uiObj is not the first or last docker of its parent, if not so instanciate deleteCommand
            if ((uiObj.parent.dockers.first() !== uiObj) && (uiObj.parent.dockers.last() !== uiObj)) {
                this.newDockerCommand({
                    edge: uiObj.parent,
                    docker: uiObj
                });
            }
		} else if ( this.enabledAdd() ){
            this.addDockerButton.toggle(false);
        } else if ( this.enabledDelete() ) {
            this.deleteDockerButton.toggle(false);
        }
	},
    
    // Options: edge (required), position (required if add), docker (required if delete)
    newDockerCommand: function newDockerCommand(options){
        if(!options.edge)
            return;        
        var args = {
        "options": options
        }
        var command = new ORYX.Core.Commands["DockerCreation.NewDockerCommand"](this.enabledAdd(), this.enabledDelete(), options.edge, options.docker, options.position, this.facade, args);
        this.facade.executeCommands([command]);
    }
});

