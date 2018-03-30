/**
 * @author Pratik K
 * @description Primitive octagon made out of cubes
 * @constructs Octagon
 * @extends Cube
 * @param {gl} webGL instance
 * @param {Number} x  coordinate
 * @param {Number} y  coordinate
 * @param {Number} z  coordinate
 * @param {Number} radius of the tunnel (X-Y)
 * @param {Number} width of the tunnel (Z)
 * @param {Number} speed of the tunnel (in Z)
 */
function Octagon(gl, x, y, z, radius, width, speed) {
    /* Octagon PROPERTIES */

    var rotation = [0, 0, 0],
        size = [radius, radius, width],
        location = [x, y, z],
        speed = speed || 0.01;
    var __rotation = [0, 0, 0];
    // array that will store all the sides
    var faces = [];

    let init = () => {
        let no_faces = 8,
            angle = 0,
            per_side = 360 / 8;
        for (let i = 0; i < no_faces; i++) {
            let cur_angle = angle * Math.PI / 180;
            let cur_face = Cube(gl, radius * Math.cos(cur_angle),
                radius * Math.sin(cur_angle), 0,
                2 * radius * Math.tan(per_side * Math.PI / 360), 0.1, width, angle + 90);

            cur_face.init();
            // cur_face.rotation = [0, 0, angle + 90]; // initial skewed
            faces.push(cur_face);
            angle += per_side;

        }
    };


    /**
     * @param {gl} gl instance for the game
     * @param {mat4} viewMatrix 4x4 matrix instance
     * @param {mat4} projectionMatrix 4x4 matrix instance
     * @param {JSON} programInfo information
     * @returns {gl} gl instance
     */
    let draw = (gl, viewMatrix, projectionMatrix, programInfo) => {

        rotation.map((v, i, r) => r[i] -= (r[i] > 360) ? 360 : 0);
        rotation.map((v, i, r) => r[i] += (r[i] < -360) ? 360 : 0);

        __rotation[0] = rotation[0] * Math.PI / 180;
        __rotation[1] = rotation[1] * Math.PI / 180;
        __rotation[2] = rotation[2] * Math.PI / 180;

        var modelViewMatrix = mat4.create();
        mat4.fromTranslation(modelViewMatrix, location);
        mat4.rotate(modelViewMatrix, modelViewMatrix, __rotation[2], [0, 0, 1]);
        mat4.rotate(modelViewMatrix, modelViewMatrix, __rotation[0], [1, 0, 0]);
        mat4.rotate(modelViewMatrix, modelViewMatrix, __rotation[1], [0, 1, 0]);
        modelViewMatrix = multiply(viewMatrix, modelViewMatrix);

        faces.forEach(function (cur_face, cur_index) {
            gl = cur_face.draw(gl, modelViewMatrix, projectionMatrix, programInfo);
        });

        return gl;
    };

    let tick = () => {
        faces.forEach(function (face, i) {
            face.tick();
        });
    };

    return {
        location: location,
        size: size,
        rotation: rotation,

        draw: draw,
        init: init,
        tick: tick,
    };
}