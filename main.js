class Vector{
	constructor(x,y){
		this.x = x;
		this.y = y;
	}

	normalize(){
		let normalFactor = Math.sqrt((this.x*this.x) + (this.y*this.y));
		return (new Vector(this.x/normalFactor,this.y/normalFactor));
	}

	distance(x2,y2){
		let distance = Math.sqrt(((this.x - x2) * (this.x - x2)) + ((this.y - y2)*(this.y - y2)))
		return distance;
	}

	getNormalFactor(){
		return (Math.sqrt((this.x*this.x) + (this.y*this.y)));
	}
}

class Ball{
	constructor(x,y,number,mass){
		this.position = new Vector(x,y);
		this.velocity = new Vector(0,0);
		this.number = number;
		this.color = '#FFFFFF';
		this.mass = mass;
		balls.push(this);
	}
}

//Some parameters
let poolWidth = 1280,poolHeight = 720;
let ballRadius = 40;
let balls = [];
let cueForce = 1;
let startingClickPoint = new Vector(0,0);
let cueLength = 170;
let cueBall,mcOffset,normalFactor,mcOffsetNormal;
let forceAmplifier = 0.2;
let friction = 0.04;
let lockedVector = new Vector(0,0);
let lineRenderer = false;

function setup(){
	createCanvas(1280, 720);
	frameRate(60);
	let ball = new Ball(Math.floor(Math.random() * 800) + 200,Math.floor(Math.random() * 400) + 100,0,6); //Cue ball has the weight of 6 oz
	for(let i = 1; i <= 5;i++){
		ball = new Ball(Math.floor(Math.random() * 800) + 200,Math.floor(Math.random() * 400) + 100,i,5.5); // Other balls have the weight of 5.5 oz
	}

	cueBall = balls[0];
}

function draw(){
	background(0);

	//Cue vector calculation
	if(!mouseIsPressed){
	mcOffset = new Vector(cueBall.position.x - mouseX, cueBall.position.y - mouseY); //Getting the vector
		//Normalizing vector
		normalFactor = Math.sqrt((mcOffset.x * mcOffset.x) + (mcOffset.y * mcOffset.y));
		mcOffsetNormal = new Vector(mcOffset.x / normalFactor, mcOffset.y / normalFactor);
	}else{
		lockedVector = mcOffset;
		console.log("Locked Vector : " + lockedVector)
	}

	console.log(mcOffsetNormal);
	stroke(255,0,0);

	//Rendering the cue
	if(lineRenderer){
		line(cueBall.position.x + (mcOffsetNormal.x * cueForce) + (mcOffsetNormal.x * 30) , cueBall.position.y + (mcOffsetNormal.y * cueForce) + (mcOffsetNormal.y * 30),
			cueBall.position.x + (mcOffsetNormal.x * cueForce) + (mcOffsetNormal.x * 200), cueBall.position.y + (mcOffsetNormal.y * cueForce) + (mcOffsetNormal.y * 200));
	}

	//Balls updater
	for (let i = 0; i < balls.length; i++) {

		fill(balls[i].color);
		ellipse(balls[i].position.x,balls[i].position.y,ballRadius,ballRadius);

		//Velocity logger
		console.log((i+1)+" : " + balls[i].velocity.x + ", " + balls[i].velocity.y);
		balls[i].position.x += balls[i].velocity.x;
		balls[i].position.y += balls[i].velocity.y;

		balls[i].velocity.x -= balls[i].velocity.x * friction;
		balls[i].velocity.y -= balls[i].velocity.y * friction;

		if(Math.abs(balls[i].velocity.x) <= 0.05){
			balls[i].velocity.x = 0;
		}
		if(Math.abs(balls[i].velocity.y) <= 0.05){
			balls[i].velocity.y = 0;
		}

		//Rendering ball number
		fill((0,0,0));
		textSize(24);
		text(balls[i].number + '',balls[i].position.x - ballRadius/5,balls[i].position.y + ballRadius/5);

		//Checking collisions
			//Bouncing off the wall
		if(balls[i].position.x - ballRadius <= 0 || balls[i].position.x + ballRadius >= poolWidth){
			balls[i].velocity.x *= -1;
		}

		if(balls[i].position.y - ballRadius <= 0 || balls[i].position.y + ballRadius >= poolHeight){
			balls[i].velocity.y *= -1;
		}

			//Ball to ball collision
		for(let j = 0; j < balls.length; j++){
			if(i != j){
				
				distance = ((balls[i].position.x - balls[j].position.x) * (balls[i].position.x - balls[j].position.x))
							+((balls[i].position.y - balls[j].position.y)*(balls[i].position.y - balls[j].position.y))
				
				if(distance <= (ballRadius*ballRadius)){
					//Do something when collide
					let sqrtDistance = Math.sqrt(distance);
					let displace = new Vector(balls[j].position.x - balls[i].position.x,balls[j].position.y - balls[i].position.y)
					
					//Static collision
					let displaceNormalized = displace.normalize();
					balls[j].position.x += displaceNormalized.x * (ballRadius*2 - sqrtDistance)/20;
					balls[j].position.y += displaceNormalized.y * (ballRadius*2 - sqrtDistance)/20;

					balls[i].position.x += displaceNormalized.x * -1 * (ballRadius*2 - sqrtDistance)/20;
					balls[i].position.y += displaceNormalized.y * -1 * (ballRadius*2 - sqrtDistance)/20;

					//console.log("Normal x : " + displaceNormalized.x + ", y : " + displaceNormalized.y);

					/*Dynamic collision*/
					let displaceNNormalized = (new Vector(displace.y * -1,displace.x)).normalize();
					
						//Calculating tangental response
					let tan1 =  balls[i].velocity.x * displaceNNormalized.x + balls[i].velocity.y * displaceNNormalized.y;
					let tan2 = balls[j].velocity.x * displaceNNormalized.x + balls[j].velocity.y * displaceNNormalized.y;

						//Calculating normal response
					let normal1 = balls[i].velocity.x * displaceNormalized.x + balls[i].velocity.y * displaceNormalized.y;
					let normal2 = balls[j].velocity.x * displaceNormalized.x + balls[j].velocity.y * displaceNormalized.y;

					let m1 = (normal1 * (balls[i].mass - balls[j].mass) + 2 * balls[j].mass * normal2) / (balls[i].mass + balls[j].mass);
					let m2 = (normal2 * (balls[j].mass - balls[i].mass) + 2 * balls[i].mass * normal1) / (balls[i].mass + balls[j].mass);

					balls[i].velocity.x = displaceNNormalized.x * tan1 + displaceNormalized.x * m1;
					balls[i].velocity.y = displaceNNormalized.y * tan1 + displaceNormalized.y * m1;

					balls[j].velocity.x = displaceNNormalized.x * tan2 + displaceNormalized.x * m2;
					balls[j].velocity.y = displaceNNormalized.y * tan2 + displaceNormalized.y * m2;

				}
			}
		}

	}

	if(Math.abs(balls[0].velocity.x) <= 0.05 && Math.abs(balls[0].velocity.y) <= 0.05){
		lineRenderer = true;
	}else{
		lineRenderer = false;
	}

	console.log("Force : " + cueForce)
}

function mousePressed(){
	startingClickPoint.x = mouseX;
	startingClickPoint.y = mouseY;
}

function mouseDragged(){
	if(lineRenderer){
		distanceX = startingClickPoint.x - mouseX;
		distanceY = startingClickPoint.y - mouseY;

		distance = Math.sqrt(((startingClickPoint.x - mouseX)*(startingClickPoint.x - mouseX))
			+ ((startingClickPoint.y - mouseY)*(startingClickPoint.y - mouseY)) );

		cueForce = map(distance,0,500,0,180,true);
	}
}

function mouseReleased(){
	if(lineRenderer){
		cueBall.velocity.x = mcOffsetNormal.x * cueForce * -1 * forceAmplifier;
		cueBall.velocity.y = mcOffsetNormal.y * cueForce * -1 * forceAmplifier;
		cueForce = 0;
	}
}