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

ORYX.Plugins.Schlaumeier = {
    schlaumeierWidth: 229,
    schlaumeierHeight: 16,
    padding: 2,
    border: 1,
    showtimes: {},
    timer: null,
    animationInProgress: true,

    construct: function construct(facade) {
        this.facade = facade;
        
        this.canvasContainer = $$(".ORYX_Editor")[0].parentNode;
        this.schlaumeier = document.createElement('div');
        Element.extend(this.schlaumeier);
        
        this.schlaumeier.setAttribute('id', 'pwave-schlaumeier');
        this.schlaumeier.onclick = this.hideTooltip.bind(this);
        
        this.canvasContainer.appendChild(this.schlaumeier);
                
        window.addEventListener("resize", this.handleWindowResize.bind(this), false);
        this.facade.registerOnEvent(ORYX.CONFIG.EVENT_DISPLAY_SCHLAUMEIER, this.displayMessage.bind(this));
        this.facade.registerOnEvent(ORYX.CONFIG.EVENT_HIDE_SCHLAUMEIER, this.hideTooltip.bind(this));
        this.facade.registerOnEvent(ORYX.CONFIG.EVENT_ORYX_SHOWN, this.onOryxShown.bind(this));
    },
    
    onOryxShown: function onLoad() {
        this.handleWindowResize();
        this.animationInProgress = false;
    },
    
    handleWindowResize: function handleWindowResize() {
        this.schlaumeier.style.right = 0 + this.getCanvasScrollbarOffsetForWidth() + 'px';
        this.schlaumeier.style.top = '0px';
    },
    
    displayMessage: function displayMessage(event) {
        if (this.animationInProgress) {
            setTimeout(this.displayMessage.bind(this, event), 300);
            return;
        }
        
        if (typeof event.showtimes === "undefined") {
            event.showtimes = 1;
        }
        if (typeof event.duration === "undefined") {
            event.duration = 8000;
        }
        
        if (!this.needsToBeDisplayed(event)) {
            return;
        }
        
        this.setText(event.message);
        this.animationInProgress = true;
        setTimeout(this.showTooltip.bind(this), 300);
        
        if (event.duration !== "infinite") {
            this.timer = setTimeout(this.hideTooltip.bind(this), event.duration + 300);
        }
        
    },
    
    hideTooltip: function hideTooltip() {
        if (this.schlaumeier.style.display !== "none") {
            this.animationInProgress = true;
            jQuery(this.schlaumeier).hide("slide", {'direction' : "up"}, 700, this.animationFinished.bind(this));
        }
    },
    
    showTooltip: function showTooltip() {
        jQuery(this.schlaumeier).show("slide", {'direction' : "up"}, 700, this.animationFinished.bind(this));
    },
    
    animationFinished: function animationFinished() {
        this.animationInProgress = false;
    },
    
    needsToBeDisplayed: function needsToBeDisplayed(event) {
        if (typeof this.showtimes[event.message] === "undefined") {
            this.showtimes[event.message] = event.showtimes;
        }
        
        if (this.showtimes[event.message] === "always") {
            return true;
        }
        
        this.showtimes[event.message] -= 1;
        
        if (this.showtimes[event.message] < 0) {
            return false;
        }
        return true;
    },
    
    setText: function setText(newText) {
        this.schlaumeier.hide();
        clearTimeout(this.timer);
        this.schlaumeier.update(newText);
        this.handleWindowResize();
    },
    
    getCanvasScrollbarOffsetForWidth: function getCanvasScrollbarOffsetForWidth() {
        return this.canvasContainer.offsetWidth - this.canvasContainer.clientWidth;
    }, 
    
    getCanvasScrollbarOffsetForHeight: function getCanvasScrollbarOffsetForHeight() {
        return this.canvasContainer.offsetHeight - this.canvasContainer.clientHeight;
    }
};

ORYX.Plugins.Schlaumeier = ORYX.Plugins.AbstractPlugin.extend(ORYX.Plugins.Schlaumeier);