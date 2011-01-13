/**
 @! Utilities for working with DOM elements 

 Add a class to an element's classList
 @param {element} element
 @param {string} classname
 */
var addClass = function ( el, cn ) {
		if ( !( el = getElement( el ) ) ) return;
		if ( hasClass( el, cn ) ) return;
		el.className += el.className ? ' ' + cn : cn;
	}, 

	/**
	 Remove a class from an element's classList
	 @param {element} element
	 @param {string} classname
	 */	
	removeClass = function ( el, cn ) {
		if ( !( el = getElement( el ) ) ) return;
		if ( el.className == '' ) return;
		var patt = new RegExp( '(^|\\s)' + cn + '(\\s|$)' );
		el.className = el.className.replace( patt, ' ' );
	},
	
	/**
	 Test an element for a class in its classList
	 @param {element} element
	 @param {string} classname
	 */
	hasClass = function ( el, cn ) {
		if ( !( el = getElement( el ) ) ) return; 
		var elCn = el.className;
		return elCn != '' && 
			( elCn == cn || new RegExp( '(^|\\s)' + cn + '(\\s|$)' ).test( elCn ) );
	},
	
	/**
	 Toggle a class in an element's classList
	 @param {element} element
	 @param {string} classname
	 */	
	toggleClass = function ( el, cn ) {
		if ( !( el = getElement( el ) ) ) return;
		if ( hasClass( el, cn ) ) { 
			removeClass( el, cn ); 
		} 
		else { 
			addClass( el, cn ); 
		}
	},
	
	/**
	 Versatile element creation 
	 
	 @param {string} arg1 The selector string
	 @param {object} [arg2] Text/HTML content or options object
	 @return {element} The new element
	 @example 
		 createElement( 'div' );
		 // <div></div>
	
		 createElement( '#foo', 'Hello!' );
		 // <div id="foo">Hello!</div>
	
		 createElement( 'img#bar', {src:'path/to/img.jpg', alt:''});
		 // <img id="foo" src="path/to/img.jpg" alt="" />
	
		 createElement( 'img#bar src:path/to/img.jpg, alt:""' );
		 // <img id="foo" src="path/to/img.jpg" alt="" />
	
	 */
	createElement = function ( arg, arg2 ) {
		var el;
		if ( !/[#:\.]/.test( arg ) ) {
			// Simple tag
			el = doc.createElement( arg );
		} 
		else {
			// CSS selector string
			var extract = extractLiterals( arg ),
				parts = extract.string.trim().replace( /\s*(:|,)\s*/g, '$1' ).split( ' ' ),
				first = parts.shift(),
				leadId = contains( first, '#' ),
				leadClass = contains( first, '.' ),
				type = 'div',
				attributes = {},
				branchMapData = null,
				tmp;
			if ( leadId || leadClass ) {
				tmp = leadId ? first.split( '#' ) : first.split( '.' ); 
				type = tmp.shift() || type;
				attributes[ leadId ? 'id':'class' ] = tmp.join( ' ' );
			} 
			else {
				type = first;
			}
			if ( parts[0] ) {
				parts[0].split( ',' ).each( function ( tkn ) {
					tkn = tkn.split( ':' );
					var value = extract.match( tkn[1] );
					if ( tkn[0] === '@' ) {
						branchMapData = value;
					} 
					else {
						attributes[ tkn[0] ] = value;
					}
				});
			} 
			el = createElement( type.toLowerCase(), attributes );
		}
		
		// Second argument options:
		if ( !arg2 ) {
			return el;
		}
		else if ( arg2 === true ) {
			// Called from createBranch if boolean 'true'
			return { elem: el, ref: branchMapData };
		}
		else if ( isString( arg2 ) ) {
			// Text argument
			el.innerHTML = arg2; 
		}
		else if ( isObjLiteral( arg2 ) ) {
			// Properties object
			for ( var key in arg2 ) {
				switch ( key ) {
					case 'html': 
					case 'text': 
						el.innerHTML = arg2[ key ]; 
						break;
					case 'class': 
						el.className = arg2[ key ]; 
						break;
					case 'style': 
						el.style.cssText = arg2[ key ]; 
						break;
					default: 
						el.setAttribute( key, arg2[ key ] );
				}
			}
		}
		return el;
	},

	/**
	Create branches of DOM elements 
	
	@reference http://the-echoplex.net/log/dom-branching
	@param {mixed} ...
	@return {object} See example
	@example
		var branch = createBranch( 
		    '#widget-foo',  
		        '.content @:content' 
		   );
		// {
		//   root   : #widget-foo,
		//   div    : [ #widget-foo, .content ],
		//   content: [ .content ]
		// }
	 */
	createBranch = function () {
		var args = toArray( arguments ),
			res = {},
			context,
			parseToken = function ( arg ) {
				if ( !arg ) {
					return;
				}
				if ( !isString( arg ) ) { 
					if ( isElement( arg ) ) { 
						return arg; 
					}
					else if ( isObjLiteral( arg ) ) {
						if ( isElement( arg.root ) ) {
							// It's another branch so merge it
							for ( var key in arg ) {
								if ( isArray( arg[ key ] ) ) {
									var nodeName = arg[ key ][0].nodeName.toLowerCase();
									res[ nodeName ] = res[ nodeName ] || [];
									arg[ key ].each( function ( el ) { 
										res[ nodeName ].push( el ); 
									});
								} 
								else if ( key !== 'root' ) { 
									res[ key ] = arg[ key ]; 
								}
							} 
							return arg.root;
						}
					} 
					return; 
				} 
				var obj = createElement( arg, true ),
					elem = obj.elem,
					type = elem.nodeName.toLowerCase();
				res[ type ] = res[ type ] || [];
				res[ type ].push( elem );
				if ( obj.ref ) { res[ obj.ref ] = elem; }
				return elem;
			};
		res.root = context = parseToken( args.shift() );
		args.each( function ( feed ) {
			if ( !isArray( feed ) ) { 
				context = context.appendChild( parseToken( feed ) ); 
			} 
			else { 
				feed.each( function ( o ) { 
					context.appendChild( parseToken( o ) ) 
				}); 
			}
		});
		return res;
	},
	
	/**
	 Get an element by ID
	 @param {string|element} object
	 @return {element}
	 */
	getElement = function ( obj ) { 
		if ( !msie || msie > 7 ) {
			return function ( obj ) {
				return isString( obj ) ? doc.getElementById( obj ) : obj; 
			};
		}
		else {
			return function ( obj ) {
				if ( isString( obj ) ) { 
					var el = doc.getElementById( obj ); 
					if ( el && el.id !== obj ) {
						var named = doc.getElementsByName( obj ), n = named.length, i = 0; 
						for ( i; i < n; i++ ) {
							if ( named[ i ].id === obj ) {
								return named[ i ];
							} 
						}
						return null;
					}
					return el;
				}
				return obj;
			};
		}
	}(),
	
	/**
	 Get elements by tag name
	 @param {string} tag
	 @param {object} [context]
	 @return {nodeList}
	 */
	getElements = function ( tag, context ) { 
		context = context ? getElement( context ) : doc;
		return context && context.getElementsByTagName( tag ); 
	},
	
	/**
	 Wrap an element in another element
	 @param {object} element
	 @param {element} wrapper
	 @return {element}
	 */
	wrapElement = function ( el, wrapper ) {
		if ( !( el = getElement( el ) ) ) return;
		var pnt = el.parentNode, next = el.nextSibling;
		wrapper.appendChild( el );
		return next ? pnt.insertBefore( wrapper, next ) : pnt.appendChild( wrapper );	
	},
	
	/**
	 Find an element, then apply a callback scoped to the element
	 @param {object} element
	 @param {function} callback
	 */
	withElement = function ( el, callback ) {
		if ( !( el = getElement( el ) ) ) return;
		return callback.call( el, el );
	},
	
	/**
	 Replace an element
	 @param {object} element
	 @param {element} replacement
	 @return {element} The replacement element
	 */
	replaceElement = function ( el, replacement ) {
		if ( !( el = getElement( el ) ) ) return;
		return el.parentNode.replaceChild( replacement, el );
	},

	/**
	 Remove an element
	 @param {object} element
	 @return {element} The removed element
	 */	
	removeElement = function ( el ) {
		if ( !( el = getElement( el ) ) ) return;
		return el.parentNode.removeChild( el );
	},
	
	/**
	 Remove an element's children
	 @param {object} element
	 @return {array} The element's children
	 */
	removeChildren = function ( el ) {
		if ( !( el = getElement( el ) ) ) return;
		var children = getChildren( el );
		children.each( removeElement );
		return children;
	}, 
	
	/**
	 Insert an element before another element
	 @param {object} element
	 @param {object} reference
	 @return {element} The inserted element
	 */
	insertElement = function ( el, reference ) {
		if ( !( el = getElement( el ) ) ) return;
		return ( getElement( reference ) || doc.body ).appendChild( el );
	},
	
	/**
	 Insert an element at the top of another element
	 @param {object} element
	 @param {object} reference
	 @return {element} The inserted element
	 */
	insertTop = function ( el, reference ) {
		if ( !( el = getElement( el ) ) || !( reference = getElement( reference ) ) ) return;
		if ( reference.firstChild ) { 
			return reference.insertBefore( el, reference.firstChild ); 
		}
		else { 
			return reference.appendChild( el ); 
		}
	},
	
	/**
	 Insert an element before another element
	 @param {object} element
	 @param {object} reference
	 @return {element} The inserted element
	 */
	insertBefore = function ( el, reference ) {
		if ( !( el = getElement( el ) ) || !( reference = getElement( reference ) ) ) return;
		return reference.parentNode.insertBefore( getElement( el ), reference );
	},
	
	/**
	 Insert an element after another element
	 @param {object} element
	 @param {object} reference
	 @return {element} The inserted element
	 */
	insertAfter = function ( el, reference ) {
		if ( !( el = getElement( el ) ) || !( reference = getElement( reference ) ) ) return;
		var next = J.getNext( reference );
		if ( next ) { 
			return reference.parentNode.insertBefore( el, next ); 
		} 
		else { 
			return reference.parentNode.appendChild( el ); 
		}
	},
	
	/**
	 Get an element's first child element
	 @param {object} element
	 @return {element} The first child element
	 */
	getFirst = function ( el ) {
		el = el.firstChild;
		while ( el && el.nodeType !== 1 ) {
			el = el.nextSibling;
		}
		return el;
	},
	
	/**
	 Get an element's last child element
	 @param {object} element
	 @return {element} The last child element
	 */	
	getLast = function ( el ) {
		el = el.lastChild;
		while ( el && el.nodeType !== 1 ) {
			el = el.previousSibling;
		}
		return el;
	},
	
	/**
	 Get an element's next sibling element
	 @param {object} element
	 @return {element} The next sibling element
	 */	
	getNext = function ( el ) {
		el = el.nextSibling;
		while ( el && el.nodeType !== 1 ) {
			el = el.nextSibling;
		}
		return el;
	},
	
	/**
	 Get an element's previous sibling element
	 @param {object} element
	 @return {element}
	 */	
	getPrevious = function ( el ) {
		el = el.previousSibling;
		while ( el && el.nodeType !== 1 ) {
			el = el.previousSibling;
		}
		return el;
	},

	/**
	 Get an element's children elements
	 @param {object} element
	 @return {array}
	 */
	getChildren = function ( el ) {
		var elements = [], el = el.firstChild;
		while (el) {
			if ( el.nodeType == 1 ) {
				elements[ elements.length ] = el;
			}
			el = el.nextSibling;
		}
		return elements;
	},
	
	/**
	 Get an element's left/top values relative to the browser
	 @param {object} element
	 @return {array} The left and top (X and Y) values
	 */
	getXY = function ( el ) {
		if ( !( el = getElement( el ) ) ) return;
		var xy = [ 0, 0 ];
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

	/**
	 Set an element's left and top
	 @param {object} element
	 @param {object} X_coordinate
	 @param {object} Y_coordinate
	 @param {string} [unit|px]
	 */
	setXY = function ( el, X, Y, unit ) {
		if ( !( el = getElement( el ) ) ) return;
		unit = unit || 'px';
		el.style.left = X + unit;
		el.style.top = Y + unit;
	},
	
	/**
	 Get an element's left value
	 @param {object} element
	 @return {number}
	 */
	getX = function ( el ) {
		return getXY( el )[0];
	},
	
	/**
	 Set an element's left value
	 @param {object} element
	 @param {object} X_coordinate
	 @param {string} [unit|px]
	 */
	setX = function ( el, X, unit ) {
		( getElement( el ) ).style.left = X + ( unit || 'px' );
	},

	/**
	 Get an element's top value
	 @param {object} element
	 @return {number}
	 */	
	getY = function (el) {
		return getXY( el )[1];
	},
	
	/**
	 Set an element's top value
	 @param {object} element
	 @param {object} Y_coordinate
	 @param {string} [unit|px]
	 */
	setY = function ( el, Y, unit ) {
		( getElement( el ) ).style.top = Y + ( unit || 'px' );
	},
	
	/**
	 Get an element's attribute value (wrapper for legacy internet explorer)
	 @param {element} element
	 @param {string} attribute
	 @return {string}
	 */
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
	
	getComputedStyleSupport = 'getComputedStyle' in win,
	
	/**
	 Get an element's style value (returns current CSS value in IE < 9)
	 @param {element} element
	 @param {string} property
	 @return {string}
	 */
	getStyle = function () {
		if ( getComputedStyleSupport ) {
			return function ( el, prop ) {
				return win.getComputedStyle( el, null )[ camelize( prop ) ]; 
			};
		}
		return function ( el, prop ) {
			prop = camelize( prop );
			var elStyle = el.style;
			if ( prop === 'opacity' && elStyle.opacity === '' ) { 
				elStyle.opacity = 1; 
				return 1;
			}
			return el.currentStyle[ prop ]; 
		};
	}(),

	/**
	 Get the computed font-size for an element in pixels
	 @param {element} element
	 @return {number}
	 */
	getComputedFontSize = function ( el ) {
		if ( !( el = getElement( el ) ) ) return;
		if ( getComputedStyleSupport ) {
			return parseInt( win.getComputedStyle( el, null ).fontSize );
		}
		else {
			var testElement = getComputedFontSize.el = 
					getComputedFontSize.el || 
					createElement( 't text:x,style:"line-height:1;font-size:100%;position:absolute"' );
			insertElement( testElement, el );
			var result = testElement.offsetHeight;
			removeElement( testElement );
			return result;
		}
	},

	/**
	 Set an element's style
	 @param {element} element
	 @param {string} property
	 @param {object} value
	 */
	setStyle = function ( el, a, b ) {
		if ( !( el = getElement( el ) ) ) return;
		var set = function ( prop, value ) {
				if ( prop === 'float' ) {
					prop = 'cssFloat';
				}
				if ( prop === 'opacity' ) {
					setOpacity( el, value );	
				}
				else {
					el.style[ camelize( prop ) ] = value;
				}
			},
			prop;
		if ( isObjLiteral( a ) ) {	
			for ( prop in a ) {
				set( prop, a[prop] );
			}
		}
		else {
			set( a, isDefined( b ) ? b : '' );			
		}
	},
	
	/**
	 Set an element's opacity
	 @param {element} element
	 @param {object} value Between 0 and 1
	 */
	setOpacity = function () {
		if ( 'opacity' in docRoot.style ) {
			return function ( el, val ) {
				var elStyle = el.style;
				if ( elStyle.opacity === '' ) {
					elStyle.opacity = 1;
				}
				elStyle.opacity = val;
			};
		}
		return function ( el, val ) {
			var elStyle = el.style;
			if ( isUndefined( elStyle.opacity ) ) {
				elStyle.opacity = 1;
				elStyle.zoom = 1;
			}
			elStyle.filter = val === 1 ? '' : 'alpha(opacity=' + ( val * 100 ) + ')';
			elStyle.opacity = val;
		};		
	}(),
	
	/**
	 Enable keyboard tabbing of any element
	 
	 @param {element} element
	 @param {bool} [makeUnTabbable|undefined]
	 @example 
	 	makeTabbable( el );
	 
	 	// reverse previous action (does not make natively tabbable elements un-tabbable)
	 	makeTabbable( el, false );
	 */
	makeTabbable = function ( el, bool ) {
		if ( bool === false ) { 
			el.removeAttribute( 'tabindex' );
			el.removeAttribute( 'tabIndex' );
		}
		else {
			el.setAttribute( 'tabindex', 0 );
			el.setAttribute( 'tabIndex', 0 );
		}
	},
	
	/**
	 Bind data to an element safely
	 @param {element} element
	 @param {string} name
	 @param {object} value
	 */
	storeData = function ( el, name, value ) {
		var cache = elementData, elementKey = cache.ns;
		if ( !( el = getElement( el ) ) ) return; 
		if ( !( elementKey in el ) ) { 
			el[ elementKey ] = elementUid(); 
			cache[ el[ elementKey ] ] = {};
		}
		cache[ el[ elementKey ] ][ name ] = value;
	},

	/**
	 Retrieve data bound to an element with #stoteData
	 @param {element} element
	 @param {string} name
	 @return {object}
	 */
	retrieveData = function ( el, name ) {
		var cache = elementData, elementKey = cache.ns;
		if ( !( el = getElement( el ) ) ) return;
		if ( elementKey in el && el[ elementKey ] in cache ) {
			return cache[ el[ elementKey ] ][ name ];
		}
		return null;
	},
	
	/**
	 Remove data bound to an element with #stoteData
	 @param {element} element
	 @param {string} name
	 */
	removeData = function ( el, name ) {
		var cache = elementData, elementKey = cache.ns;
		if ( !( el = getElement( el ) ) ) return;
		if ( elementKey in el && el[ elementKey ] in cache ) {  
			delete cache[ el[ elementKey ] ][ name ];
		}
	},
	
	elementData = { ns:'jelly_' + ( +new Date ) },
	
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
	getComputedFontSize: getComputedFontSize,
	setStyle: setStyle,
	setOpacity: setOpacity,
	makeTabbable: makeTabbable,
	storeData: storeData,
	retrieveData: retrieveData,
	removeData: removeData
});