var Phaser = require("phaser");

var game = new Phaser.Game(800, 600, Phaser.AUTO, '');

game.state.add("game", (function(){
	return {
		preload(){
/*			game.load.spritesheet("testball", "assets/testball.png", 64, 64);
			game.load.start();*/
		},
		create(){
			var field = window.field = new Field({
				game,
				rect: {
					x: 30,
					y: 30,
					h: 540,
					w: 740
				}
			});
		}
	}
})());

game.state.start("game");


function Field({game, rect}){
	const grid = {
		tileWidth: 52,
		tileHeight: 78,
		margin: 16
	};
	var cols = 8;
	var rows = 5;
	var dotcol = 5;

	var group = game.add.group();
	function adjust(rect){
		var width = (grid.tileWidth + grid.margin)*cols - grid.margin;
		var height = (grid.tileHeight + grid.margin)*rows - grid.margin;
		var scale = Math.min(rect.w/width, rect.h/height);
		width *= scale;
		height *= scale;
		group.x = rect.x + (rect.w - width)/2;
		group.y = rect.y + (rect.h - height)/2;
		group.scale.x = group.scale.y = scale;
	}
	adjust(rect);
	var tiles = [];
	var events = {
		click(tile){
			var i = tile.y,
				j = tile.x;
			if(j >= cols - 2){
				return;
			}
			var checksum1 = tile.value + tiles[i][j + 1].value;
			var checksum2 = tile.value + tiles[i][j + 2].value;
			if(checksum1 != 1 || checksum2 != 1){
				return;
			}
			if(tile.value){
				tile.switch();
				tiles[i][j + 1].switch();
				tiles[i][j + 2].switch();
				tiles[i][j + 1].moveAndBack(-1, 0);
				tiles[i][j + 2].moveAndBack(-2, 0);
			}else{
				tiles[i][j + 1].moveAndBack(-1, 0, function(){
					tile.switch();
					tiles[i][j + 1].switch();
				});
				tiles[i][j + 2].moveAndBack(-2, 0, function(){
					tiles[i][j + 2].switch();
				});
			}
		}
	}
	for(let i = 0; i < rows; i++){
		let row = [];
		for(let j = 0; j < cols; j++){
			row.push(new Tile({
				game,
				group,
				grid,
				x: j,
				y: i,
				value: Math.random() > 0.5 ? 1 : 0,
				events
			}));
		}
		tiles.push(row);
	}
	
	this.test = function(i, j){
		tiles[i][j].value = 1 - tiles[i][j].value;
	}
}

function Tile({game, group, grid, x, y, value, events}){
	var self = this;
	var g = game.add.graphics(
		x*(grid.tileWidth + grid.margin),
		y*(grid.tileHeight + grid.margin), 
		group
	);
	g.inputEnabled = true;
	g.events.onInputDown.add(() => events.click(self));
	var redraw = this.redraw = function(){
		g.clear();
		g.lineStyle(2, 0xffffff, 1);
		g.beginFill(0xf00ba5, 1)
			.drawRect(0, 0, grid.tileWidth, grid.tileHeight)
			.endFill();
		if(value){
			g.lineStyle(10, 0, 1);
			g.beginFill(0, 1)
				.moveTo(grid.tileWidth/2, grid.tileHeight/6)
				.lineTo(grid.tileWidth/2, grid.tileHeight*5/6)
				.endFill();
		}
	}
	redraw();
	
	this.moveAndBack = function(dx, dy, cb){
		var gx = g.x,
			gy = g.y;
		if(cb){
			game.add.tween(g).to({
				x: (x + dx)*(grid.tileWidth + grid.margin), 
				y: (y + dy)*(grid.tileHeight + grid.margin)
			}, 300, "Linear", true)
			.chain(
				game.add.tween(g).from({alpha: 0}, 200, "Linear")
			)
			.onComplete.add(function(){
				g.x = gx;
				g.y = gy;
				cb();
			});

		}else{
			g.x = (x + dx)*(grid.tileWidth + grid.margin);
			g.y = (y + dy)*(grid.tileHeight + grid.margin);	
			game.add.tween(g).to({x: gx, y: gy}, 300, "Linear", true);
		}
	}
	
	this.switch = function(){
		value = 1 - value;
		redraw();
	}

	Object.defineProperties(this, {
		value: {
			get: () => value,
			set: function(_){
				value = _;
				redraw();
			}
		},
		x: {
			get: () => x,
			set: function(_){
				x = _;
				g.x = x*(grid.tileWidth + grid.margin);
			}
		},
		y: {
			get: () => y,
			set: function(_){
				y = _;
				g.y = y*(grid.tileHeight + grid.margin);
			}
		},
	});

}