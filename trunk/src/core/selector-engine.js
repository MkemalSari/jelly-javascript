/**

Selector Engine

@description 
	A fast cross-browser interface for querying the DOM with CSS selectors

*/
(function () {
	
	var	pushToStack = function ( value ) {
			stack[stack.length] = value;
		},
		
		unMark = function ( group ) {
			for ( var i = 0, n = group.length; i < n; i++ ) {
				group[i][uniqueKey] = null;
			}
		},
		
		filterUnique = function ( group ) {
			var el, 
				n = group.length, 
				uniques = [];
			while (n) {
				el = group[--n];
				if ( !el[uniqueKey] ) {
					el[uniqueKey] = true;
					uniques[uniques.length] = el;
				}
			}
			n = uniques.length;
			while (n) {
				uniques[--n][uniqueKey] = null;
			}
			return uniques.reverse();
		},
		
		/*====================================
			selector parsing
		=====================================*/
		
		parseTokenComponent = function ( part, fetchOrFilter ) {
			var obj = { 
					mode: fetchOrFilter ? _fetch_ : _filter_, 
					not: false,
					type: _id_
				};
			if ( /^(\w+)?#\w/.test( part ) ) {
				obj.val = part.split('#');
			} 
			else if ( /^\w+|\*$/.test( part ) ) {
				obj.type = _tag_; 
				obj.val = part;
			} 
			else if ( /^\.\w/.test( part ) ) { 
				obj.type = _class_;	
				obj.val = part.replace( /^\./, '' );
			} 
			else if ( /^\[/.test( part ) ) { 
				obj.type = _attr_;	
				obj.val = part.replace( /\[|\]/g, '' );	
			} 
			else if ( /^\+|>|~/.test( part ) ) { 
				obj.type = _combi_; 
				obj.val = part;			
			} 
			else if ( /:not\(/.test( part ) ) {
				obj = parseTokenComponent( part.replace( /\:not\(|\)$/g, '' ) );
				obj.not = true;
			} 
			else if ( /^:/.test( part ) ) { 
				var _tmp = part.replace( /^:|\)$/g, '' ).split( '(' );
				obj.type = _pseudo_; 
				obj.kind = _tmp[0];
				obj.val = _tmp[1];
			} 
			return obj;
		},

		parseSelector = function ( selector ) {
			var result = [],
				// Seperate out the combinators + > ~, then split
				parts = normalize( selector.replace( /(>|~(?!=)|\+(?!\d))/g, ' $1 ' ) ).split( ' ' ),
				universal = { mode: _fetch_, type: _tag_, val: '*' },
				getByClass = 'getElementsByClassName' in doc,
				sibling = false;

			for ( var i = 0, tmp; i < parts.length; i++ ) { 
				tmp = parts[i].
						replace( /([^\(\#\.\[])(:)/g, '$1 $2' ).
						replace( /([^\(])(\[|\.)/g, '$1 $2' ).
						replace( /\:not\(\s*/g, ':not(' ).trim().split(' ');	
				for ( var j = 0, obj; j < tmp.length; j++ ) {
					obj = parseTokenComponent( tmp[j], !j );
					if ( sibling ) {
						obj.mode = _filter_;
					} 
					else if ( j === 0 && 
						( obj.type === _pseudo_ || obj.type === _attr_ || 
							( obj.type === _class_ && !getByClass ) || 
						obj.not ) ) {
						result.push( universal );
						obj.mode = _filter_;
					}
					if ( contains( tmp[j], uniqueKey ) ) {
						obj[obj.type === _attr_ ? 'spValue' : 'val'] = strings.shift();
					}
					result.push( obj );
					sibling = /^(~|\+)$/.test( obj.val );
				}
			}
			result.postFilter = !( parts.length === 1 || parts.length === 3 && /^[\+~]$/.test( parts[1] ) );
			return result;
		},	
		
		/*====================================
			ids
		=====================================*/
		
		mergeId = function ( tkn ) {
			var tag = tkn.val[0], 
				id = tkn.val[1];
				
			if ( tkn.mode === _filter_ ) { 
				for ( var i = 0, n = collection.length; i < n; i++) {
					if ( tag ) {
						if ( ( collection[i].tagName.toLowerCase() === tag && 
								collection[i].id === id ) !== tkn.not) {
							pushToStack( collection[i] );
						}
					} 
					else if ( ( collection[i].id === id ) !== tkn.not ) {
						pushToStack( collection[i] );
					}
					if ( !tkn.not && stack[0] ) {
						return;
					}
				}
			} 
			else {
				if ( !tag ) {
					stack[0] = getElement( id );
				} 
				else {
					var elem = getElement( id );
					if ( elem && elem.tagName.toLowerCase() === tag ) {
						stack[0] = elem;	
					}
				}
				if ( !firstRun && stack[0] ) {
					var flag = false;
					for ( var i = 0, n = collection.length; i < n; i++ ) {
						if ( stack[0].contains( collection[i] ) ) {
							flag = true;
							break;
						}
					}
					if ( !flag ) {
						stack[0] = null;
					}
				} 
			}
		}, 
		
		/*====================================
			tags
		=====================================*/
		
		mergeTags = function ( tkn ) {
			var extra = msie && tkn.val === '*';	
			if ( firstRun ) {
				for ( var i = 0, tags = getElements( tkn.val ), n = tags.length; i < n; i++) {
					if ( extra ) { 
						if ( tags[i].nodeType === 1 ) {
							pushToStack( tags[i] );
						}
					}
					else {
						pushToStack( tags[i] );
					}
				}
			} 
			else if ( tkn.not || tkn.mode === _filter_ ) {
				for ( var i = 0, test = tkn.val.toUpperCase(), n = collection.length; i < n; i++ ) {
					if ( ( collection[i].nodeName.toUpperCase() === test ) !== tkn.not ) {
						pushToStack( collection[i] );
					}
				}
			} 
			else {
				for ( var i = 0, n = collection.length; i < n; i++ ) {
					var tags = getElements( collection[i], tkn.val ), 
						n2 = tags.length, 
						j = 0;
					for ( j; j < n2; j++ ) {
						if ( extra ) {
							if ( tags[j].nodeType === 1 ) {
								pushToStack( tags[j] );
							}
						}
						else {
							pushToStack( tags[j] );
						}
					}
				}
			}
		},
		
		/*====================================
			class
		=====================================*/
		
		mergeClass = function ( tkn ) {
			var val = tkn.val, 
				not = tkn.not, 
				n = collection.length, 
				i = 0;
			if ( tkn.mode === _fetch_ ) {
				if ( firstRun ) {
					stack = toArray( doc.getElementsByClassName( val ) );
				} 
				else {
					for ( i; i < n; i++ ) {
						var tags = collection[i].getElementsByClassName( val ), 
							n2 = tags.length, 
							j = 0;
						for ( j; j < n2; j++ ) {
							pushToStack( tags[j] );
						}
					}
				}
			} 
			else {
				var patt = new RegExp( '(^|\\s)' + val + '(\\s|$)' ), 
					classname;
				for ( i; i < n; i++ ) {
					classname = collection[i].className;
					if ( !classname ) {
						if ( not ) {
							pushToStack( collection[i] );
						}
						continue;
					} 
					if ( patt.test( classname ) !== not ) {
						pushToStack( collection[i] );
					} 
				}
			}
		},		
		
		/*====================================
			attributes
		=====================================*/
	
		attributeTests = {
			'=': function ( attr, val ) { return attr === val; }, 
			'^=': function ( attr, val ) { return attr.indexOf( val ) === 0; }, 
			'$=': function ( attr, val ) { return attr.substr( attr.length - val.length ) === val; }, 
			'*=': function ( attr, val ) { return attr.indexOf( val ) !== -1; }, 
			'|=': function ( attr, val ) { return attr.indexOf( val ) === 0; }, 
			'~=': function ( attr, val ) { return (' ' + attr + ' ').indexOf(' ' + val + ' ') !== -1; } 
		},
		
		mergeAttribute = function ( tkn ) {
			var n = collection.length, 
				i = 0;
			if ( contains( tkn.val, '=' ) ) {
				var parts = /([\w-]+)([^=]?=)(.+)/.exec( tkn.val ), 
					attr, 
					val = isDefined( tkn.spValue ) ? tkn.spValue : parts[3];
				for ( i; i < n; i++ ) {
					attr = getAttribute( collection[i], parts[1] );
					if ( ( attr !== null && attributeTests[parts[2]]( attr, val ) ) !== tkn.not ) {
						pushToStack( collection[i] );
					}
				}
			} 
			else {
				for ( i; i < n; i++ ) {
					if ( ( getAttribute( collection[i], tkn.val ) !== null ) !== tkn.not ) {
						pushToStack( collection[i] );
					}
				}
			}
		},
		
		/*====================================
			pseudo classes
		=====================================*/
	
		mergePseudo = function ( tkn ) {
			var kind = tkn.kind,
				not = tkn.not;
			if ( /^(nth-|first-of|last-of)/.test( kind ) ) {
				stack = pseudoTests[kind]( collection, tkn ); 
			} 
			else if ( kind === 'root' && !not ) {
				stack[0] = rootElement;
			} 
			else if ( kind === 'target' && !not ) {
				var hash = win.location.href.split('#')[1] || null;
				stack[0] = getElement( hash ) || getElements( hash )[0];
			} 
			else {
				for ( var i = 0, n = collection.length; i < n; i++ ) {
					if ( pseudoTests[kind]( collection[i], tkn ) !== not ) {
						pushToStack( collection[i] );
					}
				}
			}
		},
		
		parseNthExpr = function ( expr ) {
			var obj = { mode: 'all' };
			obj.direction = expr.indexOf('-') === 0 ? 'neg' : 'pos';
			
			if ( expr === 'n' ) { 
				return obj;
			} 
			else if ( /^\d+$/.test( expr ) ) {
				obj.mode = 'child';
				obj.val = parseInt( expr, 10 );
				return obj;
			} 
			obj.mode = 'an+b';
			
			if ( /^(even|2n|2n\+2)$/.test( expr ) ) {
				obj.oddEven = 0;
			} 
			else if ( /^(odd|2n\+1)$/.test( expr ) ) {
				obj.oddEven = 1;
			}
			var pts = expr.split('n');
			obj.start = pts[1] ? parseInt( pts[1], 10 ) : 1;
			obj.jump = pts[0] && pts[0] !== '-'	? parseInt( pts[0].replace( /^\-/, '' ), 10 ) : 1;		
			return obj;
		},
		
		nthChildFilter = function ( collection, expr, ofType, last, not ) {
			expr = parseNthExpr( expr );
			if ( expr.mode === 'all' ) { return collection; }				
			var	result = [], 
				parentCache = [], 
				nodeName = collection[0].nodeName,
				testType = ofType ? 
					function (el) { return el.nodeType === 1 && el.nodeName === nodeName; } : 
					function (el) { return el.nodeType === 1; },		
				append = function ( cond ) { 
					if ( cond ) { 
						result.push( collection[i] ); 
					}
				};
			for ( var i = 0, n = collection.length, pnt, uid; i < n; i++ ) {
				pnt = collection[i].parentNode, 
				uid = 1;
				if ( !pnt[uniqueKey] ) {
					var el = pnt[ !last ? 'firstChild' : 'lastChild' ],
						direction = !last ? 'nextSibling' : 'previousSibling'; 
					for ( el; el; el = el[direction] ) {
						if ( testType( el ) ) {
							el.nodeIndex = uid++;
						}
					}
					pnt[uniqueKey] = 1;
					parentCache.push( pnt );
				}
				if ( expr.mode === 'child' ) { 
					append( ( ( collection[i].nodeIndex === expr.val ) !== not ) );
				} 
				else if ( isDefined( expr.oddEven ) ) { 
					append( ( collection[i].nodeIndex % 2 === expr.oddEven ) !== not );
				} 
				else {
					if ( expr.direction === 'pos' ) {
						if ( collection[i].nodeIndex < expr.start ) {
							if ( not ) {
								append( true );
							} 
						} 
						else { 
							append( ( ( collection[i].nodeIndex - expr.start ) % expr.jump === 0 ) !== not ); 
						}
					} 
					else {
						if ( collection[i].nodeIndex > expr.start ) {
							if ( not ) { 
								append( true ); 
							} 
						} 
						else { 
							append( ( ( expr.start - collection[i].nodeIndex ) % expr.jump === 0 ) !== not ); 
						}
					}
				}
			}
			unMark( parentCache );
			return expr.direction === 'neg' ? result.reverse() : result;
		},
		
		pseudoTests = {
			'nth-child': function ( tags, tkn ) {
				return nthChildFilter( tags, tkn.val, false, false, tkn.not );
			},
			'nth-of-type': function ( tags, tkn ) {
				return nthChildFilter( tags, tkn.val, true, false, tkn.not );
			},
			'nth-last-child': function ( tags, tkn ) {
				return nthChildFilter( tags, tkn.val, false, true, tkn.not );
			},
			'nth-last-of-type': function ( tags, tkn ) {
				return nthChildFilter( tags, tkn.val, true, true, tkn.not );
			},
			'first-of-type': function ( tags, tkn ) {
				return nthChildFilter( tags, '1', true, false, tkn.not );
			},
			'last-of-type': function ( tags, tkn ) {
				return nthChildFilter( tags, '1', true, true, tkn.not );
			},
			'only-child': function (el) {
				return !getNext(el) && !getPrevious(el);
			},
			'only-of-type': function (el) {
				var tags = getElements( el.parentNode, el.nodeName );
				if ( tags.length === 1 && tags[0].parentNode === el.parentNode ) {
					return true;
				} 
				else {
					for ( var bool = true, n = tags.length, i = 0, c = 0; i < n; i++ ) {
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
			'first-child': function (el) { return !getPrevious(el); },
			'last-child': function (el) { return !getNext(el); }, 
			'checked': function (el) { return el.checked; },
			'enabled': function (el) { return !el.disabled; },
			'disabled': function (el) { return el.disabled; },
			'empty': function (el) { return !el.firstChild;	},
			'lang': function ( el, tkn ) { return el.getAttribute('lang') === tkn.val; },
			'root': function (el) { return el === rootElement; },
			'target': function (el) {
				var hash = win.location.href.split('#')[1] || null;
				return el.id === hash || el.name === hash;
			}
		},
		
		/*====================================
			combinators
		=====================================*/

		mergeDirectSibling = function () {
			for ( var i = 0, n = collection.length, next; i < n; i++ ) {
				if ( next = getNext( collection[i] ) ) {
					pushToStack( next );
				}
			}
		},
		
		mergeAdjacentSibling = function () {
			var store = [], 
				sibs = [], 
				collectionLength = collection.length, 
				i = 0,
				next,
				parental; 
			for ( i; i < collectionLength; i++ ) {
				parental = collection[i].parentNode;
				parental[uniqueKey] = true;
				store.push({
					parent: parental, 
					child: collection[i]
				});
			}	
			for ( i = 0; i < store.length; i++ ) {
				if ( store[i].parent[uniqueKey] ) {
					store[i].parent[uniqueKey] = null;
					sibs.push( store[i].child );
				}
			}
			for ( i = 0; i < sibs.length; i++ ) {
				next = sibs[i].nextSibling;
				while ( next ) {
					if ( next.nodeType === 1 ) {
						pushToStack( next );
					}
					next = next.nextSibling;
				}
			}
		},
		
		filterChildren = function () {
			var result = [], 
				collectionLength = collection.length, 
				stackLength = stack.length, 
				parentElem,
				i = 0,
				j; 
			for ( i; i < stackLength; i++ ) {
				parentElem = stack[i].parentNode; 
				for ( j = 0; j < collectionLength; j++ ) {  
					if ( collection[j] === parentElem ) {
						result.push( stack[i] );
						break;
					}
				}
			}
			stack = result;
		},
		
		firstRun = 1,
		strings = [],
		uniqueKey = '__JELLY_Q__',
		stack = [],
		collection = [],
		
		_filter_ = 1,
		_fetch_ = 2,
		
		_id_ = 3,
		_tag_ = 4,
		_class_ = 5,
		_attr_ = 6,
		_pseudo_ = 7,
		_combi_ = 8,
		
		/*====================================
			execute
		=====================================*/
		
		execute = function ( a, b ) {
		
			var contextMode = !!b,
				selector = contextMode ? b : a;
			
			collection = contextMode ? [a] : [];

			if ( firstRun ) {
				var m;
				while ( m = /('|")([^\1]*?)\1/.exec( selector ) ) {
					strings.push( m[2] );
					selector = selector.split( m[0] );
					selector = [ selector[0], uniqueKey, selector[1] ].join('');   
				}
			}
			
			// Split and recurse for comma chained selectors
			if ( contains( selector, ',' ) ) {
				var combo = [],	
					parts = selector.split(','), 
					part;
				firstRun = 0;
				while ( part = parts.shift() ) {
					combo = combo.concat( contextMode ? execute( a, part ) : execute( part ) );
				}
				firstRun = 1;
				return filterUnique( combo );
			}
			
			firstRun = !b;
			
			var tokens = parseSelector( selector ),
				children = null; 
				
			// log(tokens)
		
			for ( var i = 0, n = tokens.length, token; i < n; i++ ) {
			
				stack = []; 
				token = tokens[i];
				switch ( token.type ) {
					case _id_: 
						mergeId( token ); 
						break;
					case _tag_: 
						mergeTags( token ); 
						break;
					case _class_: 
						mergeClass( token ); 
						break;
					case _attr_: 
						mergeAttribute( token ); 
						break;
					case _pseudo_: 
						mergePseudo( token ); 
						break
					case _combi_: 
						if ( token.val === '+' ) {
							mergeDirectSibling( token );
						} 
						else if ( token.val === '~' ) {
							mergeAdjacentSibling( token );
						}
				}
				if ( children ) { 
					filterChildren(); 
				}
				if ( token.val === '>' ) {
					children = true;
					continue;
				}
				if ( !stack[0] ) {
					return [];
				}
				children = null;
				firstRun = 0;
				collection = stack;
			}
			if ( tokens.postFilter ) { 
				return filterUnique( collection ); 
			}
			return collection;
		},
		
		nativeSelectorEngine = function ( a, b ) {
			try { 
				return toArray( b ? a.querySelectorAll(b) : doc.querySelectorAll(a) );
			} catch ( ex ) { 
				logWarn( ex ); 
			}
		};
		
	J.Q = function () {
		if ( querySelectorAll ) {
			if ( !browser.ie ) { 
				return nativeSelectorEngine; 
			} 
			return function ( a, b ) {
				if ( /\:(nth|las|onl|not|tar|roo|emp|ena|dis|che)/.test( b || a ) ) { 
					return execute( a, b ); 
				}
				return nativeSelectorEngine( a, b );
			}
		} 
		return execute;
	}();
	
})();