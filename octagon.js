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
        has_pillar = 0,
        has_spike = 0,
        radius = radius,
        width = width,
        speed = speed || 0.01;
    var __rotation = [0, 0, 0];
    // array that will store all the sides
    var faces = [];
    var spikes = [];

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

        rotation.map((v, i, r) =>
            r[i] = ((r[i] < 0) ? -1 : 1) *
            (Math.abs(r[i]) % 360));;

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

        spikes.forEach(function (cur_spike, cur_index) {
            gl = cur_spike.draw(gl, modelViewMatrix, projectionMatrix, programInfo);
        });

        return gl;
    };

    let tick = () => {
        faces.forEach(function (face, i) {
            face.tick();
        });
        spikes.forEach(function(spike, i) {
            spike.tick();
        });
    };

    let add_pillar = () => {
        has_pillar++;
        pillar = Cube(gl, 0, 0, 0,
            Math.random() * 2 * radius * Math.tan(Math.PI / 8),
        2 * radius, width / 5, Math.round(Math.random()) * 360 / 8);
        pillar.toggle_pillar();
        pillar.init();
        faces.push(pillar);
    }

    let add_spike = () => {
        let angle = 0, per_side = 360 / 8, total_spikes = 2;
        for (let i = 0; i < 8; i++) {
            let cur_angle = angle * Math.PI / 180;
            if(Math.random() > 3 / 8 && total_spikes) {
                has_spike++;
                total_spikes--;
                let cur_spike = Spike(gl, radius * Math.cos(cur_angle),
                radius * Math.sin(cur_angle), - width / 2,
                2 * radius * Math.tan(per_side * Math.PI / 360), radius / 2
                + Math.random() * radius / 2, cur_angle - 90, size[2]);
                cur_spike.init();
                spikes.push(cur_spike);
            }
            angle += per_side;
        }
    }

    return {
        location: location,
        size: size,
        rotation: rotation,

        draw: draw,
        init: init,
        tick: tick,

        add_pillar: add_pillar,
        has_pillar: has_pillar,

        add_spike: add_spike,
        has_spike: has_spike,
    };
}