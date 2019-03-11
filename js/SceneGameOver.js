class SceneGameOver extends Phaser.Scene {
  constructor() {
    super({ key: "SceneGameOver" });
  }
  create() {
    pipelineTime = 0;
    this.cameras.main.fadeIn(250)

    this.bg = new Background(this,this.game.config.width*0.5, 0,'nichelson','dynamic',[0x00ffff,0xffff00,0xffeeff,0x0000ff])
    
    this.title = this.add.text(this.game.config.width * 0.5, this.game.config.height * 0.35, "T R Y A G A I N", {
      fontFamily: 'Blue Owl',
      fontSize: 128,
      fontStyle: 'bold',
      color: '#ffffff',
      align: 'center'
    });
    this.title.setOrigin(0.5);
    this.title.setPipeline('Custom');
  
    if(this.game.config.width < 600){
      this.title.scaleX = this.game.config.width/this.title.width * 0.7
      this.title.scaleY = this.title.scaleX
    }
    
    this.bg2 = new Background(this,this.game.config.width*0.5, 0,'nichelsonStatic','static',[0x000000,0x000000,0x000000,0x000000])
    this.bg2.setAlpha(0)
    
       this.sfx = {
      btnOver: this.sound.add("sndBtnOver"),
      btnDown: this.sound.add("sndBtnDown")
    };
    
    this.title.setInteractive();   

    this.title.on("pointerover", function(){
      this.title.setStyle({color:'#00aaff'})
      this.sfx.btnOver.play(); // play the button over sound
    },this)
    
    this.title.on("pointerout", function(){
      this.title.setStyle({color:'#ffffff'})
    },this)
    
     this.title.on("pointerdown", function(){
      this.sfx.btnDown.play(); // play the button over sound
    },this)

    this.title.on("pointerup", function() {
      this.tweens.add({
        targets     : this.bg2,
        alpha       : 1,
        ease        : 'Sine.easeInOut',
        duration    : 800,
      });
      let fadeOut = this.time.addEvent({
        delay:1200,
        callback: function() {
          this.scene.start("SceneMain");
        },
        callbackScope: this,
      })  
    }, this);

    
  }
  

  update() {
    // for (var i = 0; i < this.backgrounds.length; i++) {
    //   this.backgrounds[i].update();
    // }
  }
}