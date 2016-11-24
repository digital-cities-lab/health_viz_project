//var munkres = require('munkres-js');

var regions = [{x:1, y:6}, {x:1, y:5}, {x:2, y:3}, {x:3, y:2}, {x:4, y:1}, {x:5, y:3}, {x:5, y:4}, {x:5, y:6}, {x:4, y:4}, {x:3, y:5}, {x:3, y:6}, {x:2, y:6}];
var cells =   [{x:2, y:1}, {x:3, y:1}, {x:4, y:1}, {x:5, y:1}, {x:5, y:3}, {x:5, y:4}, {x:5, y:5}, {x:4, y:5}, {x:3, y:5}, {x:2, y:5}, {x:2, y:4}, {x:2, y:3}];

var matrix = [];
for (var i = 0; i <= regions.length - 1; i++) {
    matrix[i] = [];
    for (var j = 0; j <= cells.length - 1; j++) {
        matrix[i][j] = (regions[i].x - cells[j].x) * (regions[i].x - cells[j].x) + (regions[i].y - cells[j].y) * (regions[i].y - cells[j].y);
    }
}

var ret = munkres(matrix);
console.log(ret);