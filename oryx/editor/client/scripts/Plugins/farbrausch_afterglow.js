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

ORYX.Plugins.FarbrauschAfterglow = Clazz.extend({
    excludedTags: Array.from(["defs", "text", "g", "a"]),

    highlightClass: "highlight",
    highlightIdAttribute: "highlight-id",
    finalStrokeAttribute: "final-stroke",
    finalStrokeWidthAttribute: "final-stroke-width",
    finalFillAttribute: "final-fill",

    millisecondsForStep: 40,

    construct: function construct(facade) {
        this.users = {}; // maps user ids to user objects, which contain colors
		this.facade = facade;
        this.facade.registerOnEvent(ORYX.CONFIG.EVENT_FARBRAUSCH_NEW_INFOS, this.updateFarbrauschInfos.bind(this));
        this.facade.registerOnEvent(ORYX.CONFIG.EVENT_SHAPE_METADATA_CHANGED, this.handleShapeChanged.bind(this));
    },
        
    updateFarbrauschInfos: function updateFarbrauschInfos(evt) {
        this.users = evt.users;
    },
    
    handleShapeChanged: function handleShapeChanged(evt) {
        var shape = evt.shape;
        if (typeof shape.metadata !== "undefined") {
            var color = this.getColorForUserId(shape.getLastChangedBy());
            if (!shape.lastChangeWasLocal()) {
                this.showAfterglow(color, shape);
            }
        }
    },
    
    getColorForUserId: function getColorForUserId(userId) {
        var user = this.users[userId];
        if(typeof user  === 'undefined' || typeof user.color  === 'undefined') {
            return ORYX.CONFIG.FARBRAUSCH_DEFAULT_COLOR;
        }
        return user.color;
    },

    showAfterglow: function showAfterglow(color, shape) {
        var i;
        var svgNode = shape.node;
        var defsNode = this.facade.getCanvas().getDefsNode();        
        var highlightId = ORYX.Editor.provideId();
        var highlightNodes = this.getHighlightNodes(shape, defsNode);
        var highlightMarkers = this.getHighlightMarkersById(defsNode, shape.id);
        var startStrokeWidth = 3;


        for (i = 0; i < highlightNodes.length; i++) {
            var highlightNode = highlightNodes[i];
            highlightNode.setAttribute(this.highlightIdAttribute, highlightId);
            this.setFinalStrokeAttributes(highlightNode);

            this.fadeHighlight(highlightNode, highlightId, color, startStrokeWidth, 3000);
        }

        for (i = 0; i < highlightMarkers.length; i++) {
            var isMarker = true;            
            var highlightMarker = highlightMarkers[i];
            highlightMarker.setAttribute(this.highlightIdAttribute, highlightId);
            this.setFinalStrokeAttributes(highlightMarker);
            this.setFinalFillAttribute(highlightMarker);

            this.fadeHighlight(highlightMarker, highlightId, color, startStrokeWidth, 3000, isMarker);
        }
    },

    getHighlightNodes: function getHighlightNodes(shape, defsNode) {
        var svgNode = shape.node;
        var highlightNodes = Array.from(svgNode.getElementsByClassName("highlight"));

        return highlightNodes;
    },   

    getHighlightMarkersById: function getHighlightMarkersById(defsNode, id) {
        var allHighlightMarkers = Array.from(defsNode.getElementsByClassName("highlight"));
        var highlightMarkers = [];
        for (var i = 0; i < allHighlightMarkers.length; i++) {
            var currentHighlightMarker = allHighlightMarkers[i];
            if (currentHighlightMarker.id.indexOf(id) !== -1) {
                highlightMarkers.push(currentHighlightMarker);
            }
        }
        return highlightMarkers;
    },

    setFinalStrokeAttributes: function setFinalStrokeAttributes(highlightNode) {
        var finalStroke = highlightNode.getAttribute(this.finalStrokeAttribute);
        if (finalStroke === null) {
            finalStroke = highlightNode.getAttribute("stroke");
            highlightNode.setAttribute(this.finalStrokeAttribute, finalStroke);
        }

        var finalStrokeWidth = highlightNode.getAttribute(this.finalStrokeWidthAttribute);
        if (finalStrokeWidth === null) {
            finalStrokeWidth = highlightNode.getAttribute("stroke-width") || "1";
            highlightNode.setAttribute(this.finalStrokeWidthAttribute, finalStrokeWidth);                
        }
    },

    setFinalFillAttribute: function setFinalFillAttribute(highlightMarker) {
        var finalFill = highlightMarker.getAttribute(this.finalFillAttribute);
        if (finalFill === null) {
            finalFill = highlightMarker.getAttribute("fill") || "#000000";
            highlightMarker.setAttribute(this.finalFillAttribute, finalFill);
        }
    },

    fadeHighlight: function fadeHighlight(highlightNode, highlightId, startStroke, startStrokeWidth, animationTime, isMarker, passedMilliseconds) {
        var currentHighlightId = highlightNode.getAttribute(this.highlightIdAttribute);

        // shape not visible or other animation running on shape, cancel this one
        if ((highlightNode.getAttribute("visibility") === "hidden") || (currentHighlightId !== highlightId)) {
            return;
        }
        if (typeof passedMilliseconds === "undefined") {
            passedMilliseconds = 0;
        }
        if (isMarker !== true) {
            isMarker = false;
        }

        if (animationTime > passedMilliseconds) {
            // Animation in progress
            var fraction = passedMilliseconds / animationTime;

            this.fadeStroke(highlightNode, startStroke, fraction);
            this.fadeStrokeWidth(highlightNode, startStrokeWidth, fraction);
            if (isMarker) {
                this.fadeFill(highlightNode, startStroke, fraction);
            }

            var callback = function() {
                this.fadeHighlight(highlightNode, highlightId, startStroke, startStrokeWidth, animationTime, isMarker, passedMilliseconds + this.millisecondsForStep);
            }.bind(this);
            setTimeout(callback, this.millisecondsForStep);
        } else {
            // Animation expired set to finalValues
            highlightNode.setAttribute("stroke", highlightNode.getAttribute(this.finalStrokeAttribute));
            highlightNode.setAttribute("stroke-width", highlightNode.getAttribute(this.finalStrokeWidthAttribute));
            if (isMarker) {
                highlightNode.setAttribute("fill", highlightNode.getAttribute(this.finalFillAttribute));
            }
        }
    },

    fadeStroke: function fadeStroke(highlightNode, startStroke, fraction) {
        var finalStroke = highlightNode.getAttribute(this.finalStrokeAttribute);

        // stroke is not visible, so do not fade
        if ((finalStroke === null) || (finalStroke === "none")) {
            return;
        }

        var interpolatedStroke = this.interpolateColor(startStroke, finalStroke, fraction);
        highlightNode.setAttribute("stroke", interpolatedStroke);
    },

    fadeStrokeWidth: function fadeStrokeWidth(highlightNode, startStrokeWidth, fraction) {
        var finalStrokeWidth = parseInt(highlightNode.getAttribute(this.finalStrokeWidthAttribute), 10);

        // stroke is not visible, so do not fade
        if (finalStrokeWidth === 0) {
            return;
        }

        var strokeWidth = finalStrokeWidth + (1 - fraction) * (startStrokeWidth - finalStrokeWidth);
        highlightNode.setAttribute("stroke-width", strokeWidth);
    }, 

    fadeFill: function fadeStroke(highlightNode, startFill, fraction) {
        var finalFill = highlightNode.getAttribute(this.finalFillAttribute);

        // fill color is not visible, so do not fade
        if ((finalFill === null) || (finalFill === "none")) {
            return;
        }

        var interpolatedFill = this.interpolateColor(startFill, finalFill, fraction);
        highlightNode.setAttribute("fill", interpolatedFill);
    },  

    interpolateColor: function interpolateColor(startColor, finalColor, fraction) {
        var startColorRgb = this.getRgbColor(startColor);
        var finalColorRgb = this.getRgbColor(finalColor);
        var interpolatedColorRgb = {};

        interpolatedColorRgb["r"] = startColorRgb["r"] + parseInt(fraction * (finalColorRgb["r"] - startColorRgb["r"]), 10);
        interpolatedColorRgb["g"] = startColorRgb["g"] + parseInt(fraction * (finalColorRgb["g"] - startColorRgb["g"]), 10);
        interpolatedColorRgb["b"] = startColorRgb["b"] + parseInt(fraction * (finalColorRgb["b"] - startColorRgb["b"]), 10);

        return this.getHexColor(interpolatedColorRgb);
    },

    getRgbColor: function getRgbColor(hexColorString) {
        var rgbValue = {};

        rgbValue["r"] = parseInt(hexColorString.substring(1, 3), 16);
        rgbValue["g"] = parseInt(hexColorString.substring(3, 5), 16);
        rgbValue["b"] = parseInt(hexColorString.substring(5, 7), 16);

        return rgbValue;
    },

    getHexColor: function getHexColor(rgbColorHash) {
        // If statements fill the color strings with leading zeroes
        var red = rgbColorHash["r"].toString(16);
        if (red.length === 1) {
            red = "0" + red;
        }
        var green = rgbColorHash["g"].toString(16);
        if (green.length === 1) {
            green = "0" + green;
        }
        var blue = rgbColorHash["b"].toString(16);
        if (blue.length === 1) {
            blue = "0" + blue;
        }

        var hexColor = "#" + red + green + blue;
        return hexColor;
    }
});
