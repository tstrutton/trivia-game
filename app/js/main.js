var Readable = require('stream').Readable  
var util = require('util')  
var five = require('johnny-five')

util.inherits(MyStream, Readable)  
function MyStream(opt) {  
  Readable.call(this, opt)
}
MyStream.prototype._read = function() {};  
// hook in our stream
process.__defineGetter__('stdin', function() {  
  if (process.__stdin) return process.__stdin
  process.__stdin = new MyStream()
  return process.__stdin
})

var board = new five.Board();
var value1 = document.querySelector('#value1');
var value2 = document.querySelector('#value2');
var btns = document.querySelectorAll('.btn');
var black = document.querySelector('#black');
var blue = document.querySelector('#blue');
var green = document.querySelector('#green');
var yellow = document.querySelector('#yellow');

for (var i = 0; i < btns.length; i++) {
	btns[i].innerHTML = "Not Pressed";
};

board.on("ready", function() {
	var button1 = new five.Button(2);
	var button2 = new five.Button(4);
	var button3 = new five.Button(7);
	var button4 = new five.Button(8);
	

	//button 1 / black
	button1.on("press", function(){
		black.innerHTML = "pressed";
		black.classList.add('pressed');
	});

	button1.on("up", function(){
		black.innerHTML = "Not Pressed";
		black.classList.remove('pressed');
	});
	 

	//button 2 / green 
	button2.on("press", function(){
		green.innerHTML = "pressed";
		green.classList.add('pressed');
	});
	button2.on("up", function(){
		green.innerHTML = "Not Pressed";
		green.classList.remove('pressed');
	});


	//button 3 / blue
	button3.on("press", function(){
		blue.innerHTML = "pressed";
		blue.classList.add('pressed');
	});
	button3.on("up", function(){
		blue.innerHTML = "Not Pressed";
		blue.classList.remove('pressed');
	});

	//button 4 / yellow
	button4.on("press", function(){
		yellow.innerHTML = "pressed";
		yellow.classList.add('pressed');
	});
	button4.on("up", function(){
		yellow.innerHTML = "Not Pressed";
		yellow.classList.remove('pressed');
	});


	var sensor = new five.Sensor("A0");
	var sensor2 = new five.Sensor("A1");


	//scale sensors data from 0-1023 to 0-100 and log change
	sensor.on("change", function(){
		var pressure1 = this.scaleTo(0,100);

		if(pressure1 != 0){
			value1.innerHTML = pressure1;
			value1.style.width = pressure1*5 + "px";
		}else{
			value1.innerHTML = "";
			value1.style.width = "0px";
		}

		
	});

	sensor2.on("change", function(){
		var pressure2 = this.scaleTo(0,100);

		if(pressure2 != 0){
			value2.innerHTML = pressure2;
			value2.style.width = pressure2*10 + "px";
			
		}else{
			value2.innerHTML = "";
			value2.style.width = "0px";
		}

		
	});

});