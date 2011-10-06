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

/**
 * @namespace Oryx name space for plugins
 * @name ORYX.Plugins
*/
if(!ORYX.Plugins)
	ORYX.Plugins = new Object();

ORYX.Plugins.JSONExport = ORYX.Plugins.AbstractPlugin.extend({
	construct: function construct(facade) {
		arguments.callee.$.construct.apply(this, arguments);
		this.facade.offer({
			'name': ORYX.I18N.JSONExport.name,
			'functionality': this.JSONExport.bind(this),
			'group': ORYX.I18N.JSONExport.group,
			'iconCls': 'pw-toolbar-button pw-toolbar-export',
			'description': ORYX.I18N.JSONExport.desc,
			'index': 1,
			'minShape': 0,
			'maxShape': 0,
			'isEnabled': function(){return true},
            'visibleInViewMode': true
        });
    },
    
    /*
    * Exporting a model from the processWave editor into the ORYX editor.
    * We get the JSON-serialized model, the stencilset and the stencilset-extensions
    * and POST them to an ORYX-URL. 
    */    
    JSONExport: function JSONExport() {
    
        // Getting the JSON represantation of the model:
        
        var serializedCanvas = this.facade.getSerializedJSON();
        
        // Getting the stencilSet: 
        
        var ssetObj = this.facade.getStencilSets();
        // ssetObj contains a KV mapping of StencilSetNamespace -> StencilSetURL.
        // as we don't know what the first key is, an in-loop helps us.        
        for (i in ssetObj) {
            var ssetURL = ssetObj[i].source();
            break;
            // we break after the first StencilSet because there should be just one StencilSet normally.
        }
        ssetURL = ssetURL.slice(ssetURL.indexOf("stencilsets/"));        
        ssetURL = ssetURL.replace("petrinets.json", "petrinet.json");
        // the guys from oryx-project use /petrinets/petrinet.json instead of petrinets.json        
        ssetURL = ssetURL.replace(/simpleBPMN2.0/g, "bpmn2.0")
        // simpleBPMN2.0 is not yet supported in the oryx-project... 
        // bpmn2.0 does the job until it is supported.
        
        // Getting the StencilSetExtensions:
        
        var canvasObj = this.facade.getJSON();
        var exts = Object.toJSON(canvasObj.ssextensions);
        
        // Open a window with a hidden form and POST the data to the ORYX-project:
        
        var win = window.open("");
        
        win.document.open();
        win.document.write("<p>Exporting...</p>");
        // write something so the HTML body is present.
        win.document.close();
        var submitForm = win.document.createElement("form");
        win.document.body.appendChild(submitForm);
        var createHiddenElement = function(name, value) {
            var newElement = document.createElement("input");
            newElement.name=name;
            newElement.type="hidden";
            newElement.value = value;
            return newElement;
        }
        submitForm.appendChild(createHiddenElement("json", serializedCanvas) );
        submitForm.appendChild(createHiddenElement("stencilset", ssetURL) );
        submitForm.appendChild(createHiddenElement("exts", exts));
        submitForm.method = "POST";
        submitForm.action= "http://oryx-project.org/oryx/jsoneditor";
        submitForm.submit();
    }
});