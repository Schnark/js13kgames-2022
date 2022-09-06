(function(){var w,u,s,q,r,o,t,y,z,A,x,p,n;w=function(){function f(e,d){this.isOpen=!1;this.socket=io({upgrade:!1,transports:["websocket"]});this.socket.on("start",function(c){c=JSON.parse(c);this.user=c.user;this.isOpen=!0;e("start",c.user,c.details)}.bind(this));this.socket.on("data",function(c){c=JSON.parse(c);e(c.type,c.user,c.details)});this.socket.on("end",function(c){this.isOpen=!1;e("end",c,{});this.socket.disconnect()}.bind(this));this.socket.on("disconnect",function(){this.isOpen&&e("end",
this.user,{});this.isOpen=!1}.bind(this));this.socket.on("connect",function(){this.socket.emit("start",d||"")}.bind(this))}f.isAvailable=function(){return typeof io!=="undefined"};f.prototype.switchUser=function(){};f.prototype.getUser=function(){return this.user};f.prototype.msg=function(e,d){this.user!==void 0&&this.socket.emit("data",JSON.stringify({type:e,user:this.user,details:d}))};f.prototype.close=function(){this.socket.disconnect(!0)};return f}();u=function(){function f(e,d){this.user=d||
0;this.callback=e;d===void 0&&setTimeout(function(){e("start",0,{seed:Math.floor(Math.random()*4294967296)})},0)}f.prototype.getUser=function(){return this.user};f.prototype.switchUser=function(e){if(this.user!==e)this.user=e,this.callback("switch-user",this.user,{})};f.prototype.msg=function(e,d){this.callback(e,this.user,d)};f.prototype.close=function(){this.callback("end",this.user,{})};return f}();s=function(){var f={solved:{},audio:2};try{f=JSON.parse(localStorage.getItem("schnark-js13k-2022")||
"x")}catch(e){}return{get:function(d){return f[d]},set:function(d,c){f[d]=c;try{localStorage.setItem("schnark-js13k-2022",JSON.stringify(f))}catch(a){}}}}();q=function(){function f(){j&&(clearTimeout(j),j=!1);a.style.display=""}var e=document.getElementById("modal"),d=document.getElementById("modal-text"),c=document.getElementById("modal-close"),a=document.getElementById("info"),b=document.getElementById("info-text"),l,j;c.addEventListener("click",function(){l();e.style.display="";l=!1});a.addEventListener("click",
function(){f()});return{modal:function(a,b){l&&l();d.textContent=a;l=b;e.style.display="block";c.focus()},info:function(l,c){l?(b.textContent=l,a.style.display="block",j&&clearTimeout(b),j=setTimeout(f,(c||3)*1E3)):f()}}}();r=function(){function f(){e&&e.msg("unlock",{data:"bonus"})}var e,d=!1,c,a,b;document.addEventListener("keydown",function(a){if(e&&d&&!a.altKey&&!a.ctrlKey&&!a.metaKey){switch(a.key&&a.key!=="Unidentified"?{Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown"}[a.key]||
a.key:{9:"Tab",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown"}[a.which]||String.fromCharCode(a.which).toLowerCase()){case "ArrowLeft":case "a":case "q":e.msg("move",{x:-1,y:0});break;case "ArrowUp":case "w":case "z":e.msg("move",{x:0,y:-1});break;case "ArrowRight":case "d":e.msg("move",{x:1,y:0});break;case "ArrowDown":case "s":e.msg("move",{x:0,y:1});break;case "1":e.switchUser(0);break;case "2":e.switchUser(1);break;case "Tab":e.switchUser(1-e.getUser());break;case "r":e.msg("restart");
break;case "m":document.getElementById("audio").click()}a.preventDefault()}});c=document.getElementById("canvas");c.addEventListener("touchstart",function(c){if(!(c.targetTouches.length>1))a=c.touches[0].clientX,b=c.touches[0].clientY,c.preventDefault()},{passive:!1});c.addEventListener("touchmove",function(a){a.preventDefault()},{passive:!1});c.addEventListener("touchend",function(c){var d,g,i,h;!(c.targetTouches.length>0)&&e&&(d=c.changedTouches[0].clientX-a,g=c.changedTouches[0].clientY-b,i=Math.abs(d),
h=Math.abs(g),Math.max(i,h)>10&&(i>h?e.msg("move",{x:d<0?-1:1,y:0}):e.msg("move",{x:0,y:g<0?-1:1})),c.preventDefault())});document.getElementById("abort").addEventListener("click",function(){e&&e.msg("abort")});document.getElementById("switch").addEventListener("click",function(){e&&e.switchUser(1-e.getUser())});document.getElementById("restart").addEventListener("click",function(){e&&e.msg("restart")});document.getElementById("levels").addEventListener("click",function(a){e&&!a.target.disabled&&
a.target.dataset.level&&e.msg("select",{level:Number(a.target.dataset.level)})});document.monetization&&document.monetization.addEventListener("monetizationstart",f);return{start:function(a){e=a},stop:function(){e=!1},startKeys:function(){d=!0},stopKeys:function(){d=!1}}}();o=function(){function f(a,b){var c,d,b=b||"sine";for(c=0;c<h.length;c++)if(h[c].osc.type===b&&h[c].t<a)return c;c=i.createOscillator();d=i.createGain();c.type=b;d.gain.value=0;c.connect(d);d.connect(i.destination);c.start();h.push({osc:c,
gain:d});return h.length-1}function e(){var a,b;if(j&&l===2){i||(i=new g);for(a=0;a<k.length;a++){if(k[a].time===-1)b||(b=i.currentTime+0.1),k[a].time=b;for(var c=k[a],d=void 0;c.time-i.currentTime<1;){d=c.notes[c.pos];if(d[0][0]==="z")c.time+=d[1]*c.baseDur;else{for(var e=c,n=d[0],o=c.time,q=c.key,t=c.volume,p=void 0,d=o+d[1]*c.baseDur,p=0;p<n.length;p++){var r=o,s=d,w=q[n[p]],u=t,v=f(r);h[v].osc.frequency.setValueAtTime(w,r);h[v].gain.gain.setValueAtTime(0.0010,r);h[v].gain.gain.exponentialRampToValueAtTime(u,
r+0.05);h[v].gain.gain.linearRampToValueAtTime(u,s-0.05);h[v].gain.gain.exponentialRampToValueAtTime(0.0010,s);h[v].gain.gain.setValueAtTime(0,s+0.01);h[v].t=s+0.01}e.time=d}c.pos=(c.pos+1)%c.notes.length}}}}function d(){var a,b;j=!1;if(i){b=i.currentTime+0.1;for(a=0;a<h.length;a++)h[a].osc.frequency.cancelScheduledValues(b),h[a].gain.gain.cancelScheduledValues(b),h[a].gain.gain.setValueAtTime(0,b),h[a].t=b;for(a=0;a<k.length;a++)k[a].time=-1,k[a].pos=0}}function c(a){return a.split(" ").map(function(a){var b,
a=a.split(/([\^_]?[a-zA-Z][',]*)/);b=Number(a.pop()||1);return[a.filter(function(a){return a}),b]})}function a(a,b,c,d,l,e){var j;i||(i=new g);j=i.currentTime+0.01;c=j+c*d/1E3;e=f(j,["square","sawtooth","triangle","sine"][e||0]);h[e].osc.frequency.setValueAtTime(a,j);h[e].osc.frequency.linearRampToValueAtTime(a+b*d,c);h[e].gain.gain.setValueAtTime(l,j);h[e].gain.gain.linearRampToValueAtTime(0,c);h[e].t=c}function b(b){if(l!==0)switch(b){case "move":a(100,-10,15,15,0.7,2);break;case "open":a(220,15,
60,15,0.3,2);break;case "close":a(440,-15,60,15,0.3,2);break;case "teleport":a(150,30,2,20,0.5,2);setTimeout(function(){a(150,30,2,20,0.5,2)},150);break;case "switch":a(750,-30,5,20,0.25);setTimeout(function(){a(150,30,5,20,0.25)},100);break;case "win":a(510,0,15,20,0.1);setTimeout(function(){a(2600,1,10,50,0.2)},80);break;case "die":case "restart":a(100,-10,10,25,0.5),a(125,-5,20,45,0.1,1),a(40,2,20,20,1,2),a(200,-4,10,100,0.25,2)}}var l=2,j=!1,g,i,h=[],k;g=window.AudioContext||window.webkitAudioContext;
(function(){var a,b;a={E:Math.pow(2,-5/12)*440,G:Math.pow(2,-1/12)*440,A:440,B:Math.pow(2,2/12)*440,c:Math.pow(2,0.25)*440,d:Math.pow(2,5/12)*440,e:Math.pow(2,7/12)*440};b={"E,":Math.pow(2,-17/12)*220,"^F,":Math.pow(2,-1.25)*220,"G,":Math.pow(2,-14/12)*220,"^G,":Math.pow(2,-13/12)*220,"A,":110,"B,":Math.pow(2,-10/12)*220,C:Math.pow(2,-0.75)*220,D:Math.pow(2,-7/12)*220,E:Math.pow(2,-5/12)*220,G:Math.pow(2,-2/12)*220,"^G":Math.pow(2,-1/12)*220,A:220,B:Math.pow(2,2/12)*220,c:Math.pow(2,0.25)*220,d:Math.pow(2,
5/12)*220,e:Math.pow(2,7/12)*220,f:Math.pow(2,8/12)*220};a=[["A A A A A c B A G G G G G B A G A A A A A c B A G e E G A2 z2 c c c c c e d c B B B B B d c B A A A A A c B A G B e0.5 d0.5 c0.5 B0.5 A2 z2",a,0.1],["A, Ace E Ace A, Ace E Ace E ^Gde B, ^Gde E ^Gde B, ^Gde A, Ace E Ace A, Ace E Ace E ^Gde B, ^Gde A, Ace G,GBf2 C Gce G, Gce C Gce G, Gce G, GBd D GBd G, E, ^F, ^G, A, Ace E Ace A, Ace E Ace E ^Gde B, ^Gde A, Ace A,Ace2",b,0.15]];k=[];for(b=0;b<a.length;b++){var d=c(a[b][0]);k.push({time:-1,
pos:0,notes:d,key:a[b][1],volume:a[b][2],baseDur:0.5})}})();return{setMode:function(a){a!==l&&(l===2&&j&&(d(),j=!0),l=a)},start:function(){j=!0},stop:d,tick:g?e:function(){},sound:g?b:function(){}}}();t=function(){function f(b){e&&(d||(d=b),o.tick(),e(c,b-d),d=b,a(f))}var e,d,c,a;a=window.requestAnimationFrame||window.mozRequestAnimationFrame;(function(){function a(){var b=document.documentElement,b=Math.min(1,b.clientWidth/d.width,(b.clientHeight-(e.clientHeight||42))/d.height);b>0.75?b=0.75:b>2/
3?b=2/3:b>0.5?b=0.5:b>1/3?b=1/3:b>0.25&&(b=0.25);b=Math.floor(d.width*b)+"px";d.style.width=b;e.style.width=b}var d=document.getElementById("canvas"),e=document.getElementById("header");d.width=960;d.height=1440;c=d.getContext("2d",{alpha:!1});window.addEventListener("resize",a);a()})();return{start:function(b){o.start();d=0;e=b;a(f)},stop:function(){o.stop();e&&e(c);e=!1},patterns:function(){var a=document.createElement("canvas"),d=a.getContext("2d"),e,f,i,h,k,m,B,n;a.width=32;a.height=32;for(f=
0;f<32;f+=3)i=Math.floor(Math.random()*256),d.strokeStyle="rgba("+i+","+i+","+i+",0.3)",h=5*Math.random(),k=6+4*Math.random(),d.beginPath(),d.moveTo(f,0),d.bezierCurveTo(f+h,k,f-h,32-k,f,32),d.stroke();B=c.createPattern(a,"repeat");e=d.createImageData(32,32);for(f=0;f<4096;f+=4)i=Math.floor(Math.random()*256),e.data[f]=i,e.data[f+1]=i,e.data[f+2]=i,e.data[f+3]=50;d.putImageData(e,0,0);n=c.createPattern(a,"repeat");m=32;e.data[2]=0;e.data[3]=128+Math.floor(Math.random()*32);e.data[126]=0;e.data[127]=
128+Math.floor(Math.random()*32);e.data[3970]=0;e.data[3971]=128+Math.floor(Math.random()*32);e.data[4094]=0;for(e.data[4095]=128+Math.floor(Math.random()*32);m>1;){m/=2;for(h=m;h<32-m;h+=m)for(k=0;k<32;k+=2*m)i=e.data[(k*32+h-m)*4]+e.data[(k*32+h+m)*4],i=Math.floor(i/2+(Math.random()-0.5)*8*m),f=(k*32+h)*4,e.data[f]=i,e.data[f+1]=i,e.data[f+2]=0,e.data[f+3]=128+Math.floor(Math.random()*32);for(k=m;k<32-m;k+=m)for(h=0;h<32;h+=2*m)i=e.data[((k-m)*32+h)*4]+e.data[((k+m)*32+h)*4],i=Math.floor(i/2+(Math.random()-
0.5)*8*m),f=(k*32+h)*4,e.data[f]=i,e.data[f+1]=i,e.data[f+2]=0,e.data[f+3]=128+Math.floor(Math.random()*32)}d.putImageData(e,0,0);a=c.createPattern(a,"repeat");d=c.createRadialGradient(48,48,0,48,48,48);d.addColorStop(0,"#808");d.addColorStop(1,"#d0d");return{box:B,grass:n,fire:a,teleport:d}}()}}();y=function(){function f(a,b){this.type=a;b===0||b===1?this.state=b:(this.data=b,this.state=0);this.drawState=this.state;this.animationTime=0}var e={fire:5E3,teleport:15E3},d={},c=1/900;d.grass=function(a){a.fillStyle=
"#060";a.fillRect(0,0,96,96);a.fillStyle=t.patterns.grass;a.fillRect(0,0,96,96)};d.block=function(a){a.fillStyle="#310";a.fillRect(0,0,96,96);a.lineWidth=2.5;a.strokeStyle="#dda";a.beginPath();a.moveTo(0,0);a.lineTo(96,0);a.moveTo(0,24);a.lineTo(96,24);a.moveTo(0,48);a.lineTo(96,48);a.moveTo(0,72);a.lineTo(96,72);a.moveTo(0,0);a.lineTo(0,24);a.moveTo(48,0);a.lineTo(48,24);a.moveTo(0,48);a.lineTo(0,72);a.moveTo(48,48);a.lineTo(48,72);a.moveTo(24,24);a.lineTo(24,48);a.moveTo(72,24);a.lineTo(72,48);
a.moveTo(24,72);a.lineTo(24,96);a.moveTo(72,72);a.lineTo(72,96);a.stroke()};d.fire=function(a,b){a.fillStyle="hsl(0,100%,"+(50+10*Math.sin(b*Math.PI/50))+"%)";a.fillRect(0,0,96,96);a.fillStyle=t.patterns.fire;a.fillRect(0,0,96,96)};d.doc=function(a){d.grass(a);a.fillStyle="#fff";a.strokeStyle="#000";a.lineWidth=2;a.beginPath();a.moveTo(64,40);a.lineTo(48,24);a.lineTo(32,24);a.lineTo(32,72);a.lineTo(64,72);a.lineTo(64,40);a.fill();a.lineTo(48,40);a.lineTo(48,24);a.stroke()};d.hdoor=function(a,b,c){b=
48-c*46;d.grass(a);a.fillStyle="#aaa";a.beginPath();a.rect(0,0,b,12);a.rect(0,84,b,12);a.rect(96-b,0,b,12);a.rect(96-b,84,b,12);a.fill();a.fillStyle="#ccc";a.beginPath();a.rect(0,0,b,3);a.rect(0,84,b,3);a.rect(96-b,0,b,3);a.rect(96-b,84,b,3);a.fill();a.fillStyle="#888";a.beginPath();a.rect(0,6,b,3);a.rect(0,90,b,3);a.rect(96-b,6,b,3);a.rect(96-b,90,b,3);a.fill()};d.vdoor=function(a,b,c){b=48-c*46;d.grass(a);a.fillStyle="#aaa";a.beginPath();a.rect(0,0,12,b);a.rect(84,0,12,b);a.rect(0,96-b,12,b);a.rect(84,
96-b,12,b);a.fill();a.fillStyle="#ccc";a.beginPath();a.rect(0,0,3,b);a.rect(84,0,3,b);a.rect(0,96-b,3,b);a.rect(84,96-b,3,b);a.fill();a.fillStyle="#888";a.beginPath();a.rect(6,0,3,b);a.rect(90,0,3,b);a.rect(6,96-b,3,b);a.rect(90,96-b,3,b);a.fill()};d.trigger=function(a){d.grass(a);a.fillStyle="#aaa";a.fillRect(24,24,48,48);a.fillStyle="#ccc";a.beginPath();a.rect(24,24,48,6);a.rect(24,24,6,48);a.fill();a.fillStyle="#888";a.beginPath();a.rect(30,66,42,6);a.rect(66,24,6,48);a.fill()};d.teleport=function(a,
b){d.grass(a);a.fillStyle=t.patterns.teleport;a.beginPath();a.arc(48,48,24+8*Math.sin(b*Math.PI/50),0,2*Math.PI);a.fill()};f.prototype.canEnter=function(){return this.type==="vdoor"||this.type==="hdoor"?this.state===1:this.type!=="block"};f.prototype.getDeath=function(){return this.type==="fire"?1:(this.type==="vdoor"||this.type==="hdoor")&&this.state===0?2:this.type==="teleport"?3:0};f.prototype.draw=function(a,b,f,j){var g=e[this.type]||1;j===void 0?(this.animationTime=0,this.drawState=this.state):
(this.animationTime=(this.animationTime+j)%g,j*c>=Math.abs(this.state-this.drawState)?this.drawState=this.state:this.drawState+=j*c*(this.state>this.drawState?1:-1));a.save();a.translate(b*96,f*96);d[this.type](a,100*this.animationTime/g,this.drawState);a.restore()};return f}();z=function(){function f(a,b,c,d,e){a.fillStyle="#fff";a.strokeStyle="#000";a.beginPath();a.arc(b,c,d,0,2*Math.PI);a.fill();a.stroke();a.fillStyle="#000";a.beginPath();a.arc(b,c-d/3+e,d/3,0,2*Math.PI);a.fill()}function e(a,
b,c){this.type=a;this.drawX=this.x=b;this.drawY=this.y=c;this.animationTime=0}var d={yellow:1E4,blue:12E3,death:5E4},c={yellow:function(a,b){var c=0;a.translate(48,48);b>50&&b<55&&a.rotate(0.2*Math.sin((b-50)*Math.PI/2.5));a.lineWidth=2;a.strokeStyle="#cc0";a.fillStyle="#ff0";a.beginPath();a.rect(-38,-38,76,76);a.fill();a.stroke();a.lineWidth=1.5;b>70&&b<75&&(c=2-Math.max(0,Math.abs(b-72.5)-0.5));f(a,-19.2,-9.6,9.6,c);f(a,19.2,-9.6,9.6,c)},blue:function(a,b){var c=0;a.translate(48,48);b>60&&b<70&&
a.rotate(Math.sin((b-60)*Math.PI/5));a.lineWidth=2;a.strokeStyle="#36d";a.fillStyle="#58f";a.beginPath();a.arc(0,0,38.4,0,2*Math.PI);a.fill();a.stroke();a.lineWidth=1.5;b>20&&b<25&&(c=2-Math.max(0,Math.abs(b-22.5)-0.5));f(a,-19.2,-9.6,9.6,c);f(a,19.2,-9.6,9.6,c)},death:function(a,b){var c;a.fillStyle="#ffe";a.strokeStyle="#aaa";a.translate(48,72);a.save();a.rotate(Math.sin(b*Math.PI/500)*Math.sin(b*Math.PI/5)/2);a.beginPath();a.moveTo(0,-8);a.lineTo(32,-8);a.bezierCurveTo(32,-8,40,-24,40,0);a.bezierCurveTo(40,
24,32,8,32,8);a.lineTo(-32,8);a.bezierCurveTo(-32,8,-40,24,-40,0);a.bezierCurveTo(-40,-24,-32,-8,-32,-8);a.closePath();a.fill();a.stroke();a.restore();a.beginPath();a.moveTo(0,-67);a.bezierCurveTo(32,-67,40,-48,40,-32);a.bezierCurveTo(40,-10,4,19,0,19);a.bezierCurveTo(-4,19,-40,-10,-40,-32);a.bezierCurveTo(-40,-48,-32,-67,0,-67);a.fill();a.stroke();c=0;b>70&&b<75&&(c=Math.max(0,Math.abs(b-72.5)-0.5)*60+240);a.fillStyle="hsl("+c+", 100%, 30%)";a.beginPath();a.arc(-19.2,-32,12,0,2*Math.PI);a.arc(19.2,
-32,12,0,2*Math.PI);a.fill()},box:function(a){a.fillStyle="#732";a.fillRect(0,0,96,96);a.fillStyle="#954";a.fillRect(0,0,96,6);a.fillRect(0,0,6,96);a.fillStyle="#510";a.fillRect(90,0,6,96);a.fillRect(0,90,96,6);a.fillStyle=t.patterns.box;a.fillRect(0,0,96,96)}};e.prototype.setRoom=function(a){if(this.room!==a)this.room&&this.room.movables.splice(this.room.movables.indexOf(this),1),this.room=a};e.prototype.getTile=function(){return this.room.getTile(this.x,this.y)};e.prototype.canMoveTo=function(a,
b,c,d){return!this.room.canEnter(a,b)?!1:!this.room.isOccupied(a,b)?!0:this.room.canEnter(a+c,b+d)&&!this.room.isOccupied(a+c,b+d)};e.prototype.moveTo=function(a,b,c){this.drawX=c?a:this.x;this.drawY=c?b:this.y;this.x=a;this.y=b};e.prototype.draw=function(a,b){var e=d[this.type]||1,f,g,i;b===void 0?(this.animationTime=0,this.drawX=this.x,this.drawY=this.y):(this.animationTime=(this.animationTime+b)%e,f=this.x-this.drawX,g=this.y-this.drawY,i=Math.sqrt(f*f+g*g),b*0.0050>=i?(this.drawX=this.x,this.drawY=
this.y):(this.drawX+=f*b*0.0050/i,this.drawY+=g*b*0.0050/i));a.save();a.translate(this.drawX*96,this.drawY*96);c[this.type](a,100*this.animationTime/e);a.restore()};return e}();A=function(){function f(){}var e={"#":"block","~":"fire","!":"doc","-":"hdoor","|":"vdoor",".":"trigger","*":"trigger","?":"teleport"},d={0:"yellow",1:"blue",2:"death",3:"death",$:"box","*":"box"};f.prototype.init=function(c){var a=0,b,f,j,g,i,h,k={};this.tiles=[];this.movables=[];for(j=0;j<15;j++){g=[];for(f=0;f<10;f++){b=
c.map.charAt(a);if(i=d[b])h=new z(i,f,j),this.addMovable(h),k[i]=h;i=c[b]?c[b].shift():void 0;g.push(new y(e[b]||"grass",i));a++}this.tiles.push(g)}return k};f.prototype.addMovable=function(c){this.movables.indexOf(c)===-1&&(this.movables.push(c),c.setRoom(this))};f.prototype.getTile=function(c,a){return this.tiles[a][c]};f.prototype.canEnter=function(c,a){return a<0||a>=this.tiles.length?!1:c<0||c>=this.tiles[a].length?!1:this.tiles[a][c].canEnter()};f.prototype.isOccupied=function(c,a){var b;for(b=
0;b<this.movables.length;b++)if(this.movables[b].x===c&&this.movables[b].y===a)return this.movables[b];return!1};f.prototype.draw=function(c,a){var b,d;for(d=0;d<this.tiles.length;d++)for(b=0;b<this.tiles[d].length;b++)this.tiles[d][b].draw(c,b,d,a);for(b=0;b<this.movables.length;b++)this.movables[b].draw(c,a)};return f}();x=function(){function f(d){this.data=d}function e(d,c){return d.room===c.room&&Math.abs(d.x-c.x)+Math.abs(d.y-c.y)<=1}f.prototype.init=function(){var d,c=JSON.parse(JSON.stringify(this.data));
this.inverseMove=this.data.map.indexOf("3")>-1;this.rooms=[];do d=new A,this.rooms.push(d),d=d.init(c),c.map=c.map.slice(150),this.yellow=d.yellow||this.yellow,this.blue=d.blue||this.blue,this.death=d.death||this.death;while(c.map.length>0)};f.prototype.start=function(d){this.init();r.startKeys();t.start(this.draw.bind(this));this.state=0;this.user=d;this.time=Date.now()};f.prototype.stop=function(){r.stopKeys();t.stop();return Math.max(1,Math.round((Date.now()-this.time)/1E3))};f.prototype.setUser=
function(d){this.user=d};f.prototype.draw=function(d,c){[this.yellow,this.blue][this.user].room.draw(d,c)};f.prototype.getState=function(){return this.state};f.prototype.movePlayer=function(d,c,a){var b,e,f;b=d.x+c;e=d.y+a;if(d.canMoveTo(b,e,c,a))return(f=d.room.isOccupied(b,e))&&this.movePlayer(f,c,a),this.enterLeave(d,!1),d.moveTo(b,e),this.enterLeave(d,!0),!0};f.prototype.move=function(d,c,a){if(!this.state&&((d=this.movePlayer(d===0?this.yellow:this.blue,c,a))&&o.sound("move"),this.state=this.checkEnd(),
d&&this.state<=1))this.movePlayer(this.death,this.inverseMove?-c:c,this.inverseMove?-a:a),this.state=this.checkEnd()};f.prototype.enterLeave=function(d,c){var a=d.getTile();if(a.type==="doc")d===[this.yellow,this.blue][this.user]&&q.info(c?a.data:"",5);else if(a.type==="trigger")a=a.data,this.rooms[a[2]].getTile(a[0],a[1]).state=c?1:0,o.sound(c?"open":"close");else if(a.type==="teleport"&&c)a=a.data,this.rooms[a[2]].isOccupied(a[0],a[1])||(this.rooms[a[2]].addMovable(d),d.moveTo(a[0],a[1],!0),o.sound("teleport"))};
f.prototype.checkDeath=function(d){return e(d,this.death)?1:(d=d.getTile().getDeath())?d+1:0};f.prototype.checkEnd=function(){var d,c;(d=this.checkDeath(this.yellow))&&(d*=2);return(c=this.checkDeath(this.blue))?2*c+1:d&&c?[d,c][this.user]:d?d:c?c:e(this.yellow,this.blue)?1:0};return f}();p=[{title:"Tutorial levels",desc:"Play these tutorial levels first. They will introduce you to the different elements of the game.",lock:0,levels:[{map:"   #       0!          #      ####                  #####     #   #     # 2 #     #   #     ## ##                   ####      #          !1       #   ",
"!":["Welcome! Try to meet Blue, but avoid Death.","Welcome! Try to meet Yellow, but avoid Death."]},{map:"0  !          ~            ~               ~      ~        ~              3                ~      ~               ~      ~           ~            !  1","!":["This time Death will move the other way. And don\u2019t fall into the fire pits!","This time Death will move the other way. And don\u2019t fall into the fire pits!"]},{map:"0 !             .             #####-####                                  2                 .                 ####-#####                           ! 1",
"!":["The triggers will open and close the doors.","The triggers will open and close the doors."],".":[[4,11,0],[5,3,0]]},{map:"0 !           ?               ##########                                  2                                   ##########              ?            ! 1","!":["The teleporters will take you somewhere else. Let\u2019s hope the place is free and safe!","The teleporters will take you somewhere else. Let\u2019s hope the place is free and safe!"],"?":[[4,4,0],[5,10,0]]},{map:"0!$         $       $$$                             $$$$$     $   $     $ 2 $     $   $     $$$$$                              $$$       $ !       $ 1",
"!":["You can push boxes to a free place, but only one at a time.","You can push boxes to a free place, but only one at a time."]},{map:"0         !       #-$      ## .      #         # #       #  ######### 2     . $ #########        #         # #?      #  $      ## !       #-1         ","!":["Boxes can press triggers, too.","Boxes can go through teleporters, too."],".":[[9,1,0],[9,13,0]],"?":[[7,7,0]]},{map:"0 !                                                                                                                                                  ??                                                                                                                                                  ! 1                                                                          2                                                                           ",
"!":["Where is Blue? Perhaps you should use the teleporter.","Where is Yellow? Perhaps you should use the teleporter."],"?":[[0,0,2],[9,14,2]]}]},{title:"More levels",desc:"Solve at least six of the tutorial levels to unlock.",lock:6,levels:[{map:"0                      #   ##    #  #      #  ###  # #    #   #   ##      2      ~ ~~  ~ ~ ~   ~ ~ ~ ~ ~~  ~~  ~   ~ ~ ~ ~ ~~  ~ ~                   1"},{map:"0         #### #### 1# #  # #  # ## # #  #  # # #  ##   #     ##### ##~  # 3  # ~ ## #### ~  #      ~ ### ####  #     #  #### #    #    ####   ~~      "},
{map:"0         ~~~~~~~~~            ~~~~~~~~~          ~~~~~~~~~         ~  ~~~3~~~~  ~         ~~~~~~~~~          ~~~~~~~~~            ~~~~~~~~~         1"},{map:"0         #########            #########          ######### ####?####     2      ###?##### #########          #########            #########         1","?":[[0,7,0],[9,7,0]]},{map:"         0 ######### #########          ######### #### #### #### ####    $2$     ### ##### ### ##### #########          ######### ######### 1         "},{map:". . .# | # $$$ #-#-#.$0$.#-#-# $$$ | #-#. . .###-######### #              2               # #########-###. . .#-# | $$$ #-#-#.$1$.#-#-# $$$ # | #. . .",
".":[[5,3,0],[6,2,0],[6,1,0],[7,0,0],[8,1,0],[8,2,0],[8,3,0],[8,4,0],[1,10,0],[1,11,0],[1,12,0],[1,13,0],[2,14,0],[3,13,0],[3,12,0],[4,11,0]]},{map:"    0         !     ??????????##########          ??????????##########          ??????????##########          ??????????##########          ????????????????????          ##########??????????          ##########??????????          ##########??????????          ##########??????????    !         1                                                                               2                                                                           ",
"!":["Do you know the value of \u03c0? If not, then look it up before heading for the 3rd teleporter.","Do you know the value of Euler\u2019s number e? If not, then look it up before heading for the 2nd teleporter."],"?":[[4,0,0],[4,0,0],[4,4,0],[4,0,0],[4,0,0],[4,0,0],[4,0,0],[4,0,0],[4,0,0],[4,0,0],[4,7,0],[4,0,0],[4,0,0],[4,0,0],[4,0,0],[4,0,0],[4,0,0],[4,0,0],[4,0,0],[4,0,0],[4,0,0],[4,0,0],[4,0,0],[4,10,0],[4,0,0],[4,0,0],[4,0,0],[4,0,0],[4,0,0],[4,0,0],[4,13,0],[4,0,0],[4,0,0],[4,0,0],[4,0,
0],[4,0,0],[4,0,0],[4,0,0],[4,0,0],[4,0,0],[4,0,0],[4,0,0],[4,0,0],[4,0,0],[4,0,2],[4,0,0],[4,0,0],[4,0,0],[4,0,0],[4,0,0],[4,14,1],[4,14,2],[4,14,1],[4,14,1],[4,14,1],[4,14,1],[4,14,1],[4,14,1],[4,14,1],[4,14,1],[4,14,1],[4,14,1],[4,14,1],[4,14,1],[4,14,1],[4,14,1],[4,14,1],[4,1,1],[4,14,1],[4,14,1],[4,4,1],[4,14,1],[4,14,1],[4,14,1],[4,14,1],[4,14,1],[4,14,1],[4,14,1],[4,14,1],[4,14,1],[4,14,1],[4,14,1],[4,14,1],[4,14,1],[4,14,1],[4,14,1],[4,7,1],[4,14,1],[4,14,1],[4,14,1],[4,14,1],[4,10,1],[4,
14,1],[4,14,1],[4,14,1],[4,14,1],[4,14,1],[4,14,1],[4,14,1],[4,14,1]]}]},{title:"Sokoban levels",desc:"Solve ten levels to unlock these levels inspired by some Microban levels for Sokoban by David W Skinner.",lock:10,levels:[{map:"####~~~~~~# .#~~~~~~#  #####~~#*0  | |  #  $ ###  #  ###    ####          2           ####      #. #  #####  #  | |  1*#~~### $  #~~~~###  #~~~~~~####",".":[[7,3,0],[2,11,0]],"*":[[5,3,0],[4,11,0]],"|":[1,0,0,1]},{map:"###########        ## #0 ###-## $* #~#-## .* #~#-##    #~# ######### #    3                  ####    ###  ####-#     $ #-# #  #$ #   . .#1 ###########",
".":[[8,2,0],[0,11,0],[0,12,0]],"*":[[8,3,0],[8,4,0]],"-":[0,1,1,0,0]},{map:"###########        ## .**$0#-##      #-######  #-#    #### #              2     # #########-##     ##-## .$. ##-## $1$ ##-#  .$. ##        ###########",".":[[8,2,0],[1,9,0],[1,10,0],[1,11,0],[1,12,0]],"*":[[8,3,0],[8,4,0]],"-":[0,1,1,0,0,0,0]},{map:"##### ####    ###    $$     #2 $ #...      ###########           0              # ########  ~~      #-##-##-##     ~~   ####### ##    1               ",".":[[1,10,0],[4,10,0],
[7,10,0]]},{map:"#####     #.  ##    #0$$ ##   ##   ||    ##  ##     ##.#       ##          2####-#   #.  #-#   #.# #-#####.# # 1 $ $ $ # # # # ###       #~~########~~",".":[[5,3,0],[6,3,0],[0,8,0],[0,9,0],[0,10,0]]},{map:"0                                          ######    #    #    # ##3##-### # $ #-# ..# $ # #       # #  ###### ####                                  1",".":[[0,7,0],[0,8,0]]}]},{title:"Bonus levels",desc:"These bonus levels are exclusively for Coil subscribers.",lock:"bonus",levels:[{map:"0                                                                     ~~~~2~~~~~                                                                     1"},
{map:"0 ??  ??    ??  ??  ??  ??  ????  ??  ??  ??  ??    ??  ??  ??  ??  ??~~~~2~~~~~??  ??  ??  ??  ??    ??  ??  ??  ??  ????  ??  ??  ??  ??    ??  ?? 1??  ??  ????  ??  ??  ??  ??    ??  ??  ??  ??  ????  ??  ??  ??  ??  ~~~~ ~~~~~  ??  ??  ??  ??  ????  ??  ??  ??  ??    ??  ??  ??  ??  ????  ??  ??","?":[[2,0,1],[3,0,1],[6,0,1],[7,0,1],[2,1,1],[3,1,1],[6,1,1],[7,1,1],[0,2,1],[1,2,1],[4,2,1],[5,2,1],[8,2,1],[9,2,1],[0,3,1],[1,3,1],[4,3,1],[5,3,1],[8,3,1],[9,3,1],[2,4,1],[3,4,1],[6,4,1],[7,4,
1],[2,5,1],[3,5,1],[6,5,1],[7,5,1],[0,6,1],[1,6,1],[4,6,1],[5,6,1],[8,6,1],[9,6,1],[0,8,1],[1,8,1],[4,8,1],[5,8,1],[8,8,1],[9,8,1],[2,9,1],[3,9,1],[6,9,1],[7,9,1],[2,10,1],[3,10,1],[6,10,1],[7,10,1],[0,11,1],[1,11,1],[4,11,1],[5,11,1],[8,11,1],[9,11,1],[0,12,1],[1,12,1],[4,12,1],[5,12,1],[8,12,1],[9,12,1],[2,13,1],[3,13,1],[6,13,1],[7,13,1],[2,14,1],[3,14,1],[6,14,1],[7,14,1],[0,0,0],[1,0,0],[4,0,0],[5,0,0],[8,0,0],[9,0,0],[0,1,0],[1,1,0],[4,1,0],[5,1,0],[8,1,0],[9,1,0],[2,2,0],[3,2,0],[6,2,0],[7,
2,0],[2,3,0],[3,3,0],[6,3,0],[7,3,0],[0,4,0],[1,4,0],[4,4,0],[5,4,0],[8,4,0],[9,4,0],[0,5,0],[1,5,0],[4,5,0],[5,5,0],[8,5,0],[9,5,0],[2,6,0],[3,6,0],[6,6,0],[7,6,0],[2,8,0],[3,8,0],[6,8,0],[7,8,0],[0,9,0],[1,9,0],[4,9,0],[5,9,0],[8,9,0],[9,9,0],[0,10,0],[1,10,0],[4,10,0],[5,10,0],[8,10,0],[9,10,0],[2,11,0],[3,11,0],[6,11,0],[7,11,0],[2,12,0],[3,12,0],[6,12,0],[7,12,0],[0,13,0],[1,13,0],[4,13,0],[5,13,0],[8,13,0],[9,13,0],[0,14,0],[1,14,0],[4,14,0],[5,14,0],[8,14,0],[9,14,0]]},{map:"    0      # # # # # # # # # # # # # # #!#!#!#!#!#?#?#?#?#?########### ~  2   ~ ###########?#?#?#?#?#!#!#!#!#!# # # # # # # # # # # # # # #      1    ",
"!":"NO! Do not go here!,Yes! This is the right teleporter.,NO! Do not go here!,NO! Do not go here!,NO! Do not go here!,NO! Do not go here!,Yes! This is the right teleporter.,NO! Do not go here!,NO! Do not go here!,NO! Do not go here!".split(","),"?":[[0,7,0],[2,7,0],[0,7,0],[0,7,0],[0,7,0],[9,7,0],[3,7,0],[9,7,0],[9,7,0],[9,7,0]]},{map:"######~~~~     #~~~~ .$. #~~~~ $.$ ##### .$. # ..1 $.$ # $$   0  ## ## ###### #~-#2 ||  #~-# #### #~-# #    ##-# # #   #-# #   # #-# ###   #   ~~#####",".":[[0,8,
0],[0,9,0],[0,10,0],[0,11,0],[0,12,0],[4,8,0],[5,8,0],[0,13,0]]}]}];n=function(){function f(){d.hidden=!1;c.hidden=!0}function e(a){var b;if(a==="bonus"){if(!j){for(b=0;b<g.length;b++)if(g[b].lock==="bonus")document.querySelector('[data-level="'+b+'"]').disabled=!1;j=!0}}else if(a>l){for(b=0;b<g.length;b++)if(g[b].lock>l&&g[b].lock<=a)document.querySelector('[data-level="'+b+'"]').disabled=!1;l=a}}var d=document.getElementById("levels"),c=document.getElementById("game"),a,b,l,j,g;return{init:function(){l=
-1;j=!1;var a=d,b;b=[];var c,m,n,o;g=[];for(c=0;c<p.length;c++){b.push("<h2>"+p[c].title+"</h2>");b.push("<p>"+p[c].desc+"</p>");b.push("<p>");for(m=0;m<p[c].levels.length;m++)n=p[c].levels[m],o=g.length+1+'<br><span class="result">&nbsp;</span>',b.push('<button data-level="'+g.length+'" disabled>'+o+"</button> "),g.push({lock:p[c].lock,def:n});b.push("</p>")}b=b.join("");a.innerHTML=b;e(0);f()},end:function(){d.hidden=!0},getCurrentLevel:function(){return a},getCurrentLevelId:function(){return b},
unlock:e,markSolved:function(a,b){document.querySelector('[data-level="'+a+'"]').className="solved";document.querySelector('[data-level="'+a+'"] .result').textContent=Math.floor(b/60)+":"+(b%60<10?"0"+b%60:b%60)},runNextLevel:function(c){var d;d=b+1;g[d]?(d=g[d].lock,d=d==="bonus"?j:d<=l):d=!1;b=d?b+1:-1;b===-1?(a=!1,f()):(a=new x(g[b].def),a.start(c))},runLevel:function(e,f){b=e;a=new x(g[b].def);a.start(f);d.hidden=!0;c.hidden=!1},abortLevel:function(){a.stop();b=-1;a=!1;f()}}}();(function(){function f(){return location.search===
"?monetization-cheater"||document.monetization&&document.monetization.state==="started"}function e(){h=(h+2)%3;s.set("audio",h);o.setMode(h);g.className="right a"+h}function d(b,e,h){var g=n.getCurrentLevel();switch(b){case "start":a.hidden=!0;l.hidden=!0;j.className=["yellow","blue"][e];r.start(c);n.init();Object.keys(i).forEach(function(a){n.markSolved(a,i[a])});c.msg("unlock",{data:Object.keys(i).length});f()&&c.msg("unlock",{data:"bonus"});break;case "end":r.stop();e===c.getUser()?(g&&n.abortLevel(),
n.end(),a.hidden=!1):(c=new u(d,c.getUser()),q.modal("The other user quit. You can continue to play alone.",function(){}),r.start(c));break;case "switch-user":o.sound("switch");j.className=["yellow","blue"][e];g&&g.setUser(e);break;case "move":if(g&&!g.getState()&&(g.move(e,h.x,h.y),b=g.getState())){g=g.stop();o.sound(b===1?"win":"die");e=k[b-2];if(b===1&&(b=n.getCurrentLevelId(),e="Level solved again!",!i[b]||i[b]>g))e=i[b]?"Level solved faster than before!":"Level solved!",i[b]=g,s.set("solved",
i),n.markSolved(b,g),c.msg("unlock",{data:Object.keys(i).length});q.info("");q.modal(e,function(){c.msg("continue")})}break;case "restart":g&&!g.getState()&&(o.sound("restart"),e!==c.getUser()&&q.info("Level restarted by other user"),g.stop(),g.start(c.getUser()));break;case "continue":g&&g.getState()&&(g.getState()>1?g.start(c.getUser()):n.runNextLevel(c.getUser()));break;case "select":g||(e!==c.getUser()&&q.info("Level selected by other user"),n.runLevel(h.level,c.getUser()));break;case "abort":g&&
!g.getState()&&(e!==c.getUser()&&q.info("Level aborted by other user"),n.abortLevel());break;case "unlock":h.data==="bonus"&&q.info(f()?"Bonus levels unlocked. Thank you for your support!":"Bonus levels unlocked by other user"),n.unlock(h.data)}}var c,a=document.getElementById("start"),b=document.getElementById("code"),l=document.getElementById("wait"),j=document.getElementById("switch"),g=document.getElementById("audio"),i=s.get("solved"),h=s.get("audio"),k="Yellow died!,Blue died!,Yellow burnt!,Blue burnt!,Yellow was crushed in a closing door!,Blue was crushed in a closing door!,Yellow got stuck in a teleporter!,Blue got stuck in a teleporter!".split(",");
(function(){h++;e();g.addEventListener("click",e);document.getElementById("alone").addEventListener("click",function(){c=new u(d)});document.getElementById("friend").addEventListener("click",function(){a.hidden=!0;b.hidden=!1});document.getElementById("random").addEventListener("click",function(){a.hidden=!0;l.hidden=!1;c=new w(d)});document.getElementById("connect").addEventListener("click",function(){b.hidden=!0;l.hidden=!1;c=new w(d,document.getElementById("input").value)});document.getElementById("back").addEventListener("click",
function(){b.hidden=!0;a.hidden=!1});document.getElementById("cancel").addEventListener("click",function(){c.close();l.hidden=!0;a.hidden=!1});w.isAvailable()||(c=new u(d))})()})()})();