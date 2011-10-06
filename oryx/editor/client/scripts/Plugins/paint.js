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

ORYX.Plugins.Paint = ORYX.Plugins.AbstractPlugin.extend({
    construct: function construct(facade) {
        arguments.callee.$.construct.apply(this, arguments);
        
        this.facade.offer({
            name: ORYX.I18N.Paint.paint,
            description: ORYX.I18N.Paint.paintDesc,
            iconCls: 'pw-toolbar-button pw-toolbar-paint',
            keyCodes: [],
            functionality: this._togglePaint.bind(this),
            group: ORYX.I18N.Paint.group,
            isEnabled: function() { return true; },
            toggle: true,
            index: 0,
            visibleInViewMode: true
        });
        
        this.facade.offer({
            keyCodes: [{
                keyCode: 46, // delete key
                keyAction: ORYX.CONFIG.KEY_ACTION_DOWN
             }, {
                metaKeys: [ORYX.CONFIG.META_KEY_META_CTRL],
                keyCode: 8, // backspace key
                keyAction: ORYX.CONFIG.KEY_ACTION_DOWN
            }],
            functionality: this._onRemoveKey.bind(this)
        });
        
        this.users = [];
        this.editMode = false;
        this.showCanvas = false;

        this.facade.registerOnEvent(ORYX.CONFIG.EVENT_PAINT_NEWSHAPE, this._onNewShape.bind(this));
        this.facade.registerOnEvent(ORYX.CONFIG.EVENT_PAINT_REMOVESHAPE, this._onRemoveShape.bind(this));
        this.facade.registerOnEvent(ORYX.CONFIG.EVENT_CANVAS_RESIZED, this._onCanvasResized.bind(this));
        this.facade.registerOnEvent(ORYX.CONFIG.EVENT_CANVAS_RESIZE_SHAPES_MOVED, this._onCanvasResizedShapesMoved.bind(this));
        this.facade.registerOnEvent(ORYX.CONFIG.EVENT_CANVAS_ZOOMED, this._onCanvasZoomed.bind(this));
        this.facade.registerOnEvent(ORYX.CONFIG.EVENT_FARBRAUSCH_NEW_INFOS, this._updateFarbrauschInfos.bind(this));
        this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MODE_CHANGED, this._onModeChanged.bind(this));
    },

    onLoaded: function onLoaded() {
        this.paintCanvas = this._createCanvas();
        this._loadBrush(this.paintCanvas);
        this.toolbar = this._createToolbar();
    },

    _onModeChanged: function _onModeChanged(event) {
        this.editMode = event.mode.isEditMode();
        if (event.mode.isPaintMode()) {
            this.paintCanvas.show();
            this._alignCanvasWithOryxCanvas();
        } else {
            this.paintCanvas.hide();
        }
        
        if (event.mode.isEditMode() && event.mode.isPaintMode()) {
            if (typeof this.toolbar !== "undefined") {
                this.toolbar.show();
            }
            this.paintCanvas.activate();
        } else {
            if (typeof this.toolbar !== "undefined") {
                this.toolbar.hide();
            }
            this.paintCanvas.deactivate();
        }
    },

    _activateTool: function _activateTool(toolClass) {
        this.paintCanvas.setTool(toolClass);
    },
    
    _updateFarbrauschInfos: function _updateFarbrauschInfos(event) {
        this.users = event.users;
        
        this.paintCanvas.updateColor();
        this.paintCanvas.redraw();
    },
    
    _onCanvasZoomed: function _onCanvasZoomed(event) {
        if (typeof this.paintCanvas === 'undefined') {
            return;
        }
        
        this.paintCanvas.scale(event.zoomLevel);
        this._alignCanvasWithOryxCanvas();
    },
    
    _createCanvas: function _createCanvas() {
        var canvas = this.facade.getCanvas();

        var options = {
            canvasId: "freehand-paint",
            width: canvas.bounds.width(),
            height: canvas.bounds.height(),
            shapeDrawnCallback: this._onShapeExistenceCommand.bind(this, "Paint.DrawCommand"),
            shapeDeletedCallback: this._onShapeExistenceCommand.bind(this, "Paint.RemoveCommand"),
            getUsersCallback: function getUsers() { return this.users; }.bind(this),
            getUserIdCallback: function getUserId() { return this.facade.getUser().id; }.bind(this),
            isInEditModeCallback: function isInEditModeCallback() { return this.editMode; }.bind(this)
        };
        var paintCanvas = new ORYX.Plugins.Paint.PaintCanvas(options);

        var canvasContainer = canvas.rootNode.parentNode;
        canvasContainer.appendChild(paintCanvas.getDomElement());
        return paintCanvas;
    },
    
    _loadBrush : function _loadBrush(paintCanvas) {
        var img = new Image();
        img.onload = paintCanvas.setBrush.bind(paintCanvas, img, 2);
        img.src = this._getBasePath() + "/../oryx/editor/images/paint/brush.png";
    },
    
    _createToolbar: function _createToolbar() {
        var basePath = this._getBasePath();
        var toolbar = new ORYX.Plugins.Paint.Toolbar();
        toolbar.addButton(basePath + "/../oryx/editor/images/paint/line.png",
                          this._activateTool.bind(this, ORYX.Plugins.Paint.PaintCanvas.LineTool));
        toolbar.addButton(basePath + "/../oryx/editor/images/paint/arrow.png",
                          this._activateTool.bind(this, ORYX.Plugins.Paint.PaintCanvas.ArrowTool));
        toolbar.addButton(basePath + "/../oryx/editor/images/paint/box.png",
                          this._activateTool.bind(this, ORYX.Plugins.Paint.PaintCanvas.BoxTool));
        toolbar.addButton(basePath + "/../oryx/editor/images/paint/ellipse.png",
                          this._activateTool.bind(this, ORYX.Plugins.Paint.PaintCanvas.EllipseTool));
        toolbar.hide();
        return toolbar;
    },
    
    _getBasePath: function _getBasePath() {
        var lastSlash = window.location.href.lastIndexOf("/");
        return window.location.href.substring(0, lastSlash);
    },
    
    _togglePaint: function _togglePaint() {
        this.showCanvas = !this.showCanvas;
        
        this.facade.raiseEvent({
            type: ORYX.CONFIG.EVENT_PAINT_CANVAS_TOGGLED,
            paintActive: this.showCanvas
        });
    },

    _onNewShape: function _onNewShape(event) {
        this.paintCanvas.addShapeAndDraw(event.shape);
    },
    
    _onRemoveShape: function _onRemoveShape(event) {
        if (this.editMode) {
            this.paintCanvas.removeShape(event.shapeId);
        }
    },
    
    _onShapeExistenceCommand: function _onShapeExistenceCommand(cmdName, shape) {
        var cmd = new ORYX.Core.Commands[cmdName](shape, this.facade);
        this.facade.executeCommands([cmd]);
   },
   
   _onCanvasResized: function _onCanvasResized(event) {
        this.paintCanvas.resize(event.bounds.width(), event.bounds.height());
        this._alignCanvasWithOryxCanvas();
    },
    
    _onCanvasResizedShapesMoved: function _onCanvasResizedShapesMoved(event) {
        this.paintCanvas.moveShapes(event.offsetX, event.offsetY);
    },
    
    _onRemoveKeyPressed: function _onRemoveKeyPressed(event) {
        if (this.editMode) {
            this.paintCanvas.deleteCurrentShape();
        }
    },
    
    _alignCanvasWithOryxCanvas: function _alignCanvasWithOryxCanvas() {
        var canvas = this.facade.getCanvas().rootNode.parentNode;
        var offset = jQuery(canvas).offset();
        this.paintCanvas.setOffset(offset);
    },
    
    _onRemoveKey: function _onRemoveKey(event) {
        this.paintCanvas.removeShapesUnderCursor();
    }
});

ORYX.Plugins.Paint.Toolbar = Clazz.extend({
    construct: function construct() {
        var canvasContainer = $$(".ORYX_Editor")[0].parentNode;
        this.toolsList = document.createElement('div');
        this.toolsList.id = 'paint-toolbar';
        canvasContainer.appendChild(this.toolsList);

        this.buttonsAdded = false;
    },

    show: function show() {
        this.toolsList.show();
    },

    hide: function hide() {
        this.toolsList.hide();
    },

    addButton: function addButton(image, callback) {
        var button = this._createButton(image);
        this.toolsList.appendChild(button);

        var onClick = this._onButtonClicked.bind(this, button, callback);
        jQuery(button).click(onClick);

        // one button has to be pressed at all times,
        // so if this is the first one, press it
        if (!this.buttonsAdded) {
            onClick();
            this.buttonsAdded = true;
        }
    },

    _createButton: function _createButton(image) {
        var newElement = document.createElement('div');
        newElement.className = 'paint-toolbar-button';
        var stencilImage = document.createElement('div');
        stencilImage.style.backgroundImage = 'url(' + image + ')';
        newElement.appendChild(stencilImage);
        return newElement;
    },

    _onButtonClicked: function _onButtonClicked(element, callback) {
        jQuery(this.toolsList).children().removeClass("paint-toolbar-button-pressed");
        jQuery(element).addClass("paint-toolbar-button-pressed");
        callback();
    }
});

ORYX.Plugins.Paint.CanvasWrapper = Clazz.extend({
    construct: function construct(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.scalingFactor = 1.0;
        this.color = ORYX.CONFIG.FARBRAUSCH_DEFAULT_COLOR;
    },
    
    clear: function clear() {
        this.canvas.width = this.canvas.width;
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.scale(this.scalingFactor);
    },
    
    resize: function resize(width, height) {
        this.canvas.style.width = width + "px";
        this.canvas.style.height = height + "px";
        this.canvas.width = width;
        this.canvas.height = height;
    },
    
    scale: function scale(factor) {
        this.context.scale(factor, factor);
        this.scalingFactor = factor;
    },
    
    setStyle: function setStyle(width, color) {
        this.context.lineJoin = 'round';
        this.context.lineWidth = width;
        this.context.strokeStyle = color;
        this._setColor(color);
    },
    
    setBrush: function setBrush(brushImage, dist) {
        this.origBrush = brushImage;
        this.brush = this._colorBrush(brushImage, this.color);
        this.brushDist = dist;
    },
    
    drawLine: function drawLine(ax, ay, bx, by) {
        (this.brush ? this._brushLine : this._simpleLine).apply(this, arguments);
    },
    
    drawEllipse: function drawLine(ax, ay, bx, by) {
        (this.brush ? this._brushEllipse : this._simpleEllipse).apply(this, arguments);
    },
    
    drawArrow: function drawArrow(ax, ay, bx, by) {
        this.drawLine.apply(this, arguments);
        var angle = -Math.atan2(by - ay, bx - ax) + Math.PI / 2.0;
        var tipLength = 20;

        var tip1Angle = angle + 3/4 * Math.PI;
        var tip1dx = Math.sin(tip1Angle) * tipLength;
        var tip1dy = Math.cos(tip1Angle) * tipLength;
        this.drawLine(bx, by, bx + tip1dx, by + tip1dy);
        
        var tip2Angle = angle - 3/4 * Math.PI;
        var tip2dx = Math.sin(tip2Angle) * tipLength;
        var tip2dy = Math.cos(tip2Angle) * tipLength;
        this.drawLine(bx, by, bx + tip2dx, by + tip2dy);
    },
    
    strokeRect: function strokeRect(x, y, width, height) {
        this.drawLine(x, y, x + width, y);
        this.drawLine(x, y + height, x + width, y + height);
        this.drawLine(x, y, x, y + height);
        this.drawLine(x + width, y, x + width, y + height);
    },
    
    _setColor: function _setColor(color) {
        if (typeof this.origBrush !== "undefined") {
            this.brush = this._colorBrush(this.origBrush, color);
        }
        this.color = color;
    },
    
    _simpleLine: function _simpleLine(ax, ay, bx, by) {
        this.context.beginPath();
        this.context.moveTo(ax, ay);
        this.context.lineTo(bx, by);
        this.context.stroke();
    },
    
    _brushLine: function _brushLine(ax, ay, bx, by) {
        var makePoint = function(x, y) { return {x: x, y: y}; };
        var totalDist = ORYX.Core.Math.getDistancePointToPoint(makePoint(ax, ay), makePoint(bx, by));
        var steps = totalDist / this.brushDist;
        
        var totalVec = makePoint(bx - ax, by - ay);
        var divide = function(vec, by) { return {x: vec.x / by, y: vec.y / by}; };
        var delta = divide(totalVec, steps);
        
        for (var i = 0; i < steps; i++) {
            this.context.drawImage(this.brush,
                                   ax + i * delta.x - this.brush.width / 2,
                                   ay + i * delta.y - this.brush.height / 2);
        }
    },
    
    _simpleEllipse: function _simpleEllipse(x1, y1, x2, y2) {
        // code by http://canvaspaint.org/blog/2006/12/ellipse/
        var ell = this._getEllipseInRectParams.apply(this, arguments);
        var KAPPA = 4 * ((Math.sqrt(2) -1) / 3);

        this.context.beginPath();
        this.context.moveTo(ell.cx, ell.cy - ell.ry);
        this.context.bezierCurveTo(ell.cx + (KAPPA * ell.rx), ell.cy - ell.ry, ell.cx + ell.rx, ell.cy - (KAPPA * ell.ry), ell.cx + ell.rx, ell.cy);
        this.context.bezierCurveTo(ell.cx + ell.rx, ell.cy + (KAPPA * ell.ry), ell.cx + (KAPPA * ell.rx), ell.cy + ell.ry, ell.cx, ell.cy + ell.ry);
        this.context.bezierCurveTo(ell.cx - (KAPPA * ell.rx), ell.cy + ell.ry, ell.cx - ell.rx, ell.cy + (KAPPA * ell.ry), ell.cx - ell.rx, ell.cy);
        this.context.bezierCurveTo(ell.cx - ell.rx, ell.cy - (KAPPA * ell.ry), ell.cx - (KAPPA * ell.rx), ell.cy - ell.ry, ell.cx, ell.cy - ell.ry);
        this.context.stroke();
    },
    
    _brushEllipse: function _brushEllipse(x1, y1, x2, y2) {
        var ell = this._getEllipseInRectParams.apply(this, arguments);
        var delta = 2 * Math.PI / Math.max(ell.rx, ell.ry);

        var points = [];
        for (var t = 0; t < 2 * Math.PI; t += delta) {
            points.push({
                x: ell.cx + Math.cos(t) * ell.rx,
                y: ell.cy + Math.sin(t) * ell.ry
            });
        }

        var cur, next;
        for (var i = 0; i < points.length - 1; i++) {
            cur = points[i];
            next = points[i + 1];
            this._brushLine(cur.x, cur.y, next.x, next.y);
        }
        this._brushLine(points.last().x, points.last().y, points.first().x, points.first().y);
    },
    
    _getEllipseInRectParams: function _getEllipseInRectParams(x1, y1, x2, y2) {
        var rx = (x2 - x1) / 2;
        var ry = (y2 - y1) / 2;
        return {
            rx: rx,
            ry: ry,
            cx: x1 + rx,
            cy: y1 + ry 
        };
    },
    
    _colorBrush: function _colorBrush(brush, color) {
        var tempCanvas = this._createTempCanvas(brush.width, brush.height);
        var context = tempCanvas.getContext("2d");
        context.drawImage(brush, 0, 0);
        this._recolorCanvas(context, color, brush.width, brush.height);
        return tempCanvas;
    },
    
    _createTempCanvas: function _createTempCanvas(width, height) {
        var tempCanvas = document.createElement("canvas");
        tempCanvas.style.width = width + "px";
        tempCanvas.style.height = height + "px";
        tempCanvas.width = width;
        tempCanvas.height = height;
        return tempCanvas;
    },
    
    _recolorCanvas: function _recolorCanvas(context, color, width, height) {
        var imgData = context.getImageData(0, 0, width, height);
        
        var rgb = this._getRGB(color);
        var data = imgData.data;
        for (var i = 0; i < data.length; i += 4) {
            data[i] = data[i] / 255 * rgb.r;
            data[i+1] = data[i+1] / 255 * rgb.g;
            data[i+2] = data[i+2] / 255 * rgb.b;
        }
        
        context.putImageData(imgData, 0, 0);
    },
    
    _getRGB: function _getRGB(hexColor) {
        var hex = hexColor.substring(1, 7); // cut off leading #

        return {
            r: parseInt(hex.substring(0, 2), 16),
            g: parseInt(hex.substring(2, 4), 16),
            b: parseInt(hex.substring(4, 6), 16)
        };
    }
});

ORYX.Plugins.Paint.PaintCanvas = Clazz.extend({
    construct: function construct(options) {
        this.container = this._createCanvasContainer(options.canvasId, options.width, options.height);        

        var viewCanvas = this._createCanvas("view-canvas");
        this.viewCanvas = new ORYX.Plugins.Paint.CanvasWrapper(viewCanvas);
        this.viewCanvas.resize(options.width, options.height);
        this.container.appendChild(viewCanvas);

        var paintCanvas = this._createCanvas("paint-canvas");
        this.paintCanvas = new ORYX.Plugins.Paint.CanvasWrapper(paintCanvas);
        this.paintCanvas.resize(options.width, options.height);
        this.container.appendChild(paintCanvas);        
        
        this.shapes = [];
        
        this.shapeDrawnCallback = options.shapeDrawnCallback;
        this.shapeDeletedCallback = options.shapeDeletedCallback;
        this.getUsersCallback = options.getUsersCallback;
        this.getUserIdCallback = options.getUserIdCallback;
        this.isInEditModeCallback = options.isInEditModeCallback;

        this.scalingFactor = 1.0;
        this.width = options.width;
        this.height = options.height;

        this.mouseState = new ORYX.Plugins.Paint.PaintCanvas.MouseState(paintCanvas, {
            onMouseDown: this._onMouseDown.bind(this),
            onMouseUp: this._onMouseUp.bind(this),
            onMouseMove: this._onMouseMove.bind(this)
        });
    },
    
    activate: function activate() {
        jQuery(this.container).addClass("paint-canvas-container-active");
    },
    
    deactivate: function deactivate() {
        jQuery(this.container).removeClass("paint-canvas-container-active");
        this.currentAction.mouseUp(this.mouseState.parameters.pos);
        this.paintCanvas.clear();
    },

    setTool: function setTool(toolClass) {
        var color = this._getColor(this.getUserIdCallback());
        this.currentAction = new toolClass(this.getUserIdCallback.bind(this), color, this.paintCanvas, this._onShapeDone.bind(this));
    },
    
    setBrush: function setBrush(brushImage, dist) {
        this.viewCanvas.setBrush(brushImage, dist);
        this.paintCanvas.setBrush(brushImage, dist);
        this._redrawShapes();
    },
    
    scale: function scale(factor) {
        this._setDimensions(this.width * factor, this.height * factor, factor);
        this._redrawShapes();
        this.scalingFactor = factor;
    },
    
    setPosition: function setPosition(top, left) {
        this.container.style.top = top + 'px';
        this.container.style.left = left + 'px';
    },
        
    getDomElement: function getDomElement() {
        return this.container;
    },
    
    setOffset: function setOffset(offset) {
        jQuery(this.container).offset(offset);
    },
    
    addShapeAndDraw: function addShapeAndDraw(shape) {
        this.shapes.push(shape);
        this._drawShape(this.viewCanvas, shape);
    },
    
    removeShape: function removeShape(shapeId) {
        this.shapes = this.shapes.reject(function(s) { return s.id === shapeId; });
        this.redraw();
    },
    
    removeShapesUnderCursor: function removeShapesUnderCursor() {
        this._getShapesUnderCursor().each(function removeShape(s) {
            this.shapeDeletedCallback(s);
        }.bind(this));
        
        this.paintCanvas.clear();
    },
    
    hide: function hide() {
        this.container.style.display = "none";
    },
    
    show: function show() {
        this.container.style.display = "block";
    },
    
    isVisible: function isVisible() {
        return this.container.style.display !== "none";
    },
    
    redraw: function redraw() {
        this.viewCanvas.clear();
        this._redrawShapes();
    },
    
    moveShapes: function moveShapes(x, y) {
        this.shapes.each(function moveShape(s) {
            s.move(x, y);
        });
        
        if (typeof this.currentAction !== "undefined") {
            this.currentAction.move(x, y);
        }

        this.viewCanvas.clear();
        this.paintCanvas.clear();
        this._redrawShapes();
    },
    
    resize: function resize(width, height) {
        this.width = width;
        this.height = height;
        this._setDimensions(width * this.scalingFactor, height * this.scalingFactor, this.scalingFactor);
        this._redrawShapes();
    },
    
    updateColor: function updateColor() {
        var color = this._getColor(this.getUserIdCallback());
        this.currentAction.setColor(color);
    },
    
    _onMouseDown: function _onMouseDown(params) {
        if (params.inside && this.isInEditModeCallback()) {
            this.currentAction.mouseDown(this._translateMouse(params.pos));
        }
    },
    
    _onMouseMove: function _onMouseMove(params) {
        if (!params.inside || !this.isInEditModeCallback()) {
            return;
        }
        
        if (this.isInEditModeCallback()) {
            if (params.mouseDown) {
                this.currentAction.mouseMove(this._translateMouse(params.pos));
            } else {
                this.paintCanvas.clear();
                this._highlightShapesUnderCursor();
            }
        }
    },
    
    _onMouseUp: function _onMouseUp(params) {
        this.currentAction.mouseUp(this._translateMouse(params.pos));
    },
    
    _onShapeDone: function _onShapeDone(shape) {
        if (typeof this.shapeDrawnCallback === "function") {
            this.shapeDrawnCallback(shape);
        }
        this.paintCanvas.clear();
    },
    
    _highlightShapesUnderCursor: function _highlightShapesUnderCursor() {
        this._getShapesUnderCursor().each(function drawShape(s) {
            this._drawShape(this.paintCanvas, s, 3);
        }.bind(this));
    },
    
    _getShapesUnderCursor: function _getShapesUnderCursor() {
        if (!this.mouseState.parameters.inside) {
            return [];
        }

        return this.shapes.select(function isUnderCursor(s) {
            return s.isUnderCursor(this._translateMouse(this.mouseState.parameters.pos));
        }.bind(this));
    },

    _redrawShapes: function _redrawShapes() {
        for (var i = 0; i < this.shapes.length; i++) {
            this._drawShape(this.viewCanvas, this.shapes[i]);
        }
        
        if (typeof this.currentAction !== "undefined") {
            this.currentAction.redraw();
        }
    },
    
    _getColor: function _getColor(userId) {
        var user = this._getUser(userId);
        if (typeof user  === 'undefined' || typeof user.color  === 'undefined') {
            return ORYX.CONFIG.FARBRAUSCH_DEFAULT_COLOR;
        }
        return user.color;
    },
    
    _getUser: function _getUser(id) {
        return this.getUsersCallback()[id];
    },
    
    _setDimensions: function _setDimensions(width, height, factor) {
        this._resizeDiv(this.container, width, height);
        this.paintCanvas.resize(width, height);
        this.paintCanvas.scale(factor);
        this.viewCanvas.resize(width, height);
        this.viewCanvas.scale(factor);
    },
    
    _drawShape: function _drawShape(canvas, shape, width) {
        var shapeColor = this._getColor(shape.creatorId);
        shape.draw(canvas, shapeColor, width);
    },
    
    _createCanvasContainer: function _createCanvasContainer(canvasId, width, height) {
        var container = document.createElement('div');
        container.className = "paint-canvas-container";
        container.id = canvasId;
        container.style.width = width + "px";
        container.style.height = height + "px";
        return container;
    },
    
    _createCanvas: function _createCanvas(id, width, height) {
        var canvas = document.createElement('canvas');
        canvas.className = "paint-canvas";
        canvas.id = id;
        return canvas;
    },
    
    _resizeDiv: function _resizeDiv(div, width, height) {
        div.style.width = width + "px";
        div.style.height = height + "px";
    },
      
    _translateMouse: function _translateMouse(pos) {
        if (typeof pos === "undefined") {
            return undefined;
        }
        
        return { left: pos.left / this.scalingFactor,
                 top: pos.top / this.scalingFactor };
    }
});


ORYX.Plugins.Paint.PaintCanvas.MouseState = Clazz.extend({
    construct: function construct(element, callbacks) {
        this.element = element;
        this.callbacks = callbacks;
        this.parameters = {
            inside: undefined,
            mouseDown: false,
            pos: undefined
        };
        
        document.documentElement.addEventListener("mousedown", this._onMouseDown.bind(this), false);
        window.addEventListener("mousemove", this._onMouseMove.bind(this), true);
        window.addEventListener("mouseup", this._onMouseUp.bind(this), true);
        jQuery(element).mouseleave = this._onMouseLeave.bind(this);
    },
    
    _onMouseDown: function _onMouseDown(event) {
        if (this._isInside(event)) {
            document.onselectstart = function () { return false; };
            this.parameters.mouseDown = true;
       } else {
            this.parameters.mouseDown = false;
       }
       
       this._rememberPosition(event);
       this._callback("onMouseDown");
    },

    _onMouseMove: function _onMouseMove(event) {
        this._rememberPosition(event);
        this._callback("onMouseMove");
    },

    _onMouseUp: function _onMouseUp(event) {
        if (this.parameters.mouseDown) {            
            document.onselectstart = function () { return true; };
            this.parameters.mouseDown = false;
        }
        this._rememberPosition(event);
        this._callback("onMouseUp");
    },
    
    _onMouseLeave: function _onMouseLeave(event) {
        this.parameters.mouseDown = false;
    },
    
    _rememberPosition: function _rememberPosition(event) {
        this.parameters.inside = this._isInside(event);
        this.parameters.pos = this._isInside(event) ? { left: event.layerX, top: event.layerY } : undefined;
    },
    
    _isInside: function _isInside(event) {
        return (event.target === this.element);
    },
    
    _callback: function _callback(name) {
        if (typeof this.callbacks[name] === "function") {
            this.callbacks[name](this.parameters);
        }
    }
});

ORYX.Plugins.Paint.PaintCanvas.Tool = Clazz.extend({
    construct: function construct(creatorCallback, color, canvas, doneCallback) {
        this.done = doneCallback;
        this.getCreator = creatorCallback;
        this.canvas = canvas;
        this.color = color;
    },
    
    getColor: function getColor() {
        return this.color;
    },
    
    setColor: function setColor(color) {
        this.color = color;
    }
});

ORYX.Plugins.Paint.PaintCanvas.LineTool = ORYX.Plugins.Paint.PaintCanvas.Tool.extend({
    construct: function construct(creatorCallback, color, canvas, doneCallback) {
        arguments.callee.$.construct.apply(this, arguments);
        this._reset();
    },

    mouseDown: function mouseDown(pos) {
        this._addPoint(pos.left, pos.top);
        this.prevX = pos.left;
        this.prevY = pos.top;
    },
    
    mouseUp: function mouseUp(pos) {
        if (typeof this.prevX !== "undefined" &&
            typeof this.prevY !== "undefined") {
            var shape = new ORYX.Plugins.Paint.PaintCanvas.Line(this.getCreator(), this.points);
            this.done(shape);
        }
        this._reset();
    },
    
    mouseMove: function mouseMove(pos) {
        this._addPoint(pos.left, pos.top);
        if (typeof this.prevX !== "undefined" &&
            typeof this.prevY !== "undefined") {
                this._drawLineSegment(this.prevX, this.prevY, pos.left, pos.top);
        }
        this.prevX = pos.left;
        this.prevY = pos.top;
    },
    
    redraw: function redraw() {
        var i;
        var cur, next;
        for (i = 0; i < this.points.length - 1; i++) {
            cur = this.points[i];
            next = this.points[i + 1];
            this._drawLineSegment(cur.x, cur.y, next.x, next.y);
        }
    },
    
    move: function move(x, y) {
        this.points.each(function movePoint(p) {
            p.x += x;
            p.y += y;
        });
        
        this.prevX += x;
        this.prevY += y;
    },
    
    _drawLineSegment: function _drawLineSegment(x1, y1, x2, y2) {
        this.canvas.setStyle(1, this.getColor());
        this.canvas.drawLine(x1, y1, x2, y2);
    },
    
    _addPoint: function _addPoint(x, y) {
        this.points.push({ x: x, y: y });
    },
    
    _reset: function _reset() {
        this.points = [];
        this.prevX = undefined;
        this.prevY = undefined;
    }
});

ORYX.Plugins.Paint.PaintCanvas.TwoPointTool = ORYX.Plugins.Paint.PaintCanvas.Tool.extend({
    construct: function construct(creatorId, color, canvas, doneCallback, shapeClass) {
        arguments.callee.$.construct.call(this, creatorId, color, canvas, doneCallback);
        this.shapeClass = shapeClass;
        this._reset();
    },

    mouseDown: function mouseDown(pos) {
        this.start = pos;
    },
    
    mouseUp: function mouseUp(pos) {
        var shape;
        var endPos = pos || this.curEnd;
        if (typeof this.start !== "undefined" &&
            typeof endPos !== "undefined") {
            shape = new this.shapeClass(this.getCreator(), this.start, endPos);
            this.done(shape);
        }
        this._reset();
    },
    
    mouseMove: function mouseMove(pos) {
        if (typeof this.start === "undefined")
            return;
        
        this.curEnd = pos;
        this.canvas.clear();
        this.draw(this.canvas, this.start, pos);
    },
    
    redraw: function redraw() {
        if (typeof this.curEnd !== "undefined") {
            this.draw(this.canvas, this.start, this.curEnd);
        }
    },
    
    move: function move(x, y) {
        var movePoint = function movePoint(p) {
            if (typeof p !== "undefined") {
                p.left += x;
                p.top += y;
            }
        };
        
        movePoint(this.start);
        movePoint(this.curEnd);
    },
    
    _reset: function _reset() {
        this.start = undefined;
        this.curEnd = undefined;
    }
});

ORYX.Plugins.Paint.PaintCanvas.ArrowTool = ORYX.Plugins.Paint.PaintCanvas.TwoPointTool.extend({
    construct: function construct(creatorId, color, canvas, doneCallback) {
        arguments.callee.$.construct.call(this, creatorId, color, canvas, doneCallback, ORYX.Plugins.Paint.PaintCanvas.Arrow);
    },
    
    draw: function draw(canvas, start, end) {
        canvas.setStyle(1, this.getColor());
        canvas.drawArrow(start.left, start.top, end.left, end.top);
    }
});

ORYX.Plugins.Paint.PaintCanvas.BoxTool = ORYX.Plugins.Paint.PaintCanvas.TwoPointTool.extend({
    construct: function construct(creatorId, color, canvas, doneCallback) {
        arguments.callee.$.construct.call(this, creatorId, color, canvas, doneCallback, ORYX.Plugins.Paint.PaintCanvas.Box);
    },
    
    draw: function draw(canvas, start, end) {
        canvas.setStyle(1, this.getColor());
        canvas.strokeRect(start.left, start.top, end.left - start.left, end.top - start.top);
    }
});

ORYX.Plugins.Paint.PaintCanvas.EllipseTool = ORYX.Plugins.Paint.PaintCanvas.TwoPointTool.extend({
    construct: function construct(creatorId, color, canvas, doneCallback) {
        arguments.callee.$.construct.call(this, creatorId, color, canvas, doneCallback, ORYX.Plugins.Paint.PaintCanvas.Ellipse);
    },
    
    draw: function draw(canvas, start, end) {
        canvas.setStyle(1, this.getColor());
        canvas.drawEllipse(start.left, start.top, end.left, end.top);
    }
});

ORYX.Plugins.Paint.PaintCanvas.Shape = Clazz.extend({
    construct: function construct(creatorId, id) {
        this.id = id || ORYX.Editor.provideId();
        this.creatorId = creatorId;
    }
});

ORYX.Plugins.Paint.PaintCanvas.Line = ORYX.Plugins.Paint.PaintCanvas.Shape.extend({
    construct: function construct(creatorId, points, id) {
        arguments.callee.$.construct.call(this, creatorId, id);
        this.points = points.map(Object.clone);
    },

    draw: function draw(canvas, color, width) {
        var lines = this._getLines(this._smooth(this.points));
        
        canvas.setStyle(width || 1, color);

        lines.each(function drawLine(l) {
            canvas.drawLine(l.a.x, l.a.y, l.b.x, l.b.y);
        });
    },
    
    move: function move(x, y) {
        this.points.each(function movePoint(p) {
            p.x += x;
            p.y += y;
        });
    },
    
    isUnderCursor: function isUnderCursor(pos) {
        var lines = this._getLines(this.points);
        return lines.any(function isInLine(l) {
            return ORYX.Core.Math.isPointInLine(pos.left, pos.top, l.a.x, l.a.y, l.b.x, l.b.y, 10);
        });
    },
    
    pack: function pack() {
        return {
            id: this.id,
            type: "Line",
            creatorId: this.creatorId,
            points: this.points 
        };
    },
    
    unpack: function unpack(obj) {
        return new ORYX.Plugins.Paint.PaintCanvas.Line(obj.creatorId, obj.points, obj.id);
    },
    
    _getLines: function _getLines(points) {
        var lines = [];
        for (var i = 1; i < points.length; i++) {
            lines.push({ a: points[i-1],
                         b: points[i] });
        }
        return lines;
    },
    
    _smooth: function _smooth(points) {
        return this._mcMaster(this._fillPoints(points, 5));
    },
    
    _fillPoints: function _fillPoints(points, maxDist) {
        var out = [points[0]];
        for (var i = 1; i < points.length; i++) {
            var pos = points[i];
            var prevPos = points[i-1];
            var distX = pos.x - prevPos.x;
            var distY = pos.y - prevPos.y;
            var dist = Math.sqrt(distX*distX + distY*distY);
            
            if (dist > maxDist) {
                var pointsToInsert = Math.floor(dist / maxDist);
                var deltaX = distX / pointsToInsert;
                var deltaY = distY / pointsToInsert;
                for (var k = 0; k < pointsToInsert; k++) {
                    out.push({x: prevPos.x + k * deltaX,
                              y: prevPos.y + k * deltaY });
                }
            }
            
            out.push(pos);
        }
        
        return out;
    },
    
    _mcMaster: function _mcMaster(points) {
        var out = [];
        var lookAhead = 10;
        var halfLookAhead = Math.floor(lookAhead / 2);
        if (points.length < lookAhead) {
            return points;
        }
        
        for (var i = points.length - 1; i >= 0; i--) {
            if (i >= points.length - halfLookAhead || i <= halfLookAhead) {
                out = [points[i]].concat(out);
            } else {
                var accX = 0, accY = 0;
                for (var k = -halfLookAhead; k < -halfLookAhead + lookAhead; k++) {
                    accX += points[i + k].x;
                    accY += points[i + k].y;
                }
                out = [{x: accX / lookAhead,
                        y: accY / lookAhead}].concat(out);
            }
        }
        
        return out;
    }
});

ORYX.Plugins.Paint.PaintCanvas.TwoPointShape = ORYX.Plugins.Paint.PaintCanvas.Shape.extend({
    construct: function construct(creatorId, start, end, id) {
        arguments.callee.$.construct.call(this, creatorId, id);
        this.start = start;
        this.end = end;
    },
    
    move: function move(x, y) {
        var movePoint = function movePoint(p) {
            p.left += x;
            p.top += y;
        };
        
        movePoint(this.start);
        movePoint(this.end);
    },
    
    abstractPack: function abstractPack(typeName) {
        return {
            id: this.id,
            type: typeName,
            creatorId: this.creatorId,
            start: this.start,
            end: this.end
        };
    },
    
    abstractUnpack: function abstractUnpack(shapeClass, obj) {
        return new shapeClass(obj.creatorId, obj.start, obj.end, obj.id);
    }
});

ORYX.Plugins.Paint.PaintCanvas.Arrow = ORYX.Plugins.Paint.PaintCanvas.TwoPointShape.extend({
    construct: function construct(creatorId, start, end, id) {
        arguments.callee.$.construct.apply(this, arguments);
    },

    draw: function draw(canvas, color, width) {
        canvas.setStyle(width || 1, color);
        canvas.drawArrow(this.start.left, this.start.top, this.end.left, this.end.top);
    },
    
    isUnderCursor: function isUnderCursor(pos) {
        return ORYX.Core.Math.isPointInLine(pos.left, pos.top, this.start.left, this.start.top, this.end.left, this.end.top, 10);
    },
    
    pack: function pack() {
        return this.abstractPack("Arrow");
    },
    
    unpack: function unpack(obj) {
        return this.abstractUnpack(ORYX.Plugins.Paint.PaintCanvas.Arrow, obj);
    }
});

ORYX.Plugins.Paint.PaintCanvas.Box = ORYX.Plugins.Paint.PaintCanvas.TwoPointShape.extend({
    construct: function construct(creatorId, start, end, id) {
        arguments.callee.$.construct.apply(this, arguments);
    },
    
    draw: function draw(canvas, color, width) {
        canvas.setStyle(width || 1, color);
        canvas.strokeRect(this.start.left, this.start.top, this.end.left - this.start.left, this.end.top - this.start.top);
    },
    
    isUnderCursor: function isUnderCursor(pos) {
        var hitHorizontal1 = ORYX.Core.Math.isPointInLine(pos.left, pos.top, this.start.left, this.start.top, this.end.left, this.start.top, 10);
        var hitHorizontal2 = ORYX.Core.Math.isPointInLine(pos.left, pos.top, this.start.left, this.end.top, this.end.left, this.end.top, 10);
        var hitVertical1 = ORYX.Core.Math.isPointInLine(pos.left, pos.top, this.start.left, this.start.top, this.start.left, this.end.top, 10);
        var hitVertical2 = ORYX.Core.Math.isPointInLine(pos.left, pos.top, this.end.left, this.start.top, this.end.left, this.end.top, 10);
        return hitHorizontal1 || hitHorizontal2 || hitVertical1 || hitVertical2;
    },    
    
    pack: function pack() {
        return this.abstractPack("Box");
    },
    
    unpack: function unpack(obj) {
        return this.abstractUnpack(ORYX.Plugins.Paint.PaintCanvas.Box, obj);
    }
});

ORYX.Plugins.Paint.PaintCanvas.Ellipse = ORYX.Plugins.Paint.PaintCanvas.TwoPointShape.extend({
    construct: function construct(creatorId, start, end, id) {
        var upperLeft = {
            left: Math.min(start.left, end.left),
            top: Math.min(start.top, end.top)
        };
        var lowerRight = {
            left: Math.max(start.left, end.left),
            top: Math.max(start.top, end.top)
        };
        arguments.callee.$.construct.call(this, creatorId, upperLeft, lowerRight, id);
        
        var rx = (lowerRight.left - upperLeft.left)/2;
        var ry = (lowerRight.top - upperLeft.top)/2;
        var cx = upperLeft.left + rx;
        var cy = upperLeft.top + ry;
        this.isUnderCursor = function isUnderCursor(pos) {
            var insideInner = false;
            if (rx > 5 && ry > 5) {
                insideInner = ORYX.Core.Math.isPointInEllipse(pos.left, pos.top, cx, cy, rx - 5, ry - 5);
            }
            return !insideInner && ORYX.Core.Math.isPointInEllipse(pos.left, pos.top, cx, cy, rx + 10, ry + 10);
        };
    },

    draw: function draw(canvas, color, width) {
        canvas.setStyle(width || 1, color);
        canvas.drawEllipse(this.start.left, this.start.top, this.end.left, this.end.top);
    },
    
    pack: function pack() {
        return this.abstractPack("Ellipse");
    },
    
    unpack: function unpack(obj) {
        return this.abstractUnpack(ORYX.Plugins.Paint.PaintCanvas.Ellipse, obj);
    }
});

ORYX.Plugins.Paint.PaintCanvas.ShapeExistenceCommand = ORYX.Core.AbstractCommand.extend({
    construct: function construct(shape, facade) {
        arguments.callee.$.construct.call(this, facade);
        this.metadata.putOnStack = false;
        this.shape = shape;
    },
    
    getCommandData: function getCommandData() {
        return {
            "shape": this.shape.pack()
        };
    },
    
    abstractCreateFromCommandData: function abstractCreateFromCommandData(commandName, facade, commandObject) {
        var shape = ORYX.Plugins.Paint.PaintCanvas[commandObject.shape.type].prototype.unpack(commandObject.shape);
        return new ORYX.Core.Commands[commandName](shape, facade);
    },
    
    getAffectedShapes: function getAffectedShapes() {
        return [];
    },
    
    createShape: function createShape() {
        this.facade.raiseEvent({
            type: ORYX.CONFIG.EVENT_PAINT_NEWSHAPE,
            shape: this.shape
        });
    },
    
    deleteShape: function deleteShape() {
        this.facade.raiseEvent({
            type: ORYX.CONFIG.EVENT_PAINT_REMOVESHAPE,
            shapeId: this.shape.id
        });
    }
});

ORYX.Core.Commands["Paint.DrawCommand"] = ORYX.Plugins.Paint.PaintCanvas.ShapeExistenceCommand.extend({
    construct: function construct(shape, facade) {
        arguments.callee.$.construct.apply(this, arguments);
    },
    
    createFromCommandData: function createFromCommandData(facade, commandObject) {
        return this.abstractCreateFromCommandData("Paint.DrawCommand", facade, commandObject);
    },
    
    getCommandName: function getCommandName() {
        return "Paint.DrawCommand";
    },
    
    getDisplayName: function getDisplayName() {
        return "Drew on paint layer";
    },
        
    execute: function execute() {
        this.createShape();
    },
    
    rollback: function rollback() {
        this.deleteShape();
    }
});

ORYX.Core.Commands["Paint.RemoveCommand"] = ORYX.Plugins.Paint.PaintCanvas.ShapeExistenceCommand.extend({
    construct: function construct(shape, facade) {
        arguments.callee.$.construct.apply(this, arguments);
    },
    
    createFromCommandData: function createFromCommandData(facade, commandObject) {
        return this.abstractCreateFromCommandData("Paint.RemoveCommand", facade, commandObject);
    },
    
    getCommandName: function getCommandName() {
        return "Paint.RemoveCommand";
    },
    
    getDisplayName: function getDisplayName() {
        return "Erased something from paint layer";
    },
    
    execute: function execute() {
        this.deleteShape();
    },
    
    rollback: function rollback() {
        this.createShape();
    }
});
