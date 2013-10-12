var fs = require('fs');
var Path = require('path');
var helper = require('./modules/helper.js');

var config = require('./config.js').config;

var size = config.downloadTileSize;

scan('luftbild2011', 20);

function scan(name, zoom) {
	var sourceFolder = '../data/tiles/'+name+'/'+zoom+'/';
	var imageList = [];

	// Suche nach Tiles
	fs.readdirSync(sourceFolder).forEach(function (x) {
		if (x.match(/^[0-9]+$/)) {
			x = parseInt(x, 10);
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

	var todos = [];

	function mergerRec(imageList, zoom) {
		console.log('Level '+(zoom-1));

		var newTiles = {};
		imageList.forEach(function (entry) {
			var nx = Math.floor(entry.x/2);
			var ny = Math.floor(entry.y/2);
			var id = nx+'_'+ny;
			if (newTiles[id] === undefined) newTiles[id] = { x:nx, y:ny, images:[], newestDate:-1 }
			newTiles[id].images.push(entry);

			if (fs.existsSync(entry.filename)) {
				var date = fs.statSync(entry.filename).mtime;
				if (date > newTiles[id].newestDate) newTiles[id].newestDate = date;
			}
			if (entry.isNew) {
				newTiles[id].isNew = true;
			}
		});

		var newImageList = [];
		Object.keys(newTiles).forEach(function (key) {
			var newTile = newTiles[key];
			var newFilename = '../data/tiles/'+name+'/'+(zoom-1)+'/'+newTile.x+'/'+newTile.y+'.png';
			var newImage = {
				x:newTile.x,
				y:newTile.y,
				filename:newFilename
			};
			newImageList.push(newImage);

			if (!newTile.isNew && fs.existsSync(newFilename)) {
				if ((newTile.newestDate > 0) && (fs.statSync(newFilename).mtime > newTile.newestDate)) {
					return;
				}
			}

			newImage.isNew = true;

			ensureFolder(newFilename);

			var command = newTile.images.map(function (entry) {
				return entry.filename+' -geometry +'+(entry.x % 2)*256+'+'+(entry.y % 2)*256+' -composite';
			})
			command = 'convert -size 512x512 xc:none -fill white '+command.join(' ')+' -filter Box -resize 256x256 '+newFilename;
			todos.push(command);
		})

		if (zoom > 1) mergerRec(newImageList, zoom-1);
	}

	mergerRec(imageList, zoom);

	fs.writeFileSync('./script_merge_'+name+'.sh', helper.makeBash(todos), 'utf8');
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