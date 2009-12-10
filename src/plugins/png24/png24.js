/////////////////////////////////////////////////////////////////////////
//  Png24 fix for users of IE 6 
/////////////////////////////////////////////////////////////////////////

(function () {

// Quick exit if this isn't IE 6 
if ( !/MSIE 6/i.test( navigator.userAgent ) ) { return; }

// Import library 
eval( JELLY.unpack() );
	
// Selection criteria
var elements = 'img.img-main[src$=png], img.png24',

	fixPng24 = function () {
		
		var pngs = Q( elements ),
			propertyIsSet = function ( img, prop ) {
				return img.currentStyle[ prop ] || img.currentStyle[ prop ] == '0';
			};
		
		pngs.each( function ( img ) {
		
			// Create custom elements so as not to inherit any other styles.
			// Two elements are required: 
			//		- An outer element to hold box-model related styles (margin/padding/border)
			//		- An inner element to represent the actual image
			var outerElement = createElement( 'png24' ),
				innerElement = createElement( 'png24img' ),
			
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
				'display': 
					propertyIsSet( img, 'display' ) && ( currentStyle.display != 'inline' ) ? 
						currentStyle.display : 'inline-block',
				'font-size': '0'
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
			[ 'id', 'title' ].each( function ( attr ) {
				var value = img.getAttribute( attr );
				if ( value !== null ) {
					outerElement.setAttribute( attr, value );		
				}
			});
			
			// Restore alt text
			if ( !empty( img.alt ) ) {
				innerElement.innerHTML = '<img alt="' + 
					img.alt + '" style="position:absolute;font-size:9999%;left:-999em" />';
			}
			
			// Append the inner element and swap the fragment with original image
			outerElement.appendChild( innerElement );
			replaceElement( img, outerElement );
		});
	};

window.attachEvent( 'onload', fixPng24 );

})(); // End closure