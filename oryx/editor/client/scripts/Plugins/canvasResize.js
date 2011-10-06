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
ORYX.Core.Commands["CanvasResize.CanvasResizeCommand"] = ORYX.Core.AbstractCommand.extend({
    construct: function(position, extensionSize, facade) {
        arguments.callee.$.construct.call(this, facade);
        
        this.position = position;
        this.extensionSize = extensionSize;
        this.facade = facade;
    },
    
    getAffectedShapes: function getAffectedShapes() {
        return [];
    },
    
    getCommandName: function getCommandName() {
        return "CanvasResize.CanvasResizeCommand";
    },
    
    getDisplayName: function getDisplayName() {
        return "Canvas resized";
    },
    
    getCommandData: function getCommandData() {
        var commandData = {
            "position": this.position,
            "extensionSize": this.extensionSize
        };
        return commandData;
    },
    
    createFromCommandData: function createFromCommandData(facade, commandData) {
        var position = commandData.position;
        var extensionSize = commandData.extensionSize;

        return new ORYX.Core.Commands["CanvasResize.CanvasResizeCommand"](position, extensionSize, facade);
    },
    
    resizeCanvas: function(position, extensionSize, facade) {
        var canvas 		= facade.getCanvas();
        var b 			= canvas.bounds;
        var scrollNode 	= facade.getCanvas().getHTMLContainer().parentNode.parentNode;
        
        if( position == "E" || position == "W") {
            canvas.setSize({width: (b.width() + extensionSize)*canvas.zoomLevel, height: (b.height())*canvas.zoomLevel});

        } else if( position == "S" || position == "N") {
            canvas.setSize({width: (b.width())*canvas.zoomLevel, height: (b.height() + extensionSize)*canvas.zoomLevel});
        }

        if( position === "N" || position === "W") {
            var move = position === "N" ? {x: 0, y: extensionSize}: {x: extensionSize, y: 0 };

            // Move all children
            canvas.getChildNodes(false, function(shape) { shape.bounds.moveBy(move); });
            // Move all dockers, when the edge has at least one docked shape
            var edges = canvas.getChildEdges().findAll(function(edge) { return edge.getAllDockedShapes().length > 0; });
            var dockers = edges.collect(function(edge) { return edge.dockers.findAll(function(docker) { return !docker.getDockedShape(); }); }).flatten();
            dockers.each(function(docker) { docker.bounds.moveBy(move); });

            // scroll window
            if (position === "N")
                scrollNode.scrollTop += extensionSize * canvas.zoomLevel;
            else if (extensionSize > 0)
                scrollNode.scrollLeft += extensionSize * canvas.zoomLevel;
                

            // notify the other plugins that we have moved the shapes
            this.facade.raiseEvent({
                type		: ORYX.CONFIG.EVENT_CANVAS_RESIZE_SHAPES_MOVED,
                offsetX     : position === "W" ? extensionSize : 0,
                offsetY     : position === "N" ? extensionSize : 0
            });
        }
        
        this.facade.raiseEvent({
            type		: ORYX.CONFIG.EVENT_CANVAS_RESIZED,
            bounds      : b
        });
        
        canvas.update();
        //facade.updateSelection();
    },			
    execute: function() {
        this.resizeCanvas(this.position, this.extensionSize, this.facade);
        this.facade.updateSelection(this.isLocal());
    },
    rollback: function() {
        this.resizeCanvas(this.position, -this.extensionSize, this.facade);
        this.facade.updateSelection(this.isLocal());
    },
    update:function() {
    }
});

/**
 * This plugin is responsible for resizing the canvas.
 * @param {Object} facade The editor plugin facade to register enhancements with.
 */
ORYX.Plugins.CanvasResize = Clazz.extend({

    construct: function(facade) {
        this.facade = facade;

        //new ORYX.Plugins.CanvasResizeButton( this.facade, "N", this.resize.bind(this));
        //new ORYX.Plugins.CanvasResizeButton( this.facade, "W", this.resize.bind(this));
        new ORYX.Plugins.CanvasResizeButton( this.facade, "E", this.resize.bind(this));
        new ORYX.Plugins.CanvasResizeButton( this.facade, "S", this.resize.bind(this));

    },
    
    resize: function( position, shrink ) {    		
        var extensionSize = ORYX.CONFIG.CANVAS_RESIZE_INTERVAL;
        if(shrink) extensionSize = -extensionSize;
        var command = new ORYX.Core.Commands["CanvasResize.CanvasResizeCommand"](position, extensionSize, this.facade);
        
        this.facade.executeCommands([command]);		
    }  
});


ORYX.Plugins.CanvasResizeButton = Clazz.extend({
    offsetWidth: 60,
    
    construct: function(facade, position, callback) {
        this.facade = facade;
        this.position = position;
        
        this.canvas = facade.getCanvas();
        this.parentNode = this.canvas.getHTMLContainer().parentNode.parentNode.parentNode;
        this.scrollNode = this.parentNode.firstChild;
        this.svgRootNode = this.scrollNode.firstChild.firstChild;
        
        this.growButton = ORYX.Editor.graft("http://www.w3.org/1999/xhtml", this.parentNode, 
            ['div',
            { 'class': 'canvas_resize_indicator canvas_resize_indicator_grow' + ' ' + this.position ,
              'title': ORYX.I18N.RESIZE.tipGrow + ORYX.I18N.RESIZE[this.position]}]);
        this.shrinkButton = ORYX.Editor.graft("http://www.w3.org/1999/xhtml", this.parentNode, 
            ['div',
            { 'class': 'canvas_resize_indicator canvas_resize_indicator_shrink' + ' ' + this.position,
              'title':ORYX.I18N.RESIZE.tipShrink + ORYX.I18N.RESIZE[this.position]}]);

        // If the mouse move is over the button area, show the button
        this.scrollNode.addEventListener(ORYX.CONFIG.EVENT_MOUSEMOVE, this.handleMouseMove.bind(this), false );
        
        this.growButton.addEventListener(ORYX.CONFIG.EVENT_MOUSEOVER, this.showIfNotReadOnly.bind(this), true);
        this.shrinkButton.addEventListener(ORYX.CONFIG.EVENT_MOUSEOVER, this.showIfNotReadOnly.bind(this), true);
        
        this.parentNode.addEventListener(ORYX.CONFIG.EVENT_MOUSEOUT, function(event) { this.hideButtons(); }.bind(this) , true );

        // Hide the button initialy
        this.hideButtons();
        
        // Add the callbacks
        var growButtonCallback = this.getGrowButtonCallback(callback);
        this.growButton.addEventListener('click', growButtonCallback, true);
        
        var shrinkButtonCallback = this.getShrinkButtonCallback(callback);
        this.shrinkButton.addEventListener('click', shrinkButtonCallback, true);
    },
    
    isOverOffset: function isOverOffset(event) {			
        if (event.target != this.parentNode && event.target != this.scrollNode && event.target != this.scrollNode.firstChild && event.target != this.svgRootNode) {
            return false;
        }
        
        //if(inCanvas) {offSetWidth=30}else{offSetWidth=30*2}
        //Safari work around
        var X = event.layerX;
        var Y = event.layerY;
        if (X - this.scrollNode.scrollLeft < 0 || Ext.isSafari) {
            X += this.scrollNode.scrollLeft;
        }
        if (Y - this.scrollNode.scrollTop < 0 || Ext.isSafari) {
            Y += this.scrollNode.scrollTop;
        }

        if (this.position === "N") {
            return  Y < this.offsetWidth + this.scrollNode.firstChild.offsetTop;
        } else if (this.position === "W") {
            return X < this.offsetWidth + this.scrollNode.firstChild.offsetLeft;
        } else if (this.position === "E") {
            var offsetRight = this.scrollNode.offsetWidth - (this.scrollNode.firstChild.offsetLeft + this.scrollNode.firstChild.offsetWidth);
            if (offsetRight < 0) {
                offsetRight = 0;
            }
            return X > this.scrollNode.scrollWidth - offsetRight - this.offsetWidth;
        } else if (this.position === "S") {
            var offsetDown = this.scrollNode.offsetHeight - (this.scrollNode.firstChild.offsetTop  + this.scrollNode.firstChild.offsetHeight);
            if (offsetDown < 0) {
                offsetDown = 0;
            }
            return Y > this.scrollNode.scrollHeight - offsetDown - this.offsetWidth;
        }        
        return false;
    },
    
    showButtons: function showButtons() {    
        this.growButton.show(); 
        
        var x1, y1, x2, y2;
        try {
            var bb = this.canvas.getRootNode().childNodes[1].getBBox();
            x1 = bb.x;
            y1 = bb.y;
            x2 = bb.x + bb.width;
            y2 = bb.y + bb.height;
        } catch(e) {
            this.canvas.getChildShapes(true).each(function(shape) {
                var absBounds = shape.absoluteBounds();
                var ul = absBounds.upperLeft();
                var lr = absBounds.lowerRight()
                
                if(x1 == undefined) {
                    x1 = ul.x;
                    y1 = ul.y;
                    x2 = lr.x;
                    y2 = lr.y;
                } else {
                    x1 = Math.min(x1, ul.x);
                    y1 = Math.min(y1, ul.y);
                    x2 = Math.max(x2, lr.x);
                    y2 = Math.max(y2, lr.y);
                }
            });
        }
        
        var w = this.canvas.bounds.width();
        var h = this.canvas.bounds.height();
        
        var isEmpty = this.canvas.getChildNodes().size() === 0;
    
        if (this.position === "N" && (y1 > ORYX.CONFIG.CANVAS_RESIZE_INTERVAL || (isEmpty && h > ORYX.CONFIG.CANVAS_RESIZE_INTERVAL))) {
            this.shrinkButton.show();
        } else if (this.position === "E" && (w - x2) > ORYX.CONFIG.CANVAS_RESIZE_INTERVAL) {
            this.shrinkButton.show();
        } else if (this.position === "S" && (h - y2) > ORYX.CONFIG.CANVAS_RESIZE_INTERVAL) {
            this.shrinkButton.show();
        } else if (this.position === "W" && (x1 > ORYX.CONFIG.CANVAS_RESIZE_INTERVAL || (isEmpty && w > ORYX.CONFIG.CANVAS_RESIZE_INTERVAL))) {
            this.shrinkButton.show();
        } else {
            this.shrinkButton.hide();
        }
    },
    
    hideButtons: function hideButtons() {
        this.growButton.hide(); 
        this.shrinkButton.hide();
    },
    
    handleMouseMove: function handleMouseMove(event) { 
        if (this.isOverOffset(event) && !this.facade.isReadOnlyMode()) {
            this.showButtons();
        } else {
            this.hideButtons();
        }
    },
    
    showIfNotReadOnly: function showIfNotReadOnly() {
        if (!this.facade.isReadOnlyMode()) {
            this.showButtons();
        }
    },
    
    getGrowButtonCallback: function getGrowButtonCallback(buttonCallback) {
        return function growButtonCallback() {
            buttonCallback(this.position);
            this.showButtons();
        }.bind(this);
    },
    
    getShrinkButtonCallback: function getShrinkButtonCallback(buttonCallback) {
        return function shrinkButtonCallback() {
            buttonCallback(this.position, true);
            this.showButtons();
        }.bind(this);
    }
});
