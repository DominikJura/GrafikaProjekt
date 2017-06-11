
//Kebord Handler
var Keyboard = function(){
	var activeKeys = [];
	var keys = {
		'UP': 79,
		'LEFT': 75,
		'RIGHT': 186,
		'DOWN': 76,
		'SPACE': 32
	};

	$('body').on('keydown keyup', function(e){
		if(e.type === 'keydown'){
			if(!_.contains(activeKeys, e.keyCode)){
				activeKeys.push(e.keyCode);
			}
		} else {
			activeKeys = _.without(activeKeys, e.keyCode);
		}
	});
	
	_.forEach(keys, function(value, key){
		this['is'+key] = function(){
			return _.contains(activeKeys, value);
		};
	}, this);
};

// set the scene size

(function(window){

	var $container = $('#container');

	var WIDTH = $(document).width(),
	    HEIGHT = $(document).height();

	// set some camera attributes
	var VIEW_ANGLE = 45,
	    ASPECT = WIDTH / HEIGHT,
	    NEAR = 0.1,
	    FAR = 10000;

	//set up Physijs
	Physijs.scripts.worker = 'physijs_worker.js';
	Physijs.scripts.ammo = 'ammo.js';
    var simulate = true;


	// WebGL Renderer
	var renderer = new THREE.WebGLRenderer({antialias: true });
	renderer.setClearColor(0x6fafaa, 1);
	renderer.setSize(WIDTH, HEIGHT);
	renderer.shadowMapEnabled = true;
	renderer.shadowMapSoft = true;
	renderer.shadowMapType = THREE.PCFSoftShadowMap;

	// Physijs Scene
	scene = new Physijs.Scene();
	scene.setGravity(new THREE.Vector3(0,-800,0));

	//Orthographic Camera
	var aspect = window.innerWidth / window.innerHeight;
	var d = 400;
	var camera = new THREE.OrthographicCamera( - d * aspect, d * aspect, d, - d, 1, 2500 );
	//var camera = new THREE.OrthographicCamera( 1000 / -2, 1000 / 2, 800 / 2, 800 / -2, 1, 1000 );
	camera.position.set( 800, 400, 800 );
	camera.lookAt( new THREE.Vector3(0,0,0) ); // or the origin
	scene.add(camera);

	// Keyboard
	var kb = new Keyboard();

	// Controls
	var controls = new THREE.OrbitControls(camera);
	controls.noKeys = true;

	// Render loop
	function render() {
		if(simulate){
			scene.simulate(); // run physics
		}
	    renderer.render(scene, camera);
        requestAnimationFrame(render);
	}
	$container.append(renderer.domElement); 
	render();

	// make app public available
	var app = {
		scene: scene,
		camera: camera,
		container: $container,
		orbitControls: controls,
		keyboard: kb
	};
	window.app = app;


	$('body').on('keydown', function(e){
		//'s' key for simulate
		if(e.keyCode === 83){
			simulate = !simulate;
			console.log("simulation: ", simulate);
		}
	});


})(this);


//Ball handler
(function(){

	var color = 0x61cbe3,
		radius = 13,
		segments = 20,
		rings = 20;
		mass = 30;

	// Sphere
	var sphereMaterial = Physijs.createMaterial(new THREE.MeshBasicMaterial({color: color, side: THREE.FrontSide}), 1, 1);
	var sphereGeometry = new THREE.SphereGeometry(radius, segments, rings)
    var material = new THREE.MeshPhongMaterial( { map: THREE.ImageUtils.loadTexture('ball.png',THREE.SphericalRefractionMapping) } );

	var sphere = new Physijs.SphereMesh(sphereGeometry, material, mass);
	sphere.setLinearFactor(new THREE.Vector3( 0, 0, 0 )); // only move on X and Z axis

	sphere.position.y = 20;
	sphere.position.z = 250;
	sphere.position.x = -200;

	app.character = sphere;
	app.scene.add(sphere);

	//character move
	var preventJump = false;
	var movePlayer = function() {
	};
	movePlayer();



})();
(function() {

    // Axis Helper
    var axisHelper = new THREE.AxisHelper(100);
    axisHelper.position.y = 20;
    axisHelper.visible = false
    app.scene.add(axisHelper);

    // Grid Helper
    /*var gridHelper = new THREE.GridHelper(100, 10);
    app.scene.add(gridHelper);*/


    // sho/hide helpers
    $('body').on('keypress', function(e) {
        //press 'h' to hide helpers
        if (e.keyCode === 104) {
            axisHelper.visible = !axisHelper.visible;
            gridHelper.visible = !gridHelper.visible;
        }
    });


    // Stats
    var render_stats = new Stats();
    render_stats.domElement.style.position = 'absolute';
    render_stats.domElement.style.top = '0px';
    render_stats.domElement.style.zIndex = 100;
    $('body').append(render_stats.domElement);

    var updateStats = function(){
        render_stats.update();
        requestAnimationFrame(updateStats);
    };
    updateStats();

})();

// Scene handler
(function(){

	// Ground
	var groundColor = 0xf5ffaf,
		gutterSize = 40;
		sizeX = 140;
		sizeZ = 600;
		sizeY = 10;
	var planeMaterial = Physijs.createMaterial(new THREE.MeshLambertMaterial( {color: groundColor, side: THREE.FrontSide} ), 1,0.5);
	var gutterMaterial = Physijs.createMaterial(new THREE.MeshLambertMaterial( {color: 0x666666, side: THREE.FrontSide} ), 1,0.5);
    var floorMaterial = new THREE.MeshPhongMaterial( { map: THREE.ImageUtils.loadTexture('background.jpg', {}) } );
    var wallMaterial = new THREE.MeshPhongMaterial( { map: THREE.ImageUtils.loadTexture('darkWood.jpg', {}) } );

	var planeGeometry = new THREE.BoxGeometry( sizeX, sizeY, sizeZ, 1,1,1 );
    var wallGeometry = new THREE.BoxGeometry( 5, 150, sizeZ, 1,1,1 );
	var groundGeometry = new THREE.BoxGeometry( sizeX, sizeY, sizeZ, 1,1,1 );
	var wallBackGeometry = new THREE.BoxGeometry( 220, 120, 5, 1,1,1 );
	var gutterBottomGeometry = new THREE.BoxGeometry( gutterSize, 5, sizeZ, 1,1,1 );
	var gutterWallGeometry = new THREE.BoxGeometry( 5, gutterSize, sizeZ, 1,1,1 );

	var plane = new Physijs.BoxMesh(planeGeometry, planeMaterial, 0 );

	var wallRight = new Physijs.BoxMesh(wallGeometry, wallMaterial, 0 );
	var wallLeft = new Physijs.BoxMesh(wallGeometry, wallMaterial, 0 );
    var wallBack = new Physijs.BoxMesh(wallBackGeometry, wallMaterial, 0 );
	var ground = new Physijs.BoxMesh(groundGeometry, floorMaterial, 0 );

	var rightGutterBottom = new Physijs.BoxMesh(gutterBottomGeometry, gutterMaterial, 0 );
	var leftGutterBottom = new Physijs.BoxMesh(gutterBottomGeometry, gutterMaterial, 0 );
	var leftGutterWall = new Physijs.BoxMesh(gutterWallGeometry, gutterMaterial, 0 );
	var rightGutterWall = new Physijs.BoxMesh(gutterWallGeometry, gutterMaterial, 0 );

	plane.position.y = -5;
	plane.position.x = sizeX;

	ground.position.y = -5;
	ground.position.x = -200;

    wallRight.position.y = 35;
    wallRight.position.x = -90;
    wallRight.position.z = 0;

    wallLeft.position.y = 35;
    wallLeft.position.x = -310;
    wallLeft.position.z = 0;

    wallBack.position.y = 50;
    wallBack.position.x = -200;
    wallBack.position.z = -300;

	rightGutterBottom.position.y = -40;
    rightGutterBottom.position.x = -110;
    rightGutterBottom.position.z = 0;

    leftGutterBottom.position.y = -40;
    leftGutterBottom.position.x = -290;
    leftGutterBottom.position.z = 0;

    leftGutterWall.position.y = -20;
    leftGutterWall.position.x = -270;
    leftGutterWall.position.z = 0;

    rightGutterWall.position.y = -20;
    rightGutterWall.position.x = -130;
    rightGutterWall.position.z = 0;

	plane.receiveShadow = true;
	ground.receiveShadow = true;

	app.ground = plane;

    app.scene.add(ground);
	app.scene.add(wallRight);
	app.scene.add(wallBack);
	app.scene.add(wallLeft);

	app.scene.add(rightGutterBottom);
	app.scene.add(leftGutterBottom);
	app.scene.add(leftGutterWall);
	app.scene.add(rightGutterWall);


//Bowling Pins
	var boxColor = 0xe6f2e5,
		numberOfBoxes = 6,
		boxWidth = 20,
		boxHeight = 40,
		boxDepth = 20;
		offsetX = -200;
		offsetZ = -250;
	var boxes = [];

	var boxGeometry = new THREE.CylinderGeometry(2, 7, 50, 32);
    var boxMaterial = new THREE.MeshPhongMaterial( { map: THREE.ImageUtils.loadTexture('pinTexture.png', {}) } );
	
	for(var i = 0; i < numberOfBoxes; i++) {
		var box = new Physijs.BoxMesh(boxGeometry, boxMaterial, 25)
		box.castShadow = true;
		box.receiveShadow = true;
		boxes.push(box);
	};

	boxes[0].position.set(0 + offsetX,boxHeight/2,offsetZ);
	boxes[1].position.set(-30 + offsetX,boxHeight/2,offsetZ);
	boxes[2].position.set(30 + offsetX,boxHeight/2,offsetZ);
	boxes[3].position.set(-15 + offsetX,boxHeight/2,offsetZ + 25);
	boxes[4].position.set(15 + offsetX,boxHeight/2,offsetZ + 25);
	boxes[5].position.set(0 + offsetX,boxHeight/2,offsetZ + 50);

	boxes.forEach(function(box){
		app.scene.add(box);
	});

})();

//Mouse shot ball
(function() {

    var impulseScalar = 40;

    var $container = app.container;
    var character = app.character;
    var raycaster = new THREE.Raycaster();

    var mouse = new THREE.Vector2();
    var powerPoint;
    var powerLineGeometry = new THREE.Geometry();
    powerLineGeometry.vertices.push(new THREE.Vector3(0, 0, 0));
    var powerLineMaterial = new THREE.LineBasicMaterial({
        color: 0x5555ff,
        linewidth: 3
    });
    var powerLine = new THREE.Line(powerLineGeometry, powerLineMaterial);
    powerLine.visible = false;
    app.scene.add(powerLine);

    var START_EVENT = Modernizr.touch ? 'touchstart' : 'mousedown';
    var MOVE_EVENT = Modernizr.touch ? 'touchmove' : 'mousemove';
    var END_EVENT = Modernizr.touch ? 'touchend' : 'mouseup';


    var material = new THREE.MeshBasicMaterial( {color: 0xcccccc, side: THREE.FrontSide} );
    var geometry = new THREE.PlaneGeometry( 3000, 3000, 1,1 );
    var plane = new THREE.Mesh(geometry, material);
    plane.rotation.x = Math.PI / -2;
    plane.position.y = 5;
    plane.visible = false;
    app.scene.add(plane);


    var changePowerLine = function() {
        if(character.position && powerPoint){
            powerLine.geometry.vertices[0] = character.position;
            powerLine.geometry.vertices[1] = powerPoint;
            powerLine.geometry.verticesNeedUpdate = true;
        }
    };

    var getIntersectFromMouse = function(event, object) {
        var x = event.clientX || event.originalEvent.targetTouches[0].clientX;
        var y = event.clientY || event.originalEvent.targetTouches[0].clientY;
        mouse = new THREE.Vector2();
        mouse.x = (x / window.innerWidth) * 2 - 1;
        mouse.y = -(y / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, app.camera);
        return raycaster.intersectObject(object);
    };

    var mouseDownHandler = function(event) {
        var intersects = getIntersectFromMouse(event, character);
        if (intersects[0]) {
            app.orbitControls.enabled = false;
            app.container.on(MOVE_EVENT, mouseMoveHandler);
            app.container.on(END_EVENT, mouseUpHandler);
        }
    };

    var mouseMoveHandler = function(event) {
        var intersects = getIntersectFromMouse(event, plane);
        if (intersects[0]) {
            powerPoint = intersects[0].point;
            powerPoint.y = powerPoint.y + app.character.geometry.parameters.radius;
            changePowerLine();
            powerLine.visible = true;
        }
    };

    var mouseUpHandler = function(event) {
        app.container.off(MOVE_EVENT, mouseMoveHandler);
        app.container.off(END_EVENT, mouseUpHandler);
        powerLine.visible = false;
        app.orbitControls.enabled = true;

        var vector = powerPoint.sub(character.position);
        character.applyCentralImpulse(vector.negate().multiplyScalar(impulseScalar));
    };

    app.container.on(START_EVENT, mouseDownHandler);


    var drawPowerLine = function(){
        if(powerLine.visible){
            changePowerLine();
        }
        requestAnimationFrame(drawPowerLine);
    }
    drawPowerLine();

})();

//Light
(function() {

    //Ambient Light
    var light = new THREE.AmbientLight(0x333333); // soft white light
    // app.scene.add(light);

    // Directional Light
    var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
    directionalLight.position.set( 200, 300, 200 );
    directionalLight.castShadow = true;
    directionalLight.shadowDarkness = 0.4;
    directionalLight.shadowCameraNear = 10;
    directionalLight.shadowCameraFar = 800;
    directionalLight.shadowCameraVisible = false;
    directionalLight.shadowCameraFov = 60;
    app.scene.add( directionalLight );

    // Light Move
    var lightMove = 0;
    function moveLight() {
        lightMove += 0.01;
        if (lightMove > 360) {
            lightMove = 0;
        }
        spotLight.position.x = Math.sin(lightMove) * 200;
    }

})();