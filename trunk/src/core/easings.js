/*

Easing equations by Robert Penner 

*/
J.easings = {
	linear:function(B,A,D,C){return D*B/C+A},
	sineIn:function(B,A,D,C){return -D*Math.cos(B/C*(Math.PI/2))+D+A},
	sineOut:function(B,A,D,C){return D*Math.sin(B/C*(Math.PI/2))+A},
	sineInOut:function(B,A,D,C){return -D/2*(Math.cos(Math.PI*B/C)-1)+A}
};