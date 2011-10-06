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

ORYX.Plugins.ShapeTooltip = ORYX.Plugins.AbstractPlugin.extend({
    
    _users: {},
    
    construct: function construct() {
        arguments.callee.$.construct.apply(this, arguments);
        
        this.facade.registerOnEvent(ORYX.CONFIG.EVENT_SHAPEADDED, this.addHoverListener.bind(this));
        this.facade.registerOnEvent(ORYX.CONFIG.EVENT_SHAPEDELETED, this.removeTooltip.bind(this));
        this.facade.registerOnEvent(ORYX.CONFIG.EVENT_FARBRAUSCH_NEW_INFOS, this.handleFarbrauschEvent.bind(this));
    },
    
    handleFarbrauschEvent: function handleFarbrauschEvent(evt) {
        for (var userId in evt.users) {
            if (!evt.users.hasOwnProperty(userId)) {
                return;
            }
            
            var evtUser = evt.users[userId];
            var user = this._users[userId];
            
            if (typeof user === "undefined" || evtUser.color !== user.color || evtUser.displayName !== user.displayName || evtUser.thumbnailUrl !== user.thumbnailUrl) {
                this._users[userId] = evtUser;
            }
        }
    },

    _getThumbnailUrlById: function _getThumbnailUrlById(id) {
        var user = this._users[id];
        if (user) {
            return user.thumbnailUrl;
        }
        return "https://wave.google.com/wave/static/images/unknown.jpg";
    },
    
    _getColorById: function _getColorById(id) {
        var user = this._users[id];
        if (user) {
            return user.color;
        }
        return "#000000";
    },
    
    _getDisplayNameById: function _getThumbnailUrlById(id) {
        var user = this._users[id];
        if (user) {
            return user.displayName;
        }
        return "Anonymous";
    },
    
    /*
     * JavaScript Pretty Date
     * Copyright (c) 2008 John Resig (jquery.com)
     * Licensed under the MIT license.
     */
    _prettyDate: function _prettyDate(time){
        var date = new Date();
        date.setTime(time);
        var diff = (((new Date()).getTime() - date.getTime()) / 1000);
                
        var day_diff = Math.floor(diff / 86400);
                
        if (isNaN(day_diff) || day_diff < 0) {
            return "from future";
        }
                
        return day_diff == 0 && (
                diff < 3 && "just now" ||
                diff < 60 && (Math.round(diff / 5) * 5) + " seconds ago" ||
                diff < 120 && "1 minute ago" ||
                diff < 3600 && Math.floor(diff / 60) + " minutes ago" ||
                diff < 7200 && "1 hour ago" ||
                diff < 86400 && Math.floor(diff / 3600) + " hours ago") ||
            day_diff == 1 && "Yesterday" ||
            day_diff < 7 && day_diff + " days ago" ||
            day_diff < 31 && Math.ceil(day_diff / 7) + " weeks ago" ||
            Math.round(day_diff / 365) == 1 && "1 year ago" ||
            Math.round(day_diff / 365) + " years ago";
    },
    
    removeTooltip: function removeTooltip(event) {
        var shape = event.shape;
        if ((shape instanceof ORYX.Core.AbstractShape) && (typeof this.associatedShape !== "undefined")) {
            if (shape.resourceId === this.associatedShape.resourceId) {
                var hover = {};
                clearTimeout(hover.timer);
                this.hideOverlay();
            }
        }
    },

    addHoverListener: function addHoverListener(event) {
        var shape = event.shape;
        if (shape instanceof ORYX.Core.AbstractShape) {
            var hover = {};
            var clearTooltip = function clearTooltip(event) {
                clearTimeout(hover.timer);
                this.hideOverlay();
            }

            var handleMouseOver = function handleMouseOver(event) {
                var createTooltip = function createTooltip() {
                    this.associatedShape = shape;
                    this.hideOverlay();
                    var border = 5;
                    var imageWidth = 40;
                    
                    if (!shape.metadata) {
                        return;
                    }
                    var displayName = this._getDisplayNameById(shape.getLastChangedBy());
                    var prettyDate = this._prettyDate(shape.getLastChangedAt());
                    var thumbnailUrl = this._getThumbnailUrlById(shape.getLastChangedBy());
                    var commandName = shape.getLastCommandDisplayName() || "Awesome stuff";
                    
                    var g = ORYX.Editor.graft("http://www.w3.org/2000/svg", null,
                        ['g', {"x": 0, "y": 0, "height": 55}]
                    );
                    var rect = ORYX.Editor.graft("http://www.w3.org/2000/svg", g,
                        ['rect', {"name": "bubble","x": border, "y": border, "rx": 5, "ry": 5, "width": 140, "height": (imageWidth + 8), "style": "fill: rgb(255, 250, 205); stroke-width:0.5; stroke:rgb(0,0,0)"}]
                    );
                    var avatar = ORYX.Editor.graft("http://www.w3.org/2000/svg", g,
                        ['image', {"x": border + 5, "y": border + 4, "width": imageWidth, "height": imageWidth}]
                    );
                    var username = ORYX.Editor.graft("http://www.w3.org/2000/svg", g,
                        ['text', {"x": border + (imageWidth + 11), "y": border + 15, "style": "stroke-width: 0; fill: rgb(42, 42, 42);"}]
                    );                 
                    username.textContent = displayName;
                    var command = ORYX.Editor.graft("http://www.w3.org/2000/svg", g,
                        ['text', {"x": border + (imageWidth + 11), "y": border + 28, "style": "stroke-width: 0; fill: rgb(127, 125, 102);", "font-size": 10}]
                    );
                    command.textContent = commandName;                    
                    var time = ORYX.Editor.graft("http://www.w3.org/2000/svg", g,
                        ['text', {"x": border + (imageWidth + 11), "y": border + 41, "style": "stroke-width: 0; fill: rgb(127, 125, 102);", "font-size": 10}]
                    );
                    time.textContent = prettyDate;
                    
                    var userNameEl = new ORYX.Core.SVG.Label({'textElement' : username});
                    var commandEl = new ORYX.Core.SVG.Label({'textElement' : command});
                    var timeEl = new ORYX.Core.SVG.Label({'textElement' : time});

                    var widthDisplayName = userNameEl._estimateTextWidth(displayName, 12);
                    var widthCommandName = commandEl._estimateTextWidth(commandName, 10);
                    var widthDate = timeEl._estimateTextWidth(prettyDate, 10);
                    
                    // adjust rect width to make username fit
                    rect.setAttribute("width", Math.max(Math.max(widthDisplayName, widthCommandName), widthDate) + (imageWidth + 26));
                    
                    var avatarCorners = ORYX.Editor.graft("http://www.w3.org/2000/svg", g,
                        ['rect', {"x": border + 5, "y": border + 4, "rx": 2, "ry": 2, "width": imageWidth, "height": imageWidth, "style": "fill-opacity: 0.0; stroke-width: 1; stroke: rgb(255, 250, 205)"}]
                    );
                    avatar.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', thumbnailUrl);
                    this.showOverlay(shape, null, g, "N", false, true);
                };
                hover.timer = setTimeout(createTooltip.bind(this), 600);
            };
            
            shape.node.addEventListener(ORYX.CONFIG.EVENT_MOUSEOVER, handleMouseOver.bind(this), true);
            shape.node.addEventListener(ORYX.CONFIG.EVENT_MOUSEOUT, clearTooltip.bind(this), true);
        }
    }
});