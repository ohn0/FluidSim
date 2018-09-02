"use strict";

var scene = new THREE.Scene();
var camera= new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight,
                                        0.1, 1000);

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var geometry = new THREE.BoxGeometry(1,5,1);
var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
var cube = new THREE.Mesh(geometry, material);

//scene.add(cube);

var curve = new THREE.SplineCurve( [
    new THREE.Vector2( -5, 0),
    new THREE.Vector2( -5,  2),
    new THREE.Vector2(  0,  0),
    new THREE.Vector2(  5, -2),
    new THREE.Vector2(  5,  0)
    ] );
    
var points = curve.getPoints(70);
var splineGeometry = new THREE.BufferGeometry().setFromPoints( points );
var mat = new THREE.LineBasicMaterial({color: 0xFF0000});

var splineObj = new THREE.Line(splineGeometry, mat);

scene.add(splineObj);
camera.position.z = 5;

function animate()
{
    requestAnimationFrame(animate);
    splineObj.rotation.x += .01;
    splineObj.rotation.z += .01;
//    cube.rotation.x += 0.01;
//    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
}

animate();


