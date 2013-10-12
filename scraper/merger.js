var fs = require('fs');
var Path = require('path');

var config = require('./config.js').config;

var size = config.downloadTileSize;

scan('luftbild2011', 17);

function scan(name, zoom) {
	var sourceFolder = '../data/big/'+name+'/'+zoom+'/';
	var imageList = [];
	var xs = [];

	// Suche nach Tiles
	fs.readdirSync(sourceFolder).forEach(function (x) {
		if (x.match(/^[0-9]+$/)) {
			x = parseInt(x, 10);
			xs.push(x);
			fs.readdirSync(sourceFolder+x).forEach(function (filename) {
				if (filename.match(/^[0-9]+\.png$/)) {
					var y = parseInt(filename.match(/[0-9]+/)[0], 10);
					imageList.push({
						x:x,
						y:y,
						filename:sourceFolder+x+'/'+filename
					});
				}
			})
		}
	})

	// generiere kleine Tiles
	var factor = size/256;
	var newZoom = zoom+Math.round(Math.log(factor)/Math.LN2);

	xs.forEach(function (x) {
		for (var dx = 0; dx < factor; dx++) {
			var newFolder = '../data/tiles/'+name+'/'+newZoom+'/'+(x*factor+dx)+'/a';
			ensureFolder(newFolder);
		}
	})

	var todos1 = [];
	imageList.forEach(function (entry) {
		var newFolder = '../data/tiles/'+name+'/'+newZoom+'/'+entry.x*factor+'/'+entry.y*factor;

		if (!fs.existsSync(newFolder+'.png')) {
			todos1.push('echo "'+zoom+'/'+entry.x+'/'+entry.y+'"');

			todos1.push(
				'convert -crop 256x256 +repage ../data/big/luftbild2011/'+zoom+'/'+entry.x+'/'+entry.y+'.png '+newFolder+'_%d.png')
			
			var i = 0;
			for (var dy = 0; dy < factor; dy++) {
				for (var dx = 0; dx < factor; dx++) {
					todos1.push('mv '+newFolder+'_'+i+'.png ../data/tiles/'+name+'/'+newZoom+'/'+(entry.x*factor+dx)+'/'+(entry.y*factor+dy)+'.png');
					i++;
				}
			}
		}
	})

	fs.writeFileSync('./convert1_'+name+'.sh', todos1.join('\n'), 'utf8');
}

function ensureFolder(folder) {
	folder = Path.resolve(Path.dirname(require.main.filename), folder);

	var rec = function (fol) {
		if (fol != '/') {
			rec(Path.dirname(fol));
			if (!fs.existsSync(fol)) fs.mkdirSync(fol);
		}
	}

	rec(Path.dirname(folder));
}