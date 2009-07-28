/**

Base

@description 
	Initialization of Jelly namespace
	Base set of shortcuts and utility functions

*/

var J = window.JELLY = {},

	// shortcuts
	//
	win = window,
	doc = win.document,
	docRoot = doc.documentElement,
	docHead = doc.getElementsByTagName('head')[0],
	docBody = doc.body,
	standardEventModel = 'addEventListener' in doc,
	querySelectorAll = 'querySelectorAll' in doc,
	functionLit = function () {},
	
	// browser detection
	//
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
	
	// 'is' functions
	//
	isDefined = function ( obj ) { 
		return typeof obj !== 'undefined'; 
	},
	
	isUndefined = function ( obj ) { 
		return typeof obj === 'undefined'; 
	},
	
	isNull = function ( obj ) { 
		return obj === null; 
	},
	
	isBoolean = function ( obj ) { 
		return typeof obj === 'boolean'; 
	},
	
	isString = function ( obj ) { 
		return typeof obj === 'string'; 
	},
	
	isNumber = function ( obj ) { 
		return typeof obj === 'number'; 
	},
	
	isInteger = function ( obj ) { 
		return isNumber( obj ) ? !( obj % 1 ) : false; 
	}, 
	
	isFloat = function ( obj ) { 
		return isNumber( obj ) ? !!( obj % 1 ) : false; 
	}, 
	
	isNumeric = function ( obj ) { 
		return isString( obj ) || isNumber( obj ) ? /^\s*\d+\.?\d*?\s*$/.test( ( obj+'' ) ) : false; 
	},
	
	isObject = function ( obj ) { 
		return obj+'' === '[object Object]';
	},
	
	isObjectLike = function ( obj ) { 
		return !!obj && !isObject( obj ) && ( typeof obj === 'object' || isFunction( obj ) );
	},
	
	isFunction = function ( obj ) { 
		// Opera can't handle a wrapped 'return typeof === "function"'
		return {}.toString.call( obj ) === '[object Function]'; 
	},
	
	isElement = function () { 
		if ( !msie ) {
			return function ( obj ) {
				return isObjectLike( obj ) && !isArray( obj ) && 
					/^\[object HTML[A-Za-z]*Element\]$/.test( obj+'' );
			}
		} 
		return function ( obj ) {
			return isObjectLike( obj ) && !!obj.nodeName && obj.nodeType === 1; 
		};
	}(),
	
	isNodeList = function () { 
		if ( !msie ) {
			return function ( obj ) {
				return isArrayLike( obj ) && /^\[object (HTMLCollection|NodeList)\]$/.test( obj+'' );
			}
		} 
		return function ( obj ) {
			return isArrayLike( obj ) && !!obj.item; 
		};
	}(),
	
	isArray = function ( obj ) { 
		return {}.toString.call( obj ) === '[object Array]'; 
	},	
	
	isArrayLike = function ( obj ) { 
		return isObjectLike( obj ) && !isObject( obj ) && 
			!isArray( obj ) && !isFunction( obj ) && isInteger( obj.length ); 
	},	
	
	inArray = function ( obj, arr ) { 
		return arr.indexOf( obj ) !== -1; 
	},
	
	toArray = function ( obj ) {
		var result = [], n = obj.length, i = 0;
		for ( i; i < n; i++ ) { 
			result[i] = obj[i]; 
		}
		return result;
	},
	
	// return false for empty strings, arrays or objects
	//
	empty = function ( arg ) {
		if ( isString( arg ) ) {
			return /^\s*$/.test( arg );
		}
		else if ( isArray( arg ) ) {
			return !arg.length;
		}
		else if ( isObject( arg ) ) {
			return !Object.keys( arg ).length;
		}
		return !arg;
	},
	
	// extend objects with the option to not overwrite defined members
	//
	extend = function ( a, b, overwrite ) {
		for ( var mem in b ) {
			if ( isUndefined( a[mem] ) || isDefined( a[mem] ) && overwrite !== false ) {
				a[mem] = b[mem];
			}
		}
		return a;
	},
	
	// console api wrappers
	//
	createLogger = function ( method ) {
		if ( win.console && win.console[method] ) {  	
			return function () {
				win.console[method].apply( win.console, toArray( arguments ) ); 
			};
		}
		return functionLit;
	},
	log = createLogger('log'),
	logError = createLogger('error'),
	logWarn = createLogger('warn'),
	logInfo = createLogger('info');
		
extend( J, {
	browser: browser,
	isDefined: isDefined,
	isUndefined: isUndefined,
	isNull: isNull,
	isBoolean: isBoolean,
	isString: isString,
	isNumber: isNumber,
	isInteger: isInteger,
	isFloat: isFloat,
	isNumeric: isNumeric,
	isObject: isObject,	
	isFunction: isFunction,
	isElement: isElement,
	isNodeList: isNodeList,
	isArray: isArray,
	toArray: toArray,
	empty: empty,
	extend: extend,	
	log: log,
	logError: logError,
	logWarn: logWarn,
	logInfo: logInfo
});
