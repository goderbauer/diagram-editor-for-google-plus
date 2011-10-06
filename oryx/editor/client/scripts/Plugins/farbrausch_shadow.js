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

ORYX.Plugins.FarbrauschShadow = Clazz.extend({
    excludedTags: Array.from(["defs", "text", "g", "a"]),

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
            this.setShadow(color, shape);
        }
    },
    
    getColorForUserId: function getColorForUserId(userId) {
        var user = this.users[userId];
        if(typeof user  === 'undefined' || typeof user.color  === 'undefined') {
            return ORYX.CONFIG.FARBRAUSCH_DEFAULT_COLOR;
        }
        return user.color;
    },
    
    setShadow: function setShadow(color, shape) {
        var defsNode = this.facade.getCanvas().getDefsNode();        

        // if filter not already defined, define filter
        if (!this.existsShadowFilterFor(color, defsNode)) {
            this.createShadowFilter(color, defsNode);
        }

        this.applyShadowFilter(color, shape);
    },

    existsShadowFilterFor: function existsShadowFilterFor(color, defsNode) {
        var filterNode;
        var defsNodeChildren = defsNode.children;
        // in Chrome .children can return undefined
        if (typeof defsNodeChildren !== "undefined") {
            for (var i = 0; i < defsNodeChildren.length; i++) {
                if (defsNodeChildren[i].id === color) {
                    filterNode = defsNodeChildren[i];
                    break;
                }
            }
        }

        return (typeof filterNode !== "undefined");
    },

    createShadowFilter: function createShadowFilter(color, defsNode) {
        if (this.isChrome()) {
            //filterUnits does not work with chrome properly
            filterNode = ORYX.Editor.graft("http://www.w3.org/2000/svg", defsNode, 
                ['filter', {"id": color}]
            );

        } else {
            filterNode = ORYX.Editor.graft("http://www.w3.org/2000/svg", defsNode, 
                ['filter', {"id": color, "filterUnits": "userSpaceOnUse"}]
            );
        }

        ORYX.Editor.graft("http://www.w3.org/2000/svg", filterNode,
            ['feFlood', {"style": "flood-color:" + color + ";flood-opacity:0.3", "result": "ColoredFilter"}]
        );
        ORYX.Editor.graft("http://www.w3.org/2000/svg", filterNode, 
            ['feGaussianBlur', {"in": "SourceAlpha", "stdDeviation": "1", "result": "BlurFilter"}]
        );
        ORYX.Editor.graft("http://www.w3.org/2000/svg", filterNode, 
            ['feComposite', {"in": "ColoredFilter", "in2": "BlurFilter", "operator": "in", "result": "ColoredBlurFilter"}]
        );
        ORYX.Editor.graft("http://www.w3.org/2000/svg", filterNode,
            ['feOffset', {"in": "ColoredBlurFilter", "dx": "3", "dy": "3", "result": "FinalShadowFilter"}]
        );
        ORYX.Editor.graft("http://www.w3.org/2000/svg", filterNode, 
            ['feMerge', {},
                ['feMergeNode', {"in": "FinalShadowFilter"}],
                ['feMergeNode', {"in": "SourceGraphic"}]
            ]
        );
    },
    
    isChrome: function isChrome() {
        if (navigator.userAgent.toLowerCase().indexOf('chrome') > -1) {
            return true;
        } else {
            return false;
        }
    },

    applyShadowFilter: function applyShadowFilter(color, shape) {
        var svgNode = shape.node;
        var meNode = svgNode.getElementsByClassName("me")[0];
        var firstChild = meNode.firstChild;
 
        if (typeof firstChild !== "undefined") {
            if (shape instanceof ORYX.Core.Node) {
                var childNodes = firstChild.childNodes;

                for (var i = 0; i < childNodes.length; i++) {
                    var childNode = childNodes[i];
                    var tagName = childNode.tagName;
                    if ((typeof tagName !== "undefined") && !this.excludedTags.include(tagName)) {
                        childNode.setAttribute("filter", "url(#" + color + ")");
                    }
                }
            } else if(shape instanceof ORYX.Core.Edge) {
                if (!this.isChrome()) {
                    //Chrome has problems with setting the bounding box for filters on edges
                    firstChild.setAttribute("filter", "url(#" + color + ")");
                }
            }
        }     
    }
});
