// ==UserScript==
// @name			KoC Merlin Token Domain Selector
// @icon			https://rycamelot1-a.akamaihd.net/fb/e2/src/img/feeds/merlin_magical_token.jpg
// @namespace		KoCDomSel
// @description		This script will automatically select your domain when accepting Merlins Tokens from Facebook!
// @include			*kingdomsofcamelot.com/fb/e2/src/claimVictoryToken_src.php*
// @include			*kingdomsofcamelot.com/fb/e2/src/merlinShare_src.php*
// @include			*kingdomsofcamelot.com/fb/e2/src/acceptToken_src.php*
// @include			*kingdomsofcamelot.com/fb/e2/src/helpFriend_src.php*
// @include			*kingdomsofcamelot.com/fb/e2/src/questshare_src.php*
// @include			*.kingdomsofcamelot.com/*main_src.php*
// @grant			GM_getValue
// @grant			GM_setValue
// @grant			GM_deleteValue
// @grant			GM_listValues
// @grant			GM_log
// @grant			GM_xmlhttpRequest
// @grant			unsafeWindow
// @version			0.15a
// @license			http://creativecommons.org/licenses/by-nc-sa/3.0/
// ==/UserScript==

//
//	March 2015 Barbarossa69 (www.facebook.com/barbarossa69)
//	Aided in development by Audrius Audriulaitis
//	Script adapted from "Auto Accept Kingdoms of Camelot Gifts" by Thomas Chapin
//	https://koc-battle-console.googlecode.com/svn/trunk/KoCDomainSelector.user.js
//

var Version = '0.15a';

String.prototype.trim = function () {
	return this.replace(/^\s+|\s+$/g, '');
}
String.prototype.StripQuotes = function () {
	return this.replace(/"/g, '');
};

if (!this.JSON2) {
	JSON2 = {};
}
(function () {
	function f(n) {
		return n < 10 ? '0' + n : n;
	}
	if (typeof Date.prototype.toJSON !== 'function') {
		Date.prototype.toJSON = function (key) {
			return this.getUTCFullYear() + '-' +
			f(this.getUTCMonth() + 1) + '-' +
			f(this.getUTCDate()) + 'T' +
			f(this.getUTCHours()) + ':' +
			f(this.getUTCMinutes()) + ':' +
			f(this.getUTCSeconds()) + 'Z';
		};
		String.prototype.toJSON = Number.prototype.toJSON = Boolean.prototype.toJSON = function (key) {
			return this.valueOf();
		};
	}
	var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
	escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
	gap,
	indent,
	meta = {
		'\b' : '\\b',
		'\t' : '\\t',
		'\n' : '\\n',
		'\f' : '\\f',
		'\r' : '\\r',
		'"' : '\\"',
		'\\' : '\\\\'
	},
	rep;
	function quote(string) {
		escapable.lastIndex = 0;
		return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
			var c = meta[a];
			return typeof c === 'string' ? c : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
		}) + '"' : '"' + string + '"';
	}
	function str(key, holder) {
		var i,
		k,
		v,
		length,
		mind = gap,
		partial,
		value = holder[key];
		if (value && typeof value === 'object' && typeof value.toJSON === 'function') {
			value = value.toJSON(key);
		}
		if (typeof rep === 'function') {
			value = rep.call(holder, key, value);
		}
		switch (typeof value) {
		case 'string':
			return quote(value);
		case 'number':
			return isFinite(value) ? String(value) : 'null';
		case 'boolean':
		case 'null':
			return String(value);
		case 'object':
			if (!value) {
				return 'null';
			}
			gap += indent;
			partial = [];
			if (Object.prototype.toString.apply(value) === '[object Array]') {
				length = value.length;
				for (i = 0; i < length; i += 1) {
					partial[i] = str(i, value) || 'null';
				}
				v = partial.length === 0 ? '[]' : gap ? '[\n' + gap +
					partial.join(',\n' + gap) + '\n' +
					mind + ']' : '[' + partial.join(',') + ']';
				gap = mind;
				return v;
			}
			if (rep && typeof rep === 'object') {
				length = rep.length;
				for (i = 0; i < length; i += 1) {
					k = rep[i];
					if (typeof k === 'string') {
						v = str(k, value);
						if (v) {
							partial.push(quote(k) + (gap ? ': ' : ':') + v);
						}
					}
				}
			} else {
				for (k in value) {
					if (Object.hasOwnProperty.call(value, k)) {
						v = str(k, value);
						if (v) {
							partial.push(quote(k) + (gap ? ': ' : ':') + v);
						}
					}
				}
			}
			v = partial.length === 0 ? '{}' : gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
				mind + '}' : '{' + partial.join(',') + '}';
			gap = mind;
			return v;
		}
	}
	if (typeof JSON2.stringify !== 'function') {
		JSON2.stringify = function (value, replacer, space) {
			var i;
			gap = '';
			indent = '';
			if (typeof space === 'number') {
				for (i = 0; i < space; i += 1) {
					indent += ' ';
				}
			} else if (typeof space === 'string') {
				indent = space;
			}
			rep = replacer;
			if (replacer && typeof replacer !== 'function' && (typeof replacer !== 'object' || typeof replacer.length !== 'number')) {
				throw new Error('JSON.stringify');
			}
			return str('', {
				'' : value
			});
		};
	}
	if (typeof JSON2.parse !== 'function') {
		JSON2.parse = function (text, reviver) {
			var j;
			function walk(holder, key) {
				var k,
				v,
				value = holder[key];
				if (value && typeof value === 'object') {
					for (k in value) {
						if (Object.hasOwnProperty.call(value, k)) {
							v = walk(value, k);
							if (v !== undefined) {
								value[k] = v;
							} else {
								delete value[k];
							}
						}
					}
				}
				return reviver.call(holder, key, value);
			}
			cx.lastIndex = 0;
			if (cx.test(text)) {
				text = text.replace(cx, function (a) {
						return '\\u' +
						('0000' + a.charCodeAt(0).toString(16)).slice(-4);
					});
			}
			if (text) {
				if (/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
					j = eval('(' + text + ')');
					return typeof reviver === 'function' ? walk({
						'' : j
					}, '') : j;
				}
			}	
			throw new SyntaxError('JSON.parse');
		};
	}
})();

if (!this.GM_log) {
	GM_log = function (m) {
		console.log(m);
	}
	GM_registerMenuCommand = function (text, f) {}

}

if (!this.unsafeWindow) {
	//~~~ need helper to return values?
	unsafeWindow = {};
}

function AddScript(script) {
	var a = document.createElement('script');
	a.innerHTML = script;
	document.getElementsByTagName('head')[0].appendChild(a);
	return;
}

function inspect(obj, maxLevels, level) {
	var str = '',
	type,
	msg;

	// Start Input Validations
	// Don't touch, we start iterating at level zero
	if (level == null)
		level = 0;

	// At least you want to show the first level
	if (maxLevels == null)
		maxLevels = 1;
	if (maxLevels < 1)
		return '<font color="red">Error: Levels number must be > 0</font>';

	// We start with a non null object
	if (obj == null)
		return '<font color="red">Error: Object <b>NULL</b></font>';
	// End Input Validations

	// Each Iteration must be indented
	str += '<ul>';

	// Start iterations for all objects in obj
	for (property in obj) {
		try {
			// Show "property" and "type property"
			type = typeof(obj[property]);
			str += '<li>(' + type + ') ' + property +
			((obj[property] == null) ? (': <b>null</b>') : (': ' + obj[property])) + '</li>';

			// We keep iterating if this property is an Object, non null
			// and we are inside the required number of levels
			if ((type == 'object') && (obj[property] != null) && (level + 1 < maxLevels))
				str += inspect(obj[property], maxLevels, level + 1);
		} catch (err) {
			// Is there some properties in obj we can't access? Print it red.
			if (typeof(err) == 'string')
				msg = err;
			else if (err.message)
				msg = err.message;
			else if (err.description)
				msg = err.description;
			else
				msg = 'Unknown';

			str += '<li><font color="red">(Error) ' + property + ': ' + msg + '</font></li>';
		}
	}

	// Close indent
	str += '</ul>';

	return str;
}

var nHtml = {
	FindByXPath : function (obj, xpath, nodetype) {
		if (!nodetype) {
			nodetype = XPathResult.FIRST_ORDERED_NODE_TYPE;
		}
		try {
			var q = document.evaluate(xpath, obj, null, nodetype, null);
		} catch (e) {
			GM_log('bad xpath:' + xpath);
		}
		if (nodetype == XPathResult.FIRST_ORDERED_NODE_TYPE) {
			if (q && q.singleNodeValue) {
				return q.singleNodeValue;
			}
		} else {
			if (q) {
				return q;
			}
		}
		return null;
	},
	ClickWin : function (win, obj, evtName) {
		var evt = win.document.createEvent("MouseEvents");
		evt.initMouseEvent(evtName, true, true, win,
			0, 0, 0, 0, 0, false, false, false, false, 0, null);
		return !obj.dispatchEvent(evt);
	},
	Click : function (obj) {
		return this.ClickWin(window, obj, 'click');
	},
	ClickTimeout : function (obj, millisec) {
		window.setTimeout(function () {
			return nHtml.ClickWin(window, obj, 'click');
		}, millisec + Math.floor(Math.random() * 500));
	},

	SetSelect : function (obj, v) {
		for (var o = 0; o < obj.options.length; o++) {
			if (v == obj.options[o].value) {
				obj.options[o].selected = true;
				return true;
			}
		}
		return false;
	}

};

function ById(id) {
	return document.getElementById(id);
}

function ByName(name) {
	return document.getElementsByName(name);
}

function AddText(box1, txt) {
	var txtObj;
	box1.appendChild(txtObj = document.createTextNode(txt));
	return txtObj;
}

function AddHtml(box1, txt) {
	var txtObj;
	var sp = document.createElement('span');
	sp.innerHTML = txt;
	box1.appendChild(sp);
	return txtObj;
}

function getServerId() { // domain for tokens may be passed in URL as &token_s parameter...
	var myServerId = KOCAutoAcceptGifts.options.UserDomain;
	var squery = /[\?,\&]token_s=\d+/;
	var dquery = /\d+/;
	var Sresult = dquery.exec(squery.exec(document.location.search));
	if (Sresult)
		myServerId = Sresult;
	return myServerId;
}

function getBadServerId() {
	var myServerId = KOCAutoAcceptGifts.options.UserDomain;
	var squery = /[\?,\&]s=\d+/;
	var dquery = /\d+/;
	var Sresult = dquery.exec(squery.exec(document.location.search));
	if (Sresult)
		myServerId = Sresult;
	return myServerId;
}

function getFeedId() {
	var myServerId = 'n/a';
	var squery = /[\?,\&]f=\d+/;
	var dquery = /\d+/;
	var Sresult = dquery.exec(squery.exec(document.location.search));
	if (Sresult)
		myServerId = Sresult;
	return myServerId;
}

function getFeedUserId() {
	var myServerId = 'n/a';
	var squery = /[\?,\&]in=\d+/;
	var dquery = /\d+/;
	var Sresult = dquery.exec(squery.exec(document.location.search));
	if (Sresult)
		myServerId = Sresult;
	return myServerId;
}

function createButton(label) {
	var a = document.createElement('a');
	a.className = 'button20';
	a.innerHTML = '<span style="color: #ff6">' + label + '</span>';
	return a;
}

function AddMainTabLink(text, eventListener, mouseListener) {
	var a = createButton (text);
	a.className='tab';
	a.title='Have you collected your Merlins Tokens yet today?';

	var tabs=document.getElementById('main_engagement_tabs');
	if(!tabs) {
		tabs=document.getElementById('topnav_msg');
		if (tabs)
			tabs=tabs.parentNode;
	}
	if (tabs) {
		var e = tabs.parentNode;
		var gmTabs = null;
		for (var i=0; i<e.childNodes.length; i++){
			var ee = e.childNodes[i];
			if (ee.tagName && ee.tagName=='DIV' && ee.className=='tabs_engagement' && ee.id!='main_engagement_tabs'){
				gmTabs = ee;
				break;
			}
		}
		if (gmTabs == null){
			gmTabs = document.createElement('div');
			gmTabs.className='tabs_engagement';
			tabs.parentNode.insertBefore (gmTabs, tabs);
			gmTabs.style.whiteSpace='nowrap';
			gmTabs.style.width='735px';
			gmTabs.lang = 'en_PT';
		}
		gmTabs.style.height='0%';
		gmTabs.style.overflow='auto';
		if (gmTabs.firstChild)
			gmTabs.insertBefore (a, gmTabs.firstChild);
		else
			gmTabs.appendChild(a);
		a.addEventListener('click',eventListener, false);
		if (mouseListener != null)
			a.addEventListener('mousedown',mouseListener, true);
		return a;
	}
	return null;
}

var WinManager = {
	wins : {},    // prefix : CPopup obj

	get : function (prefix){
		var t = WinManager;
		return t.wins[prefix];
	},
  
	add : function (prefix, pop){
		var t = WinManager;
		t.wins[prefix] = pop;
		if (unsafeWindow.cpopupWins == null)
		unsafeWindow.cpopupWins = {};
		unsafeWindow.cpopupWins[prefix] = pop;
	},
  
	delete : function (prefix){
		var t = WinManager;
		delete t.wins[prefix];
		delete unsafeWindow.cpopupWins[prefix];
	}    
}

// creates a 'popup' div
// prefix must be a unique (short) name for the popup window
function CPopup (prefix, x, y, width, height, enableDrag, onClose) {
  var pop = WinManager.get(prefix);
  if (pop){
    pop.show (false);
    return pop;
  }
  this.BASE_ZINDEX = 111111;

  // protos ...
  this.show = show;
  this.toggleHide = toggleHide;
  this.getTopDiv = getTopDiv;
  this.getMainDiv = getMainDiv;
  this.getLayer = getLayer;
  this.setLayer = setLayer;
  this.setEnableDrag = setEnableDrag;
  this.getLocation = getLocation;
  this.setLocation = setLocation;
  this.getDimensions = getDimensions;
  this.setDimensions = setDimensions;
  this.focusMe = focusMe;
  this.unfocusMe = unfocusMe;
  this.centerMe = centerMe;
  this.destroy = destroy;

  // object vars ...
  this.div = document.createElement('div');
  this.prefix = prefix;
  this.onClose = onClose;
  
  var t = this;
  this.div.className = 'btPopup '+ prefix +'_btPopup';
  this.div.id = prefix +'_outer';
  this.div.style.background = "#fff";
  this.div.style.zIndex = this.BASE_ZINDEX        // KOC modal is 100404 ?
  this.div.style.display = 'none';
  this.div.style.width = width + 'px';
  this.div.style.height = height + 'px';
  this.div.style.position = "absolute";
  this.div.style.top = y +'px';
  this.div.style.left = x + 'px';
  
  var m = '<TABLE cellspacing=0 width=100% height=100%><TR id="'+ prefix +'_bar" class="btPopupTop '+ prefix +'_btPopupTop"><TD style="-moz-border-radius-topleft: 20px; border-top-left-radius: 20px;" width=99%><SPAN id="'+ prefix +'_top"></span></td>\
      <TD id='+ prefix +'_X align=right valign=middle onmouseover="this.style.cursor=\'pointer\'" style="color:#fff; background:#400; border:1px solid #000000; font-weight:bold; font-size:14px; padding:0px 5px; -moz-border-radius-topright: 20px; border-top-right-radius: 20px;">X</td></tr>\
      <TR><TD height=100% valign=top class="btPopMain '+ prefix +'_btPopMain" colspan=2 id="'+ prefix +'_main"></td></tr></table>';
  document.body.appendChild(this.div);
  this.div.innerHTML = m;
  document.getElementById(prefix+'_X').addEventListener ('click', e_XClose, false);
  this.dragger = new CWinDrag (document.getElementById(prefix+'_bar'), this.div, enableDrag);
  
  this.div.addEventListener ('mousedown', e_divClicked, false);
  WinManager.add(prefix, this);
  
  function e_divClicked (){
    t.focusMe();
  }  
  function e_XClose (){
    t.show(false);
    if (t.onClose != null)
      t.onClose();
  }

  function focusMe (){
    t.setLayer(5);
    for (k in unsafeWindow.cpopupWins){
      if (k != t.prefix)
        unsafeWindow.cpopupWins[k].unfocusMe(); 
    }
  }
  function unfocusMe (){
    t.setLayer(-5);
  }
  function getLocation (){
    return {x: parseInt(this.div.style.left), y: parseInt(this.div.style.top)};
  }
  function getDimensions (){
    return {x: parseInt(this.div.style.width), y: parseInt(this.div.style.height)};
  }
  function setLocation (loc){
    t.div.style.left = loc.x +'px';
    t.div.style.top = loc.y +'px';
  }
  function setDimensions (loc){
    t.div.style.width = loc.x +'px';
    t.div.style.height = loc.y +'px';
  }
  function destroy (){
    document.body.removeChild(t.div);
    WinManager.delete (t.prefix);
  }
  function centerMe (parent){
    if (parent == null){
      var coords = getClientCoords(document.body);
    } else
      var coords = getClientCoords(parent);
    var x = ((coords.width - parseInt(t.div.style.width)) / 2) + coords.x;
    var y = ((coords.height - parseInt(t.div.style.height)) / 2) + coords.y;
    if (x<0)
      x = 0;
    if (y<0)
      y = 0;
    t.div.style.left = x +'px';
    t.div.style.top = y +'px';
  }
  function setEnableDrag (tf){
    t.dragger.setEnable(tf);
  }
  function setLayer(zi){
    t.div.style.zIndex = ''+ (this.BASE_ZINDEX + zi);
  }
  function getLayer(){
    return parseInt(t.div.style.zIndex) - this.BASE_ZINDEX;
  }
  function getTopDiv(){
    return document.getElementById(this.prefix+'_top');
  }
  function getMainDiv(){
    return document.getElementById(this.prefix+'_main');
  }
  function show(tf){
    if (tf){
      t.div.style.display = 'block';
      t.focusMe ();
    } else {
      t.div.style.display = 'none';
    }
    return tf;
  }
  function toggleHide(t){
    if (t.div.style.display == 'block') {
      return t.show (false);
    } else {
      return t.show (true);
    }
  }
}

function CWinDrag (clickableElement, movingDiv, enabled) {
  var t=this;
  this.setEnable = setEnable;
  this.setBoundRect = setBoundRect;
  this.lastX = null;
  this.lastY = null;
  this.enabled = true;
  this.moving = false;
  this.theDiv = movingDiv;
  this.body = document.body;
  this.ce = clickableElement;
  this.moveHandler = new CeventMove(this).handler;
  this.outHandler = new CeventOut(this).handler;
  this.upHandler = new CeventUp(this).handler;
  this.downHandler = new CeventDown(this).handler;
  this.clickableRect = null;
  this.boundRect = null;
  this.bounds = null;
  this.enabled = false;
  if (enabled == null)
    enabled = true;
  this.setEnable (enabled);

  function setBoundRect (b){    // this rect (client coords) will not go outside of current body
    this.boundRect = boundRect;
    this.bounds = null;
  }

  function setEnable (enable){
    if (enable == t.enabled)
      return;
    if (enable){
      clickableElement.addEventListener('mousedown',  t.downHandler, false);
      t.body.addEventListener('mouseup', t.upHandler, false);
    } else {
      clickableElement.removeEventListener('mousedown', t.downHandler, false);
      t.body.removeEventListener('mouseup', t.upHandler, false);
    }
    t.enabled = enable;
  }

  function CeventDown (that){
    this.handler = handler;
    var t = that;
    function handler (me){
      if (t.bounds == null){
        t.clickableRect = getClientCoords(clickableElement);
        t.bodyRect = getClientCoords(document.body);
        if (t.boundRect == null)
          t.boundRect = t.clickableRect;
        t.bounds = {top:10-t.clickableRect.height, bot:t.bodyRect.height-25, left:40-t.clickableRect.width, right:t.bodyRect.width-25};
      }
      if (me.button==0 && t.enabled){
        t.body.addEventListener('mousemove', t.moveHandler, true);
        t.body.addEventListener('mouseout', t.outHandler, true);
        t.lastX = me.clientX;
        t.lastY = me.clientY;
        t.moving = true;
      }
    }
  }

  function CeventUp  (that){
    this.handler = handler;
    var t = that;
    function handler (me){
      if (me.button==0 && t.moving)
        _doneMoving(t);
    }
  }

  function _doneMoving (t){
    t.body.removeEventListener('mousemove', t.moveHandler, true);
    t.body.removeEventListener('mouseout', t.outHandler, true);
    t.moving = false;
  }

  function CeventOut  (that){
    this.handler = handler;
    var t = that;
    function handler (me){
      if (me.button==0){
        t.moveHandler (me);
      }
    }
  }

  function CeventMove (that){
    this.handler = handler;
    var t = that;
    function handler (me){
      if (t.enabled && !t.wentOut){
        var newTop = parseInt(t.theDiv.style.top) + me.clientY - t.lastY;
        var newLeft = parseInt(t.theDiv.style.left) + me.clientX - t.lastX;
        if (newTop < t.bounds.top){     // if out-of-bounds...
          newTop = t.bounds.top;
          _doneMoving(t);
        } else if (newLeft < t.bounds.left){
          newLeft = t.bounds.left;
          _doneMoving(t);
        } else if (newLeft > t.bounds.right){
          newLeft = t.bounds.right;
          _doneMoving(t);
        } else if (newTop > t.bounds.bot){
          newTop = t.bounds.bot;
          _doneMoving(t);
        }
        t.theDiv.style.top = newTop + 'px';
        t.theDiv.style.left = newLeft + 'px';
        t.lastX = me.clientX;
        t.lastY = me.clientY;
      }
    }
  }
}

function getClientCoords(e){
  if (e==null)
    return {x:null, y:null, width:null, height:null};
  var x=0, y=0;
  ret = {x:0, y:0, width:e.clientWidth, height:e.clientHeight};
  while (e.offsetParent != null){
    ret.x += e.offsetLeft;
    ret.y += e.offsetTop;
    e = e.offsetParent;
  }
  return ret;
}

function TokenStartup (){
  if (unsafeWindow.TokenLoaded) return;

  var metc = getClientCoords(document.getElementById('main_engagement_tabs'));
  if (metc.width==null || metc.width==0){
    setTimeout (TokenStartup, 1000);
    return;
  }
  // add main tab link
  
  AddMainTabLink('TOKENS', TokenPopup);
  
  unsafeWindow.TokenLoaded = true;
  
  if (KOCAutoAcceptGifts.options.OpenState == true) {
	TokenPopup();
  }

}  

function CheckTokenDay() {
	var date = new Date();
	var utc = date.getTime() + (date.getTimezoneOffset() * 60000);
	var offset = -8 + (getDST(date)/60);
	var today = new Date(utc + (3600000 * offset));
	var dd = today.getDate();
	var mm = today.getMonth()+1; //January is 0!
	var yyyy = today.getFullYear();
	if(dd<10) {dd='0'+dd} 
	if(mm<10) {mm='0'+mm} 
	today = dd+'/'+mm+'/'+yyyy;
	if (today != KOCAutoAcceptGifts.options.TokenDate) {
		KOCAutoAcceptGifts.options.TokenDate = today;
		KOCAutoAcceptGifts.options.TokenCount = 0;
		KOCAutoAcceptGifts.options.TokenCollected = false;
		KOCAutoAcceptGifts.options.BuildCollected = false;
		KOCAutoAcceptGifts.SetOptions(KOCAutoAcceptGifts.options);
	}
}
  
function getDST(today) {
	var yr = today.getFullYear();
	var dst_start = new Date(yr+"-03-14T02:00:00"); // 2nd Sunday in March can't occur after the 14th 
	var dst_end = new Date(yr+"-11-07T02:00:00"); // 1st Sunday in November can't occur after the 7th
	var day = dst_start.getDay(); // day of week of 14th
	dst_start.setDate(14-day); // Calculate 2nd Sunday in March of this year
	day = dst_end.getDay(); // day of the week of 7th
	dst_end.setDate(7-day); // Calculate first Sunday in November of this year
	var dstadj = 0;
	if (today >= dst_start && today < dst_end) { //does today fall inside of DST period?
		dstadj = (3600); // 60 mins!
	}
	return dstadj;
}
  
function TokenPopup (){

	CheckTokenDay();

	if (TokenPop) {
		KOCAutoAcceptGifts.options.OpenState = TokenPop.toggleHide(TokenPop);
		KOCAutoAcceptGifts.SetOptions(KOCAutoAcceptGifts.options);
	}
	else {
		var styles = "";

		var NumTokens = unsafeWindow.seed.items.i599;
		
		if (!unsafeWindow.btLoaded) {
			var styles = '.xtab {padding-right: 5px; border:none; background:none; white-space:nowrap;}\
						  .xtabHD {padding-right: 5px; border-bottom:1px solid #888888; background:none; white-space:nowrap;font-weight:bold;font-size:11px;color:#888888;margin-left:10px;margin-right:10px;margin-top:5px;margin-bottom:5px;vertical-align:text-top;align:left}\
						  .xtabBR {padding-right: 5px; border:none; background:none; white-space:normal;}\
						  .xtabBRTop {padding-right: 5px; border:none; background:none; white-space:normal; vertical-align:top;}\
						  .btButton:Hover  {color:#FFFF80;}\
						  tr.btPopupTop td {background-color:#342819; border:1px solid #000000; height: 21px;  padding:0px; color:#FFFFFF;}\
						  .btPopMain       {background-color:#F7F3E6; border:1px solid #000000; -moz-box-shadow:inset 0px 0px 10px #6a6a6a; -moz-border-radius-bottomright: 20px; -moz-border-radius-bottomleft: 20px; border-bottom-right-radius: 20px; border-bottom-left-radius: 20px; font-size:11px; color:#000000}\
						  .btPopup         {border:5px ridge #666; -moz-border-radius:25px; border-radius:25px; -moz-box-shadow: 1px 1px 5px #000000;}\
						  .divHide         {display:none}\
						  .btInput		 {font-size:10px; }';
		}		
		
		var n = '<STYLE>'+ styles +'</style>';	
		n += '<br>&nbsp;&nbsp;&nbsp;<b><i>Settings</i></b><br><table align=center width=95% cellspacing=0 cellpadding=0>';
		n += '<tr><td width=50 class=xtab>Domain to Receive Tokens:&nbsp;</td><td class=xtab><input type=text id=tkdomain size=2 maxlength=3 class=btInput value="'+KOCAutoAcceptGifts.options.UserDomain+'"></td><td class=xtab align=right><b>Enabled&nbsp;<input type=checkbox id=tkenable '+(KOCAutoAcceptGifts.options.Enabled?'CHECKED':'')+'></b></td></tr>';
		n += '<tr><td class=xtab>Domains for Chest Links:&nbsp;</td><td class=xtab colspan=2><input type=text id=tkchestdomainlist size=47 class=btInput value="'+KOCAutoAcceptGifts.options.ChestDomainList+'" title="List some domains you do NOT play in here, separated by commas."></td></tr>';
		n += '</table>';
		n += '<br><table align=center width=95% cellspacing=0 cellpadding=0><tr><td colspan=2 class=xtab align=left><b><i>Collect Tokens</i></b></td></tr><tr><td colspan=2 class=xtab align=right><a id=tkgrabchest class="inlineButton btButton brown8"><span>Search for Chests</span></a>&nbsp;&nbsp;Posts to Search<input  title="Enter the number of wall posts you wish to search through." type=text id=tksearchnum size=2 maxlength=3 class=btInput value="'+KOCAutoAcceptGifts.options.SearchNum+'">&nbsp;&nbsp;Your Wall<input title="Tick to search your posts on your wall. Untick to search other peoples posts in your news feed." type=checkbox id=tkyourwall '+(KOCAutoAcceptGifts.options.YourWall?'CHECKED':'')+'>&nbsp;Rev<input title="Tick to search posts in reverse order, i.e. oldest first." type=checkbox id=tkrev '+(KOCAutoAcceptGifts.options.Reversed?'CHECKED':'')+'></td></tr><tr><td class=xtab colspan=2 align=right>Search only this ProfileURL:&nbsp;<input type=text id=tksearchuser size=47 class=btInput value="'+KOCAutoAcceptGifts.options.SearchUser+'" title="Leave blank to search all your friends"></td>';
		n += '<tr><td class=xtab>Link:&nbsp;</td><td class=xtab align=right><input type=text id=tklink size=80 class=btInput title="Copy and paste your Build, Token or Treasure Chest links from Facebook into here!"></td></tr>';
		n += '<tr><td class=xtab align=right colspan=2><a id=tkcleanwall class="inlineButton btButton brown8" title="Remove Chests already claimed (and other Kabam posts) from your own wall"><span>Clean your Wall</span></a>&nbsp;<a id=tktokenbmk class="inlineButton btButton brown8"><span>Save as Token</span></a>&nbsp;<a id=tkbuildbmk class="inlineButton btButton brown8"><span>Save as Build</span></a></td></tr>';
		n += '</table>';
		n += '<br><table align=center width=95% cellspacing=0 cellpadding=0>';
		n += '<tr><td width=33% class=xtab align=center><a id=tktokenlink><img height=40 style="vertical-align:text-top;" src="'+TokenImage+'" title="'+KOCAutoAcceptGifts.options.TokenLink+'"></a><br><span id=tktokencollected>&nbsp;</span></td><td width=33% class=xtab align=center><a id=tkbuildlink><img height=40 style="vertical-align:text-top;" src="'+BuildImage+'" title="'+KOCAutoAcceptGifts.options.BuildLink+'"></a><br><span id=tkbuildcollected>&nbsp;</span></td><td width=33% class=xtab align=center><a id=tkchestlink><img height=40 style="vertical-align:text-top;" src="'+ChestImage+'" title="Launch current link replacing domain number if specified below..."></a><br><a id=tkprior><<</a>&nbsp;<input type=text id=tkchestdomain size=2 maxlength=3 class=btInput value="'+KOCAutoAcceptGifts.options.ChestDomain+'" title="Enter a domain you do not play to collect chests from your own wall!">&nbsp;<a id=tknext>>></a></td></tr>';
		n += '</table>';
		n += '<div align="center" style="font-size:10px;opacity:0.6;">KoC Domain Selector '+Version+'<br>'+KOCAutoAcceptGifts.options.TokenCount+' tokens collected today.<br>You currently possess <span id=tknum>'+NumTokens+'</span> tokens.</div>';
		n += '<div id=tkmessage align="center" style="font-size:12px;opacity:0.6">&nbsp;</div>';
		n += '<div align=center style="font-size:10px;" id=tktokenusebutton><a id=tktokenuse class="inlineButton btButton brown8"><span>Use a Token</span></a></div></div>';
		TokenPop = new CPopup('tkTokenOptions', 0, 0, 400, 360, true, function () {	KOCAutoAcceptGifts.options.OpenState = false; KOCAutoAcceptGifts.SetOptions(KOCAutoAcceptGifts.options); });
		TokenPop.getTopDiv().innerHTML = '<DIV align=center><B>TOKEN OPTIONS</B></DIV>';
		TokenPop.getMainDiv().innerHTML = n;

		if (KOCAutoAcceptGifts.options.TokenCollected) {
			document.getElementById('tktokencollected').innerHTML = '<span style="color:#080;"><b>Collected</b></span>';
		}
		if (KOCAutoAcceptGifts.options.BuildCollected) {
			document.getElementById('tkbuildcollected').innerHTML = '<span style="color:#080;"><b>Collected</b></span>';
		}
		
		if (NumTokens < 1) {
			unsafeWindow.jQuery('#tktokenusebutton').addClass('divHide');
		}
		
		document.getElementById('tkdomain').addEventListener('keyup', function () {
			if (isNaN(document.getElementById('tkdomain').value)) { document.getElementById('tkdomain').value = ""; }
			KOCAutoAcceptGifts.options.UserDomain = document.getElementById('tkdomain').value;
			KOCAutoAcceptGifts.SetOptions(KOCAutoAcceptGifts.options);
		}, false);
		document.getElementById('tkenable').addEventListener('change', function () {
			KOCAutoAcceptGifts.options.Enabled = document.getElementById('tkenable').checked;
			KOCAutoAcceptGifts.SetOptions(KOCAutoAcceptGifts.options);
		}, false);
		document.getElementById('tkyourwall').addEventListener('change', function () {
			KOCAutoAcceptGifts.options.YourWall = document.getElementById('tkyourwall').checked;
			KOCAutoAcceptGifts.SetOptions(KOCAutoAcceptGifts.options);
		}, false);
		document.getElementById('tkrev').addEventListener('change', function () {
			KOCAutoAcceptGifts.options.Reversed = document.getElementById('tkrev').checked;
			KOCAutoAcceptGifts.SetOptions(KOCAutoAcceptGifts.options);
		}, false);
		document.getElementById('tkchestdomain').addEventListener('keyup', function () {
			if (isNaN(document.getElementById('tkchestdomain').value)) { document.getElementById('tkchestdomain').value = ""; }
			KOCAutoAcceptGifts.options.ChestDomain = document.getElementById('tkchestdomain').value;
			KOCAutoAcceptGifts.SetOptions(KOCAutoAcceptGifts.options);
		}, false);
		document.getElementById('tkchestdomainlist').addEventListener('keyup', function () {
			KOCAutoAcceptGifts.options.ChestDomainList = document.getElementById('tkchestdomainlist').value;
			KOCAutoAcceptGifts.SetOptions(KOCAutoAcceptGifts.options);
		}, false);
		document.getElementById('tknext').addEventListener('click', function () {
			var DomArray = document.getElementById('tkchestdomainlist').value.split(","); 
			for (var d=0; d < DomArray.length; d++) {
				var found = false;
				if (DomArray[d] == KOCAutoAcceptGifts.options.ChestDomain) {
					if (d < DomArray.length-1) KOCAutoAcceptGifts.options.ChestDomain = DomArray[d+1]
					else KOCAutoAcceptGifts.options.ChestDomain = DomArray[0];
					KOCAutoAcceptGifts.SetOptions(KOCAutoAcceptGifts.options);
					found = true;
					break;
				}
			}
			if (!found) {
				KOCAutoAcceptGifts.options.ChestDomain = DomArray[0];
				KOCAutoAcceptGifts.SetOptions(KOCAutoAcceptGifts.options);
			}
			document.getElementById('tkchestdomain').value = KOCAutoAcceptGifts.options.ChestDomain;
		}, false);
		document.getElementById('tkprior').addEventListener('click', function () {
			var DomArray = document.getElementById('tkchestdomainlist').value.split(","); 
			for (var d=0; d < DomArray.length; d++) {
				var found = false;
				if (DomArray[d] == KOCAutoAcceptGifts.options.ChestDomain) {
					if (d > 0) KOCAutoAcceptGifts.options.ChestDomain = DomArray[d-1]
					else KOCAutoAcceptGifts.options.ChestDomain = DomArray[DomArray.length-1];
					KOCAutoAcceptGifts.SetOptions(KOCAutoAcceptGifts.options);
					found = true;
					break;
				}
			}
			if (!found) {
				KOCAutoAcceptGifts.options.ChestDomain = DomArray[DomArray.length-1];
				KOCAutoAcceptGifts.SetOptions(KOCAutoAcceptGifts.options);
			}
			document.getElementById('tkchestdomain').value = KOCAutoAcceptGifts.options.ChestDomain;
		}, false);
		document.getElementById('tkbuildbmk').addEventListener('click', function () {
			if (document.getElementById('tklink').value != "") { 
				KOCAutoAcceptGifts.options.BuildLink = document.getElementById('tklink').value;
				KOCAutoAcceptGifts.SetOptions(KOCAutoAcceptGifts.options);
				document.getElementById('tkbuildlink').title = document.getElementById('tklink').value;
				document.getElementById('tkbuildcollected').innerHTML = '<b>Saved</b>';
			}	
			else {
				document.getElementById('tkbuildcollected').innerHTML = '<span style="color:#f00;"><b>No Link</b></span>';			
			}
		}, false);
		document.getElementById('tktokenbmk').addEventListener('click', function () {
			if (document.getElementById('tklink').value != "") { 
				KOCAutoAcceptGifts.options.TokenLink = document.getElementById('tklink').value;
				KOCAutoAcceptGifts.SetOptions(KOCAutoAcceptGifts.options);
				document.getElementById('tktokenlink').title = document.getElementById('tklink').value;
				document.getElementById('tktokencollected').innerHTML = '<b>Saved</b>';
			}
			else {
				document.getElementById('tktokencollected').innerHTML = '<span style="color:#f00;"><b>No Link</b></span>';			
			}
		}, false);
		document.getElementById('tktokenlink').addEventListener('click', function () {
			if (KOCAutoAcceptGifts.options.TokenLink != "") { 
				var goto = KOCAutoAcceptGifts.options.TokenLink;
				setTimeout (function (){window.top.location = goto;}, 0);
			}	
		}, false);
		document.getElementById('tkbuildlink').addEventListener('click', function () {
			if (KOCAutoAcceptGifts.options.BuildLink != "") { 
				var goto = KOCAutoAcceptGifts.options.BuildLink;
				setTimeout (function (){window.top.location = goto;}, 0);
			}	
		}, false);
		document.getElementById('tkchestlink').addEventListener('click', function () {
			if (document.getElementById('tklink').value != "") { 
				var goto = document.getElementById('tklink').value;
				// replace domain in link if specified...
				if (document.getElementById('tkchestdomain').value != "") {
					repstring = "=s%3A"+document.getElementById('tkchestdomain').value;
					goto = goto.replace(/=s%3A\d\d\d/g,repstring);
					goto = goto.replace(/&s=\d\d\d/g,repstring);
				}
				// if selected domain in list, get next domain from list for next time...
				var DomArray = document.getElementById('tkchestdomainlist').value.split(","); 
				for (var d=0; d < DomArray.length; d++) {
					if (DomArray[d] == KOCAutoAcceptGifts.options.ChestDomain) {
						if (d < DomArray.length-1) KOCAutoAcceptGifts.options.ChestDomain = DomArray[d+1]
						else KOCAutoAcceptGifts.options.ChestDomain = DomArray[0];
						KOCAutoAcceptGifts.SetOptions(KOCAutoAcceptGifts.options);
						break;
					}
				}
				setTimeout (function (){window.top.location = goto;}, 0);
			}	
		}, false);
		document.getElementById('tksearchnum').addEventListener('keyup', function () {
			if (isNaN(document.getElementById('tksearchnum').value)) { document.getElementById('tksearchnum').value = "0"; }
			KOCAutoAcceptGifts.options.SearchNum = document.getElementById('tksearchnum').value;
			KOCAutoAcceptGifts.SetOptions(KOCAutoAcceptGifts.options);
		}, false);
		document.getElementById('tksearchuser').addEventListener('keyup', function () {
			KOCAutoAcceptGifts.options.SearchUser = document.getElementById('tksearchuser').value.trim();
			KOCAutoAcceptGifts.SetOptions(KOCAutoAcceptGifts.options);
		}, false);
		document.getElementById('tkgrabchest').addEventListener('click', function () {
			var FBUser = '';
			if (KOCAutoAcceptGifts.options.SearchUser != '') {
				FBUser = KOCAutoAcceptGifts.options.SearchUser.split("?")[0];
				if (FBUser.split("facebook.com/")[1]) {
					FBUser = FBUser.split("facebook.com/")[1];
				}
			}
			if (FBUser != '' && !KOCAutoAcceptGifts.options.YourWall) {
				document.getElementById('tkmessage').innerHTML = 'Searching for Treasure Chests by '+FBUser+'...';
			}
			else {
				document.getElementById('tkmessage').innerHTML = 'Searching for Treasure Chests...';
			}
			document.getElementById('tklink').value = '';
			
		  	unsafeWindow.FB.getLoginStatus(function(response) { if (response.status != 'connected') { return; } });

			unsafeWindow.FB.login(function (o) {
				if (o.authResponse) {
					var p = {
						access_token : o.authResponse.accessToken
					};
						
					ClaimChest.URL = '/me/home';
					if (FBUser != '') ClaimChest.URL = '/'+FBUser+'/posts';
					if (KOCAutoAcceptGifts.options.YourWall) ClaimChest.URL = '/me/posts';
					
					ClaimChest.p = p;
					ClaimChest.access_token = o.authResponse.accessToken;
					ClaimChest.NumPosts = 0;

					GetWallSearch();
				}
			},{ scope : "read_stream,user_likes" });
		}, false);
		document.getElementById('tkcleanwall').addEventListener('click', function () {
			document.getElementById('tkmessage').innerHTML = 'Searching for Kabam posts on your wall...';
			document.getElementById('tklink').value = '';
			
		  	unsafeWindow.FB.getLoginStatus(function(response) { if (response.status != 'connected') { return; } });

			unsafeWindow.FB.login(function (o) {
				if (o.authResponse) {
					var p = {
						access_token : o.authResponse.accessToken
					};
					CleanWall.p = p;
					CleanWall.access_token = o.authResponse.accessToken;
					CleanWall.NumPosts = 0;
					CleanWall.NumCleaned = 0;
					CleanWall.NumChecked = 0;

					GetWallDel();
				}
			},{ scope : "read_stream,user_likes" });
		}, false);
		document.getElementById('tktokenuse').addEventListener('click', function () {
			document.getElementById('tkmessage').innerHTML = 'Sending request...';
			var params=unsafeWindow.Object.clone(unsafeWindow.g_ajaxparams);
			params.ftflag=0;
			new unsafeWindow.Ajax.Request(unsafeWindow.g_ajaxpath+"ajax/magicalboxPreview.php"+unsafeWindow.g_ajaxsuffix,{
				method:"post",
				parameters:params,
				onSuccess:function(message){
					var rslt=eval("("+message.responseText+")");
					if(rslt.ok){
						var params=unsafeWindow.Object.clone(unsafeWindow.g_ajaxparams);
						new unsafeWindow.Ajax.Request(unsafeWindow.g_ajaxpath+"ajax/magicalboxPick.php"+unsafeWindow.g_ajaxsuffix,{
							method:"post",
							parameters:params,
							onSuccess:function(transport){
								var rslt=eval("("+transport.responseText+")");
								if(rslt.ok){
									var itemId=rslt.prize;
									if (unsafeWindow.seed.items["i"+itemId]) {
										unsafeWindow.seed.items["i"+itemId] = parseInt(unsafeWindow.seed.items["i"+itemId])+1;
										unsafeWindow.ksoItems[itemId].add();
									}
									else {
										unsafeWindow.seed.items["i"+itemId] = 1;
										unsafeWindow.ksoItems[itemId].add();
									}
									var NumTokens = parseInt(unsafeWindow.seed.items.i599);
									if (NumTokens > 0) {
										NumTokens = NumTokens - 1;
										unsafeWindow.seed.items.i599 = (NumTokens).toString();
										unsafeWindow.ksoItems[599].subtract();
									}
									document.getElementById('tkmessage').innerHTML = '<span style="color:#080;"><b>You won '+unsafeWindow.itemlist["i"+rslt.prize].name+'!</b></span>';
									document.getElementById('tknum').innerHTML = parseInt(unsafeWindow.seed.items.i599)
//									if (NumTokens < 1) {
//										unsafeWindow.jQuery('#tktokenusebutton').addClass('divHide');
//									}
									
								}
								else { 
									document.getElementById('tkmessage').innerHTML = '<span style="color:#f00">'+rslt.msg+'</span>';
								}
							}
						});
					}
					else {
						document.getElementById('tkmessage').innerHTML = '<span style="color:#f00">'+rslt.msg+'</span>';
					}
				}
			});
		}, false);
		
		KOCAutoAcceptGifts.options.OpenState = true;
		KOCAutoAcceptGifts.SetOptions(KOCAutoAcceptGifts.options);
		
		TokenPop.show(true);
	}
}

function GetWallSearch() {
	var params = { access_token : ClaimChest.access_token, "limit" : KOCAutoAcceptGifts.options.SearchNum, "filter" : "others" };
	if (ClaimChest.until != 'null')
		params = { access_token : ClaimChest.access_token, "limit" : KOCAutoAcceptGifts.options.SearchNum-ClaimChest.NumPosts, "filter" : "others", "until":ClaimChest.until, "__paging_token": ClaimChest.__paging_token};
	unsafeWindow.FB.api(ClaimChest.URL, params , function (result) {
		if (result.data) {
			if (result.paging) { 
				ClaimChest.__paging_token = result.paging.next.split("__paging_token=")[1];
				ClaimChest.until = result.paging.next.split("&__paging_token=")[0];
				ClaimChest.until = ClaimChest.until.split("until=")[1];
			}
			else {
				ClaimChest.until = 'null';ClaimChest.__paging_token='empty';
			}
			
			ClaimChest.posts = result.data; 
			ClaimChest.NumPosts += result.data.length;
			ClaimChest.CheckNext();
		}
		else {
			document.getElementById('tkmessage').innerHTML = '<span style="color:#f00;"><b>Error encountered :(</b></span>';
		}
	});
}

var ClaimChest = {
	posts : [],
	p : null,
	__paging_token : 'null',
	access_token : 'null',
	until : "null",
	NumPosts   : 0,
	URL : '',
	
	CheckNext : function () {
		var t = ClaimChest;
		if (t.posts.length == 0) {
			document.getElementById('tkmessage').innerHTML = '<span style="color:#f00;"><b>No available Treasure Chests ('+t.NumPosts+' checked)</b></span>';
			if (ClaimChest.until != 'empty' && ClaimChest.until != 'null' && ClaimChest.NumPosts < KOCAutoAcceptGifts.options.SearchNum){
				GetWallSearch();
			}	
			return;
		}
		var post = t.posts.splice(0,1)[0];
		if (post.link && post.link.indexOf("apps.facebook.com/kingdomsofcamelot/convert.php?pl=1&ty=3&si=118&wccc=fcf-feed-118&ln=31&da=2")>0 && (KOCAutoAcceptGifts.options.YourWall || (post.link.indexOf('&in='+ unsafeWindow.tvuid+'&')<0))) {
			var likes_found = false;
			if (post.likes && post.likes.data.length > 0) {likes_found = true;}
			if (!likes_found) {
				if (KOCAutoAcceptGifts.options.YourWall) {
					unsafeWindow.FB.api('/' + post.id, "DELETE", ClaimChest.p, function (result) {
						if (result && !result.error) {
							document.getElementById('tklink').value = post.link;
							document.getElementById('tkmessage').innerHTML = '<span style="color:#080;"><b>Found Treasure Chest! :)</b></span>';
							KOCAutoAcceptGifts.Log(JSON2.stringify(post));
						}
						else {
							ClaimChest.CheckNext();
						}
					});
				}
				else {
					unsafeWindow.FB.api('/' + post.id + '/likes', "POST", ClaimChest.p, function (result) {
						if (result && !result.error) {
							document.getElementById('tklink').value = post.link;
							document.getElementById('tkmessage').innerHTML = '<span style="color:#080;"><b>Found Chest belonging to '+post.from.name+'! :)</b></span>';
							KOCAutoAcceptGifts.Log(JSON2.stringify(post));
						}
						else {
							ClaimChest.CheckNext();
						}
					});
				}	
			}
			else {
				ClaimChest.CheckNext();
			}
		}
		else {
			ClaimChest.CheckNext();
		}
	},
}

function GetWallDel() {
	var params = { access_token : CleanWall.access_token, "limit" : KOCAutoAcceptGifts.options.SearchNum, "filter" : "others" };
	if (CleanWall.until != 'null')
		params = { access_token : CleanWall.access_token, "limit" : KOCAutoAcceptGifts.options.SearchNum-CleanWall.NumPosts, "filter" : "others", "until":CleanWall.until, "__paging_token": CleanWall.__paging_token};
	var URL = '/me/posts';
	unsafeWindow.FB.api(URL, params , function (result) {
		if (result.data) {
			if (result.paging) { 
				CleanWall.__paging_token = result.paging.next.split("__paging_token=")[1];
				CleanWall.until = result.paging.next.split("&__paging_token=")[0];
				CleanWall.until = CleanWall.until.split("until=")[1];
			}
			else {
				CleanWall.until = 'null';CleanWall.__paging_token='empty';
			}
			
			CleanWall.posts = result.data; 
			CleanWall.NumPosts += result.data.length;
			CleanWall.CheckNext();
		}
		else {
			document.getElementById('tkmessage').innerHTML = '<span style="color:#f00;"><b>Error encountered :(</b></span>';
		}
	});
}

var CleanWall = {
	posts : [],
	p : null,
	__paging_token : 'null',
	access_token : 'null',
	until : "null",
	NumCleaned : 0,
	NumChecked : 0,
	NumPosts   : 0,
	CheckNext : function () {
		var date_now = new Date(); 
		var t = CleanWall;
		if (t.posts.length == 0) {
			document.getElementById('tkmessage').innerHTML = '<span style="color:#f00;"><b>'+t.NumCleaned+'/'+t.NumChecked+' Kabam posts deleted. ('+t.NumPosts+' checked)</b></span>';
			if (CleanWall.until != 'empty' && CleanWall.until != 'null' && CleanWall.NumPosts < KOCAutoAcceptGifts.options.SearchNum){
				GetWallDel();
			}	
			return;
		}
		var post = t.posts.splice(0,1)[0];
		if (post.application && post.application.id=='130402594779') { // belt and braces - only delete kabam posts
			CleanWall.NumChecked++;
			var likes_found = false;
			if (post.likes && post.likes.data.length > 0) {likes_found = true;}
			var other_post = false;
			var post_date = new Date (post.created_time); 
			var post_time_hh = (date_now - post_date)/1000/60/60; 
			var l_post_link = 'n/a';

			if (post.link) l_post_link = post.link;
			 
			other_post = (l_post_link.indexOf("si=303&wccc=fcf-feed-303&ln=31&da=2")>0) // Collected Daily Rewards
					|| (l_post_link.indexOf("si=201&wccc=fcf-feed-201&ln=31&da=2")>0) // Faire
					|| (l_post_link.indexOf("si=85&wccc=fcf-feed-85&ln=31&da=2")>0) // daily merlin token share
					|| (l_post_link.indexOf("si=95&wccc=fcf-feed-95&ln=31&da=2")>0)// building posts
					|| (l_post_link.indexOf("si=107&wccc=fcf-feed-107&ln=31&da=2")>0)// research posts
					|| (l_post_link.indexOf("si=84&wccc=fcf-feed-84&ln=31&da=2")>0)// Mysterious Bounty chest 
					|| (l_post_link == 'n/a'); // other KoC posts with no link (?)
						
			if (likes_found || other_post) {
				unsafeWindow.FB.api('/' + post.id, "DELETE", CleanWall.p, function (result) {
					if (result && !result.error) {
						CleanWall.NumCleaned++;
					}
					else {
						KOCAutoAcceptGifts.Log(JSON2.stringify(result.error));
					}
					CleanWall.CheckNext();
				});
			}
			else {
				CleanWall.CheckNext();
			}
		}
		else {
			CleanWall.CheckNext();
		}
	},
}

var KOCAutoAcceptGifts = {
	startListenTime : null,
	options : null,
	isChrome : navigator.userAgent.toLowerCase().indexOf('chrome') > -1,

	DoUnsafeWindow : function (func, execute_by_embed) {
		if (this.isChrome || execute_by_embed) {
			var scr = document.createElement('script');
			scr.innerHTML = func;
			document.body.appendChild(scr);
		} else {
			eval("unsafeWindow." + func);
		}
	},

	Log : function (str) {
		GM_log(str);
	},

	GetValue : function (name, default_val) {
		return GM_getValue(name, default_val);
	},

	SetValue : function (name, val) {
		if (val == null || val == undefined) {
			GM_deleteValue(name);
		} else {
			return GM_setValue(name, val);
		}
	},

	ListValues : function () {
		return GM_listValues();
	},

	ClearOptions : function () {
		this.SetValue('Options', JSON.stringify({}));
	},

	GetOptions : function () {
		var json = this.GetValue('Options');
		var options = {};
		if (json !=null) options = JSON2.parse(json);
		var defOptions = {
			UserDomain : 454,
			Enabled : true,
			ChestDomain : '',
			BuildLink : '',
			TokenLink : '',
			TokenDate : 0,
			TokenCount : 0,
			TokenCollected : false,
			BuildCollected : false,
			ChestDomainList : '',
			OpenState : false,
			SearchNum : 30,
			YourWall : false,
			Reversed : true,
			SearchUser : '',
		};
		for (var n in defOptions) {
			if (options[n] != undefined) {
				continue;
			}
			options[n] = defOptions[n];
		}
		return options;
	},

	SetOptions : function (v) {
		this.SetValue('Options', JSON2.stringify(v));
	},

	FactoryReset : function () {
		var stored_values = this.ListValues();
		for (var n = 0; n < stored_values.length; n++) {
			GM_deleteValue(stored_values[n], null);
		}
		this.SetOptions({});
	},

	pageLoaded : false,
	giftAccepted : false,
	Listen : function () {
		var t = this;

		this.options = this.GetOptions();
		this.startListenTime = new Date();

		var domTickTimer = null;
		var domTickUpto = 0;
		var domTick = function (e) {

			if (!t.giftAccepted) {
				// Find the gift claiming container div
				var claim_gift = ById('claimgift');
				if (!claim_gift)
					claim_gift = ById('claimhelp');
				if (claim_gift) {
					// Look for the select drop-down
					var domain_selector = ById('serverid');
					// Look for the next button
					var next_button1 = nHtml.FindByXPath(claim_gift, ".//a[contains(@onclick,'checkServer')]");
					var next_button2 = nHtml.FindByXPath(claim_gift, ".//a[@class='nextbtn']");
					var next_button3 = nHtml.FindByXPath(claim_gift, ".//a[contains(@onclick,'claimhelpform')]");
					var back_button = nHtml.FindByXPath(claim_gift, ".//a");
					if (domain_selector && (next_button1 || next_button2)) {
						for (var i = 0; i < domain_selector.options.length; i++) {
							if (domain_selector.options[i].value == UserDomain) {
								domain_selector.selectedIndex = i;
								if (next_button1) {
									nHtml.Click(next_button1);
								} else {
									nHtml.Click(next_button2);
								}
								t.giftAccepted = true;
								t.Log("Merlins Token collected :)");
								CheckTokenDay();
								if (document.URL.search(/merlinShare_src.php/i) != -1) { t.options.TokenCollected = true; }
								if (document.URL.search(/accepttoken_src.php/i) != -1) { t.options.BuildCollected = true; }
								t.options.TokenCount = t.options.TokenCount + 1;
								t.SetOptions(t.options);
								break;
							}
						}
					}
					else {
						if (next_button3) {
							nHtml.Click(next_button3);
						}
						else {
							if (next_button2 || back_button) {
								t.giftAccepted = true;
								t.Log("Merlins Token could not be collected :(");

								var a = document.createElement('div');
								a.innerHTML = '<div align=center><br><i>Merlins Token could not be collected.<br>(KoC will automatically reload in 10 seconds)</i></div>';
								var claim_help_bdy = nHtml.FindByXPath(claim_gift, ".//div[contains(@class,'helpbodycontent')]");
								if (!claim_help_bdy)
									claim_help_bdy = nHtml.FindByXPath(claim_gift, ".//div[@class='claimhelpbdy']");
								
								if (claim_help_bdy) {
									claim_help_bdy.appendChild(a);
								} else {
									claim_gift.appendChild(a);
								}	
							
								var goto1 = window.location.protocol+'//apps.facebook.com/kingdomsofcamelot/?s='+UserDomain;
								if (document.URL.search(/page=friendFeed/i)>0) {
									if (claim_gift.textContent.indexOf("Someone else has claimed this bonus.")>-1||
										claim_gift.textContent.indexOf("You have already claimed this")>-1 ||
										claim_gift.textContent.indexOf("You can not click on your own feed")>-1 ||
										claim_gift.textContent.indexOf("You have followed an invalid feed link")>-1 ||										
										claim_gift.textContent.indexOf("You cannot click on your own feed")>-1)
										goto1 += '&s_expired_mt='+getBadServerId(); // to communicate with BOT script that merlin token expired and BOT should try another link;
									else goto1 += '&s_bad_mt='+getBadServerId(); // to communicate with BOT script that from this domain merlin token not taken;
								}							
								setTimeout (function (){window.top.location = goto1;}, 10000);								
							}
							else {
								if (domain_selector == null && (typeof unsafeWindow.checkServer == 'function')) {
									t.giftAccepted = true;
									t.Log("Suspected Blank Decree page...");
									var FeedID = getFeedId();
									var goto_null = window.location.protocol+'//apps.facebook.com/kingdomsofcamelot/?s='+UserDomain;
									if (FeedID !='n/a'){
										goto_null = 'https://apps.facebook.com/kingdomsofcamelot/?f='+FeedID+'&t=118&lang=en&f='+FeedID+'&t=118&in='+getFeedUserId()+'&si=118&s='+UserDomain;
										t.Log("Merlins Token collected :)");
										CheckTokenDay();
										t.options.TokenCount = t.options.TokenCount + 1;
										t.SetOptions(t.options);
										window.top.location = goto_null;
									} else {
										var a = document.createElement('div');
										a.innerHTML = '<div align=center><br><b>Token Id not found.</b><br><br><i>Merlins Token could not be collected.<br>(KoC will automatically reload in 10 seconds)</i></div>';
										claim_gift.appendChild(a);	
										goto_null += '&s_expired_mt='+getBadServerId(); // I don't know, let's assume expired token, not sure what these are really used for lol (?)
										setTimeout (function (){window.top.location = goto_null;}, 10000);
									}
								}
							}	
						}	
					}
				}
			}

			if (!domTickTimer) { // is this even used anymore?
				domTickTimer = window.setTimeout(function () {
					domTickTimer = null;
					domTick();
					domTickUpto++;
				}, 1000);
			}
		};
		domTick();
	}
};

// start by reading options...
KOCAutoAcceptGifts.options = KOCAutoAcceptGifts.GetOptions();

var UserDomain = getServerId();
var TokenPop = null;

var ChestImage = 'https://rycamelot1-a.akamaihd.net/fb/e2/src/img/feeds/treasurechest_icon.png';
var TokenImage = 'https://rycamelot1-a.akamaihd.net/fb/e2/src/img/feeds/merlin_magical_token.jpg';
var BuildImage = 'https://rycamelot1-a.akamaihd.net/fb/e2/src/img/feeds/new_city_outskirts.jpg';

if (document.URL.search(/main_src.php/i) == -1) {
	if (KOCAutoAcceptGifts.options.Enabled) {
		KOCAutoAcceptGifts.Listen();
	}	
}
else {
	TokenStartup();
}	
