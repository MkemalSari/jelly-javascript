/**

Selector Engine

@description 
	A fast cross-browser interface for querying the DOM with CSS selectors

*/
(function () {

	/*===================================================================
	selector string parsing 
	=====================================================================*/

	var parseTokenComponent = function ( part, fetchOrFilter ) {
			var obj = { 
					mode: fetchOrFilter ? 'fetch' : 'filter', 
					not: false,
					type: _id_
				};
			if ( /^\w+?#\w/.test( part ) ) {
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
			else if ( /\[/.test( part ) ) { 
				obj.type = _attr_;	
				obj.val = part.replace( /\[|\]/g, '' );	
			} 
			else if ( /\+|>|~/.test( part ) ) { 
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
				universal = { mode: 'fetch', type: _tag_, val: '*' },
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
						obj.mode = 'filter';
					} 
					else if ( j === 0 && 
						( obj.type === _pseudo_ || obj.type === _attr_ || 
							( obj.type === _class_ && !getByClass ) || 
						obj.not ) ) {
						result.push( universal );
						obj.mode = 'filter';
					}
					if ( tmp[j].indexOf( uniqueKey ) !== -1 ) {
						obj[obj.type === _attr_ ? 'spValue' : 'val'] = strings.shift();
					}
					result.push( obj );
					sibling = /^(~|\+)$/.test( obj.val );
				}
			}
			result.postFilter = !( parts.length === 1 || parts.length === 3 && /^[\+~]$/.test( parts[1] ) );
			return result;
		},	
		
		/*===================================================================
		execute
		=====================================================================*/
		
		firstRun = true,
		strings = [],
		uniqueKey = '__JELLY__',
		stack = [],
		
		_id_ = 'id',
		_tag_ = 'tag',
		_attr_ = 'attr',
		_pseudo_ = 'pseudo',
		_combi_ = 'combi',
		
		execute = function ( a, b ) {
		
			var contextMode = !!b,
				selector = contextMode ? b : a;

			if ( firstRun ) {
				var m;
				while ( m = /('|")([^\1]*?)\1/.exec( selector ) ) {
					strings.push( m[2] );
					selector = selector.split( m[0] );
					selector = [ selector[0], uniqueKey, selector[1] ].join('');   
				}
			}
			
			// Split and recurse for comma chained selectors
			if ( /,/.test( selector ) ) {
				var combo = [],	
					parts = selector.split(','), 
					part;
				firstRun = false;
				while ( part = parts.shift() ) {
					combo = combo.concat( contextMode ? execute( a, part ) : execute( part ) );
				}
				firstRun = true;
				return filterUnique( combo );
			}

			var tokens = parseSelector( selector ),
				collection = contextMode ? [a] : [],	
				firstRun = true && !b,
				children = null; 
				
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
					case _pseudo_: 
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
				collection = stack;
				firstRun = false;	
			}
			
			if ( tokens.postFilter ) { 
				return filterUnique( collection ); 
			}
			return collection;
		};

	J.Q = execute;
		
}();
