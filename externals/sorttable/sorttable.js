/*
  SortTable
  version 2
  7th April 2007
  Stuart Langridge, http://www.kryogenix.org/code/browser/sorttable/
  
  Instructions:
  Download this file
  Add <script src="sorttable.js"></script> to your HTML
  Add class="sortable" to any table you'd like to make sortable
  Click on the headers to sort
  
  Thanks to many, many people for contributions and suggestions.
  Licenced as X11: http://www.kryogenix.org/code/browser/licence.html
  This basically means: do what you want with it.
*/

(function () {
 
var stIsIE = /*@cc_on!@*/false;
var J = JELLY;

var SortTable = J.SortTable = {

  
  init: function() {
    if ( SortTable.ready ) return;
    SortTable.DATE_RE = /^(\d\d?)[\/\.-](\d\d?)[\/\.-]((\d\d)?\d\d)$/;
	J.Q('table.sortable').each( SortTable.makeSortable );
    SortTable.ready = true;
  },
  
  makeSortable: function(table) {
  
	var headrow, the, tfo, mtch;
	
    if (table.getElementsByTagName('tr').length < 3) { return }; 
    
    if (table.getElementsByTagName('thead').length == 0) {
      // table doesn't have a tHead. Since it should have, create one and
      // put the first table row in it.
      the = document.createElement('thead');
      the.appendChild(table.rows[0]);
      table.insertBefore(the,table.firstChild);
    }
    // Safari doesn't support table.tHead, sigh
    if (table.tHead == null) table.tHead = table.getElementsByTagName('thead')[0];
    
    if (table.tHead.rows.length != 1) return; // can't cope with two header rows
    
    // Sorttable v1 put rows with a class of "sortbottom" at the bottom (as
    // "total" rows, for example). This is B&R, since what you're supposed
    // to do is put them in a tfoot. So, if there are sortbottom rows,
    // for backwards compatibility, move them to tfoot (creating it if needed).
    sortbottomrows = [];
    for (var i=0; i<table.rows.length; i++) {
      if (table.rows[i].className.search(/\bsortbottom\b/) != -1) {
        sortbottomrows[sortbottomrows.length] = table.rows[i];
      }
    }
    if (sortbottomrows) {
      if (table.tFoot == null) {
        // table doesn't have a tfoot. Create one.
        tfo = document.createElement('tfoot');
        table.appendChild(tfo);
      }
      for (var i=0; i<sortbottomrows.length; i++) {
        tfo.appendChild(sortbottomrows[i]);
      }
      delete sortbottomrows;
    }
    
    // work through each column and calculate its type
    headrow = table.tHead.rows[0].cells;
    for (var i=0; i<headrow.length; i++) {
      // manually override the type with a sorttable_type attribute
      if (!headrow[i].className.match(/\bsorttable_nosort\b/)) { // skip this col
        mtch = headrow[i].className.match(/\bsorttable_([a-z0-9]+)\b/);
        if (mtch) { 
			var override = mtch[1]; 
		}
	      if (mtch && typeof SortTable["sort_"+override] == 'function') {
	        headrow[i].sorttable_sortfunction = SortTable["sort_"+override];
	      } else {
	        headrow[i].sorttable_sortfunction = SortTable.guessType(table,i);
	      }
	      // make it clickable to sort
	      headrow[i].sorttable_columnindex = i;
	      headrow[i].sorttable_tbody = table.tBodies[0];
	      
		  
		  var resetStriping = function () {
			J.toArray( table.getElementsByTagName( 'tr' ) ).each(function (tr, i) {
				J.removeClass( tr, 'alt' )
				if ( (i%2) ) {
					J.addClass( tr, 'alt' )
				}
			});
		  };
		  
		  J.addEvent( headrow[i], "click", function (e) {
				var sortfwdind, sortrevind, theadrow, row_array, col, rows;
		  
			  if (this.className.search(/\bsorttable_sorted\b/) != -1) {
				// if we're already sorted by this column, just 
				// reverse the table, which is quicker
				SortTable.reverse(this.sorttable_tbody);
				this.className = this.className.replace('sorttable_sorted',
														'sorttable_sorted_reverse');
				this.removeChild(document.getElementById('sorttable_sortfwdind'));
				sortrevind = document.createElement('span');
				sortrevind.id = "sorttable_sortrevind";
				sortrevind.innerHTML = stIsIE ? '&nbsp<font face="webdings">5</font>' : '&nbsp;&#x25B4;';
				this.appendChild(sortrevind);
				resetStriping();
				return;
			  }
			  if (this.className.search(/\bsorttable_sorted_reverse\b/) != -1) {
				// if we're already sorted by this column in reverse, just 
				// re-reverse the table, which is quicker
				SortTable.reverse(this.sorttable_tbody);
				this.className = this.className.replace('sorttable_sorted_reverse',
														'sorttable_sorted');
				this.removeChild(document.getElementById('sorttable_sortrevind'));
				sortfwdind = document.createElement('span');
				sortfwdind.id = "sorttable_sortfwdind";
				sortfwdind.innerHTML = stIsIE ? '&nbsp<font face="webdings">6</font>' : '&nbsp;&#x25BE;';
				this.appendChild(sortfwdind);
				resetStriping();
				return;
			  }
			  
			  // remove sorttable_sorted classes
			  theadrow = this.parentNode;
			  J.toArray( theadrow.childNodes ).each(function(cell) {
				if (cell.nodeType == 1) { // an element
				  cell.className = cell.className.replace('sorttable_sorted_reverse','');
				  cell.className = cell.className.replace('sorttable_sorted','');
				}
			  });
			  sortfwdind = document.getElementById('sorttable_sortfwdind');
			  if (sortfwdind) { sortfwdind.parentNode.removeChild(sortfwdind); }
			  sortrevind = document.getElementById('sorttable_sortrevind');
			  if (sortrevind) { sortrevind.parentNode.removeChild(sortrevind); }
			  
			  this.className += ' sorttable_sorted';
			  var sortfwdind = document.createElement('span');
			  sortfwdind.id = "sorttable_sortfwdind";
			  sortfwdind.innerHTML = stIsIE ? '&nbsp<font face="webdings">6</font>' : '&nbsp;&#x25BE;';
			  this.appendChild(sortfwdind);

				// build an array to sort. This is a Schwartzian transform thing,
				// i.e., we "decorate" each row with the actual sort key,
				// sort based on the sort keys, and then put the rows back in order
				// which is a lot faster because you only do getInnerText once per row
				row_array = [];
				col = this.sorttable_columnindex;
				rows = this.sorttable_tbody.rows;
				for (var j=0; j<rows.length; j++) {
				  row_array[row_array.length] = [SortTable.getInnerText(rows[j].cells[col]), rows[j]];
				}
				/* If you want a stable sort, uncomment the following line */
				//sorttable.shaker_sort(row_array, this.sorttable_sortfunction);
				/* and comment out this one */
				row_array.sort(this.sorttable_sortfunction);
				
				var tb = this.sorttable_tbody;
				for (var j=0; j<row_array.length; j++) {
				  tb.appendChild(row_array[j][1]);
				}
	
				delete row_array;
				resetStriping();		
	      });
	    }
    }
  },
  
  guessType: function(table, column) {
    // guess the type of a column based on its first non-blank row
    var sortfn = SortTable.sort_alpha;
    for (var i=0; i<table.tBodies[0].rows.length; i++) {
      var text = SortTable.getInnerText(table.tBodies[0].rows[i].cells[column]);
      if (text != '') {
        if (text.match(/^-?[£$¤]?[\d,.]+%?$/)) {
          return SortTable.sort_numeric;
        }
        // check for a date: dd/mm/yyyy or dd/mm/yy 
        // can have / or . or - as separator
        // can be mm/dd as well
        var possdate = text.match(SortTable.DATE_RE)
        if (possdate) {
          // looks like a date
          first = parseInt(possdate[1]);
          second = parseInt(possdate[2]);
          if (first > 12) {
            // definitely dd/mm
            return SortTable.sort_ddmm;
          } else if (second > 12) {
            return SortTable.sort_mmdd;
          } else {
            // looks like a date, but we can't tell which, so assume
            // that it's dd/mm (English imperialism!) and keep looking
            sortfn = SortTable.sort_ddmm;
          }
        }
      }
    }
    return sortfn;
  },
  
  getInnerText: function(node) {
    // gets the text we want to use for sorting for a cell.
    // strips leading and trailing whitespace.
    // this is *not* a generic getInnerText function; it's special to sorttable.
    // for example, you can override the cell text with a customkey attribute.
    // it also gets .value for <input> fields.
    var hasInputs;
	
    hasInputs = (typeof node.getElementsByTagName == 'function') &&
                 node.getElementsByTagName('input').length;
    
    if (node.getAttribute("sorttable_customkey") != null) {
      return node.getAttribute("sorttable_customkey");
    }
    else if (typeof node.textContent != 'undefined' && !hasInputs) {
      return node.textContent.replace(/^\s+|\s+$/g, '');
    }
    else if (typeof node.innerText != 'undefined' && !hasInputs) {
      return node.innerText.replace(/^\s+|\s+$/g, '');
    }
    else if (typeof node.text != 'undefined' && !hasInputs) {
      return node.text.replace(/^\s+|\s+$/g, '');
    }
    else {
      switch (node.nodeType) {
        case 3:
          if (node.nodeName.toLowerCase() == 'input') {
            return node.value.replace(/^\s+|\s+$/g, '');
          }
        case 4:
          return node.nodeValue.replace(/^\s+|\s+$/g, '');
          break;
        case 1:
        case 11:
          var innerText = '';
          for (var i = 0; i < node.childNodes.length; i++) {
            innerText += SortTable.getInnerText(node.childNodes[i]);
          }
          return innerText.replace(/^\s+|\s+$/g, '');
          break;
        default:
          return '';
      }
    }
  },
  
  reverse: function(tbody) {
    // reverse the rows in a tbody
    newrows = [];
    for (var i=0; i<tbody.rows.length; i++) {
      newrows[newrows.length] = tbody.rows[i];
    }
    for (var i=newrows.length-1; i>=0; i--) {
       tbody.appendChild(newrows[i]);
    }
    delete newrows;
  },
  
  /* sort functions
     each sort function takes two parameters, a and b
     you are comparing a[0] and b[0] */
  sort_numeric: function(a,b) {
    var aa = parseFloat(a[0].replace(/[^0-9.-]/g,''));
    if (isNaN(aa)) aa = 0;
    var bb = parseFloat(b[0].replace(/[^0-9.-]/g,'')); 
    if (isNaN(bb)) bb = 0;
    return aa-bb;
  },
  
  sort_datetime: function(a,b) {
    var parse = function (a) {
		//console.log(a);
		var parts = a.split(' ');
		var date = parts[0].split('-').reverse().join('');
		return date + parts[1];
	}
	a[0] = parse(a[0]);
	b[0] = parse(b[0]);

	if (a[0] == b[0]) return 0;
    if (a[0] < b[0]) return -1;
    return 1;
  },
  
  sort_alpha: function(a,b) {
    if (a[0]==b[0]) return 0;
    if (a[0]<b[0]) return -1;
    return 1;
  },
  sort_fee: function(a,b) {
	var patt = /,|\./g;
	a = parseInt(a[0].replace(patt, '').substring(1), 10);
	b = parseInt(b[0].replace(patt, '').substring(1), 10);
	if (a === b) return 0;
    if (a < b) return -1;
    return 1;
  },
  sort_ddmm: function(a,b) {
    var mtch = a[0].match(SortTable.DATE_RE);
    y = mtch[3]; m = mtch[2]; d = mtch[1];
    if (m.length == 1) m = '0'+m;
    if (d.length == 1) d = '0'+d;
    dt1 = y+m+d;
    mtch = b[0].match(SortTable.DATE_RE);
    y = mtch[3]; m = mtch[2]; d = mtch[1];
    if (m.length == 1) m = '0'+m;
    if (d.length == 1) d = '0'+d;
    dt2 = y+m+d;
    if (dt1==dt2) return 0;
    if (dt1<dt2) return -1;
    return 1;
  },
  sort_mmdd: function(a,b) {
    var mtch = a[0].match(SortTable.DATE_RE);
    y = mtch[3]; d = mtch[2]; m = mtch[1];
    if (m.length == 1) m = '0'+m;
    if (d.length == 1) d = '0'+d;
    dt1 = y+m+d;
    mtch = b[0].match(SortTable.DATE_RE);
    y = mtch[3]; d = mtch[2]; m = mtch[1];
    if (m.length == 1) m = '0'+m;
    if (d.length == 1) d = '0'+d;
    dt2 = y+m+d;
    if (dt1==dt2) return 0;
    if (dt1<dt2) return -1;
    return 1;
  },
  
  shaker_sort: function(list, comp_func) {
    // A stable sort function to allow multi-level sorting of data
    // see: http://en.wikipedia.org/wiki/Cocktail_sort
    // thanks to Joseph Nahmias
    var b = 0;
    var t = list.length - 1;
    var swap = true;

    while(swap) {
        swap = false;
        for(var i = b; i < t; ++i) {
            if ( comp_func(list[i], list[i+1]) > 0 ) {
                var q = list[i]; list[i] = list[i+1]; list[i+1] = q;
                swap = true;
            }
        } // for
        t--;

        if (!swap) break;

        for(var i = t; i > b; --i) {
            if ( comp_func(list[i], list[i-1]) < 0 ) {
                var q = list[i]; list[i] = list[i-1]; list[i-1] = q;
                swap = true;
            }
        } // for
        b++;

    } // while(swap)
  }  
}



})();