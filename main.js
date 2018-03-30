/* GLOBAL VARIABLES */
const canvas = document.querySelector('#glcanvas');
const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

var speed = 0.5;
var tunnel = Tunnel(gl, 0, 0, 0, 4, 250, speed);
var paused = false;

var target = [tunnel.location[0], tunnel.location[1] - tunnel.size[0] + 0.1,
tunnel.location[2] - tunnel.size[2] / 3],
eye = [tunnel.location[0], tunnel.location[1], tunnel.location[2]];

/* INITIAL SETUP */
(function() {
    "use strict";
    // If we don't have a GL context, give up now
    if (!canvas) {
        alert("No canvas found");
    }

    if (!gl) {
        alert('Unable to initialize WebGL. Your browser or machine may not support it.');
        return;
    }

    // Vertex shader program
    const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying lowp vec4 vColor;

    void main(void) {
        gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
        vColor = aVertexColor;
    }
    `;

    // Fragment shader program
    const fsSource = `
    varying lowp vec4 vColor;
    void main(void) {
        gl_FragColor = vColor;
    }
    `;

    // Initialize a shader program; this is where all the lighting
    // for the vertices and so forth is established.
    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

    // Collect all the info needed to use the shader program.
    // Look up which attributes our shader program is using
    // for aVertexPosition, aVevrtexColor and also
    // look up uniform locations.
    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
            vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
        },
    };

    // Here's where we call the routine that builds all the
    // objects we'll be drawing.
    tunnel.init();

    // Initialize key events
    (function() {
        Mousetrap.bind(["p", "space"], () => {
            paused = !paused;
            if(paused) {
                alert("Game Paused");
                paused = false;
            }
            return false;
        });
        Mousetrap.bind(["left", "a"], () => { tunnel.rotation[2] += 36; return false; });
        Mousetrap.bind(["d", "right"], () => { tunnel.rotation[2] -= 36; return false; });

        Mousetrap.bind("r", () => { speed *= -1; tunnel.speed = speed; });

    }());

    // double the speed every 30 sec
    setInterval(() => { speed *= 2; }, 0.5 * 60 * 1000);

    var then = 0;

    // Draw the scene repeatedly
    function render(now) {
        now *= 0.001; // convert to seconds
        const deltaTime = now - then;

        if(!paused) {
            drawScene(gl, programInfo, deltaTime);
            tick_elements();
            detect_collision();
        }

        then = now;

        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}());


/**
 * @description Detects collisions between the eye and various targets.
 */
function detect_collision() {

}

/**
 * @description Ticks the eye and target as well as
 * any another base elements.
 */
function tick_elements() {

    // tick camera
    eye[2] -= speed;
    target[2] -= speed;

    // tick all children
    tunnel.tick(eye);
}

/**
 * @description Resizes the canvas on window change
 * @param {HTML} canvas
 */
function resize(canvas) {
    // Lookup the size the browser is displaying the canvas.
    var displayWidth  = canvas.clientWidth;
    var displayHeight = canvas.clientHeight;

    // Check if the canvas is not the same size.
    if (canvas.width  != displayWidth ||
        canvas.height != displayHeight) {

      // Make the canvas the same size
      canvas.width  = displayWidth;
      canvas.height = displayHeight;
    }
  }

/**
 *
 * @param {webGL} gl
 * @param {JSON} programInfo
 * @param {Number} deltaTime
 * @description redraws the scene
 */
function drawScene(gl, programInfo, deltaTime) {
    resize(gl.canvas);
    gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
    gl.clearDepth(1.0); // Clear everything
    gl.enable(gl.DEPTH_TEST); // Enable depth testing
    gl.depthFunc(gl.LEQUAL); // Near things obscure far things

    // Clear the canvas before we start drawing on it.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Create a perspective matrix, a special matrix that is
    // used to simulate the distortion of perspective in a camera.
    // Our field of view is 45 degrees, with a width/height
    // ratio that matches the display size of the canvas
    // and we only want to see objects between 0.1 units
    // and 100 units away from the camera.

    const fieldOfView = 45 * Math.PI / 180; // in radians
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 200.0;

    const projectionMatrix = mat4.create();

    // note: glmatrix.js always has the first argument
    // as the destination to receive the result.
    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

    // Set the drawing position to the "identity" point, which is
    // the center of the scene.
    var modelViewMatrix = mat4.create();

    mat4.lookAt(modelViewMatrix, eye, target, [0,1,0]);

    gl = tunnel.draw(gl, modelViewMatrix, projectionMatrix, programInfo);

}


/**
 *
 * @description Initialize a shader program, so WebGL knows how to draw our data
 * @param {webGL} gl
 * @param {template} vsSource
 * @param {template} fsSource
 */
function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    // Create the shader program

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // If creating the shader program failed, alert

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    return shaderProgram;
}


/**
 * @description creates a shader of the given type, uploads the source and
 * compiles it.
 * @param {welGL} gl
 * @param {String} type
 * @param {template} source
 */
function loadShader(gl, type, source) {
    const shader = gl.createShader(type);

    // Send the source to the shader object

    gl.shaderSource(shader, source);

    // Compile the shader program

    gl.compileShader(shader);

    // See if it compiled successfully

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}