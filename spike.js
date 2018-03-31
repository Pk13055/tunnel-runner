/**
 * @author Pratik K
 * @description Primitive Spike for all basic shape building
 * @constructs Spike
 * @extends None
 * @param {gl} webGL instance
 * @param {Number} x coordinate
 * @param {Number} y coordinate
 * @param {Number} z coordinate
 * @param {Number} base base of the tunnel (X-Z)
 * @param {Number} height of the tunnel (Y)
 */
function Spike(gl, x, y, z, base, height, angle, stride) {


	/* Spike PROPERTIES */

	// Create a buffer for the Spike 's vertex positions.
	const positionBuffer = gl.createBuffer();
	// colorBuffer for the Spike's colors
	const colorBuffer = gl.createBuffer();
	// Build the element array buffer; this specifies the indices into the vertex arrays for each face's vertices.
    const indexBuffer = gl.createBuffer();
    var rotation = [0, 0, angle],
		size = [base, height, base],
        direction = (Math.random() > 0.5)? -1 : 1, // 1 -> CW -1 -> CCW
        stride = stride,
        ref_point = z,
		location = [x, y, z];
	var __rotation = [0, 0, 0];

	let init = () => {

		// Select the positionBuffer as the one to apply buffer operations to from here out.
		gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

		// Now create an array of positions for the Spike.
		const positions = [
            //  back face
            -base / 2, 0, base / 2,
            base / 2, 0, base / 2,
            0, height, 0,

            // front face
            -base / 2, 0, -base / 2,
            base / 2, 0, -base / 2,
            0, height, 0,

            // left face
            base / 2, 0, -base / 2,
            base / 2, 0, base / 2,
            0, height, 0,

            // right face
            -base / 2, 0, -base / 2,
            -base / 2, 0, base / 2,
            0, height, 0,
		];

		// Now pass the list of positions into WebGL to build the
		// shape. We do this by creating a Float32Array from the
		// JavaScript array, then use it to fill the current buffer.
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

		// Now set up the colors for the faces. We'll use solid colors for each face.
		const faceColors = [
			[1.0, 1.0, 0.0, 1.0], // Right face: yellow
			[1.0, 0.0, 0.0, 1.0], // Front face: red
			[1.0, 1.0, 1.0, 1.0], // Back face: white
			[1.0, 0.0, 1.0, 1.0], // Left face: purple
		];

		// Convert the array of colors into a table for all the vertices.
		var colors = [];
		for (var j = 0; j < faceColors.length; ++j)
    		colors = colors.concat(faceColors[1], [0.0, 0.0, 0.0, 1],
                faceColors[1]);

		gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

		// This array defines each face as two triangles, using the
		// indices into the vertex array to specify each triangle's
		// position.
		const indices = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 ];

		// Now send the element array to GL
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,
			new Uint16Array(indices), gl.STATIC_DRAW);

	};

	/**
	 * @param {gl} gl instance for the game
	 * @param {viewMatrix} mat4 4x4 matrix instance
	 * @param {projectionMatrix} mat4 4x4 matrix instance
	 * @param {programInfo} program information
	 */
	let draw = (gl, viewMatrix, projectionMatrix, programInfo) => {


		rotation.map((v, i, r) =>
			r[i] = ((r[i] < 0) ? -1 : 1) *
            (Math.abs(r[i]) % 360));

		__rotation[0] = rotation[0] * Math.PI / 180;
		__rotation[1] = rotation[1] * Math.PI / 180;
		__rotation[2] = rotation[2] * Math.PI / 180;

		var modelViewMatrix = mat4.create();
		// Now move the drawing position a bit to where we want to
		// start drawing the square.
		mat4.fromTranslation(modelViewMatrix, location);
		mat4.rotate(modelViewMatrix, modelViewMatrix, __rotation[2], [0, 0, 1]);
		mat4.rotate(modelViewMatrix, modelViewMatrix, __rotation[0], [1, 0, 0]);
		mat4.rotate(modelViewMatrix, modelViewMatrix, __rotation[1], [0, 1, 0]);
		modelViewMatrix = multiply(viewMatrix, modelViewMatrix);

		// Tell WebGL how to pull out the positions from the position
		// buffer into the vertexPosition attribute
		gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
		gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

		// Tell WebGL how to pull out the colors from the color buffer
		// into the vertexColor attribute.
		gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
		gl.vertexAttribPointer(programInfo.attribLocations.vertexColor, 4, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);

		// Tell WebGL which indices to use to index the vertices
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

		// Tell WebGL to use our program when drawing
		gl.useProgram(programInfo.program);

		// Set the shader uniforms
		gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
		gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);
		gl.drawElements(gl.TRIANGLES, 4 * 3, gl.UNSIGNED_SHORT, 0);

		return gl;
	}

	/**
	 * @param void
	 * @returns void
	 */
	let tick = () => {
        location[2] += direction * 1;
        if(Math.abs(location[2] - ref_point) > stride / 2) direction *= -1;
	};

	return {

		position: positionBuffer,
		color: colorBuffer,
		indices: indexBuffer,

		location: location,
		size: size,
		rotation: rotation,

		draw: draw,
		init: init,
		tick: tick,

	};

}