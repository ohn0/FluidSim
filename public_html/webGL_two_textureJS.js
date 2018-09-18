"use strict";

var canvas = document.getElementById("c");
var gl = canvas.getContext("webgl");

if(!gl){
    alert("FUCK");
}
var buffersPushed = false;
var image = new Image();
image.src = 'http://localhost:8383/webGL%20Tutorial/shiki.png';

var imageB = new Image();
imageB.src = 'http://localhost:8383/webGL%20Tutorial/saber.png';

var pObj = setup();
//create a shader, set it's source and compile it, returns a value used to 
//reference the shader.
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
    console.log(gl.getProgramInfoLog(shader));
    gl.deleteShader(shader);
}



//creates the program on the GPU, attaches the shaders and links the program
//returns a value used to reference the program
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
    
    console.log("error creating program: " + gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}

//enable and bind a buffer
function enableBind(attribLocation, buffer, glArrayType)
{
    gl.enableVertexAttribArray(attribLocation);
    gl.bindBuffer(glArrayType,buffer);
}

//bind and buffer data to a gl buffer
function bindAndBuffer(glArrayType, buffer, arrayToBuffer, glDrawType)
{
    gl.bindBuffer(glArrayType, buffer);
    gl.bufferData(glArrayType, new Float32Array(arrayToBuffer), glDrawType);
}

function setup()
{
    var pObj = {};

    var vertexShaderSource = document.getElementById("vertexShader").text;
    var fragmentShaderSource = document.getElementById("fragmentShader").text;
    
    var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    
    var program = createProgram(gl, vertexShader, fragmentShader);
    
    pObj.program = program;
    
    var posAttribLocation = gl.getAttribLocation(program, "a_pos");
    var texAttribLocation = gl.getAttribLocation(program, "a_tex");

    var pBuffer = gl.createBuffer();
    var tBuffer = gl.createBuffer();
    
    var textures = [
        0.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
        1.0, 1.0,
        1.0, 0.0,
        0.0, 0.0
    ];
    
    var positions = [
        -1,-1,      
         1, 1,      
        -1, 1,      
         1, 1,      
         1,-1,      
        -1,-1  
    ];
    
    bindAndBuffer(gl.ARRAY_BUFFER, pBuffer, positions, gl.STATIC_DRAW);
    bindAndBuffer(gl.ARRAY_BUFFER, tBuffer, textures, gl.STATIC_DRAW);

    gl.viewport(0,0,gl.canvas.width, gl.canvas.height);
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);
    
    pObj.pBuffer = pBuffer;
    pObj.tBuffer = tBuffer;
    
    pObj.posAttribLocation = posAttribLocation;
    pObj.texAttribLocation = texAttribLocation;

    return pObj;
}


function pushBuffersToGPU(bufferObj)
{
    enableBind(bufferObj.posAttribLocation, bufferObj.pBuffer, gl.ARRAY_BUFFER);
    gl.vertexAttribPointer(bufferObj.posAttribLocation, 2, gl.FLOAT, false, 0,0);
    
    enableBind(bufferObj.texAttribLocation, bufferObj.tBuffer, gl.ARRAY_BUFFER);
    gl.vertexAttribPointer(bufferObj.texAttribLocation, 2, gl.FLOAT, false, 0,0);
    
    var tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    setMipmapParams({PACK:gl.UNPACK_FLIP_Y_WEBGL, FLAT: true},
    {textureVal: gl.TEXTURE_2D, texWrapS: gl.TEXTURE_WRAP_S,
     texWrapT: gl.TEXTURE_WRAP_T, CLAMP: gl.CLAMP_TO_EDGE, texMIN: gl.TEXTURE_MIN_FILTER,
     texMAG: gl.TEXTURE_MAG_FILTER, NEAREST: gl.NEAREST, COLOR:gl.RGBA,BYTE: gl.UNSIGNED_BYTE,
     FB_TEXTURE: null, data: image}, gl);
     bufferObj.tex = tex;
    
    var texB = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texB);
    setMipmapParams({PACK:gl.UNPACK_FLIP_Y_WEBGL, FLAT: true},
    {textureVal: gl.TEXTURE_2D, texWrapS: gl.TEXTURE_WRAP_S,
     texWrapT: gl.TEXTURE_WRAP_T, CLAMP: gl.CLAMP_TO_EDGE, texMIN: gl.TEXTURE_MIN_FILTER,
     texMAG: gl.TEXTURE_MAG_FILTER, NEAREST: gl.NEAREST, COLOR:gl.RGBA,BYTE: gl.UNSIGNED_BYTE,
     FB_TEXTURE: null, data: imageB}, gl);
     bufferObj.texB = texB;
     
     gl.bindTexture(gl.TEXTURE_2D, null);
}


function render()
{
    gl.clearColor(0,0,1,1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    if(!buffersPushed)
    {
        pushBuffersToGPU(pObj);
        buffersPushed = true;
    }
    
    gl.useProgram(pObj.program);
    
    var tex0Loc = gl.getUniformLocation(pObj.program, "u_image");
    var tex1Loc = gl.getUniformLocation(pObj.program, "u_imageB");
    
    gl.uniform1i(tex0Loc, 0);
    gl.uniform1i(tex1Loc, 1);
    
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, pObj.tex);
    
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, pObj.texB);
    
//    gl.viewport(0,0, 1920, 1080);
    var primitive = gl.TRIANGLES;
    gl.drawArrays(primitive, 0, 6);
    
    gl.viewport(0,0,gl.canvas.width, gl.canvas.height);
    requestAnimationFrame(render);
}

image.onload = function() {
    requestAnimationFrame(render);
};