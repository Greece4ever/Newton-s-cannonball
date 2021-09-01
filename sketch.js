let system = {
    size: new Vector(window.innerWidth, window.innerHeight),
    translate: new Vector(0, 0),
    zoom: 50
  }
  
  
  const toPixels = (x, y) => {
    let center = system.translate.add( system.size.multiply(0.5) );
    let __ = center.add( new Vector(x * system.zoom, -y * system.zoom) );
    return [__.x, __.y]
  }

  const toPixelsVector = (x, y) => {
    let center = system.translate.add( system.size.multiply(0.5) );
    let __ = center.add( new Vector(x * system.zoom, -y * system.zoom) );
    return __;
  }

  const setZoom = (value) => {
    system.zoom = value;
    system.unit = toPixelsVector(1, 1).add( toPixelsVector(0, 0).multiply(-1) );
    system.unit.y *= -1;
  }
  

const Circle = (x, y, r=1) => {    
    ellipse(...toPixels(x, y), r * system.unit.x, r * system.unit.y);
}
  

let __font;
let __earth;
let __canon;
let __hill;

let __BOOM_SOUND;

function preload()
{
  __earth = loadImage("earth.png")
  __canon = loadImage("canon.png");
  __hill = loadImage("hill.svg")
  __BOOM_SOUND = loadSound("explosion.mp3")
};

function setup() {
  setZoom(system.zoom);
  createCanvas(system.size.x, system.size.y);
}

function VectorSum(vector_array) {
  let vec = new Vector(0, 0);
  for(let i=0; i < vector_array.length; i++)
  {
    vec = vec.add(vector_array[i]);
  }
  return vec;
}


Math.dist = (a, b) => {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

let drawVectors = false;

class Particle {
  constructor(data)
  {
    this.mass = data.mass ?? 1; // in kg
    
    this.forces = [];
    this.velocity = new Vector(0, 0);
    this.positition = data.position ?? new Vector(0, 0);
    this.radius = data.radius ?? 8;

    this.points = [];
  }


  gravitation(p2) { // add gravitation forces to self from other object
    let p1 = this;

    let R = Math.dist(p1.positition, p2.positition) * Math.pow(10, 6); // in meters
    let g = G*p2.mass / (R*R);

    let F = p1.mass*g;

    let vec = p2.positition.subtract(p1.positition);
        

    // p1.update(deltaTime * 0.001);
    p1.forces = [ vec.getUnitVector().multiply(F)  ]    


            // let R = Math.dist(p1.positition, p2.positition) * Math.pow(10, 6); // in meters
    // let g = G*p2.mass / (R*R);

    // F = p1.mass*g;

  // let vec = p2.positition.subtract(p1.positition);
  if (drawVectors )
    drawArrow2(p1.positition, vec.getUnitVector().multiply(g).add(p1.positition), '#fa4b3e');
  // drawArrow2(p1.positition, p1.velocity, 'blue');


  }
  
  update(deltaTime)
  {
    this.acceleration = VectorSum(this.forces).multiply(1/this.mass);
    {
      let [x0, u0, a, Δt] = [this.positition, this.velocity, this.acceleration, deltaTime]
      
      // position
      this.positition.x = x0.x + u0.x * Δt + 0.5 * a.x * (Δt * Δt) // x0 + u0t + 1/2at^2
      this.positition.y = x0.y + u0.y * Δt + 0.5 * a.y * (Δt * Δt) // x0 + u0t + 1/2at^2

      // velocity
      this.velocity.x = u0.x + a.x * Δt;
      this.velocity.y = u0.y + a.y * Δt;
    }
  };

  drawOrbit()
  {
    this.points.push( this.positition.multiply(1) );
    push();
    fill(255, 255, 255, 255)
    // stroke(50, 255, 0, 255)
    {
      let prev = this.points[0];
      for (let i=1; i < this.points.length; i+=5)
      {
        let next = this.points[i];
        Circle(prev.x, prev.y, 0.1)
        // Circle(next.x, next.y, 0.1)
        // drawArrow(prev, next, 'white');
        prev = next;
      }
    }
    pop();

    if (this.points.length > 1000) {
      this.points = []; //this.points.slice(500, this.points.length);
    }
  };

  checkCollision(p2)
  {
    let p1 = this;

    let x1 = toPixelsVector(p1.positition.x, p1.positition.y);
    let x2 = toPixelsVector(p2.positition.x, p2.positition.y)
    
    let r1 = p1.radius/2 * system.unit.x;
    let r2 = p2.radius/2 * system.unit.x;

    let center_dist = Math.dist(x1, x2);


    let dist = center_dist - r1 - r2;
    if (dist < -1)
      return true
  };


  draw() {
    Circle(this.positition.x, this.positition.y, this.radius);
  }
}

const G = 6.67408 * Math.pow(10, -11);


let earth = new Particle({mass: 5.972 * Math.pow(10, 24), radius: 6.371, position: new Vector(0, 0)})


// let p1 = new Particle({mass: 10, position: new Vector(0, earth.radius / 2 + 0.08), radius: 0.2});


document.body.addEventListener("wheel", e => {
  if (e.deltaY > 0) {
    // system.zoom += 1;
    setZoom(system.zoom + 1);
  }

  if (e.deltaY < 0) {
    if (system.zoom === 1)
      return;
    else {
      setZoom(system.zoom - 5);
      if (system.zoom <= 0) {
        setZoom(1);
      }
    }
  }

})

// p1.velocity.x = 13;
// p1.velocity.y = 4;

function drawBackground()
{
  background(0);
    push();
  
    fill(5,  5, 5, 130);
    for(i = 0; i < 100; i++){
      ellipse(...toPixels(0,0), i*40);
    }  
    pop();
}

function drawEarth()
{
  push();
    let [w, h] = [7.1 * system.unit.x, 7.1 * system.unit.y]
    image(__earth, system.size.x / 2 - w /2, system.size.y / 2 - h /2, w, h);
  pop();
}


var CANON_SPEED = new Vector(0, 0);


function drawCanon() {
  push();
    fill(83,157,142, 155); 
    stroke(0, 0, 0, 255)
    rect(system.size.x /2 - 0.1 * system.unit.x , system.size.y /2 - 7*0.5 * system.unit.x,   system.unit.x /4, system.unit.y)
  pop();


  push();
    rectMode(CENTER);

    let [x, y] = toPixels(0, earth.radius * 0.5 + 0.5)

    let mouse = new Vector(mouseX, mouseY).subtract( new Vector(x, y) );
    let angle = Math.atan2(mouse.y, mouse.x);


    translate(x, y)
    rotate(angle - Math.PI / 2);

    // rect(0, 0, system.unit.x, system.unit.y);

    image(__canon, -system.unit.x/2, -system.unit.x/2, system.unit.x, system.unit.x);
  pop();


  let dR = Math.dist( mouse,  new Vector( -system.unit.x/2, -system.unit.x/2 )) /system.unit.x;

  angle = -angle
  let r = dR;
  let _y = r*Math.sin(angle);
  let _x = r * Math.cos(angle);
  CANON_SPEED.x = _x;
  CANON_SPEED.y = _y;

  

  push();
    translate(mouseX, mouseY);
    let length = 15;

    stroke(255, 255, 255, 255)
    line(0, 0, length, 0)
    line(0, 0, -length, 0)

    line(0, length, 0, -length)

    ellipse(0, 0, length, length)

  pop();

}

let paused = false;

window.addEventListener("blur", e => {
  paused = true;
})


window.addEventListener("focus", e => {
  paused = false;
})



let CANON_BALLS = [];

window.addEventListener("resize", e => {
  system.size = new Vector(window.innerWidth, window.innerHeight);
  resizeCanvas(window.innerWidth, window.innerHeight, false);
})

window.addEventListener("keydown", e => {
  if (e.code === "Enter") {
    for (let i=0; i < CANON_BALLS.length; i++)
      __BOOM_SOUND.play();    
    CANON_BALLS = [];
  }
  else if (e.code === "Backspace") {
    drawVectors = !drawVectors;
  }
})



function draw() {
  if (paused) return;

  drawBackground();
    fill("#161942")
    stroke("#161942");    
    earth.draw();

    drawCanon();    
    drawEarth();

    fill(52, 177, 235, 127);
    stroke(33, 66, 82);
  
    let to_be_removed = [];

    for (let i=0; i < CANON_BALLS.length; i++)
    {
      CANON_BALLS[i].update(deltaTime * 0.001);
      CANON_BALLS[i].gravitation(earth)
      CANON_BALLS[i].draw();
      CANON_BALLS[i].drawOrbit();


      if (CANON_BALLS[i].checkCollision(earth)) {
        to_be_removed.push(CANON_BALLS[i]);
        __BOOM_SOUND.play();
      }
    }

    CANON_BALLS = CANON_BALLS.filter(i => !to_be_removed.includes(i) )




    // p1.update(deltaTime * 0.001);
    // p1.gravitation(earth);


    // p1.drawOrbit();
    // p1.draw()


    // if (p1.checkCollision(earth)) {
    //   debugger
    // }

}


function drawArrow(base, vec, myColor) {
  push();
    stroke(myColor);
    // strokeWeight(3);
    fill(myColor);
    line( ...toPixels(base.x, base.y), ...toPixels(vec.x, vec.y));
  pop();
}


function drawArrow2(base, vec, myColor) {
    let p1 = toPixelsVector(base.x, base.y);
    let p2 = toPixelsVector(vec.x, vec.y);

    fill(255, 255, 255, 255);
    stroke(255, 255, 255, 255)

    push();
      stroke(myColor);
      strokeWeight(2);
      fill(myColor);
      line( ...toPixels(base.x, base.y), ...toPixels(vec.x, vec.y));
    pop();

    var offset = 8;

    push() //start new drawing state
    stroke(myColor);
    fill(myColor);
      var angle = atan2(p1.y - p2.y, p1.x - p2.x); //gets the angle of the line
      translate(p2.x, p2.y); //translates to the destination vertex
      rotate(angle-HALF_PI); //rotates the arrow point
      triangle(-offset*0.5, offset, offset*0.5, offset, 0, -offset/2); //draws the arrow point as a triangle

    pop();
}
  

function mouseClicked(event) {

  if (event.target === document.querySelector("canvas")) {
      // let ball = new Particle({mass: 10, position: new Vector(0, earth.radius / 2 + 0.08), radius: 0.2});
      let ball = new Particle({mass: 10, position: new Vector(0, earth.radius / 2 + 0.5), radius: 0.2});
      ball.velocity.x = CANON_SPEED.x
      ball.velocity.y = CANON_SPEED.y
      // ball.velocity.x = 3

      CANON_BALLS.push(ball);

      __BOOM_SOUND.play()
  }
}



    // let R = Math.dist(p1.positition, p2.positition) * Math.pow(10, 6); // in meters
    // let g = G*p2.mass / (R*R);

    // F = p1.mass*g;

    // let vec = p2.positition.subtract(p1.positition);
    // drawArrow2(p1.positition, vec.getUnitVector().multiply(1).add(p1.positition), 'black');
    // drawArrow2(p1.positition, p1.velocity, 'black');
