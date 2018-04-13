/**
 * @author Pratik K
 * @description Primitive octagon ma out of cubes
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
function Tunnel(gl, x, y, z, radius, length, speed = 0.01, elements = 25) {

    /* TUNNEL Properties */
    var rotation = [0, 0, 0],
        location = [x, y, z],
        radius = radius,
        length = length,
        size = [radius, radius, length],
        speed = speed || 0.01;
    var __rotation = [0, 0, 0];
    // array that will store all the octagons
    var octagons = [];

    let init = () => {
        let no_eles = elements,
            no_pillars = Math.round(no_eles * 0.05);
            no_spikes = Math.round(no_eles * 0.1);
            interval = length / no_eles;
        for (let i = 0, cur_z = 0; i < no_eles; i++, cur_z += interval) {
            let oct = Octagon(gl, 0, 0, -cur_z, radius, interval, speed);
            oct.init();
            let is_chance = Math.random() < 0.5;
            if(is_chance && no_pillars) { oct.add_pillar(); no_pillars--; }
            else if(is_chance && no_spikes) { oct.add_spike(); no_spikes--; }

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
    let draw = (gl, viewMatrix, projectionMatrix, programInfo, texture) => {

        rotation.map((v, i, r) => r[i] = ((r[i] < 0) ? -1 : 1) * (Math.abs(r[i]) % 360));

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
            gl = cur_oct.draw(gl, modelViewMatrix, projectionMatrix, programInfo, textures);
        });

        return gl;
    };

    /**
     *
     * @param {Array} eye
     */
    let tick = (eye) => {
        let buf_oct_no = 3;
        for (let i = 0; i < octagons.length; i++)
            if (Math.abs(octagons[0].location[2] - eye[2]) >
                buf_oct_no * octagons[0].size[2]) {
                let old_octagon = octagons.shift()

                // Append to the start
                old_octagon.location[2] = octagons[octagons.length - 2].location[2] - old_octagon.size[2];
                octagons.push(old_octagon);
                i++;
            }
        octagons.forEach(function (cur_oct, cur_idx) {
            cur_oct.tick();
        });
    };

    /**
     * @param {Array} eye
      */
    let detect_collision = (eye) => {
        let status = false;
        octagons.forEach((v, i) => {
            status = status || v.detect_collision(eye);
        });
        return status;
    };

    return {
        location: location,
        size: size,
        rotation: rotation,
        detect_collision: detect_collision,
        draw: draw,
        init: init,
        tick: tick,
    }
}