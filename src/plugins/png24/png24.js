/*

Png24

@description
	Png fix for users of IE 6 

@examples
	Png24.convert( 'img' );
	Png24.convert( document.getElmemnt );
	Png24.setSelectorEngine( Sizzle ).convert( 'img.png24' );
  
 */
(function () {

	/////////////////////////////////////////////////////////////////////////
	//  API
	/////////////////////////////////////////////////////////////////////////
	
var win = window,
	doc = document,
	
	self = this.Png24 = {
	
		convert: function ( selector ) {
			
			if ( !targetBrowser ) return; 
			
			win.detachEvent( 'onload', autoConvertHandler );
			
			var imgs,
				isObject = !!selector && typeof selector == 'object';
				
			// Node lists
			if ( isObject && !!selector.item && !!selector.length ) {
				imgs = toArray( selector );
			} 
			// Single element
			else if ( isObject && !!selector.nodeName && selector.nodeType === 1 ) {
				imgs = [ selector ];
			}
			// String
			else if ( typeof selector == 'string' ) {
				imgs = ( selectorEngine || doc.getElementsByTagName )( selector );
			}
			// If not an array throw an error 
			else if ( !( {}.toString.call( selector ) === '[object Array]' ) ) {
				throw 'Png24: bad argument';
			}
			for ( var i = 0; i < imgs.length; i++ ) {
				process( imgs[i] );
			} 
		},
		
		setSelectorEngine: function ( engine ) {
			selectorEngine = engine;
			return self;
		}
	},

	/////////////////////////////////////////////////////////////////////////
	//  Private members
	/////////////////////////////////////////////////////////////////////////
	
	selectorEngine = null,
	
	autoConvertHandler = function () {
		self.convert( doc.images );
	},
	
	targetBrowser = 1 || /MSIE (6|5\.5)/i.test( win.navigator.userAgent ),
	
	process = function ( img ) {
		
		// Quick check to see we're actually dealing with a png image
		if ( img.nodeName.toUpperCase() !== 'IMG' || !/\.png$/i.test( img.src ) ) return;

		// Create custom elements so as not to inherit any other styles.
		// Two elements are required: 
		//		- An outer element to hold box-model related styles (padding/border)
		//		- An inner element to represent the actual image
		var outerElement = doc.createElement( 'png24' ),
			innerElement = doc.createElement( 'png24img' ),
		
			currentStyle = img.currentStyle;
		
		// Copy over all style info, box-model properties copy to the outer element only
		for ( var prop in currentStyle ) {
			if ( /^(margin|padding)|^border$|^border[a-z]*width$/i.test( prop ) ) {
				outerElement.style[ prop ] = currentStyle[ prop ];
				innerElement.style[ prop ] = 0;
			}
			else {
				innerElement.style[ prop ] = 
				outerElement.style[ prop ] = currentStyle[ prop ];
			}
		}
		
		// Set specifics for outer element
		setStyle( outerElement, {
			'display': propertyIsSet( img, 'display' ) && ( currentStyle.display != 'inline' ) ? 
					currentStyle.display : 'inline-block',
			'fontSize': 0
		});			
		
		// Cancel out any style properties that will effect image width measurements
		setStyle( img, {
			'border': 0,
			'padding': 0
		});
		
		// Set specifics for inner element
		setStyle( innerElement, {
			'height': 
				propertyIsSet( img, 'height' ) && ( currentStyle.height != 'auto' ) ? 
					currentStyle.height : img.height + 'px',
			'width': 
				propertyIsSet( img, 'width' ) && ( currentStyle.width != 'auto' ) ? 
					currentStyle.width : img.width + 'px',
			'display': 'inline-block',
			'position': 'static',
			'filter': 'progid:DXImageTransform.Microsoft.AlphaImageLoader(src="' + 
				img.src + '", sizingMethod="scale")'
		});
		
		// Copy over any image attributes
		var attrs = [ 'id', 'title' ], 
			i = 0;
		for ( ; i < attrs.length; i++ ) { 
			var value = img.getAttribute( attrs[ i ] );
			if ( value !== null ) {
				outerElement.setAttribute( attrs[ i ], value );		
			}
		}
		
		// Restore alt text
		if ( !img.alt != '' ) {
			innerElement.innerHTML = '<img alt="' + 
				img.alt + '" style="position:absolute;font-size:13px;left:-999em" />';
		}
		
		// Append the inner element and swap the fragment with original image
		outerElement.appendChild( innerElement );
		img.parentNode.replaceChild( outerElement, img );
	},
	
	propertyIsSet = function ( img, prop ) {
		return img.currentStyle[ prop ] || img.currentStyle[ prop ] == '0';
	},
	
	setStyle = function ( el, obj ) {
		for ( var prop in obj ) {
			el.style[ prop ] = obj[ prop ];
		}
	},
	
	toArray = function ( obj ) {
		var result = [], n = obj.length, i = 0;
		for ( ; i < n; i++ ) { 
			result[i] = obj[i]; 
		}
		return result;
	};
	
// Set up onload handler by default  
if ( targetBrowser ) win.attachEvent( 'onload', autoConvertHandler );

//Png24.convert( 'img' );	

})();