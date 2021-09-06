import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';

window.onload = function() {
    window.api.send("getMesh");

    window.api.receive("returnMesh", (message) => {
        let meshPath = message;
        init();
        loadSTL(meshPath);
        animate();
        return;
    });
}

let camera, scene, raycaster, renderer, loader, light, controls;
let building_model;
const pointer = new THREE.Vector2();


function init() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000)

    /*
    renderer = new THREE.WebGLRenderer({
        canvas: document.querySelector('#model-container'),
    });*/
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    document.getElementById('model-container').appendChild(renderer.domElement)
    //renderer.setSize( window.innerWidth, window.innerHeight );

    //camera.position.setZ(100);
    //const cameraHelper = new THREE.CameraHelper(camera);
    //scene.add(cameraHelper);
    camera.position.set(0, 0, 100)
    camera.lookAt(new THREE.Vector3(0,0,0));

    const pointLight = new THREE.PointLight(0xffffff);
    pointLight.position.set(20,20,20);
    const pointLight2 = new THREE.PointLight(0xffffff);
    pointLight2.position.set(-20,-20,20);

    scene.add(pointLight);
    scene.add(pointLight2);

    controls = new OrbitControls( camera, renderer.domElement );

    loader = new STLLoader();

    scene.background = new THREE.Color( 0xfffff0 );

    //const contourTexture = new THREE.TextureLoader().load('contours2.png');
    //scene.background = contourTexture;

    //const starTexture = new THREE.TextureLoader().load('stars.jpeg');
    //scene.background = starTexture;

    raycaster = new THREE.Raycaster();

    //const size = 1000;
    //const divisions = 100;

    //const gridHelper = new THREE.GridHelper( size, divisions );
    //scene.add( gridHelper );

    const axesHelper = new THREE.AxesHelper( 500 );
    scene.add( axesHelper );

    document.addEventListener( 'mousemove', onPointerMove );

    document.addEventListener('click', onClick, false);

    window.addEventListener( 'resize', onWindowResize );
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function onPointerMove( event ) {

    pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

}

function onClick(event) {
    event.preventDefault();

    pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

}


function animate() {
    requestAnimationFrame( animate );
    controls.update();
  
    render();
}

function loadSTL(meshPath) {
    loader.load( meshPath, function ( geometry ) {
		const material = new THREE.MeshPhongMaterial( { color: 0x993d00, specular: 0x999999, shininess: 5, side: THREE.DoubleSide } );
		const mesh = new THREE.Mesh( geometry, material );
		mesh.position.set(20, 20,0);
		mesh.rotation.set( 0, 0, Math.PI);
		mesh.scale.set( 0.05, 0.05, 0.05 );
		//mesh.castShadow = true;
		//mesh.receiveShadow = true;
		scene.add( mesh );
	} );
}

function render() {

    renderer.render( scene, camera );

}