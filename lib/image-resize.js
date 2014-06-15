'use strict';

var gm = require('gm'),
	Q = require('q');

// gm.subClass({imageMagick: true});

function ImageResize(filePath) {
	var image = this;
	var defDimensions = Q.defer();
	var defFormat = Q.defer();

	image.gm = gm(filePath)
		.size(function (err, value) {
			image.dimensions = value;
			defDimensions.resolve();
		})
		.format(function (err, value) {
			image.format = value;
			defFormat.resolve();
		});

	image.isLoaded = Q.all([defDimensions.promise, defFormat.promise]);
}

ImageResize.prototype.dimensions = {
	width: null,
	height: null
};
ImageResize.prototype.format = null;
ImageResize.prototype.orientation = null;
ImageResize.prototype.gm = null;


ImageResize.prototype.loaded = function () {
	return this.isLoaded;
};

ImageResize.prototype.stream = function (cb) {
	return this.gm.stream(cb);
};


ImageResize.prototype.smartResizeDown = function (options) {
	var deferred = Q.defer();
	var image = this;

	// For future use of SVG on the fly
	if(!image.format){
		image.gm.setFormat('PNG');
	}

	// Both Dimensions
	if ((!options.minWidth && !options.minHeight) || (options.minWidth && options.minHeight)) {
		if(image.format !== 'JPEG'){
			image.gm.background('transparency');
		}
		options.width = (options.minWidth) ? options.minWidth : options.width;
		options.height = (options.minHeight) ? options.minHeight : options.height;

		if(options.width > 0 && options.height > 0){
			image.gm.resize(options.width, options.height, '>').compose('Copy').gravity('Center').extent(options.width, options.height);
		}
		deferred.resolve();
	} else if (options.minHeight && options.width > 0) {
		// Need to get new width and then determine if we need to do a resize
		gm(image.gm.resize(options.width, null, '>').stream()).size(function (err, value) {
			if (err) {
				deferred.reject();
			} else {
				if(image.format !== 'JPEG'){
					image.gm.background('transparency');
				}
				image.gm.resize(options.width, null, '>').compose('Copy').gravity('Center').extent(options.width, (value.height < options.minHeight) ? options.minHeight : value.height);
				deferred.resolve();
			}
		});
	} else if (options.minWidth && options.height > 0) {
		gm(image.gm.resize(null, options.height, '>').stream()).size(function (err, value) {
			if (err) {
				deferred.reject();
			} else {
				if(image.format !== 'JPEG'){
					image.gm.background('transparency');
				}
				image.gm.resize(null, options.height, '>').compose('Copy').gravity('Center').extent((value.width < options.minWidth) ? options.minWidth : value.width, options.height);
				deferred.resolve();
			}
		});
	} else {
		deferred.resolve();
	}
	return deferred.promise;
};

module.exports = ImageResize;