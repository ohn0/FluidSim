"use strict";

var canvas = document.getElementById("c");
var gl = canvas.getContext("webgl");
var entityState = {};
var textureCounter = 0;
var texturesBound = false;

if(!gl){alert("webGL not initialized")};


var images;
//
//// = [];
//var image = new Image();
//var image2 = new Image();
//image.src= 'http://localhost:8383/webGL%20Tutorial/cat.jpg';
//image2.src= 'http://localhost:8383/webGL%20Tutorial/saber.png';



//
//image.onload = function() 
//{    
//
//    entityState = setup();
//    pushBuffersToGPU(entityState);
//    gl.viewport(0,0, gl.canvas.width, gl.canvas.height);
//    requestAnimationFrame(b);
//
//};



//var baselineRenderFunc = function()
function baselineRenderFunc()
{
    entityState = setup();
    pushBuffersToGPU(entityState);
    gl.viewport(0,0, gl.canvas.width, gl.canvas.height);
    requestAnimationFrame(baselineRender);
};

function loadImage(url, callback)
{
    var image = new Image();
    image.src = url;
    image.onload = callback;
    return image;
}

var imagesToLoad;

function loadImages(urls, callback)
{
    images = [];
    imagesToLoad = urls.length;
    
    var onImageLoad = function()
    {
        --imagesToLoad;
        if(imagesToLoad === 0){
            callback();
        }
    };
    
    for (var ii = 0; ii < imagesToLoad; ++ii){
        var image = loadImage(urls[ii], onImageLoad);
        images.push(image);
    }
}

function renderFunc()
{
    entityState = setup();
    pushBuffersToGPU(entityState);
    
    var FB_load = createFramebuffer();
    entityState.FBuffer =  FB_load[0]; //createFramebuffer()[0];
    entityState.FB_texture = FB_load[1];
    FB_load = createFramebuffer();
    
    entityState.FBufferB = FB_load[0]; //= createFramebuffer()[0]
    entityState.FB_textureB = FB_load[1];
    gl.viewport(0,0, gl.canvas.width, gl.canvas.height);
    requestAnimationFrame(render);    
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
    };
    
    console.log(gl.getShaderInfoLog(shader));
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

function createProgram(gl, vShader, fShader)
{
    var program = gl.createProgram();
    gl.attachShader(program, vShader);
    gl.attachShader(program, fShader);
    gl.linkProgram(program);
    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if(success){
        return program;
    }
    
    console.log("error creating program " + gl.getProgramInfoLog(program));
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

function createShaderProgram(vShaderStr, fShaderStr)
{
    var vSource = document.getElementById(vShaderStr).text;
    var fSource = document.getElementById(fShaderStr).text;
    
    var vShader = createShader(gl, gl.VERTEX_SHADER, vSource);
    var fShader = createShader(gl, gl.FRAGMENT_SHADER, fSource);
    
    return [vShader, fShader];
     
}

function setup()
{
    var pObj = {};
    
    var shaderProgramA = createShaderProgram("vertexShader", "fragmentShader");
    var shaderProgramB = createShaderProgram("FB_VertexShader", "FB_FragmentShader");
    
    
//    
//    var vSource = document.getElementById("vertexShader").text;
//    var fSource = document.getElementById("fragmentShader").text;
//    
//    var vShader = createShader(gl, gl.VERTEX_SHADER, vSource);
//    var fShader = createShader(gl, gl.FRAGMENT_SHADER, fSource);
//    
    
    var program = createProgram(gl, shaderProgramA[0], shaderProgramA[1]);
    var FB_program = createProgram(gl, shaderProgramB[0], shaderProgramB[1]);
    
    var frameBuffer = createFramebuffer();
    pObj.program = program;
    pObj.FBprogram = FB_program;
    pObj.frameBuffer = frameBuffer;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    
    var a_posLoc = gl.getAttribLocation(program, "a_pos");
    var a_texLoc = gl.getAttribLocation(program, "a_tex");
    var b_texLoc = gl.getAttribLocation(program, "a_tex");
    
    var FB_a_posLoc = gl.getAttribLocation(FB_program, "a_FB_pos");
    var FB_a_texLoc = gl.getAttribLocation(FB_program, "a_FB_tex");
    
    var posBuffer = gl.createBuffer();
    var texBuffer = gl.createBuffer();
    
    
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


    bindAndBuffer(gl.ARRAY_BUFFER, posBuffer, positions, gl.STREAM_DRAW);
    bindAndBuffer(gl.ARRAY_BUFFER, texBuffer, textures, gl.STREAM_DRAW);
    
    pObj.a_PosLoc = a_posLoc;
    pObj.a_TexLoc = a_texLoc;
    pObj.b_TexLoc = b_texLoc;
    pObj.FB_a_PosLoc = FB_a_posLoc;
    pObj.FB_a_TexLoc = FB_a_texLoc;
    pObj.textures = [];
    
    pObj.a_PosBuffer = posBuffer;
    pObj.a_TexBuffer = texBuffer;
    
    return pObj;
}



function pushBuffersToGPU(entityState)
{
    enableBind(entityState.a_PosLoc, entityState.a_PosBuffer, gl.ARRAY_BUFFER);
    gl.vertexAttribPointer(entityState.a_PosLoc, 2, gl.FLOAT, false, 0, 0);
    
    enableBind(entityState.FB_a_PosLoc, entityState.a_PosBuffer, gl.ARRAY_BUFFER);
    gl.vertexAttribPointer(entityState.FB_a_PosLoc, 2, gl.FLOAT, false, 0, 0);  
    
    gl.useProgram(entityState.program);
    entityState.textureA = attachImageToTexture(images[0], entityState.a_TexLoc, entityState.a_TexBuffer);
    entityState.textureB = attachImageToTexture(images[1], entityState.b_TexLoc, entityState.a_TexBuffer);
    gl.useProgram(entityState.FBprogram);
    entityState.textureC = attachImageToTexture(images[1], entityState.FB_a_TexLoc, entityState.a_TexBuffer);
    

    
}

function attachImageToTexture(Limage, texLoc, texBuffer)
{
    enableBind(texLoc, texBuffer, gl.ARRAY_BUFFER);
    gl.vertexAttribPointer(texLoc, 2, gl.FLOAT, false, 0, 0);
    
    var texture = createTexture();

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, Limage);
    
    gl.bindTexture(gl.TEXTURE_2D, null);
    
    return texture;
}

function baselineRender()
{
    resize(gl.canvas);
    bindFramebufferAndSetViewport(null, gl.canvas.width, gl.canvas.height);

//    gl.bindTexture(gl.TEXTURE_2D, null);
//    gl.viewport(0,0, gl.canvas.width, gl.canvas.height);

    gl.clearColor(0,0,0,0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    
    gl.useProgram(entityState.program);
    
    if(!texturesBound){
        if(activateAndBindTexture("u_image", entityState.program, entityState.textureA) === 0){
            console.log("Error activating or linking u_image");
        }

        if(activateAndBindTexture("u_imageB", entityState.program, entityState.textureB) === 0){
            console.log("Error activating or linking u_imageB");
        }
        texturesBound = true;
    }
    



    drawToOutput(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(baselineRender);
}

var FBtextureBound = false;
var textureSwitch = false;
var useFB = false;

function render()
{
    resize(gl.canvas);
    bindFramebufferAndSetViewport(null, gl.canvas.clientWidth, gl.canvas.clientHeight);
    gl.clearColor(0,0,0,0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    bindFramebufferAndSetViewport(entityState.FBuffer, gl.canvas.clientWidth, gl.canvas.clientHeight);

    gl.useProgram(entityState.FBprogram);

    var glProgram = entityState.FBprogram;
    var samplerID = "u_FBimage";
    var texture;
    var texLoc = gl.getUniformLocation(glProgram, samplerID);

//------------------------------------------base line
//    if(!texturesBound){
//        if(activateAndBindTexture("u_FBimage", entityState.FBprogram, entityState.textureA) === 0){
//            console.log("Error Activating or linking u_FBimage");
//        }
//    }
//------------------------------------------base line



    if(!texturesBound){
        gl.activeTexture(gl.TEXTURE0);
//        gl.viewport(0,0, gl.canvas.clientWidth, gl.canvas.clientHeight);

        gl.bindFramebuffer(gl.FRAMEBUFFER, entityState.FBuffer);

        gl.framebufferTexture2D(
            gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, entityState.FB_texture, 0);

        gl.uniform1i(texLoc, 1);
        texture = entityState.textureA;
        gl.activeTexture(gl.TEXTURE1);
        if(!useFB){
            useFB = !useFB;
            gl.bindTexture(gl.TEXTURE_2D, entityState.textureA);
        }
        else{
            gl.bindTexture(gl.TEXTURE_2D, entityState.FB_textureB);
        }
    }else
    {
        gl.uniform1i(texLoc, 0);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, entityState.FB_texture);

        gl.activeTexture(gl.TEXTURE1);
//        gl.viewport(0,0, gl.canvas.clientWidth, gl.canvas.clientHeight);

        gl.bindFramebuffer(gl.FRAMEBUFFER, entityState.FBuffer);
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, entityState.FB_textureB, 0);
    }
    
    drawToOutput(gl.TRIANGLES, 0, 6);

    bindFramebufferAndSetViewport(null,gl.canvas.clientWidth, gl.canvas.clientHeight);

    gl.clearColor(0,0,0,0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(entityState.program);
    
    
//--------------------------------------------Base line
//    if(!FBtextureBound){
////        if(activateAndBindTexture("u_image", entityState.program, entityState.FB_texture) === 0){
////            console.log("Error activating or linking u_image");
////        }
//        gl.uniform1i(gl.getUniformLocation0(entityState.program, "u_image"), 2);
//        gl.activeTexture(gl.TEXTURE2);
//        gl.bindTexture(gl.TEXTURE_2D, entityState.FB_texture);
//        FBtextureBound = true;
//    }
//--------------------------------------------Base line

    texLoc = gl.getUniformLocation(entityState.program, "u_image");
    gl.uniform1i(texLoc, 2);
    var bTexLoc = gl.getUniformLocation(entityState.program, "u_imageB");
    gl.uniform1i(bTexLoc, 3);
    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_2D, entityState.textureB);
    if(!texturesBound){
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, entityState.FB_texture);
    }else{
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, entityState.FB_textureB);
    }
    
    textureSwitch = !textureSwitch; 
    drawToOutput(gl.TRIANGLES, 0, 6);
    texturesBound = !texturesBound;
    requestAnimationFrame(render);
}

function bindFramebufferAndSetViewport(framebuffer, width, height)
{
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.viewport(0,0, width, height);
}

function drawToOutput(primitiveType, offset, count)
{

    gl.clearColor(.5, .5, .5, 1.0);
    gl.drawArrays(primitiveType, offset, count);

}

function resize(canvas) 
{
    var dWidth  = canvas.clientWidth;
    var dHeight = canvas.clientHeight;
    if(canvas.width !== dWidth || canvas.height !== dHeight)
    {
        canvas.width = dWidth;
        canvas.height = dHeight;
    }
}

function activateAndBindTexture(samplerID, glProgram, texture)
{
    if(textureCounter > 15){return 0;}
    var texLoc = gl.getUniformLocation(glProgram, samplerID);
    gl.uniform1i(texLoc, textureCounter);
    gl.activeTexture(gl.TEXTURE0 + textureCounter);
    entityState.textures.push(gl.TEXTURE0 + textureCounter);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    
    textureCounter++;
    
    return 1;
}

function createTexture()
{
    //CAUTION: THIS BINDS A TEXTURE BUT NEVER UNBINDS!
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    return texture;
    
    
}

function createFrameBufferTexture(width, height)
{
    var FBTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, FBTexture);
    var level = 0;
    var internalFormat = gl.RGBA;
    var border = 0;
    var format = gl.RGBA;
    var type = gl.UNSIGNED_BYTE;
    var data = null;
    
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
    width, height, border, format, type, data);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    
    gl.bindTexture(gl.TEXTURE_2D, null);
    return FBTexture;
}

function createFramebuffer()
{
    var texture = createTexture(); 
//    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.canvas.clientWidth, gl.canvas.clientHeight, 0, 
        gl.RGBA, gl.UNSIGNED_BYTE, null);
//    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
//    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
//    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    var fBuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fBuffer);
    
    gl.framebufferTexture2D(
        gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    
//    entityState.FB_texture = texture;
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
//    gl.activeTexture(null);
    return [fBuffer, texture];
}

function setupFramebuffer(fbo, width, height)
{
    //CAUTION: THIS BINDS A TEXTURE BUT NEVER UNBINDS!
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.viewport(0,0, width, height);
}


function main(){
    loadImages([
        'http://localhost:8383/webGL%20Tutorial/cat.jpg',
        'http://localhost:8383/webGL%20Tutorial/saber.png'
    ], renderFunc);
}

main();