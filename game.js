'use strict';

class Vector {
  constructor(x = 0, y = 0) {
      this.x = x;
      this.y = y;
	}

  plus (vector) {
    if (!(vector instanceof Vector)) {
        throw new Error('Можно прибавлять к вектору только вектор типа Vector');
    }
    return new Vector(this.x + vector.x, this.y + vector.y);
  }

  times (ratio) {
    return new Vector(this.x * ratio, this.y * ratio);
  }

}

class Actor {
  constructor(pos = new Vector(0,0), size = new Vector(1,1), speed = new Vector(0,0) ) {
    if (!((pos instanceof Vector) && (size instanceof Vector) && (speed instanceof Vector))) {
        throw new Error('Все аргументы должны быть типа Vector');
    }
      this.pos = pos;
      this.size = size;
      this.speed = speed;
	}

  act() { }
  
  get left() {
    return this.pos.x;
  }
    
  get top() {
    return this.pos.y;
  }
  
  get right() {
    return this.pos.x + this.size.x;
  }
    
  get bottom() {
    return this.pos.y + this.size.y;
  }
    
  get type() {
    return 'actor'
  }
    
  isIntersect (actor) {
    if ( !(actor instanceof Actor) || !actor ) {
        throw new Error('Должен быть передан аргумент типа Actor');
    }
    
    if (actor === this) {
      return false;
    }

    if ((this.right > actor.left && this.left < actor.right) && (this.bottom > actor.top && this.top < actor.bottom)) {
      return true
      } else {
          return false
      }
  }
}

class Level {
  constructor(grid = [], actors = []) {
    this.grid = grid;
    this.actors = actors;
    this.player = this.actors.find((actor) => {return actor.type === 'player'});
    this.height = grid.length;
    this.width = grid.reduce((x,y) => { return (x.length > y.length) ? x.length : y.length },0);
    this.status = null;
    this.finishDelay = 1;
  }

  
    
  isFinished () {
    return ( (this.status !== null) && (this.finishDelay < 0) )
  }
    
  actorAt ( actor ) {
    if ( !(actor instanceof Actor) || !actor ) {
      throw new Error('Должен быть передан аргумент типа Actor');
    }
      
    if(this.grid === undefined ){
      return undefined;
	}
		
    for(const act of this.actors){
      if (typeof act !='undefined' && actor.isIntersect(act)){
        return act;
      }
	}
	return undefined;
  }
    
  obstacleAt(pos, size) {
    if (!((pos instanceof Vector) && (size instanceof Vector) )) {
      throw new Error('Все аргументы должны быть типа Vector');
    }

    let xStart = Math.floor(pos.x);
    let xEnd = Math.ceil(pos.x + size.x);
    let yStart = Math.floor(pos.y);
    let yEnd = Math.ceil(pos.y + size.y);

    if (xStart < 0 || xEnd > this.width || yStart < 0) {
      return 'wall';
    }

    if (yEnd > this.height) {
      return 'lava';
    }

    for (let y = yStart; y < yEnd; y++) {
      for (let x = xStart; x < xEnd; x++) {
        let obstacle = this.grid[y][x];
        if (typeof obstacle !== 'undefined') {
          return obstacle;
        }
      }
    }
    return undefined;
  }
    
  removeActor ( actor ) {
    let indexAct = this.actors.indexOf(actor);
	if(indexAct !== -1){
	  this.actors.splice(indexAct, 1);
	}
  }
    
  noMoreActors ( type ) {
    if(this.actors){
	  for(let actor of this.actors){
        if(actor.type === type){
		  return false;
		}
      }
	}
	return true;
  }
    
  playerTouched(type, actor){
	if(this.status != null){
	  return;
	}
		
	if(type === 'lava' || type === 'fireball'){
	  this.status = 'lost';
	}
		
	if(type === 'coin' && actor.type === 'coin'){
	  this.removeActor(actor);
	  if(this.noMoreActors('coin')){
          this.status = 'won';
      }
    }
  }
}

class LevelParser {
  constructor ( dictionary ){
    this.dictionary = dictionary;
  }
    
  actorFromSymbol( symbol ) {
    if (!symbol || !this.dictionary) {
      return ;
    }
    else {
      return this.dictionary[symbol]
    }
  }
  
  obstacleFromSymbol( symbol ) {
    if (symbol === 'x') {
      return 'wall';
    }
    if (symbol ==='!') {
      return 'lava';
    }
    return;
  }
    
  createGrid( playingGrid ){
    return playingGrid.map( line => {
      return [...line].map( x => {
        return this.obstacleFromSymbol(x);
      });
    });
  }
  
  createActors (playingGrid) {
    let grid = playingGrid.map( line => [...line] );
    let actors = [];
    grid.forEach((line, y) => {
      line.forEach((cell, x) => {
        if (this.dictionary && this.dictionary[cell] && typeof this.dictionary[cell] === 'function') {
          const actor = new this.dictionary[cell] (new Vector(x, y));
          if (actor instanceof Actor) {
              actors.push(actor);
          }
        }
      });
    });
    return actors;
  }
    
  parse(playingGrid) {
    const grid = this.createGrid(playingGrid);
    const actors = this.createActors(playingGrid);
    return new Level(grid, actors);
  }
}


class Player extends Actor{
  constructor(pos=new Vector(1,1)){
	super(new Vector(pos.x, pos.y - 0.5), new Vector(0.8,1.5));	
  }
	
  get type(){
	return 'player';
  }
}

class Fireball extends Actor {
  constructor( pos=new Vector(0,0), speed=new Vector(0,0) ) {
    let size = new Vector(1,1);
	super(pos, size, speed);
  }
  get type() {
	return 'fireball';
  }
    
  getNextPosition( time = 1 ) {
	return this.pos.plus( this.speed.times(time) );
  }

  handleObstacle() {
	this.speed = this.speed.times(-1);
  }
    
  act( time, level ) {
	if ( level.obstacleAt(this.getNextPosition( time ), this.size) ) {
	  this.handleObstacle();
	} else {
      this.pos = this.getNextPosition( time );
	}
  }
}

class HorizontalFireball extends Fireball {
  constructor(pos) {
	super(pos, new Vector(2,0));
  }
}

class VerticalFireball extends Fireball {
  constructor(pos) {
    super(pos, new Vector(0, 2));
  }
}

class FireRain extends Fireball {
  constructor(pos) {
    super(pos, new Vector(0, 3));
    this.start = pos;
  }

  handleObstacle() {
    this.pos = this.start;
  }
}

class Coin extends Actor {
  constructor(pos = new Vector()) {
   pos = pos.plus(new Vector(0.2, 0.1));
   super(pos, new Vector(0.6, 0.6));

   this.startPos = pos;	
   this.springSpeed = 8;
   this.springDist = 0.07;
   this.spring = Math.random() * 2 * Math.PI;
  }

  get type() {
	return 'coin';
  }
  
  updateSpring( time = 1 ) {
	this.spring += this.springSpeed * time;
  }

  getSpringVector() {
	return new Vector(0, Math.sin(this.spring) * this.springDist)
  }

  getNextPosition( time = 1 ) {
    this.updateSpring( time );
	return this.startPos.plus(this.getSpringVector());
      
  }

  act( time = 1 ) {
	this.pos = this.getNextPosition( time );
  }
}

const schemas = [
    [
        '         ',
        '    f    ',
        '    =    ',
        '       o ',
        '    x!xxx',
        ' @       ',
        'xxx!     ',
        '         '
    ],
    [
        '      v  ',
        '         ',
        '  v      ',
        '        o',
        '        x',
        '@   x    ',
        'x        ',
        '         '
    ],
    [
        '  z f    ',
        'o        ',
        'xx    z  ',
        '    @    ',
        '   xxx   ',
        '        o',
        '       xx',
        '         '
    ]
];
const actorDict = {
    '@': Player,
    'v': FireRain,
    'o': Coin,
    'f': HorizontalFireball,
    'z': VerticalFireball
}
const parser = new LevelParser(actorDict);
runGame(schemas, parser, DOMDisplay)
    .then(() => alert('Вы выиграли приз!'));