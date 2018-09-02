"use strict";
var vsSource = "attribute vec4 aVertexPosition;\n\
                attribute vec4 aVertexColor;\n\
                attribute vec3 aVertexNormal;\n\
                \n\
\n\
                uniform mat4 uViewMatrix;\n\
                uniform mat4 uNormalMatrix;\n\
                uniform mat4 uModelViewMatrix;\n\
                uniform mat4 uProjectionMatrix;\n\
\n\
                varying highp vec3 vLighting;\n\
                varying lowp vec4 vColor;\n\
\n\
\n\
                void main(){\n\
                    gl_Position = uProjectionMatrix * uViewMatrix * uModelViewMatrix * \n\
                    aVertexPosition;\n\
                    vColor = aVertexColor;\n\
\n\
                    highp vec3 ambientLight = vec3(0.1, 0.1, 0.9);\n\
                    highp vec3 directionalLightColor = vec3(1,1,1);\n\
                    highp vec3 directionalVector = normalize(vec3(0.85, 0.8, 0.75));\n\
\n\
                    highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);\n\
                    \n\
                    highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);\n\
                    vLighting = ambientLight + (directionalLightColor * directional);\n\
                }\n\
                ";

var fsSource = "\
                varying highp vec2 vTextureCoord;\n\
                varying highp vec3 vLighting;\n\
\n\
                \n\
                varying lowp vec4 vColor;\n\
                void main() {\n\
                    gl_FragColor = vec4(vColor.xyz * vLighting, 1.0);\n\
                }"
;

var djibrilTexture = 'file:///C:/Users/Neel/Documents/NetBeansProjects/chaos-game/webGL%20Tutorial/public_html/djibril.jpg';

var cubeRotation = 0.0;

var dateObj = new Date();
var slowCounter = .0001;
function radians(degrees)
{
    return degrees * (Math.PI / 180);
}

function initCamera(startPos, target, up)
{
//    var camera = startPos;
//    var direction = normalize(subtract(camera, startPos, target));
//    var right = normalize(cross(up, direction));
//    var cameraUp = cross(direction, right);
//    

    var lookAtMat = mat4.create();
    mat4.lookAt(lookAtMat, startPos, target, up);
    return lookAtMat;
    
}

function bindArrayAndLink(binding)
{

//    console.log("Binding and linking " + binding.vertexAttrib);
    binding.context.bindBuffer(binding.context.ARRAY_BUFFER, binding.buffer);

    if(binding.isElement != null && binding.isElement === true){
        binding.context.bindBuffer(binding.context.ELEMENT_ARRAY_BUFFER,binding.buffer);
    }
//    binding.context.bindBuffer(binding.context.ARRAY_BUFFER, binding.buffer);
    binding.context.vertexAttribPointer(
        binding.vertexAttrib,
        binding.nComponents,
        binding.type,
        binding.isNormalized,
        binding.stride,
        binding.offset
    );
    binding.context.enableVertexAttribArray(binding.vertexAttrib);
//    console.log("Binded and linked " + binding.vertexAttrib); 
    return 0;
}

function getTime(){
    return (new Date().getTime());
}

function drawScene(gl, programInfo, buffers, dTime, positions)
{
    gl.clearColor(0.0, 0.0, 0.0, 1.0);      //Clear to black
    gl.clearDepth(1.0);                     //Clear everything
    gl.enable(gl.DEPTH_TEST);               //Enable depth testing
    gl.depthFunc(gl.LEQUAL);                //Near things obscure far things
    
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    var fieldOfView = 45 * Math.PI / 180;
    var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    var zNear = 0.1;
    var zFar = 100.0;
    var projectionMatrix = mat4.create();
    var normalMatrix = mat4.create();
    
    mat4.perspective(projectionMatrix,
                     fieldOfView,
                     aspect,
                     zNear,
                     zFar);
    var xVal = Math.sin(getTime()) * radians(.0000010);
    var zVal = Math.cos(getTime()) * radians(.000001);
    var lookAtMatrix = initCamera([xVal,0,zVal],[0,0,0],[0,1,0]);
    
    for(var i = 0; i < positions.length; i++){
    var modelViewMatrix = mat4.create(); 

    
    mat4.translate(modelViewMatrix,     //Dest
                   modelViewMatrix,     //Src
                   positions[i]);       //translation amount
    
    mat4.scale(modelViewMatrix,
               modelViewMatrix,
               [.5,.5,.5]);
    mat4.rotate(modelViewMatrix,
                modelViewMatrix,
                Math.sin(slowCounter),                    //cubeRotation * .7,
                [0,1,0]);
                
    mat4.invert(normalMatrix, modelViewMatrix);
    mat4.transpose(normalMatrix, normalMatrix);
    
    bindArrayAndLink({
       nComponents: 4,
       type: gl.FLOAT,
       isNormalized: false,
       stride: 0,
       offset: 0,
       buffer: buffers.color,
       vertexAttrib: programInfo.attribLocations.vertexColor,
       context: gl
    });
    
    bindArrayAndLink({
        nComponents: 3,
        type: gl.FLOAT,
        isNormalized: false,
        stride: 0,
        offset: 0,
        buffer: buffers.position,
        vertexAttrib: programInfo.attribLocations.vertexPosition,
        context: gl
    });
    
    bindArrayAndLink({
        nComponents: 3,
        type: gl.FLOAT,
        isNormalized: false,
        stride: 0,
        offset: 0,
        buffer: buffers.normals,
        vertexAttrib: programInfo.attribLocations.vertexNormal,
        context: gl
    });
    
    gl.useProgram(programInfo.program);
    
    gl.uniformMatrix4fv(
            programInfo.uniformLocations.projectionMatrix,
            false,
            projectionMatrix);
     
    gl.uniformMatrix4fv(
            programInfo.uniformLocations.viewMatrix,
            false,
            lookAtMatrix);
        
    gl.uniformMatrix4fv(
            programInfo.uniformLocations.modelViewMatrix,
            false,
            modelViewMatrix);
            
    gl.uniformMatrix4fv(
        programInfo.uniformLocations.normalMatrix,
        false,
        normalMatrix
        );
            
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
            
    {
        var offset = 0;
        var vertexCount = 36;
        var type = gl.UNSIGNED_SHORT;
        gl.drawElements(gl.TRIANGLES, vertexCount, type, offset);
//        gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
    }
    }
 
    cubeRotation += dTime;
}

function initBuffers(gl)
{
    //Create a buffer for the square's positions.
    
    var positionBuffer =    gl.createBuffer();
    var colorBuffer =       gl.createBuffer();
    var normalBuffer =      gl.createBuffer();
    
    
    var positions = [
      // Front face
      -1.0, -1.0,  1.0,
       1.0, -1.0,  1.0,
       1.0,  1.0,  1.0,
      -1.0,  1.0,  1.0,

      // Back face
      -1.0, -1.0, -1.0,
      -1.0,  1.0, -1.0,
       1.0,  1.0, -1.0,
       1.0, -1.0, -1.0,

      // Top face
      -1.0,  1.0, -1.0,
      -1.0,  1.0,  1.0,
       1.0,  1.0,  1.0,
       1.0,  1.0, -1.0,

      // Bottom face
      -1.0, -1.0, -1.0,
       1.0, -1.0, -1.0,
       1.0, -1.0,  1.0,
      -1.0, -1.0,  1.0,

      // Right face
       1.0, -1.0, -1.0,
       1.0,  1.0, -1.0,
       1.0,  1.0,  1.0,
       1.0, -1.0,  1.0,

      // Left face
      -1.0, -1.0, -1.0,
      -1.0, -1.0,  1.0,
      -1.0,  1.0,  1.0,
      -1.0,  1.0, -1.0
    ];

    var faceColors = [
      [1.0,  1.0,  1.0,  1.0],    // Front face: white
      [1.0,  0.0,  0.0,  1.0],    // Back face: red
      [0.0,  1.0,  0.0,  1.0],    // Top face: green
      [0.0,  0.0,  1.0,  1.0],    // Bottom face: blue
      [1.0,  1.0,  0.0,  1.0],    // Right face: yellow
      [1.0,  0.0,  1.0,  1.0],    // Left face: purple
    ];

        
    var indices = [
        0,  1,  2,      0,  2,  3,    // front
        4,  5,  6,      4,  6,  7,    // back
        8,  9,  10,     8,  10, 11,   // top
        12, 13, 14,     12, 14, 15,   // bottom
        16, 17, 18,     16, 18, 19,   // right
        20, 21, 22,     20, 22, 23   // left  
    ];
    
    
    var colors = [];
    
    for (var i = 0; i < faceColors.length; i++){
        var c = faceColors[i];
        
        colors = colors.concat(c,c,c,c);
    }
    
  var vertexNormals = [
    // Front
     0.0,  0.0,  1.0,
     0.0,  0.0,  1.0,
     0.0,  0.0,  1.0,
     0.0,  0.0,  1.0,

    // Back
     0.0,  0.0, -1.0,
     0.0,  0.0, -1.0,
     0.0,  0.0, -1.0,
     0.0,  0.0, -1.0,

    // Top
     0.0,  1.0,  0.0,
     0.0,  1.0,  0.0,
     0.0,  1.0,  0.0,
     0.0,  1.0,  0.0,

    // Bottom
     0.0, -1.0,  0.0,
     0.0, -1.0,  0.0,
     0.0, -1.0,  0.0,
     0.0, -1.0,  0.0,

    // Right
     1.0,  0.0,  0.0,
     1.0,  0.0,  0.0,
     1.0,  0.0,  0.0,
     1.0,  0.0,  0.0,

    // Left
    -1.0,  0.0,  0.0,
    -1.0,  0.0,  0.0,
    -1.0,  0.0,  0.0,
    -1.0,  0.0,  0.0
  ];

    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices),
                 gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, 
                new Float32Array(colors), 
                gl.STATIC_DRAW);
                
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,
                 new Float32Array(positions),
                 gl.STATIC_DRAW);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals),
                  gl.STATIC_DRAW);
                  
    
    
    return {
        position : positionBuffer,
        normals : normalBuffer,
        color : colorBuffer,
        indices : indexBuffer
    };
}

function loadShader(gl, type, source)
{
    console.log('Compiling ' + type);
    var shader = gl.createShader(type);
    
    gl.shaderSource(shader, source);
    
    gl.compileShader(shader);
    
    if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
        alert('Unable to compile shaders: ' + gl.getShaderInfoLog(shader));
        return null;
    }
    console.log('Compiled ' + type);
    return shader;
}

function initShaderProgram(gl, vertexSource, fragmentSource)
{
    console.log('Initializing shaders.');
    var vertexShader = loadShader(gl, gl.VERTEX_SHADER, vertexSource);
    var fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
    
    var shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    
    if(!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)){
        alert('Unable to initialize the shader program.' + gl.getProgramInfoLog(
                shaderProgram));
        return null;
    }
    console.log('Initialized shaders.');
    return shaderProgram;
}

function main(){
    var canvas = document.querySelector('#glCanvas');
    var gl = canvas.getContext("webgl");
    
    if(!gl){
        alert("Unable to initialize WebGL.");
        return;
    }
    
    var shaderProgram = initShaderProgram(gl, vsSource, fsSource);
    var programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition : gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
            vertexColor : gl.getAttribLocation(shaderProgram, 'aVertexColor'),
            vertexNormal : gl.getAttribLocation(shaderProgram, 'aVertexNormal')
        },
        uniformLocations : {
            projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
            normalMatrix: gl.getUniformLocation(shaderProgram, 'uNormalMatrix'),
            viewMatrix: gl.getUniformLocation(shaderProgram, 'uViewMatrix')
        }
    };
    
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    var buffers = initBuffers(gl);
    var then = 0;
    var positions = [[0,0,-10]];
    function render(now){
        now *= 0.001;
        var dTime = now - then;
        then = now;
        slowCounter += .01;
        drawScene(gl, programInfo, buffers, dTime, positions);
//        positions[0][0] = (positions[0][0] - .0052);
//        positions[0][1] = (positions[0][1] - .52) % 100;
        requestAnimationFrame(render);
    }
    
    requestAnimationFrame(render);
}

main();