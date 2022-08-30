var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
ctx.lineWidth = 4;
ctx.strokeStyle = 'black';

ctx.fillStyle = 'red';
ctx.beginPath();
ctx.rect(30, 20, 100, 100);
ctx.fill();
ctx.stroke();

ctx.fillStyle = 'yellow';
ctx.beginPath();
ctx.arc(250, 80, 56, 0, 2 * Math.PI);
ctx.fill();
ctx.stroke();

ctx.fillStyle = 'white';
ctx.beginPath();
ctx.arc(80, 45, 10, 0, 2 * Math.PI);
ctx.fill();
ctx.stroke();
ctx.beginPath();
ctx.arc(110, 40, 10, 0, 2 * Math.PI);
ctx.fill();
ctx.stroke();
ctx.beginPath();
ctx.arc(230, 45, 10, 0, 2 * Math.PI);
ctx.fill();
ctx.stroke();
ctx.beginPath();
ctx.arc(260, 50, 10, 0, 2 * Math.PI);
ctx.fill();
ctx.stroke();

ctx.fillStyle = 'black';
ctx.beginPath();
ctx.arc(82, 47, 5, 0, 2 * Math.PI);
ctx.fill();
ctx.beginPath();
ctx.arc(112, 42, 5, 0, 2 * Math.PI);
ctx.fill();
ctx.beginPath();
ctx.arc(228, 47, 5, 0, 2 * Math.PI);
ctx.fill();
ctx.beginPath();
ctx.arc(258, 52, 5, 0, 2 * Math.PI);
ctx.fill();

ctx.beginPath();
ctx.moveTo(70, 110);
ctx.lineTo(70, 170);
ctx.moveTo(90, 110);
ctx.lineTo(90, 170);

ctx.moveTo(40, 70);
ctx.lineTo(5, 100);
ctx.moveTo(120, 70);
ctx.quadraticCurveTo(140, 80, 165, 60);

ctx.moveTo(85, 75);
ctx.quadraticCurveTo(95, 90, 110, 70)

ctx.moveTo(240, 120);
ctx.lineTo(240, 180);
ctx.moveTo(260, 120);
ctx.lineTo(260, 180);

ctx.moveTo(295, 80);
ctx.lineTo(330, 40);
ctx.moveTo(205, 80);
ctx.quadraticCurveTo(175, 90, 155, 60);

ctx.moveTo(230, 80);
ctx.quadraticCurveTo(240, 105, 260, 85);
ctx.stroke();