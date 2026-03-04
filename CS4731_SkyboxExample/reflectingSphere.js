let canvas;
let gl;
let program;

let pointsArray = [];
let normalsArray = [];
let texCoordsArray = [];

let pointsArraySphere = [];
let pointsArrayCube = [];

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

let lastTime = 0.0;

let cameraMatrixLoc, cameraInverseMatrixLoc;
let vTexCoord, vNormal, vPosition;
let cameraMatrix;

let useSpecular = true;
let useDiffuse = true;

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

function configureDefaultCubeMap() {
    let cubeMap = gl.createTexture();
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeMap);

    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    let red = new Uint8Array([255, 0, 0, 255]);
    let green = new Uint8Array([0, 255, 0, 255]);
    let blue = new Uint8Array([0, 0, 255, 255]);
    let cyan = new Uint8Array([0, 255, 255, 255]);
    let magenta = new Uint8Array([255, 0, 255, 255]);
    let yellow = new Uint8Array([255, 255, 0, 255]);

    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, red);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, yellow);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, green);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, cyan);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, blue);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, magenta);

    gl.uniform1i(gl.getUniformLocation(program, "texMap"), 1);
}

function configureCubeMap(image) {
    let cubeMap = gl.createTexture();
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeMap);

    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

    gl.uniform1i(gl.getUniformLocation(program, "texMap"), 1);
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

function configureTexture(image) {

    let tex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    gl.uniform1i(gl.getUniformLocation(program, "tex1"), 0);
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


    // Default textures
    configureDefaultTexture();
    configureDefaultCubeMap();


    //img src for sphere texture
    //"https://ekim1678.github.io/personal-website/resources/computergraphicstextures/spheretexture.jpg"

    // Load the image
    let image = new Image();
    image.crossOrigin = "";
    image.src = "https://ekim1678.github.io/personal-website/resources/computergraphicstextures/skyboxtexture.jpg";
    image.onload = function() {
        configureTexture(image);
        configureCubeMap(image);
    }

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
                bladeSpeed = 100.0;
                bladeDir = 1;
            }
            else{
                animating = true;
                bladeSpeed = 2.0;
                bladeDir = -1;
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
    });
    lastTime = performance.now();

    render();
}

function drawObject(vertices, normals, modelMatrix) {

    let mat = mult(cameraMatrix, modelMatrix);
    gl.uniform1i(gl.getUniformLocation(program, "isSkybox"), 0);

    gl.uniformMatrix4fv(cameraMatrixLoc, false, flatten(mat));
    const vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    const nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW);

    vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);

    gl.drawArrays(gl.TRIANGLES, 0, vertices.length);
}

function drawSphere() {
    gl.disableVertexAttribArray(vTexCoord);
    gl.enableVertexAttribArray( vNormal);

    gl.uniform1i(gl.getUniformLocation(program, "isSkybox"), 0);

    let vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArraySphere), gl.STATIC_DRAW);
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);

    gl.drawArrays( gl.TRIANGLES, 0, pointsArraySphere.length );
}


function drawSkybox() {
    gl.enableVertexAttribArray(vTexCoord);
    gl.disableVertexAttribArray( vNormal);

    gl.uniform1i(gl.getUniformLocation(program, "isSkybox"), 1);

    let vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArrayCube), gl.STATIC_DRAW);
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);

    gl.drawArrays( gl.TRIANGLES, 0, pointsArrayCube.length );
}


let alpha = 0;

function render() {

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

    const now = performance.now();
    const deltaTime = (now - lastTime) / 1000.0;
    lastTime = now;

    if (animating) {

        if (bladeDir < 0) {
            bladeSpeed *= 1.25;
        }
        bladeOffsetY += bladeDir * bladeSpeed * deltaTime;

        if (bladeOffsetY <= bladeEndY) {
            bladeOffsetY = bladeEndY;
            bladeDir = 1;
            bladeSpeed = 2.0;
        }

        if (bladeOffsetY >= bladeStartY) {
            bladeOffsetY = bladeStartY;
            bladeDir = -1;
            animating = false;
        }
    }

    //let eye = vec3(2 * Math.sin(alpha), 0.0, 2 * Math.cos(alpha));

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
    drawObject(frameVertices, frameNormals, frameModel);

    let bladeLocal = translate(0, bladeOffsetY, 0);
    let bladeWorld = mult(frameModel, bladeLocal);

    drawObject(bladeVertices, bladeNormals, bladeWorld);

    //drawSphere();

    requestAnimFrame(render);
    console.log(bladeStartY, bladeEndY);
}



