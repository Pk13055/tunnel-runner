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
function Tunnel(gl, x, y, z, radius, length, speed = 0.01) {

    /* TUNNEL Properties */
    var rotation = [0, 0, 0],
        location = [x, y, z],
        size = [radius, radius, length],
        speed = speed || 0.01;
    var __rotation = [0, 0, 0];
    // array that will store all the octagons
    var octagons = [];

    let init = () => {
        let no_eles = 25,
            interval = length / no_eles;
        for (let i = 0, cur_z = 0; i < no_eles; i++, cur_z += interval) {
            let oct = Octagon(gl, 0, 0, -cur_z, radius, interval, speed);
            oct.init();
            octagons.push(oct);
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

        octagons.forEach(function (cur_oct, cur_index) {
            gl = cur_oct.draw(gl, modelViewMatrix, projectionMatrix, programInfo);
        });

        return gl;
    };

    let tick = () => {
        location[2] -= speed;
        rotation[2] += 1;
        octagons.forEach(function (cur_oct, cur_idx) {
            cur_oct.tick();
        });
    };

    return {
        location: location,
        size: size,
        rotation: rotation,

        draw: draw,
        init: init,
        tick: tick,
    }
}