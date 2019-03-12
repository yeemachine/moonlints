class Entity extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, key, type) {
    super(scene, x, y, key);
    this.scene = scene;
    this.scene.add.existing(this);
    this.scene.physics.world.enableBody(this, 0);
    this.setData("type", type);
    this.setData("isDead", false);
  }
  explode(canDestroy) {
    if (!this.getData("isDead")) {
      // Set the texture to the explosion image, then play the animation
      this.setTexture("sprExplosion");  // this refers to the same animation key we used when we added this.anims.create previously
      this.play("sprExplosion"); // play the animation
      // pick a random explosion sound within the array we defined in this.sfx in SceneMain
      this.scene.sfx.explosions[Phaser.Math.Between(0, this.scene.sfx.explosions.length - 1)].play();
      if (this.shootTimer !== undefined) {
        if (this.shootTimer) {
          this.shootTimer.remove(false);
        }
      }
      this.setAngle(0);
      this.body.setVelocity(0, 0);
      this.on('animationcomplete', function() {
        if (canDestroy) {
          this.destroy();
        }
        else {
          this.setVisible(false);
        }
      }, this);
      this.setData("isDead", true);
    }
  }
}

class Player extends Entity {
  constructor(scene, x, y, key, hp) {
    super(scene, x, y, key, "Player");
    
    let inset = 6
    let hitbox = this.body.setSize(this.body.width-inset*2, this.body.height-inset*2).setOffset(inset, inset);
    
    this.setData("hp", hp);
    this.setData("speed", 200);
    this.setData("isShooting", false);
    this.setData("timerShootDelay", 3);
    this.setData("timerShootTick", this.getData("timerShootDelay") - 1);
    
  }

  moveUp() {
    this.body.velocity.y = -this.getData("speed");
  }
  moveDown() {
    this.body.velocity.y = this.getData("speed");
  }
  moveLeft() {
    this.body.velocity.x = -this.getData("speed");
  }
  moveRight() {
    this.body.velocity.x = this.getData("speed");
  }

  onDestroy() {
    this.scene.time.addEvent({ // go to game over scene
      delay: 1000,
      callback: function() {
        this.scene.scene.start("SceneGameOver");
      },
      callbackScope: this,
      loop: false
    });
  }

  update() {
    this.body.setVelocity(0, 0);
    this.x = Phaser.Math.Clamp(this.x, 0, this.scene.game.config.width);
    this.y = Phaser.Math.Clamp(this.y, 0, this.scene.game.config.height);

    if (this.getData("isShooting")) {
      if (this.getData("timerShootTick") < this.getData("timerShootDelay")) {
        this.setData("timerShootTick", this.getData("timerShootTick") + 1); // every game update, increase timerShootTick by one until we reach the value of timerShootDelay
      }
      else { // when the "manual timer" is triggered:
        let frame = this.getData('laserFrame') || 0
        if(frame === 79){
          frame = 1
        }else{
          frame = frame + 1
        }
        this.setData('laserFrame',frame)
        let laser = new PlayerLaser(this.scene, this.x, this.y, frame);
        this.scene.playerLasers.add(laser);
        this.scene.sfx.laser.play(); // play the laser sound effect
        this.setData("timerShootTick", 0);
      }
    }
  }
}

class PlayerLaser extends Entity {
  constructor(scene, x, y, frame) {
    super(scene, x, y, "sprLaserEnemy0");
    // this.setTint(0xffff00)
    this.setFrame(frame)
    this.body.setCircle(2)
    this.body.velocity.y = -200;
    this.body.velocity.x = Phaser.Math.Between(-5, 5)
  }
}

class EnemyLaser extends Entity {
  constructor(scene, x, y, mode, angle, frame) {
    super(scene, x, y, "sprLaserEnemy0");
    if (mode === 'radial'){
      let speed = 10
      this.body.velocity.x = Math.cos(angle) * speed;
      this.body.velocity.y = Math.sin(angle) * speed;   
    }else{
      this.body.velocity.y = 200;
    }
  }
}

class ChaserShip extends Entity {
  constructor(scene, x, y, hp) {
    super(scene, x, y, "sprEnemy1", "ChaserShip");
    this.setData("hp", hp);
    this.body.velocity.y = Phaser.Math.Between(50, 100);
    this.states = {
      MOVE_DOWN: "MOVE_DOWN",
      CHASE: "CHASE"
    };
    this.state = this.states.MOVE_DOWN;
  }

  update() {
    if (!this.getData("isDead") && this.scene.player) {
      if (Phaser.Math.Distance.Between(
        this.x,
        this.y,
        this.scene.player.x,
        this.scene.player.y
      ) < 320) {
        this.state = this.states.CHASE;
      }

      if (this.state == this.states.CHASE) {
        var dx = this.scene.player.x - this.x;
        var dy = this.scene.player.y - this.y;
        var angle = Math.atan2(dy, dx);
        var speed = 100;
        this.body.setVelocity(
          Math.cos(angle) * speed,
          Math.sin(angle) * speed
        );
        if (this.x < this.scene.player.x) {
          this.angle -= 5;
        }
        else {
          this.angle += 5;
        } 
      }
    }
  }
}

class GunShip extends Entity {
  constructor(scene, x, y, hp) {
    super(scene, x, y, "sprEnemy0", "GunShip");
    this.play("sprEnemy0");
    this.setData("hp", hp);
    this.maxBurst = 8;
    this.body.velocity.y = Phaser.Math.Between(5, 10);
    this.shootTimer = this.scene.time.addEvent({
      delay: 3000,
      callback: function() {
        let shootBurst = this.scene.time.addEvent({
          delay:0,
          callback: function() {
            let index = shootBurst.repeatCount,
                start = Math.PI * -1,
                step = Math.PI / this.maxBurst * 2,
                angle = start + index * step,
                laser = new EnemyLaser(
                  this.scene,
                  this.x,
                  this.y,
                  'radial',
                  angle
                );
            laser.setScale(this.scaleX);
            scene.enemyLasers.add(laser);  
          },
          callbackScope: this,
          repeat:this.maxBurst
        })
        
      },
      callbackScope: this,
      loop: true
    });
  }
  onDestroy() {
    if (this.shootTimer !== undefined) {
      if (this.shootTimer) {
        this.shootTimer.remove(false);
      }
    }
  }
}

class CarrierShip extends Entity {
  constructor(scene, x, y, hp) {
    super(scene, x, y, "sprEnemy2", "CarrierShip");
    this.setData("hp", hp);
    this.play("sprEnemy2");
    this.body.velocity.y = Phaser.Math.Between(50, 100);
  }
}





class Letter extends Phaser.GameObjects.Text {
  constructor(scene, x, y, letter, style, type) {
    super(scene, x, y, letter, style);
    this.scene = scene;
    this.scene.add.existing(this);
    this.scene.physics.world.enableBody(this, 0);
    this.setData("type", type);
    this.setData("isDead", false);
    this.setData("animating",false)
  }
  explode(canDestroy) {
    if (!this.getData("isDead")) {
      this.setVisible(false);
      this.body.setVelocity(0, 0);
      let explosion = this.scene.add.sprite(this.x,this.y+0.5*this.height,'sprExplosion')
      explosion.setOrigin(0.5,0.5)
      explosion.scaleX = this._scaleX
      explosion.scaleY = this._scaleY
      explosion.play('sprExplosion')
      this.scene.sfx.explosions[Phaser.Math.Between(0, this.scene.sfx.explosions.length - 1)].play();
      if (this.shootTimer !== undefined) {
        if (this.shootTimer) {
          this.shootTimer.remove(false);
        }
      }
      this.setAngle(0);
      explosion.on('animationcomplete', function() {
        if (canDestroy) {
          this.destroy();
          explosion.destroy();
        }
        else {
          this.setVisible(false);
        }
      }, this);
      this.setData("isDead", true);
    }
  }
}

class SingleLetter extends Letter{
   constructor(scene, x, y, letter, style, type, hp, shoot) {
    super(scene, x, y, letter, style, type);
    this.setData("hp", hp);
    this.setData('letter',letter)
    this.body.velocity.y = Phaser.Math.Between(5, 10);
    this.setOrigin(0.5,0.5)
      this.maxBurst = (shoot === "radial") ? 15:1;
      this.shootTimer = this.scene.time.addEvent({
      delay: 3000,
      callback: function() {
        let shootBurst = this.scene.time.addEvent({
          delay:0,
          callback: function() {
            let index = shootBurst.repeatCount,
                start = Math.PI * -1,
                step = Math.PI / this.maxBurst * 2,
                angle = start + index * step,
                laser = new EnemyLaser(
                  this.scene,
                  this.x,
                  this.y+0.5*this.height,
                  shoot,
                  angle
                );
            laser.setScale(this.scaleX);
            scene.enemyLasers.add(laser);  
          },
          callbackScope: this,
          repeat:this.maxBurst
        })
        
      },
      callbackScope: this,
      loop: true
    });
  
     
  }
  onDestroy() {
    if (this.shootTimer !== undefined) {
      if (this.shootTimer) {
        this.shootTimer.remove(false);
      }
    }
  }
}


class Word {
  constructor(scene,word,hp){
    let letters = word.split('')
    let enemy = null
    let initialX = Phaser.Math.Between(0, scene.game.config.width*0.8)
    letters.forEach((e,i)=>{
      enemy = new SingleLetter(
              scene, 
              initialX + i*15,
              -100,
              e,
              {
                fontFamily:'Blue Owl',
                fontSize:36,
                color:'#ffffff'
              },
              'SingleLetter',
              hp
            
      )
      enemy.body.velocity.y = Phaser.Math.Between(50, 51)
      scene.enemies.add(enemy);
    })
  }

}

// class Word extends Phaser.GameObjects.Container {
//   constructor(scene, x, y, word) {
//     super(scene, x, y)
//     let letters = word.split('')
//     letters.forEach((e,i)=>{
//       let enemy = new Letter(scene,x+i,y, e, 24)
//       this.add(enemy)
//     })
//     this.body.velocity.y = Phaser.Math.Between(10,30);
//   }
// }

class Background extends Entity{
  constructor(scene, x, y, key, version, tints){
    super(scene, x, y, key, "Background");
    this.setTint(tints[0],tints[1],tints[2],tints[3]);
    this.setOrigin(0.5,0.15)
    if(version === 'dynamic'){
      this.play(key);
    }else{
      this.setOrigin(0.5,0)
    }
    if(this.scene.game.config.width>this.scene.game.config.height){
      this.scaleX = this.scene.game.config.width/this.width
      this.scaleY = this.scaleX
    }else{
      this.scaleY = this.scene.game.config.height/this.height
      this.scaleX = this.scaleY
      this.setOrigin(0.5,0)
    }
  }  
}
// class ScrollingBackground {
//   constructor(scene, key, velocityY) {
//     this.scene = scene;
//     this.key = key;
//     this.velocityY = velocityY;

//     this.layers = this.scene.add.group();

//     this.createLayers();
//   }

//   createLayers() {
//     for (var i = 0; i < 2; i++) {
//       // creating two backgrounds will allow a continuous flow giving the illusion that they are moving.
//       var layer = this.scene.add.sprite(0, 0, this.key);
//       layer.y = (layer.displayHeight * i);
//       var flipX = Phaser.Math.Between(0, 10) >= 5 ? -1 : 1;
//       var flipY = Phaser.Math.Between(0, 10) >= 5 ? -1 : 1;
//       layer.setScale(flipX * 2, flipY * 2);
//       layer.setDepth(-5 - (i - 1));
//       this.scene.physics.world.enableBody(layer, 0);
//       layer.body.velocity.y = this.velocityY;

//       this.layers.add(layer);
//     }
//   }

//   update() {
//     if (this.layers.getChildren()[0].y > 0) {
//       for (var i = 0; i < this.layers.getChildren().length; i++) {
//         var layer = this.layers.getChildren()[i];
//         layer.y = (-layer.displayHeight) + (layer.displayHeight * i);
//       }
//     }
//   }
// }