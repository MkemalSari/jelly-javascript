/**

Elements

@description 
	Utility functions for working with elements and manipulating the DOM

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
		el.className = normalize( el.className.replace( patt, ' ' ) );
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
	
	getElements = function ( a, b ) { 
		return ( b ? getElement( a ) : doc ).getElementsByTagName( b || a ); 
	},

	createElement = function ( arg, attrs ) {
		var el;
		if ( !/[#:\.]/.test(arg) ) {
			el = doc.createElement(arg), key;
			for ( key in attrs ) {
				switch (key) {
					case 'setHTML': 
						el.innerHTML = attrs[key]; 
						break;
					case 'setText': 
						el.appendChild( doc.createTextNode( attrs[key] ) ); 
						break;
					case 'class': 
						el.className = attrs[key]; 
						break;
					case 'style': 
						el.style.cssText = attrs[key]; 
						break;
					default: 
						el.setAttribute( key, attrs[key] );
				}
			}
		} 
		else {
			var arg = arg.trim(),
				stringKey = '__JELLY_CE__',
				stringTokens = [], 
				m;
			while ( m = /('|")([^\1]*?)\1/.exec( arg ) ) {
				arg = arg.replace( m[0], stringKey );
				stringTokens.push( m[2] );
			}
			arg = arg.replace( /\s*(:|,)\s*/g, '$1' );
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
		if ( !el ) {
			return xy;
		} 
		if ( 'getBoundingClientRect' in el ) {
			var bounds = el.getBoundingClientRect(),
				winScroll = getWindowScroll(),
				left = bounds.left,
				top = bounds.top;
			xy = [ left + winScroll[0], top + winScroll[1] ];
		} 
		else {
			xy = [ el.offsetLeft, el.offsetTop ];
			while ( el = el.offsetParent ) {
				xy[0] += el.offsetLeft;
				xy[0] += parseInt( getStyle( el, 'border-left-width' ) ) || 0;
				xy[1] += el.offsetTop;
				xy[1] += parseInt( getStyle( el, 'border-top-width' ) ) || 0;
			}
		}
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
					case 'class': 
						return node.className || null;
					case 'href': 
					case 'src': 
						return node.getAttribute( attr, 2 ) || null;						
					case 'style': 
						return node.getAttribute( attr ).cssText.toLowerCase() || null;
					case 'for': 
						return node.attributes[attr].nodeValue || null;
				}
				return node.getAttribute( attr ) || null;
			};
		}
		return function ( node, attr ) { 
			return node.getAttribute( attr ); 
		};
	}(),
	
	getStyle = function ( el, prop ) {
		var val, prop = camelize( prop );
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
	
	setStyle = function ( el, a, b ) {
		var set = function ( prop, value ) {
				if ( prop === 'float' ) {
					prop = 'cssFloat';
				}
				if ( prop === 'opacity' ) {
					setOpacity( el, value );	
				}
				else {
					el.style[camelize( prop )] = value;
				}
			},
			prop;
		if ( isObject( a ) ) {	
			for ( prop in a ) {
				set( prop, a[prop] );
			}
		}
		else if ( b ) {
			set( a, b );			
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
	getElements: getElements,	
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
	setStyle: setStyle,
	setOpacity: setOpacity,
	storeData: storeData,
	retrieveData: retrieveData,
	removeData: removeData
});
