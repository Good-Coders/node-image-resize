node-image-resize
================

Node library to re-size and scale images

### USAGE:
If you want to smartResizeDown: (downscale only)

```javascript
var ImageResize = require('node-image-resize'),
    fs = require('fs');

var image = new ImageResize('image.png');
image.loaded.then(function(){
    image.smartResizeDown({
        width: 200,
        height: 200
    }).then(function () {
        image.stream(function (err, stdout, stderr) {
            var writeStream = fs.createWriteStream('/path/to/my/resized.jpg');
            stdout.pipe(writeStream);
        });
    });
});

```
