/**
 * @author mrdoob / http://mrdoob.com/
 * @author jetienne / http://jetienne.com/
 * @author paulirish / http://paulirish.com/
 */
var MemoryStats = function (){

	var msMin	= 100;
	var msMax	= 0;
	var GRAPH_HEIGHT = 30;
	var redrawMBThreshold = GRAPH_HEIGHT;

	var container	= document.createElement( 'div' );
	container.id	= 'stats';
	container.style.cssText = 'width:80px;height:48px;opacity:0.9;cursor:pointer;overflow:hidden;';

	var msDiv	= document.createElement( 'div' );
	msDiv.id	= 'ms';
	msDiv.style.cssText = 'padding:0 0 3px 3px;text-align:left;background-color:#020;';
	container.appendChild( msDiv );

	var msText	= document.createElement( 'div' );
	msText.id	= 'msText';
	msText.style.cssText = 'color:#0f0;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px';
	msText.innerHTML= 'Memory';
	msDiv.appendChild( msText );

	var msGraph	= document.createElement( 'div' );
	msGraph.id	= 'msGraph';
	msGraph.style.cssText = 'position:relative;width:74px;height:' + GRAPH_HEIGHT + 'px;background-color:#0f0';
	msDiv.appendChild( msGraph );

	while ( msGraph.children.length < 74 ) {

		var bar = document.createElement( 'span' );
		bar.style.cssText = 'width:1px;height:' + GRAPH_HEIGHT + 'px;float:left;background-color:#131';
		msGraph.appendChild( bar );

	}

	var updateGraph = function ( dom, height, color ) {

		var child = dom.appendChild( dom.firstChild );
		child.style.height = height + 'px';
		if( color ) child.style.backgroundColor = color;

	};

	var redrawGraph = function(dom, oHFactor, hFactor) {
		[].forEach.call(dom.children, function(c) {
			var cHeight = c.style.height.substring(0, c.style.height.length-2);

			// Convert to MB, change factor
			var newVal = GRAPH_HEIGHT - ((GRAPH_HEIGHT - cHeight)/oHFactor) * hFactor;

			c.style.height = newVal + 'px';
		});
	};

	// polyfill usedJSHeapSize
	if (window.performance && !performance.memory){
		performance.memory = { usedJSHeapSize : 0, totalJSHeapSize : 0 };
	}

	// support of the API?
	if( performance.memory.totalJSHeapSize === 0 ){
		console.warn('totalJSHeapSize === 0... performance.memory is only available in Chrome .');
	}

	// TODO, add a sanity check to see if values are bucketed.
	// If so, reminde user to adopt the --enable-precise-memory-info flag.
	// open -a "/Applications/Google Chrome.app" --args --enable-precise-memory-info

	var lastTime	= Date.now();
	var lastUsedHeap= performance.memory.usedJSHeapSize;
	return {
		domElement: container,

		update: function () {

			// refresh only 30time per second
			if( Date.now() - lastTime < 1000/30 )	return;
			lastTime	= Date.now();

			var delta	= performance.memory.usedJSHeapSize - lastUsedHeap;
			lastUsedHeap	= performance.memory.usedJSHeapSize;
			var color	= delta < 0 ? '#830' : '#131';

			var ms	= performance.memory.usedJSHeapSize;
			msMin	= Math.min( msMin, ms );
			msMax	= Math.max( msMax, ms );
			msText.textContent = "Mem: " + bytesToSize(ms, 2);

			var mbValue	= ms / (1024*1024);
			
			if(mbValue > redrawMBThreshold) {
				var factor = (mbValue - (mbValue % GRAPH_HEIGHT))/ GRAPH_HEIGHT;
				var newThreshold = GRAPH_HEIGHT * (factor + 1);
				redrawGraph(msGraph, GRAPH_HEIGHT/redrawMBThreshold, GRAPH_HEIGHT/newThreshold);
				redrawMBThreshold = newThreshold;
			}

			updateGraph( msGraph, GRAPH_HEIGHT-mbValue*(GRAPH_HEIGHT/redrawMBThreshold), color);

			function bytesToSize( bytes, nFractDigit ){
				var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
				if (bytes === 0) return 'n/a';
				nFractDigit	= nFractDigit !== undefined ? nFractDigit : 0;
				var precision	= Math.pow(10, nFractDigit);
				var i 		= Math.floor(Math.log(bytes) / Math.log(1024));
				return Math.round(bytes*precision / Math.pow(1024, i))/precision + ' ' + sizes[i];
			}
		}

	};

};

if (typeof module !== "undefined" && module.exports) {
	module.exports = MemoryStats;
}
