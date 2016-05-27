var Phaser = require("phaser");

var game = new Phaser.Game(800, 600, Phaser.AUTO, '', "tutorial", true);

game.state.add("tutorial", (function(){
	return {
		preload(){
			game.load.spritesheet("tile", "assets/tile.png", 48, 72);
			game.load.image("dot", "assets/dot.png");
			game.load.image("pointer", "assets/pointer.png");
			game.load.start();
		},
		create(){
			var caption = game.add.text(400, 40, "How to play:", {fontSize: 40});
			caption.anchor.x = caption.anchor.y = 0.5;
			var demo1 = new Demo1({game, x: 60, y: 140});
			var demo2 = new Demo2({game, x: 330, y: 140});
			var demo3 = new Demo3({game, x: 500, y: 140});
			var start = new HyperText({
				game,
				x: 400,
				y: 460,
				style: {fontSize: 40},
				text: "Click to start",
				cb: function(){
					demo1.stop();
					demo2.stop();
					demo3.stop();
					game.state.start("game");
				}
			});
		}
	}
})());

game.state.add("game", (function(){
	return {
		preload(){
			game.load.spritesheet("tile", "assets/tile.png", 48, 72);
			game.load.image("dot", "assets/dot.png");
			game.load.image("plus", "assets/plus.png");
			game.load.start();
		},
		create(){
			var field = new Field({
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

game.state.add("win", (function(){
	return {
		create(){
			var caption = game.add.text(400, 300, "You win!", {fontSize: 50});
			caption.anchor.x = caption.anchor.y = 0.5;
			var restart = new HyperText({
				game,
				x: 400,
				y: 460,
				style: {fontSize: 40},
				text: "Click to restart",
				cb: function(){
					game.state.start("game");
				}
			});
		}
	}
})());
function Demo1({game, x, y}){
	const grid = {
		tileWidth: 48,
		tileHeight: 72,
		margin: 6
	};
	grid.w = grid.tileWidth + grid.margin;
	grid.h = grid.tileHeight + grid.margin;

	var afterTweenStop = [];
	var tweenCounter = 0;
	var events = {
		beginTween(){
			tweenCounter++;
		},
		endTween(){
			tweenCounter--;
			if(!tweenCounter){
				while(afterTweenStop.length){
					afterTweenStop.pop()();
				}
			}
		},
		click(){},
		drag(){}
	};
	var group = game.add.group();
	var tiles = game.add.group(group);
	group.x = x;
	group.y = y;
	var tile1 = new Tile({
		game, group: tiles, grid, events,
		x: 0,
		y: 0,
		value: 1
	});
	var pointer = game.make.image(grid.tileWidth/2, grid.tileHeight/2, "pointer");
	pointer.anchor.x = 0.2;
	pointer.anchor.y = 0;
	group.add(pointer);
	var tile2 = new Tile({
		game, group: tiles, grid, events,
		x: 1,
		y: 0,
		value: 0
	});
	var tile3 = new Tile({
		game, group: tiles, grid, events,
		x: 2,
		y: 0,
		value: 0
	});
	var flag = true;
	var repeat = true;
	function animate(){
		game.add.tween(pointer)
			.to({y: grid.tileHeight/2 + 5}, 100, "Linear", true)
			.yoyo(true);
		if(flag = !flag){
			tile2.moveAndBack(-1, 0, true);
			tile3.moveAndBack(-2, 0, true);
			afterTweenStop.push(function(){
				tile1.switch();
				tile2.switch();
				tile3.switch();
				repeat && setTimeout(animate, 1500)
			})
		}else{
			tile1.switch();
			tile2.switch();
			tile3.switch();
			tile2.moveAndBack(-1, 0, false);
			tile3.moveAndBack(-2, 0, false);
			afterTweenStop.push(() => repeat && setTimeout(animate, 1500));
		}
	}
	animate();
	this.stop = function(){
		repeat = false;
	}
}

function Demo2({game, x, y}){
	const grid = {
		tileWidth: 48,
		tileHeight: 72,
		margin: 6
	};
	grid.w = grid.tileWidth + grid.margin;
	grid.h = grid.tileHeight + grid.margin;

	var afterTweenStop = [];
	var tweenCounter = 0;
	var events = {
		beginTween(){
			tweenCounter++;
		},
		endTween(){
			tweenCounter--;
			if(!tweenCounter){
				while(afterTweenStop.length){
					afterTweenStop.pop()();
				}
			}
		},
		click(){},
		drag(){}
	};
	var group = game.add.group();
	var tiles = game.add.group(group);
	group.x = x;
	group.y = y;
	var tile1 = new Tile({
		game, group: tiles, grid, events,
		x: 0,
		y: 0,
		value: 1
	});
	var pointer = game.make.image(grid.tileWidth/2, grid.tileHeight/2, "pointer");
	pointer.anchor.x = 0.2;
	pointer.anchor.y = 0;
	group.add(pointer);
	var tile2 = new Tile({
		game, group: tiles, grid, events,
		x: 0,
		y: 1,
		value: 0
	});
	var flag = true;
	var repeat = true;
	function animate(){
		if(flag = !flag){
			game.add.tween(pointer).to({y: grid.tileHeight/2}, 300, "Linear", true);
			tiles.bringToTop(tile2.g);
			game.add.tween(tile2.g).to({y: grid.margin}, 300, "Linear", true)
				.onComplete.add(function(){
					tile2.y = tile2.y;
					tile1.switch();
					tile2.switch();
					repeat && setTimeout(animate, 1500);
				})
		}else{
			game.add.tween(pointer).to({y: grid.tileHeight*3/2}, 300, "Linear", true);
			tiles.bringToTop(tile1.g);
			game.add.tween(tile1.g).to({y: grid.tileHeight}, 300, "Linear", true)
				.onComplete.add(function(){
					tile1.y = tile1.y;
					tile1.switch();
					tile2.switch();
					repeat && setTimeout(animate, 1500);
				})
		}
	}
	animate();
	this.stop = function(){
		repeat = false;
	}
}

function Demo3({game, x, y}){
	const grid = {
		tileWidth: 48,
		tileHeight: 72,
		margin: 6
	};
	grid.w = grid.tileWidth + grid.margin;
	grid.h = grid.tileHeight + grid.margin;

	var afterTweenStop = [];
	var tweenCounter = 0;
	var events = {
		beginTween(){
			tweenCounter++;
		},
		endTween(){
			tweenCounter--;
			if(!tweenCounter){
				while(afterTweenStop.length){
					afterTweenStop.pop()();
				}
			}
		},
		click(){},
		drag(){}
	};
	var group = game.add.group();
	var tileGroup = game.add.group(group);
	group.x = x;
	group.y = y;
	var values = [
		[0, 0, 0, 0],
		[0, 0, 0, 0],
		[1, 1, 0, 1]
	];

	var tiles = values.map(function(row, y){
		return row.map(function(value, x){
			return new Tile({ game, group: tileGroup, grid, events, x, y, value });
		})
	})
	var g = game.add.graphics(0, 0);
	group.add(g);
	g.lineStyle(3, 0, 1);
	g.beginFill()
		.moveTo(-grid.margin/2, grid.h*2 - grid.margin/2)
		.lineTo(grid.w*4 -grid.margin/2, grid.h*2 - grid.margin/2)
		.endFill();

	var text = game.add.text(grid.w*2, grid.h, "Win", {fontSize: 90});
	text.anchor.x = text.anchor.y = 0.5;
	text.alpha = 0.1;
	group.add(text);

	var tween = game.add.tween(text).to({alpha: 0.5}, 500, "Linear", true).yoyo(true).loop();
	this.stop = function(){
		tween.stop();
	}
}

function Field({game, rect}){
	const grid = {
		tileWidth: 48,
		tileHeight: 72,
		margin: 8,
		offset: 32
	};
	grid.w = grid.tileWidth + grid.margin;
	grid.h = grid.tileHeight + grid.margin;
	var cols = 11;
	var rows = 6;
	var dotcol = 6;

	var group = game.add.group();

	var g = game.add.graphics(-48, grid.h*(rows-1) - grid.margin/2);
	g.lineStyle(3, 0, 1);
	g.beginFill()
	g.lineTo(grid.w, 0)
	g.endFill();
	group.add(g);
	var pluses = game.add.group(group);
	for(let i = 1; i < rows - 1; i++){
		let plus = game.add.image(-32, i*grid.h - grid.margin/2, "plus");
		pluses.add(plus);
		plus.anchor.x = plus.anchor.y = 0.5;
	}
	var dots = game.add.group(group);
	dots.x = (dotcol - 1)*(grid.w);
	for(let i = 0; i < rows; i++){
		let img = game.add.image(-grid.margin/2, i*grid.h + grid.tileHeight - grid.margin/2, "dot");
		img.anchor.x = img.anchor.y = 0.5;
		dots.add(img);
	}
	var tiles = [];
	var afterTweenStop = [];
	var tweenCounter = 0;
	var events = {
		beginTween(){
			tweenCounter++;
			tiles.forEach(row => row.forEach(tile => tile.g.inputEnabled = false));
		},
		endTween(){
			console.log(--tweenCounter);
			if(!tweenCounter){
				tiles.forEach(row => row.forEach(tile => tile.g.inputEnabled = true));
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
			if(playerWins()){
				return win();
			}
		}
	}
	for(let i = 0; i < rows; i++){
		let row = [];
		for(let j = 0; j < cols; j++){
			let value;
			if(j == 0 || j > cols - 3 || i == rows - 1){
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
	tiles[Math.floor(Math.random()*(rows-1))][1].value = 1; 
	tiles[Math.floor(Math.random()*(rows-1))][cols - 3].value = 1; 
	function adjust(rect, init){
		if(playerWins()){
			return win();
		}


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
			group.bringToTop(pluses);
			game.add.tween(pluses).from({alpha: 0.1}, 300, Phaser.Easing.Quadratic.In, true);
		}else{
			while(!columnHasUnit(0) && !columnHasUnit(1)){
				removeColumn(true);
			}
		}
		const offsetLeft = 32;
		var width = (grid.w)*cols - grid.margin + offsetLeft;
		var height = grid.h*rows - grid.margin;
		var scale = Math.min(rect.w/width, rect.h/height);
		width *= scale;
		height *= scale;
		if(init){
			group.x = rect.x + (rect.w - width)/2 + offsetLeft*scale;
			group.y = rect.y + (rect.h - height)/2;
			group.scale.x = group.scale.y = scale;
			g.scale.x = cols + 1;
			dots.x = dotcol*(grid.w);
		}else{
			game.add.tween(group).to({x: rect.x + (rect.w - width)/2 + offsetLeft*scale, y: rect.y + (rect.h - height)/2}, 300, "Linear", true);
			game.add.tween(group.scale).to({x: scale, y: scale}, 300, "Linear", true);
			game.add.tween(dots).to({x: dotcol*(grid.w)}, 300, "Linear", true);
			game.add.tween(g.scale).to({x:cols + 1}, 300, "Linear", true);
		}
	}

	adjust(rect, true);

	function playerWins(){
		return !tiles.slice(0, -1).reduce(
			(acc, row) => acc || row.reduce(
				(acc, tile) => acc || tile.value,
				false
			),
			false
		);
	}
	function win(){
		game.add.tween(group).to({alpha: 0}, 500, "Linear", true)
			.onComplete.add(() => game.state.start("win"));
	}
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
				x: cols - 1,
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
	var g = this.g = game.add.image(
		x*(grid.w),
		y*grid.h, 
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
				x: (x + dx)*(grid.w), 
				y: (y + dy)*grid.h
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
			g.x = (x + dx)*(grid.w);
			g.y = (y + dy)*grid.h;	
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
		game.add.tween(g).to({x: x*(grid.w)}, 300, "Linear", true);
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
				g.x = x*(grid.w);
			}
		},
		y: {
			get: () => y,
			set: function(_){
				y = _;
				g.y = y*grid.h;
			}
		}
	});
}

function HyperText({game, x, y, text, style, cb}){
	var text = game.add.text(x, y, text, style);
	text.inputEnabled = true;
	text.anchor.x = text.anchor.y = 0.5;
	text.events.onInputDown.add(cb);
}