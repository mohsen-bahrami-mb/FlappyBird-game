var cvs = document.getElementById('mycanvas') && document.getElementsByTagName('canvas')[0],
   ctx = cvs.getContext('2d');

var frames = 0;
var sprite = new Image();
sprite.src = "./img/sprite.png";

var DIE = new Audio(),
   FLAP = new Audio(),
   HIT = new Audio(),
   SCORE = new Audio(),
   START = new Audio();

DIE.src = './audio/die.wav';
FLAP.src = './audio/flap.wav';
HIT.src = './audio/hit.wav';
SCORE.src = './audio/score.wav';
START.src = './audio/start.wav';

var DEGREE = Math.PI / 180;

var state = {
   current: 0,
   getReady: 0,
   game: 1,
   over: 2
}

function clickHandler(a) {
   if (!a) {
      switch (state.current) {
         case state.getReady:
            START.play()
            state.current = state.game;
            break;
         case state.game:
            FLAP.play()
            bird.flap();
            break;
      }
   }
   if (state.current == state.over && a == "again") {
      bird.speed = 0
      bird.rotation = 0
      pipes.position = []
      score.value = 0
      state.current = state.getReady;
   }
}

document.addEventListener('click', function (e) {
   clickHandler()
   x = e.clientX
   y = e.clientY
   ex1 = cvs.offsetLeft + gameOver.x + 70
   ex2 = cvs.offsetLeft + gameOver.x + gameOver.w - 70
   ey1 = cvs.offsetTop + gameOver.y + 180
   ey2 = cvs.offsetTop + gameOver.y + gameOver.h
   if (ex1 <= x && x <= ex2 && ey1 <= y && y <= ey2) {
      clickHandler("again")
   }
});
document.addEventListener('keydown', function (e) {
   if (e.which == 32 && !e.repeat) {
      clickHandler()
   }
   if (e.which == 13) {
      clickHandler("again")
   }
});

var pipes = {
   top: {
      sx: 553
   },
   bottom: {
      sx: 502
   },
   sy: 0,
   w: 53,
   h: 400,
   dx: 2,
   gap: 80,
   maxYPos: -150,
   position: [],

   draw: function () {
      for (var i = 0; i < this.position.length; i++) {
         var p = this.position[i];

         var topYPos = p.y;
         var bottomYPos = p.y + this.h + this.gap;

         ctx.drawImage(sprite, this.top.sx, this.sy, this.w, this.h, p.x, topYPos, this.w, this.h);
         ctx.drawImage(sprite, this.bottom.sx, this.sy, this.w, this.h, p.x, bottomYPos, this.w, this.h);
      }
   },

   update: function () {
      if (state.current != state.game) return;
      if (frames % 100 == 0) {
         this.position.push({
            x: cvs.width,
            y: (Math.random() + 1) * this.maxYPos
         })
      }
      for (var i = 0; i < this.position.length; i++) {
         var p = this.position[i];
         p.x -= this.dx

         var bottomPipePose = p.y + this.h + this.gap
         if (bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + this.w && bird.y - bird.radius < p.y + this.h && bird.y + bird.radius > p.y) {
            HIT.play();
            state.current = state.over
         }
         if (bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + this.w && bird.y - bird.radius < bottomPipePose + this.h && bird.y + bird.radius > bottomPipePose) {
            HIT.play();
            state.current = state.over
         }

         if (p.x + this.w <= 0) {
            this.position.shift()
            score.value += 1
            SCORE.play();
            score.best = Math.max(score.value, score.best)
            localStorage.setItem("best", score.best)
         }
      }
   }
}

var getReady = {
   sx: 0,
   sy: 228,
   w: 173,
   h: 152,
   x: cvs.width / 2 - 173 / 2,
   y: 90,

   draw: function () {
      if (state.current == state.getReady) {
         ctx.drawImage(sprite, this.sx, this.sy, this.w, this.h, this.x, this.y, this.w, this.h);
      }
   }
};

var gameOver = {
   sx: 175,
   sy: 228,
   w: 225,
   h: 202,
   x: cvs.width / 2 - 225 / 2,
   y: 90,

   draw: function () {
      if (state.current == state.over) {
         ctx.drawImage(sprite, this.sx, this.sy, this.w, this.h, this.x, this.y, this.w, this.h);
      }
   }
};

var bg = {
   sx: 0,
   sy: 0,
   w: 275,
   h: 226,
   x: 0,
   y: cvs.height - 226,

   draw: function () {
      ctx.drawImage(sprite, this.sx, this.sy, this.w, this.h, this.x, this.y, this.w, this.h);
      ctx.drawImage(sprite, this.sx, this.sy, this.w, this.h, this.x + this.w, this.y, this.w, this.h)
   },
};

var fg = {
   sx: 276,
   sy: 0,
   w: 224,
   h: 112,
   x: 0,
   y: cvs.height - 112,
   dx: 2,

   draw: function () {
      ctx.drawImage(sprite, this.sx, this.sy, this.w, this.h, this.x, this.y, this.w, this.h);
      ctx.drawImage(sprite, this.sx, this.sy, this.w, this.h, this.x + this.w, this.y, this.w, this.h)
   },

   update: function () {
      if (state.current == state.game) {
         this.x = (this.x - this.dx) % (this.w / 2)
      }
   }
};

var bird = {
   animation: [
      { sy: 112 },
      { sy: 139 },
      { sy: 164 },
      { sy: 139 }
   ],
   sx: 276,
   w: 34,
   h: 26,
   x: 50,
   y: 150,

   speed: 0,
   gravity: 0.25,
   jump: 4.6,
   rotation: 0,

   radius: 12,

   animationIndex: 0,
   draw: function () {
      var bird = this.animation[this.animationIndex];
      ctx.save();
      ctx.translate(this.x, this.y)
      ctx.rotate(this.rotation);
      ctx.drawImage(sprite, this.sx, bird.sy, this.w, this.h, - this.w / 2, - this.h / 2, this.w, this.h);
      ctx.restore();
   },

   flap: function () {
      if (this.y - this.h - this.speed <= 0) {
         return
      } else {
         this.speed -= this.jump;
      }
   },

   update: function () {
      var period = state.current == state.getReady ? 10 : 5;
      this.animationIndex += frames % period == 0 ? 1 : 0;
      this.animationIndex = this.animationIndex % this.animation.length;

      if (state.current == state.getReady) {
         this.y = 150
      } else {
         this.speed += this.gravity;
         this.y += this.speed;

         if (this.speed + 1 < this.jump && this.rotation > (-1 * 25 * DEGREE)) {
            this.rotation -= (1 * DEGREE)
         } else if (this.speed + 1 > this.jump && this.rotation < (80 * DEGREE) && this.y + this.h / 2 <= fg.y) {
            this.rotation += (5 * DEGREE)
         }
         // if (this.speed + 1 < this.jump && this.rotation > -0.44) {
         //     this.rotation -= (1 * DEGREE)
         // } else if (this.speed + 1 > this.jump && this.rotation < 1.39 && this.y + this.h / 2 <= fg.y) {
         //     this.rotation += (5 * DEGREE)
         // }
         // // change rotation in the moment:
         // if (this.speed < this.jump) {
         //     this.rotation = -25 * DEGREE
         // } else if (this.speed > this.jump) {
         //     this.rotation = 90 * DEGREE
         // }
      }
      if (this.y + this.h / 2 >= fg.y) {
         this.y = fg.y - this.h / 2;
         this.animationIndex = 1;
         if (state.current == state.game) {
            DIE.play()
            state.current = state.over;
         }
      }
   }
};

var score = {
   best: parseInt(localStorage.getItem('best')) || 0,
   value: 0,
   // medal:{0},
   draw: function () {
      ctx.fillStyle = "#FFF";
      ctx.strokeStyle = "#000";
      if (state.current == state.game) {
         ctx.lineWidth = 2;
         ctx.font = "30px IMPACT";
         ctx.fillText(this.value, cvs.width / 2 - 5, 50);
         ctx.strokeText(this.value, cvs.width / 2 - 5, 50);
      } else if (state.current == state.over) {
         ctx.font = "25px IMPACT";

         ctx.fillText(this.value, 225, 186);
         ctx.strokeText(this.value, 225, 186);

         ctx.fillText(this.best, 225, 228);
         ctx.strokeText(this.best, 225, 228);

      }
   }
}

function update() {
   bird.update();
   fg.update();
   pipes.update();
}

function draw() {
   ctx.fillStyle = "#70c5ce";
   ctx.fillRect(0, 0, cvs.width, cvs.height);
   bg.draw();
   pipes.draw();
   fg.draw();
   bird.draw();
   getReady.draw();
   gameOver.draw();
   score.draw();
}

function animate() {
   update();
   draw();
   frames++;
   requestAnimationFrame(animate)
}

animate();
