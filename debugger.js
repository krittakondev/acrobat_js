/* -*- Mode: C; tab-width: 8; indent-tabs-mode: nil; c-basic-offset: 4 -*-
 *
 * ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is mozilla.org code.
 *
 * The Initial Developer of the Original Code is
 * Netscape Communications Corporation.
 * Portions created by the Initial Developer are Copyright (C) 1998
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Adobe Systems Incorporated
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

// The following code "exports" any strings in the list into the current scope.
var msgStrings = new Array(
	"IDS_STARTUP_DEBUGGER_MSG",
	"IDS_INVALID_BREAKPOINT", 
	"IDS_EXCEPTION_INLINE",
	"IDS_UNABLE_FINDSOURCE",
	"IDS_TOP_LEVEL",
	"IDS_INVALID_BPLINE",
	"IDS_STACK_STRING",
	"IDS_CANNOT_EVALWATCH");

for(var n = 0; n < msgStrings.length; n++)
	eval(msgStrings[n] + " = " + getString({cPlugInName: "EScript", cStringId: msgStrings[n]}).toSource());

printConsole(IDS_STARTUP_DEBUGGER_MSG+"\n");

/***************************************************************************/
/* Hook functions */

const STEPTYPE_NONE = -1;
const STEPTYPE_BYTECODE = 0;
const STEPTYPE_INTO = 1;
const STEPTYPE_OVER = 2;
const STEPTYPE_OUT = 3;

var debugVerbose = false;

var jsStack = null;
var hookType;
var currentFrame;
var resumeCode = 1;
var stepType = STEPTYPE_NONE;

var startPC = 0;
var startLineno = 0;
var startFrame = 0;
var startFileName = "";
var startFunname = "";

var curProps = null;
var curScript = null;

var bpCreate = true;

const TMODE_IGNORE = 0;
const TMODE_TRACE = 1;
const TMODE_BREAK = 2;

const PROTOTYPE = "[[Prototype]]";
const PARENT = "[[Parent]]";
const FOLDER_LEVEL = "Folder-Level";

jsd.SetScriptHook(scriptHook);
jsd.SetExecutionHook(execHook);

function stepNext() {
    return (jsStack[0].pc < startPC && jsStack[0].lineno != startLineno || jsStack[0].lineno > startLineno);
}

function shouldStop() {
	// In case we've hit an exception.
	if (hookType == jsd.JSD_HOOK_THROW) {
		var tMode = getThrowMode();
		switch (tMode) {
			case TMODE_IGNORE:
				return false;
				break;
			case TMODE_TRACE:
			case TMODE_BREAK:
				var displayString = IDS_EXCEPTION_INLINE.replace('%d', jsStack[0].lineno);
				displayString = displayString.replace('%s', jsStack[0].script.funName);
				displayString = displayString.replace('%s', getOrigName(jsStack[0].script.fileName));
				printConsole(displayString);
				return tMode == TMODE_BREAK ? true : false;
				break;
			default:
				return false;
		}
	}

	// if we reach hook due to an interrupt, it's probably a step.
	if (hookType == jsd.JSD_HOOK_INTERRUPTED) {
		
		// For now, make sure we don't step into script we don't have the code for.
		// For the future, we should be able to get the function code from a bytecoded 
		// function, and insert it from debugger.js.
		if (stepType == STEPTYPE_INTO && jsStack[0].script.fileName == "")
			stepType = STEPTYPE_OVER;
			
		switch (stepType) {
			case STEPTYPE_BYTECODE: // Step Byte Code
				return true;
			break;
			case STEPTYPE_INTO: // Step Into
				return (jsStack[0].script.fileName != startFileName || 
						jsStack[0].script.funName != startFunname) ? true : stepNext();
			break;
			case STEPTYPE_OVER: // Step Over
				return (jsStack.length-1 <= startFrame) ? stepNext() : false;
			break;
			case STEPTYPE_OUT: // Step Out (of function)
			{
	   			if (debugVerbose)
		 			printConsole("condition: "+(jsStack.length-1 < startFrame)+" stepNext: "+stepNext()+"\n");
				return (jsStack.length-1 < startFrame) ? stepNext() : false;
			}
			break;
			default: // This in case interrupt button is on, but we're not stepping.
				return true;
			break;
		}
	}

	// make sure we're not stepping.
	if (stepType == STEPTYPE_NONE) {
		// if we reach hook due to a breakpoint, it's a breakpoint.
		if (hookType == jsd.JSD_HOOK_BREAKPOINT) {
		    var bpIndex = getBPIndex(getOrigName(jsStack[0].script.fileName), jsStack[0].lineno);
		    if (bpIndex != -1) {
				var ret = debugEval(breakpoints[bpIndex].condition);
   				//if (debugVerbose)
					//printConsole(breakpoints[bpIndex].condition+": "+ ret +"\n");

				if (ret == "true") {
   					//if (debugVerbose)
						//printConsole(typeof(ret) + ": Ok\n");
					return true;
				}
			}
		}

		// if we reach hook due to "debugger keyword", it's a breakpoint.
		if (hookType == jsd.JSD_HOOK_DEBUGGER_KEYWORD)
			return true;
	}

	// No, we're not going to stop.
	return false;
}

function GetTextFromFilename(filename) {
    var handle = jsd.FindSourceForURL(filename);
    if (handle == null)
        return printConsole(IDS_UNABLE_FINDSOURCE.replace('%s', filename));

    return jsd.GetSourceText(handle);
}

function execHook(type) {
	/* we reset these globals. hookType is reason for stoping. */
    jsStack = null;
    currentFrame = 0;
    hookType = type;
    buildStack();

   	if (debugVerbose) {
 		printConsole("hookType: " + hookType + " stepType: " + stepType + "\n");
 		printConsole("lineno: " + jsStack[0].lineno + " fileName: " + getOrigName(jsStack[0].script.fileName) + "\n");
	}

	if (shouldStop()) {
		openDebugger();

       	unsuspend();

		// reset these.
    	resumeCode = -1;
    	stepType = STEPTYPE_NONE;

    	selectScriptLine(jsStack[0].lineno, getOrigName(jsStack[0].script.fileName), "", 0);
		suspendThread();

   		if (debugVerbose)
 			printConsole("resumeCode: "+resumeCode+"\n");

    	return resumeCode;
    }

    return jsd.JSD_HOOK_RETURN_CONTINUE;
}

function scriptHook(handle, creating) {
    if (creating) {
		JSDScript.add(new JSDScript(handle,
									getOrigName(jsd.GetScriptFilename(handle)),
									jsd.GetScriptFunctionName(handle),
									jsd.GetScriptBaseLineNumber(handle),
									jsd.GetScriptLineExtent(handle)));
		setAllBreakpointsForScript(handle);
    } else {
        JSDScript.remove(JSDScript.find(handle));
    }
    return true;
}

/***************************************************************************/
/* JSDScript Object */

function JSDScript(handle, fileName, funName, base, extent) {
    this.handle = handle;
    this.fileName = fileName;
    this.funName = (funName != null && funName.length ? funName : IDS_TOP_LEVEL);
    this.base = base;
    this.extent = extent;
    this.toString = function() {return (funName != null && funName.length ? funName : IDS_TOP_LEVEL)}
	//if (debugVerbose)
		//printConsole(fileName + ":" + base  + ":" + extent +"\n");
}

JSDScript.scripts = new Object;

JSDScript.add = function(script) {
    JSDScript.scripts[script.handle] = script;
	addPCMap(script);

/* use this to see the final pcMap on the console
   	if (script.toString() == "top_level" && script.fileName == "Folder-Level:App:aform.js") 
	{
		var filePCMap = findPCMap(script);
	    for (var i = 0; i < Math.min(150, filePCMap.exec.length); i++)
			printConsole(i + ":" + filePCMap.exec[i] +"\n");
	}
*/
}

JSDScript.remove = function(script) {
    if (script) {
   		//if (debugVerbose)
			//printConsole("JSDScript.remove:" + script.fileName + ":" + script.funName +"\n");
		delete JSDScript.scripts[script.handle];
		if (script.fileName.substr(0, FOLDER_LEVEL.length) != FOLDER_LEVEL)
			deletePCMap(script);
	}
}

JSDScript.find = function(handle) {
    return JSDScript.scripts[handle];
}

/***************************************************************************/
/* PCMaps Array */

var scriptPCMaps = new Array;

function filePCMap(fileName) {
    this.fileName = fileName;
    this.exec = new Array();
}

function findPCMapFromFilename(fileName) {
    for(var i = 0; i < scriptPCMaps.length; i++) {
		if (scriptPCMaps[i].fileName == fileName)
			return scriptPCMaps[i];
	}
	return null;
}

function findPCMap(script) {
	var pcMap = findPCMapFromFilename(script.fileName);
	if (!pcMap) {
		pcMap = new filePCMap(script.fileName);
		scriptPCMaps.push(pcMap);
	}

	return pcMap;
}

function addPCMap(script) {
	var filePCMap = findPCMap(script);
	for(var i = script.base; i < script.base+script.extent; i++) {
		var line = jsd.GetClosestLine(script.handle, jsd.GetClosestPC(script.handle, i));
		filePCMap.exec[i] = filePCMap.exec[i] || (i == line) ? true : false;
    	//if (debugVerbose)
			//printConsole(i + ":" + filePCMap.exec[i] +"\n");
	}
}

function deletePCMap(script) {
    for(var i = 0; i < scriptPCMaps.length; i++) {
		if (scriptPCMaps[i].fileName == script.fileName) {
			delete scriptPCMaps[i];
			scriptPCMaps.splice(i, 1);
			return;
		}
	}
}

function canSetBreakpoint(fileName, lineNum) {
	var pcMap = findPCMapFromFilename(fileName);
	if (pcMap != undefined)
		return pcMap.exec[lineNum];

	return true;
}

function pcMapExists(fileName) {
	if (findPCMapFromFilename(fileName))
		return true;
	return false;
}

/***************************************************************************/
/* JSDFrame (jsStack) Object */

function JSDFrame(handle) {
    this.handle = handle;
    this.script = JSDScript.find(jsd.GetScriptForStackFrame(handle));
    this.pc = jsd.GetPCForStackFrame(handle);
    this.lineno = jsd.GetClosestLine(this.script.handle, this.pc);
}

function buildStack() {
    var count = jsd.GetCountOfStackFrames();

    jsStack = new Array(count);
    jsStack[0] = new JSDFrame(jsd.GetStackFrame());
    for(var i = 0; i < count-1; i++)
        jsStack[i+1] = new JSDFrame(jsd.GetCallingStackFrame(jsStack[i].handle));
}

/***************************************************************************/
/* JSDProperty Object */

function JSDProperty(propValue, readOnly) {
    this.value = propValue;
	this.type = (jsd.IsValueObject(propValue)  ? "o" : "") +
				(jsd.IsValueInt(propValue)	   ? "i" : "") +
				(jsd.IsValueDouble(propValue)  ? "d" : "") +
				(jsd.IsValueString(propValue)  ? "s" : "") +
				(jsd.IsValueBoolean(propValue) ? "b" : "") +
				(jsd.IsValueVoid(propValue)	   ? "u" : "") +
				(readOnly				       ? "r" : "w");
	this.valString = jsd.GetValueString(propValue);
//	this.count = jsd.GetCountOfProperties(propValue);
}

/***************************************************************************/
/* JSDValue Object */

function JSDValue(handle) {
    if (!handle)
        return null;

    this.handle = handle;
	this.a = new Array();
	this.GetPropNames = function() {return this.a;}
    this.GetProperties = function() {
		var o = new Object();
		jsd.IterateProperties(this.handle, cb, o, this.a);

		if (jsd.GetValueClassName(this.handle) != "Array")
			this.a.sort();

		var protoValue = jsd.GetValuePrototype(this.handle);
		if (protoValue) {
			o[PROTOTYPE] = new JSDProperty(protoValue, true);
			this.a.unshift(PROTOTYPE);
		}
		var parentValue = jsd.GetValueParent(this.handle);
		if (parentValue) {
			o[PARENT] = new JSDProperty(parentValue, true);
			this.a.unshift(PARENT);
		}

        return o;
    }

    function cb(ob, prop, o, a) {
		var propValue = jsd.GetPropertyValue(prop);
		if (!jsd.IsValueFunction(propValue)) {
			var propName = jsd.GetValueString(jsd.GetPropertyName(prop));
			if (propName != "__privateErase") {
				o[propName] = new JSDProperty(propValue, (jsd.GetPropertyFlags(prop) & jsd.JSDPD_READONLY));
				a.push(propName);
//   			if (debugVerbose)
//					printConsole(propName+":"+jsd.GetValueString(propValue)+"\n");
			}
		}
        return true;
    }
}

/***************************************************************************/
/* Breakpoints */

breakpoints = new Array();

function enumBreakpoints() {
    for(var i = 0; i < breakpoints.length; i++)
		regBreakpoint(i, breakpoints[i].fileName, breakpoints[i].lineNum, breakpoints[i].condition);
}

function setBreakpoints(pddHandle, bpArray) {
    for(var i = 0; i < bpArray.length; i++) {
		var fileName = bpArray[i].fileName;
		if (fileName.substr(fileName.length - 3) != ".js")
			setBreakpoint(pddHandle, fileName, bpArray[i].lineNum, bpArray[i].condition);
	}
}

function Breakpoint(pddHandle, fileName, lineNum, condition) {
	this.pddHandle = pddHandle;
    this.fileName = fileName;
    this.lineNum = lineNum;
    this.condition = condition;
	this.isSet = false;
}

function getBPIndex(fileName, lineNum) {
    for(var i = 0; i < breakpoints.length; i++)
        if (breakpoints[i].fileName == fileName && breakpoints[i].lineNum == lineNum)
            return i;
    return -1;
}

function bpCallback(handle, fileName, lineno, set) {
    var script = JSDScript.find(handle);
    if (script && script.fileName == fileName) {
		if (script.base <= lineno && script.base+script.extent > lineno)
		{
			var pc = jsd.GetClosestPC(handle, lineno);
			if (lineno == jsd.GetClosestLine(handle, pc)) {
				set ? jsd.SetTrap(handle, pc) : jsd.ClearTrap(handle, pc);
				bpCreate = true;
				if(debugVerbose)
					printConsole((set ? "set" : "clear") + fileName +"\n");

				return false; // if iterating, stop, as we found bp.
			}
		} else {
			bpCreate = false;
		}
	}

    return true;
}

function setAllBreakpointsForScript(handle) {
    for(var i = 0; i < breakpoints.length; i++) {
		bpCreate = false;
		bpCallback(handle, breakpoints[i].fileName, breakpoints[i].lineNum, true);
		if (bpCreate)
			breakpoints[i].isSet = true;
	}

    var script = JSDScript.find(handle);
	if (script.funName == "") {
		for(var i = 0; i < breakpoints.length; i++) {
			if (breakpoints[i].fileName == script.fileName && !breakpoints[i].isSet) {
				var displayString = IDS_INVALID_BPLINE.replace('%d', breakpoints[i].lineNum);
				displayString = displayString.replace('%s', breakpoints[i].fileName);
				printConsole(displayString);
				updateBreakpoint(false, breakpoints[i].lineNum, i, breakpoints[i].fileName, breakpoints[i].condition);
				delete breakpoints[i];
				breakpoints.splice(i, 1);
				i--;
			}
		}
	}
}

function setBreakpoint(pddHandle, fileName, lineNum, condition) {
	bpCreate = canSetBreakpoint(fileName, lineNum);
	if (bpCreate) {
		var bpIndex = getBPIndex(fileName, lineNum);
		if (bpIndex == -1) {
   			jsd.IterateScripts(bpCallback, fileName, lineNum, true);
			var theCondition = (condition == undefined) ? "true" : condition;
			breakpoints[breakpoints.length] = new Breakpoint(pddHandle, fileName, lineNum, theCondition);
			updateBreakpoint(true, lineNum, breakpoints.length-1, fileName, theCondition);
			saveBreakpoints();
			
    		if (debugVerbose)
        		printConsole("breakpoint set at line "+pddHandle+" of "+fileName+"\n");
		}
	} else {
		var displayString = IDS_INVALID_BREAKPOINT.replace('%d', lineNum);
		displayString = displayString.replace('%s', fileName);
		displayAlert(displayString);
	}
}

function clearBreakpoint(fileName, lineNum) {
	var bpIndex = getBPIndex(fileName, lineNum);
	if (bpIndex != -1) {
		jsd.IterateScripts(bpCallback, fileName, lineNum, false);
		delete breakpoints[bpIndex];
		breakpoints.splice(bpIndex, 1);
		updateBreakpoint(false, lineNum, bpIndex, fileName, "");
		saveBreakpoints();
		
		if (debugVerbose)
			printConsole("breakpoint cleared at line "+lineNum+" of "+fileName+"\n");
	}
}

function clearBreakpointsForDoc(pddHandle) {
	for(var i = 0; i < breakpoints.length; i++) {
		if (breakpoints[i].pddHandle == pddHandle) {
			updateBreakpoint(false, breakpoints[i].lineNum, i, breakpoints[i].fileName, breakpoints[i].condition);
			delete breakpoints[i];
			breakpoints.splice(i, 1);
			i--;
		}
	}
}

function toggleBreakpoint(pddHandle, fileName, lineNum, condition) {
    var bpIndex = getBPIndex(fileName, lineNum);
    if (bpIndex == -1)
		setBreakpoint(pddHandle, fileName, lineNum, condition);
	else
	    clearBreakpoint(fileName, lineNum);
}

function updateBreakpointsForScript(fileName) {
    for(var i = 0; i < breakpoints.length; i++) {
		if (breakpoints[i].fileName == fileName)
			updateBreakpoint(true, breakpoints[i].lineNum, i, fileName, breakpoints[i].condition);
	}
}

function changeBPCondition(i, newCondition) {
    if (i >= 0 && i < breakpoints.length && newCondition) {
	    breakpoints[i].condition = newCondition;
        updateBreakpoint(true, breakpoints[i].lineNum, i, breakpoints[i].fileName, breakpoints[i].condition);
		saveBreakpoints();
	}
}

/***************************************************************************/
/* JSDebugger dialog uses this API. */

function unsuspend() {
    if (jsd.InterruptSet) {
		jsd.ClearInterrupt();
		updateStopIcon();
	}
}

function suspend() {
    if (!jsd.InterruptSet) {
		jsd.SendInterrupt();
		updateStopIcon();
	}
}

function isInterruptSet() {
	return jsd.InterruptSet;
}

function step(type) {
	if (jsStack) {
		stepType = type;

		/* frame for step is always 0. */
		startPC = jsStack[0].pc;
		startLineno = jsStack[0].lineno;
		startFileName = jsStack[0].script.fileName;
		startFunname = jsStack[0].script.funName;
		startFrame = jsStack.length-1;

		suspend();
   		resume();
	}
}

function quit() {
	clearStack();
	clearInspector();
	curProps = null;
	curScript = null;

    unsuspend();
	stepType = STEPTYPE_NONE;

    resume(jsd.JSD_HOOK_RETURN_HOOK_ERROR);
}

function resume(code) {
    if (arguments.length &&
        code >= jsd.JSD_HOOK_RETURN_HOOK_ERROR &&
        code <= jsd.JSD_HOOK_RETURN_CONTINUE_THROW) {
        resumeCode = code;
    } else {
        if (hookType == jsd.JSD_HOOK_THROW)
            resumeCode = jsd.JSD_HOOK_RETURN_CONTINUE_THROW;
        else
            resumeCode = jsd.JSD_HOOK_RETURN_CONTINUE;
    }
}

function listRecursive(bThis) {
	if (jsStack) {
		if (jsStack[currentFrame].script.toString() != curScript)
			clearInspector();
		var callObjHandle = bThis ? jsd.GetThisForStackFrame(jsStack[currentFrame].handle) : 
									jsd.GetScopeChainForStackFrame(jsStack[currentFrame].handle);
		displayRecursive(false, callObjHandle);
    	curScript = jsStack[currentFrame].script.toString();
	}
}

function displayRecursive(isNode, callObjHandle) {
	if (callObjHandle) {
		var callObj = new JSDValue(callObjHandle);
		if (callObj) {
			var props = callObj.GetProperties();
			if (props) {
				var namesArray = callObj.GetPropNames();

				for(var i = 0; i < namesArray.length; i++) {
					var name = namesArray[i];
            		var isExpanded = printInspector(isNode, i, props[name].type, name, props[name].valString);

					if (isExpanded && props[name].type[0] == "o") {
						displayRecursive(true, props[name].value);
   						if (debugVerbose)
							printConsole(name+":"+props[name].valString+"\n");
					}
					isNode = false;
				}
				getParentList();
			}
		}
	}
}

function where() {
    if (jsStack) {
    	for(var i = 0; i < jsStack.length; i++) {
			var displayString = IDS_STACK_STRING.replace('%d', jsStack[i].lineno);
			displayString = displayString.replace('%s', jsStack[i].script.toString());
        	printStack(displayString);
		}
    }
}

function selectFrame(frameNum) {
    currentFrame = frameNum;
    selectScriptLine(jsStack[currentFrame].lineno, getOrigName(jsStack[currentFrame].script.fileName), "", frameNum);
}

function debugEval(text) {
	var scopeChain = jsd.GetScopeChainForStackFrame(jsStack[currentFrame].handle);
	var ret;
	try {
		ret = jsd.EvaluateScriptInStackFrame.apply(scopeChain, [jsStack[currentFrame].handle, text]);
	} catch (e) {
		return e;
	}

	return ret;
}

function watch(i, text) {
	if (jsStack && text != "") {
		var ret = debugEval(text);
   		printWatch(i, text, ret.toString());
	} else {
   		printWatch(i, text, IDS_CANNOT_EVALWATCH);
	}
}

function changeLocal(varName, value, bThis) {
	if (jsStack) {
		var ret = debugEval(varName + " = " + value + ";");
		listRecursive(bThis);
	}
}

function scriptExists(fileName) {
	for(var i in JSDScript.scripts) {
		if (fileName == JSDScript.scripts[i].fileName)
			return true;
	}
	return false;
}

function listScriptFunctions(fileName) {
	var o = new Object();
	for(var i in JSDScript.scripts) {
	    var script = JSDScript.scripts[i];
		if (script && fileName == script.fileName)
			o[script.funName] = script.base;
	}
	for(var i in o)
		printFunction(i, o[i]);
}
