/**
 * @author Pratik K
 * @description Primitive Cube for all basic shape building
 * @constructs Cube
 * @extends None
 * @param {gl} webGL instance
 * @param {Number} x coordinate
 * @param {Number} y coordinate
 * @param {Number} z coordinate
 * @param {Number} length length of the tunnel (X)
 * @param {Number} height of the tunnel (Y)
 * @param {Number} width of the tunnel (Z)
 */
function Cube(gl, x, y, z, length, height, width, angle) {


	/* CUBE PROPERTIES */

	// Create a buffer for the cube 's vertex positions.
	const positionBuffer = gl.createBuffer();
	// colorBuffer for the cube's colors
	const colorBuffer = gl.createBuffer();
	// Build the element array buffer; this specifies the indices into the vertex arrays for each face's vertices.
	const indexBuffer = gl.createBuffer();
	var rotation = [0, 0, angle],
		size = [length, height, width],
		location = [x, y, z];
	var __rotation = [0, 0, 0];

	let init = () => {

		// Select the positionBuffer as the one to apply buffer operations to from here out.
		gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

		// Now create an array of positions for the cube.
		const positions = [

			-length / 2, -height / 2, width / 2,
			length / 2, -height / 2, width / 2,
			length / 2, height / 2, width / 2, -length / 2, height / 2, width / 2,

			-length / 2, -height / 2, -width / 2, -length / 2, height / 2, -width / 2,
			length / 2, height / 2, -width / 2,
			length / 2, -height / 2, -width / 2,

			-length / 2, height / 2, -width / 2, -length / 2, height / 2, width / 2,
			length / 2, height / 2, width / 2,
			length / 2, height / 2, -width / 2,

			-length / 2, -height / 2, -width / 2,
			length / 2, -height / 2, -width / 2,
			length / 2, -height / 2, width / 2, -length / 2, -height / 2, width / 2,

			length / 2, -height / 2, -width / 2,
			length / 2, height / 2, -width / 2,
			length / 2, height / 2, width / 2,
			length / 2, -height / 2, width / 2,

			-length / 2, -height / 2, -width / 2, -length / 2, -height / 2, width / 2, -length / 2, height / 2, width / 2, -length / 2, height / 2, -width / 2,
		];

		// Now pass the list of positions into WebGL to build the
		// shape. We do this by creating a Float32Array from the
		// JavaScript array, then use it to fill the current buffer.
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

		// Now set up the colors for the faces. We'll use solid colors for each face.
		const faceColors = [
			[1.0, 1.0, 0.0, 0.7], // Right face: yellow
			[1.0, 0.0, 0.0, 0.7], // Front face: red
			[1.0, 1.0, 1.0, 0.7], // Back face: white
			[0.0, 1.0, 0.0, 0.7], // Top face: green
			[0.0, 0.0, 1.0, 0.7], // Bottom face: blue
			[1.0, 0.0, 1.0, 0.7], // Left face: purple
		];

		// Convert the array of colors into a table for all the vertices.
		var colors = [];
		for (var j = 0; j < faceColors.length; ++j)
			colors = colors.concat(faceColors[1], faceColors[3],
				faceColors[5], faceColors[4]);

		gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

		// This array defines each face as two triangles, using the
		// indices into the vertex array to specify each triangle's
		// position.
		const indices = [
			0, 1, 2, 0, 2, 3, // front
			4, 5, 6, 4, 6, 7, // back
			8, 9, 10, 8, 10, 11, // top
			12, 13, 14, 12, 14, 15, // bottom
			16, 17, 18, 16, 18, 19, // right
			20, 21, 22, 20, 22, 23, // left
		];

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
			(Math.abs(r[i]) % 360));;

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
		gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);

		return gl;
	}

	/**
	 * @param void
	 * @returns void
	 */
	let tick = () => {
		// cube specific tick
		// add potential spike here
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