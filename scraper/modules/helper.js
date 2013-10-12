
exports.makeBash = function (array) {
	var newArray = [];
	var n = array.length;
	var lastP = -1;
	for (var i = 0; i < n; i++) {
		var p = i/n;
		p = Math.floor(p*20)/20;
		p = (100*p).toFixed(0);
		if (p != lastP) {
			newArray.push('echo "'+p+'%"');
			lastP = p;
		}
		newArray.push(array[i]);
	}
	return newArray.join('\n');
}