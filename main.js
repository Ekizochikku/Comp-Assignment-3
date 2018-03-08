var AM = new AssetManager();
var socket = io.connect("http://24.16.255.56:8888");

socket.on("load", function (theTrainer, thePikachu) {
    trainer = theTrainer;
    pikachu = thePikachu;
});
//if(this.game.saveButton) {
//        console.log("The save key was pressed");
//        socket.emit("save", { studentname: "Brian Khang", statename: "initial", theTrainer: state, thePikachu: Pikachu_Spawner});
//    }
//    if(this.game.loadButton) {
//        console.log("The load key was pressed");
//        socket.emit("load", { studentname: "Brian Khang", statename: "initial" });
//    }

//State 0 = right; 1 = left; 2 = up; 3 = down
var state = 0;
var pState = 0;
var bg;
var caught = 0;
var pCount = 0;
var edge = false;
var loopSpeed = 0;

function Animation(spriteSheet, startX, startY, frameWidth, frameHeight, frameDuration, frames, loop, reverse) {
    this.spriteSheet = spriteSheet;
    this.startX = startX;
    this.startY = startY;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.reverse = reverse;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y, scaleBy) {
    var scaleBy = scaleBy || 1;
    this.elapsedTime += tick;
    if (this.loop) {
        if (this.isDone()) {
            this.elapsedTime = 0;
        }
    } else if (this.isDone()) {
        return;
    }
    var index = this.reverse ? this.frames - this.currentFrame() - 1 : this.currentFrame();
    var vindex = 0;
    if ((index + 1) * this.frameWidth + this.startX > this.spriteSheet.width) {
        index -= Math.floor((this.spriteSheet.width - this.startX) / this.frameWidth);
        vindex++;
    }
    while ((index + 1) * this.frameWidth > this.spriteSheet.width) {
        index -= Math.floor(this.spriteSheet.width / this.frameWidth);
        vindex++;
    }

    var locX = x;
    var locY = y;
    var offset = vindex === 0 ? this.startX : 0;
    ctx.drawImage(this.spriteSheet,
                  index * this.frameWidth + offset, vindex * this.frameHeight + this.startY,  // source from sheet
                  this.frameWidth, this.frameHeight,
                  locX, locY,
                  this.frameWidth * scaleBy,
                  this.frameHeight * scaleBy);
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}

function BoundingBox(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.left = x;
    this.top = y;
    this.right = this.left + width;
    this.bottom = this.top + height;
}

BoundingBox.prototype.collide = function (oth) {
    if (this.right > oth.left && this.left < oth.right && this.top < oth.bottom && this.bottom > oth.top) return true;
    return false;
}

// no inheritance
function Background(game, spritesheet) {
    this.x = 0;
    this.y = 0;
    this.spritesheet = spritesheet;
    this.game = game;
    this.ctx = game.ctx;
    this.boundingbox = new BoundingBox(this.x, this.y, 446, 446);
};

Background.prototype.draw = function () {
    this.ctx.drawImage(this.spritesheet,
                   this.x, this.y);
    this.ctx.strokeStyle = "blue";
    this.ctx.strokeRect(this.boundingbox.x, this.boundingbox.y, this.boundingbox.width, this.boundingbox.height);
};

Background.prototype.update = function () {
};

//Trainer Left
function Trainer_Left(game, spriteSheet) {
	this.game = game;
	this.animation = new Animation(spriteSheet, 0, 32, 32, 32, 0.2, 3, true);
	this.speed = 150 + (loopSpeed * 100);
	this.ctx = game.ctx;
	this.boundingbox = new BoundingBox(this.x + 100, this.y + 100, 32, 32);
	Entity.call(this, game, 300, 405);
}
Trainer_Left.prototype = new Entity();
Trainer_Left.prototype.constructor = Trainer_Left;

Trainer_Left.prototype.update = function() {
	if (state != 1 || caught === 1000) return;
	this.x -= this.game.clockTick * this.speed;
//    if (this.x > 800) this.x = -100;
//	    if (this.boundingbox.collide(this.game.bg.boundingbox)) {
//	    	state = 2;
//	    }
    if (this.x < 100) {
    	state = 2;
    	this.x = 300;
    	this.y = 405;
    }
    
    if(this.game.saveButton) {
        console.log("The save key was pressed");
        socket.emit("save", { studentname: "Brian Khang", statename: "initial", theTrainer: state, thePikachu: Pikachu_Spawner});
    }
    if(this.game.loadButton) {
        console.log("The load key was pressed");
        socket.emit("load", { studentname: "Brian Khang", statename: "initial" });
    }
    this.boundingbox = new BoundingBox(this.x + 5 , this.y + 5 , this.animation.frameWidth - 12 , this.animation.frameHeight - 4);
    Entity.prototype.update.call(this);
}

Trainer_Left.prototype.draw = function () {
	if (state != 1 || caught === 1000) return;
    this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
    Entity.prototype.draw.call(this);
//    this.ctx.strokeStyle = "red";
//    this.ctx.strokeRect(this.boundingbox.x, this.boundingbox.y, this.boundingbox.width, this.boundingbox.height);
}

//Trainer Right
function Trainer_Right(game, spriteSheet) {
	this.game = game;
	this.animation = new Animation(spriteSheet, 0, 96, 32, 32, 0.2, 3, true);
	this.speed = 150 + (loopSpeed * 100);
	this.ctx = game.ctx;
	this.boundingbox = new BoundingBox(this.x + 100, this.y + 100, 32, 32);
	Entity.call(this, game, 100, 0);
}
Trainer_Right.prototype = new Entity();
Trainer_Right.prototype.constructor = Trainer_Right;

Trainer_Right.prototype.update = function() {
	if (state != 0 || caught === 1000) return;
	this.x += this.game.clockTick * this.speed;
    //if (this.x > 800) this.x = -100;
//    if (this.boundingbox.collide(this.game.bg.boundingbox)) {
//    	state = 3;
//    }
    if (this.x > 300) {
    	state = 3;
    	this.x = 100;
    	this.y = 0;
    }
    if(this.game.saveButton) {
        console.log("The save key was pressed");
        socket.emit("save", { studentname: "Brian Khang", statename: "initial", theTrainer: state, thePikachu: Pikachu_Spawner});
    }
    if(this.game.loadButton) {
        console.log("The load key was pressed");
        socket.emit("load", { studentname: "Brian Khang", statename: "initial" });
    }
    this.boundingbox = new BoundingBox(this.x + 5 , this.y + 5 , this.animation.frameWidth - 12 , this.animation.frameHeight - 4);
    Entity.prototype.update.call(this);
}

Trainer_Right.prototype.draw = function () {
	if (state != 0 || caught === 1000) return;
    this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
    Entity.prototype.draw.call(this);
//    this.ctx.strokeStyle = "red";
//    this.ctx.strokeRect(this.boundingbox.x, this.boundingbox.y, this.boundingbox.width, this.boundingbox.height);
}

//Trainer Up
function Trainer_Up(game, spriteSheet) {
	this.game = game;
	this.animation = new Animation(spriteSheet, 0, 0, 32, 32, 0.2, 3, true);
	this.speed = 150 + (loopSpeed * 100);
	this.ctx = game.ctx;
	this.boundingbox = new BoundingBox(this.x + 100, this.y + 100, 32, 32);
	Entity.call(this, game, 100, 410);
}
Trainer_Up.prototype = new Entity();
Trainer_Up.prototype.constructor = Trainer_Up;

Trainer_Up.prototype.update = function() {
	if (state != 2 || caught === 1000) return;
	this.y -= this.game.clockTick * this.speed;
    if (this.x > 800) this.x = -100;
//    if (this.boundingbox.collide(this.game.bg.boundingbox)) {
//    	state = 0;
//    }
    for (var i = 0; i < this.game.pikaS.length; i++) {
        var ob = this.game.pikaS[i];
        if(this.boundingbox.collide(ob.boundingbox)) {
        	ob.captured = true;
        	caught += 1;
        }
    }
    
    if (this.y < 0) {
    	state = 0;
    	this.y = 410;
    	loopSpeed += 1;
    }
    if(this.game.saveButton) {
        console.log("The save key was pressed");
        socket.emit("save", { studentname: "Brian Khang", statename: "initial", theTrainer: state, thePikachu: Pikachu_Spawner});
    }
    if(this.game.loadButton) {
        console.log("The load key was pressed");
        socket.emit("load", { studentname: "Brian Khang", statename: "initial" });
    }
    this.boundingbox = new BoundingBox(this.x + 5 , this.y + 5 , this.animation.frameWidth - 12 , this.animation.frameHeight - 4);
    Entity.prototype.update.call(this);
}

Trainer_Up.prototype.draw = function () {
	if (state != 2 || caught === 1000) return;
    this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
    Entity.prototype.draw.call(this);
//    this.ctx.strokeStyle = "red";
//    this.ctx.strokeRect(this.boundingbox.x, this.boundingbox.y, this.boundingbox.width, this.boundingbox.height);
}

//Trainer Down
function Trainer_Down(game, spriteSheet) {
	this.game = game;
	this.animation = new Animation(spriteSheet, 0, 64, 32, 32, 0.2, 3, true);
	this.speed = 150 + (loopSpeed * 100);
	this.ctx = game.ctx;
	this.boundingbox = new BoundingBox(this.x + 100, this.y + 100, 32, 32);
	Entity.call(this, game, 300, 0);
}
Trainer_Down.prototype = new Entity();
Trainer_Down.prototype.constructor = Trainer_Down;

Trainer_Down.prototype.update = function() {
	if (state != 3 || caught === 1000) return;
	this.y += this.game.clockTick * this.speed;
    if (this.x > 800) this.x = -100;
//    if (this.boundingbox.collide(this.game.bg.boundingbox)) {
//    	state = 1;
//    }
    if(this.y > 415) {
    	state = 1;
    	this.x = 300;
    	this.y = 0;
    }
    
    for (var i = 0; i < this.game.pikaS.length; i++) {
        var ob = this.game.pikaS[i];
        if(this.boundingbox.collide(ob.boundingbox)) {
        	ob.captured = true;
        	caught += 1;
        }
    }
    if(this.game.saveButton) {
        console.log("The save key was pressed");
        socket.emit("save", { studentname: "Brian Khang", statename: "initial", theTrainer: state, thePikachu: Pikachu_Spawner});
    }
    if(this.game.loadButton) {
        console.log("The load key was pressed");
        socket.emit("load", { studentname: "Brian Khang", statename: "initial" });
    }
    this.boundingbox = new BoundingBox(this.x + 5 , this.y + 5 , this.animation.frameWidth - 12 , this.animation.frameHeight - 4);
    Entity.prototype.update.call(this);
}

Trainer_Down.prototype.draw = function () {
	if (state != 3 || caught === 1000) return;
    this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
    Entity.prototype.draw.call(this);
//    this.ctx.strokeStyle = "red";
//    this.ctx.strokeRect(this.boundingbox.x, this.boundingbox.y, this.boundingbox.width, this.boundingbox.height);
}

//Pikachu Right
function Pikachu_Right(game, spriteSheet) {
	this.game = game;
	this.animation = new Animation(spriteSheet, 0, 0, 33, 32, 0.2, 3, true);
	this.speed = 150;
	this.ctx = game.ctx;
	this.boundingbox = new BoundingBox(this.x + 100, this.y + 100, 33, 32);
	this.rSide = false;
	this.captured = false;
	Entity.call(this, game, 0, 100);
}
Pikachu_Right.prototype = new Entity();
Pikachu_Right.prototype.constructor = Pikachu_Right;

Pikachu_Right.prototype.update = function() {
	if(this.rSide || this.captured || caught === 1000) return;
	this.x += this.game.clockTick * this.speed;
	this.boundingbox = new BoundingBox(this.x, this.y + 5 , this.animation.frameWidth, this.animation.frameHeight - 6);
    Entity.prototype.update.call(this);
    if (this.x > 426) {
		this.rSide = true;
	}
}

Pikachu_Right.prototype.draw = function() {
	if(this.rSide || this.captured || caught === 1000) return;
    this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
    Entity.prototype.draw.call(this);
//    this.ctx.strokeStyle = "red";
//    this.ctx.strokeRect(this.boundingbox.x, this.boundingbox.y, this.boundingbox.width, this.boundingbox.height);
}

//Pikachu Left
function Pikachu_Left(game, spriteSheet) {
	this.game = game;
	this.animation = new Animation(spriteSheet, 0, 0, 32, 32, 0.2, 3, true);
	this.speed = 150;
	this.ctx = game.ctx;
	this.boundingbox = new BoundingBox(this.x + 100, this.y + 100, 33, 32);
	this.rSide = false;
	this.captured = false;
	Entity.call(this, game, 426, 300);
}
Pikachu_Left.prototype = new Entity();
Pikachu_Left.prototype.constructor = Pikachu_Left;

Pikachu_Left.prototype.update = function() {
	if(this.rSide || this.captured || caught === 1000) return;
	this.x -= this.game.clockTick * this.speed;
	this.boundingbox = new BoundingBox(this.x, this.y + 5 , this.animation.frameWidth, this.animation.frameHeight - 6);
    Entity.prototype.update.call(this);
    if (this.x < -10) {
		this.rSide = true;
	}
}

Pikachu_Left.prototype.draw = function() {
	if(this.rSide || this.captured || caught === 1000) return;
    this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
    Entity.prototype.draw.call(this);
//    this.ctx.strokeStyle = "red";
//    this.ctx.strokeRect(this.boundingbox.x, this.boundingbox.y, this.boundingbox.width, this.boundingbox.height);
}

//Pikachu Spawner
function Pikachu_Spawner(game, spriteSheetOne, spriteSheetTwo) {
	this.pikaArray = [];
//	this.rightSpawn = [];
//	this.leftSpawn = [];
	this.spriteSheetOne = spriteSheetOne;
	this.spriteSheetTwo = spriteSheetTwo;
	this.game = game;
	this.counter = 0;
}

Pikachu_Spawner.prototype = new Entity();
Pikachu_Spawner.prototype.constructor = Pikachu_Spawner;

Pikachu_Spawner.prototype.update = function() {
	if(caught === 1000) return;
	if (this.counter % 40 === 0) {
//		this.rightSpawn.push(new Pikachu_Right(this.game,this.spriteSheetOne));
//		this.leftSpawn.push(new Pikachu_Left(this.game, this.spriteSheetTwo));
		this.pikaArray.push(new Pikachu_Right(this.game,this.spriteSheetOne));
		this.pikaArray.push(new Pikachu_Left(this.game, this.spriteSheetTwo));
	}
//	var pNum = this.rightSpawn.length;
	var pNum = this.pikaArray.length;
	for (i = 0; i < pNum; i++) {
//		this.rightSpawn[i].update();
//		this.leftSpawn[i].update();
		this.pikaArray[i].update();
	}
	this.counter++;
}

Pikachu_Spawner.prototype.draw = function() {
	if(caught === 1000) return;
//	var pNum = this.rightSpawn.length;
	var pNum = this.pikaArray.length;
	for(i = 0; i < pNum; i++) {
//		this.rightSpawn[i].draw();
//		this.leftSpawn[i].draw();
		this.pikaArray[i].draw();
	}
}

function Score(game, color, x, y) {
	this.color = color;
	this.x = x;
	this.y = y;
	this.ctx = game.ctx;
	this.ctx.font = "19px Arial";
	this.ctx.fillStyle = color;
	this.ctx.fillText("SCORE: " + this.score, this.x, this.y);
	Entity.call(this, game, x, y);
}

//Score.prototype = new Entity();
Score.prototype.constructor = Score;
Score.prototype.update = function() {
	//Entity.prototype.update.call(this);
};
Score.prototype.draw = function() {
	if (caught != 1000) return;
	this.ctx.fillText("Pikachu has overrun you. Can't Catch Them All", this.x, this.y);
};

AM.queueDownload("./img/Trainer.png");
AM.queueDownload("./img/Pikachu_Left.png");
AM.queueDownload("./img/Pikachu_Right.png");
AM.queueDownload("./img/background.jpg");
AM.queueDownload("./img/Pokeball.png");

AM.downloadAll(function () {
	var canvas = document.getElementById("gameWorld");
	var ctx = canvas.getContext("2d");
	var gameEngine = new GameEngine();
	gameEngine.init(ctx);
	gameEngine.start();
	
	bg = new Background(gameEngine, AM.getAsset("./img/background.jpg"));
	gameEngine.addEntity(bg);
	gameEngine.addEntity(new Score(gameEngine, "yellow", 30, 230));
	gameEngine.bg = bg;
	
//	var tUp = new Trainer_Up(gameEngine, AM.getAsset("./img/Trainer.png"));
//	var tDown = new Trainer_Down(gameEngine, AM.getAsset("./img/Trainer.png"));
//	var tLeft = new Trainer_Left(gameEngine, AM.getAsset("./img/Trainer.png"));
//	var tRight = new Trainer_Right(gameEngine, AM.getAsset("./img/Trainer.png"));
//	var pRight = new Pikachu_Right(gameEngine, AM.getAsset("./img/Pikachu_Right.png"));
//	var pLeft = new Pikachu_Left(gameEngine, AM.getAsset("./img/Pikachu_Left.png"));
	var pikaS = new Pikachu_Spawner(gameEngine, AM.getAsset("./img/Pikachu_Right.png"), AM.getAsset("./img/Pikachu_Left.png"));
	gameEngine.addEntity(pikaS);
	gameEngine.pikaS = pikaS.pikaArray;
//	
//	gameEngine.addEntity(tUp);
//	gameEngine.addEntity(tDown);
//	gameEngine.addEntity(tLeft);
//	gameEngine.addEntity(tRight);
//	gameEngine.tUp = tUp;
//	gameEngine.tDown = tDown;
//	gameEngine.tLeft = tLeft;
//	gameEngine.tRight = tRight;

	gameEngine.addEntity(new Trainer_Left(gameEngine, AM.getAsset("./img/Trainer.png")));
	gameEngine.addEntity(new Trainer_Right(gameEngine, AM.getAsset("./img/Trainer.png")));
	gameEngine.addEntity(new Trainer_Up(gameEngine, AM.getAsset("./img/Trainer.png")));
	gameEngine.addEntity(new Trainer_Down(gameEngine, AM.getAsset("./img/Trainer.png")));
	
	console.log("Done");
});