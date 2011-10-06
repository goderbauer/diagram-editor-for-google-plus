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
 *
 * 
 * HOW to USE the OVERLAY PLUGIN:
 * 	You can use it via the event mechanism from the editor
 * 	by using facade.raiseEvent( <option> )
 * 
 * 	As an example please have a look in the overlayexample.js
 * 
 * 	The option object should/have to have following attributes:
 * 
 * 	Key				Value-Type							Description
 * 	================================================================
 * 
 *	type 			ORYX.CONFIG.EVENT_OVERLAY_SHOW | ORYX.CONFIG.EVENT_OVERLAY_HIDE		This is the type of the event	
 *	id				<String>							You have to use an unified id for later on hiding this overlay
 *	shapes 			<ORYX.Core.Shape[]>					The Shapes where the attributes should be changed
 *	attributes 		<Object>							An object with svg-style attributes as key-value pair
 *	node			<SVGElement>						An SVG-Element could be specified for adding this to the Shape
 *	nodePosition	"N"|"NE"|"E"|"SE"|"S"|"SW"|"W"|"NW"|"START"|"END"	The position for the SVG-Element relative to the 
 *														specified Shape. "START" and "END" are just using for a Edges, then
 *														the relation is the start or ending Docker of this edge.
 *	
 * 
 **/
if (!ORYX.Plugins) 
    ORYX.Plugins = new Object();

ORYX.Plugins.Overlay = Clazz.extend({

    facade: undefined,
	
	styleNode: undefined,
    
    construct: function(facade){
		
        this.facade = facade;

		this.changes = [];

		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_OVERLAY_SHOW, this.show.bind(this));
		this.facade.registerOnEvent(ORYX.CONFIG.EVENT_OVERLAY_HIDE, this.hide.bind(this));	

		this.styleNode = document.createElement('style')
		this.styleNode.setAttributeNS(null, 'type', 'text/css')
		
		document.getElementsByTagName('head')[0].appendChild( this.styleNode )

    },
	
	/**
	 * Show the overlay for specific nodes
	 * @param {Object} options
	 * 
	 * 	String				options.id		- MUST - Define the id of the overlay (is needed for the hiding of this overlay)		
	 *	ORYX.Core.Shape[] 	options.shapes 	- MUST - Define the Shapes for the changes
	 * 	attr-name:value		options.changes	- Defines all the changes which should be shown
	 * 
	 * 
	 */
	show: function( options ){
		
		// Checks if all arguments are available
		if(!options || 
		   !options.shapes || !options.shapes instanceof Array ||
		   !options.id || !options.id instanceof String || options.id.length == 0) { 
		    return;
		}
		
		//if( this.changes[options.id]){
		//	this.hide( options )
		//}
			

		// Checked if attributes are set
		if( options.attributes ){
			
			// FOR EACH - Shape
			options.shapes.each(function(el){
				
				// Checks if the node is a Shape
				if( !el instanceof ORYX.Core.Shape){ return }
				
				this.setAttributes( el.node , options.attributes )
				
			}.bind(this));

		}	
		
		var isSVG = true
		try {
			isSVG = options.node && options.node instanceof SVGElement;
		} catch(e){}
		
		// Checks if node is set and if this is a SVGElement		
		if ( options.node && isSVG) {
			
			options["_temps"] = [];
						
			// FOR EACH - Node
			options.shapes.each(function(el, index){
				
				// Checks if the node is a Shape
				if( !el instanceof ORYX.Core.Shape){ return }
				
				var _temp = {};
				_temp.svg = options.dontCloneNode ? options.node : options.node.cloneNode( true );
				
				// Append the svg node to the ORYX-Shape
				this.facade.getCanvas().getSvgContainer().appendChild(_temp.svg);
				
				if (el instanceof ORYX.Core.Edge && !options.nodePosition) {
					options['nodePosition'] = "START";
				}
						
				// If the node position is set, it has to be transformed
				if (options.nodePosition && !options.nodePositionAbsolute) {
					var b = el.absoluteBounds();
					var p = options.nodePosition.toUpperCase();
					
					// Check the values of START and END
					if( el instanceof ORYX.Core.Node && p == "START"){
						p = "NW";
					} else if(el instanceof ORYX.Core.Node && p == "END"){
						p = "SE";
					} else if(el instanceof ORYX.Core.Edge && p == "START"){
						b = el.getDockers().first().bounds;
					} else if(el instanceof ORYX.Core.Edge && p == "END"){
						b = el.getDockers().last().bounds;
					}

					// Create a callback for changing the position 
					// depending on the position string
					_temp.callback = function() { this.positionCallback(el, p, b, options.keepInsideVisibleArea, _temp); }.bind(this);
					_temp.element = el;
					_temp.callback();
					
					b.registerCallback( _temp.callback );
				}
				
                // Show the ghostpoint
                if(options.ghostPoint){
                    var point={x:0, y:0};
                    point=options.ghostPoint;
                    _temp.callback = function(){
                     
                        var x = 0; var y = 0;
                        x = point.x -7;
                        y = point.y -7;
                        _temp.svg.setAttributeNS(null, "transform", "translate(" + x + ", " + y + ")")
                      
                    }.bind(this)
                 
                     _temp.element = el;
                     _temp.callback();
                     
                     b.registerCallback( _temp.callback );
                }
                
				options._temps.push( _temp )	
				
			}.bind(this))
			
		}

		// Store the changes
		if( !this.changes[options.id] ){
			this.changes[options.id] = [];
		}
		
		this.changes[options.id].push( options );
				
	},
	
	/**
	 * Hide the overlay with the spefic id
	 * @param {Object} options
	 */
	hide: function( options ){
		
		// Checks if all arguments are available
		if(!options || 
		   !options.id || !options.id instanceof String || options.id.length == 0 ||
		   !this.changes[options.id]) { 
			return;
		}		
		
		
		// Delete all added attributes
		// FOR EACH - Shape
		this.changes[options.id].each(function(option){
			
			option.shapes.each(function(el, index){
				
				// Checks if the node is a Shape
				if( !el instanceof ORYX.Core.Shape){ return }
				
				this.deleteAttributes( el.node )
							
			}.bind(this));

	
			if( option._temps ){
				
				option._temps.each(function(tmp){
					// Delete the added Node, if there is one
					if( tmp.svg && tmp.svg.parentNode ){
						tmp.svg.parentNode.removeChild( tmp.svg )
					}
		
					// If 
					if( tmp.callback && tmp.element){
						// It has to be unregistered from the edge
						tmp.element.bounds.unregisterCallback( tmp.callback )
					}
							
				}.bind(this));
				
			}
			
		}.bind(this));
		
		this.changes[options.id] = null;
	},
	
	
	/**
	 * Set the given css attributes to that node
	 * @param {HTMLElement} node
	 * @param {Object} attributes
	 */
	setAttributes: function( node, attributes ) {
		
		
		// Get all the childs from ME
		var childs = this.getAllChilds( node.firstChild.firstChild )
		
		var ids = []
		
		// Add all Attributes which have relation to another node in this document and concate the pure id out of it
		// This is for example important for the markers of a edge
		childs.each(function(e){ ids.push( $A(e.attributes).findAll(function(attr){ return attr.nodeValue.startsWith('url(#')}) )})
		ids = ids.flatten().compact();
		ids = ids.collect(function(s){return s.nodeValue}).uniq();
		ids = ids.collect(function(s){return s.slice(5, s.length-1)})
		
		// Add the node ID to the id
		ids.unshift( node.id + ' .me')
		
		var attr				= $H(attributes);
        var attrValue			= attr.toJSON().gsub(',', ';').gsub('"', '');
        var attrMarkerValue		= attributes.stroke ? attrValue.slice(0, attrValue.length-1) + "; fill:" + attributes.stroke + ";}" : attrValue;
        var attrTextValue;
        if( attributes.fill ){
            var copyAttr        = Object.clone(attributes);
        	copyAttr.fill		= "black";
        	attrTextValue		= $H(copyAttr).toJSON().gsub(',', ';').gsub('"', '');
        }
                	
        // Create the CSS-Tags Style out of the ids and the attributes
        csstags = ids.collect(function(s, i){return "#" + s + " * " + (!i? attrValue : attrMarkerValue) + "" + (attrTextValue ? " #" + s + " text * " + attrTextValue : "") })
		
		// Join all the tags
		var s = csstags.join(" ") + "\n" 
		
		// And add to the end of the style tag
		this.styleNode.appendChild(document.createTextNode(s));
		
		
	},
	
	/**
	 * Deletes all attributes which are
	 * added in a special style sheet for that node
	 * @param {HTMLElement} node 
	 */
	deleteAttributes: function( node ) {
				
		// Get all children which contains the node id		
		var delEl = $A(this.styleNode.childNodes)
					 .findAll(function(e){ return e.textContent.include( '#' + node.id ) });
		
		// Remove all of them
		delEl.each(function(el){
			el.parentNode.removeChild(el);
		});		
	},
	
	getAllChilds: function( node ){
		
		var childs = $A(node.childNodes)
		
		$A(node.childNodes).each(function( e ){ 
		        childs.push( this.getAllChilds( e ) )
		}.bind(this))

    	return childs.flatten();
	},

    isInsideVisibleArea: function(x, y, width, height) {
        // get the div that is responsible for scrolling
        var centerDiv = document.getElementById("oryx_center_region").children[0].children[0];
       
        var viewportLeft = centerDiv.scrollLeft / this.facade.getCanvas().zoomLevel;  
        var viewportTop = centerDiv.scrollTop / this.facade.getCanvas().zoomLevel;  
        // yeah I'm fully aware of how much I suck: 20px is the width of the scrollbars
        var viewportWidth = (centerDiv.offsetWidth - 20) / this.facade.getCanvas().zoomLevel;
        var viewportHeight = (centerDiv.offsetHeight - 20) / this.facade.getCanvas().zoomLevel;

        var insideX = (x > viewportLeft && x + width < viewportLeft + viewportWidth);
        var insideY = (y > viewportTop && y + height < viewportTop + viewportHeight);
        return insideX && insideY;
    },
    
    positionCallback: function(element, position, bounds, keepVisible, temp) {
        var x, y;
        try {
        var overlayWidth = temp.svg.getBBox().width;
        var overlayHeight = temp.svg.getBBox().height;
        } catch(e) {
            //workaround for SVG bug in Firefox
            var xdadsd = 42;
        }
        var curPos, curPosIndex;
        var positionPreference = ["N", "NW", "W", "NE", "SW", "SE", "INSIDE_NW", "INSIDE_W"];
        var startAndEnd = { x: bounds.width() / 2, y: bounds.height() / 2 };
        var positions = {
            "NW":           { x: -overlayWidth,                         y: -overlayHeight * 1.5 },
            "N":            { x: bounds.width() / 2 - overlayWidth / 2, y: -overlayHeight * 1.5 },
            "NE":           { x: bounds.width(),                        y: -overlayHeight * 1.5 },
            "E":            { x: bounds.width(),                        y: bounds.height() / 2 - overlayHeight / 2 },
            "SE":           { x: bounds.width(),                        y: bounds.height() },
            "S":            { x: bounds.width() / 2 - overlayWidth / 2, y: bounds.height() },
            "SW":           { x: -overlayWidth - 20,                    y: bounds.height() },
            "W":            { x: -overlayWidth - 20,                    y: bounds.height() / 2 - overlayHeight / 2 },
            "INSIDE_NW":    { x: bounds.width() - overlayWidth - 20,    y: 0 },
            "INSIDE_W":     { x: 20,                                    y: bounds.height() / 2 - overlayHeight / 2 },
            "START": startAndEnd,
            "END": startAndEnd
        }
        
        // get position and (if necessary) make sure the overlay is inside the visible part of the screen
        curPos = position;
        curPosIndex = 0;
        do {
	        x = positions[curPos].x + bounds.upperLeft().x; 
            y = positions[curPos].y + bounds.upperLeft().y;

            curPos = positionPreference[curPosIndex++];
        
            if (typeof curPos === "undefined") {
                break;
            }
        } while (keepVisible && !this.isInsideVisibleArea(x, y, overlayWidth, overlayHeight));
        
        temp.svg.setAttributeNS(null, "transform", "translate(" + x + ", " + y + ")");
    }
    
});
