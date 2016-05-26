var Phaser = require("phaser");

var game = new Phaser.Game(800, 600, Phaser.AUTO, '', "game", true);

game.state.add("game", (function(){
	return {
		preload(){
			game.load.spritesheet("tile", "assets/tile.png", 48, 72);
			game.load.image("dot", "assets/dot.png");
			game.load.start();
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



function Field({game, rect}){
	const grid = {
		tileWidth: 48,
		tileHeight: 72,
		margin: 6
	};
	var cols = 11;
	var rows = 6;
	var dotcol = 6;

	var group = game.add.group();

	var dots = game.add.group(group);
	dots.x = (dotcol - 1)*(grid.tileWidth + grid.margin);
	for(let i = 0; i < rows; i++){
		let img = game.add.image(-grid.margin/2, i*(grid.tileHeight + grid.margin) + grid.tileHeight, "dot");
		img.anchor.x = img.anchor.y = 0.5;
		dots.add(img);
	}
	var tiles = [];
	var afterTweenStop = [];
	var tweenCounter = 0;
	var events = {
		beginTween(){
			tweenCounter++;
			tiles.forEach(row => row.forEach(tile => tile.inputEnabled = false));
		},
		endTween(){
			console.log(--tweenCounter);
			if(!tweenCounter){
				tiles.forEach(row => row.forEach(tile => tile.inputEnabled = true));
				while(afterTweenStop.length){
					afterTweenStop.pop()();
				}
			}
		},
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
				afterTweenStop.push(() => adjust(rect));
			}else{
				tiles[i][j + 1].moveAndBack(-1, 0, true);
				tiles[i][j + 2].moveAndBack(-2, 0, true);
				afterTweenStop.push(function(){
					tile.switch();
					tiles[i][j + 1].switch();
					tiles[i][j + 2].switch();
					adjust(rect);
				});
			}
		},
		drag(tile, dir){
			if(dir && tile.y == 0){
				return;
			}
			if(!dir && tile.y == rows - 1){
				return;
			}
			var otherTile = dir ? tiles[tile.y-1][tile.x] : tiles[tile.y+1][tile.x];
			if(tile.value + otherTile.value == 1){
				tile.switch();
				otherTile.switch();
			}
		}
	}
	for(let i = 0; i < rows; i++){
		let row = [];
		for(let j = 0; j < cols; j++){
			let value;
			if(j == 0 || j > cols - 3){
				value = 0;
			}else{
				value = Math.random() > 0.5 ? 0 : 1;
			}
			row.push(new Tile({
				game,
				group,
				grid,
				x: j,
				y: i,
				value,
				events
			}));
		}
		tiles.push(row);
	}
	function adjust(rect, init){
		if(columnHasUnit(cols-1) || columnHasUnit(cols-2)){
			addColumn();
			if(columnHasUnit(cols-2)){
				addColumn();
			}
		}else{
			while(!columnHasUnit(cols-1) && !columnHasUnit(cols-2) && !columnHasUnit(cols-3)){
				removeColumn();
			}
		}

		if(columnHasUnit(0)){
			addColumn(true);
		}else{
			while(!columnHasUnit(0) && !columnHasUnit(1)){
				removeColumn(true);
			}
		}

		var width = (grid.tileWidth + grid.margin)*cols - grid.margin;
		var height = (grid.tileHeight + grid.margin)*rows - grid.margin;
		var scale = Math.min(rect.w/width, rect.h/height);
		width *= scale;
		height *= scale;
		if(init){
			group.x = rect.x + (rect.w - width)/2;
			group.y = rect.y + (rect.h - height)/2;
			group.scale.x = group.scale.y = scale;
			dots.x = dotcol*(grid.tileWidth + grid.margin);
		}else{
			game.add.tween(group).to({x: rect.x + (rect.w - width)/2, y: rect.y + (rect.h - height)/2}, 300, "Linear", true);
			game.add.tween(group.scale).to({x: scale, y: scale}, 300, "Linear", true);
			game.add.tween(dots).to({x: dotcol*(grid.tileWidth + grid.margin)}, 300, "Linear", true);
		}
	}
	adjust(rect, true);

	function columnHasUnit(i){
		var f = false;
		for(let j = 0; j < rows; j++){
			f = f || tiles[j][i].value;
		}
		return f;
	}

	function addColumn(leftSide){
		cols++;
		leftSide && dotcol++;
		for(let i = 0; i < rows; i++){
			let newTile = new Tile({
				game,
				group,
				grid,
				x: cols-1,
				y: i,
				value: 0,
				events
			})
			if(leftSide){
				newTile.x = -1;
				tiles[i].unshift(newTile);
				tiles[i].forEach((tile, index) => tile.moveX(index));
			}else{
				tiles[i].push(newTile);
			}
		}
	}
	function removeColumn(leftSide){
		cols--;
		leftSide && dotcol--;
		for(let i = 0; i < rows; i++){
			if(leftSide){
				tiles[i].shift().destroy();
				tiles[i].forEach((tile, index) => tile.moveX(index));
			}else{
				tiles[i].pop().destroy();
			}
		}
	}
}

function Tile({game, group, grid, x, y, value, events}){
	var self = this;
	var g = game.add.sprite(
		x*(grid.tileWidth + grid.margin),
		y*(grid.tileHeight + grid.margin), 
		"tile",
		value
	);
	group.add(g);
	g.inputEnabled = true;
	g.input.enableDrag();

	var lastPosition = null;

	g.events.onDragStart.add(function(){
		lastPosition = {x: g.x, y: g.y};
		group.bringToTop(g);
	});
	g.events.onDragUpdate.add(function(){
		self.x = self.x;
		if(!lastPosition){
			return;
		}
		if(lastPosition.y - g.y > grid.tileHeight){
			g.y = lastPosition.y - grid.tileHeight;
		}else if(g.y - lastPosition.y > grid.tileHeight){
			g.y = lastPosition.y + grid.tileHeight;
		}
	});
	g.events.onDragStop.add(function(){
		if(Math.abs(lastPosition.y - g.y) > grid.tileHeight / 2){
			events.drag(self, lastPosition.y - g.y > 0);
		}else{
			events.click(self);
		}
		self.y = self.y;
		lastPosition = null;
	});
	
	this.moveAndBack = function(dx, dy, flag){
		var gx = g.x,
			gy = g.y;
		group.bringToTop(g);
		events.beginTween();
		if(flag){
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
				events.endTween();
			});

		}else{
			g.x = (x + dx)*(grid.tileWidth + grid.margin);
			g.y = (y + dy)*(grid.tileHeight + grid.margin);	
			game.add.tween(g).to({x: gx, y: gy}, 300, "Linear", true)
				.onComplete.add(events.endTween);
		}

	}
	
	this.switch = function(){
		value = 1 - value;
		g.frame = value;
	}

	this.destroy = function(){
		g.destroy();
	} 
	this.moveX = function(_){
		x = _;
		game.add.tween(g).to({x: x*(grid.tileWidth + grid.margin)}, 300, "Linear", true);
	}
	this.bringToTop = function(){
		group.bringToTop(g);
	}
	Object.defineProperties(this, {
		value: {
			get: () => value,
			set: function(_){
				value = _;
				g.frame = value;
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
		inputEnabled: {
			get: () => g.inputEnabled,
			set: (_) => g.inputEnabled = _
		}
	});

}