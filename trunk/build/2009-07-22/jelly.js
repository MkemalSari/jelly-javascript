/*!
Jelly JavaScript, Copyright (c) 2008-2009 Pete Boere.
MIT Style License: http://www.opensource.org/licenses/mit-license.php
this build compiled: 2009-07-22 
*/
(function () {

/**

@location core
@description initialization of Jelly namespace and base set of utility functions

*/

var J = window.JELLY = {},
	win = window,
	doc = win.document,
	docRoot = doc.documentElement,
	docHead = doc.getElementsByTagName('head')[0],
	docBody = doc.body,
	standardEventModel = 'addEventListener' in doc,
	_function = function () {},
	elementData = { ns:'jelly_' + (+new Date) },
	elementUid = function () { 
		var uid = 0;
		return function () { return ++uid; }
    }(),
	isDefined = function (obj) { 
		return typeof obj !== 'undefined'; 
	},
	isString = function (obj) { 
		return typeof obj === 'string'; 
	},
	isNumber = function (obj) { 
		return typeof obj === 'number'; 
	},
	isInteger = function (obj) { 
		return isNumber(obj) ? /^\d+$/.test( (obj+'').trim() ) : false; 
	}, 
	isFloat = function (obj) { 
		return isNumber(obj) ? /^\d+\.\d+$/.test( (obj+'').trim() ) : false; 
	}, 
	isNumeric = function (obj) { 
		return isString(obj) || isNumber(obj) ? /^\d+\.?\d*?$/.test( (obj+'').trim() ) : false; 
	},
	isObject = function (obj, literal) { 
		// 'null' is rejected as a legitimate object: It identifies itself as an object - very strange 
		//  yet is a falsy value and cannot accept expandos 
		var type = typeof obj, test = !!obj && ( type === 'object' || type === 'function' );
		return test && literal ? obj.constructor === Object : test; 
	},
	isFunction = function (obj) { 
		return typeof obj === 'function'; 
	},
	isElement = function (obj) { 
		return !!obj && typeof obj === 'object' && obj.nodeType === 1; 
	},
	isNull = function (obj) { 
		return obj === null; 
	},
	isArray = function (obj) { 
		return {}.toString.call(obj) === '[object Array]'; 
	},	
	inArray = function (obj, arr) { 
		return arr.indexOf(obj) !== -1; 
	},
	toArray = function (obj) {
		var result = [], n = obj.length, i = 0;
		for (i; i < n; i++) { result[i] = obj[i]; }
		return result;
	},
	getElement = function (obj) { 
		return typeof obj === 'string' ? doc.getElementById(obj) : obj; 
	},
	defineClass = function (opts) {
		var _constructor = opts.__init || _function,
			_static = opts.__static || {},
			_extends = opts.__extends,
			_prototype = _constructor.prototype; 
		(isArray(_extends) ? _extends : 
            ( _extends ? [_extends] : [] )).each(function (o) {
			extend( _prototype, o.prototype ); 
		});
		extend( _constructor, _static );
		['__init', '__static', '__extends'].each( function (m) {delete opts[m];} );
		extend( _prototype, opts );
		_prototype.constructor = _constructor;
		return _constructor;
    },
	fireEvent = function () {
		var args = toArray( arguments ),
			event = 'on' + args.shift().toLowerCase().replace( /^\w/, 
				function (m) { return m.toUpperCase(); } 
			),
			func = this[event];
		return func ? func.apply(this, args) : false;
	},
	browser = function () {
		var nav = win.navigator,
			ua = nav.userAgent,
			ActiveX = 'ActiveXObject' in win,
			xhr = 'XMLHttpRequest' in win,
			SecurityPolicy = 'securityPolicy' in nav,
			TaintEnabled = 'taintEnabled' in nav,
			Opera = /opera/i.test(ua),
			Firefox = /firefox/i.test(ua),				
			Webkit = /webkit/i.test(ua),
			ie = ActiveX ? ( 
				'querySelectorAll' in doc ? 8 : (xhr ? 7 : 6) 
			) : 0;
		return {
			ie: ie,
			ie6: ie === 6,
			ie7: ie === 7,
			ie8: ie === 8,
			opera: Opera,
			firefox: Firefox || (SecurityPolicy && !ActiveX && !Opera),
			webkit: Webkit || (!TaintEnabled && !ActiveX && !Opera),
			safariMobile: /safari/i.test(ua) && /mobile/i.test(ua),
			chrome: Webkit && /chrome/i.test(ua)
		};
	}(),
	msie = browser.ie,
	extend = function (a, b, overwrite) {
		for (var key in b) {
			if (typeof a[key] !== 'undefined' && overwrite === false) {
				continue;
			}
			a[key] = b[key];
		}
		return a;
	},
	createLogger = function ( method ) {
		if ( win.console && win.console[method] ) {  	
			return function () {
				win.console[method].apply( win, toArray( arguments ) ); 
			};
		}
		return _function;
	},
	log = createLogger('log'),
	logError = createLogger('error'),
	logWarn = createLogger('warn'),
	logInfo = createLogger('info');
		
extend(J, {
	isDefined: isDefined,
	isString: isString,
	isNumber: isNumber,
	isInteger: isInteger,
	isFloat: isFloat,
	isNumeric: isNumeric,
	isFunction: isFunction,
	isElement: isElement,
	isNull: isNull,
	isObject: isObject,
	isArray: isArray,
	toArray: toArray,
	getElement: getElement,
	defineClass: defineClass,
	fireEvent: fireEvent,
	browser: browser,
	extend: extend,	
	log: log,
	logError: logError,
	logWarn: logWarn,
	logInfo: logInfo
});
	
extend(J, { // -------------------------------------- >>>  Elements 
	addClass: function ( el, cn ) {
		el = getElement(el);
		if ( J.hasClass(el, cn) ) { return; }
		el.className += el.className ? ' ' + cn : cn;
	}, 
	removeClass: function ( el, cn ) {
		el = getElement(el);
		if ( !el.className ) { return; } 
		var patt = new RegExp( '(^|\\s)' + cn + '(\\s|$)' );
		el.className = J.normalize( el.className.replace(patt, ' ') );
	},
	hasClass: function ( el, cn ) {
		return (' ' + ( getElement(el) ).className + ' ').indexOf(cn) !== -1;
	},
	toggleClass: function ( el, cn ) {
		el = getElement(el);
		if ( J.hasClass(el, cn) ) { 
			J.removeClass(el, cn); 
		} 
		else { 
			J.addClass(el, cn); 
		}
	},
	createElement: function (arg, attrs) {
		var el;
		if ( !/[#:\.]/.test(arg) ) {
			el = doc.createElement(arg), key;
			for (key in attrs) {
				switch (key) {
					case 'setHTML': el.innerHTML = attrs[key]; break;
					case 'setText': el.appendChild(doc.createTextNode(attrs[key])); break;
					case 'class': el.className = attrs[key]; break;
					case 'style': el.style.cssText = attrs[key]; break;
					default: el.setAttribute(key, attrs[key]);
				}
			}
		} 
		else {
			var arg = arg.trim(),
				stringKey = 'JELLY_STR_TKN',
				stringTokens = [], 
				m;
			while ( m = /('|")([^\1]*?)\1/.exec(arg) ) {
				arg = arg.replace(m[0], stringKey);
				stringTokens.push(m[2]);
			}
			arg = arg.replace(/\s*(:|,)\s*/g, '$1');
			var parts = arg.split(' '),
				first = parts.shift(),
				leadId = first.indexOf('#') !== -1,
				leadClass = first.indexOf('.') !== -1,
				type = 'div',
				attributes = {},
				branchMapData = null,
				tmp;
			if ( leadId || leadClass ) {
				tmp = leadId ? first.split('#') : first.split('.'); 
				type = tmp.shift() || type;
				attributes[leadId ? 'id':'class'] = tmp.join(' ');
			} 
			else {
				type = first;
			}
			if ( parts[0] ) {
				parts[0].split(',').each(function (tkn) {
					tkn = tkn.split(':');
					var value = tkn[1] === stringKey ? stringTokens.shift() : tkn[1];
					if (tkn[0] === '@') {
						branchMapData = value;
					} 
					else {
						attributes[tkn[0]] = value;
					}
				});
			} 
			el = J.createElement(type.toLowerCase(), attributes);
		}
		return attrs === true ? { elem: el, ref: branchMapData } : el;
	},
	wrapElement: function (el, wrapper) {
		el = getElement(el);
		var pnt = el.parentNode, next = el.nextSibling;
		wrapper.appendChild(el);
		return next ? pnt.insertBefore(wrapper, next) : pnt.appendChild(wrapper);	
	},
	withElement: function (el, callback, scope) {
		el = getElement(el);
		if (el) { return callback.call(scope || el, el); }
		return el;
	},
	replaceElement: function (el, replacement) {
		el = getElement(el);
		return el.parentNode.replaceChild(replacement, el);
	},
	removeElement: function (el) {
		el = getElement(el);
		return el.parentNode.removeChild(el);
	},
	createBranch: function () {
		var args = toArray(arguments),
			res = {},
			context,
			parseToken = function (arg) {
				if ( arg && typeof arg === 'object' ) {
					if ( isElement(arg.root) ) {
						for ( var key in arg ) {
							if ( isArray(arg[key]) ) {
								var nodeName = arg[key][0].nodeName.toLowerCase();
								res[nodeName] = res[nodeName] || [];
								arg[key].each(function (el) { 
									res[nodeName].push(el); 
								});
							} 
							else if (key !== 'root') { res[key] = arg[key]; }
						} 
						return arg.root;
					} 
					else if ( isElement(arg) ) { return arg; }
				} 
				else if ( !isString(arg) ) { return; } 
				var obj = J.createElement(arg, true),
					elem = obj.elem,
					type = elem.nodeName.toLowerCase();
				res[type] = res[type] || [];
				res[type].push(elem);
				if ( obj.ref ) { res[obj.ref] = elem; }
				return elem;
			};
		res.root = context = parseToken( args.shift() );
		args.each(function (feed) {
			if ( !isArray(feed) ) { context = context.appendChild( parseToken( feed ) ); } 
			else { feed.each(function (o) { context.appendChild( parseToken(o) ) }); }
		});
		return res;
	},
	insertElement: function (el, datum) {
		el = getElement(el);
		return ( getElement(datum) || doc.body ).appendChild(el);
	},
	insertTop: function (el, datum) {
		if ( !(el = getElement(el)) || !(datum = getElement(datum)) ) { return false; }
		if ( datum.firstChild ) { return datum.insertBefore(el, datum.firstChild); }
		else { return datum.appendChild(el); }
	},
	insertBefore: function (el, datum) {
		datum = getElement(datum);
		return datum.parentNode.insertBefore( getElement(el), datum );
	},
	insertAfter: function (el, datum) {
		if ( !(el = getElement(el)) || !(datum = getElement(datum)) ) { return false; }
		var next = J.getNext(datum);
		if (next) { return datum.parentNode.insertBefore(el, next); } 
		else { return datum.parentNode.appendChild(el); }
	},
	getFirst: function (el) {
		el = el.firstChild;
		while (el && el.nodeType !== 1) {el = el.nextSibling;}
		return el;
	},
	getLast: function (el) {
		el = el.lastChild;
		while (el && el.nodeType !== 1) {el = el.previousSibling;}
		return el;
	},
	getNext: function (el) {
		el = el.nextSibling;
		while (el && el.nodeType !== 1) {el = el.nextSibling;}
		return el;
	},
	getPrevious: function (el) {
		el = el.previousSibling;
		while (el && el.nodeType !== 1) {el = el.previousSibling;}
		return el;
	},
	getChildren: function (el) {
		var elements = [], el = el.firstChild;
		while (el) {
			if (el.nodeType === 1) {elements[elements.length] = el;}
			el = el.nextSibling;
		}
		return elements;
	},
	getXY: function (el) {
		el = getElement(el);
		var xy = [0, 0];
		do {
			xy[0] += el.offsetLeft;
			xy[1] += el.offsetTop;
		} while (el = el.offsetParent);
		return xy;
	},
	getX: function (el) {
		return J.getXY(el)[0];
	},
	getY: function (el) {
		return J.getXY(el)[1];
	},
	setXY: function (el, X, Y, unit) {
		el = getElement(el);
		unit = unit || 'px';
		el.style.left = X + unit;
		el.style.top = Y + unit;
	},
	getAttribute: function () {
		if ( !isDefined(docRoot.hasAttribute) && msie ) {
			return function ( node, attr ) {
				switch (attr) {
					case 'for': return node.attributes[attr].nodeValue || null;
					case 'class': return node.className || null;
					case 'href': 
					case 'src': return node.getAttribute(attr, 2) || null;						
					case 'style': return node.getAttribute(attr).cssText.toLowerCase() || null;
				}
				return node.getAttribute(attr) || null;
			};
		}
		return function ( node, attr ) { return node.getAttribute(attr); };
	}(),
	getStyle: function ( el, prop, parseInteger ) {
		prop = J.toCamelCase( prop );
		var value;
		if (prop === 'opacity') { 
			if (el.__opacity === undefined) { el.__opacity = 1; }
			return el.__opacity;
		}
		if (el.style[prop]) { value = el.style[prop]; } 
		else if ('getComputedStyle' in win) { value = win.getComputedStyle(el, null)[prop]; } 
		else if ('currentStyle' in el) { value = el.currentStyle[prop]; }
		return parseInteger === true ? parseInt(value, 10) : value;
	},
	setOpacity: function () {
		if ('filters' in docRoot) {
			return function (el, val) {
				if (el.__opacity === undefined) {el.__opacity = 1;}
				el.style.filter = val === 1 ? '' : 'alpha(opacity=' + (val * 100) + ')';
				el.__opacity = val;
			};
		} 
		return function (el, val) {
			if (el.__opacity === undefined) {el.__opacity = 1;}
			el.style.opacity = el.__opacity = val;
		};
	}(),
	storeData: function (el, name, value) {
		var cache = elementData, elementKey = cache.ns;
		if ( !(el = getElement(el)) ) { return; }
		if ( !(elementKey in el) ) { 
			el[elementKey] = elementUid(); 
			cache[el[elementKey]] = {};
		}
		cache[el[elementKey]][name] = value;
	},
	retrieveData: function (el, name) {
		var cache = elementData, elementKey = cache.ns;
		if ( !(el = getElement(el)) ) { return; }
		if ( elementKey in el && el[elementKey] in cache ) {
			return cache[el[elementKey]][name];
		}
		return null;
	},
	removeData: function (el, name) {
		var cache = elementData, elementKey = cache.ns;
		if ( !(el = getElement(el)) ) { return; }
		if ( elementKey in el && el[elementKey] in cache ) {  
			delete cache[el[elementKey]][name];
		}
	}
});

extend(J, { // --------------------------------------- >>>  Events 
	addEvent: function (obj, type, fn) {
		obj = J.getElement(obj);
		var mouseEnter = type === 'mouseenter',
			mouseLeave = type === 'mouseleave',
			wrapper, 
			handle;
		if ( !standardEventModel ) {
			wrapper = function (e) {
				e = J.fixEvent(e);
				fn.call(obj, e);
			};
		}
		if ( mouseEnter || mouseLeave ) {
			wrapper = function (e) {
				e = J.fixEvent(e);
				if (!J.mouseEnterLeave.call(obj, e)) {return;}
				fn.call(obj, e);
			};
			type = mouseEnter ? 'mouseover' : 'mouseout';
		}
		handle = [obj, type, wrapper || fn];
		J.eventLog.push(handle);
		if (standardEventModel) { obj.addEventListener(type, wrapper || fn, false); } 
		else { obj.attachEvent('on' + type, wrapper); }
		return handle;
	},
	removeEvent: function () {
		if (standardEventModel) {
			return function (handle) {
				if (handle) { handle[0].removeEventListener(handle[1], handle[2], false); }
			};
		} 
		return function (handle) {
			if (handle) { handle[0].detachEvent('on' + handle[1], handle[2]); }
		};
	}(),
	purgeEventLog: function () {
		if (J.eventLog.length > 1) {
			var arr = J.eventLog, i, c;
			for (i = 0; arr[i]; i++) {
				c = arr[i];					
				if (c[0] === win && c[1] === 'unload') {continue;}
				J.removeEvent(c);
			}
		}
	}, 
	fixEvent: function () {
		if (standardEventModel) {
			return function (e) { return e; };
		}
		return function (e) {
			e = window.event;
			e.target = e.srcElement;
			e.relatedTarget = function () {
				switch (e.type) {
					case 'mouseover': return e.fromElement;
					case 'mouseout': return e.toElement;
				}
			}();
			e.stopPropagation = function () {e.cancelBubble = true;};
			e.preventDefault = function () {e.returnValue = false;};
			e.pageX = e.clientX + docRoot.scrollLeft;
			e.pageY = e.clientY + docRoot.scrollTop;
			return e;
		};		
	}(),
	mouseEnterLeave: function (e) { 
		var related, i;
		if (e.relatedTarget) {
			related = e.relatedTarget;
			if (related.nodeType !== 1 || related === this) {return false;}
			var children = this.getElementsByTagName('*');
			for (i=0; children[i]; i++) {if (related === children[i]) {return false;}}
		}
		return true;
	},
	stopEvent: function (e) {
		e = J.fixEvent(e);
		e.stopPropagation();
		e.preventDefault();
		return e;
	},
	eventLog: [] 
});
	
extend(J, { // --------------------------------------- >>>  String related 
	normalize: function ( str ) {
		return str.replace(/\s{2,}/g, ' ').trim();
	},
	toCamelCase: function ( str ) {
		return str.replace(/-\D/gi, function (m) {
			return m.charAt(m.length - 1).toUpperCase();
		});
	}, 
	toCssCase: function ( str ) {
		return str.replace(/([A-Z])/g, '-$1').toLowerCase();
	}, 
	rgbToHex: function ( str ) {
		var rgb = str.match(/[\d]{1,3}/g), hex = [], i;
		for (i = 0; i < 3; i++) {
			var bit = (rgb[i]-0).toString(16);
			hex.push(bit.length === 1 ? '0'+bit : bit);
		}
		return '#' + hex.join('');
	},
	hexToRgb: function ( str, array ) {
		var hex = str.match(/^#([\w]{1,2})([\w]{1,2})([\w]{1,2})$/), rgb = [], i;
		for (i = 1; i < hex.length; i++) {
			if (hex[i].length === 1) { hex[i] += hex[i]; }
			rgb.push(parseInt(hex[i], 16));
		}
		return array ? rgb : 'rgb(' + rgb.join(',') + ')';
	},
	parseColour: function ( str, mode ) {
		var rgbToHex = J.rgbToHex,
			hexToRgb = J.hexToRgb,
			hex = /^#/.test(str), 
			tempArray = [], temp;
		switch (mode) {
			case 'hex':	return hex ? str : rgbToHex(str);
			case 'rgb': return hex ? hexToRgb(str) : str;
			case 'rgb-array': 
				if (hex) { return hexToRgb(str, true); } 
				else {
					temp = str.replace(/rgb| |\(|\)/g, '').split(',');
					temp.each(function (item) {tempArray.push(parseInt(item, 10));});
					return tempArray;
				}
		}
	},
	stripTags: function ( str, allow ) {
		if (!allow) { return str.replace(/<[^>]*>/g, ''); } 
		allow = allow.replace(/\s+/g, '').split(',').map(function (s) {
			return s +' |'+ s +'>|/'+ s +'>';   
		}).join('|');
		return str.replace(new RegExp('<(?!'+ allow +')[^>]+>', 'g'), '');
	},
	bindData: function ( str, data ) {
        var m;
        while ( m = /%\{\s*([^\}\s]+)\s*\}/.exec(str) ) {
            str = str.replace( m[0], data[m[1]] || '??' );
        }
        return str;
	},
	evalScripts: function ( str ) {
		var c = J.createElement('div', {setHTML: str}), res = [];
		toArray( c.getElementsByTagName('script') ).each( function (el) {
			res.push( win['eval'](el.innerHTML) );
		});
		return res;
	}
});

extend(J, { // --------------------------------------- >>>  Cookies
	getCookie: function (name) {
		var result = new RegExp(name + '=([^; ]+)').exec(doc.cookie);
		return result ? unescape(result[1]) : null;
	},
	setCookie: function (name, value, expires, path, domain, secure) {
		if ( expires ) {
			expires = new Date(new Date().getTime()+((1000*60*60*24)*expires)).toGMTString();
		}
		doc.cookie = name + '=' + escape(value) +
			(expires ? ';expires=' + expires : '') + 
			(path ? ';path=' + path : '') +
			(domain ? ';domain=' + domain : '') +	
			(secure ? ';secure' : '');
	},
	removeCookie: function (name, path, domain) {
		if ( J.getCookie(name) ) {
			doc.cookie = name + '=' +
				(path ? ';path=' + path : '') +
				(domain ? ';domain=' + domain : '') +	
				(';expires=' + new Date(0));
		}
	}
});

extend(J, { // --------------------------------------- >>>  Flash 
	getFlashVersion: function () {
		var version = {major: null, build: null},
			description,
			versionString,
			aXflash;
		if (navigator.plugins && typeof navigator.plugins['Shockwave Flash'] === 'object') {
			description = navigator.plugins['Shockwave Flash'].description;
			if (description !== null) {
				versionString = description.replace(/^[^\d]+/, '');
				version.major = parseInt(versionString.replace(/^(.*)\..*$/, '$1'), 10);
				version.build = parseInt(versionString.replace(/^.*r(.*)$/, '$1'), 10);
			}
		} 
		else if (msie) {
			try {
				aXflash = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
				description = aXflash.GetVariable('$version');
				if (description !== null) {
					versionString = description.replace(/^\S+\s+(.*)$/, '$1').split(',');
					version.major = parseInt(versionString[0], 10);
					version.build = parseInt(versionString[2], 10);
				}
			} catch(ex) {}
		}
		return version;
	},
	createFlashObject: function ( path, width, height, fallback, params, vars, attributes ) {
		var params = params || {};
			vars = vars || {},
			attrs = attributes || {},
			fallback = fallback || 
				'<a href="http://www.adobe.com/go/getflashplayer">' + 
				'<img src="http://www.adobe.com/images/shared/download_buttons/get_flash_player.gif" ' + 
				'alt="You need the latest Adobe Flash Player to view this content" /></a>',
			data = [],
			output = '<object';
		if (msie) {
			attrs.classid = 'clsid:D27CDB6E-AE6D-11cf-96B8-444553540000';
			params.movie = path;
		} 
		else {
			attrs.data = path;
			attrs.type = 'application/x-shockwave-flash';
		}
		attrs.width = width;
		attrs.height = height;
		for (var key in attrs) { 
			output += ' ' + i + '="' + attr[i] + '"'; 
		}
		output += '>\n';
		for (var i in vars) { 
			data.push(i + '=' + encodeURIComponent(vars[i])); 
		}
		if (data.length > 0) { 
			params.flashvars = data.join('&'); 
		} 
		for (var i in params) { 
			output += '\t<param name="' + i + '" value="' + params[i] + '" />\n'; 
		}
		return output + fallback + '\n</object>';
	},
	embedFlashObject: function ( el, path, width, height, params, vars, attributes ) {
		el = getElement(el);
		el.innerHTML = createFlashObject( path, width, height, el.innerHTML, params || {}, vars || {}, attributes || {} );
	}
});

extend(J, { // --------------------------------------- >>>  Misc 
	getViewport: function () {
		if (isDefined(win.innerWidth)) {
			return function () {return [win.innerWidth, win.innerHeight];};
		} 
		if (isDefined(docRoot) && isDefined(docRoot.clientWidth) && docRoot.clientWidth !== 0) { 
			return function () {return [docRoot.clientWidth, docRoot.clientHeight];};
		}
		return function () {
			return [docBody.clientWidth || 0, docBody.clientHeight || 0];
		};
	}(),
	getWindowScroll: function () {
		if (isDefined(win.pageYOffset)) {
			return function () {return [win.pageXOffset, win.pageYOffset];};
		} 
		return function () {
			if (isDefined(docRoot.scrollTop) && 
				(docRoot.scrollTop > 0 || docRoot.scrollLeft > 0)) {
				return [docRoot.scrollLeft, docRoot.scrollTop];
			}
			return [docBody.scrollLeft, docBody.scrollTop];
		};
	}(),
	parseQuery: function (el) {
		el = el || win.location;
		var data = {};
		if (/\?/.test(el.href)) {
			var queries = el.href.split('?')[1].split('&'),
				i = queries.length-1,
				parts;
			do {
				parts = queries[i].split('=');
				data[parts[0]] = decodeURIComponent( parts[1].replace(/\+/g, '%20') );
			} while (i--);
		}
		return data;
	},
	buildQuery: function () {
		var append = function ( name, value ) {
				if ( !name ) { return; } 
				if ( callbackFilter ) { value = callbackFilter.call(value, value); } 
				data.push( name + '=' + encodeURIComponent(value).replace(/%20/g, '+') );
			}, 
			parseElement = function ( el ) {
				if ( !isElement(el) || !/^(input|textarea|select)$/i.test(el.nodeName) ) {
					return; 
				}
				var type = el.type.toLowerCase(),
					name = el.name, 
					value = el.value;
				switch ( type ) {
					case 'checkbox': 
						if ( el.checked ) { append( name, value || 'on' ); }
						break;
					case 'radio': 
						if ( el.checked ) { append( name, value ); }
						break;
					default: 
						append( name, value );
				}
			}
			args = toArray( arguments ),
			callbackFilter = isFunction( args[args.length-1] ) ? args.pop() : null;
			data = [];
			
		args.each(function ( arg ) {
			if ( isObject(arg) && isInteger(arg.length) ) {
				( isArray(arg) ? arg : toArray(arg) ).each( parseElement );
			}
			else if ( isObject(arg, true) ) {
				for ( var key in arg ) { append( key, arg[key] ); }
			}
			else if ( isString(arg) || isElement(arg) ) {
				var el = getElement(arg);
				if (el) {
					parseElement(el);
					J.Q( el, 'textarea, input, select' ).each( parseElement );
				}
				else {
					data.push( arg );	
				}
			}
		});
		return data.join('&');
	},
	loadModule: function (namespace, path, callback) {
		namespace = namespace.split('.');
		if (namespace[0] === 'window') { namespace.shift(); } 
		var script = doc.createElement('script'),
			timeout = 1000,
			polltotal = 0,
			polltime = 15,
			poller = function () {
				var _namespace = window, 
					ready = true;
				for (var i = 0; i < namespace.length; i++) {
					_namespace = _namespace[namespace[i]];
					if ( !isDefined(_namespace) ) {
						ready = false;
						break;
					}
				} 
				if ( ready ) { 
					callback.call(_namespace, _namespace); 
				} 
				else {
					if ( polltotal >= timeout ) { 
						callback.call(this, false); 
						return;
					}
					polltotal += polltime;
					setTimeout(poller, polltime);
				}
			};
		script.src = path;
		docHead.appendChild(script);
		poller();
	},
	loadModules: function () {
		var args = toArray(arguments), 
			callback = args.pop(),
			module,
			loader = function (result) {
				if ( isDefined(result) ) {
					if ( module = args.shift() ) {
						J.loadModule( module[0], module[1], loader )
					} 
					else { callback(true); }
				}
				else { callback(false); }
			};
		loader(true);
	},
	unpack: function () {
		var str = 'var J=JELLY';
		for ( var i in J ) { 
			str += (',' + i + '=J.' + i); 
		}
		return str + ';';
	}
});

/**

Native extensions

@location core
@description  

*/

extend(Array.prototype, {
	forEach: function ( fn, obj ) {
		for ( var i = 0, n = this.length; i < n; i++ ) { 
			fn.call( obj, this[i], i, this ); 
		}
	},
	indexOf: function (obj, from) {
		from = isDefined(from) ? 
			( from < 0 ? Math.max( 0, this.length + from ) : from ) : 0;
		for ( var i = from, n = this.length; i < n; i++ ) { 
			if ( this[i] === obj ) { 
				return i; 
			} 
		}
		return -1;
	},
	filter: function (fn, obj) {
		for ( var i = 0, n = this.length, arr = []; i < n; i++ ) { 
			if ( fn.call( obj, this[i], i, this ) ) { 
				arr.push( this[i] ); 
			} 
		}
		return arr;
	},
	map: function (fn, obj) {
		for ( var i = 0, n = this.length, arr = []; i < n; i++ ) { 
			arr.push( fn.call( obj, this[i], i, this ) ); 
		}
		return arr;
	},
	some: function (fn, obj) {
		for ( var i = 0, n = this.length; i < n; i++ ) { 
			if ( fn.call( obj, this[i], i, this ) ) { 
				return true; 
			} 
		}
		return false;
	},
	every: function (fn, obj) {
		for ( var i = 0, n = this.length; i < n; i++ ) { 
			if ( !fn.call( obj, this[i], i, this ) ) { 
				return false; 
			} 
		}
		return true;
	}
}, false);

Array.prototype.each = Array.prototype.forEach;

extend(String.prototype, {
	trim: function () {
		return this.replace( /^\s\s*/, '' ).replace( /\s\s*$/, '' );
	}
}, false);

extend(Function.prototype, {
	bind: function () {
		if ( arguments.length < 2 && !isDefined( arguments[0] ) ) { 
			return this; 
		}
		var args = toArray( arguments ),
			scope = args.shift(),
			fn = this; 
		return function () {
			var arr = toArray( args );
			for ( var i = 0; arguments.length > i; i++ ) { 
				arr.push( arguments[i] ); 
			}
			return fn.apply( scope, arr );
		};
	}
}, false);

Object.keys = isFunction( Object.keys ) ? Object.keys : 
	function (obj) {
		var res = [], key;
		for ( key in obj ) {
			res.push( key );
		}
		return res;
	};

/**

Page init

@location core
@description  

*/

if ( browser.ie6 ) { 
	try { 
		doc.execCommand( 'BackgroundImageCache', false, true );
	} catch(ex) {}; 
}
J.addEvent(win, 'unload', J.purgeEventLog);

var classname = ['unknown'], key;
for ( key in browser ) {
	if ( browser[key] ) {
		if ( classname[0] === 'unknown' ) { 
			classname = [key]; 
		} 
		else {
			classname.push(key);
		}
	}
}
J.addClass( docRoot, 'js ' + classname.join(' ') );

/**

Selector Engine

@location core
@description   

*/

J._Q = {
	'A': function (a, b) {
		try {return toArray(b ? a.querySelectorAll(b) : 
			document.querySelectorAll(a));} catch (ex) {}
	},
	'B': function (a, b) {	
		var toArray = J.toArray, 
			getNext = J.getNext,
			getPrevious = J.getPrevious,
			msie = J.browser.ie,
			win = window,
			doc = win.document,
			loc = win.location,
			rootElement = doc.documentElement,
			unMark = function (collection, mark) {
				for ( var n = collection.length, i = 0; i < n; i++ ) {
					collection[i][mark] = undefined;
				}
			},
			contains = function () {
			    if ( rootElement.contains )  { 
			        return function ( needle, haystack ) {
						return haystack.contains(needle);
					};
			    } 
				return function ( needle, haystack ) {
					return !!( haystack.compareDocumentPosition(needle) & 16 );
				};
			}(),
			mergeId = function (tkn) {
				var tag = tkn.val[0], id = tkn.val[1];
				if (tkn.mode === 'filter') { 
					var tags = collection, n = collection.length, i = 0;
					for (i; i < n; i++) {
						if (tag) {
							if ((tags[i].tagName.toLowerCase() === tag && tags[i].id === id) !== tkn.not) {
								tmp[tmp.length] = tags[i]; 
							}
						} 
						else if ((tags[i].id === id) !== tkn.not) {
							tmp[tmp.length] = tags[i]; 
						}
						if (!tkn.not && tmp[0]) {return;}
					}
				} 
				else {
					if (!tag) {
						tmp[0] = doc.getElementById(id);
					} 
					else {
						var elem = doc.getElementById(id);
						if (elem && elem.tagName.toLowerCase() === tag) {
							tmp[0] = elem;	
						}
					}
					if (!firstRun && tmp[0]) {
						var tags = collection, n = collection.length, flag = false, i = 0;
						for (i; i < n; i++) {
							if (contains(tmp[0], tags[i])) {
								flag = true;
								break;
							}
						}
						if (!flag) {tmp[0] = null;}
					} 
				}
			}, 
			mergeTags = function (tkn) {
				var tags, n, test, i = 0, extra = (tkn.val === '*' && msie);
				if (firstRun) {
					tags = doc.getElementsByTagName(tkn.val); n = tags.length;	
					for (i; i < n; i++) {
						if (extra) {if (tags[i].nodeType === 1) {tmp[tmp.length] = tags[i];}}
						else {tmp[tmp.length] = tags[i];}
					}
				} 
				else if (tkn.not || tkn.mode === 'filter') {
					tags = collection; n = tags.length; test = tkn.val.toUpperCase();
					for (i; i < n; i++) {
						if ((tags[i].nodeName.toUpperCase() === test) !== tkn.not) {
							tmp[tmp.length] = tags[i];
						}
					}
				} 
				else {
					tags = collection; 
					n = tags.length;
					for (i; i < n; i++) {
						var tags2 = tags[i].getElementsByTagName(tkn.val), n2 = tags2.length, j;
						for (j = 0; j < n2; j++) {
							if (extra) {if (tags2[j].nodeType === 1) {tmp[tmp.length] = tags2[j];}}
							else {tmp[tmp.length] = tags2[j];}
						}
					}
				}
			},
			mergeClass = function (tkn) {
				var tags = collection, val = tkn.val, not = tkn.not, n = tags.length, i = 0;
				if (tkn.mode === 'fetch') {
					if (firstRun) {
						tmp = toArray(doc.getElementsByClassName(val));
					} 
					else {
						for (i; i < n; i++) {
							var tags2 = tags[i].getElementsByClassName(val), n2 = tags2.length, j = 0;
							for (j; j < n2; j++) {
								tmp[tmp.length] = tags2[j];
							}
						}
					}
				} 
				else {
					var patt = new RegExp('(^|\\s)' + val + '(\\s|$)'), cn;
					for (i; i < n; i++) {
						cn = tags[i].className;
						if (!cn) {
							if (not) {tmp[tmp.length] = tags[i];}
							continue;
						} 
						if (patt.test(cn) !== not) {tmp[tmp.length] = tags[i];} 
					}
				}
			},
			attributeTests = {
				'=': function (attr, val) {return attr === val;}, 
				'^=': function (attr, val) {return attr.indexOf(val) === 0;}, 
				'$=': function (attr, val) {return attr.substr(attr.length - val.length) === val;}, 
				'*=': function (attr, val) {return attr.indexOf(val) !== -1;}, 
				'|=': function (attr, val) {return attr.indexOf(val) === 0;}, 
				'~=': function (attr, val) {return (' ' + attr + ' ').indexOf(' ' + val + ' ') !== -1;} 
			},
			mergeAttribute = function (tkn) {
				var tags = collection, n = tags.length, getAttribute = J.getAttribute, attrValue = tkn.val, i = 0;
				if (/=/.test(attrValue)) {
					var parts = /([\w-]+)([^=]?=)(.+)/.exec(attrValue), attr, mode = attributeTests,
						val = tkn.spValue !== undefined ? tkn.spValue : parts[3];
					for (i; i < n; i++) {
						attr = getAttribute(tags[i], parts[1]);
						if ((attr !== null && mode[parts[2]](attr, val)) !== tkn.not) {
							tmp[tmp.length] = tags[i];
						}
					}
				} 
				else {
					for (i; i < n; i++) {
						if ((getAttribute(tags[i], attrValue) !== null) !== tkn.not) {
							tmp[tmp.length] = tags[i];                    
						}
					}
				}
			},
			mergeDirectSibling = function (tkn) {
				var tags = collection, n = tags.length, next, i = 0;
				for (i; i < n; i++) {
					next = getNext(tags[i]);
					if (next) {tmp[tmp.length] = next;}
				}
			},
			mergeAdjacentSibling = function (tkn) {
				var tags = collection, n = tags.length, store = [], sibs = [], i = 0; 
				for (i; i < n; i++) {
					var parental = tags[i].parentNode;
					parental.__jelly = true;
					store[store.length] = {
						parent: parental, 
						child: tags[i]
					};
				}	
				for (i = 0; i < store.length; i++) {
					if (store[i].parent.__jelly !== undefined) {
						store[i].parent.__jelly = undefined;
						sibs[sibs.length] = store[i].child;
					}
				}
				for (i = 0; i < sibs.length; i++) {
					var next = sibs[i].nextSibling;
					while (next) {
						if (next.nodeType === 1) {tmp[tmp.length] = next;}
						next = next.nextSibling;
					}
				}
			},
			filterChildren = function () {
				var tags = collection, n = tags.length, n2 = tmp.length, result = [], i = 0; 
				for (i; i < n2; i++) {
					var parentElem = tmp[i].parentNode; 
					for (var j = 0; j < n; j++) {  
						if (tags[j] === parentElem) {
							result[result.length] = tmp[i];
							break;
						}
					}
				}
				tmp = result;
			},
			mergePseudo = function (tkn) {
				var tags = collection, n = tags.length, i = 0;
				if (/^(nth-|first-of|last-of)/.test(tkn.kind)) {
					tmp = pseudoTests[tkn.kind](tags, tkn); 
				} 
				else if (tkn.kind === 'root' && !tkn.not) {
					tmp[0] = rootElement;
				} 
				else if (tkn.kind === 'target' && !tkn.not) {
					var hash = loc.href.split('#')[1] || null;
					tmp[0] = doc.getElementById(hash) || doc.getElementsByName(hash)[0];
				} 
				else {
					for (i; i < n; i++) {
						if (pseudoTests[tkn.kind](tags[i], tkn) !== tkn.not) {
							tmp[tmp.length] = tags[i];
						}
					}
				}
			},
			parseNthExpr = function (expr) {
				var obj = {};
				obj.direction = /^\-/.test(expr) ? 'neg' : 'pos';
				if (/^n$/.test(expr)) { 
					obj.mode = 'all';
					return obj;
				} 
				else if (/^\d+$/.test(expr)) {
					obj.mode = 'child';
					obj.val = parseInt(expr, 10);
					return obj;
				} 
				obj.mode = 'an+b';
				if (/^(even|2n|2n\+2)$/.test(expr)) {obj.oddEven = 0;} 
				else if (/^(odd|2n\+1)$/.test(expr)) {obj.oddEven = 1;}
				var pts = expr.split('n');
				obj.start = pts[1] ? parseInt(pts[1], 10) : 1;
				obj.jump = pts[0] && !/^\-$/.test(pts[0]) ? parseInt(pts[0].replace(/^\-/, ''), 10) : 1;		
				return obj;
			},
			nthChildFilter = function (collection, expr, oftype, last, not) {
				expr = parseNthExpr(expr);
				if ( expr.mode === 'all' ) { return collection; }				
				var	result = [], 
					parentCache = [], 
					n = collection.length, 
					i = 0,
					nodeName = collection[0].nodeName,
					testType = oftype ? 
						function (el) {return el.nodeType === 1 && el.nodeName === nodeName;} : 
						function (el) {return el.nodeType === 1;},		
					append = function (cond) {if (cond) {result[result.length] = collection[i];}};
				for ( i; i < n; i++ ) {
					var pnt = collection[i].parentNode, c = 1;
					if (!pnt._indexedChilden) {
						parentCache[parentCache.length] = pnt;
						if (!last) {
							for (var el = pnt.firstChild; el; el = el.nextSibling) {
								if (testType(el)) {el.nodeIndex = c++;}
							}
						} 
						else {
							for (var el = pnt.lastChild; el; el = el.previousSibling) {
								if (testType(el)) {el.nodeIndex = c++;}
							}
						}
						pnt._indexedChilden = true;
					}
					if (expr.mode === 'child') { 
						append(((collection[i].nodeIndex === expr.val) !== not));
					} 
					else if (expr.oddEven !== undefined) { 
						append((collection[i].nodeIndex % 2 === expr.oddEven) !== not);
					} 
					else {
						if (expr.direction === 'pos') {
							if (collection[i].nodeIndex < expr.start) {
								if (not) {
									append(true);
								} 
								else { continue; }
							} 
							else { 
								append(((collection[i].nodeIndex - expr.start) % expr.jump === 0) !== not); }
						} 
						else {
							if (collection[i].nodeIndex > expr.start) {
								if (not) {append(true);} 
								else {continue;}
							} 
							else { append(((expr.start - collection[i].nodeIndex) % expr.jump === 0) !== not); }
						}
					}
				}
				unMark(parentCache, '_indexedChilden');
				return expr.direction === 'neg' ? result.reverse() : result;
			},
			pseudoTests = {
				'nth-child': function (tags, tkn) {
					return nthChildFilter(tags, tkn.val, false, false, tkn.not);
				},
				'nth-of-type': function (tags, tkn) {
					return nthChildFilter(tags, tkn.val, true, false, tkn.not);
				},
				'nth-last-child': function (tags, tkn) {
					return nthChildFilter(tags, tkn.val, false, true, tkn.not);
				},
				'nth-last-of-type': function (tags, tkn) {
					return nthChildFilter(tags, tkn.val, true, true, tkn.not);
				},
				'first-of-type': function (tags, tkn) {
					return nthChildFilter(tags, '1', true, false, tkn.not);
				},
				'last-of-type': function (tags, tkn) {
					return nthChildFilter(tags, '1', true, true, tkn.not);
				},
				'only-child': function (el) {
					return !getNext(el) && !getPrevious(el);
				},
				'only-of-type': function (el) {
					var tags = el.parentNode.getElementsByTagName(el.nodeName);
					if ( tags.length === 1 && tags[0].parentNode === el.parentNode ) {
						return true;
					} 
					else {
						var bool = true, n = tags.length, i = 0, c = 0;
						for ( i; i < n; i++ ) {
							if ( el.parentNode === tags[i].parentNode ) {
								c++; 
								if ( c > 1 ) {
									return false;
								}
							}
						}
						return true;
					}
				},
				'first-child': function (el) {
					return !getPrevious(el);
				},
				'last-child': function (el) {
					return !getNext(el);
				}, 
				'checked': function (el) {
					return el.checked;
				},
				'enabled': function (el) {
					return !el.disabled;
				},
				'disabled': function (el) {
					return el.disabled;
				},
				'empty': function (el) {
					return !el.firstChild;
				},
				'lang': function (el, tkn) {
					return el.getAttribute('lang') === tkn.val;
				},
				'root': function (el) {
					return el === rootElement;
				},
				'target': function (el) {
					var hash = loc.href.split('#')[1] || null;
					return el.id === hash || el.name === hash;
				}
			},
			filterUnique = function (collection) {
				var c, n = collection.length, uniques = [];
				while (n) {
					c = collection[--n];
					if (!c.__jelly) {
						c.__jelly = true;
						uniques[uniques.length] = c;
					}
				}
				n = uniques.length;
				while (n) {uniques[--n].__jelly = undefined;}
				return uniques.reverse();
			},
			
			parseTokenComponent = function (part, fetchOrFilter) {
				var obj = {mode: fetchOrFilter ? 'fetch' : 'filter', not: false};
				if (/^(\w+)?#[^\s]+$/.test(part)) {
					obj.type = 'ID'; obj.val = part.split('#');
				} 
				else if (/^(\w+|\*)$/.test(part)) {
					obj.type = 'TAG'; obj.val = part;
				} 
				else if (/^\.[^\s]+$/.test(part)) { 
					obj.type = 'CLASS';	obj.val = part.replace(/^\./, '');
				} 
				else if (/^\[[^\s]+$/.test(part)) { 
					obj.type = 'ATTR';	obj.val = part.replace(/^\[|\]$/g, '');	
				} 
				else if (/^\+|>|~$/.test(part)) { 
					obj.type = 'COMBI'; obj.val = part;			
				} 
				else if (/^\:not[\s\S]+$/.test(part)) {
					var tmp = part.replace(/^\:not\(|\)$/g, '');
					obj = parseTokenComponent(tmp);
					obj.not = true;
				} 
				else if (/^:[^\s]+$/.test(part)) { 
					var tmp = part.replace(/^\:|\)$/g, '').split('(');
					obj.type = 'PSEUDO'; 
					obj.kind = tmp[0];
					obj.val = tmp[1];
				} 
				return obj;
			},
			
			parseSelector = function (feed) {
				// Seperate out the combinators + > ~, then split
				var result = [],
					parts = J.normalize( feed.replace(/(>|~(?!=)|\+(?!\d))/g, ' $1 ') ).split(' '),
				    universal = {mode:'fetch', type:'TAG', val:'*'},
				    getByClass = 'getElementsByClassName' in doc,
				    sibling = false;
					
				for ( var i = 0; i < parts.length; i++ ) { 
					var tmp = parts[i].replace(/([^\(\#\.\[])(:)/g, '$1 $2').
						replace(/([^\(])(\[|\.)/g, '$1 $2').
						replace(/\:not\(\s*/g, ':not(').trim().split(' ');	
					for (var j = 0; j < tmp.length; j++) {
						var obj = parseTokenComponent(tmp[j], !j);
						if (sibling) {
							obj.mode = 'filter';
						} 
						else if ( j === 0 && 
							( /PSEUDO|ATTR/.test(obj.type) || 
							  (obj.type === 'CLASS' && !getByClass) || 
							  obj.not ) ) {
							result[result.length] = universal;
							obj.mode = 'filter';
						}
						if (tmp[j].indexOf(uniqueKey) !== -1) {
							obj[obj.type === 'ATTR' ? 'spValue' : 'val'] = strings.shift();
						}
						result[result.length] = obj;
						sibling = /^(~|\+)$/.test(obj.val);
					}
				}
				result.postFilter = !(parts.length === 1 || parts.length === 3 && /^[\+~]$/.test(parts[1]));
				return result;
			};
		
		/* ---------------------------------------------------------------------------------------- */
		var contextMode = !!b,
			selector = contextMode ? b : a,
			quoteMarkTest = /('|")([^\1]*?)\1/,
			_Q = J._Q, 
			uniqueKey = _Q.uniqueKey, 
			firstRun = _Q.firstRun, 
			strings = _Q.strings, 
			m;

		if ( firstRun ) {
			while ( selector.indexOf(uniqueKey) !== -1 ) {
				uniqueKey += uniqueKey;
			}
			m = quoteMarkTest.exec(selector);
			while (m) {
				strings[strings.length] = m[2];
				selector = selector.split(m[0]);
				selector = [selector[0], uniqueKey, selector[1]].join('');   
				m = quoteMarkTest.exec(selector);
			}
		}
		
		// Split and recurse for comma chained selectors
		if ( /,/.test(selector) ) {
			var combo = [],	parts = selector.split(','), part;
			firstRun = false;
			while ( part = parts.shift() ) {
				combo = combo.concat( contextMode ? J.Q(a, part) : J.Q(part) );
			}
			firstRun = true;
			return filterUnique(combo);
		}

		var tokens = parseSelector(selector),
			collection = contextMode ? [a] : [],	
			firstRun = true && !b,
			children = null, 
			k = 0;
		
		for (k; k < tokens.length; k++) {
			var tmp = [], tkn = tokens[k];						
			switch (tkn.type) {
				case 'ID': mergeId(tkn); break;
				case 'TAG': mergeTags(tkn); break;
				case 'CLASS': mergeClass(tkn); break;
				case 'ATTR': mergeAttribute(tkn); break;
				case 'PSEUDO': mergePseudo(tkn); break
				case 'COMBI': 
					if (tkn.val === '+') {mergeDirectSibling(tkn);} 
					else if (tkn.val === '~') {mergeAdjacentSibling(tkn);}
			}
			if (children) { filterChildren(); }
			if (tkn.val === '>') {
				children = true;
				continue;
			}
			if (!tmp[0]) {return [];}
			children = null;
			collection = tmp;
			firstRun = false;	
		}
		if ( tokens.postFilter ) { return filterUnique(collection); }
		return collection;
	},
	strings: [],
	uniqueKey: '@@',
	firstRun: true
};

J.Q = function () {
	if ('querySelectorAll' in doc) {
		if (!browser.ie) { 
			return J._Q.A; 
		} 
		return function (a, b) {
			if (/\:(nth|las|onl|not|tar|roo|emp|ena|dis|che)/.test(b || a)) { 
				return J._Q.B(a, b); 
			}
			return J._Q.A(a, b);
		}
	} 
	return J._Q.B;
}();

/**

Request

@location core
@description   

*/

(function () {

var name = 'Request',
	
	Class = J[name] = defineClass({
		
		__init: function (obj) {
			extend(this, obj);
		},
		
		__static: {
			timeout: 15000	
		},
		
		fireEvent: fireEvent,
		noCache: true,
		async: true,
		cleanUp: true,
		feedback: { start: _function, stop: _function },
		requestHeaders: {},
		
		configure: function (obj) {
			extend(this, obj || {});
			return this;
		},
		
		send: function ( method, request, callback ) {
			var self = this,
			file = request,
			data = null,
			method = method.toUpperCase(),
			xhr = self.xhr ? self.xhr : self.getXHR();
			if ( self.inProgress || !xhr ) {
				return false;
			}
			if ( method === 'POST' ) {
				var tmp = request.split('?');
				file = tmp[0];
				data = tmp[1];
				self.requestHeaders['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
				self.requestHeaders['Content-length'] = data.length;
			}
			if ( method === 'GET' && self.noCache ) {
				self.requestHeaders['If-Modifed-Since'] = 'Sat, 1 Jan 2000 00:00:00 GMT';
			}
			xhr.open( method, file, self.async );
			xhr.onreadystatechange = function () {
				if ( xhr.readyState === 4 ) {
					self.fireEvent('complete', xhr);
					clearTimeout(self.timer);
					self.feedback.stop();
					var status = xhr.status,
						statusOk = ( status >= 200 && status < 300 ) || status === 304 ||
						( status === undefined && browser.webkit );
					if ( statusOk ) {
						self.fireEvent('success', xhr);
						if ( callback ) {
							callback.call(self, xhr);
						}
					}
					else {
						self.fireEvent('fail', xhr);
					}
					if ( self.cleanUp ) {
						self.xhr = null;
					}
					self.inProgress = false;
				}
			};
			for (var key in self.requestHeaders) {
				xhr.setRequestHeader(key, self.requestHeaders[key]);
			}
			xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
			self.feedback.start();
			self.timer = setTimeout(function () {
				xhr.abort();
				self.fireEvent('timeout', xhr);               
				self.inProgress = false;
			}, self.timeout || Class.timeout );
			
			xhr.send(data);
			self.fireEvent('request', xhr);
			self.inProgress = true;
			return true;
		},
		
		post: function ( file, data, callback ) {
			return this.send( 'post', file + '?' + (data || 'empty'), callback );
		},
		
		get: function ( request, callback ) {
			return this.send( 'get', request, callback );
		},
		
		getXHR: function () {
			if ('XMLHttpRequest' in win) {
				return function () {
					return new XMLHttpRequest();
				};
			}
			return function () {
				var xhr = false;
				try {xhr = new ActiveXObject('Msxml2.XMLHTTP');} catch (ex) {
				try {xhr = new ActiveXObject('Microsoft.XMLHTTP');} catch (ex) {}}
				return xhr;
			};
		}()
	});
	
})();

/**

Easings

@location core
@description Equations by Robert Penner. 

*/

J.easings={linear:function(B,A,D,C){return D*B/C+A},quadIn:function(B,A,D,C){return D*(B/=C)*B+A},quadOut:function(B,A,D,C){return -D*(B/=C)*(B-2)+A},quadInOut:function(B,A,D,C){if((B/=C/2)<1){return D/2*B*B+A}return -D/2*((--B)*(B-2)-1)+A},cubicIn:function(B,A,D,C){return D*(B/=C)*B*B+A},cubicOut:function(B,A,D,C){return D*((B=B/C-1)*B*B+1)+A},cubicInOut:function(B,A,D,C){if((B/=C/2)<1){return D/2*B*B*B+A}return D/2*((B-=2)*B*B+2)+A},quartIn:function(B,A,D,C){return D*(B/=C)*B*B*B+A},quartOut:function(B,A,D,C){return -D*((B=B/C-1)*B*B*B-1)+A},quartInOut:function(B,A,D,C){if((B/=C/2)<1){return D/2*B*B*B*B+A}return -D/2*((B-=2)*B*B*B-2)+A},quintIn:function(B,A,D,C){return D*(B/=C)*B*B*B*B+A},quintOut:function(B,A,D,C){return D*((B=B/C-1)*B*B*B*B+1)+A},quintInOut:function(B,A,D,C){if((B/=C/2)<1){return D/2*B*B*B*B*B+A}return D/2*((B-=2)*B*B*B*B+2)+A},sineIn:function(B,A,D,C){return -D*Math.cos(B/C*(Math.PI/2))+D+A},sineOut:function(B,A,D,C){return D*Math.sin(B/C*(Math.PI/2))+A},sineInOut:function(B,A,D,C){return -D/2*(Math.cos(Math.PI*B/C)-1)+A},expoIn:function(B,A,D,C){return(B==0)?A:D*Math.pow(2,10*(B/C-1))+A},expoOut:function(B,A,D,C){return(B==C)?A+D:D*(-Math.pow(2,-10*B/C)+1)+A},expoInOut:function(B,A,D,C){if(B==0){return A}if(B==C){return A+D}if((B/=C/2)<1){return D/2*Math.pow(2,10*(B-1))+A}return D/2*(-Math.pow(2,-10*--B)+2)+A},circIn:function(B,A,D,C){return -D*(Math.sqrt(1-(B/=C)*B)-1)+A},circOut:function(B,A,D,C){return D*Math.sqrt(1-(B=B/C-1)*B)+A},circInOut:function(B,A,D,C){if((B/=C/2)<1){return -D/2*(Math.sqrt(1-B*B)-1)+A}return D/2*(Math.sqrt(1-(B-=2)*B)+1)+A},elasticIn:function(C,A,G,F,B,E){if(C==0){return A}if((C/=F)==1){return A+G}if(!E){E=F*0.3}if(!B){B=1}if(B<Math.abs(G)){B=G;var D=E/4}else{var D=E/(2*Math.PI)*Math.asin(G/B)}return -(B*Math.pow(2,10*(C-=1))*Math.sin((C*F-D)*(2*Math.PI)/E))+A},elasticOut:function(C,A,G,F,B,E){if(C==0){return A}if((C/=F)==1){return A+G}if(!E){E=F*0.3}if(!B){B=1}if(B<Math.abs(G)){B=G;var D=E/4}else{var D=E/(2*Math.PI)*Math.asin(G/B)}return B*Math.pow(2,-10*C)*Math.sin((C*F-D)*(2*Math.PI)/E)+G+A},elasticInOut:function(C,A,G,F,B,E){if(C==0){return A}if((C/=F/2)==2){return A+G}if(!E){E=F*(0.3*1.5)}if(!B){B=1}if(B<Math.abs(G)){B=G;var D=E/4}else{var D=E/(2*Math.PI)*Math.asin(G/B)}if(C<1){return -0.5*(B*Math.pow(2,10*(C-=1))*Math.sin((C*F-D)*(2*Math.PI)/E))+A}return B*Math.pow(2,-10*(C-=1))*Math.sin((C*F-D)*(2*Math.PI)/E)*0.5+G+A},backOffset:1.70158,backIn:function(B,A,E,D,C){if(!C){C=J.easings.backOffset}return E*(B/=D)*B*((C+1)*B-C)+A},backOut:function(B,A,E,D,C){if(!C){C=J.easings.backOffset}return E*((B=B/D-1)*B*((C+1)*B+C)+1)+A},backInOut:function(B,A,E,D,C){if(!C){C=J.easings.backOffset}if((B/=D/2)<1){return E/2*(B*B*(((C*=(1.525))+1)*B-C))+A}return E/2*((B-=2)*B*(((C*=(1.525))+1)*B+C)+2)+A},bounceIn:function(B,A,D,C){return D-J.easings.bounceOut(C-B,0,D,C)+A},bounceOut:function(B,A,D,C){if((B/=C)<(1/2.75)){return D*(7.5625*B*B)+A}else{if(B<(2/2.75)){return D*(7.5625*(B-=(1.5/2.75))*B+0.75)+A}else{if(B<(2.5/2.75)){return D*(7.5625*(B-=(2.25/2.75))*B+0.9375)+A}else{return D*(7.5625*(B-=(2.625/2.75))*B+0.984375)+A}}}},bounceInOut:function(B,A,D,C){if(B<C/2){return J.easings.bounceIn(B*2,0,D,C)*0.5+A}return J.easings.bounceOut(B*2-C,0,D,C)*0.5+D*0.5+A}};

/**

Tween

@location core
@description   

*/

(function () {

var name = 'Tween',
	
	parseColour = J.parseColour,
	getStyle = J.getStyle,
	
	Class = J[name] = defineClass({
		
		__init: function (el, opts) {
			this.el = getElement(el);
			extend( this, opts || {} ); 
		},
		
		__static: {
			uid: 0,
			tweens: {},
			timerSpeed: 20,
			subscribe: function ( inst ) {
				Class.tweens[ inst.tweenId ] = function () {
						inst.step.call(inst);
					};
				if ( !Class.timerHandle ) {
					Class.startTimer();
				}
			},
			unSubscribe: function ( inst ) {
				delete Class.tweens[ inst.tweenId ];
				clearTimeout( Class.timeoutHandle );
				Class.timeoutHandle = setTimeout( function () {
						if ( !Object.keys( Class.tweens ).length ) {
							Class.stopTimer();
						}
					}, 250);
			},
			startTimer: function () {
                var handler = function () {
						for ( var key in Class.tweens ) {
							Class.tweens[key]();
						} 
                    };
                // trace( 'Timer started ')
				Class.timerHandle = setInterval( handler, Class.timerSpeed );
			},
			stopTimer: function () {
				if ( Class.timerHandle ) {
                    // trace( 'Timer stopped ')
					clearInterval( Class.timerHandle );
				}
				Class.timerHandle = null;
			}
		},
		
		easing: J.easings.sineInOut,
		duration: 500,
		unit: 'px',
		
		fireEvent: fireEvent,

		setEasing: function (val) {
			this.easing = J.easings[val];
			return this;
		},
        
        setDuration: function (val) {
			this.duration = val;
			return this;
		},
        
		setOpacity: function (val) {
			J.setOpacity( this.el, val );
			return this;
		},
        
        set: function (obj) {
            return extend( this, obj );
        },
		
		sequence: function () {
			this.sequence = toArray( arguments );
			this.callSequence();
			return this;
		}, 
		
		callSequence: function () {
			var self = this,
                next = isArray( self.sequence ) ? self.sequence.shift() : null;
			if ( next ) { 
                if ( isFunction(next) ) {
                    next.call( self, self );
                }
                else {
                    self.start( next );
                }
			}
		},
		
		stop: function () {
			Class.unSubscribe( this );
			return this;
		},
		
		start: function ( obj ) {
			var self = this,
				args = toArray( arguments ),
                key,
                value, 
                prop;
			if ( args[1] ) {
				obj = {};
				obj[args[0]] = args[1];
			} 
			self.stop();
			self.stack = [];
									
			for ( prop in obj ) {
				key = J.toCamelCase( prop ); 
                value = obj[prop];
				if ( prop.indexOf('color') !== -1 ) {
					if ( isArray( value ) ) {
						value = [	
                            parseColour(value[0], 'rgb-array'), 
                            parseColour(value[1], 'rgb-array')];
					}
					else {
						var style = getStyle( self.el, key );
						if ( isNaN( style ) && !isString( style ) ) { 
							return alert( 'Tween->getStyle: '+ key +' returns NaN' );
						} 
						value = [ 
							parseColour( style, 'rgb-array' ), 
							parseColour( value, 'rgb-array' )];
					}
					value.color = true;
				}
				else if ( prop === 'background-position' ) {
					if ( isArray( value[0] ) ) {
						value = [value[0][0], value[0][1]], [value[1][0], value[1][1]];
					}
					else {
                        var startX = 0,
							startY = 0,
							current = getStyle( self.el, key ),
							m = /(\d+)[\w%]{1,2}\s+(\d+)[\w%]{1,2}/.exec( current );
						if ( current && m ) {
							startX = parseInt( m[1], 10 );
							startY = parseInt( m[2], 10 );
						}
						value = [[startX, value[0]], [startY, value[1]]];
					}
                    value.bgp = true;
				}
				else {
					if ( !isArray( value ) ) {
						var style = getStyle( self.el, key, true );
						if ( isNaN( style ) && !isString( style ) ) { 
							return alert( 'Tween->getStyle: '+ key +' returns NaN' );
						} 
						value = [style, value]; 
                        if ( prop === 'opacity' ) {
                            value.opac = true;
                        }
					}
					else {
						value = value;
					}
				}
                self.stack.push({
                    prop: key, 
                    from: value[0], 
                    to: value[1], 
                    color: value.color, 
                    bgp: value.bgp,
                    opac: value.opac
                });
			}
            
			self.startTime = +(new Date);
			self.tweenId = ++Class.uid;
            Class.subscribe( self );
            self.fireEvent('start');
			return self;
		},
		
		step: function () {
			var self = this, 
				currentTime = +(new Date);
            if ( currentTime < self.startTime + self.duration ) {
				self.elapsedTime = currentTime - self.startTime;
			} 
            else {
				self.stop();
                self.tidyUp();
				setTimeout(	function () { 
                    self.fireEvent('complete', self);
					self.callSequence(); 
				}, 0 );
                return;
			}
            self.increase();
		},
		
		tidyUp: function () {
			var self = this,
                item,
				style = self.el.style,
                i = self.stack.length - 1;
            do {
            	item = self.stack[i];
                if ( item.opac ) { 
                    self.setOpacity( item.to );                 
                }
                else if ( item.color ) { 
                    style[item.prop] = 'rgb('+ item.to.join(',') +')'; 
				} 
				else if ( item.bgp ) {
					style.backgroundPosition = item.to[0] + self.unit +' '+ item.to[1] + self.unit;
				} 
				else {
                    style[item.prop] = item.to + self.unit; 
                }
            } while (i--)
		},
		
		increase: function () {
			var self = this, 
                item,
                round = Math.round,
				style = self.el.style,
                i = self.stack.length - 1,
                msiePx = browser.ie && self.unit === 'px';
            do {
                item = self.stack[i];
                if ( item.opac ) {
                    self.setOpacity( self.compute( item.from, item.to ) );     
                } 
                else if ( item.color ) {
					style[item.prop] = 'rgb(' + 
						round( self.compute( item.from[0], item.to[0] ) ) + ',' +
						round( self.compute( item.from[1], item.to[1] ) ) + ',' +
						round( self.compute( item.from[2], item.to[2] ) ) + ')';
				}
				else if ( item.bgp ) {
                    style.backgroundPosition = 
						self.compute( item.from[0], item.to[0] ) + self.unit + ' ' + 
						self.compute( item.from[1], item.to[1] ) + self.unit;
				}
				else { 
                    var computed = self.compute( item.from, item.to );
                    style[item.prop] = (msiePx ? round(computed) : computed) + self.unit;
				}				
            } while (i--)
		},
		
		compute: function (from, to) {
			return this.easing( this.elapsedTime, from, (to - from), this.duration );
		}

	});

})();

/**

Scroll

@location core
@description 

*/

(function () {

var name = 'Scroll',
	
	Class = J[name] = defineClass({
		
		__extends: J.Tween,
        
        __init: function ( el, opts ) {
            this.el = getElement(el);
            extend( this, opts || {} ); 
        },
        
        start: function ( x, y ) {
            var self = this, 
                el = self.el;
            self.stop();
            if ( el === win ) {
                var winpos = J.getWindowScroll();
                x = isArray(x) ? x : [winpos[0], x];
                y = isArray(y) ? y : [winpos[1], y];
                self.increase = function () {
                    el.scrollTo( self.compute( self.vals[0][0], self.vals[0][1] ), 
                                 self.compute( self.vals[1][0], self.vals[1][1] ) );
                };
            } 
            else {
                x = isArray(x) ? x : [el.scrollLeft, x];
                y = isArray(y) ? y : [el.scrollTop, y];
                self.increase = function () {
                    el.scrollLeft = self.compute(self.vals[0][0], self.vals[0][1]); 
                    el.scrollTop = self.compute(self.vals[1][0], self.vals[1][1]); 				
                };
            }
            self.vals = [x, y];
            self.startTime = +(new Date);
            
            self.tweenId = ++J.Tween.uid;
            J.Tween.subscribe( self );
            self.fireEvent('start');
			return self;
        },
        
        tidyUp: function () {
            var self = this;
            if ( self.el === win ) { 
                self.el.scrollTo( self.vals[0][1], self.vals[1][1] ); 
            } 
            else {
                self.el.scrollLeft = self.vals[0][1]; 
                self.el.scrollTop = self.vals[1][1]; 
            }
        } 
    });

})();

/**

Poller

@location core
@description   

*/

(function () {

var name = 'Poller',
	
	Class = J[name] = defineClass({
		
		__static: {
			pollTime: 300
		},
		
		__init: function ( pollTime ) {
			extend( this, {
				uid: 0,
				handlers: {},
				pollTime: pollTime || Class.pollTime
			});
		},
		
		setPollTime: function ( ms ) {
			this.pollTime = ms;
			return this;
		},
		
		start: function () {
			var self = this;
			clearTimeout( self.timerHandle );
			clearTimeout( self.firstPoll );
			self.firstPoll = setTimeout( function () { 
				(function poll () {
					for ( var key in self.handlers ) {
						self.handlers[key]();
					} 
					self.timerHandle = setTimeout( poll, self.pollTime );
				})()
			}, self.pollTime );
		}, 
		
		stop: function () {
			var self = this;
			clearTimeout( self.timerHandle );
			self.timerHandle = null;
			return self;
		},
		
		clear: function () {
			var self = this;
			self.stop();
			self.handlers = null;
			return self;
		},
		
		subscribe: function ( fn, ref ) {
			var self = this,
				handlerId = ref || ++self.uid;
			if ( self.handlers[handlerId] ) {
				return false;
			}
			self.handlers[handlerId] = fn;
			if ( !self.timerHandle ) {
				self.start();
			}
			return handlerId;
		},
		
		unSubscribe: function ( handlerId ) {
			var self = this;
			delete self.handlers[handlerId];
			if ( !Object.keys( self.handlers ).length ) {
				self.stop();
			}
		}
	});
	
})();
})(); // End core closure

/**

Datepicker

@location plugin
@description 

*/

(function () {

var name = 'DatePicker',
	
	// Shortcuts	
	J = JELLY,
	
	// Class definition
	Class = J[name] = J.defineClass({
		
		__init: function ( inputId, opts ) {
			var self = this,
				createElement = J.createElement,
				branch = J.createBranch(
					'.j-cal',
						'.j-cal-trim',
						['.j-cal-title',
						 '.j-cal-back title:"Previous Month", setHTML:&laquo;', 
						 '.j-cal-next title:"Next Month", setHTML:&raquo;', 
						 '.j-cal-table']
				);
			self.root = branch.root;
			self.table = branch.div[5];
			self.next = branch.div[4];
			self.back = branch.div[3];
			self.title = branch.div[2];
			self.calendar = branch.div[0];
			self.btn_close = self.calendar.appendChild( 
				createElement( 'div.j-cal-close setHTML:"x Close"' ) );
			self.visible = false;
			self.input = J.getElement( inputId );
			
			self.DATE_SEP = '-';
			self.DATE_FORMAT = 'uk';
			var m, dateValue = self.input.value.trim();
			if ( m = /\d{2,}([^\d])\d{2,}([^\d])\d{2,}/.exec( dateValue ) ) {
				self.DATE_SEP = m[1];
			}
			if ( m = /\d{4}[^\d]\d{2}[^\d]\d{2}/.exec( dateValue ) ) {
				self.DATE_FORMAT = 'int';
			}
			else if ( m = /\d{2}[^\d](\d{2})[^\d]\d{4}/.exec( dateValue ) ) {
				if ( m[1] > 12 ) {
					self.DATE_FORMAT = 'usa';
				}
			}
			
			J.extend( self, opts );
			self.offset = opts.offset || [0,0];
			
			self.btn_open = createElement(
				'img.j-cal-open src:assets/images/calendar.png, \
					alt:"Select start week", title:"Select start week"')
					
			J.insertAfter( self.btn_open, self.input );

			self.btn_open.onmousedown = function (e) {
				var xy = J.getXY( this );
				self.calendar.style.position = "absolute";
				J.setXY( self.calendar, xy[0]+self.offset[0], xy[1]+self.offset[1] );
				self.setDate();
				self.prepareTable();
				Class.closeAll();
				self.open();
			};
			
			self.btn_close.onmousedown = self.close.bind( self );
			
			self.btn_open.onclick =
			self.calendar.onclick = J.stopEvent;
			
			self.idPrefix = 'jcal-' + (++Class.uid);
			self.setDate();
			self.prepareTable();
			self.tween = new J.Tween( self.calendar, {duration: 100} ); 
			
			self.next.onmousedown = function (e) {
				e = e || window.event;
				var moveAmount = 1, 
					shift = e.shiftKey,
					ctrl = e.ctrlKey;
				if ( ctrl ) { moveAmount = shift ? 12 : 3; }
				self.date.setMonth( self.date.getMonth() + moveAmount );
				self.prepareTable();
			};
			
			self.back.onmousedown = function (e) {
				e = e || window.event;
				var moveAmount = 1, 
					shift = e.shiftKey,
					ctrl = e.ctrlKey;
				if ( ctrl ) { moveAmount = shift ? 12 : 3; }
				self.date.setMonth( self.date.getMonth() - moveAmount );
				self.prepareTable();
			};
			
			Class.log.push( self );
		},
		
		__static: {
			uid: 0,
			log: [],
			closeAll: function () {
				this.log.each(function (o) { o.close(); });
			}
		},
		
		setDate: function () {
			this.values = this.getValue().split( this.DATE_SEP );
			this.year = parseInt(this.values[0], 10);
			this.month = parseInt(this.values[1], 10);
			this.day_number = parseInt(this.values[2], 10);
			this.date = new Date;
			this.date.setFullYear(this.year, this.month-1, this.day_number);
			if ( isNaN(this.date) || this.date.toString() === 'Invalid Date' ) {
				this.date = new Date;
			}
		},

		close: function () {
			if ( !this.visible ) { return; }
			J.removeElement( this.root );
			this.visible = false;
		},
		
		open: function () {
			J.insertElement( this.root );
			this.tween.setOpacity( 0 );
			this.tween.start( {'opacity': 1 } );
			this.visible = true;
		},
		
		getValue: function () {
			return this.input.value.split( this.DATE_SEP ).reverse().join( this.DATE_SEP );
		},
		
		setValue: function (val) {
			this.input.value = val.split( this.DATE_SEP ).reverse().join( this.DATE_SEP );
		},
		
		renderDate: function (date) {
			var daysInMonth = function (date) {
					return 32 - new Date(date.getFullYear(), date.getMonth(), 32).getDate();
				},
				firstDayInMonth = function (date) {
					var date = new Date(date.getFullYear(), date.getMonth());
					date.setDate(0);
					return date.getDay();
				},
				ifCurrent = function (str, className) {
					if (str.join( this.DATE_SEP ) === this.input.value) {
						className.push("selected");
						selected_week = true;
					} 
				},
				addLeadingZero = function (n) { return n < 10 ? '0' + n : n; };
		
			var startDay = firstDayInMonth(date), 
				_daysInMonth = daysInMonth(date),
				_daysInPrevousMonth = daysInMonth(new Date(date.getFullYear(), date.getMonth() - 1)),
				counter_2 = 1,
				counter = 1, 
				str = '<table><tbody><tr>' +
					  '<th>M</th><th>T</th><th>W</th><th>T</th><th>F</th><th>S</th><th>S</th></tr>',
				selected_week = false;
					  
			for (var i = 0, j, k; i < 6; i++) {
				var tmp = '';
				if (i === 0) {
					for (j = 0, k = 1; j < 7; j++, k++) {
						var className = j === 5 || j === 6 ? ['weekend'] : [],
							date_string, 
							day, 
							month, 
							year, 
							content = '?';
						
						if ( k > startDay ) {
							year = date.getFullYear();
							month = addLeadingZero( date.getMonth() + 1 );
							day = addLeadingZero( counter );
							ifCurrent.call(this, [day, month, year], className);
							content = counter++;
						} 
						else {
							className.push('otherMonth');
							content = (_daysInPrevousMonth++ - startDay + 1);
							year = date.getFullYear();
							month = addLeadingZero(date.getMonth());
							day = addLeadingZero(content);
							if ( month < 1 ) {
								month = '12';
								year--;
							} 
						}
						tmp += '<td id="' + [this.idPrefix, year, month, day].join( this.DATE_SEP ) + '"';
						tmp += ' class="' + className.join(' ');
						tmp += '">';
						tmp += content;
						tmp += '</td>\n';
					}		
				} 
				else {
					for (j = 0, k = counter; j < 7; j++, k++) {
						var className = j === 5 || j === 6 ? ['weekend'] : [],
							date_string, 
							day, 
							month, 
							year, 
							content = '?';
						
						if (k < _daysInMonth + 1) {
							year = date.getFullYear();
							month =  addLeadingZero(date.getMonth() + 1);
							day = addLeadingZero(counter);
							ifCurrent.call(this, [day, month, year], className);
							content = counter++;
						} 
						else {
							content = counter_2++;						
							month = addLeadingZero(date.getMonth() + 2),
							year = date.getFullYear(),
							day = addLeadingZero(content);
							if ( month > 12 ) {
								month = '01';
								year++;
							} 
							className.push('otherMonth');
						}
						tmp += '<td id="' + [this.idPrefix, year, month, day].join( this.DATE_SEP ) + '"';
						tmp += ' class="' + className.join(' ');
						tmp += '">';
						tmp += content;
						tmp += '</td>\n';
					}		
				}
				str += (selected_week ? '<tr class="selected-week">' : '<tr>') + tmp + '</tr>\n';
				selected_week = false;
			}
			return str + '</tbody></table>';
		},

		setTitle: function ( date ) {
			var word = function () {
				switch (date.getMonth()) {
					case 0: return 'January';
					case 1: return 'February';
					case 2: return 'March';
					case 3: return 'April';
					case 4: return 'May';
					case 5: return 'June';
					case 6: return 'July';
					case 7: return 'August';
					case 8: return 'September';
					case 9: return 'October';
					case 10: return 'November';
					case 11: return 'December';
				}
			}();
			this.title.innerHTML = word + ' ' + date.getFullYear(); 
		}, 

		prepareTable: function () {
			var self = this;
			self.table.innerHTML = self.renderDate( self.date );
			self.setTitle( self.date );
			var tds = self.table.getElementsByTagName('td'),
				trs = self.table.getElementsByTagName('tr'),
				clearClassNames = function (tds) {
					for (var i = 0; i < tds.length; i++) { 
						J.removeClass(tds[i], 'selected'); 
					}
				};
			var i = tds.length-1;
			do {
				if (tds[i].id) {
					tds[i].onclick = function () {
						var selectedCell = this;
						switch ( self.selectMode ) {
							case 'first':
								selectedCell = J.getFirst( this.parentNode );
								break;
							case 'last':
								selectedCell = J.getLast( this.parentNode );
								break;
						}
						self.setValue( selectedCell.id.replace( self.idPrefix + self.DATE_SEP, '' ) );
						self.setDate();
						J.addClass( this.parentNode, 'selected' ); 
						self.close();
					};
				}
			} while(i--);
		}
	});

})();