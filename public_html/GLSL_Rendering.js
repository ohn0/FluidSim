
var vSource = "\n\
\n\
\n\
\n\
attribute vec2 aPos;\n\
varying lowp vec4 vColor;\n\
void main(){\n\
\n\
gl_Position = aPos\n\
}";
var fSource = "\n\
\n\
void main(){\n\
gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n\
}";

function main() {
    var canvas = document.querySelector('#glCanvas');
    var gl = canvas.getContext("webgl");

    if(!gl){
        alert("Unable to initialize WebGL.");
        return;
    }
    
    var shaderProgram = initShaderProgram(gl, vSource, fSource);
    var programInfo = {
        program: shaderProgram
    };
    var positionBuffer = gl.createBuffer();
    
    
    var positions = [
        //First triangle
        -1.0, 1.0, 0.0,
        -1.0,-1.0, 0.0,
         1.0, 1.0, 0.0,
         //Second triangle
         1.0, 1.0, 0.0,
         1.0,-1.0, 0.0,
        -1.0,-1.0, 0.0
    ];
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, 
                  new Float32Array(positions),
                  gl.STATIC_DRAW);
                  
    return {
        position: positionBuffer
    };
    
}