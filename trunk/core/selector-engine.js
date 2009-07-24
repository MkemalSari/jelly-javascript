/**

Selector Engine

@location core
@description A cross-browser interface for querying the DOM

*/

J._Q = {
	'A': function (a, b) {
		try { 
			return toArray( b ? a.querySelectorAll(b) : document.querySelectorAll(a) );
		} catch (ex) {}
	},
	'B': function (a, b) {	
		var toArray = J.toArray, 
			getNext = J.getNext,
			getPrevious = J.getPrevious,
			msie = J.browser.ie,
			win = window,
			doc = win.document,
			loc = win.location,
			rootElement = doc.documentElement,
			unMark = function (collection, mark) {
				for ( var n = collection.length, i = 0; i < n; i++ ) {
					collection[i][mark] = undefined;
				}
			},
			contains = function () {
			    if ( rootElement.contains )  { 
			        return function ( needle, haystack ) {
						return haystack.contains(needle);
					};
			    } 
				return function ( needle, haystack ) {
					return !!( haystack.compareDocumentPosition(needle) & 16 );
				};
			}(),
			mergeId = function (tkn) {
				var tag = tkn.val[0], id = tkn.val[1];
				if (tkn.mode === 'filter') { 
					var tags = collection, n = collection.length, i = 0;
					for (i; i < n; i++) {
						if (tag) {
							if ((tags[i].tagName.toLowerCase() === tag && tags[i].id === id) !== tkn.not) {
								tmp[tmp.length] = tags[i]; 
							}
						} 
						else if ((tags[i].id === id) !== tkn.not) {
							tmp[tmp.length] = tags[i]; 
						}
						if (!tkn.not && tmp[0]) {return;}
					}
				} 
				else {
					if (!tag) {
						tmp[0] = doc.getElementById(id);
					} 
					else {
						var elem = doc.getElementById(id);
						if (elem && elem.tagName.toLowerCase() === tag) {
							tmp[0] = elem;	
						}
					}
					if (!firstRun && tmp[0]) {
						var tags = collection, n = collection.length, flag = false, i = 0;
						for (i; i < n; i++) {
							if (contains(tmp[0], tags[i])) {
								flag = true;
								break;
							}
						}
						if (!flag) {tmp[0] = null;}
					} 
				}
			}, 
			mergeTags = function (tkn) {
				var tags, n, test, i = 0, extra = (tkn.val === '*' && msie);
				if (firstRun) {
					tags = doc.getElementsByTagName(tkn.val); n = tags.length;	
					for (i; i < n; i++) {
						if (extra) {if (tags[i].nodeType === 1) {tmp[tmp.length] = tags[i];}}
						else {tmp[tmp.length] = tags[i];}
					}
				} 
				else if (tkn.not || tkn.mode === 'filter') {
					tags = collection; n = tags.length; test = tkn.val.toUpperCase();
					for (i; i < n; i++) {
						if ((tags[i].nodeName.toUpperCase() === test) !== tkn.not) {
							tmp[tmp.length] = tags[i];
						}
					}
				} 
				else {
					tags = collection; 
					n = tags.length;
					for (i; i < n; i++) {
						var tags2 = tags[i].getElementsByTagName(tkn.val), n2 = tags2.length, j;
						for (j = 0; j < n2; j++) {
							if (extra) {if (tags2[j].nodeType === 1) {tmp[tmp.length] = tags2[j];}}
							else {tmp[tmp.length] = tags2[j];}
						}
					}
				}
			},
			mergeClass = function (tkn) {
				var tags = collection, val = tkn.val, not = tkn.not, n = tags.length, i = 0;
				if (tkn.mode === 'fetch') {
					if (firstRun) {
						tmp = toArray(doc.getElementsByClassName(val));
					} 
					else {
						for (i; i < n; i++) {
							var tags2 = tags[i].getElementsByClassName(val), n2 = tags2.length, j = 0;
							for (j; j < n2; j++) {
								tmp[tmp.length] = tags2[j];
							}
						}
					}
				} 
				else {
					var patt = new RegExp('(^|\\s)' + val + '(\\s|$)'), cn;
					for (i; i < n; i++) {
						cn = tags[i].className;
						if (!cn) {
							if (not) {tmp[tmp.length] = tags[i];}
							continue;
						} 
						if (patt.test(cn) !== not) {tmp[tmp.length] = tags[i];} 
					}
				}
			},
			attributeTests = {
				'=': function (attr, val) {return attr === val;}, 
				'^=': function (attr, val) {return attr.indexOf(val) === 0;}, 
				'$=': function (attr, val) {return attr.substr(attr.length - val.length) === val;}, 
				'*=': function (attr, val) {return attr.indexOf(val) !== -1;}, 
				'|=': function (attr, val) {return attr.indexOf(val) === 0;}, 
				'~=': function (attr, val) {return (' ' + attr + ' ').indexOf(' ' + val + ' ') !== -1;} 
			},
			mergeAttribute = function (tkn) {
				var tags = collection, n = tags.length, getAttribute = J.getAttribute, attrValue = tkn.val, i = 0;
				if (/=/.test(attrValue)) {
					var parts = /([\w-]+)([^=]?=)(.+)/.exec(attrValue), attr, mode = attributeTests,
						val = tkn.spValue !== undefined ? tkn.spValue : parts[3];
					for (i; i < n; i++) {
						attr = getAttribute(tags[i], parts[1]);
						if ((attr !== null && mode[parts[2]](attr, val)) !== tkn.not) {
							tmp[tmp.length] = tags[i];
						}
					}
				} 
				else {
					for (i; i < n; i++) {
						if ((getAttribute(tags[i], attrValue) !== null) !== tkn.not) {
							tmp[tmp.length] = tags[i];                    
						}
					}
				}
			},
			mergeDirectSibling = function (tkn) {
				var tags = collection, n = tags.length, next, i = 0;
				for (i; i < n; i++) {
					next = getNext(tags[i]);
					if (next) {tmp[tmp.length] = next;}
				}
			},
			mergeAdjacentSibling = function (tkn) {
				var tags = collection, n = tags.length, store = [], sibs = [], i = 0; 
				for (i; i < n; i++) {
					var parental = tags[i].parentNode;
					parental.__jelly = true;
					store[store.length] = {
						parent: parental, 
						child: tags[i]
					};
				}	
				for (i = 0; i < store.length; i++) {
					if (store[i].parent.__jelly !== undefined) {
						store[i].parent.__jelly = undefined;
						sibs[sibs.length] = store[i].child;
					}
				}
				for (i = 0; i < sibs.length; i++) {
					var next = sibs[i].nextSibling;
					while (next) {
						if (next.nodeType === 1) {tmp[tmp.length] = next;}
						next = next.nextSibling;
					}
				}
			},
			filterChildren = function () {
				var tags = collection, n = tags.length, n2 = tmp.length, result = [], i = 0; 
				for (i; i < n2; i++) {
					var parentElem = tmp[i].parentNode; 
					for (var j = 0; j < n; j++) {  
						if (tags[j] === parentElem) {
							result[result.length] = tmp[i];
							break;
						}
					}
				}
				tmp = result;
			},
			mergePseudo = function (tkn) {
				var tags = collection, n = tags.length, i = 0;
				if (/^(nth-|first-of|last-of)/.test(tkn.kind)) {
					tmp = pseudoTests[tkn.kind](tags, tkn); 
				} 
				else if (tkn.kind === 'root' && !tkn.not) {
					tmp[0] = rootElement;
				} 
				else if (tkn.kind === 'target' && !tkn.not) {
					var hash = loc.href.split('#')[1] || null;
					tmp[0] = doc.getElementById(hash) || doc.getElementsByName(hash)[0];
				} 
				else {
					for (i; i < n; i++) {
						if (pseudoTests[tkn.kind](tags[i], tkn) !== tkn.not) {
							tmp[tmp.length] = tags[i];
						}
					}
				}
			},
			parseNthExpr = function (expr) {
				var obj = {};
				obj.direction = /^\-/.test(expr) ? 'neg' : 'pos';
				if (/^n$/.test(expr)) { 
					obj.mode = 'all';
					return obj;
				} 
				else if (/^\d+$/.test(expr)) {
					obj.mode = 'child';
					obj.val = parseInt(expr, 10);
					return obj;
				} 
				obj.mode = 'an+b';
				if (/^(even|2n|2n\+2)$/.test(expr)) {obj.oddEven = 0;} 
				else if (/^(odd|2n\+1)$/.test(expr)) {obj.oddEven = 1;}
				var pts = expr.split('n');
				obj.start = pts[1] ? parseInt(pts[1], 10) : 1;
				obj.jump = pts[0] && !/^\-$/.test(pts[0]) ? parseInt(pts[0].replace(/^\-/, ''), 10) : 1;		
				return obj;
			},
			nthChildFilter = function (collection, expr, oftype, last, not) {
				expr = parseNthExpr(expr);
				if ( expr.mode === 'all' ) { return collection; }				
				var	result = [], 
					parentCache = [], 
					n = collection.length, 
					i = 0,
					nodeName = collection[0].nodeName,
					testType = oftype ? 
						function (el) {return el.nodeType === 1 && el.nodeName === nodeName;} : 
						function (el) {return el.nodeType === 1;},		
					append = function (cond) {if (cond) {result[result.length] = collection[i];}};
				for ( i; i < n; i++ ) {
					var pnt = collection[i].parentNode, c = 1;
					if (!pnt._indexedChilden) {
						parentCache[parentCache.length] = pnt;
						if (!last) {
							for (var el = pnt.firstChild; el; el = el.nextSibling) {
								if (testType(el)) {el.nodeIndex = c++;}
							}
						} 
						else {
							for (var el = pnt.lastChild; el; el = el.previousSibling) {
								if (testType(el)) {el.nodeIndex = c++;}
							}
						}
						pnt._indexedChilden = true;
					}
					if (expr.mode === 'child') { 
						append(((collection[i].nodeIndex === expr.val) !== not));
					} 
					else if (expr.oddEven !== undefined) { 
						append((collection[i].nodeIndex % 2 === expr.oddEven) !== not);
					} 
					else {
						if (expr.direction === 'pos') {
							if (collection[i].nodeIndex < expr.start) {
								if (not) {
									append(true);
								} 
								else { continue; }
							} 
							else { 
								append(((collection[i].nodeIndex - expr.start) % expr.jump === 0) !== not); }
						} 
						else {
							if (collection[i].nodeIndex > expr.start) {
								if (not) {append(true);} 
								else {continue;}
							} 
							else { append(((expr.start - collection[i].nodeIndex) % expr.jump === 0) !== not); }
						}
					}
				}
				unMark(parentCache, '_indexedChilden');
				return expr.direction === 'neg' ? result.reverse() : result;
			},
			pseudoTests = {
				'nth-child': function (tags, tkn) {
					return nthChildFilter(tags, tkn.val, false, false, tkn.not);
				},
				'nth-of-type': function (tags, tkn) {
					return nthChildFilter(tags, tkn.val, true, false, tkn.not);
				},
				'nth-last-child': function (tags, tkn) {
					return nthChildFilter(tags, tkn.val, false, true, tkn.not);
				},
				'nth-last-of-type': function (tags, tkn) {
					return nthChildFilter(tags, tkn.val, true, true, tkn.not);
				},
				'first-of-type': function (tags, tkn) {
					return nthChildFilter(tags, '1', true, false, tkn.not);
				},
				'last-of-type': function (tags, tkn) {
					return nthChildFilter(tags, '1', true, true, tkn.not);
				},
				'only-child': function (el) {
					return !getNext(el) && !getPrevious(el);
				},
				'only-of-type': function (el) {
					var tags = el.parentNode.getElementsByTagName(el.nodeName);
					if ( tags.length === 1 && tags[0].parentNode === el.parentNode ) {
						return true;
					} 
					else {
						var bool = true, n = tags.length, i = 0, c = 0;
						for ( i; i < n; i++ ) {
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
				'first-child': function (el) {
					return !getPrevious(el);
				},
				'last-child': function (el) {
					return !getNext(el);
				}, 
				'checked': function (el) {
					return el.checked;
				},
				'enabled': function (el) {
					return !el.disabled;
				},
				'disabled': function (el) {
					return el.disabled;
				},
				'empty': function (el) {
					return !el.firstChild;
				},
				'lang': function (el, tkn) {
					return el.getAttribute('lang') === tkn.val;
				},
				'root': function (el) {
					return el === rootElement;
				},
				'target': function (el) {
					var hash = loc.href.split('#')[1] || null;
					return el.id === hash || el.name === hash;
				}
			},
			filterUnique = function (collection) {
				var c, n = collection.length, uniques = [];
				while (n) {
					c = collection[--n];
					if (!c.__jelly) {
						c.__jelly = true;
						uniques[uniques.length] = c;
					}
				}
				n = uniques.length;
				while (n) {uniques[--n].__jelly = undefined;}
				return uniques.reverse();
			},
			
			parseTokenComponent = function (part, fetchOrFilter) {
				var obj = {mode: fetchOrFilter ? 'fetch' : 'filter', not: false};
				if (/^(\w+)?#[^\s]+$/.test(part)) {
					obj.type = 'ID'; obj.val = part.split('#');
				} 
				else if (/^(\w+|\*)$/.test(part)) {
					obj.type = 'TAG'; obj.val = part;
				} 
				else if (/^\.[^\s]+$/.test(part)) { 
					obj.type = 'CLASS';	obj.val = part.replace(/^\./, '');
				} 
				else if (/^\[[^\s]+$/.test(part)) { 
					obj.type = 'ATTR';	obj.val = part.replace(/^\[|\]$/g, '');	
				} 
				else if (/^\+|>|~$/.test(part)) { 
					obj.type = 'COMBI'; obj.val = part;			
				} 
				else if (/^\:not[\s\S]+$/.test(part)) {
					var tmp = part.replace(/^\:not\(|\)$/g, '');
					obj = parseTokenComponent(tmp);
					obj.not = true;
				} 
				else if (/^:[^\s]+$/.test(part)) { 
					var tmp = part.replace(/^\:|\)$/g, '').split('(');
					obj.type = 'PSEUDO'; 
					obj.kind = tmp[0];
					obj.val = tmp[1];
				} 
				return obj;
			},
			
			parseSelector = function (feed) {
				// Seperate out the combinators + > ~, then split
				var result = [],
					parts = J.normalize( feed.replace(/(>|~(?!=)|\+(?!\d))/g, ' $1 ') ).split(' '),
				    universal = {mode:'fetch', type:'TAG', val:'*'},
				    getByClass = 'getElementsByClassName' in doc,
				    sibling = false;
					
				for ( var i = 0; i < parts.length; i++ ) { 
					var tmp = parts[i].replace(/([^\(\#\.\[])(:)/g, '$1 $2').
						replace(/([^\(])(\[|\.)/g, '$1 $2').
						replace(/\:not\(\s*/g, ':not(').trim().split(' ');	
					for (var j = 0; j < tmp.length; j++) {
						var obj = parseTokenComponent(tmp[j], !j);
						if (sibling) {
							obj.mode = 'filter';
						} 
						else if ( j === 0 && 
							( /PSEUDO|ATTR/.test(obj.type) || 
							  (obj.type === 'CLASS' && !getByClass) || 
							  obj.not ) ) {
							result[result.length] = universal;
							obj.mode = 'filter';
						}
						if (tmp[j].indexOf(uniqueKey) !== -1) {
							obj[obj.type === 'ATTR' ? 'spValue' : 'val'] = strings.shift();
						}
						result[result.length] = obj;
						sibling = /^(~|\+)$/.test(obj.val);
					}
				}
				result.postFilter = !(parts.length === 1 || parts.length === 3 && /^[\+~]$/.test(parts[1]));
				return result;
			};
		
		/* ---------------------------------------------------------------------------------------- */
		var contextMode = !!b,
			selector = contextMode ? b : a,
			quoteMarkTest = /('|")([^\1]*?)\1/,
			_Q = J._Q, 
			uniqueKey = _Q.uniqueKey, 
			firstRun = _Q.firstRun, 
			strings = _Q.strings, 
			m;

		if ( firstRun ) {
			while ( selector.indexOf(uniqueKey) !== -1 ) {
				uniqueKey += uniqueKey;
			}
			m = quoteMarkTest.exec(selector);
			while (m) {
				strings[strings.length] = m[2];
				selector = selector.split(m[0]);
				selector = [selector[0], uniqueKey, selector[1]].join('');   
				m = quoteMarkTest.exec(selector);
			}
		}
		
		// Split and recurse for comma chained selectors
		if ( /,/.test(selector) ) {
			var combo = [],	parts = selector.split(','), part;
			firstRun = false;
			while ( part = parts.shift() ) {
				combo = combo.concat( contextMode ? J.Q(a, part) : J.Q(part) );
			}
			firstRun = true;
			return filterUnique(combo);
		}

		var tokens = parseSelector(selector),
			collection = contextMode ? [a] : [],	
			firstRun = true && !b,
			children = null, 
			k = 0;
		
		for (k; k < tokens.length; k++) {
			var tmp = [], tkn = tokens[k];						
			switch (tkn.type) {
				case 'ID': mergeId(tkn); break;
				case 'TAG': mergeTags(tkn); break;
				case 'CLASS': mergeClass(tkn); break;
				case 'ATTR': mergeAttribute(tkn); break;
				case 'PSEUDO': mergePseudo(tkn); break
				case 'COMBI': 
					if (tkn.val === '+') {mergeDirectSibling(tkn);} 
					else if (tkn.val === '~') {mergeAdjacentSibling(tkn);}
			}
			if (children) { filterChildren(); }
			if (tkn.val === '>') {
				children = true;
				continue;
			}
			if (!tmp[0]) {return [];}
			children = null;
			collection = tmp;
			firstRun = false;	
		}
		if ( tokens.postFilter ) { return filterUnique(collection); }
		return collection;
	},
	strings: [],
	uniqueKey: '@@',
	firstRun: true
};

J.Q = function () {
	if ('querySelectorAll' in doc) {
		if (!browser.ie) { 
			return J._Q.A; 
		} 
		return function (a, b) {
			if (/\:(nth|las|onl|not|tar|roo|emp|ena|dis|che)/.test(b || a)) { 
				return J._Q.B(a, b); 
			}
			return J._Q.A(a, b);
		}
	} 
	return J._Q.B;
}();
