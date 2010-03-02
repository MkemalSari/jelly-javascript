/**

Initialization of JELLY namespace. 
Base set of shortcuts and utility functions.

*/
var J = window.JELLY = { __JELLY: 1.13 },
	// Shortcuts
	win = window,
	doc = win.document,
	nav = win.navigator,
	ua = nav.userAgent,
	docRoot = doc.documentElement,
	docHead = doc.getElementsByTagName( 'head' )[0],
	standardEventModel = 'addEventListener' in doc,
	querySelectorAll = 'querySelectorAll' in doc,
	functionLit = function () {},
	
	/**
	Browser detection
	*/	
	browser = function () {
		var activex = 'ActiveXObject' in win,
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
	
	/**
	Platform detection
	*/	
	platform = function () {
		var obj = {};
		obj[ ( /mac|win|linux/i.exec( nav.platform ) || [ 'unknown' ] )[0].toLowerCase() ] = true;
		return obj;
	}(),
	
	objToString = {}.toString,
	
	/**
	Check if object is defined
	*/	
	isDefined = function ( obj ) { 
		return typeof obj !== 'undefined'; 
	},
	
	/**
	Check if object is <undefined>
	*/	
	isUndefined = function ( obj ) { 
		return typeof obj === 'undefined'; 
	},
	
	/**
	Check if object is <null>
	*/	
	isNull = function ( obj ) { 
		return obj === null; 
	},
	
	/**
	Check if object is a boolean
	*/
	isBoolean = function ( obj ) { 
		return typeof obj === 'boolean'; 
	},
	
	/**
	Check if object is a string
	*/
	isString = function ( obj ) { 
		return typeof obj === 'string'; 
	},
	
	/**
	Check if object is a number
	*/
	isNumber = function ( obj ) { 
		return typeof obj === 'number'; 
	},
	
	/**
	Check if object is an integer
	*/
	isInteger = function ( obj ) { 
		return isNumber( obj ) ? !( obj % 1 ) : false; 
	}, 
	
	/**
	Check if object is a floating number
	*/
	isFloat = function ( obj ) { 
		return isNumber( obj ) ? !!( obj % 1 ) : false; 
	}, 
	
	/**
	Check if object is numeric; strings or numbers accepted
	*/
	isNumeric = function ( obj ) { 
		return isString( obj ) || isNumber( obj ) ? /^\s*\d+\.?\d*?\s*$/.test( ( obj+'' ) ) : false; 
	},
	
	/**
	Check if object is an object literal (an instance of <Object>)
	*/
	isObject = function ( obj ) { 
		return obj+'' === '[object Object]';
	},
	
	/**
	Check if object is an object (excluding <null>) and is not an instance of <Object>
	*/
	isObjectLike = function ( obj ) { 
		return !!obj && !isObject( obj ) && ( typeof obj === 'object' || isFunction( obj ) );
	},
	
	/**
	Check if object is an instance of <Function>
	*/
	isFunction = function ( obj ) { 
		// Opera can't handle a wrapped 'return typeof === "function"'
		return objToString.call( obj ) === '[object Function]'; 
	},
	
	/**
	Check if object is an HTML Element
	*/
	isElement = function () {
		if ( !msie ) {
			return function ( obj ) {
				return /^\[object HTML[A-Za-z]*Element\]$/.test( objToString.call( obj ) );
			};
		} 
		return function ( obj ) {
			return isObjectLike( obj ) && !!obj.nodeName && obj.nodeType === 1; 
		};

	}(),
	
	/**
	Check if object is an HTML Node List
	*/
	isNodeList = function () { 
		if ( !msie ) {
			return function ( obj ) {
				return /^\[object (HTMLCollection|NodeList)\]$/.test( objToString.call( obj ) );
			};
		} 
		return function ( obj ) {
			return isObjectLike( obj ) && !isObject( obj ) && 
				!isArray( obj ) && !isFunction( obj ) && isInteger( obj.length ) && !!obj.item; 
		};
	}(),
	
	/**
	Check if object is an instance of <Array>
	*/
	isArray = function ( obj ) { 
		return Array.isArray( obj ); 
	},	
	
	/**
	Check for the existance of an object in an array
	*/
	inArray = function ( obj, arr ) { 
		return arr.indexOf( obj ) !== -1; 
	},

	/**
	Convert enumerable object to an array
	*/
	toArray = function ( obj ) {
		var result = [], n = obj.length, i = 0;
		for ( i; i < n; i++ ) { 
			result[i] = obj[i]; 
		}
		return result;
	},
	
	/**
	Check to see if object is empty; works for instances of <Object>, <Array> and <String>
	*/
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
	
	/**
	Returns a function wrapper with negated return values, useful for <Array> filter 
	
	@example 
	' foo, 12.1 bar 101 '.split( ' ' ).map( parseFloat ).filter( negate( isNaN ) )
	>>> [ 12.1, 101 ]
	*/
	negate = function ( fn ) {
		return function () {
			return !fn.apply( this, arguments );
		}
	},	
	
	/**
	Returns function wrapper with optional preset arguments, useful for <Array> map 
	
	@example 
	' foo, bar '.split( ',' ).map( String.trim ).map( preset( String.split, '' ) )
	>>> [ ['f','o','o'], ['b','a','r'] ]
	*/
	preset = function () {
		var args = toArray( arguments ),
			fn = args.shift();
		return function ( item ) {
			return fn.apply( this, [ item ].concat( args ) );
		};
	},
		
	/**
	Extend objects with the option to not overwrite defined members
	*/
	extend = function ( a, b, overwrite ) {
		for ( var mem in b ) {
			if ( isUndefined( a[ mem ] ) || isDefined( a[ mem ] ) && overwrite !== false ) {
				a[ mem ] = b[ mem ];
			}
		}
		return a;
	},
	
	/**
	Generic iterator function; works for objects, arrays and nodelists
	*/
	enumerate = function ( obj, callback ) {
		if ( isObject( obj ) ) {
			for ( var key in obj ) { 
				callback.call( obj, key, obj[ key ] ); 
			}
		}
		else if ( obj.length ) {
			for ( var i = 0; i < obj.length; i++ ) { 
				callback.call( obj, obj[ i ], i ); 
			}
		}
	},
	
	/**
	Defer function calls; equivilant to setTimeout( myfunc, 0 )
	*/
	defer = function () {
		var args = toArray( arguments ),
			func = args.shift(),
			scope = args.shift() || {};
		return setTimeout( function () { func.apply( scope, args ); }, 0 );
	},
	
	createLogger = function ( method ) {
		var console = win.console;
		if ( console && console[ method ] && console[ method ].apply ) {  	
			return function () {
				console[ method ].apply( console, toArray( arguments ) ); 
			};
		}
		return functionLit;
	},
	/**
	console.log wrapper
	*/
	log = createLogger( 'log' ),
	/**
	console.warn wrapper
	*/
	logWarn = createLogger( 'warn' ),
	/**
	console.error wrapper
	*/
	logError = createLogger( 'error' );
		
extend( J, {
	win: win,
	doc: doc,
	docRoot: docRoot, 
	docHead: docHead,
	functionLit: functionLit,
	browser: browser,
	platform: platform,
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
   	inArray: inArray,
	toArray: toArray,
	empty: empty,
	negate: negate,	
	preset: preset,
	extend: extend,	
	enumerate: enumerate,
	defer: defer,
	log: log,
	logWarn: logWarn,
	logError: logError	
});
