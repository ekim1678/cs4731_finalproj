//Created by Ethan Busa, Zack Robinson, & Ellie Kim

//Extra credit features: acceleration on guillotine blade, reset animation for guillotine, and a delay on the sphere with reference to the blade

let canvas;
let gl;
let program;

let leftLoad = false;
let mouthLoad = false;
let rightLoad = false;
let hairLoad = false;
let foreheadLoad = false;
let fronthairLoad = false;
let bankLoad = false;
let landscapeLoad = false;
let treeLoad = false;
let floorLoad = false;
let skyLoad = false;
let smokeLoad = false;

let pointsArray = [];
let normalsArray = [];
let texCoordsArray = [];

let pointsArraySphere = [];
let pointsArraySphereRoot = [];
let pointsArrayCube = [];

var sphereCubeMap;
var texMap;
let frameVertices = [];
let frameNormals = [];

let bladeVertices = [];
let bladeNormals = [];

let frameMinY = 0.0;
let frameMaxY = 0.0;
let bladeOffsetY = 0.0;
let bladeStartY = 0.0;
let bladeEndY = 0.0;

let animating = false;
let bladeDir = -1;
let bladeSpeed = 2.0;

let sphere1StartY = -3.5;
let sphere1OffsetY = sphere1StartY;
let sphereSpeed = 16.0;

let lastTime = 0.0;
let headsRolling = false;

let treeRoot;

let cameraMatrixLoc, cameraInverseMatrixLoc;
let vTexCoord, vNormal, vPosition;
let cameraMatrix;

let useSpecular = true;
let useDiffuse = true;
let useShadow = true;

let eye = vec3(3, 2, 6);
let at = vec3(0.0, 0.0, 0.0);
let up = vec3(0.0, 1.0, 0.0);
let yaw = 10.0;
let pitch = -0.2;


function quad(a, b, c, d) {
    let minT = 0.0;
    let maxT = 1.0;

    let texCoord = [
        vec2(minT, minT),
        vec2(minT, maxT),
        vec2(maxT, maxT),
        vec2(maxT, minT)
    ];

    let vertices = [
        vec4( -0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5,  0.5,  0.5, 1.0 ),
        vec4( 0.5,  0.5,  0.5, 1.0 ),
        vec4( 0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5, -0.5, -0.5, 1.0 ),
        vec4( -0.5,  0.5, -0.5, 1.0 ),
        vec4( 0.5,  0.5, -0.5, 1.0 ),
        vec4( 0.5, -0.5, -0.5, 1.0 )
    ];

    pointsArray.push(vertices[a]);
    texCoordsArray.push(texCoord[0]);

    pointsArray.push(vertices[b]);
    texCoordsArray.push(texCoord[1]);

    pointsArray.push(vertices[c]);
    texCoordsArray.push(texCoord[2]);

    pointsArray.push(vertices[a]);
    texCoordsArray.push(texCoord[0]);

    pointsArray.push(vertices[c]);
    texCoordsArray.push(texCoord[2]);

    pointsArray.push(vertices[d]);
    texCoordsArray.push(texCoord[3]);
}

function colorCube()
{
    // Note the vertex order. This is important
    // to ensure our texture is oriented correctly
    // when it's mapped to the cube.
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 0, 4, 7, 3);
    quad( 5, 1, 2, 6 );
    quad( 6, 7, 4, 5 );
    quad( 5, 4, 0, 1 );
}

function configureDefaultSkyboxCubeMap() {
    gl.activeTexture(gl.TEXTURE4);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texMap);

    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    let blue = new Uint8Array([0, 0, 255, 255]);

    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, blue);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, blue);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, blue);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, blue);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, blue);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, blue);

    gl.uniform1i(gl.getUniformLocation(program, "texMap"), 4);
}

function configureDefaultCubeMapSphere() {
    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, sphereCubeMap);

    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    let red = new Uint8Array([255, 0, 0, 255]);

    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, red);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, red);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, red);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, red);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, red);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, red);

    gl.uniform1i(gl.getUniformLocation(program, "texSphereMap"), 3);
}

function configureCubeMapSphere() {
    gl.activeTexture(gl.TEXTURE3);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, sphereCubeMap);

    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    gl.uniform1i(gl.getUniformLocation(program, "texSphereMap"), 3);
}

function configureSkyboxCubeMap() {
    gl.activeTexture(gl.TEXTURE4);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texMap);

    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    gl.uniform1i(gl.getUniformLocation(program, "texMap"), 4);
}

function configureDefaultTexture() {

    let tex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        2,
        2,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        new Uint8Array([0, 0, 255, 255, 255, 0, 0, 255, 0, 0, 255, 255, 0, 255, 0, 255])
    );

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    gl.uniform1i(gl.getUniformLocation(program, "tex1"), 0);
}

function configureDefaultSphereTexture() {

    let tex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, tex);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        2,
        2,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        new Uint8Array([0, 0, 255, 255, 255, 0, 0, 255, 0, 0, 255, 255, 0, 255, 0, 255])
    );

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    gl.uniform1i(gl.getUniformLocation(program, "tex2"), 0);
}

function triangle(a, b, c) {

     pointsArray.push(a);
     pointsArray.push(b);
     pointsArray.push(c);

     // We can only do this with a unit object
     // centered at the origin
     normalsArray.push(a[0],a[1], a[2], 0.0);
     normalsArray.push(b[0],b[1], b[2], 0.0);
     normalsArray.push(c[0],c[1], c[2], 0.0);
}

function divideTriangle(a, b, c, count) {
    if ( count > 0 ) {

        let ab = mix( a, b, 0.5);
        let ac = mix( a, c, 0.5);
        let bc = mix( b, c, 0.5);

        ab = normalize(ab, true);
        ac = normalize(ac, true);
        bc = normalize(bc, true);

        divideTriangle( a, ab, ac, count - 1 );
        divideTriangle( ab, b, bc, count - 1 );
        divideTriangle( bc, c, ac, count - 1 );
        divideTriangle( ab, bc, ac, count - 1 );
    }
    else {
        triangle( a, b, c );
    }
}

function tetrahedron(n) {
    let a = vec4(0.0, 0.0, -1.0,1);
    let b = vec4(0.0, 0.942809, 0.333333, 1);
    let c = vec4(-0.816497, -0.471405, 0.333333, 1);
    let d = vec4(0.816497, -0.471405, 0.333333,1);

    divideTriangle(a, b, c, n);
    divideTriangle(d, c, b, n);
    divideTriangle(a, d, b, n);
    divideTriangle(a, c, d, n);
}

function checkSkyboxLoad(){
    return bankLoad && treeLoad && skyLoad && floorLoad && smokeLoad && landscapeLoad;
}


function checkSphereLoad(){
    return leftLoad && hairLoad && rightLoad && mouthLoad && fronthairLoad && foreheadLoad;
}

async function loadObjects(path, vertices, normals) {
    const request = await fetch(path, { mode: "cors"});
    const text = await request.text();
    const lines = text.split('\n');

    const tempVertices = [];
    const tempNormals = [];

    for (let line of lines) {
        line = line.trim();

        if (line.startsWith('v ')) {
            const parts = line.split(/\s+/);
            tempVertices.push(vec4(parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3]), 1.0));
        }
        if (line.startsWith('vn ')) {
            const parts = line.split(/\s+/);
            tempNormals.push(vec4(parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3]), 0.0));
        }
        if (line.startsWith('f ')) {
            const parts = line.split(/\s+/);
            for (let i = 1; i <= 3; i++) {
                const indices = parts[i].split('/');
                const vertexIndex = parseInt(indices[0]) - 1;
                const normalIndex = parseInt(indices[2]) - 1;

                vertices.push(tempVertices[vertexIndex]);
                normals.push(tempNormals[normalIndex]);
            }
        }
    }
}

function rotateVertices90Degrees(vertices) {
    for (let i = 0; i < vertices.length; i++) {
        let x = vertices[i][0];
        let y = vertices[i][1];
        let z = vertices[i][2];
        vertices[i] = vec4(x, -z, y, 1.0);
    }
}

function centerModel(vertices) {
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;

    for (let vert of vertices) {
        minX = Math.min(minX, vert[0]);
        minY = Math.min(minY, vert[1]);
        minZ = Math.min(minZ, vert[2]);

        maxX = Math.max(maxX, vert[0]);
        maxY = Math.max(maxY, vert[1]);
        maxZ = Math.max(maxZ, vert[2]);
    }

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const centerZ = (minZ + maxZ) / 2;

    for (let i = 0; i < vertices.length; i++) {
        vertices[i] = vec4(vertices[i][0] - centerX, vertices[i][1] - centerY, vertices[i][2] - centerZ, 1.0);
    }

    return {
        minY: minY - centerY,
        maxY: maxY - centerY
    };
}

function loadTextures(){
    //Load the image for sphere
    let leftEar = new Image();
    leftEar.crossOrigin = "";
    leftEar.src = "https://ekim1678.github.io/personal-website/resources/computergraphicstextures/leftear.jpg"
    leftEar.onload = function () {
        gl.activeTexture(gl.TEXTURE3);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, sphereCubeMap);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, leftEar);
        leftLoad = true;
        if(checkSphereLoad()){configureCubeMapSphere()}
    }
    let mouth = new Image();
    mouth.crossOrigin = "";
    mouth.src = "https://ekim1678.github.io/personal-website/resources/computergraphicstextures/mouth.jpg"
    mouth.onload = function () {
        gl.activeTexture(gl.TEXTURE3);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, sphereCubeMap);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, mouth);
        mouthLoad = true;
        if(checkSphereLoad())configureCubeMapSphere();
    }
    let rightEar = new Image();
    rightEar.crossOrigin = "";
    rightEar.src = "https://ekim1678.github.io/personal-website/resources/computergraphicstextures/rightear.jpg"
    rightEar.onload = function () {
        gl.activeTexture(gl.TEXTURE3);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, sphereCubeMap);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, rightEar);
        rightLoad = true;
        if(checkSphereLoad())configureCubeMapSphere();
    }
    let hair = new Image();
    hair.crossOrigin = "";
    hair.src = "https://ekim1678.github.io/personal-website/resources/computergraphicstextures/hairtex.jpg"
    hair.onload = function () {
        gl.activeTexture(gl.TEXTURE3);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, sphereCubeMap);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, hair);
        hairLoad = true;
        if(checkSphereLoad())configureCubeMapSphere();
    }
    let forehead = new Image();
    forehead.crossOrigin = "";
    forehead.src = "https://ekim1678.github.io/personal-website/resources/computergraphicstextures/forehead.jpg"
    forehead.onload = function () {
        gl.activeTexture(gl.TEXTURE3);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, sphereCubeMap);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, forehead);
        foreheadLoad = true;
        if(checkSphereLoad())configureCubeMapSphere();
    }
    let fronthair = new Image();
    fronthair.crossOrigin = "";
    fronthair.src = "https://ekim1678.github.io/personal-website/resources/computergraphicstextures/fronthair.jpg"
    fronthair.onload = function () {
        gl.activeTexture(gl.TEXTURE3);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, sphereCubeMap);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, fronthair);
        fronthairLoad = true;
        if(checkSphereLoad())configureCubeMapSphere();
    }

    //skybox textures
    let bank = new Image();
    bank.crossOrigin = "";
    bank.src = "https://ekim1678.github.io/personal-website/resources/computergraphicstextures/bank.jpg"
    bank.onload = function () {
        gl.activeTexture(gl.TEXTURE4);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, texMap);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, bank);
        bankLoad = true;
        if(checkSkyboxLoad())configureSkyboxCubeMap();
    }

    let landscape = new Image();
    landscape.crossOrigin = "";
    landscape.src = "https://ekim1678.github.io/personal-website/resources/computergraphicstextures/landscape.jpg"
    landscape.onload = function () {
        gl.activeTexture(gl.TEXTURE4);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, texMap);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, landscape);
        landscapeLoad = true;
        if(checkSkyboxLoad())configureSkyboxCubeMap();
    }

    let tree = new Image();
    tree.crossOrigin = "";
    tree.src = "https://ekim1678.github.io/personal-website/resources/computergraphicstextures/tree.jpg"
    tree.onload = function () {
        gl.activeTexture(gl.TEXTURE4);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, texMap);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, tree);
        treeLoad = true;
        if(checkSkyboxLoad())configureSkyboxCubeMap();
    }

    let smoke = new Image();
    smoke.crossOrigin = "";
    smoke.src = "https://ekim1678.github.io/personal-website/resources/computergraphicstextures/smoke.jpg"
    smoke.onload = function () {
        gl.activeTexture(gl.TEXTURE4);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, texMap);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, smoke);
        smokeLoad = true;
        if(checkSkyboxLoad())configureSkyboxCubeMap();
    }

    let sky = new Image();
    sky.crossOrigin = "";
    sky.src = "https://ekim1678.github.io/personal-website/resources/computergraphicstextures/sky.jpg"
    sky.onload = function () {
        gl.activeTexture(gl.TEXTURE4);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, texMap);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, sky);
        skyLoad = true;
        if(checkSkyboxLoad())configureSkyboxCubeMap();
    }

    let floor = new Image();
    floor.crossOrigin = "";
    floor.src = "https://ekim1678.github.io/personal-website/resources/computergraphicstextures/floor.jpg"
    floor.onload = function () {
        gl.activeTexture(gl.TEXTURE4);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, texMap);
        gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, floor);
        floorLoad = true;
        if(checkSkyboxLoad())configureSkyboxCubeMap();
    }
}

//hierarchy structure
function Tree(root) {
    this.root = root;
}

function Node(sphere, modelMatrix) {
    this.sphere = sphere;
    this.modelMatrix = modelMatrix;
    this.children = [];
}

function addChild(node, child){
    node.children.push(child);
}

//transformation functions for hierarchy model
function transformChildren(node){
    node.children.forEach(child=>{
        child.modelMatrix = mult(child.modelMatrix, node.modelMatrix);
        child.children.forEach(subNode=>{
            subNode.modelMatrix = mult(subNode.modelMatrix, child.modelMatrix);
        })
    })
}

function transformNode(node, transMatrix){
    node.modelMatrix = mult(node.modelMatrix, transMatrix);
    transformChildren(node);
}

window.onload = async function init() {

    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas, null );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Sphere vertices
    tetrahedron(5);
    pointsArraySphere = pointsArray;
    pointsArraySphereRoot = pointsArray;
    // Particle vertices
    //we want particles to be smaller than the standard sphere array
    let particleRoot = new Node(pointsArraySphereRoot, scalem(0.5, 0.5, 0.5));
    for(let i = 0; i < 3;  i++){
        let childNode = new Node(pointsArraySphereRoot, scalem(0.5, 0.5, 0.5));
        addChild(particleRoot, childNode);
    }
    treeRoot = new Tree(particleRoot);
/*    for(let children = 0; children < particleRoot.children.length; children++){
        let grandchildNode = Node(tetrahedron(5), scalem(0.5, 0.5, 0.5));
    }*/

    pointsArray = [];

    // Cube vertices
    colorCube();
    pointsArrayCube = pointsArray;

    // Camera matrix stuff
    cameraMatrixLoc = gl.getUniformLocation( program, "cameraMatrix" );
    cameraInverseMatrixLoc = gl.getUniformLocation( program, "cameraInverseMatrix" );

    // Projection matrix
    let projectionMatrixLoc = gl.getUniformLocation( program, "projectionMatrix" );
    let projectionMatrix = perspective(90, 1, 0.1, 100);
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    //loading objects
    await loadObjects("https://raw.githubusercontent.com/BlackhawkF8/files/refs/heads/main/top.obj", frameVertices, frameNormals);
    await loadObjects("https://raw.githubusercontent.com/BlackhawkF8/files/refs/heads/main/knife.obj", bladeVertices, bladeNormals);

    rotateVertices90Degrees(frameVertices);
    rotateVertices90Degrees(bladeVertices);

    const frameBounds = centerModel(frameVertices);
    const bladeBounds = centerModel(bladeVertices);

    let scaleValue = 0.05;

    for (let i = 0; i < frameVertices.length; i++) {
        frameVertices[i] = vec4(
            frameVertices[i][0] * scaleValue,
            frameVertices[i][1] * scaleValue,
            frameVertices[i][2] * scaleValue,
            1.0
        );
    }

    for (let i = 0; i < bladeVertices.length; i++) {
        bladeVertices[i] = vec4(
            bladeVertices[i][0] * scaleValue,
            bladeVertices[i][1] * scaleValue,
            bladeVertices[i][2] * scaleValue,
            1.0
        );
    }

    frameMinY = frameBounds.minY * scaleValue;
    frameMaxY = frameBounds.maxY * scaleValue;

    let bladeMinY = bladeBounds.minY * scaleValue;
    let bladeMaxY = bladeBounds.maxY * scaleValue;

    bladeStartY = frameMaxY - bladeMaxY;
    bladeEndY = frameMinY + bladeMinY + 2.75;
    bladeOffsetY = bladeStartY;

    // Lighting stuff
    let lightPosition = vec4(1.5, 1.5, 3.0, 1.0);
    let lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
    let lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
    let lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

    let materialAmbient = vec4(1.0, 0.0, 1.0, 1.0);
    let materialDiffuse = vec4(1.0, 0.8, 0.0, 1.0);
    let materialSpecular = vec4(1.0, 1.0, 1.0, 1.0);
    let materialShininess = 20.0;

    let ambientProduct = mult(lightAmbient, materialAmbient);
    let diffuseProduct = mult(lightDiffuse, materialDiffuse);
    let specularProduct = mult(lightSpecular, materialSpecular);

    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"), flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), flatten(specularProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition));
    gl.uniform1f(gl.getUniformLocation(program, "shininess"), materialShininess);

    //spotlight
    let spotlightPosition = vec4(3.0, 0.0, 0.0, 1.0);
    let spotDirection = vec3(0.0, 0.0, 0.0);
    let spotCutoff = Math.cos(radians(25.0));
    let spotColor = vec4(1.0, 1.0, 1.0, 1.0);

    gl.uniform3fv(gl.getUniformLocation(program, "spotDirection"), flatten(spotDirection));
    gl.uniform1f(gl.getUniformLocation(program, "spotCutoff"), spotCutoff);
    gl.uniform4fv(gl.getUniformLocation(program, "spotColor"), flatten(spotColor));
    gl.uniform4fv(gl.getUniformLocation(program, "spotlightPosition"), flatten(spotlightPosition));

    sphereCubeMap = gl.createTexture();
    texMap = gl.createTexture();

    // Default textures
    configureDefaultTexture();
    configureDefaultSphereTexture();
    configureDefaultSkyboxCubeMap();
    configureDefaultCubeMapSphere();
    //Load non-default textures
    loadTextures();

    // Texture coordinates
    let tBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, tBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW );

    vTexCoord = gl.getAttribLocation( program, "vTexCoord" );
    gl.vertexAttribPointer( vTexCoord, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vTexCoord );

    // Normals
    let nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );

    vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);

    // We don't need to re-enable vPosition every time we want to use it,
    // so we'll just enable it once for better performance
    vPosition = gl.getAttribLocation( program, "vPosition");
    gl.enableVertexAttribArray(vPosition);

    // Model transformation matrix for the skybox.
    // Since the matrix for the sphere is just the
    // identity matrix, we ignore it in our shader code
    let modelMatrix = scalem(20, 20, 20);
    let modelMatrixLoc = gl.getUniformLocation( program, "modelMatrix" );
    gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));

    window.addEventListener("keydown", (event) => {
        if (event.key === "k" || event.key === "K") {
            if(animating){
                //bladeOffsetY = bladeStartY;
                bladeSpeed = 150.0;
                bladeDir = 1;
            }
            else{
                animating = true;
                bladeSpeed = 2.0;
                bladeDir = -1;
                sphere1OffsetY = sphere1StartY;
            }
        }
        let rotSpeed = 0.03;
        if (event.key === "ArrowLeft"){
            yaw += rotSpeed;
        }
        if (event.key === "ArrowRight"){
            yaw -= rotSpeed;
        }
        if (event.key === "ArrowUp"){
            pitch += rotSpeed;
        }
        if (event.key === "ArrowDown"){
            pitch -= rotSpeed;
        }
        let maxPitch = Math.PI/2 - 0.01;
        pitch = Math.max(-maxPitch, Math.min(maxPitch, pitch));
        if (event.key === "l" || event.key === "L"){
            useSpecular = !useSpecular;
        }
        if (event.key === "o" || event.key === "O"){
            useDiffuse = !useDiffuse;
        }
        if(event.key === "s" || event.key === "S"){
            useShadow = !useShadow;
        }
    });
    lastTime = performance.now();

    render();
}

function drawObject(vertices, normals, modelMatrix, isBlade) {

    let mat = mult(cameraMatrix, modelMatrix);
    gl.uniform1i(gl.getUniformLocation(program, "isSkybox"), 0);
    gl.uniform1i(gl.getUniformLocation(program, "isSphere"), 0);
    gl.uniform1i(gl.getUniformLocation(program, "isShadow"), 0);
    if(isBlade){
        gl.uniform1i(gl.getUniformLocation(program, "isBlade"), 1);
    }
    else{
        gl.uniform1i(gl.getUniformLocation(program, "isBlade"), 0);
    }

    gl.uniformMatrix4fv(cameraMatrixLoc, false, flatten(mat));
    const vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLES, 0, vertices.length);

    if(useShadow){
        gl.uniform1i(gl.getUniformLocation(program, "isShadow"), 1);
        //point light is a vec4 (1.5, 1.5, 3.0, 1.0)
        let shadowMatrix = mult(mat, translate(-1.5, -1.5, -3.0));
        shadowMatrix = mult(translate(1.5, 1.5, 3.0), shadowMatrix);

        gl.uniformMatrix4fv(cameraMatrixLoc, false, flatten(shadowMatrix));
        const vBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
        gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLES, 0, vertices.length);
    }
}

function pushUniformMatrix(data, uniformName) {
    let uniformLoc = gl.getUniformLocation(program, uniformName);
    gl.uniformMatrix4fv(uniformLoc, false, flatten(data));
}

function drawSphere() {
    //rotate on x axis so texture shows better
    let rotMatrix = rotateX(-50);
    pushUniformMatrix(rotMatrix, "rotSphereMatrix");
    gl.disableVertexAttribArray(vTexCoord);
    gl.enableVertexAttribArray( vNormal);

    gl.uniform1i(gl.getUniformLocation(program, "isSkybox"), 0);
    gl.uniform1i(gl.getUniformLocation(program, "isSphere"), 1);
    gl.uniform1i(gl.getUniformLocation(program, "isBlade"), 0);
    gl.uniform1i(gl.getUniformLocation(program, "isShadow"), 0);

    let vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArraySphere), gl.STATIC_DRAW);
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);

    gl.drawArrays( gl.TRIANGLES, 0, pointsArraySphere.length );
}


function drawTree(tree) {
    drawParticles(tree.root);
}

function drawParticles(sphere)
{
    //color should be red
    let color = new Uint8Array([255, 0, 0, 255]);

    gl.uniform1i(gl.getUniformLocation(program, "isSkybox"), 0);
    gl.uniform1i(gl.getUniformLocation(program, "isSphere"), 0);
    gl.uniform1i(gl.getUniformLocation(program, "isBlade"), 0);
    gl.uniform1i(gl.getUniformLocation(program, "isShadow"), 0);

    let vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(sphere), gl.STATIC_DRAW);
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);


    gl.drawArrays( gl.TRIANGLES, 0, sphere.length);

}


function drawSkybox() {
    gl.enableVertexAttribArray(vTexCoord);
    gl.disableVertexAttribArray(vNormal);

    gl.uniform1i(gl.getUniformLocation(program, "isSkybox"), 1);
    gl.uniform1i(gl.getUniformLocation(program, "isSphere"), 0);
    gl.uniform1i(gl.getUniformLocation(program, "isBlade"), 0);
    gl.uniform1i(gl.getUniformLocation(program, "isShadow"), 0);

    let vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArrayCube), gl.STATIC_DRAW);
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);

    gl.drawArrays( gl.TRIANGLES, 0, pointsArrayCube.length );
}


let alpha = 0;

function render() {
    if(!(checkSkyboxLoad() && checkSphereLoad())){
        requestAnimFrame(render);
        return;
    }

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    let lightPosition = vec4(1.5, 1.5, 3.0, 1.0);
    let lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);

    let materialAmbient = vec4(1.0, 0.0, 1.0, 1.0);
    let materialShininess = 20.0;

    let ambientProduct = mult(lightAmbient, materialAmbient);

    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"), flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition));
    gl.uniform1f(gl.getUniformLocation(program, "shininess"), materialShininess);
    let specularProduct = vec4(0.0,0.0,0.0,0.0);
    if(useSpecular) {
        let lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);
        let materialSpecular = vec4(1.0, 1.0, 1.0, 1.0);
        specularProduct = mult(lightSpecular, materialSpecular);

    }
    let diffuseProduct = vec4(0.0,0.0,0.0,0.0);
    if(useDiffuse){
        let lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
        let materialDiffuse = vec4(1.0, 0.8, 0.0, 1.0);
        diffuseProduct = mult(lightDiffuse, materialDiffuse);

    }
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), flatten(specularProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct));

    drawTree(treeRoot);

    const now = performance.now();
    const deltaTime = (now - lastTime) / 1000.0;
    lastTime = now;

    if (animating) {

        if (bladeDir < 0) {
            bladeSpeed *= 1.25;
        }
        bladeOffsetY += bladeDir * bladeSpeed * deltaTime;
        if (bladeOffsetY <= bladeEndY) {
            headsRolling = true;
        }
        if (headsRolling) {
            sphere1OffsetY -= sphereSpeed * deltaTime
        }

        if (bladeOffsetY <= bladeEndY) {
            bladeOffsetY = bladeEndY;
            bladeDir = 1;
            bladeSpeed = 2.0;
        }

        if (bladeOffsetY >= bladeStartY) {
            bladeOffsetY = bladeStartY;
            bladeDir = -1;
            sphere1OffsetY = sphere1StartY;
            headsRolling = false;
            animating = false;
        }
    }

    alpha += 0.005;

    let forward = vec3(
        Math.cos(pitch) * Math.sin(yaw),
        Math.sin(pitch),
        Math.cos(pitch) * Math.cos(yaw)
    );
    at = add(eye, forward);


    cameraMatrix = lookAt(eye, at, up);
    gl.uniformMatrix4fv(cameraMatrixLoc, false, flatten(cameraMatrix) );
    gl.uniformMatrix4fv(cameraInverseMatrixLoc, false, flatten(inverse(cameraMatrix)) );

    gl.depthMask(false);
    drawSkybox();
    gl.depthMask(true);

    let frameModel = mat4();
    drawObject(frameVertices, frameNormals, frameModel, false);

    let bladeLocal = translate(0, bladeOffsetY, 0);
    let bladeWorld = mult(frameModel, bladeLocal);

    drawObject(bladeVertices, bladeNormals, bladeWorld, true);

    let sphereModel = translate(0, sphere1OffsetY, 0.5);
    let sphereMatrix = mult(cameraMatrix, sphereModel);

    gl.uniformMatrix4fv(cameraMatrixLoc, false, flatten(sphereMatrix));

    drawSphere();

    requestAnimFrame(render);
    console.log(bladeStartY, bladeEndY);
}



