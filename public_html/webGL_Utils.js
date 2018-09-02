"use strict";

var logging = true;

function LOG(message)
{
    if(logging)
    {
        console.log(message);
    }
}


function setup(gl)
{
    if(!gl){
        LOG("Unable to find webGL.");
    }
}

function setupCanvasAndContext(canvasName)
{
    var canvasContext = {};
    
    canvasContext.canvas = document.getElement(canvasName);
    canvasContext.gl = canvasContext.canvas.getContext("webgl");
    
    return canvasContext;
}

function createShaderProgram(vSource, fSource, glContext)
{
    var gl = glContext;
    
    var vShaderSrc = document.getElementById(vSource).text;
    var fShaderSrc = document.getElementById(fSource).text;
    
    var vShader = createShader(gl, gl.VERTEX_SHADER, vShaderSrc);
    var fShader = createShader(gl, gl.FRAGMENT_SHADER, fShaderSrc);
    
    return createProgram(gl, vShader, fShader);
}

function setMipmapParams(pixParams, texParams, glContext)
{
    var gl = glContext;
    
    gl.pixelStorei(pixParams.PACK, pixParams.FLAG);
    gl.texParameteri(texParams.textureVal, texParams.texWrapS, texParams.CLAMP);
    gl.texParameteri(texParams.textureVal, texParams.texWrapT, texParams.CLAMP);
    gl.texParameteri(texParams.textureVal, texParams.texMIN, texParams.NEAREST);
    gl.texParameteri(texParams.textureVal, texParams.texMAG, texParams.NEAREST);
    if(texParams.FB_TEXTURE !== null){
        gl.texImage2D(texParams.textureVal, 0, texParams.COLOR, texParams.X_VAL,
                      texParams.Y_VAL, 0, texParams.COLOR, texParams.BYTE, 
                      texParams.data);
    }
    else{
        gl.texImage2D(texParams.textureVal, 0, texParams.COLOR, texParams.COLOR, 
    texParams.BYTE, texParams.data);
   }

}


function genUint8Texture(arraySize)
{
    var data = new Uint8Array(arraySize);
    
    for(var i = 0; i < data.length; i++){
        if ( i % 3 === 0){
            data[i] = 255;
        }
        else{
            data[i] = getRandomInt(255);
        }
    }
    
    return data;
}

function getRandomInt(max)
{
    return Math.floor(Math.random() * Math.floor(max));
}



