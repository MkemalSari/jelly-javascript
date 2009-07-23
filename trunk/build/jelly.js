/*!
Jelly JavaScript, Copyright (c) 2008-2009 Pete Boere.
MIT Style License: http://www.opensource.org/licenses/mit-license.php
this build compiled: 2009-07-23 
*/
(function () {

/**

Base

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
	querySelectorAll = 'querySelectorAll' in doc,
	functionLit = function () {},
	
	isDefined = function (obj) { 
		return typeof obj !== 'undefined'; 
	},
	
	isUndefined = function (obj) { 
		return typeof obj === 'undefined'; 
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
		// 'null' is rejected as a legitimate object: It identifies itself as an object 
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
	
	defineClass = function (opts) {
		var _constructor = opts.__init || functionLit,
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
			activex = 'ActiveXObject' in win,
			xhr = 'XMLHttpRequest' in win,
			securityPolicy = 'securityPolicy' in nav,
			taintEnabled = 'taintEnabled' in nav,
			opera = /opera/i.test(ua),
			firefox = /firefox/i.test(ua),				
			webkit = /webkit/i.test(ua),
			ie = activex ? ( querySelectorAll ? 8 : ( xhr ? 7 : 6 ) ) : 0;
		return {
			ie: ie,
			ie6: ie === 6,
			ie7: ie === 7,
			ie8: ie === 8,
			opera: opera,
			firefox: firefox || ( securityPolicy && !activex && !opera ),
			webkit: webkit || ( !taintEnabled && !activex && !opera ),
			safariMobile: /safari/i.test( ua ) && /mobile/i.test( ua ),
			chrome: webkit && /chrome/i.test( ua )
		};
	}(),
	
	msie = browser.ie,
	
	extend = function ( a, b, overwrite ) {
		for ( var mem in b ) {
			if ( isDefined( a[mem] ) && overwrite === false ) {
				continue;
			}
			a[mem] = b[mem];
		}
		return a;
	},
	
	createLogger = function ( method ) {
		if ( win.console && win.console[method] ) {  	
			return function () {
				win.console[method].apply( win, toArray( arguments ) ); 
			};
		}
		return functionLit;
	},
	
	log = createLogger('log'),
	logError = createLogger('error'),
	logWarn = createLogger('warn'),
	logInfo = createLogger('info');
		
extend( J, {
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
	defineClass: defineClass,
	fireEvent: fireEvent,
	browser: browser,
	extend: extend,	
	log: log,
	logError: logError,
	logWarn: logWarn,
	logInfo: logInfo
});

/**

Elements

@location core
@description helper functions for working with elements and manipulating the DOM

*/

var addClass = function ( el, cn ) {
		el = getElement(el);
		if ( hasClass( el, cn ) ) { return; }
		el.className += el.className ? ' ' + cn : cn;
	}, 
	
	removeClass = function ( el, cn ) {
		el = getElement(el);
		if ( !el.className ) { return; } 
		var patt = new RegExp( '(^|\\s)' + cn + '(\\s|$)' );
		el.className = J.normalize( el.className.replace( patt, ' ' ) );
	},
	
	hasClass = function ( el, cn ) {
		return (' ' + ( getElement(el) ).className + ' ').indexOf( cn ) !== -1;
	},
	
	toggleClass = function ( el, cn ) {
		el = getElement(el);
		if ( hasClass( el, cn ) ) { 
			removeClass( el, cn ); 
		} 
		else { 
			addClass( el, cn ); 
		}
	},
	
	getElement = function ( obj ) { 
		return typeof obj === 'string' ? doc.getElementById( obj ) : obj; 
	},
	
	createElement = function ( arg, attrs ) {
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
			el = createElement( type.toLowerCase(), attributes );
		}
		return attrs === true ? { elem: el, ref: branchMapData } : el;
	},
	
	createBranch = function () {
		var args = toArray( arguments ),
			res = {},
			context,
			parseToken = function ( arg ) {
				if ( arg && isObject( arg ) ) {
					if ( isElement( arg.root ) ) {
						for ( var key in arg ) {
							if ( isArray( arg[key] ) ) {
								var nodeName = arg[key][0].nodeName.toLowerCase();
								res[nodeName] = res[nodeName] || [];
								arg[key].each( function (el) { 
									res[nodeName].push(el); 
								});
							} 
							else if ( key !== 'root' ) { res[key] = arg[key]; }
						} 
						return arg.root;
					} 
					else if ( isElement(arg) ) { return arg; }
				} 
				else if ( !isString(arg) ) { return; } 
				var obj = createElement(arg, true),
					elem = obj.elem,
					type = elem.nodeName.toLowerCase();
				res[type] = res[type] || [];
				res[type].push(elem);
				if ( obj.ref ) { res[obj.ref] = elem; }
				return elem;
			};
		res.root = context = parseToken( args.shift() );
		args.each(function (feed) {
			if ( !isArray(feed) ) { 
				context = context.appendChild( parseToken( feed ) ); 
			} 
			else { 
				feed.each( function (o) { 
					context.appendChild( parseToken(o) ) 
				}); 
			}
		});
		return res;
	},
	
	wrapElement = function ( el, wrapper ) {
		el = getElement(el);
		var pnt = el.parentNode, next = el.nextSibling;
		wrapper.appendChild(el);
		return next ? pnt.insertBefore( wrapper, next ) : pnt.appendChild( wrapper );	
	},
	
	withElement = function ( el, callback, scope ) {
		el = getElement(el);
		if (el) { return callback.call(scope || el, el); }
		return el;
	},
	
	replaceElement = function ( el, replacement ) {
		el = getElement(el);
		return el.parentNode.replaceChild( replacement, el );
	},
	
	removeElement = function (el) {
		el = getElement(el);
		return el.parentNode.removeChild(el);
	},
	
	insertElement = function ( el, datum ) {
		el = getElement(el);
		return ( getElement(datum) || doc.body ).appendChild(el);
	},
	
	insertTop = function ( el, datum ) {
		if ( !( el = getElement(el) ) || !( datum = getElement(datum) ) ) { return false; }
		if ( datum.firstChild ) { 
			return datum.insertBefore( el, datum.firstChild ); 
		}
		else { 
			return datum.appendChild(el); 
		}
	},
	
	insertBefore = function ( el, datum ) {
		datum = getElement(datum);
		return datum.parentNode.insertBefore( getElement(el), datum );
	},
	
	insertAfter = function ( el, datum ) {
		if ( !(el = getElement(el)) || !(datum = getElement(datum)) ) { return false; }
		var next = J.getNext(datum);
		if ( next ) { 
			return datum.parentNode.insertBefore(el, next); 
		} 
		else { 
			return datum.parentNode.appendChild(el); 
		}
	},
	
	getFirst = function (el) {
		el = el.firstChild;
		while ( el && el.nodeType !== 1 ) {
			el = el.nextSibling;
		}
		return el;
	},
	
	getLast = function (el) {
		el = el.lastChild;
		while ( el && el.nodeType !== 1 ) {
			el = el.previousSibling;
		}
		return el;
	},
	
	getNext = function (el) {
		el = el.nextSibling;
		while ( el && el.nodeType !== 1 ) {
			el = el.nextSibling;
		}
		return el;
	},
	
	getPrevious = function (el) {
		el = el.previousSibling;
		while ( el && el.nodeType !== 1 ) {
			el = el.previousSibling;
		}
		return el;
	},
	
	getChildren = function (el) {
		var elements = [], el = el.firstChild;
		while (el) {
			if ( el.nodeType === 1 ) {
				elements[elements.length] = el;
			}
			el = el.nextSibling;
		}
		return elements;
	},
	
	getXY = function (el) {
		el = getElement(el);
		var xy = [0, 0];
		do {
			xy[0] += el.offsetLeft;
			xy[1] += el.offsetTop;
		} while (el = el.offsetParent);
		return xy;
	},

	setXY = function ( el, X, Y, unit ) {
		el = getElement(el);
		unit = unit || 'px';
		el.style.left = X + unit;
		el.style.top = Y + unit;
	},
	
	getX = function (el) {
		return getXY(el)[0];
	},
	
	setX = function ( el, X, unit ) {
		( getElement(el) ).style.left = X + ( unit || 'px' );
	},
	
	getY = function (el) {
		return getXY(el)[1];
	},
	
	setY = function ( el, Y, unit ) {
		( getElement(el) ).style.top = Y + ( unit || 'px' );
	},
	
	getAttribute = function () {
		if ( !isDefined( docRoot.hasAttribute ) && msie ) {
			return function ( node, attr ) {
				switch ( attr ) {
					case 'class': return node.className || null;
					case 'href': 
					case 'src': return node.getAttribute( attr, 2 ) || null;						
					case 'style': return node.getAttribute( attr ).cssText.toLowerCase() || null;
					case 'for': return node.attributes[attr].nodeValue || null;
				}
				return node.getAttribute( attr ) || null;
			};
		}
		return function ( node, attr ) { 
			return node.getAttribute( attr ); 
		};
	}(),
	
	getStyle = function ( el, prop ) {
		var val, prop = J.toCamelCase( prop );
		if ( prop === 'opacity' ) { 
			if ( !isDefined( el.__opacity ) ) { 
				el.__opacity = 1; 
			}
			return el.__opacity;
		}
		if ( el.style[prop] ) { 
			return el.style[prop]; 
		} 
		else if ( 'getComputedStyle' in win ) { 
			return win.getComputedStyle( el, null )[prop]; 
		} 
		else if ( 'currentStyle' in el ) { 
			return el.currentStyle[prop]; 
		}
	},
	
	setOpacity = function () {
		if ( 'filters' in docRoot ) {
			return function ( el, val ) {
				if ( el.__opacity === undefined ) {
					el.__opacity = 1;
				}
				el.style.filter = val === 1 ? '' : 'alpha(opacity=' + (val * 100) + ')';
				el.__opacity = val;
			};
		} 
		return function ( el, val ) {
			if ( el.__opacity === undefined ) {
				el.__opacity = 1;
			}
			el.style.opacity = el.__opacity = val;
		};
	}(),
	
	storeData = function ( el, name, value ) {
		var cache = elementData, elementKey = cache.ns;
		if ( !( el = getElement(el) ) ) { return; }
		if ( !( elementKey in el ) ) { 
			el[elementKey] = elementUid(); 
			cache[el[elementKey]] = {};
		}
		cache[el[elementKey]][name] = value;
	},
	
	retrieveData = function ( el, name ) {
		var cache = elementData, elementKey = cache.ns;
		if ( !( el = getElement(el) ) ) { return; }
		if ( elementKey in el && el[elementKey] in cache ) {
			return cache[el[elementKey]][name];
		}
		return null;
	},
	
	removeData = function ( el, name ) {
		var cache = elementData, elementKey = cache.ns;
		if ( !( el = getElement(el) ) ) { return; }
		if ( elementKey in el && el[elementKey] in cache ) {  
			delete cache[el[elementKey]][name];
		}
	},
	
	elementData = { ns:'jelly_' + (+new Date) },
	
	elementUid = function () { 
		var uid = 0;
		return function () { return ++uid; }
	}();

extend( J, {
	addClass: addClass,
	removeClass: removeClass,
	hasClass: hasClass,
	toggleClass: toggleClass,
	getElement: getElement,
	createElement: createElement,
	createBranch: createBranch,
	wrapElement: wrapElement,
	withElement: withElement,
	replaceElement: replaceElement,
	removeElement: removeElement,
	insertElement: insertElement,
	insertTop: insertTop,
	insertBefore: insertBefore,
	insertAfter: insertAfter,
	getFirst: getFirst,
	getLast: getLast,
	getNext: getNext,
	getPrevious: getPrevious,
	getChildren: getChildren,
	getXY: getXY,
	setXY: setXY,
	getX: getX,
	setX: setX,
	getY: getY,
	setY: setY,
	getAttribute: getAttribute,
	getStyle: getStyle,
	setOpacity: setOpacity,
	storeData: storeData,
	retrieveData: retrieveData,
	removeData: removeData
});

/**

Events

@location core
@description event utilities

*/

extend( J, { 
	
	eventLog: [], 

	addEvent: function ( obj, type, fn ) {
		obj = getElement(obj);
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
		if ( standardEventModel ) { 
			obj.addEventListener( type, wrapper || fn, false ); 
		} 
		else { 
			obj.attachEvent( 'on' + type, wrapper ); 
		}
		return handle;
	},
	
	removeEvent: function () {
		if (standardEventModel) {
			return function ( handle ) {
				if ( handle ) { 
					handle[0].removeEventListener( handle[1], handle[2], false ); 
				}
			};
		} 
		return function ( handle ) {
			if ( handle ) { 
				handle[0].detachEvent( 'on' + handle[1], handle[2] ); 
			}
		};
	}(),
	
	purgeEventLog: function () {
		if ( J.eventLog.length > 1 ) {
			var arr = J.eventLog, i, c;
			for ( i = 0; arr[i]; i++ ) {
				c = arr[i];					
				if ( c[0] === win && c[1] === 'unload' ) {
					continue;
				}
				J.removeEvent(c);
			}
		}
	}, 
	
	fixEvent: function () {
		if ( standardEventModel ) {
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
		if ( e.relatedTarget ) {
			related = e.relatedTarget;
			if ( related.nodeType !== 1 || related === this ) { return false; }
			var children = this.getElementsByTagName('*');
			for ( i=0; children[i]; i++ ) {
				if ( related === children[i] ) { return false; }
			}
		}
		return true;
	},
	
	stopEvent: function (e) {
		e = J.fixEvent(e);
		e.stopPropagation();
		e.preventDefault();
		return e;
	}
	
});

/**

Strings

@location core
@description 

*/

extend( J, { 
	
	normalize: function ( str ) {
		return str.replace( /\s{2,}/g, ' ' ).trim();
	},
	
	toCamelCase: function ( str ) {
		return str.replace( /-\D/gi, function (m) {
			return m.charAt( m.length - 1 ).toUpperCase();
		});
	}, 
	
	toCssCase: function ( str ) {
		return str.replace( /([A-Z])/g, '-$1' ).toLowerCase();
	}, 
	
	rgbToHex: function ( str ) {
		var rgb = str.match( /[\d]{1,3}/g ), hex = [], i;
		for ( i = 0; i < 3; i++ ) {
			var bit = ( rgb[i]-0 ).toString( 16 );
			hex.push( bit.length === 1 ? '0'+bit : bit );
		}
		return '#' + hex.join('');
	},
	
	hexToRgb: function ( str, array ) {
		var hex = str.match( /^#([\w]{1,2})([\w]{1,2})([\w]{1,2})$/ ), rgb = [], i;
		for ( i = 1; i < hex.length; i++ ) {
			if ( hex[i].length === 1 ) { 
				hex[i] += hex[i]; 
			}
			rgb.push( parseInt( hex[i], 16 ) );
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
				if ( hex ) { 
					return hexToRgb( str, true ); 
				} 
				else {
					temp = str.replace( /rgb| |\(|\)/g, '' ).split(',');
					temp.each( function ( item ) { 
						tempArray.push( parseInt(item, 10) ); 
					});
					return tempArray;
				}
		}
	},
	
	stripTags: function ( str, allow ) {
		if ( !allow ) { 
			return str.replace( /<[^>]*>/g, '' ); 
		} 
		allow = allow.replace( /\s+/g, '' ).split(',').map( function (s) {
			return s +' |'+ s +'>|/'+ s +'>';   
		}).join('|');
		return str.replace( new RegExp( '<(?!'+ allow +')[^>]+>', 'g' ), '' );
	},
	
	bindData: function ( str, data ) {
		var m;
		while ( m = /%\{\s*([^\}\s]+)\s*\}/.exec(str) ) {
			str = str.replace( m[0], data[m[1]] || '??' );
		}
		return str;
	},
	
	evalScripts: function ( str ) {
		var c = createElement( 'div', {setHTML: str} ), 
			res = [];
		toArray( c.getElementsByTagName('script') ).each( function (el) {
			res.push( win['eval'](el.innerHTML) );
		});
		return res;
	}
	
});

/**

Cookies

@location core
@description helper functions for working with cookies

*/

extend(J, { 
	
	getCookie: function ( name ) {
		var result = new RegExp( name + '=([^; ]+)' ).exec( doc.cookie );
		return result ? unescape( result[1] ) : null;
	},
	
	setCookie: function ( name, value, expires, path, domain, secure ) {
		if ( expires ) {
			var expireTime = (+new Date) + ( ( 1000*60*60*24 ) * expires );
			expires = new Date( expireTime ).toGMTString();
		}
		doc.cookie = name + '=' + escape( value ) +
			( expires ? ';expires=' + expires : '' ) + 
			( path ? ';path=' + path : '' ) +
			( domain ? ';domain=' + domain : '' ) +	
			( secure ? ';secure' : '' );
	},
	
	removeCookie: function ( name, path, domain ) {
		if ( J.getCookie( name ) ) {
			doc.cookie = name + '=' +
				( path ? ';path=' + path : '' ) +
				( domain ? ';domain=' + domain : '' ) +	
				( ';expires=' + new Date(0) );
		}
	}
	
});

/**

Flash

@location core
@description helper functions for working with flash objects

*/

extend( J, {
	
	getFlashVersion: function () {
		var ver = { major: 0, build: 0 },
			plugins = navigator.plugins,
			desc,
			versionString;
		if ( plugins && isObject( plugins['Shockwave Flash'] ) ) {
			desc = plugins['Shockwave Flash'].description;
			if ( desc !== null ) {
				versionString = desc.replace( /^[^\d]+/, '' );
				version.major = parseInt( versionString.replace( /^(.*)\..*$/, '$1' ), 10 );
				version.build = parseInt( versionString.replace( /^.*r(.*)$/, '$1' ), 10 );
			}
		} 
		else if ( msie ) {
			try {
				var axflash = new ActiveXObject( 'ShockwaveFlash.ShockwaveFlash' );
				desc = axflash.GetVariable( '$version' );
				if ( desc !== null ) {
					versionString = desc.replace( /^\S+\s+(.*)$/, '$1' ).split(',');
					version.major = parseInt( versionString[0], 10 );
					version.build = parseInt( versionString[2], 10 );
				}
			} catch (ex) {}
		}
		return version;
	},
	
	createFlashObject: function ( path, width, height, fallback, params, vars, attributes ) {
		var params = params || {};
			vars = vars || {},
			attrs = attributes || {},
			fallback = fallback || 'You need <a href="http://www.adobe.com/go/getflashplayer">Adobe Flash Player</a> installed to view this content</a>',
			data = [],
			key,
			output = '<object';
		if ( msie ) {
			attrs.classid = 'clsid:D27CDB6E-AE6D-11cf-96B8-444553540000';
			params.movie = path;
		} 
		else {
			attrs.data = path;
			attrs.type = 'application/x-shockwave-flash';
		}
		attrs.width = width;
		attrs.height = height;
		for ( key in attrs ) { 
			output += ' ' + i + '="' + attr[i] + '"'; 
		}
		output += '>\n';
		for ( key in vars ) { 
			data.push( key + '=' + encodeURIComponent( vars[key] ) ); 
		}
		if ( data.length > 0 ) { 
			params.flashvars = data.join('&'); 
		} 
		for ( key in params ) { 
			output += '\t<param name="' + key + '" value="' + params[key] + '" />\n'; 
		}
		return output + fallback + '\n</object>';
	},
	
	embedFlashObject: function ( el, path, width, height, params, vars, attributes ) {
		el = getElement(el);
		el.innerHTML = J.createFlashObject( 
			path, width, height, el.innerHTML, params || {}, vars || {}, attributes || {} );
	}
	
});

/**

Misc

@location core
@description various utilities

*/

extend( J, {
	
	getViewport: function () {
		if ( isDefined(win.innerWidth) ) {
			return function () {
				return [win.innerWidth, win.innerHeight];
			};
		} 
		if ( isDefined(docRoot) && isDefined(docRoot.clientWidth) && docRoot.clientWidth !== 0 ) { 
			return function () {
				return [docRoot.clientWidth, docRoot.clientHeight];
			};
		}
		return function () {
			return [docBody.clientWidth || 0, docBody.clientHeight || 0];
		};
	}(),
	
	getWindowScroll: function () {
		if ( isDefined(win.pageYOffset) ) {
			return function () {
				return [win.pageXOffset, win.pageYOffset];
			};
		} 
		return function () {
			if ( isDefined(docRoot.scrollTop) && 
				(docRoot.scrollTop > 0 || docRoot.scrollLeft > 0) ) {
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
		if ( namespace[0] === 'window' ) { namespace.shift(); } 
		var script = createElement('script'),
			timeout = 1000,
			polltotal = 0,
			polltime = 15,
			poller = function () {
				var _namespace = window, 
					ready = true;
				for ( var i = 0; i < namespace.length; i++ ) {
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
					else { callback( true ); }
				}
				else { callback( false ); }
			};
		loader( true );
	},
	
	unpack: function () {
		var str = 'var J=JELLY', mem;
		for ( mem in J ) { 
			str += ',' + mem + '=J.' + mem; 
		}
		return str + ';';
	}
	
});

/**

Native extensions

@location core
@description  

*/

extend( Array.prototype, {
	
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


extend( String.prototype, {
	
	trim: function () {
		return this.replace( /^\s\s*/, '' ).replace( /\s\s*$/, '' );
	}
	
}, false);


extend( Function.prototype, {
	
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
addClass( docRoot, 'js ' + classname.join(' ') );

/**

Selector Engine

@location core
@description A cross-browser interface for querying the DOM

*/

J._Q = {
	'A': function (a, b) {
		try { 
			return toArray( b ? a.querySelectorAll(b) : document.querySelectorAll(a) );
		} catch (ex) {}
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
		feedback: { start: functionLit, stop: functionLit },
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
				try { xhr = new ActiveXObject('Msxml2.XMLHTTP'); } catch (ex) {
					try { xhr = new ActiveXObject('Microsoft.XMLHTTP'); } catch (ex) {} 
				}
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
                // log( 'Timer started ')
				Class.timerHandle = setInterval( handler, Class.timerSpeed );
			},
			stopTimer: function () {
				if ( Class.timerHandle ) {
                    // log( 'Timer stopped ')
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
							return logWarn( 'getStyle for "%s" returns NaN', key );
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
						var style = parseInt( getStyle( self.el, key ), 10 );
						if ( isNaN( style ) && !isString( style ) ) { 
							return logWarn( 'getStyle for "%s" returns NaN', key );
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
                    style[item.prop] = 'rgb(' + item.to.join(',') + ')'; 
				} 
				else if ( item.bgp ) {
					style.backgroundPosition = item.to[0] + self.unit + ' ' + item.to[1] + self.unit;
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

	/*
    http://www.JSON.org/json2.js
    2009-06-29

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html

    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the object holding the key.

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.

    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.
*/

/*jslint evil: true */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/

// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

win.JSON = JSON || {};

(function () {

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf()) ?
                   this.getUTCFullYear()   + '-' +
                 f(this.getUTCMonth() + 1) + '-' +
                 f(this.getUTCDate())      + 'T' +
                 f(this.getUTCHours())     + ':' +
                 f(this.getUTCMinutes())   + ':' +
                 f(this.getUTCSeconds())   + 'Z' : null;
        };

        String.prototype.toJSON =
        Number.prototype.toJSON =
        Boolean.prototype.toJSON = function (key) {
            return this.valueOf();
        };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ?
            '"' + string.replace(escapable, function (a) {
                var c = meta[a];
                return typeof c === 'string' ? c :
                    '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' :
            '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0 ? '[]' :
                    gap ? '[\n' + gap +
                            partial.join(',\n' + gap) + '\n' +
                                mind + ']' :
                          '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

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

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0 ? '{}' :
                gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
                        mind + '}' : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                     typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
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


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/.
test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').
replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = win['eval']('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function' ?
                    walk({'': j}, '') : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());
})(); // End core closure