"use strict";
//pastes an image to the screen
//gets the canvas and sets up the context
//can be replaced by setupCanvasAndContext("c")
var canvas = document.getElementById("c");
var gl = canvas.getContext("webgl");
var buffersPushed = false;
var FBSwitch = true;
var counter = 0.0;
var sCounter = 0.0;
var counterMod = .00005;

document.getElementById("c").addEventListener("click",
function(){
    FBSwitch = !FBSwitch;
});

if(!gl){
    alert("FUCK");
}

var logging = false;

function LOG(message)
{
    if (logging) {
        console.log(messsage);
    }
}

//get image data
var image = new Image();
image.src = 'http://localhost:8383/webGL%20Tutorial/cover.jpg';

var imageB = new Image();
imageB.src = 'http://localhost:8383/webGL%20Tutorial/shiki.png';

var then = 0;
var pObj = setup();

var mouseVec  = {x : 0, y : 0};
var canvasVec = {x : canvas.width, y : canvas.size};


//return a vector of the mouse's coordinates
function update_mouse_pos(e)
{
    mouseVec.x = e.clientX;
    mouseVec.y = e.clientY;
}

function update_canvas_size(e)
{ 
    console.log("logging canvas size");
    canvasVec.x = canvas.width;
    canvasVec.y = canvas.height; 
}

//start executing after the image is loaded
image.onload = function() {
    requestAnimationFrame(render);
};

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
    
    var programObj = {};
    //create the texture and fragment shaders
//    var vertexShaderSource = document.getElementById("2d-vertex-shader").text;
//    var fragmentShaderSource = document.getElementById("2d-fragment-shader").text;
    var vertexShaderSource = document.getElementById("vertex").text;
    var fragmentShaderSource = document.getElementById("fragment").text;

    var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    
    
    var program = createProgram(gl, vertexShader, fragmentShader);

    programObj.program = program;
//    programObj.framebufferProgram = createShaderProgram("vFBshader", "fFBshader", gl);
    programObj.framebufferProgram = createShaderProgram("FB_vertex", "FB_fragment", gl);
    
    
    
//get attributes and create buffers for each of them
    var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
//    var colorAttributeLocation = gl.getAttribLocation(program, "a_colors");
    var textureAttributeLocation = gl.getAttribLocation(program, "a_texture");
    var fBufferPosAttrLoc = gl.getAttribLocation(programObj.framebufferProgram, "a_position");
    var fBufferTexAttrLoc = gl.getAttribLocation(programObj.framebufferProgram, "a_texture");
    var positionBuffer = gl.createBuffer();
    var colorBuffer = gl.createBuffer();
    var textureBuffer = gl.createBuffer();

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
        1.0, 1.0,
        0.0, 1.0,
        1.0, 1.0,
        1.0, 0.0,
        0.0, 0.0
    ];
    
    //Bind the buffer and buffer the data onto the GPU
    bindAndBuffer(gl.ARRAY_BUFFER, positionBuffer, positions, gl.STATIC_DRAW);
    bindAndBuffer(gl.ARRAY_BUFFER, colorBuffer, colors, gl.STATIC_DRAW);
    bindAndBuffer(gl.ARRAY_BUFFER, textureBuffer, textures, gl.STATIC_DRAW);

    //set the openGL context's size?
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    programObj.positionAttributeLocation = positionAttributeLocation;
    programObj.textureAttributeLocation  = textureAttributeLocation;

    programObj.positionBuffer = positionBuffer;
    programObj.textureBuffer  = textureBuffer;
    return programObj;
}

function pushBuffersToGPU(bufferObj)
{
    enableBind(bufferObj.positionAttributeLocation, bufferObj.positionBuffer, gl.ARRAY_BUFFER);
    gl.vertexAttribPointer(bufferObj.positionAttributeLocation, 2, gl.FLOAT,
                           false, 0, 0);
    enableBind(bufferObj.textureAttributeLocation, bufferObj.textureBuffer, gl.ARRAY_BUFFER);
    gl.vertexAttribPointer(bufferObj.textureAttributeLocation, 2, gl.FLOAT, false, 0,0);
    
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    setMipmapParams({PACK:gl.UNPACK_FLIP_Y_WEBGL, FLAG: true},
                    {textureVal: gl.TEXTURE_2D, 
                     texWrapS: gl.TEXTURE_WRAP_S,
                     texWrapT: gl.TEXTURE_WRAP_T,
                     CLAMP: gl.CLAMP_TO_EDGE,
                     texMIN: gl.TEXTURE_MIN_FILTER,
                     texMAG: gl.TEXTURE_MAG_FILTER,
                     NEAREST: gl.NEAREST,
                     COLOR: gl.RGBA,
                     BYTE: gl.UNSIGNED_BYTE,
                     FB_TEXTURE: null,
                     data: image}, gl);
    bufferObj.texture = texture;
    
    var textureB = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, textureB);
    setMipmapParams({PACK:gl.UNPACK_FLIP_Y_WEBGL, FLAG: true},
                    {textureVal: gl.TEXTURE_2D, 
                     texWrapS: gl.TEXTURE_WRAP_S,
                     texWrapT: gl.TEXTURE_WRAP_T,
                     CLAMP: gl.CLAMP_TO_EDGE,
                     texMIN: gl.TEXTURE_MIN_FILTER,
                     texMAG: gl.TEXTURE_MAG_FILTER,
                     NEAREST: gl.NEAREST,
                     COLOR: gl.RGBA,
                     BYTE: gl.UNSIGNED_BYTE,
                     FB_TEXTURE: null,
                     data: imageB}, gl);
    bufferObj.textureB = textureB;

    var frameBufferTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, frameBufferTexture);
    setMipmapParams({PACK: gl.UNPACK_FLIP_Y_WEBGL, FLAG: true},
                    {textureVal: gl.TEXTURE_2D,
                     texWrapS: gl.TEXTURE_WRAP_S,
                     texWrapT: gl.TEXTURE_WRAP_T,
                     CLAMP: gl.CLAMP_TO_EDGE,
                     texMIN: gl.TEXTURE_MIN_FILTER,
                     texMAG: gl.TEXTURE_MAG_FILTER,
                     NEAREST: gl.NEAREST,
                     COLOR: gl.RGBA,
                     BYTE: gl.UNSIGNED_BYTE,
                     FB_TEXTURE: 1,
                     X_VAL: 1920,
                     Y_VAL: 1080 ,
                     data: null}, gl);
  
    var frameBuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    
    var frameBufferTextureB = gl.createTexture();

    gl.bindTexture(gl.TEXTURE_2D, frameBufferTextureB);
    setMipmapParams({PACK: gl.UNPACK_FLIP_Y_WEBGL, FLAG: true},
                {textureVal: gl.TEXTURE_2D,
                 texWrapS: gl.TEXTURE_WRAP_S,
                 texWrapT: gl.TEXTURE_WRAP_T,
                 CLAMP: gl.CLAMP_TO_EDGE,
                 texMIN: gl.TEXTURE_MIN_FILTER,
                 texMAG: gl.TEXTURE_MAG_FILTER,
                 NEAREST: gl.NEAREST,
                 COLOR: gl.RGBA,
                 BYTE: gl.UNSIGNED_BYTE,
                 FB_TEXTURE: null,
                 data: image}, gl);
    
    var frameBufferB = gl.createFramebuffer();   
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    
    gl.bindTexture(gl.TEXTURE_2D, null);
    bufferObj.FBTexture = frameBufferTexture;
    bufferObj.FBTextureB = frameBufferTextureB;
    bufferObj.framebuffer = frameBuffer;
    bufferObj.framebufferB = frameBufferB;
}
    
    
function render()
{
    //clear the screen
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    //set the shader program as the one to be used
    //bind the position attribute to the array buffer to be used and define how
    //the vertices should be read.
    //LOG(mouseVec.x/canvas.width);
    //load all the buffers onto the GPU once, don't need to reload every frame.
    if(!buffersPushed)
    {
        pushBuffersToGPU(pObj);
        buffersPushed = true;
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, pObj.framebuffer);
    gl.useProgram(pObj.framebufferProgram);
    var tex0Loc = gl.getUniformLocation(pObj.framebufferProgram, "u_image");
//    var tex1Loc = gl.getUniformLocation(pObj.framebufferProgram, "u_imageB");

    gl.uniform1i(tex0Loc, 0);
//    gl.uniform1i(tex1Loc, 2);
    
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, pObj.texture);

//    gl.activeTexture(gl.TEXTURE2);
//    gl.bindTexture(gl.TEXTURE_2D, pObj.textureB);
    
    gl.bindFramebuffer(gl.FRAMEBUFFER, pObj.framebuffer);
    if(FBSwitch){
        gl.bindTexture(gl.TEXTURE_2D, pObj.FBTextureB);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, 
        gl.TEXTURE_2D, pObj.FBTexture,0);
    }else{
        gl.bindTexture(gl.TEXTURE_2D, pObj.FBTexture);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, 
        gl.TEXTURE_2D, pObj.FBTextureB,0);
    }
    
    
    
//    gl.bindTexture(gl.TEXTURE_2D, pObj.FBTextureB);
//    gl.bindFramebuffer(gl.FRAMEBUFFER, pObj.framebuffer);
//    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, pObj.FBTexture,0);
    gl.viewport(0, 0, 1920, 1080);
    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = 6;
    gl.drawArrays(primitiveType, offset, count);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.useProgram(pObj.program);
    tex0Loc = gl.getUniformLocation(pObj.program, "u_image");
    var tex1Loc = gl.getUniformLocation(pObj.program, "u_imageB");
    
    gl.uniform2fv(gl.getUniformLocation(pObj.program, "u_mousePos"), 
            [((mouseVec.x/canvas.width) - 0.5) * 2.0,-1.0 * (((mouseVec.y/canvas.height) - 0.5) * 2.0)]);
    gl.uniform1fv(gl.getUniformLocation(pObj.program, "u_counterVal"), [counter]);
    gl.uniform1fv(gl.getUniformLocation(pObj.program, "u_bilinVal"), [counter]);
    
//    gl.uniform1i(tex0Loc, 0);
    gl.uniform1i(tex1Loc, 1);
    
    gl.bindTexture(gl.TEXTURE_2D, null);
    
//    gl.activeTexture(gl.TEXTURE0);
//    gl.bindTexture(gl.TEXTURE_2D, pObj.texture);
    
//    gl.activeTexture(gl.TEXTURE1);
//    gl.bindTexture(gl.TEXTURE_2D, pObj.textureB)
    
    if(counter > .004777 || counter < 0.0){
        counterMod*= -1.0;
    }
    
    counter += counterMod;
    
    gl.activeTexture(gl.TEXTURE0);
    if(FBSwitch){
        gl.bindTexture(gl.TEXTURE_2D, pObj.FBTexture);
//        sCounter += 1.0;
    }else{
//        sCounter = 0.0;
        gl.bindTexture(gl.TEXTURE_2D, pObj.FBTextureB);
    }
    
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, pObj.textureB);
    
    FBSwitch = !FBSwitch;
//    if(sCounter < 60.0){
//    else{
//        FBSwitch = !FBSwitch;   
//        sCounter = 0.0;
//    }
    
   // gl.viewport(0,0, gl.canvas.width, gl.canvas.height);
    //update mouse postion vector in shader
    //Define what should be drawn and draw them
    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = 6;
    gl.drawArrays(primitiveType, offset, count);
    requestAnimationFrame(render);
}
