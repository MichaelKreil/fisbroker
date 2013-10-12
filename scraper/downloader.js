var FS = require('fs');
var Request = require('request');
var Async = require('async');
var Path = require('path');

var config = require('./config.js').config;

var PI = Math.PI;
var size = config.downloadTileSize;
var todos = [];

config.sources.forEach(function (source) {
	var zoom = source.zoom;

	var p0 = LL2XY([source.minx, source.maxy], zoom);
	var p1 = LL2XY([source.maxx, source.miny], zoom);

	var x0 = Math.floor(p0[0]);
	var y0 = Math.floor(p0[1]);
	var x1 = Math.ceil(p1[0]);
	var y1 = Math.ceil(p1[1]);

	for (var x = x0; x <= x1; x++) {
		for (var y = y0; y <= y1; y++) {
			var p1 = XY2LL([x,y+1],zoom);
			var p2 = XY2LL([x+1,y],zoom);

			var url = source.url;
			url += '?SERVICE=WMS&REQUEST=GetMap&VERSION=1.1.1&LAYERS=0&STYLES=fill&FORMAT=image%2F'+config.imageFormat;
			url += '&TRANSPARENT=true&HEIGHT='+size+'&WIDTH='+size+'&SRS=EPSG%3A4326&BBOX=';
			url += [p1[0], p1[1], p2[0], p2[1]].join(',');

			var todo = {
				url: url,
				file: '../data/big/'+source.name+'/'+[zoom,x,y].join('/')+'.png'
			};

			if (!FS.existsSync(todo.file)) {
				todos.push(todo);
			}
		}
	}
})


var n = todos.length;
var starttime = (new Date()).getTime();
var i = 0;

Async.eachSeries(
	todos,
	function (entry, callback) {
		var time = '';
		if (i > 0) {
			time = n*((new Date()).getTime()-starttime)/i + starttime;
			time = new Date(time);
			time = ' - '+time.toString().substr(0,24);
		}

		console.log('Lade '+entry.file+time);
		
		ensureFolder(entry.file);

		var stream = Request(entry.url);
		stream.pipe(FS.createWriteStream(entry.file))
		stream.on('end', callback);

		i++
	},
	function (err) {
	}
)


function LL2XY(p,z) {
	var zoom = Math.pow(2, -z);

	return [
		(p[0]/180+1)/(zoom*2),
		(1-Math.log(Math.tan(PI/4+p[1]*PI/360))/PI)/(zoom*2)-1
	]
}

function XY2LL(p,z) {
	var zoom = Math.pow(2, -z);

	return [
		180*(p[0]*zoom*2-1),
		180*(2*Math.atan(Math.exp((1-(p[1]+1)*zoom*2)*PI))-PI/2)/PI
	]
}


function ensureFolder(folder) {
	folder = Path.resolve(Path.dirname(require.main.filename), folder);

	var rec = function (fol) {
		if (fol != '/') {
			rec(Path.dirname(fol));
			if (!FS.existsSync(fol)) FS.mkdirSync(fol);
		}
	}

	rec(Path.dirname(folder));
}