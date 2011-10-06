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
 
if(!ORYX) var ORYX = {};

if(!ORYX.CONFIG) ORYX.CONFIG = {};

//This is usually the name of the war file!
ORYX.CONFIG.ROOT_PATH =					document.location.href.substring(0,document.location.href.lastIndexOf("/")) + "/../oryx/";
ORYX.CONFIG.WEB_URL = "http://oryx-project.org";
ORYX.CONFIG.COLLABORATION = true;
	
ORYX.CONFIG.VERSION_URL =				ORYX.CONFIG.ROOT_PATH + "VERSION";
ORYX.CONFIG.LICENSE_URL =				ORYX.CONFIG.ROOT_PATH + "LICENSE";

ORYX.CONFIG.SERVER_HANDLER_ROOT = 		"";

ORYX.CONFIG.STENCILSET_HANDLER = 		ORYX.CONFIG.SERVER_HANDLER_ROOT + "";
    
	/* Editor-Mode */
ORYX.CONFIG.MODE_READONLY =				"readonly";
ORYX.CONFIG.MODE_FULLSCREEN =			"fullscreen";

	/* Show grid line while dragging */
ORYX.CONFIG.SHOW_GRIDLINE = true;
ORYX.CONFIG.DISABLE_GRADIENT = true;

	/* Plugins */
ORYX.CONFIG.PLUGINS_ENABLED =			true;
ORYX.CONFIG.PLUGINS_CONFIG =			ORYX.CONFIG.ROOT_PATH + "editor/client/scripts/Plugins/plugins.xml";
ORYX.CONFIG.PROFILE_PATH =				ORYX.CONFIG.ROOT_PATH + "profiles/";
ORYX.CONFIG.PLUGINS_FOLDER =			"Plugins/";
ORYX.CONFIG.PDF_EXPORT_URL =			ORYX.CONFIG.ROOT_PATH + "pdf";
ORYX.CONFIG.PNML_EXPORT_URL =			ORYX.CONFIG.ROOT_PATH + "pnml";
ORYX.CONFIG.SIMPLE_PNML_EXPORT_URL =	ORYX.CONFIG.ROOT_PATH + "simplepnmlexporter";
ORYX.CONFIG.DESYNCHRONIZABILITY_URL =	ORYX.CONFIG.ROOT_PATH + "desynchronizability";
ORYX.CONFIG.IBPMN2BPMN_URL =			ORYX.CONFIG.ROOT_PATH + "ibpmn2bpmn";
ORYX.CONFIG.QUERYEVAL_URL =             ORYX.CONFIG.ROOT_PATH + "query";
ORYX.CONFIG.SYNTAXCHECKER_URL =			ORYX.CONFIG.ROOT_PATH + "syntaxchecker";
ORYX.CONFIG.VALIDATOR_URL =				ORYX.CONFIG.ROOT_PATH + "validator";
ORYX.CONFIG.AUTO_LAYOUTER_URL =			ORYX.CONFIG.ROOT_PATH + "layouter";
ORYX.CONFIG.SS_EXTENSIONS_FOLDER =		ORYX.CONFIG.ROOT_PATH + "editor/data/stencilsets/extensions/";
ORYX.CONFIG.SS_EXTENSIONS_CONFIG =		ORYX.CONFIG.ROOT_PATH + "editor/data/stencilsets/extensions/extensions.json";	
ORYX.CONFIG.ORYX_NEW_URL =				"/new";	
ORYX.CONFIG.STEP_THROUGH =				ORYX.CONFIG.ROOT_PATH + "stepthrough";
ORYX.CONFIG.STEP_THROUGH_CHECKER =		ORYX.CONFIG.ROOT_PATH + "stepthroughchecker";
ORYX.CONFIG.XFORMS_EXPORT_URL =			ORYX.CONFIG.ROOT_PATH + "xformsexport";
ORYX.CONFIG.XFORMS_EXPORT_ORBEON_URL =	ORYX.CONFIG.ROOT_PATH + "xformsexport-orbeon";
ORYX.CONFIG.XFORMS_IMPORT_URL =			ORYX.CONFIG.ROOT_PATH + "xformsimport";
ORYX.CONFIG.BPEL_EXPORT_URL =			ORYX.CONFIG.ROOT_PATH + "bpelexporter";
ORYX.CONFIG.BPEL4CHOR_EXPORT_URL =		ORYX.CONFIG.ROOT_PATH + "bpel4chorexporter";
ORYX.CONFIG.TREEGRAPH_SUPPORT =			ORYX.CONFIG.ROOT_PATH + "treegraphsupport";
ORYX.CONFIG.XPDL4CHOR2BPEL4CHOR_TRANSFORMATION_URL = ORYX.CONFIG.ROOT_PATH + "xpdl4chor2bpel4chor";
ORYX.CONFIG.RESOURCE_LIST =				ORYX.CONFIG.ROOT_PATH + "resourceList";
ORYX.CONFIG.BPMN_LAYOUTER =				ORYX.CONFIG.ROOT_PATH + "bpmnlayouter";
ORYX.CONFIG.EPC_LAYOUTER =				ORYX.CONFIG.ROOT_PATH + "epclayouter";
ORYX.CONFIG.BPMN2MIGRATION =			ORYX.CONFIG.ROOT_PATH + "bpmn2migration";
ORYX.CONFIG.BPMN20_SCHEMA_VALIDATION_ON = true;

	/* Namespaces */
ORYX.CONFIG.NAMESPACE_ORYX =			"http://www.b3mn.org/oryx";
ORYX.CONFIG.NAMESPACE_SVG =				"http://www.w3.org/2000/svg";

	/* UI */
ORYX.CONFIG.CANVAS_WIDTH =				1920; 
ORYX.CONFIG.CANVAS_HEIGHT =				1080;
ORYX.CONFIG.CANVAS_RESIZE_INTERVAL =	300;
ORYX.CONFIG.SELECTED_AREA_PADDING =		4;
ORYX.CONFIG.CANVAS_BACKGROUND_COLOR =	"none";
ORYX.CONFIG.GRID_DISTANCE =				30;
ORYX.CONFIG.GRID_ENABLED =				true;
ORYX.CONFIG.ZOOM_OFFSET =				0.1;
ORYX.CONFIG.DEFAULT_SHAPE_MARGIN =		60;
ORYX.CONFIG.SCALERS_SIZE =				7;
ORYX.CONFIG.MINIMUM_SIZE =				20;
ORYX.CONFIG.MAXIMUM_SIZE =				10000;
ORYX.CONFIG.OFFSET_MAGNET =				15;
ORYX.CONFIG.OFFSET_EDGE_LABEL_TOP =		14;
ORYX.CONFIG.OFFSET_EDGE_LABEL_MIDDLE =  4;
ORYX.CONFIG.OFFSET_EDGE_LABEL_BOTTOM =	12;
ORYX.CONFIG.OFFSET_EDGE_BOUNDS =		5;
ORYX.CONFIG.COPY_MOVE_OFFSET =			30;
ORYX.CONFIG.SHOW_GRIDLINE =             true;

ORYX.CONFIG.BORDER_OFFSET =				14;

ORYX.CONFIG.MAX_NUM_SHAPES_NO_GROUP	=	10;

ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET_CORNER = 30;
ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET = 45;

	/* Shape-Menu Align */
ORYX.CONFIG.SHAPEMENU_RIGHT =			"Oryx_Right";
ORYX.CONFIG.SHAPEMENU_BOTTOM =			"Oryx_Bottom";
ORYX.CONFIG.SHAPEMENU_LEFT =			"Oryx_Left";
ORYX.CONFIG.SHAPEMENU_TOP =				"Oryx_Top";

	/* Morph-Menu Item */
ORYX.CONFIG.MORPHITEM_DISABLED =		"Oryx_MorphItem_disabled";

	/* Property type names */
ORYX.CONFIG.TYPE_STRING =				"string";
ORYX.CONFIG.TYPE_BOOLEAN =				"boolean";
ORYX.CONFIG.TYPE_INTEGER =				"integer";
ORYX.CONFIG.TYPE_FLOAT =				"float";
ORYX.CONFIG.TYPE_COLOR =				"color";
ORYX.CONFIG.TYPE_DATE =					"date";
ORYX.CONFIG.TYPE_CHOICE =				"choice";
ORYX.CONFIG.TYPE_URL =					"url";
ORYX.CONFIG.TYPE_DIAGRAM_LINK =			"diagramlink";
ORYX.CONFIG.TYPE_COMPLEX =				"complex";
ORYX.CONFIG.TYPE_TEXT =					"text";
	
	/* Vertical line distance of multiline labels */
ORYX.CONFIG.LABEL_LINE_DISTANCE =		2;
ORYX.CONFIG.LABEL_DEFAULT_LINE_HEIGHT =	12;

ORYX.CONFIG.ENABLE_MORPHMENU_BY_HOVER = true;

	/* Editor constants come here */
ORYX.CONFIG.EDITOR_ALIGN_BOTTOM =		0x01;
ORYX.CONFIG.EDITOR_ALIGN_MIDDLE =		0x02;
ORYX.CONFIG.EDITOR_ALIGN_TOP =			0x04;
ORYX.CONFIG.EDITOR_ALIGN_LEFT =			0x08;
ORYX.CONFIG.EDITOR_ALIGN_CENTER =		0x10;
ORYX.CONFIG.EDITOR_ALIGN_RIGHT =		0x20;
ORYX.CONFIG.EDITOR_ALIGN_SIZE =			0x30;

ORYX.CONFIG.EVENT_MOUSEDOWN =			"mousedown";
ORYX.CONFIG.EVENT_MOUSEUP =				"mouseup";
ORYX.CONFIG.EVENT_MOUSEOVER =			"mouseover";
ORYX.CONFIG.EVENT_MOUSEOUT =			"mouseout";
ORYX.CONFIG.EVENT_MOUSEMOVE =			"mousemove";
ORYX.CONFIG.EVENT_DBLCLICK =			"dblclick";
ORYX.CONFIG.EVENT_KEYDOWN =				"keydown";
ORYX.CONFIG.EVENT_KEYUP =				"keyup";

ORYX.CONFIG.EVENT_LOADED =				"editorloaded";

ORYX.CONFIG.EVENT_SHAPEBOUNDS_CHANGED =     "shapeBoundsChanged";	
ORYX.CONFIG.EVENT_EXECUTE_COMMANDS =		"executeCommands";
ORYX.CONFIG.EVENT_AFTER_COMMANDS_EXECUTED = "afterCommandsExecuted";
ORYX.CONFIG.EVENT_AFTER_COMMANDS_ROLLBACK =		"afterCommandsRollback";
ORYX.CONFIG.EVENT_STENCIL_SET_LOADED =		"stencilSetLoaded";
ORYX.CONFIG.EVENT_SELECTION_CHANGED =		"selectionchanged";
ORYX.CONFIG.EVENT_SHAPEADDED =				"shapeadded";
ORYX.CONFIG.EVENT_SHAPEDELETED =			"shapedeleted";
ORYX.CONFIG.EVENT_SHAPESTODELETE =          "shapesToDelete";
ORYX.CONFIG.EVENT_SHAPESTOUNDODELETE =      "shapesToUndoDelete";
ORYX.CONFIG.EVENT_PROPERTY_CHANGED =		"propertyChanged";
ORYX.CONFIG.EVENT_DRAGDROP_START =			"dragdrop.start";
ORYX.CONFIG.EVENT_SHAPE_MENU_CLOSE =		"shape.menu.close";
ORYX.CONFIG.EVENT_DRAGDROP_END =			"dragdrop.end";
ORYX.CONFIG.EVENT_RESIZE_START =			"resize.start";
ORYX.CONFIG.EVENT_RESIZE_END =				"resize.end";
ORYX.CONFIG.EVENT_DRAGDOCKER_DOCKED =		"dragDocker.docked";
ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW =			"highlight.showHighlight";
ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE =			"highlight.hideHighlight";
ORYX.CONFIG.EVENT_LOADING_ENABLE =			"loading.enable";
ORYX.CONFIG.EVENT_LOADING_DISABLE =			"loading.disable";
ORYX.CONFIG.EVENT_LOADING_STATUS =			"loading.status";
ORYX.CONFIG.EVENT_OVERLAY_SHOW =			"overlay.show";
ORYX.CONFIG.EVENT_OVERLAY_HIDE =			"overlay.hide";
ORYX.CONFIG.EVENT_ARRANGEMENT_TOP =			"arrangement.setToTop";
ORYX.CONFIG.EVENT_ARRANGEMENT_BACK =		"arrangement.setToBack";
ORYX.CONFIG.EVENT_ARRANGEMENT_FORWARD =		"arrangement.setForward";
ORYX.CONFIG.EVENT_ARRANGEMENT_BACKWARD =	"arrangement.setBackward";
ORYX.CONFIG.EVENT_ARRANGEMENTLIGHT_TOP =	"arrangementLight.setToTop";
ORYX.CONFIG.EVENT_PROPWINDOW_PROP_CHANGED =	"propertyWindow.propertyChanged";
ORYX.CONFIG.EVENT_LAYOUT_ROWS =				"layout.rows";
ORYX.CONFIG.EVENT_LAYOUT_EDGES =            "layout.edges";
ORYX.CONFIG.EVENT_LAYOUT_BPEL =				"layout.BPEL";
ORYX.CONFIG.EVENT_LAYOUT_BPEL_VERTICAL =    "layout.BPEL.vertical";
ORYX.CONFIG.EVENT_LAYOUT_BPEL_HORIZONTAL =  "layout.BPEL.horizontal";
ORYX.CONFIG.EVENT_LAYOUT_BPEL_SINGLECHILD = "layout.BPEL.singlechild";
ORYX.CONFIG.EVENT_LAYOUT_BPEL_AUTORESIZE =	"layout.BPEL.autoresize";
ORYX.CONFIG.EVENT_AUTOLAYOUT_LAYOUT =		"autolayout.layout";
ORYX.CONFIG.EVENT_UNDO_EXECUTE =			"undo.execute";
ORYX.CONFIG.EVENT_UNDO_ROLLBACK =			"undo.rollback";
ORYX.CONFIG.EVENT_BUTTON_UPDATE =           "toolbar.button.update";
ORYX.CONFIG.EVENT_LAYOUT = 					"layout.dolayout";
ORYX.CONFIG.EVENT_COLOR_CHANGE = 			"color.change";
ORYX.CONFIG.EVENT_NEW_POST_MESSAGE_RECEIVED =      "newPostCommandReceived";
ORYX.CONFIG.EVENT_FARBRAUSCH_NEW_INFOS =    "farbrausch.new.infos";
ORYX.CONFIG.EVENT_USER_CHANGED =         "collaboration.userId";
ORYX.CONFIG.EVENT_VIEW_FIT_TO_MODEL =       "view.fitToModel";
ORYX.CONFIG.EVENT_SHAPE_METADATA_CHANGED =  "shapeMetaDataChanged";
ORYX.CONFIG.EVENT_SIDEBAR_LOADED =     "sideTabs.loaded";
ORYX.CONFIG.EVENT_SIDEBAR_NEW_TAB =     "sideTabs.newTab";
ORYX.CONFIG.EVENT_POST_MESSAGE =            "post.message";
ORYX.CONFIG.EVENT_SHOW_PROPERTYWINDOW =		"propertywindow.show";
ORYX.CONFIG.EVENT_CANVAS_RESIZED         = "canvasResize.resized";
ORYX.CONFIG.EVENT_CANVAS_RESIZE_SHAPES_MOVED = "canvasResize.shapesMoved";
ORYX.CONFIG.EVENT_CANVAS_RESIZE_UPDATE_HIGHLIGHTS = "canvasResize.updateHighlights";
ORYX.CONFIG.EVENT_LABEL_DBLCLICK = "label.dblclick";
ORYX.CONFIG.EVENT_CANVAS_DRAGDROP_LOCK_TOGGLE = "canvas.dragDropLockChanged";
ORYX.CONFIG.EVENT_SYNCRO_INITIALIZATION_DONE =     "syncro.initializationDone";
ORYX.CONFIG.EVENT_COMMAND_ADDED_TO_UNDO_STACK = "changelog.command_added";
ORYX.CONFIG.EVENT_COMMAND_MOVED_FROM_UNDO_STACK = "changelog.command_moved_from_undo";
ORYX.CONFIG.EVENT_COMMAND_MOVED_FROM_REDO_STACK = "changelog.command_moved_from_redo";
ORYX.CONFIG.EVENT_DOCKERDRAG = "dragTheDocker";
ORYX.CONFIG.EVENT_PAINT_NEWSHAPE = "paint.newShape";
ORYX.CONFIG.EVENT_PAINT_REMOVESHAPE = "paint.removeShape";

ORYX.CONFIG.EVENT_PAINT_CANVAS_TOGGLED = "paint.toggled";
ORYX.CONFIG.EVENT_BLIP_TOGGLED = "blip.toggled";
ORYX.CONFIG.EVENT_MODE_CHANGED = "mode.change";

ORYX.CONFIG.EVENT_CANVAS_ZOOMED = "canvas.zoomed";
ORYX.CONFIG.EVENT_DISPLAY_SCHLAUMEIER =     "schlaumeier.display";
ORYX.CONFIG.EVENT_HIDE_SCHLAUMEIER =        "schlaumeier.hide";
ORYX.CONFIG.EVENT_ORYX_SHOWN =              "oryx.shown";
ORYX.CONFIG.EVENT_DISABLE_DOCKER_CREATION = "addDocker.disableCreation";
ORYX.CONFIG.EVENT_ENABLE_DOCKER_CREATION = "addDocker.enableCreation";
ORYX.CONFIG.EVENT_SYNCRO_NEW_COMMANDS_FOR_REMOTE_STATE = "syncro.newCommandsForRemoteState"
ORYX.CONFIG.EVENT_SYNCRO_NEW_REMOTE_COMMANDS = "syncro.newRemoteCommands"


ORYX.CONFIG.FARBRAUSCH_DEFAULT_COLOR = "#000000";
	
	/* Selection Shapes Highlights */
ORYX.CONFIG.SELECTION_HIGHLIGHT_SIZE =				5;
ORYX.CONFIG.SELECTION_HIGHLIGHT_COLOR =				"#4444FF";
ORYX.CONFIG.SELECTION_HIGHLIGHT_COLOR2 =			"#9999FF";
	
ORYX.CONFIG.SELECTION_HIGHLIGHT_STYLE_CORNER = 		"corner";
ORYX.CONFIG.SELECTION_HIGHLIGHT_STYLE_RECTANGLE = 	"rectangle";
	
ORYX.CONFIG.SELECTION_VALID_COLOR =					"#00FF00";
ORYX.CONFIG.SELECTION_INVALID_COLOR =				"#FF0000";


ORYX.CONFIG.DOCKER_DOCKED_COLOR =		"#00FF00";
ORYX.CONFIG.DOCKER_UNDOCKED_COLOR =		"#FF0000";
ORYX.CONFIG.DOCKER_SNAP_OFFSET =		10;
		
	/* Copy & Paste */
ORYX.CONFIG.EDIT_OFFSET_PASTE =			10;

	/* Key-Codes */
ORYX.CONFIG.KEY_CODE_X = 				88;
ORYX.CONFIG.KEY_CODE_C = 				67;
ORYX.CONFIG.KEY_CODE_V = 				86;
ORYX.CONFIG.KEY_CODE_DELETE = 			46;
ORYX.CONFIG.KEY_CODE_META =				224;
ORYX.CONFIG.KEY_CODE_BACKSPACE =		8;
ORYX.CONFIG.KEY_CODE_LEFT =				37;
ORYX.CONFIG.KEY_CODE_RIGHT =			39;
ORYX.CONFIG.KEY_CODE_UP =				38;
ORYX.CONFIG.KEY_CODE_DOWN =				40;

	// TODO Determine where the lowercase constants are still used and remove them from here.
ORYX.CONFIG.KEY_Code_enter =			12;
ORYX.CONFIG.KEY_Code_left =				37;
ORYX.CONFIG.KEY_Code_right =			39;
ORYX.CONFIG.KEY_Code_top =				38;
ORYX.CONFIG.KEY_Code_bottom =			40;

/* Supported Meta Keys */
	
ORYX.CONFIG.META_KEY_META_CTRL = 		"metactrl";
ORYX.CONFIG.META_KEY_ALT = 				"alt";
ORYX.CONFIG.META_KEY_SHIFT = 			"shift";

/* Key Actions */

ORYX.CONFIG.KEY_ACTION_DOWN = 			"down";
ORYX.CONFIG.KEY_ACTION_UP = 			"up";
