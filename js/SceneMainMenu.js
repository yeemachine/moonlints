let textFrames = {
  A : ['A','|','a','|'],
  B : ['B','|','b','|'],
  C : ['C','|','c','|'],
  D : ['D','|','d','|'],
  E : ['E','|','e','|'],
  F : ['F','|','f','|'],
  G : ['G','|','g','|'],
  H : ['H','|','h','|'],
  I : ['I','|','i','|'],
  J : ['J','|','j','|'],
  K : ['K','|','k','|'],
  L : ['L','|','l','|'],
  M : ['M','|','m','|'],
  N : ['N','|','n','|'],
  O : ['O','|','o','|'],
  P : ['P','|','p','|'],
  Q : ['Q','|','q','|'],
  R : ['R','|','r','|'],
  S : ['S','|','s','|'],
  T : ['T','|','t','|'],
  U : ['U','|','u','|'],
  V : ['V','|','v','|'],
  W : ['W','|','w','|'],
  X : ['X','|','x','|'],
  Y : ['Y','|','y','|'],
  Z : ['Z','|','z','|']  
}
let aelxWords = ['TUNNEL', 'YELLOW', 'SYNTH', 'SECAUCUS', 'EGG', 'LEG', 'BLACKLIGHT', 'SUBURBANSIGN', 'MILK', 'STRAWBERRY', 'FAMILYMAN', 'DIRTYDIT', 'NICHOLSON', 'NAYAUG', 'DENIPA']

class SceneMainMenu extends Phaser.Scene {
  constructor() {
    super({ key: "SceneMainMenu" });
  }
  preload() {
    this.load.spritesheet("nichelson", "https://cdn.glitch.com/8292bab2-737d-4b03-970a-80900ba21761%2FIMG_0293%20(4).png?1552277843670", {
      frameWidth: 125,
      frameHeight: 125
    });
    this.load.image("nichelsonStatic", "https://cdn.glitch.com/8292bab2-737d-4b03-970a-80900ba21761%2Fnichelson_static.png?1552231056824");
    this.load.image("sprBg1", "https://cdn.glitch.com/8292bab2-737d-4b03-970a-80900ba21761%2FsprBg1.png?1550724439007");
    this.load.image("sprBtnPlay", "https://cdn.glitch.com/8292bab2-737d-4b03-970a-80900ba21761%2FsprBtnPlay.png?1550724437935");
    this.load.image("sprBtnPlayHover", "https://cdn.glitch.com/8292bab2-737d-4b03-970a-80900ba21761%2FsprBtnPlayHover.png?1550724437863");
    this.load.image("sprBtnPlayDown", "https://cdn.glitch.com/8292bab2-737d-4b03-970a-80900ba21761%2FsprBtnPlayDown.png?1550724437830");
    this.load.image("sprBtnRestart", "https://cdn.glitch.com/8292bab2-737d-4b03-970a-80900ba21761%2FsprBtnRestart.png?1550724437885");
    this.load.image("sprBtnRestartHover", "https://cdn.glitch.com/8292bab2-737d-4b03-970a-80900ba21761%2FsprBtnRestartHover.png?1550724437901");
    this.load.image("sprBtnRestartDown", "https://cdn.glitch.com/8292bab2-737d-4b03-970a-80900ba21761%2FsprBtnRestartDown.png?1550724437872");
    this.load.audio("sndBtnOver", "https://cdn.glitch.com/8292bab2-737d-4b03-970a-80900ba21761%2FsndBtnOver.wav?1550724438330");
    this.load.audio("sndBtnDown", "https://cdn.glitch.com/8292bab2-737d-4b03-970a-80900ba21761%2FsndBtnDown.wav?1550724438255");
    this.load.image('white', 'https://cdn.glitch.com/8292bab2-737d-4b03-970a-80900ba21761%2Fwhite.png?1552328865713');
    this.load.image('red', 'https://cdn.glitch.com/8292bab2-737d-4b03-970a-80900ba21761%2Fred.png?1552328322052');

    
    this.load.image("sprLaserPlayer", "https://cdn.glitch.com/8292bab2-737d-4b03-970a-80900ba21761%2FsprLaserPlayer.png?1550724437948");
    this.load.spritesheet("sprPlayer", "https://cdn.glitch.com/8292bab2-737d-4b03-970a-80900ba21761%2Fblueowl.png?1552229204371", {
      frameWidth: 48,
      frameHeight: 28
    });
    this.load.audio("sndExplode0", "https://cdn.glitch.com/8292bab2-737d-4b03-970a-80900ba21761%2FsndExplode0.wav?1550724438413");
    this.load.audio("sndExplode1", "https://cdn.glitch.com/8292bab2-737d-4b03-970a-80900ba21761%2FsndExplode1.wav?1550724438531");
    this.load.audio("sndLaser", "https://cdn.glitch.com/8292bab2-737d-4b03-970a-80900ba21761%2FsndLaser.wav?1550724438653");
    
    var url = 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/plugins/dist/rexvirtualjoystickplugin.min.js';
    this.load.plugin('rexvirtualjoystickplugin', url, true);
  }
  create() {

    this.anims.create({
      key: "nichelson",
      frames: this.anims.generateFrameNumbers("nichelson"),
      frameRate: 8,
      repeat: -1,
      repeatDelay:3000
    });
    this.anims.create({
      key: "sprPlayerIdle",
      frames: this.anims.generateFrameNumbers("sprPlayer", { start: 0, end: 1 }),
      frameRate: 5,
      repeat: -1
    });
    this.anims.create({
      key: "sprPlayerSpin",
      frames: this.anims.generateFrameNumbers("sprPlayer", { start: 3, end: 9 }),
      frameRate: 8,
      repeat: 0
    });
    this.anims.create({
      key: "sprLaserPlayer",
      frames: this.anims.generateFrameNumbers("sprLaserPlayer"),
      frameRate: 20,
      repeat: -1
    });
    this.bg = new Background(this,this.game.config.width*0.5, 0,'nichelson','dynamic',[0xff33ff,0xff0000,0xff00ff,0x0000ff])
    
    this.title = this.add.text(this.game.config.width * 0.5, this.game.config.height * 0.35, "M O O N L I N T S", {
      fontFamily: 'Blue Owl',
      fontSize: 128,
      fontStyle: 'bold',
      color: '#ffffff',
      align: 'center'
    });
    
    this.title.setOrigin(0.5);
    this.title.setPipeline('Custom');
    let today = new Date().toLocaleDateString("en-US")
    let version = (today === '3/11/2019') ? 'HAPPY BIRTHDAY ALEX' : 'V 1.0.1'
    this.version = this.add.text(this.game.config.width * 0.5 - this.title.width * 0.5, this.game.config.height * 0.44, version, {
      fontFamily: 'Blue Owl',
      fontSize: 24,
      fontStyle: 'bold',
      color: '#ffffff',
      align: 'center'
    });
    
   
    this.particles = this.add.particles('red');
    this.emitter = this.particles.createEmitter({
        speed: 40,
        scale: { start: 0.4, end: 0 },
        blendMode: 'ADD',
        frequency:600
    });

    this.bg2 = new Background(this,this.game.config.width*0.5, 0,'nichelsonStatic','static',[0x000000,0x000000,0x000000,0x000000])
    this.bg2.setAlpha(0)
    
    this.player = new Player(
      this,
      this.game.config.width * 0.5 - this.title.width * 0.225,
      this.game.config.height * 0.335,
      "sprPlayer",
      255
    );
    this.player.setScale(1.3);
    this.player.setPipeline('Custom');
    this.player.play('sprPlayerIdle')
 
    this.emitter.startFollow(this.player)
    
    if(this.game.config.width < 600){
      this.title.scaleX = this.game.config.width/this.title.width * 0.7
      this.title.scaleY = this.title.scaleX
      
      
      this.version.x = this.game.config.width * 0.15
      this.version.y = this.game.config.height * 0.4
      this.player.y = this.game.config.height * 0.335
      this.player.x = this.game.config.width * 0.5 - this.title.width * 0.120
    }

    this.sfx = {
      btnOver: this.sound.add("sndBtnOver"),
      btnDown: this.sound.add("sndBtnDown")
    };
    
    this.title.setInteractive();   

    this.title.on("pointerover", function(){
      this.title.setStyle({color:'#ff00aa'})
      this.sfx.btnOver.play(); // play the button over sound
    },this)
    
    this.title.on("pointerout", function(){
      this.title.setStyle({color:'#ffffff'})
    },this)
    
     this.title.on("pointerdown", function(){
      this.sfx.btnDown.play(); // play the button over sound
    },this)

//     this.title.on("pointerup", function() {
//       this.player.play('sprPlayerSpin')
//       this.tweens.add({
//         targets : this.player ,
//         scaleX: 1,
//         scaleY: 1,
//         x : this.game.config.width * 0.5, 
//         y : this.game.config.height * 0.75,
//         ease : 'Sine.easeInOut',
//         duration : 800,
//       });
//       this.tweens.add({
//         targets     : this.bg2,
//         alpha       : 1,
//         ease        : 'Sine.easeInOut',
//         duration    : 800,
//       });

//       this.player.on('animationcomplete', function(){
//         this.scene.start("SceneMain");
//       }, this);
//     }, this);
    
    
      let originalText = this.title._text
      let originalArray = originalText.split('')

      let counter = 0
      this.scene.scene.time.addEvent({
          delay:1500,
          callback: function() {
              let animateText = this.scene.scene.time.addEvent({
                delay:180,
                callback: function() {
                    if (counter < 8){
                      let newText = []
                      originalArray.forEach((e,i)=>{
                        if(i === 4){
                          newText.push(textFrames[e][animateText.repeatCount])
                        }else{
                          newText.push(e)
                        }
                      })
                      this.title.setText(newText.join(''))
                      counter += 1
                    } 
                },
                callbackScope: this,
                repeat:3
              })
          },
          callbackScope: this,
          loop:true
        })
    
        this.scene.scene.time.addEvent({
          delay:4500,
          callback: function() {
              let animateText = this.scene.scene.time.addEvent({
                delay:180,
                callback: function() {
                  if (animateText.repeatCount === 6){
                    this.title.setText("| | | | | | | ||")
                  }
                  if (animateText.repeatCount >= 2 && animateText.repeatCount < 6){
                    this.title.setText('T O M L I N S O N')
                  }
                  if (animateText.repeatCount === 1){
                    this.title.setText("| | | | | | | ||")
                  }
                  if (animateText.repeatCount === 0){
                    this.title.setText('M O O N L I N T S')
                    counter = 0
                  }
                },
                callbackScope: this,
                repeat:6
              })
          },
          callbackScope: this,
          loop:true
        })
  }

  update() {
    game.renderer.pipelines.Custom.setFloat1('time', pipelineTime);
    pipelineTime += 0.005;
  }
}

