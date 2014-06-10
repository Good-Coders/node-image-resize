'use strict';

var gm = require('gm');
var Q = require('q');

function ImageResize(filePath) {
	var image = this;
	// TODO : image can be path or binary in the future
	// TODO : for now assume it is a file
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
		options.width = (options.minWidth) ? options.minWidth : options.width;
		options.height = (options.minHeight) ? options.minHeight : options.height;

		image.gm.resize(options.width, options.height, '>');
		if(image.format !== 'JPEG'){
			image.gm.background('transparency');
		}
		image.gm.compose('Copy').gravity('Center').extent(options.width, options.height);
		deferred.resolve();
	} else if (options.minHeight) {
		image.gm.resize(options.width, null);
		// Need to get new width and then determine if we need to do a resize
		image.gm.size(function (err, value) {
			if (!err) {
				if (value.height < options.minHeight) {
					if(image.format !== 'JPEG'){
						image.gm.background('transparency');
					}
					image.gm.compose('Copy').gravity('Center').extent(options.width, options.minHeight);
				}
				deferred.resolve();
			}
			deferred.reject();
		});
	} else if (options.minWidth) {
		image.gm.resize(null, options.height);
		image.gm.size(function (err, value) {
			if (!err) {
				if (value.width < options.minWidth) {
					if(image.format !== 'JPEG'){
						image.gm.background('transparency');
					}
					image.gm.compose('Copy').gravity('Center').extent(options.minWidth, options.height);
				}
				deferred.resolve();
			}
			deferred.reject();
		});
	}
	return deferred.promise;
};

module.exports = ImageResize;