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
	
	isNodeList = function (obj) { 
		return !!obj && !!obj.item && isNumber( obj.length ); 
	},
	
	isNull = function (obj) { 
		return obj === null; 
	},
	
	isBoolean = function (obj) { 
		return typeof obj === 'boolean'; 
	},
	
	isArray = function (obj) { 
		return {}.toString.call(obj) === '[object Array]'; 
	},	
	
	inArray = function ( obj, arr ) { 
		return arr.indexOf( obj ) !== -1; 
	},
	
	toArray = function (obj) {
		var result = [], n = obj.length, i = 0;
		for ( i; i < n; i++ ) { 
			result[i] = obj[i]; 
		}
		return result;
	},
	
	defineClass = function ( name, opts ) {
		var Class = opts.__init || function () {},
			Static = opts.__static || {},
			Extends = opts.__extends,
			Prototype = Class.prototype; 
		extend( Prototype, defineClassAbstract );
		( isArray( Extends ) ? Extends : 
			( Extends ? [ Extends ] : [] ) ).each( function ( obj ) {
			extend( Prototype, obj.prototype ); 
			Class.__parent = obj;
		});
		extend( Class, Static );
		Class.__name = name;
		['__init', '__static', '__extends'].each( function ( mem ) {
			delete opts[mem];
		});
		extend( Prototype, opts );
		Prototype.constructor = Class;
		J[name] = Class;
		return Class;
	},
	
	defineClassAbstract = {
		
		fireEvent: function () {
			var args = toArray( arguments ),
				event = 'on' + args.shift().replace( /^\w/, function ( m ) { 
					return m.toUpperCase(); 
				}),
				func = this[event];
			// If no argument is specified we just pass in the object as default
			if ( !args.length ) {
				args.push( this );
			}
			return func ? func.apply( this, args ) : false;
		},
		
		isInstanceOf: function () {
			return this.constuctor.__name;
		},
		
		set: function ( a, b ) {
			var self = this;
			if ( isObject( a ) ) {
				return extend( self, a );;
			} 
			self[a] = b;
			return self;
		}
		
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
			if ( isUndefined( a[mem] ) || isDefined( a[mem] ) && overwrite !== false ) {
				a[mem] = b[mem];
			}
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
	isNodeList: isNodeList,
	isNull: isNull,
	isObject: isObject,
	isArray: isArray,
	toArray: toArray,
	defineClass: defineClass,
	browser: browser,
	extend: extend,	
	log: log,
	logError: logError,
	logWarn: logWarn,
	logInfo: logInfo
});
