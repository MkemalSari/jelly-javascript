/*!
 * http://www.kryogenix.org/code/browser/searchhi/ 
 * Modified 20021006 to fix query string parsing and add case insensitivity 
 * Modified 20070316 to stop highlighting inside nosearchhi nodes 
 * Modified 20090104 by Bruce Lawson to use html5 mark element rather than span 
     http://www.whatwg.org/specs/web-apps/current-work/multipage/text-level-semantics.html#the-mark-element 
 * Modified 20090105 by Pete Boere to clean-up namespace, add hostname referrer check for unconventional 
     query parameters and change behaviour to highlight the full search phrase and whole word matches ( not word sub-strings )
 * This script is by Stuart Langridge licensed under MIT license http://www.kryogenix.org/code/browser/licence.html
*/

(function () {

// Shortcuts
var win = window,
	doc = document,
	loc = win.location,
	
	// Allow local files for testing
	referrer = doc.referrer || loc.protocol === 'file:' ? loc.href : '',
	
	// Parse referrer hostname from referrer string
    referrerHost = function () {
        var a = doc.createElement( 'a' );
        a.href = referrer;
        return a.hostname;
    }(),
	
	// By default check for the parameter 'q' as it's a convention
	searchParameter = 'q',

	// List any search engines that do not use the conventional 'q' query parameter;
	// less chance of creating unexpected effects this way ( i.e. 'p' could easily be used as an alias for 'page' or 'product' )
	searchEngines = {
		yahoo: 'p' 
	},
	
	// Helper for iterating arrays, nodelists and objects
	each = function ( obj, callback ) {
		if ( obj+'' === '[object Object]' ) {
			for ( var key in obj ) { 
				callback.call( obj, key, obj[ key ] ); 
			}
		}
		else {
			for ( var i = 0; i < obj.length; i++ ) { 
				callback.call( obj, obj[ i ], i ); 
			}
		}
	},
	
	// Cache word match regexs for performance gain
	reCache = {},
	
	highlightWord = function ( node, word ) {
		// Iterate into this nodes childNodes
		if ( node.hasChildNodes ) {
			each( node.childNodes, function ( cn ) {
				highlightWord( cn, word );
			});
		}
		// And do this node itself if it's text and it hasn't already been highlighted
		if ( node.nodeType == 3 && node.parentNode.className != 'searchword' ) { 
			
			var tempNodeVal = node.nodeValue.toLowerCase(),
				tempWordVal = word.toLowerCase(),
				// Setup regex outline
				wordPatt = '\\b' + tempWordVal + '\\b',
				// Get regex from cache or create it ( and cache for re-use )
				wordPatt = reCache[ wordPatt ] = ( reCache[ wordPatt ] || new RegExp( wordPatt ) ),
				
				match = wordPatt.exec( tempNodeVal );
				
			if ( match ) {
				var pn = node.parentNode,
					checkn = pn;
					
				// check if we're inside a "nosearchhi" zone
				while ( checkn && checkn != doc.body ) { 
					if ( /\bnosearchhi\b/.test( checkn.className ) ) { 
						return; 
					}
					checkn = checkn.parentNode;
				}
				
				var nv = node.nodeValue,
					ni = match.index,
					// Create a load of replacement nodes
					before = doc.createTextNode( nv.substr( 0, ni ) ),
					docWordVal = nv.substr( ni, word.length ),
					after = doc.createTextNode( nv.substr( ni + word.length ) ),
					hiwordtext = doc.createTextNode( docWordVal ),
					hiword = doc.createElement( 'mark' );
				hiword.className = 'searchword';
				hiword.appendChild( hiwordtext );
				pn.insertBefore( before, node );
				pn.insertBefore( hiword, node );
				pn.insertBefore( after, node );
				pn.removeChild( node );
			}
		}
	},
	
	searchTermHighlight = function () {
		var tokens = referrer.substr( referrer.indexOf( '?' ) + 1 ).split( '&' );
		each( tokens, function ( token ) {
			var parts = token.split( '=' ),
				param = parts[ 0 ],
				value = parts[ 1 ];
			if ( value && param === searchParameter ) { 
				var phrase = unescape( value.replace( /\+/g, ' ' ) ),
					words = phrase.split( /\s+/ );
				// Add the complete phrase to the front of the stack 
				words.unshift( phrase );
				each( words, function ( word ) {
					highlightWord( doc.body, word );
				}); 
			}
		});
	};

// Apply any non-standard search parameter
each( searchEngines, function ( engine, param ) {
	if ( referrerHost.indexOf( '.' + engine + '.' ) !== -1 ) {
		searchParameter = param;
	}
});

// Proceed only if the referrer string has a query
if ( referrer.indexOf( '?' ) === -1 ) {
	return;
}
else if ( 'jQuery' in win ) {
	jQuery( doc ).ready( searchTermHighlight ); 
}
else if ( 'addEventListener' in win ) {
	win.addEventListener( 'load', searchTermHighlight, false );
}
else if ( 'attachEvent' in win ) {
	win.attachEvent( 'onload', searchTermHighlight );
}
else {
	win.onload = searchTermHighlight();
}

})();