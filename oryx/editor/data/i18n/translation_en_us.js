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
 * Contains all strings for the default language (en-us).
 * Version 1 - 08/29/08
 */
if(!ORYX) var ORYX = {};

if(!ORYX.I18N) ORYX.I18N = {};

ORYX.I18N.Language = "en_us"; //Pattern <ISO language code>_<ISO country code> in lower case!

if(!ORYX.I18N.Oryx) ORYX.I18N.Oryx = {};

ORYX.I18N.Oryx.title		= "Oryx";
ORYX.I18N.Oryx.noBackendDefined	= "Caution! \nNo Backend defined.\n The requested model cannot be loaded. Try to load a configuration with a save plugin.";
ORYX.I18N.Oryx.pleaseWait 	= "Please wait while loading...";
ORYX.I18N.Oryx.notLoggedOn = "Not logged on";
ORYX.I18N.Oryx.editorOpenTimeout = "The editor does not seem to be started yet. Please check, whether you have a popup blocker enabled and disable it or allow popups for this site. We will never display any commercials on this site.";

if(!ORYX.I18N.AddDocker) ORYX.I18N.AddDocker = {};

ORYX.I18N.AddDocker.group = "Docker";
ORYX.I18N.AddDocker.add = "Add Docker";
ORYX.I18N.AddDocker.addDesc = "Add docker to edge (Alt+Click)";
ORYX.I18N.AddDocker.del = "Delete Docker";
ORYX.I18N.AddDocker.delDesc = "Delete docker (Alt+Click)";

if(!ORYX.I18N.SSExtensionLoader) ORYX.I18N.SSExtensionLoader = {};

ORYX.I18N.SSExtensionLoader.group = "Stencil Set";
ORYX.I18N.SSExtensionLoader.add = "Add Stencil Set Extension";
ORYX.I18N.SSExtensionLoader.addDesc = "Add a stencil set extension";
ORYX.I18N.SSExtensionLoader.loading = "Loading Stencil Set Extension";
ORYX.I18N.SSExtensionLoader.noExt = "There are no extensions available or all available extensions are already loaded.";
ORYX.I18N.SSExtensionLoader.failed1 = "Loading stencil set extensions configuration failed. The response is not a valid configuration file.";
ORYX.I18N.SSExtensionLoader.failed2 = "Loading stencil set extension configuration file failed. The request returned an error.";
ORYX.I18N.SSExtensionLoader.panelTitle = "Stencil Set Extensions";
ORYX.I18N.SSExtensionLoader.panelText = "Select the stencil set extensions you want to load.";

if(!ORYX.I18N.AdHocCC) ORYX.I18N.AdHocCC = {};

ORYX.I18N.AdHocCC.group = "Ad Hoc";
ORYX.I18N.AdHocCC.compl = "Edit Completion Condition";
ORYX.I18N.AdHocCC.complDesc = "Edit an Ad Hoc Activity's Completion Condition";
ORYX.I18N.AdHocCC.notOne = "Not exactly one element selected!";
ORYX.I18N.AdHocCC.nodAdHocCC = "Selected element has no ad hoc completion condition!";
ORYX.I18N.AdHocCC.selectTask = "Select a task...";
ORYX.I18N.AdHocCC.selectState = "Select a state...";
ORYX.I18N.AdHocCC.addExp = "Add Expression";
ORYX.I18N.AdHocCC.selectDataField = "Select a data field...";
ORYX.I18N.AdHocCC.enterEqual = "Enter a value that must equal...";
ORYX.I18N.AdHocCC.and = "and";
ORYX.I18N.AdHocCC.or = "or";
ORYX.I18N.AdHocCC.not = "not";
ORYX.I18N.AdHocCC.clearCC = "Clear Completion Condition";
ORYX.I18N.AdHocCC.editCC = "Edit Ad-Hoc Completion Condtions";
ORYX.I18N.AdHocCC.addExecState = "Add Execution State Expression: ";
ORYX.I18N.AdHocCC.addDataExp = "Add Data Expression: ";
ORYX.I18N.AdHocCC.addLogOp = "Add Logical Operators: ";
ORYX.I18N.AdHocCC.curCond = "Current Completion Condition: ";

if(!ORYX.I18N.AMLSupport) ORYX.I18N.AMLSupport = {};

ORYX.I18N.AMLSupport.group = "EPC";
ORYX.I18N.AMLSupport.imp = "Import AML file";
ORYX.I18N.AMLSupport.impDesc = "Import an Aris 7 AML file";
ORYX.I18N.AMLSupport.failed = "Importing AML file failed. Please check, if the selected file is a valid AML file. Error message: ";
ORYX.I18N.AMLSupport.failed2 = "Importing AML file failed: ";
ORYX.I18N.AMLSupport.noRights = "You have no rights to import multiple EPC-Diagrams (Login required).";
ORYX.I18N.AMLSupport.panelText = "Select an AML (.xml) file to import.";
ORYX.I18N.AMLSupport.file = "File";
ORYX.I18N.AMLSupport.importBtn = "Import AML-File";
ORYX.I18N.AMLSupport.get = "Get diagrams...";
ORYX.I18N.AMLSupport.close = "Close";
ORYX.I18N.AMLSupport.title = "Title";
ORYX.I18N.AMLSupport.selectDiagrams = "Select the diagram(s) you want to import. <br/> If one model is selected, it will be imported in the current editor, if more than one is selected, those models will directly be stored in the repository.";
ORYX.I18N.AMLSupport.impText = "Import";
ORYX.I18N.AMLSupport.impProgress = "Importing...";
ORYX.I18N.AMLSupport.cancel = "Cancel";
ORYX.I18N.AMLSupport.name = "Name";
ORYX.I18N.AMLSupport.allImported = "All imported diagrams.";
ORYX.I18N.AMLSupport.ok = "Ok";

if(!ORYX.I18N.Arrangement) ORYX.I18N.Arrangement = {};

ORYX.I18N.Arrangement.groupZ = "Z-Order";
ORYX.I18N.Arrangement.btf = "Bring To Front";
ORYX.I18N.Arrangement.btfDesc = "Bring to Front";
ORYX.I18N.Arrangement.btb = "Bring To Back";
ORYX.I18N.Arrangement.btbDesc = "Bring To Back";
ORYX.I18N.Arrangement.bf = "Bring Forward";
ORYX.I18N.Arrangement.bfDesc = "Bring Forward";
ORYX.I18N.Arrangement.bb = "Bring Backward";
ORYX.I18N.Arrangement.bbDesc = "Bring Backward";
ORYX.I18N.Arrangement.groupA = "Alignment";
ORYX.I18N.Arrangement.ab = "Alignment Bottom";
ORYX.I18N.Arrangement.abDesc = "Bottom";
ORYX.I18N.Arrangement.am = "Alignment Middle";
ORYX.I18N.Arrangement.amDesc = "Middle";
ORYX.I18N.Arrangement.at = "Alignment Top";
ORYX.I18N.Arrangement.atDesc = "Top";
ORYX.I18N.Arrangement.al = "Alignment Left";
ORYX.I18N.Arrangement.alDesc = "Left";
ORYX.I18N.Arrangement.ac = "Alignment Center";
ORYX.I18N.Arrangement.acDesc = "Center";
ORYX.I18N.Arrangement.ar = "Alignment Right";
ORYX.I18N.Arrangement.arDesc = "Right";
ORYX.I18N.Arrangement.as = "Alignment Same Size";
ORYX.I18N.Arrangement.asDesc = "Same Size";

if(!ORYX.I18N.BPELSupport) ORYX.I18N.BPELSupport = {};

ORYX.I18N.BPELSupport.group = "BPEL";
ORYX.I18N.BPELSupport.exp = "Export BPEL";
ORYX.I18N.BPELSupport.expDesc = "Export diagram to BPEL";
ORYX.I18N.BPELSupport.imp = "Import BPEL";
ORYX.I18N.BPELSupport.impDesc = "Import a BPEL file";
ORYX.I18N.BPELSupport.selectFile = "Select a BPEL file to import";
ORYX.I18N.BPELSupport.file = "file";
ORYX.I18N.BPELSupport.impPanel = "Import BPEL file";
ORYX.I18N.BPELSupport.impBtn = "Import";
ORYX.I18N.BPELSupport.content = "content";
ORYX.I18N.BPELSupport.close = "Close";
ORYX.I18N.BPELSupport.error = "Error";
ORYX.I18N.BPELSupport.progressImp = "Import...";
ORYX.I18N.BPELSupport.progressExp = "Export...";
ORYX.I18N.BPELSupport.impFailed = "An error while importing occurs! <br/>Please check error message: <br/><br/>";

if(!ORYX.I18N.BPELLayout) ORYX.I18N.BPELLayout = {};

ORYX.I18N.BPELLayout.group = "BPELLayout";
ORYX.I18N.BPELLayout.disable = "disable layout";
ORYX.I18N.BPELLayout.disDesc = "disable auto layout plug-in";
ORYX.I18N.BPELLayout.enable = "enable layout";
ORYX.I18N.BPELLayout.enDesc = "enable auto layout plug-in";

if(!ORYX.I18N.BPEL4ChorSupport) ORYX.I18N.BPEL4ChorSupport = {};

ORYX.I18N.BPEL4ChorSupport.group = "BPEL4Chor";
ORYX.I18N.BPEL4ChorSupport.exp = "Export BPEL4Chor";
ORYX.I18N.BPEL4ChorSupport.expDesc = "Export diagram to BPEL4Chor";
ORYX.I18N.BPEL4ChorSupport.imp = "Import BPEL4Chor";
ORYX.I18N.BPEL4ChorSupport.impDesc = "Import a BPEL4Chor file";
ORYX.I18N.BPEL4ChorSupport.gen = "BPEL4Chor generator";
ORYX.I18N.BPEL4ChorSupport.genDesc = "generate values of some BPEL4Chor properties if they are already known(e.g. sender of messageLink)";
ORYX.I18N.BPEL4ChorSupport.selectFile = "Select a BPEL4Chor file to import";
ORYX.I18N.BPEL4ChorSupport.file = "file";
ORYX.I18N.BPEL4ChorSupport.impPanel = "Import BPEL4Chor file";
ORYX.I18N.BPEL4ChorSupport.impBtn = "Import";
ORYX.I18N.BPEL4ChorSupport.content = "content";
ORYX.I18N.BPEL4ChorSupport.close = "Close";
ORYX.I18N.BPEL4ChorSupport.error = "Error";
ORYX.I18N.BPEL4ChorSupport.progressImp = "Import...";
ORYX.I18N.BPEL4ChorSupport.progressExp = "Export...";
ORYX.I18N.BPEL4ChorSupport.impFailed = "An error while importing occurs! <br/>Please check error message: <br/><br/>";

if(!ORYX.I18N.Bpel4ChorTransformation) ORYX.I18N.Bpel4ChorTransformation = {};

ORYX.I18N.Bpel4ChorTransformation.group = "Export";
ORYX.I18N.Bpel4ChorTransformation.exportBPEL = "Export BPEL4Chor";
ORYX.I18N.Bpel4ChorTransformation.exportBPELDesc = "Export diagram to BPEL4Chor";
ORYX.I18N.Bpel4ChorTransformation.exportXPDL = "Export XPDL4Chor";
ORYX.I18N.Bpel4ChorTransformation.exportXPDLDesc = "Export diagram to XPDL4Chor";
ORYX.I18N.Bpel4ChorTransformation.warning = "Warning";
ORYX.I18N.Bpel4ChorTransformation.wrongValue = 'The changed name must have the value "1" to avoid errors during the transformation to BPEL4Chor';
ORYX.I18N.Bpel4ChorTransformation.loopNone = 'The loop type of the receive task must be "None" to be transformable to BPEL4Chor';
ORYX.I18N.Bpel4ChorTransformation.error = "Error";
ORYX.I18N.Bpel4ChorTransformation.noSource = "1 with id 2 has no source object.";
ORYX.I18N.Bpel4ChorTransformation.noTarget = "1 with id 2 has no target object.";
ORYX.I18N.Bpel4ChorTransformation.transCall = "An error occured during the transformation call. 1:2";
ORYX.I18N.Bpel4ChorTransformation.loadingXPDL4ChorExport = "Export to XPDL4Chor";
ORYX.I18N.Bpel4ChorTransformation.loadingBPEL4ChorExport = "Export to BPEL4Chor";
ORYX.I18N.Bpel4ChorTransformation.noGen = "The transformation input could not be generated: 1\n2\n";

ORYX.I18N.BPMN2PNConverter = {
  name: "Convert to Petri net",
  desc: "Converts BPMN diagrams to Petri nets",
  group: "Export",
  error: "Error",
  errors: {
    server: "Couldn't import BPNM diagram.",
    noRights: "Don't you have read permissions on given model?",
    notSaved: "Model must be saved and reopened for using Petri net exporter!"
  },
  progress: {
      status: "Status",
      importingModel: "Importing BPMN Model",
      fetchingModel: "Fetching",
      convertingModel: "Converting",
      renderingModel: "Rendering"
  }
}

if(!ORYX.I18N.TransformationDownloadDialog) ORYX.I18N.TransformationDownloadDialog = {};

ORYX.I18N.TransformationDownloadDialog.error = "Error";
ORYX.I18N.TransformationDownloadDialog.noResult = "The transformation service did not return a result.";
ORYX.I18N.TransformationDownloadDialog.errorParsing = "Error During the Parsing of the Diagram.";
ORYX.I18N.TransformationDownloadDialog.transResult = "Transformation Results";
ORYX.I18N.TransformationDownloadDialog.showFile = "Show the result file";
ORYX.I18N.TransformationDownloadDialog.downloadFile = "Download the result file";
ORYX.I18N.TransformationDownloadDialog.downloadAll = "Download all result files";

if(!ORYX.I18N.DesynchronizabilityOverlay) ORYX.I18N.DesynchronizabilityOverlay = {};
//TODO desynchronizability is not a correct term
ORYX.I18N.DesynchronizabilityOverlay.group = "Overlay";
ORYX.I18N.DesynchronizabilityOverlay.name = "Desynchronizability Checker";
ORYX.I18N.DesynchronizabilityOverlay.desc = "Desynchronizability Checker";
ORYX.I18N.DesynchronizabilityOverlay.sync = "The net is desynchronizable.";
ORYX.I18N.DesynchronizabilityOverlay.error = "The net has 1 syntax errors.";
ORYX.I18N.DesynchronizabilityOverlay.invalid = "Invalid answer from server.";

if(!ORYX.I18N.Edit) ORYX.I18N.Edit = {};

ORYX.I18N.Edit.group = "Edit";
ORYX.I18N.Edit.cut = "Cut";
ORYX.I18N.Edit.cutDesc = "Cut selected shapes (Ctrl+X)";
ORYX.I18N.Edit.copy = "Copy";
ORYX.I18N.Edit.copyDesc = "Copy selected shapes(Ctrl+C)";
ORYX.I18N.Edit.paste = "Paste";
ORYX.I18N.Edit.pasteDesc = "Paste selected shapes(Ctrl+V)";
ORYX.I18N.Edit.del = "Delete";
ORYX.I18N.Edit.delDesc = "Deletes selected shapes (Delete)";

if(!ORYX.I18N.EPCSupport) ORYX.I18N.EPCSupport = {};

ORYX.I18N.EPCSupport.group = "EPC";
ORYX.I18N.EPCSupport.exp = "Export EPC";
ORYX.I18N.EPCSupport.expDesc = "Export diagram to EPML";
ORYX.I18N.EPCSupport.imp = "Import EPC";
ORYX.I18N.EPCSupport.impDesc = "Import an EPML file";
ORYX.I18N.EPCSupport.progressExp = "Exporting model";
ORYX.I18N.EPCSupport.selectFile = "Select an EPML (.empl) file to import.";
ORYX.I18N.EPCSupport.file = "File";
ORYX.I18N.EPCSupport.impPanel = "Import EPML File";
ORYX.I18N.EPCSupport.impBtn = "Import";
ORYX.I18N.EPCSupport.close = "Close";
ORYX.I18N.EPCSupport.error = "Error";
ORYX.I18N.EPCSupport.progressImp = "Import...";

if(!ORYX.I18N.ERDFSupport) ORYX.I18N.ERDFSupport = {};

ORYX.I18N.ERDFSupport.exp = "Export to ERDF";
ORYX.I18N.ERDFSupport.expDesc = "Export to ERDF";
ORYX.I18N.ERDFSupport.imp = "Import from ERDF";
ORYX.I18N.ERDFSupport.impDesc = "Import from ERDF";
ORYX.I18N.ERDFSupport.impFailed = "Request for import of ERDF failed.";
ORYX.I18N.ERDFSupport.impFailed2 = "An error while importing occurs! <br/>Please check error message: <br/><br/>";
ORYX.I18N.ERDFSupport.error = "Error";
ORYX.I18N.ERDFSupport.noCanvas = "The xml document has no Oryx canvas node included!";
ORYX.I18N.ERDFSupport.noSS = "The Oryx canvas node has no stencil set definition included!";
ORYX.I18N.ERDFSupport.wrongSS = "The given stencil set does not fit to the current editor!";
ORYX.I18N.ERDFSupport.selectFile = "Select an ERDF (.xml) file or type in the ERDF to import it!";
ORYX.I18N.ERDFSupport.file = "File";
ORYX.I18N.ERDFSupport.impERDF = "Import ERDF";
ORYX.I18N.ERDFSupport.impBtn = "Import";
ORYX.I18N.ERDFSupport.impProgress = "Importing...";
ORYX.I18N.ERDFSupport.close = "Close";
ORYX.I18N.ERDFSupport.deprTitle = "Really export to eRDF?";
ORYX.I18N.ERDFSupport.deprText = "Exporting to eRDF is not recommended anymore because the support will be stopped in future versions of the Oryx editor. If possible, export the model to JSON. Do you want to export anyway?";

if(!ORYX.I18N.jPDLSupport) ORYX.I18N.jPDLSupport = {};

ORYX.I18N.jPDLSupport.group = "ExecBPMN";
ORYX.I18N.jPDLSupport.exp = "Export to jPDL";
ORYX.I18N.jPDLSupport.expDesc = "Export to jPDL";
ORYX.I18N.jPDLSupport.imp = "Import from jPDL";
ORYX.I18N.jPDLSupport.impDesc = "Import jPDL File";
ORYX.I18N.jPDLSupport.impFailedReq = "Request for import of jPDL failed.";
ORYX.I18N.jPDLSupport.impFailedJson = "Transformation of jPDL failed.";
ORYX.I18N.jPDLSupport.impFailedJsonAbort = "Import aborted.";
ORYX.I18N.jPDLSupport.loadSseQuestionTitle = "jBPM stencil set extension needs to be loaded"; 
ORYX.I18N.jPDLSupport.loadSseQuestionBody = "In order to import jPDL, the stencil set extension has to be loaded. Do you want to proceed?";
ORYX.I18N.jPDLSupport.expFailedReq = "Request for export of model failed.";
ORYX.I18N.jPDLSupport.expFailedXml = "Export to jPDL failed. Exporter reported: ";
ORYX.I18N.jPDLSupport.error = "Error";
ORYX.I18N.jPDLSupport.selectFile = "Select an jPDL (.xml) file or type in the jPDL to import it!";
ORYX.I18N.jPDLSupport.file = "File";
ORYX.I18N.jPDLSupport.impJPDL = "Import jPDL";
ORYX.I18N.jPDLSupport.impBtn = "Import";
ORYX.I18N.jPDLSupport.impProgress = "Importing...";
ORYX.I18N.jPDLSupport.close = "Close";

if(!ORYX.I18N.Bpmn2Bpel) ORYX.I18N.Bpmn2Bpel = {};

ORYX.I18N.Bpmn2Bpel.group = "ExecBPMN";
ORYX.I18N.Bpmn2Bpel.show = "Show transformed BPEL";
ORYX.I18N.Bpmn2Bpel.download = "Download transformed BPEL";
ORYX.I18N.Bpmn2Bpel.deploy = "Deploy transformed BPEL";
ORYX.I18N.Bpmn2Bpel.showDesc = "Transforms BPMN to BPEL and shows the result in a new window.";
ORYX.I18N.Bpmn2Bpel.downloadDesc = "Transforms BPMN to BPEL and offers to download the result.";
ORYX.I18N.Bpmn2Bpel.deployDesc = "Transforms BPMN to BPEL and deploys the business process on the BPEL-Engine Apache ODE";
ORYX.I18N.Bpmn2Bpel.transfFailed = "Request for transformation to BPEL failed.";
ORYX.I18N.Bpmn2Bpel.ApacheOdeUrlInputTitle = "Apache ODE URL";
ORYX.I18N.Bpmn2Bpel.ApacheOdeUrlInputLabelDeploy = "Deploy Process";
ORYX.I18N.Bpmn2Bpel.ApacheOdeUrlInputLabelCancel = "Cancel";
ORYX.I18N.Bpmn2Bpel.ApacheOdeUrlInputPanelText = "Please type-in the URL to the Apache ODE BPEL-Engine. E.g.: http://myserver:8080/ode";


if(!ORYX.I18N.Save) ORYX.I18N.Save = {};

ORYX.I18N.Save.group = "File";
ORYX.I18N.Save.save = "Save";
ORYX.I18N.Save.saveDesc = "Save";
ORYX.I18N.Save.saveAs = "Save As...";
ORYX.I18N.Save.saveAsDesc = "Save As...";
ORYX.I18N.Save.unsavedData = "There are unsaved data, please save before you leave, otherwise your changes get lost!";
ORYX.I18N.Save.newProcess = "New Process";
ORYX.I18N.Save.saveAsTitle = "Save as...";
ORYX.I18N.Save.saveBtn = "Save";
ORYX.I18N.Save.close = "Close";
ORYX.I18N.Save.savedAs = "Saved As";
ORYX.I18N.Save.saved = "Saved!";
ORYX.I18N.Save.failed = "Saving failed.";
ORYX.I18N.Save.noRights = "You have no rights to save changes.";
ORYX.I18N.Save.saving = "Saving";
ORYX.I18N.Save.saveAsHint = "The process diagram is stored under:";

if(!ORYX.I18N.File) ORYX.I18N.File = {};

ORYX.I18N.File.group = "File";
ORYX.I18N.File.print = "Print";
ORYX.I18N.File.printDesc = "Print current model";
ORYX.I18N.File.pdf = "Export as PDF";
ORYX.I18N.File.pdfDesc = "Export as PDF";
ORYX.I18N.File.info = "Info";
ORYX.I18N.File.infoDesc = "Info";
ORYX.I18N.File.genPDF = "Generating PDF";
ORYX.I18N.File.genPDFFailed = "Generating PDF failed.";
ORYX.I18N.File.printTitle = "Print";
ORYX.I18N.File.printMsg = "We are currently experiencing problems with the printing function. We recommend using the PDF Export to print the diagram. Do you really want to continue printing?";

if(!ORYX.I18N.Grouping) ORYX.I18N.Grouping = {};

ORYX.I18N.Grouping.grouping = "Grouping";
ORYX.I18N.Grouping.group = "Group";
ORYX.I18N.Grouping.groupDesc = "Groups all selected shapes";
ORYX.I18N.Grouping.ungroup = "Ungroup";
ORYX.I18N.Grouping.ungroupDesc = "Deletes the group of all selected Shapes";

if(!ORYX.I18N.IBPMN2BPMN) ORYX.I18N.IBPMN2BPMN = {};

ORYX.I18N.IBPMN2BPMN.group ="Export";
ORYX.I18N.IBPMN2BPMN.name ="IBPMN 2 BPMN Mapping";
ORYX.I18N.IBPMN2BPMN.desc ="Convert IBPMN to BPMN";

if(!ORYX.I18N.Loading) ORYX.I18N.Loading = {};

ORYX.I18N.Loading.waiting ="Please wait...";

if(!ORYX.I18N.Pnmlexport) ORYX.I18N.Pnmlexport = {};

ORYX.I18N.Pnmlexport.group ="Export";
ORYX.I18N.Pnmlexport.name ="BPMN to PNML";
ORYX.I18N.Pnmlexport.desc ="Export as executable PNML and deploy";

if(!ORYX.I18N.PropertyWindow) ORYX.I18N.PropertyWindow = {};

ORYX.I18N.PropertyWindow.name = "Name";
ORYX.I18N.PropertyWindow.value = "Value";
ORYX.I18N.PropertyWindow.selected = "selected";
ORYX.I18N.PropertyWindow.clickIcon = "Click Icon";
ORYX.I18N.PropertyWindow.add = "Add";
ORYX.I18N.PropertyWindow.rem = "Remove";
ORYX.I18N.PropertyWindow.complex = "Editor for a Complex Type";
ORYX.I18N.PropertyWindow.text = "Editor for a Text Type";
ORYX.I18N.PropertyWindow.ok = "Ok";
ORYX.I18N.PropertyWindow.cancel = "Cancel";
ORYX.I18N.PropertyWindow.dateFormat = "m/d/y";

if(!ORYX.I18N.ShapeMenuPlugin) ORYX.I18N.ShapeMenuPlugin = {};

ORYX.I18N.ShapeMenuPlugin.drag = "Drag";
ORYX.I18N.ShapeMenuPlugin.clickDrag = "Click or drag";
ORYX.I18N.ShapeMenuPlugin.morphMsg = "Morph shape";

if(!ORYX.I18N.SimplePnmlexport) ORYX.I18N.SimplePnmlexport = {};

ORYX.I18N.SimplePnmlexport.group = "Export";
ORYX.I18N.SimplePnmlexport.name = "Export to PNML";
ORYX.I18N.SimplePnmlexport.desc = "Export to PNML";

if(!ORYX.I18N.StepThroughPlugin) ORYX.I18N.StepThroughPlugin = {};

ORYX.I18N.StepThroughPlugin.group = "Step Through";
ORYX.I18N.StepThroughPlugin.stepThrough = "Step Through";
ORYX.I18N.StepThroughPlugin.stepThroughDesc = "Step through your model";
ORYX.I18N.StepThroughPlugin.undo = "Undo";
ORYX.I18N.StepThroughPlugin.undoDesc = "Undo one Step";
ORYX.I18N.StepThroughPlugin.error = "Can't step through this diagram.";
ORYX.I18N.StepThroughPlugin.executing = "Executing";

if(!ORYX.I18N.SyntaxChecker) ORYX.I18N.SyntaxChecker = {};

ORYX.I18N.SyntaxChecker.group = "Verification";
ORYX.I18N.SyntaxChecker.name = "Syntax Checker";
ORYX.I18N.SyntaxChecker.desc = "Check Syntax";
ORYX.I18N.SyntaxChecker.noErrors = "There are no syntax errors.";
ORYX.I18N.SyntaxChecker.invalid = "Invalid answer from server.";
ORYX.I18N.SyntaxChecker.checkingMessage = "Checking ...";

if(!ORYX.I18N.Undo) ORYX.I18N.Undo = {};

ORYX.I18N.Undo.group = "Undo";
ORYX.I18N.Undo.undo = "Undo";
ORYX.I18N.Undo.undoDesc = "Undo (Ctrl+Z)";
ORYX.I18N.Undo.redo = "Redo";
ORYX.I18N.Undo.redoDesc = "Redo (Ctrl+Y)";

if(!ORYX.I18N.Validator) ORYX.I18N.Validator = {};
ORYX.I18N.Validator.checking = "Checking";

if(!ORYX.I18N.View) ORYX.I18N.View = {};

ORYX.I18N.View.group = "Zoom";
ORYX.I18N.View.zoomIn = "Zoom In";
ORYX.I18N.View.zoomInDesc = "Zoom in";
ORYX.I18N.View.zoomOut = "Zoom Out";
ORYX.I18N.View.zoomOutDesc = "Zoom out";
ORYX.I18N.View.zoomStandard = "Zoom Standard";
ORYX.I18N.View.zoomStandardDesc = "Zoom to 100%";
ORYX.I18N.View.zoomFitToModel = "Zoom fit to model";
ORYX.I18N.View.zoomFitToModelDesc = "Zoom to show entire model";

if(!ORYX.I18N.XFormsSerialization) ORYX.I18N.XFormsSerialization = {};

ORYX.I18N.XFormsSerialization.group = "XForms Serialization";
ORYX.I18N.XFormsSerialization.exportXForms = "XForms Export";
ORYX.I18N.XFormsSerialization.exportXFormsDesc = "Export XForms+XHTML markup";
ORYX.I18N.XFormsSerialization.importXForms = "XForms Import";
ORYX.I18N.XFormsSerialization.importXFormsDesc = "Import XForms+XHTML markup";
ORYX.I18N.XFormsSerialization.noClientXFormsSupport = "No XForms support";
ORYX.I18N.XFormsSerialization.noClientXFormsSupportDesc = "<h2>Your browser does not support XForms. Please install the <a href=\"https://addons.mozilla.org/firefox/addon/824\" target=\"_blank\">Mozilla XForms Add-on</a> for Firefox.</h2>";
ORYX.I18N.XFormsSerialization.ok = "Ok";
ORYX.I18N.XFormsSerialization.selectFile = "Select a XHTML (.xhtml) file or type in the XForms+XHTML markup to import it!";
ORYX.I18N.XFormsSerialization.selectCss = "Please insert url of css file";
ORYX.I18N.XFormsSerialization.file = "File";
ORYX.I18N.XFormsSerialization.impFailed = "Request for import of document failed.";
ORYX.I18N.XFormsSerialization.impTitle = "Import XForms+XHTML document";
ORYX.I18N.XFormsSerialization.expTitle = "Export XForms+XHTML document";
ORYX.I18N.XFormsSerialization.impButton = "Import";
ORYX.I18N.XFormsSerialization.impProgress = "Importing...";
ORYX.I18N.XFormsSerialization.close = "Close";


if(!ORYX.I18N.TreeGraphSupport) ORYX.I18N.TreeGraphSupport = {};

ORYX.I18N.TreeGraphSupport.syntaxCheckName = "Syntax Check";
ORYX.I18N.TreeGraphSupport.group = "Tree Graph Support";
ORYX.I18N.TreeGraphSupport.syntaxCheckDesc = "Check the syntax of an tree graph structure";

if(!ORYX.I18N.QueryEvaluator) ORYX.I18N.QueryEvaluator = {};

ORYX.I18N.QueryEvaluator.name = "Query Evaluator";
ORYX.I18N.QueryEvaluator.group = "Verification";
ORYX.I18N.QueryEvaluator.desc = "Evaluate query";
ORYX.I18N.QueryEvaluator.noResult = "Query resulted in no match.";
ORYX.I18N.QueryEvaluator.invalidResponse = "Invalid answer from server.";

// if(!ORYX.I18N.QueryResultHighlighter) ORYX.I18N.QueryResultHighlighter = {};
// 
// ORYX.I18N.QueryResultHighlighter.name = "Query Result Highlighter";

/** New Language Properties: 08.12.2008 */

ORYX.I18N.PropertyWindow.title = "Properties";

if(!ORYX.I18N.ShapeRepository) ORYX.I18N.ShapeRepository = {};
ORYX.I18N.ShapeRepository.title = "Shape Repository";

ORYX.I18N.Save.dialogDesciption = "Please enter a name, a description and a comment.";
ORYX.I18N.Save.dialogLabelTitle = "Title";
ORYX.I18N.Save.dialogLabelDesc = "Description";
ORYX.I18N.Save.dialogLabelType = "Type";
ORYX.I18N.Save.dialogLabelComment = "Revision comment";

ORYX.I18N.Validator.name = "BPMN Validator";
ORYX.I18N.Validator.description = "Validation for BPMN";

ORYX.I18N.SSExtensionLoader.labelImport = "Import";
ORYX.I18N.SSExtensionLoader.labelCancel = "Cancel";

Ext.MessageBox.buttonText.yes = "Yes";
Ext.MessageBox.buttonText.no = "No";
Ext.MessageBox.buttonText.cancel = "Cancel";
Ext.MessageBox.buttonText.ok = "OK";


/** New Language Properties: 28.01.2009 */
if(!ORYX.I18N.BPMN2XPDL) ORYX.I18N.BPMN2XPDL = {};
ORYX.I18N.BPMN2XPDL.group = "Export";
ORYX.I18N.BPMN2XPDL.xpdlExport = "Export to XPDL";

/** Resource Perspective Additions: 24 March 2009 */
if(!ORYX.I18N.ResourcesSoDAdd) ORYX.I18N.ResourcesSoDAdd = {};

ORYX.I18N.ResourcesSoDAdd.name = "Define Separation of Duties Contraint";
ORYX.I18N.ResourcesSoDAdd.group = "Resource Perspective";
ORYX.I18N.ResourcesSoDAdd.desc = "Define a Separation of Duties constraint for the selected tasks";

if(!ORYX.I18N.ResourcesSoDShow) ORYX.I18N.ResourcesSoDShow = {};

ORYX.I18N.ResourcesSoDShow.name = "Show Separation of Duties Constraints";
ORYX.I18N.ResourcesSoDShow.group = "Resource Perspective";
ORYX.I18N.ResourcesSoDShow.desc = "Show Separation of Duties constraints of the selected task";

if(!ORYX.I18N.ResourcesBoDAdd) ORYX.I18N.ResourcesBoDAdd = {};

ORYX.I18N.ResourcesBoDAdd.name = "Define Binding of Duties Constraint";
ORYX.I18N.ResourcesBoDAdd.group = "Resource Perspective";
ORYX.I18N.ResourcesBoDAdd.desc = "Define a Binding of Duties Constraint for the selected tasks";

if(!ORYX.I18N.ResourcesBoDShow) ORYX.I18N.ResourcesBoDShow = {};

ORYX.I18N.ResourcesBoDShow.name = "Show Binding of Duties Constraints";
ORYX.I18N.ResourcesBoDShow.group = "Resource Perspective";
ORYX.I18N.ResourcesBoDShow.desc = "Show Binding of Duties constraints of the selected task";

if(!ORYX.I18N.ResourceAssignment) ORYX.I18N.ResourceAssignment = {};

ORYX.I18N.ResourceAssignment.name = "Resource Assignment";
ORYX.I18N.ResourceAssignment.group = "Resource Perspective";
ORYX.I18N.ResourceAssignment.desc = "Assign resources to the selected task(s)";

if(!ORYX.I18N.ClearSodBodHighlights) ORYX.I18N.ClearSodBodHighlights = {};

ORYX.I18N.ClearSodBodHighlights.name = "Clear Highlights and Overlays";
ORYX.I18N.ClearSodBodHighlights.group = "Resource Perspective";
ORYX.I18N.ClearSodBodHighlights.desc = "Remove all Separation and Binding of Duties Highlights/ Overlays";


if(!ORYX.I18N.Perspective) ORYX.I18N.Perspective = {};
ORYX.I18N.Perspective.no = "No Perspective"
ORYX.I18N.Perspective.noTip = "Unload the current perspective"


/** New Language Properties: 21.04.2009 */
ORYX.I18N.JSONSupport = {
    imp: {
        name: "Import from JSON",
        desc: "Imports a model from JSON",
        group: "Export",
        selectFile: "Select an JSON (.json) file or type in JSON to import it!",
        file: "File",
        btnImp: "Import",
        btnClose: "Close",
        progress: "Importing ...",
        syntaxError: "Syntax error"
    },
    exp: {
        name: "Export to JSON",
        desc: "Exports current model to JSON",
        group: "Export"
    }
};

/** New Language Properties: 08.05.2009 */
if(!ORYX.I18N.BPMN2XHTML) ORYX.I18N.BPMN2XHTML = {};
ORYX.I18N.BPMN2XHTML.group = "Export";
ORYX.I18N.BPMN2XHTML.XHTMLExport = "Export XHTML Documentation";

/** New Language Properties: 09.05.2009 */
if(!ORYX.I18N.JSONImport) ORYX.I18N.JSONImport = {};

ORYX.I18N.JSONImport.title = "JSON Import";
ORYX.I18N.JSONImport.wrongSS = "The stencil set of the imported file ({0}) does not match to the loaded stencil set ({1})."

if(!ORYX.I18N.Feedback) ORYX.I18N.Feedback = {};

ORYX.I18N.Feedback.name = "Feedback";
ORYX.I18N.Feedback.desc = "Contact us for any kind of feedback!";
ORYX.I18N.Feedback.pTitle = "Contact us for any kind of feedback!";
ORYX.I18N.Feedback.pName = "Name";
ORYX.I18N.Feedback.pEmail = "E-Mail";
ORYX.I18N.Feedback.pSubject = "Subject";
ORYX.I18N.Feedback.pMsg = "Description/Message";
ORYX.I18N.Feedback.pEmpty = "* Please provide as detailed information as possible so that we can understand your request.\n* For bug reports, please list the steps how to reproduce the problem and describe the output you expected.";
ORYX.I18N.Feedback.pAttach = "Attach current model";
ORYX.I18N.Feedback.pAttachDesc = "This information can be helpful for debugging purposes. If your model contains some sensitive data, remove it before or uncheck this behavior.";
ORYX.I18N.Feedback.pBrowser = "Information about your browser and environment";
ORYX.I18N.Feedback.pBrowserDesc = "This information has been auto-detected from your browser. It can be helpful if you encountered a bug associated with browser-specific behavior.";
ORYX.I18N.Feedback.submit = "Send Message";
ORYX.I18N.Feedback.sending = "Sending message ...";
ORYX.I18N.Feedback.success = "Success";
ORYX.I18N.Feedback.successMsg = "Thank you for your feedback!";
ORYX.I18N.Feedback.failure = "Failure";
ORYX.I18N.Feedback.failureMsg = "Unfortunately, the message could not be sent. This is our fault! Please try again or contact someone at http://code.google.com/p/oryx-editor/";


ORYX.I18N.Feedback.name = "Feedback";
ORYX.I18N.Feedback.failure = "Failure";
ORYX.I18N.Feedback.failureMsg = "Unfortunately, the message could not be sent. This is our fault! Please try again or contact someone at http://code.google.com/p/oryx-editor/";
ORYX.I18N.Feedback.submit = "Send Message";

ORYX.I18N.Feedback.emailDesc = "Your e-mail address?";
ORYX.I18N.Feedback.titleDesc = "Summarize your message with a short title";
ORYX.I18N.Feedback.descriptionDesc = "Describe your idea, question, or problem."
ORYX.I18N.Feedback.info = '<p>Oryx is a research platform intended to support scientists in the field of business process management and beyond with a flexible, extensible tool to validate research theses and conduct experiments.</p><p>We are happy to provide you with the <a href="http://bpt.hpi.uni-potsdam.de/Oryx/ReleaseNotes" target="_blank"> latest technology and advancements</a> of our platform. <a href="http://bpt.hpi.uni-potsdam.de/Oryx/DeveloperNetwork" target="_blank">We</a> work hard to provide you with a reliable system, even though you may experience small hiccups from time to time.</p><p>If you have ideas how to improve Oryx, have a question related to the platform, or want to report a problem: <strong>Please, let us know. Here.</strong></p>'; // general info will be shown, if no subject specific info is given
// list subjects in reverse order of appearance!
ORYX.I18N.Feedback.subjects = [
    {
    	id: "question",   // ansi-compatible name
    	name: "Question", // natural name
    	description: "Ask your question here! \nPlease give us as much information as possible, so we don't have to bother you with more questions, before we can give an answer.", // default text for the description text input field
    	info: "" // optional field to give more info
    },
    {
    	id: "problem",   // ansi-compatible name
    	name: "Problem", // natural name
    	description: "We're sorry for the inconvenience. Give us feedback on the problem, and we'll try to solve it for you. Describe it as detailed as possible, please.", // default text for the description text input field
    	info: "" // optional field to give more info
    },
    {
    	id: "idea",   // ansi-compatible name
    	name: "Idea", // natural name
    	description: "Share your ideas and thoughts here!", // default text for the description text input field
    	info: "" // optional field to give more info
    }
];

/** New Language Properties: 11.05.2009 */
if(!ORYX.I18N.BPMN2DTRPXMI) ORYX.I18N.BPMN2DTRPXMI = {};
ORYX.I18N.BPMN2DTRPXMI.group = "Export";
ORYX.I18N.BPMN2DTRPXMI.DTRPXMIExport = "Export to XMI (Design Thinking)";
ORYX.I18N.BPMN2DTRPXMI.DTRPXMIExportDescription = "Exports current model to XMI (requires stencil set extension 'BPMN Subset for Design Thinking')";

/** New Language Properties: 14.05.2009 */
if(!ORYX.I18N.RDFExport) ORYX.I18N.RDFExport = {};
ORYX.I18N.RDFExport.group = "Export";
ORYX.I18N.RDFExport.rdfExport = "Export to RDF";
ORYX.I18N.RDFExport.rdfExportDescription = "Exports current model to the XML serialization defined for the Resource Description Framework (RDF)";

/** New Language Properties: 15.05.2009*/
if(!ORYX.I18N.SyntaxChecker.BPMN) ORYX.I18N.SyntaxChecker.BPMN={};
ORYX.I18N.SyntaxChecker.BPMN_NO_SOURCE = "An edge must have a source.";
ORYX.I18N.SyntaxChecker.BPMN_NO_TARGET = "An edge must have a target.";
ORYX.I18N.SyntaxChecker.BPMN_DIFFERENT_PROCESS = "Source and target node must be contained in the same process.";
ORYX.I18N.SyntaxChecker.BPMN_SAME_PROCESS = "Source and target node must be contained in different pools.";
ORYX.I18N.SyntaxChecker.BPMN_FLOWOBJECT_NOT_CONTAINED_IN_PROCESS = "A flow object must be contained in a process.";
ORYX.I18N.SyntaxChecker.BPMN_ENDEVENT_WITHOUT_INCOMING_CONTROL_FLOW = "An end event must have an incoming sequence flow.";
ORYX.I18N.SyntaxChecker.BPMN_STARTEVENT_WITHOUT_OUTGOING_CONTROL_FLOW = "A start event must have an outgoing sequence flow.";
ORYX.I18N.SyntaxChecker.BPMN_STARTEVENT_WITH_INCOMING_CONTROL_FLOW = "Start events must not have incoming sequence flows.";
ORYX.I18N.SyntaxChecker.BPMN_ATTACHEDINTERMEDIATEEVENT_WITH_INCOMING_CONTROL_FLOW = "Attached intermediate events must not have incoming sequence flows.";
ORYX.I18N.SyntaxChecker.BPMN_ATTACHEDINTERMEDIATEEVENT_WITHOUT_OUTGOING_CONTROL_FLOW = "Attached intermediate events must have exactly one outgoing sequence flow.";
ORYX.I18N.SyntaxChecker.BPMN_ENDEVENT_WITH_OUTGOING_CONTROL_FLOW = "End events must not have outgoing sequence flows.";
ORYX.I18N.SyntaxChecker.BPMN_EVENTBASEDGATEWAY_BADCONTINUATION = "Event-based gateways must not be followed by gateways or subprocesses.";
ORYX.I18N.SyntaxChecker.BPMN_NODE_NOT_ALLOWED = "Node type is not allowed.";

if(!ORYX.I18N.SyntaxChecker.IBPMN) ORYX.I18N.SyntaxChecker.IBPMN={};
ORYX.I18N.SyntaxChecker.IBPMN_NO_ROLE_SET = "Interactions must have a sender and a receiver role set";
ORYX.I18N.SyntaxChecker.IBPMN_NO_INCOMING_SEQFLOW = "This node must have incoming sequence flow.";
ORYX.I18N.SyntaxChecker.IBPMN_NO_OUTGOING_SEQFLOW = "This node must have outgoing sequence flow.";

if(!ORYX.I18N.SyntaxChecker.InteractionNet) ORYX.I18N.SyntaxChecker.InteractionNet={};
ORYX.I18N.SyntaxChecker.InteractionNet_SENDER_NOT_SET = "Sender not set";
ORYX.I18N.SyntaxChecker.InteractionNet_RECEIVER_NOT_SET = "Receiver not set";
ORYX.I18N.SyntaxChecker.InteractionNet_MESSAGETYPE_NOT_SET = "Message type not set";
ORYX.I18N.SyntaxChecker.InteractionNet_ROLE_NOT_SET = "Role not set";

if(!ORYX.I18N.SyntaxChecker.EPC) ORYX.I18N.SyntaxChecker.EPC={};
ORYX.I18N.SyntaxChecker.EPC_NO_SOURCE = "Each edge must have a source.";
ORYX.I18N.SyntaxChecker.EPC_NO_TARGET = "Each edge must have a target.";
ORYX.I18N.SyntaxChecker.EPC_NOT_CONNECTED = "Node must be connected with edges.";
ORYX.I18N.SyntaxChecker.EPC_NOT_CONNECTED_2 = "Node must be connected with more edges.";
ORYX.I18N.SyntaxChecker.EPC_TOO_MANY_EDGES = "Node has too many connected edges.";
ORYX.I18N.SyntaxChecker.EPC_NO_CORRECT_CONNECTOR = "Node is no correct connector.";
ORYX.I18N.SyntaxChecker.EPC_MANY_STARTS = "There must be only one start event.";
ORYX.I18N.SyntaxChecker.EPC_FUNCTION_AFTER_OR = "There must be no functions after a splitting OR/XOR.";
ORYX.I18N.SyntaxChecker.EPC_PI_AFTER_OR = "There must be no process interface after a splitting OR/XOR.";
ORYX.I18N.SyntaxChecker.EPC_FUNCTION_AFTER_FUNCTION =  "There must be no function after a function.";
ORYX.I18N.SyntaxChecker.EPC_EVENT_AFTER_EVENT =  "There must be no event after an event.";
ORYX.I18N.SyntaxChecker.EPC_PI_AFTER_FUNCTION =  "There must be no process interface after a function.";
ORYX.I18N.SyntaxChecker.EPC_FUNCTION_AFTER_PI =  "There must be no function after a process interface.";

if(!ORYX.I18N.SyntaxChecker.PetriNet) ORYX.I18N.SyntaxChecker.PetriNet={};
ORYX.I18N.SyntaxChecker.PetriNet_NOT_BIPARTITE = "The graph is not bipartite";
ORYX.I18N.SyntaxChecker.PetriNet_NO_LABEL = "Label not set for a labeled transition";
ORYX.I18N.SyntaxChecker.PetriNet_NO_ID = "There is a node without id";
ORYX.I18N.SyntaxChecker.PetriNet_SAME_SOURCE_AND_TARGET = "Two flow relationships have the same source and target";
ORYX.I18N.SyntaxChecker.PetriNet_NODE_NOT_SET = "A node is not set for a flowrelationship";

/** New Language Properties: 02.06.2009*/
ORYX.I18N.Edge = "Edge";
ORYX.I18N.Node = "Node";

/** New Language Properties: 03.06.2009*/
ORYX.I18N.SyntaxChecker.notice = "Move the mouse over a red cross icon to see the error message.";

ORYX.I18N.Validator.result = "Validation Result";
ORYX.I18N.Validator.noErrors = "No validation errors found.";
ORYX.I18N.Validator.bpmnDeadlockTitle = "Deadlock";
ORYX.I18N.Validator.bpmnDeadlock = "This node results in a deadlock. There are situations where not all incoming branches are activated.";
ORYX.I18N.Validator.bpmnUnsafeTitle = "Lack of synchronization";
ORYX.I18N.Validator.bpmnUnsafe = "This model suffers from lack of synchronization. The marked element is activated from multiple incoming branches.";
ORYX.I18N.Validator.bpmnLeadsToNoEndTitle = "Validation Result";
ORYX.I18N.Validator.bpmnLeadsToNoEnd = "The process will never reach a final state.";

ORYX.I18N.Validator.syntaxErrorsTitle = "Syntax Error";
ORYX.I18N.Validator.syntaxErrorsMsg = "The process cannot be validated because it contains syntax errors.";
	
ORYX.I18N.Validator.error = "Validation failed";
ORYX.I18N.Validator.errorDesc = 'We are sorry, but the validation of your process failed. It would help us identifying the problem, if you sent us your process model via the "Send Feedback" function.';

ORYX.I18N.Validator.epcIsSound = "<p><b>The EPC is sound, no problems found!</b></p>";
ORYX.I18N.Validator.epcNotSound = "<p><b>The EPC is <i>NOT</i> sound!</b></p>";

/** New Language Properties: 05.06.2009*/
if(!ORYX.I18N.RESIZE) ORYX.I18N.RESIZE = {};
ORYX.I18N.RESIZE.tipGrow = "Increase canvas size: ";
ORYX.I18N.RESIZE.tipShrink = "Decrease canvas size: ";
ORYX.I18N.RESIZE.N = "Top";
ORYX.I18N.RESIZE.W = "Left";
ORYX.I18N.RESIZE.S ="Down";
ORYX.I18N.RESIZE.E ="Right";
/** New Language Properties: 14.08.2009*/
if(!ORYX.I18N.PluginLoad) ORYX.I18N.PluginLoad = {};
ORYX.I18N.PluginLoad.AddPluginButtonName = "Add Plugins";
ORYX.I18N.PluginLoad.AddPluginButtonDesc = "Add additional Plugins dynamically";
ORYX.I18N.PluginLoad.loadErrorTitle="Loading Error";
ORYX.I18N.PluginLoad.loadErrorDesc = "Unable to load Plugin. \n Error:\n";
ORYX.I18N.PluginLoad.WindowTitle ="Add additional Plugins";

ORYX.I18N.PluginLoad.NOTUSEINSTENCILSET = "Not allowed in this Stencilset!";
ORYX.I18N.PluginLoad.REQUIRESTENCILSET = "Require another Stencilset!";
ORYX.I18N.PluginLoad.NOTFOUND = "Pluginname not found!"
ORYX.I18N.PluginLoad.YETACTIVATED = "Plugin is yet activated!"

/** New Language Properties: 15.07.2009*/
if(!ORYX.I18N.Layouting) ORYX.I18N.Layouting ={};
ORYX.I18N.Layouting.doing = "Layouting...";

/** New Language Properties: 18.08.2009*/
ORYX.I18N.SyntaxChecker.MULT_ERRORS = "Multiple Errors";

/** New Language Properties: 08.09.2009*/
if(!ORYX.I18N.PropertyWindow) ORYX.I18N.PropertyWindow = {};
ORYX.I18N.PropertyWindow.oftenUsed = "Often used";
ORYX.I18N.PropertyWindow.moreProps = "More Properties";

/** New Language Properties: 17.09.2009*/
if(!ORYX.I18N.Bpmn2_0Serialization) ORYX.I18N.Bpmn2_0Serialization = {};
ORYX.I18N.Bpmn2_0Serialization.show = "Show BPMN 2.0 DI XML";
ORYX.I18N.Bpmn2_0Serialization.showDesc = "Show BPMN 2.0 DI XML of the current BPMN 2.0 model";
ORYX.I18N.Bpmn2_0Serialization.download = "Download BPMN 2.0 DI XML";
ORYX.I18N.Bpmn2_0Serialization.downloadDesc = "Download BPMN 2.0 DI XML of the current BPMN 2.0 model";
ORYX.I18N.Bpmn2_0Serialization.serialFailed = "An error occurred while generating the BPMN 2.0 DI XML Serialization.";
ORYX.I18N.Bpmn2_0Serialization.group = "BPMN 2.0";

/** New Language Properties 01.10.2009 */
if(!ORYX.I18N.SyntaxChecker.BPMN2) ORYX.I18N.SyntaxChecker.BPMN2 = {};

ORYX.I18N.SyntaxChecker.BPMN2_DATA_INPUT_WITH_INCOMING_DATA_ASSOCIATION = "A Data Input must not have any incoming Data Associations.";
ORYX.I18N.SyntaxChecker.BPMN2_DATA_OUTPUT_WITH_OUTGOING_DATA_ASSOCIATION = "A Data Output must not have any outgoing Data Associations.";
ORYX.I18N.SyntaxChecker.BPMN2_EVENT_BASED_TARGET_WITH_TOO_MANY_INCOMING_SEQUENCE_FLOWS = "Targets of Event-based Gateways may only have one incoming Sequence Flow.";

/** New Language Properties 02.10.2009 */
ORYX.I18N.SyntaxChecker.BPMN2_EVENT_BASED_WITH_TOO_LESS_OUTGOING_SEQUENCE_FLOWS = "An Event-based Gateway must have two or more outgoing Sequence Flows.";
ORYX.I18N.SyntaxChecker.BPMN2_EVENT_BASED_EVENT_TARGET_CONTRADICTION = "If Message Intermediate Events are used in the configuration, then Receive Tasks must not be used and vice versa.";
ORYX.I18N.SyntaxChecker.BPMN2_EVENT_BASED_WRONG_TRIGGER = "Only the following Intermediate Event triggers are valid: Message, Signal, Timer, Conditional and Multiple.";
ORYX.I18N.SyntaxChecker.BPMN2_EVENT_BASED_WRONG_CONDITION_EXPRESSION = "The outgoing Sequence Flows of the Event Gateway must not have a condition expression.";
ORYX.I18N.SyntaxChecker.BPMN2_EVENT_BASED_NOT_INSTANTIATING = "The Gateway does not meet the conditions to instantiate the process. Please use a start event or an instantiating attribute for the gateway.";

/** New Language Properties 05.10.2009 */
ORYX.I18N.SyntaxChecker.BPMN2_GATEWAYDIRECTION_MIXED_FAILURE = "The Gateway must have both multiple incoming and outgoing Sequence Flows.";
ORYX.I18N.SyntaxChecker.BPMN2_GATEWAYDIRECTION_CONVERGING_FAILURE = "The Gateway must have multiple incoming but most NOT have multiple outgoing Sequence Flows.";
ORYX.I18N.SyntaxChecker.BPMN2_GATEWAYDIRECTION_DIVERGING_FAILURE = "The Gateway must NOT have multiple incoming but must have multiple outgoing Sequence Flows.";
ORYX.I18N.SyntaxChecker.BPMN2_GATEWAY_WITH_NO_OUTGOING_SEQUENCE_FLOW = "A Gateway must have a minimum of one outgoing Sequence Flow.";
ORYX.I18N.SyntaxChecker.BPMN2_RECEIVE_TASK_WITH_ATTACHED_EVENT = "Receive Tasks used in Event Gateway configurations must not have any attached Intermediate Events.";
ORYX.I18N.SyntaxChecker.BPMN2_EVENT_SUBPROCESS_BAD_CONNECTION = "An Event Subprocess must not have any incoming or outgoing Sequence Flow.";

/** New Language Properties 13.10.2009 */
ORYX.I18N.SyntaxChecker.BPMN_MESSAGE_FLOW_NOT_CONNECTED = "At least one side of the Message Flow has to be connected.";

/** New Language Properties 19.10.2009 */
ORYX.I18N.Bpmn2_0Serialization['import'] = "Import from BPMN 2.0 DI XML";
ORYX.I18N.Bpmn2_0Serialization.importDesc = "Import a BPMN 2.0 model from a file or XML String";
ORYX.I18N.Bpmn2_0Serialization.selectFile = "Select a (*.bpmn) file or type in BPMN 2.0 DI XML to import it!";
ORYX.I18N.Bpmn2_0Serialization.file = "File:";
ORYX.I18N.Bpmn2_0Serialization.name = "Import from BPMN 2.0 DI XML";
ORYX.I18N.Bpmn2_0Serialization.btnImp = "Import";
ORYX.I18N.Bpmn2_0Serialization.progress = "Importing BPMN 2.0 DI XML ...";
ORYX.I18N.Bpmn2_0Serialization.btnClose = "Close";
ORYX.I18N.Bpmn2_0Serialization.error = "An error occurred while importing BPMN 2.0 DI XML";

/** New Language Properties 24.11.2009 */
ORYX.I18N.SyntaxChecker.BPMN2_TOO_MANY_INITIATING_MESSAGES = "A Choreography Activity may only have one initiating message.";
ORYX.I18N.SyntaxChecker.BPMN_MESSAGE_FLOW_NOT_ALLOWED = "A Message Flow is not allowed here.";

/** New Language Properties 27.11.2009 */
ORYX.I18N.SyntaxChecker.BPMN2_EVENT_BASED_WITH_TOO_LESS_INCOMING_SEQUENCE_FLOWS = "An Event-based Gateway that is not instantiating must have a minimum of one incoming Sequence Flow.";
ORYX.I18N.SyntaxChecker.BPMN2_TOO_FEW_INITIATING_PARTICIPANTS = "A Choreography Activity must have one initiating Participant (white).";
ORYX.I18N.SyntaxChecker.BPMN2_TOO_MANY_INITIATING_PARTICIPANTS = "A Choreography Acitivity must not have more than one initiating Participant (white)."

ORYX.I18N.SyntaxChecker.COMMUNICATION_AT_LEAST_TWO_PARTICIPANTS = "The communication must be connected to at least two participants.";
ORYX.I18N.SyntaxChecker.MESSAGEFLOW_START_MUST_BE_PARTICIPANT = "The message flow's source must be a participant.";
ORYX.I18N.SyntaxChecker.MESSAGEFLOW_END_MUST_BE_PARTICIPANT = "The message flow's target must be a participant.";
ORYX.I18N.SyntaxChecker.CONV_LINK_CANNOT_CONNECT_CONV_NODES = "The conversation link must connect a communication or sub conversation node with a participant.";

/** New Language Properties 30.12.2009 */
ORYX.I18N.Bpmn2_0Serialization.xpdlShow = "Show XPDL 2.2";
ORYX.I18N.Bpmn2_0Serialization.xpdlShowDesc = "Shows the XPDL 2.2 based on BPMN 2.0 XML (by XSLT)";
ORYX.I18N.Bpmn2_0Serialization.xpdlDownload = "Download as XPDL 2.2";
ORYX.I18N.Bpmn2_0Serialization.xpdlDownloadDesc = "Download the XPDL 2.2 based on BPMN 2.0 XML (by XSLT)";

/** New Language Properties 27.4.2010 */
if(!ORYX.I18N.Paint) ORYX.I18N.Paint = {};
ORYX.I18N.Paint.paint = "Paint";
ORYX.I18N.Paint.paintDesc = "Toggle Paint mode";

/** New Language Properties 26.07.2010 */
if(!ORYX.I18N.JSONExport) ORYX.I18N.JSONExport = {};
ORYX.I18N.JSONExport.name = "JSON Export";
ORYX.I18N.JSONExport.desc = "Export model to the ORYX editor";
ORYX.I18N.JSONExport.group = "Export";