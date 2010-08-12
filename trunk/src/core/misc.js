/**

Various utilities

*/
var getViewport = function () {
		if ( isDefined( docRoot.clientWidth ) && docRoot.clientWidth !== 0 ) { 
			return function () {
				return [ docRoot.clientWidth, docRoot.clientHeight ];
			};
		}
		return function () {
			return [ doc.body.clientWidth || 0, doc.body.clientHeight || 0 ];
		};
	}(),

	getWindowScroll = function () {
		if ( isDefined( win.pageYOffset ) ) {
			return function () {
				return [ win.pageXOffset, win.pageYOffset ];
			};
		} 
		return function () {
			if ( isDefined( docRoot.scrollTop ) && 
				( docRoot.scrollTop > 0 || docRoot.scrollLeft > 0 ) ) {
				return [ docRoot.scrollLeft, docRoot.scrollTop ];
			}
			return [ doc.body.scrollLeft, doc.body.scrollTop ];
		};
	}(),
	
	parseQuery = function ( el ) {
		el = el || win.location;
		var data = {};
		if ( /\?/.test( el.href ) ) {
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
	
	/**
	Handle multiple input types from the argument list and return a queryString
	*/
	buildQuery = function () {
		var append = function ( name, value ) {
				if ( !name ) { return; } 
				data.push( name + '=' + encodeURIComponent(value).replace(/%20/g, '+') );
			}, 
			parseElement = function ( el ) {
				if ( !isElement( el ) || !/^(input|textarea|select)$/i.test(el.nodeName) ) {
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
			},
			args = toArray( arguments ),
			data = [];
			
		args.each( function ( arg ) {
			// Object literals
			if ( isObject( arg ) ) {
				for ( var key in arg ) { 
					append( key, arg[key] ); 
				}
			}
			// Arrays and NodeLists
			else if ( arg.length ) {
				( isArray( arg ) ? arg : toArray( arg ) ).each( parseElement );
			}
			// Element ID's, elements, or raw query data
			else if ( isString( arg ) || isElement( arg ) ) {
				var el = getElement( arg );
				if ( el ) {
					// Parse element and all its children
					parseElement( el );
					J.Q( el, 'textarea,input,select' ).each( parseElement );
				}
				else {
					data.push( arg );
				}
			}
		});
		return data.join( '&' );
	},
	
	/**
	Convert a pixel value into typographical ems; requires a base font-size (in pixels) for calculation, 
	which can be passed as a literal value or as a reference element to be parsed for computed font-size
	*/
	pxToEm = function ( pixel, base ) {
		var defaultBase = 16, 
			parsedBase;
		base = base || defaultBase;
		parsedBase = parseInt( base, 10 );
		if ( isNaN( parsedBase ) ) {
			base = getComputedFontSize( el ) || defaultBase;
		} 
		return pixel / base;
	},


	/**
	Get a supported CSS property using vendor prefix or not. Returns false if no property is found
		
	@example
	var borderRadius = getVendorStyleProperty( 'border-radius' );
	>>> something like 'borderRadius' or 'MozBorderRadius'
	
	*/
	getVendorStyleProperty = function ( prop ) {
		var self = getVendorStyleProperty;
		self.cache = self.cache || {};
		if ( prop in self.cache ) {
			return self.cache[ prop ];
		} 
		var propCamel = camelize( prop ), 
			cases = [ propCamel ].concat( 
				[ 'Webkit', 'Moz', 'O', 'Ms' ].map( function ( prefix ) {
					return prefix + capitalize( propCamel );
				})),
			result = false,
			i = 0;
		for ( ; i < cases.length; i++ ) {
			if ( cases[i] in docRoot.style ) {
				result = cases[i];
				break;
			}
		}
		self.cache[ prop ] = result;
		return result;
	};


extend( J, {
	getViewport: getViewport,
	getWindowScroll: getWindowScroll,
	pxToEm: pxToEm,
	parseQuery: parseQuery,
	buildQuery: buildQuery,
	getVendorStyleProperty: getVendorStyleProperty
});
