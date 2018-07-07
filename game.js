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
    
    if (actor === this) return false;

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
    
  
}