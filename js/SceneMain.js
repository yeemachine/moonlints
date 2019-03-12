

class SceneMain extends Phaser.Scene {
  constructor() {
    super({ key: "SceneMain" });
  }
  preload() {
    this.load.spritesheet("sprExplosion", "https://cdn.glitch.com/8292bab2-737d-4b03-970a-80900ba21761%2FsprExplosion.png?1550724438780", {
      frameWidth: 32,
      frameHeight: 32
    });
    this.load.spritesheet("sprEnemy0", "https://cdn.glitch.com/8292bab2-737d-4b03-970a-80900ba21761%2FsprEnemy0.png?1550724438008", {
      frameWidth: 16,
      frameHeight: 16
    });
    this.load.image("sprEnemy1", "https://cdn.glitch.com/8292bab2-737d-4b03-970a-80900ba21761%2FsprEnemy1.png?1550724438050");
    this.load.spritesheet("sprEnemy2", "https://cdn.glitch.com/8292bab2-737d-4b03-970a-80900ba21761%2FsprEnemy2.png?1550724438117", {
      frameWidth: 16,
      frameHeight: 16
    });
    this.load.spritesheet("sprLaserEnemy0", "https://cdn.glitch.com/8292bab2-737d-4b03-970a-80900ba21761%2Frgblaser.png?1551282868852",{
      frameWidth: 4,
      frameHeight: 4
    });

  }
  create() {
    magicblue.setWhite(255)

    this.anims.create({
      key: "sprEnemy0",
      frames: this.anims.generateFrameNumbers("sprEnemy0"),
      frameRate: 20,
      repeat: -1
    });
    this.anims.create({
      key: "sprEnemy2",
      frames: this.anims.generateFrameNumbers("sprEnemy2"),
      frameRate: 20,
      repeat: -1
    });
    this.anims.create({
      key: "sprExplosion",
      frames: this.anims.generateFrameNumbers("sprExplosion"),
      frameRate: 20,
      repeat: 0
    });
    this.anims.create({
      key: "sprPlayer",
      frames: this.anims.generateFrameNumbers("sprPlayer", { frames: [ 8,9,8,9,8,9,8,9,8,9] }),
      frameRate: 8,
      repeat: -1
    });
    this.anims.create({
      key: "sprLaserPlayer",
      frames: this.anims.generateFrameNumbers("sprLaserEnemy0"),
      frameRate: 4,
      repeat: -1
    });

    this.sfx = {
      explosions: [
        this.sound.add("sndExplode0",{volume: 0.1}),
        this.sound.add("sndExplode1",{volume: 0.1})
      ],
      laser: this.sound.add("sndLaser",{volume: 0.03})
    };

    this.bg = new Background(this,this.game.config.width*0.5, 0,'nichelsonStatic','static',[0xff33ff,0xff0000,0xff00ff,0x000033])
    this.bg.setAlpha(0)

    this.tweens.add({
        targets     : this.bg,
        alpha       : 1,
        ease        : 'Sine.easeInOut',
        duration    : 800,
    });
    
    
    
    this.player = new Player(
      this,
      this.game.config.width * 0.5,
      this.game.config.height * 0.75,
      "sprPlayer",
      255
    );
    this.player.play('sprPlayer')
    this.player.setPipeline('Custom');
    
    if(this.game.config.width < 600){
      this.joyStick = this.plugins.get('rexvirtualjoystickplugin').add(this, {
        x: this.game.config.width*0.5,
        y: this.game.config.height*0.9,
        radius: 40,
        base: this.add.graphics().fillStyle(0x888888).setAlpha(0.3).fillCircle(0, 0, 40),
        thumb: this.add.graphics().fillStyle(0xcccccc).setAlpha(0.9).fillCircle(0, 0,20),
        // dir: '8dir',   // 'up&down'|0|'left&right'|1|'4dir'|2|'8dir'|3
        // forceMin: 16,
        // enable: true
      })
    }

    
    this.time.addEvent({
      delay: 800,
      callback: function() {
        this.particles = this.add.particles('red');
        this.emitter = this.particles.createEmitter({
            speed: 20,
            scale: { start: 0.3, end: 0 },
            blendMode: 'ADD',
            delay:500,
            frequency:200
        });
        this.emitter.startFollow(this.player)
        this.children.bringToTop(this.player)
      },
      callbackScope: this
    });
    
    this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.enemies = this.add.group();
    this.enemyLasers = this.add.group();
    this.playerLasers = this.add.group();

    this.time.addEvent({
      delay: 1000,
      callback: function() {
        let maxEnemies = 25
        if (this.enemies.children.entries.length < maxEnemies){
        var enemy = null;

        if (Phaser.Math.Between(0, 1) >= 3) {
          enemy = new GunShip(
            this,
            Phaser.Math.Between(0, this.game.config.width),
            0,
            5
          );
        }
        else if (Phaser.Math.Between(0, 1) >= 5) {
          if (this.getEnemiesByType("ChaserShip").length < 5) {
            enemy = new ChaserShip(
              this,
              Phaser.Math.Between(0, this.game.config.width),
              0,
              1
            );
          }
        }
        else if(Phaser.Math.Between(0, 10) >= 5){
          let collection = new Word(this,aelxWords[Math.floor(Math.random() * aelxWords.length)],2)
        }
        else {
          enemy = new SingleLetter(
            this, 
            Phaser.Math.Between(0, this.game.config.width),
            -100,
            String.fromCharCode(
              Math.floor(Math.random() * 26) + 65
            ),
            {
              fontFamily:'Blue Owl',
              fontSize:36,
              color:'#ffffff'
            },
            'SingleLetter',
            24
          )
          enemy.setScale(2);
        }
    
        if (enemy !== null) {
          this.enemies.add(enemy);
        }
        }
      },
      callbackScope: this,
      loop: true
    });

    this.physics.add.overlap(this.playerLasers, this.enemies, function(playerLaser, enemy) {
      if (enemy) {
        let enemy_hp = enemy.getData("hp") - 1
        enemy.setData('hp', enemy_hp - 1)
        
        if(!enemy.getData("isDead") && enemy.getData('type') === 'SingleLetter' && enemy.getData('animating') === false){
          enemy.setData('animating',true)
          let animateText = enemy.scene.time.addEvent({
                delay:180,
                callback: function() {
                   enemy.setText(textFrames[enemy.getData('letter')][animateText.repeatCount])
                    enemy.setStyle({color:'#ff0000'})
                  if(animateText.repeatCount === 0){
                    enemy.setData('animating',false)
                    enemy.setStyle({color:'#ffffff'})
                  }
                },
                callbackScope: enemy,
                repeat:3
            })  
        }
        
        if (!enemy.getData("isDead") &&
          !playerLaser.getData("isDead")) {
          playerLaser.destroy();
        }
      if((enemy_hp - 1) <= 0 ){
        enemy.explode(true);
        // enemy.onDestroy();
      }
      }
    });

    this.physics.add.overlap(this.player, this.enemies, function(player, enemy) {
      let player_hp = player.getData("hp")
      let enemy_hp = enemy.getData("hp")
      player.setData('hp', player_hp - 1)
      enemy.setData('hp', enemy_hp - 1)
      
      magicblue.setRGB('255,0,0')
      let lightDim = player.scene.time.addEvent({
      delay:1000,
      callback: function() {
        magicblue.setWhite((player_hp-1))
      }
      })  
      
      if (!player.getData("isDead") &&
          !enemy.getData("isDead") && (enemy_hp-1) <= 0) {
        enemy.explode(true);
      }
      
      if((player_hp-1) <= 0 ){
        player.explode(false);
        player.onDestroy();
      }
    });

    this.physics.add.overlap(this.player, this.enemyLasers, function(player, laser) {
      let player_hp = player.getData("hp")
      player.setData('hp', player_hp - 1)
      magicblue.setRGB('255,0,0')
      let lightDim = player.scene.time.addEvent({
      delay:1000,
      callback: function() {
        magicblue.setWhite((player_hp-1))
      }
      })  
      
      if (!player.getData("isDead") &&
          !laser.getData("isDead")) {
        laser.destroy();
      }
      if((player_hp - 1) <= 0 ){
        player.explode(false);
        player.onDestroy();
      }
    });
    
    this.physics.add.overlap(this.playerLasers, this.enemyLasers, function(playerLaser, laser) {
      laser.destroy();
    });
  }

  getEnemiesByType(type) {
    var arr = [];
    for (var i = 0; i < this.enemies.getChildren().length; i++) {
      var enemy = this.enemies.getChildren()[i];
      if (enemy.getData("type") == type) {
        arr.push(enemy);
      }
    }
    return arr;
  }

  update() {

    if (!this.player.getData("isDead")) {
      this.player.update();
      if(typeof this.joyStick !== 'undefined'){
        let angle = this.joyStick.angle
        if (angle !== 0){
          let x = this.player.getData('speed') * Math.cos(angle * Math.PI/180)
          let y = this.player.getData('speed') * Math.sin(angle * Math.PI/180)
          this.player.body.setVelocity(x,y)
          this.player.setData("isShooting", true);
          console.log(this.player)
        }else{
          this.player.setData("timerShootTick", this.player.getData("timerShootDelay") - 1);
          this.player.setData("isShooting", false);
        }
      }else{
        if (this.keySpace.isDown) {
          this.player.setData("isShooting", true);
        }
        else {
          this.player.setData("timerShootTick", this.player.getData("timerShootDelay") - 1);
          this.player.setData("isShooting", false);
        }
      }
 
      if (this.keyW.isDown) {
        this.player.moveUp();
      }
      else if (this.keyS.isDown) {
        this.player.moveDown();
      }
      if (this.keyA.isDown) {
        this.player.moveLeft();
      }
      else if (this.keyD.isDown) {
        this.player.moveRight();
      }

   
    }

    
    //Remove Entities when offscreen
    for (var i = 0; i < this.enemies.getChildren().length; i++) {
      var enemy = this.enemies.getChildren()[i];

      enemy.update();

      if (enemy.x < -enemy.displayWidth ||
        enemy.x > this.game.config.width + enemy.displayWidth ||
        enemy.y < -enemy.displayHeight * 4 ||
        enemy.y > this.game.config.height + enemy.displayHeight) {
        if (enemy) {
          if (enemy.onDestroy !== undefined) {
            enemy.onDestroy();
          }
          enemy.destroy();
        }
      }
    }

    for (var i = 0; i < this.enemyLasers.getChildren().length; i++) {
      var laser = this.enemyLasers.getChildren()[i];
      laser.update();
      if (laser.x < -laser.displayWidth ||
        laser.x > this.game.config.width + laser.displayWidth ||
        laser.y < -laser.displayHeight * 4 ||
        laser.y > this.game.config.height + laser.displayHeight) {
        if (laser) {
          laser.destroy();
        }
      }
    }

    for (var i = 0; i < this.playerLasers.getChildren().length; i++) {
      var laser = this.playerLasers.getChildren()[i];
      laser.update();
      if (laser.x < -laser.displayWidth ||
        laser.x > this.game.config.width + laser.displayWidth ||
        laser.y < -laser.displayHeight * 4 ||
        laser.y > this.game.config.height + laser.displayHeight) {
        if (laser) {
          laser.destroy();
        }
      }
    }

    game.renderer.pipelines.Custom.setFloat1('time', pipelineTime);
    pipelineTime += 0.005;
    
    
  }
}