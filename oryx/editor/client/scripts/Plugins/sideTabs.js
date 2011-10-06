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

ORYX.Plugins.SideTabs = 
{
    construct: function construct(facade) {
        this.facade = facade;
        this.showCallbacks = {};
        this.tabWidth = 233;
        
        this.sidebar = document.createElement('div');
        this.sidebar.setAttribute('id', 'pwave-tabbar');
        this.sidebar.appendChild(document.createElement('ul'));
        jQuery(this.sidebar)
            .tabs({collapsible: true})
            .removeClass('ui-corner-all');
        jQuery(this.sidebar).children()
            .removeClass('ui-corner-bottom')
            .removeClass('ui-corner-top');
        // Execute callback when tab is selected
        jQuery(this.sidebar).bind('tabsshow', function(event, ui) {
            if (typeof this.showCallbacks[ui.panel.id] === 'function') {
                this.showCallbacks[ui.panel.id]();
            }
        }.bind(this));
        jQuery(this.sidebar).bind('tabsadd', this._closeAllTabs.bind(this));
        
        this.sidebarWrapper = document.createElement('div'); // used to position the bar fixed
        this.sidebarWrapper.setAttribute('id', 'pwave-tabbar-wrapper');
        this.sidebarWrapper.appendChild(this.sidebar);
        this.canvasContainer = $$(".ORYX_Editor")[0].parentNode;
        this.canvasContainer.appendChild(this.sidebarWrapper);

        this.facade.registerOnEvent(ORYX.CONFIG.EVENT_SIDEBAR_NEW_TAB, this.registerNewTab.bind(this));
        this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MODE_CHANGED, this._handleModeChanged.bind(this));
        window.addEventListener("resize", this.handleWindowResize.bind(this), false);
        
        this.facade.raiseEvent({
            'type' : ORYX.CONFIG.EVENT_SIDEBAR_LOADED
        });
    },
    
    registerNewTab: function registerNewTab(event) {
        var tabObj = {
            'tabid': event.tabid,
            'title': event.tabTitle, // title text label for the new tab
            'div': event.tabDivEl, // the HTML DIV Element to be rendered in the new tab
            'order': event.tabOrder, // number determining the position in the tab list
            'width': event.tabWidth, // dimensions for the new tab
            'height': Math.max(150, event.tabHeight),
            'displayHandler': event.displayHandler,
            'storeRenameFunction': event.storeRenameFunction
        };
        jQuery(this.sidebar).tabs("add", "#tabs-" + tabObj.tabid, tabObj.title, tabObj.order);
        var header = jQuery("<div>", {'class': 'pwave-tab-header'});
        var headerHighlight = jQuery("<div>", {'class': 'pwave-tab-header-highlight'});
        var headerLabel = jQuery("<div>", {'class': 'pwave-tab-header-label'}).html(tabObj.title);
        var headerMinimize = jQuery("<div>", {'class': 'pwave-tab-header-minimize'});
        jQuery(header).append(headerHighlight).append(headerLabel).append(headerMinimize);
        jQuery(header).click(this._closeAllTabs.bind(this));
        
        if (typeof tabObj.storeRenameFunction === 'function') {
            tabObj.storeRenameFunction(function renameHeader(name) {
                headerLabel.html(name);
            });
        }
        
        var scrollContainer = jQuery("<div>", {
            'class': 'scrollcontainer'
        }).append(tabObj.div);
        jQuery('#tabs-'+tabObj.tabid).append(header);
        jQuery('#tabs-'+tabObj.tabid).append(scrollContainer);
        this.showCallbacks['tabs-'+tabObj.tabid] = tabObj.displayHandler;
    },
    
    _handleModeChanged: function _handleModeChanged(event) {
        if (event.mode.isEditMode()) {
            this.sidebar.show();
        } else {
            this.sidebar.hide();
        }
        
        if (event.mode.isPaintMode()) {
            this._closeAllTabs();
        }
    },
    
    _closeAllTabs: function _closeAllTabs() {
        if (jQuery(this.sidebar).tabs('option', 'selected') !== -1) {
            jQuery(this.sidebar).tabs('select', -1);
        }        
    },
    
    handleWindowResize: function handleWindowResize() {
        this.sidebarWrapper.style.bottom = 0 + this.getCanvasScrollbarOffsetForHeight() + 'px';
        this.sidebarWrapper.style.right = 20 + this.getCanvasScrollbarOffsetForWidth() + 'px';
    },
    
    getCanvasScrollbarOffsetForWidth: function getCanvasScrollbarOffsetForWidth() {
        return this.canvasContainer.offsetWidth - this.canvasContainer.clientWidth;
    }, 
    
    getCanvasScrollbarOffsetForHeight: function getCanvasScrollbarOffsetForHeight() {
        return this.canvasContainer.offsetHeight - this.canvasContainer.clientHeight;
    }
};

ORYX.Plugins.SideTabs = ORYX.Plugins.AbstractPlugin.extend(ORYX.Plugins.SideTabs);
