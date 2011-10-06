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
 * This prevents errors from logging calls in case console is undefined.
 */
var consoleWrapper = {
    // console wrapper by D. Christoff @ http://fragged.org/
    _version: 2.3,
    debug: false, // global debug on|off
    quietDismiss: false, // may want to just drop, or alert instead,
    method: "log",
    _hasConsole: function(_method) {
        var _method = _method || "log";
        return typeof(console) == 'object' && typeof(console[_method]) != "undefined";
    },
    _consoleMethod: function() {
        return false;
    },
    log: function() {
        this.method = "log";
        this._consoleMethod.apply(this, arguments);
    },
    info: function() {
        this.method = "info";
        this._consoleMethod.apply(this, arguments);
    },
    warn: function() {
        this.method = "warn";
        this._consoleMethod.apply(this, arguments);
    },
    clear: function() {
        this.method = "clear";
        this._consoleMethod.apply(this);
    },
    count: function() {
        this.method = "count";
        this._consoleMethod.apply(this, arguments);
    },
    debug: function() {
        this.method = "debug";
        this._consoleMethod.apply(this, arguments);
    },
    trace: function() {
        this.method = "trace";
        this._consoleMethod.apply(this, arguments);
    },
    assert: function() {
        this.method = "assert";
        this._consoleMethod.apply(this, arguments);
    }
}; // end console wrapper.

if (typeof console !== 'object') {
    console = consoleWrapper;
}