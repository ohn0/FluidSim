"use strict";

var canvas = document.getElementById("c");
var gl = canvas.getContext("webgl");
if(!gl){
    alert("FUCK");
}
var image = new Image();

image.src = 'file:///C:/Users/Neel/Documents/NetBeansProjects/chaos-game/webGL%20Tutorial/public_html/djibril.jpg';

image.onload = function() {
    main();
};

function createShader(gl, type, source)
{
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if(success)
    {
        return shader;
    }
    
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

var vertexShaderSource = document.getElementById("2d-vertex-shader").text;
var fragmentShaderSource = document.getElementById("2d-fragment-shader").text;

var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

function createProgram(gl, vertexShader, fragmentShader)
{
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if(success){
        return program;
    }
    
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}

function enableBind(attribLocation, buffer, glArrayType)
{
    gl.enableVertexAttribArray(attribLocation);
    gl.bindBuffer(glArrayType,buffer);
}

function main(){
    
    

    var program = createProgram(gl, vertexShader, fragmentShader);

    var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    var colorAttributeLocation = gl.getAttribLocation(program, "a_colors");
    var textureAttributeLocation = gl.getAttribLocation(program, "a_texture");
    var positionBuffer = gl.createBuffer();
    var colorBuffer = gl.createBuffer();
    var textureBuffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    var positions = [
        -1,-1,      
         1, 1,      
        -1, 1,      
         1, 1,      
         1,-1,      
        -1,-1  
    ];

    var colors = [
        1, 0, 0,
        1, 0, 1,
        1, 0, 0,
        0, 1, 0,
        0, 1, 0,
        1, 1, 0
    ];

    var textures = [
        0.0, 0.0,
        1.0, 0.0,
        0.0, 1.0,
        0.0, 1.0,
        1.0, 0.0,
        1.0, 1.0
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textures), gl.STATIC_DRAW);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);

    enableBind(positionAttributeLocation, positionBuffer, gl.ARRAY_BUFFER);

    var size = 2;
    var type = gl.FLOAT;
    var normalize = false;
    var stride = 0;
    var offset = 0;
    gl.vertexAttribPointer(positionAttributeLocation, size, 
    type, normalize, stride, offset);

    enableBind(colorAttributeLocation, colorBuffer, gl.ARRAY_BUFFER);
    gl.vertexAttribPointer(colorAttributeLocation, 3, gl.FLOAT, false, 0, 0);

    enableBind(textureAttributeLocation, textureBuffer, gl.ARRAY_BUFFER);
    gl.vertexAttribPointer(textureAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_I, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, djibril);

    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = 6;
    gl.drawArrays(primitiveType, offset, count);
}