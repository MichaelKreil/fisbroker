exports.config = {
	downloadTileSize: 2048,
	imageFormat: 'png',
	sources: [
		{
			url: 'http://fbinter.stadt-berlin.de/fb/wms/senstadt/k_luftbild2011_20',
			name: 'luftbild2011', 
			zoom: 17,
			minx: 13.079,
			miny: 52.3284,
			maxx: 13.7701,
			maxy: 52.6877
		},
		{
			url: 'http://fbinter.stadt-berlin.de/fb/wms/senstadt/k_luftbild2010_rgb',
			name: 'luftbild2010', 
			zoom: 17,
			minx: 13.079,
			miny: 52.3284,
			maxx: 13.7701,
			maxy: 52.6877
		},
		{
			url: 'http://fbinter.stadt-berlin.de/fb/wms/senstadt/k_luftbild2009_20',
			name: 'luftbild2009', 
			zoom: 17,
			minx: 13.079,
			miny: 52.3284,
			maxx: 13.7701,
			maxy: 52.6877
		},
		{
			url: 'http://fbinter.stadt-berlin.de/fb/wms/senstadt/k_luftbild2007',
			name: 'luftbild2007', 
			zoom: 17,
			minx: 13.079,
			miny: 52.3284,
			maxx: 13.7701,
			maxy: 52.6877
		},
		{
			url: 'http://fbinter.stadt-berlin.de/fb/wms/senstadt/luftbild2004',
			name: 'luftbild2004', 
			zoom: 17,
			minx: 13.079,
			miny: 52.3284,
			maxx: 13.7701,
			maxy: 52.6877
		}
	]
}
