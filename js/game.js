let pipelineTime = 0.0
let CustomPipeline = new Phaser.Class({
    Extends: Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline,
    initialize:
    function CustomPipeline (game)
    {
    Phaser.Renderer.WebGL.Pipelines.TextureTintPipeline.call(this, {
            game: game,
            renderer: game.renderer,
            fragShader: [
               'precision lowp float;',
                'varying vec2 outTexCoord;',
                'varying vec4 outTint;',
                'uniform sampler2D uMainSampler;',
                'uniform float alpha;',
                'uniform float time;',
                'void main() {',
                    'vec4 sum = vec4(0);',
                    'vec2 texcoord = outTexCoord;',
                    'for(int xx = -4; xx <= 4; xx++) {',
                        'for(int yy = -4; yy <= 4; yy++) {',
                            'float dist = sqrt(float(xx*xx) + float(yy*yy));',
                            'float factor = 0.0;',
                            'if (dist == 0.0) {',
                                'factor = 2.0;',
                            '} else {',
                                'factor = 2.0/abs(float(dist));',
                            '}',
                            'sum += texture2D(uMainSampler, texcoord + vec2(xx, yy) * 0.002) * (abs(sin(time))+0.02);',
                        '}',
                    '}',
                    'gl_FragColor = sum * 0.025 + texture2D(uMainSampler, texcoord)*alpha;',
                '}'
            ].join('\n')
        });
    } 
});

let config = {
  type: Phaser.WEBGL,
  scale: {
    parent: 'gameDiv',
    mode: Phaser.Scale.ENVELOP,
    width: window.innerWidth,
    height: window.innerHeight,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  // backgroundColor: "black",
  transparent: true,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 0 }
    }
  },
  scene: [
    SceneMainMenu,
    SceneMain,
    SceneGameOver
  ],
  pixelArt: true,
  roundPixels: true,
  callbacks: {
    postBoot: game => {
      game.renderer.addPipeline('Custom', new CustomPipeline(game)).setFloat1('alpha', 1.0);

    }
  }
};

const game = new Phaser.Game(config);

let startGame = () => {
  let mainMenuActive = game.scene.isActive('SceneMainMenu');
  let gameOverActive = game.scene.isActive('SceneGameOver');
  let mainMenu = game.scene.scenes[0]
  let mainScene = game.scene.scenes[1]
  let gameOver = game.scene.scenes[2]
  
  if(mainMenuActive === true){
    mainMenu.player.play('sprPlayerSpin')
    mainMenu.tweens.add({
      targets : mainMenu.player ,
      scaleX: 1,
      scaleY: 1,
      x : mainMenu.game.config.width * 0.5, 
      y : mainMenu.game.config.height * 0.75,
      ease : 'Sine.easeInOut',
      duration : 800,
    });
    mainMenu.tweens.add({
      targets     : mainMenu.bg2,
      alpha       : 1,
      ease        : 'Sine.easeInOut',
      duration    : 800,
    });

    mainMenu.player.on('animationcomplete', function(){
      this.scene.start("SceneMain");
    }, mainMenu);    
  }
  
  if(gameOverActive === true){
    gameOver.tweens.add({
      targets     : gameOver.bg2,
      alpha       : 1,
      ease        : 'Sine.easeInOut',
      duration    : 800,
    });
    let fadeOut = gameOver.time.addEvent({
      delay:1200,
      callback: function() {
        this.scene.start("SceneMain");
      },
      callbackScope: gameOver,
    })  
  }
}
document.querySelector('#gameDiv').addEventListener("click", startGame);
document.querySelector('#gameDiv').addEventListener("touchstart", startGame);

// let resize = () => {
//   game.scene.scenes.forEach((e,i)=>{
//     e.game.config.width = window.innerWidth
//     e.game.config.height = window.innerHeight
//     console.log(window.innerWidth,e.game.config.width)
//   })
//   console.log(game.scene.scenes[1])
// }
// window.addEventListener("resize", resize, false);

