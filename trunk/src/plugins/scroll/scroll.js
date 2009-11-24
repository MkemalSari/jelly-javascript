/**

Scroll

@description 
	Tweened element scrolling, including the window

*/

(function () {

var Class = defineClass( 'Scroll', {
		
		__extends: J.Tween,
        
        __init: function ( el, opts ) {
            this.el = getElement(el);
            extend( this, opts || {} ); 
        },
        
        start: function ( x, y ) {
            var self = this, 
                el = self.el;
            self.stop();
            if ( el === win ) {
                var winpos = J.getWindowScroll();
                x = isArray(x) ? x : [winpos[0], x];
                y = isArray(y) ? y : [winpos[1], y];
                self.increase = function () {
                    el.scrollTo( self.compute( self.vals[0][0], self.vals[0][1] ), 
                                 self.compute( self.vals[1][0], self.vals[1][1] ) );
                };
            } 
            else {
                x = isArray(x) ? x : [el.scrollLeft, x];
                y = isArray(y) ? y : [el.scrollTop, y];
                self.increase = function () {
                    el.scrollLeft = self.compute(self.vals[0][0], self.vals[0][1]); 
                    el.scrollTop = self.compute(self.vals[1][0], self.vals[1][1]); 				
                };
            }
            self.vals = [x, y];
            self.startTime = +(new Date);
            
            self.tweenId = ++J.Tween.uid;
            J.Tween.subscribe( self );
            self.fire( 'start' );
			return self;
        },
        
        tidyUp: function () {
            var self = this;
            if ( self.el === win ) { 
                self.el.scrollTo( self.vals[0][1], self.vals[1][1] ); 
            } 
            else {
                self.el.scrollLeft = self.vals[0][1]; 
                self.el.scrollTop = self.vals[1][1]; 
            }
        } 
    });

})();