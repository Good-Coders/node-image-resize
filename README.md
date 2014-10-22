node-image-resize
================

Node library to re-size and scale images

### USAGE:
If you want to smartResizeDown: (downscale only)
This will resize an image in the current directory name "large.png" to "small.png"

```javascript
var ImageResize = require('node-image-resize'),
    fs = require('fs'),
    path = require('path');

var image = new ImageResize(path.join(__dirname,'large.png'));

image.loaded().then(function(){
    image.smartResizeDown({
        width: 200,
        height: 200
    }).then(function () {
        image.stream(function (err, stdout, stderr) {
            var writeStream = fs.createWriteStream(path.join(__dirname,'small.png'));
            stdout.pipe(writeStream);
        });
    });
});

```
