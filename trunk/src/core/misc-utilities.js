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
