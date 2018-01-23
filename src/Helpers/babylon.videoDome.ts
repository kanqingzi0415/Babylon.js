module BABYLON {
    /**
     * Display a 360 degree video on an approximately spherical surface, useful for VR applications or skyboxes.
     * As a subclass of Node, this allow parenting to the camera or multiple videos with different locations in the scene.
     * This class achieves its effect with a VideoTexture and a correctly configured BackgroundMaterial on an inverted sphere.
     * Potential additions to this helper include zoom and and non-infinite distance rendering effects.
     */
    export class VideoDome extends Node {

        /**
         * The video texture being displayed on the sphere
         */
        private _videoTexture: VideoTexture;

        /**
         * The skybox material
         */
        private _material: BackgroundMaterial;

        /**
         * The surface used for the skybox
         */
        private _mesh: Mesh;

        /**
         * Create an instance of this class and pass through the parameters to the relevant classes, VideoTexture, StandardMaterial, and Mesh.
         * @param name Element's name, child elements will append suffixes for their own names.
         * @param urlsOrVideo
         * @param options An object containing optional or exposed sub element properties:
         * @param options **clickToPlay=false** Add a click to play listener to the video, does not prevent autoplay.
         * @param options **autoPlay=true** Automatically attempt to being playing the video.
         * @param options **loop=true** Automatically loop video on end.
         * @param options **size=1000** Physical radius to create the dome at, defaults to approximately half the far clip plane.
         */
        constructor(name: string, urlsOrVideo: string[] | HTMLVideoElement, options: {
            clickToPlay?: boolean,
            autoPlay?: boolean,
            loop?: boolean,
            size?: number
        }, scene: Scene) {
            super(name, scene);

            // set defaults and manage values
            name = name || "videoDome";
            options.clickToPlay = Boolean(options.clickToPlay);
            options.autoPlay = options.autoPlay === undefined ? true : Boolean(options.autoPlay);
            options.loop = options.loop === undefined ? true : Boolean(options.loop);
            options.size = Math.abs(options.size as any) || (scene.activeCamera ? scene.activeCamera.maxZ * 0.48 : 1000);

            // create
            let tempOptions:VideoTextureSettings = {loop: options.loop, autoPlay: options.autoPlay, autoUpdateTexture: true};
            let material = this._material = new BABYLON.BackgroundMaterial(name+"_material", scene);
            this._videoTexture = new BABYLON.VideoTexture(name+"_texture", urlsOrVideo, scene, false, false, Texture.TRILINEAR_SAMPLINGMODE, tempOptions);
            this._mesh = BABYLON.MeshBuilder.CreateIcoSphere(name+"_mesh", {
                radius: options.size,
                subdivisions: 1,
                sideOrientation: BABYLON.Mesh.BACKSIDE
            }, scene); // needs to be inside out

            // configure material
            this._videoTexture.coordinatesMode = BABYLON.Texture.FIXED_EQUIRECTANGULAR_MIRRORED_MODE; // matches src
            material.reflectionTexture = this._videoTexture;

            // configure mesh
            this._mesh.material = material;
            this._mesh.parent = this;

            // optional configuration
            if(options.clickToPlay) {
                scene.onPointerUp = () => {
                    this._videoTexture.video.play();
                }
            }
        }
    }
}
