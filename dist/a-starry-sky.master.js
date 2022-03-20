/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.BufferGeometryUtils = {

	computeTangents: function ( geometry ) {

		var index = geometry.index;
		var attributes = geometry.attributes;

		// based on http://www.terathon.com/code/tangent.html
		// (per vertex tangents)

		if ( index === null ||
			 attributes.position === undefined ||
			 attributes.normal === undefined ||
			 attributes.uv === undefined ) {

			console.error( 'THREE.BufferGeometryUtils: .computeTangents() failed. Missing required attributes (index, position, normal or uv)' );
			return;

		}

		var indices = index.array;
		var positions = attributes.position.array;
		var normals = attributes.normal.array;
		var uvs = attributes.uv.array;

		var nVertices = positions.length / 3;

		if ( attributes.tangent === undefined ) {

			geometry.setAttribute( 'tangent', new THREE.BufferAttribute( new Float32Array( 4 * nVertices ), 4 ) );

		}

		var tangents = attributes.tangent.array;

		var tan1 = [], tan2 = [];

		for ( var i = 0; i < nVertices; i ++ ) {

			tan1[ i ] = new THREE.Vector3();
			tan2[ i ] = new THREE.Vector3();

		}

		var vA = new THREE.Vector3(),
			vB = new THREE.Vector3(),
			vC = new THREE.Vector3(),

			uvA = new THREE.Vector2(),
			uvB = new THREE.Vector2(),
			uvC = new THREE.Vector2(),

			sdir = new THREE.Vector3(),
			tdir = new THREE.Vector3();

		function handleTriangle( a, b, c ) {

			vA.fromArray( positions, a * 3 );
			vB.fromArray( positions, b * 3 );
			vC.fromArray( positions, c * 3 );

			uvA.fromArray( uvs, a * 2 );
			uvB.fromArray( uvs, b * 2 );
			uvC.fromArray( uvs, c * 2 );

			vB.sub( vA );
			vC.sub( vA );

			uvB.sub( uvA );
			uvC.sub( uvA );

			var r = 1.0 / ( uvB.x * uvC.y - uvC.x * uvB.y );

			// silently ignore degenerate uv triangles having coincident or colinear vertices

			if ( ! isFinite( r ) ) return;

			sdir.copy( vB ).multiplyScalar( uvC.y ).addScaledVector( vC, - uvB.y ).multiplyScalar( r );
			tdir.copy( vC ).multiplyScalar( uvB.x ).addScaledVector( vB, - uvC.x ).multiplyScalar( r );

			tan1[ a ].add( sdir );
			tan1[ b ].add( sdir );
			tan1[ c ].add( sdir );

			tan2[ a ].add( tdir );
			tan2[ b ].add( tdir );
			tan2[ c ].add( tdir );

		}

		var groups = geometry.groups;

		if ( groups.length === 0 ) {

			groups = [ {
				start: 0,
				count: indices.length
			} ];

		}

		for ( var i = 0, il = groups.length; i < il; ++ i ) {

			var group = groups[ i ];

			var start = group.start;
			var count = group.count;

			for ( var j = start, jl = start + count; j < jl; j += 3 ) {

				handleTriangle(
					indices[ j + 0 ],
					indices[ j + 1 ],
					indices[ j + 2 ]
				);

			}

		}

		var tmp = new THREE.Vector3(), tmp2 = new THREE.Vector3();
		var n = new THREE.Vector3(), n2 = new THREE.Vector3();
		var w, t, test;

		function handleVertex( v ) {

			n.fromArray( normals, v * 3 );
			n2.copy( n );

			t = tan1[ v ];

			// Gram-Schmidt orthogonalize

			tmp.copy( t );
			tmp.sub( n.multiplyScalar( n.dot( t ) ) ).normalize();

			// Calculate handedness

			tmp2.crossVectors( n2, t );
			test = tmp2.dot( tan2[ v ] );
			w = ( test < 0.0 ) ? - 1.0 : 1.0;

			tangents[ v * 4 ] = tmp.x;
			tangents[ v * 4 + 1 ] = tmp.y;
			tangents[ v * 4 + 2 ] = tmp.z;
			tangents[ v * 4 + 3 ] = w;

		}

		for ( var i = 0, il = groups.length; i < il; ++ i ) {

			var group = groups[ i ];

			var start = group.start;
			var count = group.count;

			for ( var j = start, jl = start + count; j < jl; j += 3 ) {

				handleVertex( indices[ j + 0 ] );
				handleVertex( indices[ j + 1 ] );
				handleVertex( indices[ j + 2 ] );

			}

		}

	},

	/**
	 * @param  {Array<THREE.BufferGeometry>} geometries
	 * @param  {Boolean} useGroups
	 * @return {THREE.BufferGeometry}
	 */
	mergeBufferGeometries: function ( geometries, useGroups ) {

		var isIndexed = geometries[ 0 ].index !== null;

		var attributesUsed = new Set( Object.keys( geometries[ 0 ].attributes ) );
		var morphAttributesUsed = new Set( Object.keys( geometries[ 0 ].morphAttributes ) );

		var attributes = {};
		var morphAttributes = {};

		var morphTargetsRelative = geometries[ 0 ].morphTargetsRelative;

		var mergedGeometry = new THREE.BufferGeometry();

		var offset = 0;

		for ( var i = 0; i < geometries.length; ++ i ) {

			var geometry = geometries[ i ];
			var attributesCount = 0;

			// ensure that all geometries are indexed, or none

			if ( isIndexed !== ( geometry.index !== null ) ) {

				console.error( 'THREE.BufferGeometryUtils: .mergeBufferGeometries() failed with geometry at index ' + i + '. All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them.' );
				return null;

			}

			// gather attributes, exit early if they're different

			for ( var name in geometry.attributes ) {

				if ( ! attributesUsed.has( name ) ) {

					console.error( 'THREE.BufferGeometryUtils: .mergeBufferGeometries() failed with geometry at index ' + i + '. All geometries must have compatible attributes; make sure "' + name + '" attribute exists among all geometries, or in none of them.' );
					return null;

				}

				if ( attributes[ name ] === undefined ) attributes[ name ] = [];

				attributes[ name ].push( geometry.attributes[ name ] );

				attributesCount ++;

			}

			// ensure geometries have the same number of attributes

			if ( attributesCount !== attributesUsed.size ) {

				console.error( 'THREE.BufferGeometryUtils: .mergeBufferGeometries() failed with geometry at index ' + i + '. Make sure all geometries have the same number of attributes.' );
				return null;

			}

			// gather morph attributes, exit early if they're different

			if ( morphTargetsRelative !== geometry.morphTargetsRelative ) {

				console.error( 'THREE.BufferGeometryUtils: .mergeBufferGeometries() failed with geometry at index ' + i + '. .morphTargetsRelative must be consistent throughout all geometries.' );
				return null;

			}

			for ( var name in geometry.morphAttributes ) {

				if ( ! morphAttributesUsed.has( name ) ) {

					console.error( 'THREE.BufferGeometryUtils: .mergeBufferGeometries() failed with geometry at index ' + i + '.  .morphAttributes must be consistent throughout all geometries.' );
					return null;

				}

				if ( morphAttributes[ name ] === undefined ) morphAttributes[ name ] = [];

				morphAttributes[ name ].push( geometry.morphAttributes[ name ] );

			}

			// gather .userData

			mergedGeometry.userData.mergedUserData = mergedGeometry.userData.mergedUserData || [];
			mergedGeometry.userData.mergedUserData.push( geometry.userData );

			if ( useGroups ) {

				var count;

				if ( isIndexed ) {

					count = geometry.index.count;

				} else if ( geometry.attributes.position !== undefined ) {

					count = geometry.attributes.position.count;

				} else {

					console.error( 'THREE.BufferGeometryUtils: .mergeBufferGeometries() failed with geometry at index ' + i + '. The geometry must have either an index or a position attribute' );
					return null;

				}

				mergedGeometry.addGroup( offset, count, i );

				offset += count;

			}

		}

		// merge indices

		if ( isIndexed ) {

			var indexOffset = 0;
			var mergedIndex = [];

			for ( var i = 0; i < geometries.length; ++ i ) {

				var index = geometries[ i ].index;

				for ( var j = 0; j < index.count; ++ j ) {

					mergedIndex.push( index.getX( j ) + indexOffset );

				}

				indexOffset += geometries[ i ].attributes.position.count;

			}

			mergedGeometry.setIndex( mergedIndex );

		}

		// merge attributes

		for ( var name in attributes ) {

			var mergedAttribute = this.mergeBufferAttributes( attributes[ name ] );

			if ( ! mergedAttribute ) {

				console.error( 'THREE.BufferGeometryUtils: .mergeBufferGeometries() failed while trying to merge the ' + name + ' attribute.' );
				return null;

			}

			mergedGeometry.setAttribute( name, mergedAttribute );

		}

		// merge morph attributes

		for ( var name in morphAttributes ) {

			var numMorphTargets = morphAttributes[ name ][ 0 ].length;

			if ( numMorphTargets === 0 ) break;

			mergedGeometry.morphAttributes = mergedGeometry.morphAttributes || {};
			mergedGeometry.morphAttributes[ name ] = [];

			for ( var i = 0; i < numMorphTargets; ++ i ) {

				var morphAttributesToMerge = [];

				for ( var j = 0; j < morphAttributes[ name ].length; ++ j ) {

					morphAttributesToMerge.push( morphAttributes[ name ][ j ][ i ] );

				}

				var mergedMorphAttribute = this.mergeBufferAttributes( morphAttributesToMerge );

				if ( ! mergedMorphAttribute ) {

					console.error( 'THREE.BufferGeometryUtils: .mergeBufferGeometries() failed while trying to merge the ' + name + ' morphAttribute.' );
					return null;

				}

				mergedGeometry.morphAttributes[ name ].push( mergedMorphAttribute );

			}

		}

		return mergedGeometry;

	},

	/**
	 * @param {Array<THREE.BufferAttribute>} attributes
	 * @return {THREE.BufferAttribute}
	 */
	mergeBufferAttributes: function ( attributes ) {

		var TypedArray;
		var itemSize;
		var normalized;
		var arrayLength = 0;

		for ( var i = 0; i < attributes.length; ++ i ) {

			var attribute = attributes[ i ];

			if ( attribute.isInterleavedBufferAttribute ) {

				console.error( 'THREE.BufferGeometryUtils: .mergeBufferAttributes() failed. InterleavedBufferAttributes are not supported.' );
				return null;

			}

			if ( TypedArray === undefined ) TypedArray = attribute.array.constructor;
			if ( TypedArray !== attribute.array.constructor ) {

				console.error( 'THREE.BufferGeometryUtils: .mergeBufferAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes.' );
				return null;

			}

			if ( itemSize === undefined ) itemSize = attribute.itemSize;
			if ( itemSize !== attribute.itemSize ) {

				console.error( 'THREE.BufferGeometryUtils: .mergeBufferAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes.' );
				return null;

			}

			if ( normalized === undefined ) normalized = attribute.normalized;
			if ( normalized !== attribute.normalized ) {

				console.error( 'THREE.BufferGeometryUtils: .mergeBufferAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes.' );
				return null;

			}

			arrayLength += attribute.array.length;

		}

		var array = new TypedArray( arrayLength );
		var offset = 0;

		for ( var i = 0; i < attributes.length; ++ i ) {

			array.set( attributes[ i ].array, offset );

			offset += attributes[ i ].array.length;

		}

		return new THREE.BufferAttribute( array, itemSize, normalized );

	},

	/**
	 * @param {Array<THREE.BufferAttribute>} attributes
	 * @return {Array<THREE.InterleavedBufferAttribute>}
	 */
	interleaveAttributes: function ( attributes ) {

		// Interleaves the provided attributes into an InterleavedBuffer and returns
		// a set of InterleavedBufferAttributes for each attribute
		var TypedArray;
		var arrayLength = 0;
		var stride = 0;

		// calculate the the length and type of the interleavedBuffer
		for ( var i = 0, l = attributes.length; i < l; ++ i ) {

			var attribute = attributes[ i ];

			if ( TypedArray === undefined ) TypedArray = attribute.array.constructor;
			if ( TypedArray !== attribute.array.constructor ) {

				console.error( 'AttributeBuffers of different types cannot be interleaved' );
				return null;

			}

			arrayLength += attribute.array.length;
			stride += attribute.itemSize;

		}

		// Create the set of buffer attributes
		var interleavedBuffer = new THREE.InterleavedBuffer( new TypedArray( arrayLength ), stride );
		var offset = 0;
		var res = [];
		var getters = [ 'getX', 'getY', 'getZ', 'getW' ];
		var setters = [ 'setX', 'setY', 'setZ', 'setW' ];

		for ( var j = 0, l = attributes.length; j < l; j ++ ) {

			var attribute = attributes[ j ];
			var itemSize = attribute.itemSize;
			var count = attribute.count;
			var iba = new THREE.InterleavedBufferAttribute( interleavedBuffer, itemSize, offset, attribute.normalized );
			res.push( iba );

			offset += itemSize;

			// Move the data for each attribute into the new interleavedBuffer
			// at the appropriate offset
			for ( var c = 0; c < count; c ++ ) {

				for ( var k = 0; k < itemSize; k ++ ) {

					iba[ setters[ k ] ]( c, attribute[ getters[ k ] ]( c ) );

				}

			}

		}

		return res;

	},

	/**
	 * @param {Array<THREE.BufferGeometry>} geometry
	 * @return {number}
	 */
	estimateBytesUsed: function ( geometry ) {

		// Return the estimated memory used by this geometry in bytes
		// Calculate using itemSize, count, and BYTES_PER_ELEMENT to account
		// for InterleavedBufferAttributes.
		var mem = 0;
		for ( var name in geometry.attributes ) {

			var attr = geometry.getAttribute( name );
			mem += attr.count * attr.itemSize * attr.array.BYTES_PER_ELEMENT;

		}

		var indices = geometry.getIndex();
		mem += indices ? indices.count * indices.itemSize * indices.array.BYTES_PER_ELEMENT : 0;
		return mem;

	},

	/**
	 * @param {THREE.BufferGeometry} geometry
	 * @param {number} tolerance
	 * @return {THREE.BufferGeometry>}
	 */
	mergeVertices: function ( geometry, tolerance = 1e-4 ) {

		tolerance = Math.max( tolerance, Number.EPSILON );

		// Generate an index buffer if the geometry doesn't have one, or optimize it
		// if it's already available.
		var hashToIndex = {};
		var indices = geometry.getIndex();
		var positions = geometry.getAttribute( 'position' );
		var vertexCount = indices ? indices.count : positions.count;

		// next value for triangle indices
		var nextIndex = 0;

		// attributes and new attribute arrays
		var attributeNames = Object.keys( geometry.attributes );
		var attrArrays = {};
		var morphAttrsArrays = {};
		var newIndices = [];
		var getters = [ 'getX', 'getY', 'getZ', 'getW' ];

		// initialize the arrays
		for ( var i = 0, l = attributeNames.length; i < l; i ++ ) {

			var name = attributeNames[ i ];

			attrArrays[ name ] = [];

			var morphAttr = geometry.morphAttributes[ name ];
			if ( morphAttr ) {

				morphAttrsArrays[ name ] = new Array( morphAttr.length ).fill().map( () => [] );

			}

		}

		// convert the error tolerance to an amount of decimal places to truncate to
		var decimalShift = Math.log10( 1 / tolerance );
		var shiftMultiplier = Math.pow( 10, decimalShift );
		for ( var i = 0; i < vertexCount; i ++ ) {

			var index = indices ? indices.getX( i ) : i;

			// Generate a hash for the vertex attributes at the current index 'i'
			var hash = '';
			for ( var j = 0, l = attributeNames.length; j < l; j ++ ) {

				var name = attributeNames[ j ];
				var attribute = geometry.getAttribute( name );
				var itemSize = attribute.itemSize;

				for ( var k = 0; k < itemSize; k ++ ) {

					// double tilde truncates the decimal value
					hash += `${ ~ ~ ( attribute[ getters[ k ] ]( index ) * shiftMultiplier ) },`;

				}

			}

			// Add another reference to the vertex if it's already
			// used by another index
			if ( hash in hashToIndex ) {

				newIndices.push( hashToIndex[ hash ] );

			} else {

				// copy data to the new index in the attribute arrays
				for ( var j = 0, l = attributeNames.length; j < l; j ++ ) {

					var name = attributeNames[ j ];
					var attribute = geometry.getAttribute( name );
					var morphAttr = geometry.morphAttributes[ name ];
					var itemSize = attribute.itemSize;
					var newarray = attrArrays[ name ];
					var newMorphArrays = morphAttrsArrays[ name ];

					for ( var k = 0; k < itemSize; k ++ ) {

						var getterFunc = getters[ k ];
						newarray.push( attribute[ getterFunc ]( index ) );

						if ( morphAttr ) {

							for ( var m = 0, ml = morphAttr.length; m < ml; m ++ ) {

								newMorphArrays[ m ].push( morphAttr[ m ][ getterFunc ]( index ) );

							}

						}

					}

				}

				hashToIndex[ hash ] = nextIndex;
				newIndices.push( nextIndex );
				nextIndex ++;

			}

		}

		// Generate typed arrays from new attribute arrays and update
		// the attributeBuffers
		const result = geometry.clone();
		for ( var i = 0, l = attributeNames.length; i < l; i ++ ) {

			var name = attributeNames[ i ];
			var oldAttribute = geometry.getAttribute( name );

			var buffer = new oldAttribute.array.constructor( attrArrays[ name ] );
			var attribute = new THREE.BufferAttribute( buffer, oldAttribute.itemSize, oldAttribute.normalized );

			result.setAttribute( name, attribute );

			// Update the attribute arrays
			if ( name in morphAttrsArrays ) {

				for ( var j = 0; j < morphAttrsArrays[ name ].length; j ++ ) {

					var oldMorphAttribute = geometry.morphAttributes[ name ][ j ];

					var buffer = new oldMorphAttribute.array.constructor( morphAttrsArrays[ name ][ j ] );
					var morphAttribute = new THREE.BufferAttribute( buffer, oldMorphAttribute.itemSize, oldMorphAttribute.normalized );
					result.morphAttributes[ name ][ j ] = morphAttribute;

				}

			}

		}

		// indices

		result.setIndex( newIndices );

		return result;

	},

	/**
	 * @param {THREE.BufferGeometry} geometry
	 * @param {number} drawMode
	 * @return {THREE.BufferGeometry>}
	 */
	toTrianglesDrawMode: function ( geometry, drawMode ) {

		if ( drawMode === THREE.TrianglesDrawMode ) {

			console.warn( 'THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles.' );
			return geometry;

		}

		if ( drawMode === THREE.TriangleFanDrawMode || drawMode === THREE.TriangleStripDrawMode ) {

			var index = geometry.getIndex();

			// generate index if not present

			if ( index === null ) {

				var indices = [];

				var position = geometry.getAttribute( 'position' );

				if ( position !== undefined ) {

					for ( var i = 0; i < position.count; i ++ ) {

						indices.push( i );

					}

					geometry.setIndex( indices );
					index = geometry.getIndex();

				} else {

					console.error( 'THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible.' );
					return geometry;

				}

			}

			//

			var numberOfTriangles = index.count - 2;
			var newIndices = [];

			if ( drawMode === THREE.TriangleFanDrawMode ) {

				// gl.TRIANGLE_FAN

				for ( var i = 1; i <= numberOfTriangles; i ++ ) {

					newIndices.push( index.getX( 0 ) );
					newIndices.push( index.getX( i ) );
					newIndices.push( index.getX( i + 1 ) );

				}

			} else {

				// gl.TRIANGLE_STRIP

				for ( var i = 0; i < numberOfTriangles; i ++ ) {

					if ( i % 2 === 0 ) {

						newIndices.push( index.getX( i ) );
						newIndices.push( index.getX( i + 1 ) );
						newIndices.push( index.getX( i + 2 ) );


					} else {

						newIndices.push( index.getX( i + 2 ) );
						newIndices.push( index.getX( i + 1 ) );
						newIndices.push( index.getX( i ) );

					}

				}

			}

			if ( ( newIndices.length / 3 ) !== numberOfTriangles ) {

				console.error( 'THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.' );

			}

			// build final geometry

			var newGeometry = geometry.clone();
			newGeometry.setIndex( newIndices );
			newGeometry.clearGroups();

			return newGeometry;

		} else {

			console.error( 'THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:', drawMode );
			return geometry;

		}

	}

};

( function () {

	/**
 * Full-screen textured quad shader
 */
	const CopyShader = {
		uniforms: {
			'tDiffuse': {
				value: null
			},
			'opacity': {
				value: 1.0
			}
		},
		vertexShader:
  /* glsl */
  `

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,
		fragmentShader:
  /* glsl */
  `

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );
			gl_FragColor.a *= opacity;


		}`
	};

	THREE.CopyShader = CopyShader;

} )();

( function () {

	class Pass {

		constructor() {

			// if set to true, the pass is processed by the composer
			this.enabled = true; // if set to true, the pass indicates to swap read and write buffer after rendering

			this.needsSwap = true; // if set to true, the pass clears its buffer before rendering

			this.clear = false; // if set to true, the result of the pass is rendered to screen. This is set automatically by EffectComposer.

			this.renderToScreen = false;

		}

		setSize() {}

		render() {

			console.error( 'THREE.Pass: .render() must be implemented in derived pass.' );

		}

	} // Helper for passes that need to fill the viewport with a single quad.


	const _camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 ); // https://github.com/mrdoob/three.js/pull/21358


	const _geometry = new THREE.BufferGeometry();

	_geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( [ - 1, 3, 0, - 1, - 1, 0, 3, - 1, 0 ], 3 ) );

	_geometry.setAttribute( 'uv', new THREE.Float32BufferAttribute( [ 0, 2, 0, 0, 2, 0 ], 2 ) );

	class FullScreenQuad {

		constructor( material ) {

			this._mesh = new THREE.Mesh( _geometry, material );

		}

		dispose() {

			this._mesh.geometry.dispose();

		}

		render( renderer ) {

			renderer.render( this._mesh, _camera );

		}

		get material() {

			return this._mesh.material;

		}

		set material( value ) {

			this._mesh.material = value;

		}

	}

	THREE.FullScreenQuad = FullScreenQuad;
	THREE.Pass = Pass;

} )();

( function () {

	class RenderPass extends THREE.Pass {

		constructor( scene, camera, overrideMaterial, clearColor, clearAlpha ) {

			super();
			this.scene = scene;
			this.camera = camera;
			this.overrideMaterial = overrideMaterial;
			this.clearColor = clearColor;
			this.clearAlpha = clearAlpha !== undefined ? clearAlpha : 0;
			this.clear = true;
			this.clearDepth = false;
			this.needsSwap = false;
			this._oldClearColor = new THREE.Color();

		}

		render( renderer, writeBuffer, readBuffer
			/*, deltaTime, maskActive */
		) {

			const oldAutoClear = renderer.autoClear;
			renderer.autoClear = false;
			let oldClearAlpha, oldOverrideMaterial;

			if ( this.overrideMaterial !== undefined ) {

				oldOverrideMaterial = this.scene.overrideMaterial;
				this.scene.overrideMaterial = this.overrideMaterial;

			}

			if ( this.clearColor ) {

				renderer.getClearColor( this._oldClearColor );
				oldClearAlpha = renderer.getClearAlpha();
				renderer.setClearColor( this.clearColor, this.clearAlpha );

			}

			if ( this.clearDepth ) {

				renderer.clearDepth();

			}

			renderer.setRenderTarget( this.renderToScreen ? null : readBuffer ); // TODO: Avoid using autoClear properties, see https://github.com/mrdoob/three.js/pull/15571#issuecomment-465669600

			if ( this.clear ) renderer.clear( renderer.autoClearColor, renderer.autoClearDepth, renderer.autoClearStencil );
			renderer.render( this.scene, this.camera );

			if ( this.clearColor ) {

				renderer.setClearColor( this._oldClearColor, oldClearAlpha );

			}

			if ( this.overrideMaterial !== undefined ) {

				this.scene.overrideMaterial = oldOverrideMaterial;

			}

			renderer.autoClear = oldAutoClear;

		}

	}

	THREE.RenderPass = RenderPass;

} )();

( function () {

	class ShaderPass extends THREE.Pass {

		constructor( shader, textureID ) {

			super();
			this.textureID = textureID !== undefined ? textureID : 'tDiffuse';

			if ( shader instanceof THREE.ShaderMaterial ) {

				this.uniforms = shader.uniforms;
				this.material = shader;

			} else if ( shader ) {

				this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );
				this.material = new THREE.ShaderMaterial( {
					defines: Object.assign( {}, shader.defines ),
					uniforms: this.uniforms,
					vertexShader: shader.vertexShader,
					fragmentShader: shader.fragmentShader
				} );

			}

			this.fsQuad = new THREE.FullScreenQuad( this.material );

		}

		render( renderer, writeBuffer, readBuffer
			/*, deltaTime, maskActive */
		) {

			if ( this.uniforms[ this.textureID ] ) {

				this.uniforms[ this.textureID ].value = readBuffer.texture;

			}

			this.fsQuad.material = this.material;

			if ( this.renderToScreen ) {

				renderer.setRenderTarget( null );
				this.fsQuad.render( renderer );

			} else {

				renderer.setRenderTarget( writeBuffer ); // TODO: Avoid using autoClear properties, see https://github.com/mrdoob/three.js/pull/15571#issuecomment-465669600

				if ( this.clear ) renderer.clear( renderer.autoClearColor, renderer.autoClearDepth, renderer.autoClearStencil );
				this.fsQuad.render( renderer );

			}

		}

	}

	THREE.ShaderPass = ShaderPass;

} )();

( function () {

	class EffectComposer {

		constructor( renderer, renderTarget ) {

			this.renderer = renderer;

			if ( renderTarget === undefined ) {

				const size = renderer.getSize( new THREE.Vector2() );
				this._pixelRatio = renderer.getPixelRatio();
				this._width = size.width;
				this._height = size.height;
				renderTarget = new THREE.WebGLRenderTarget( this._width * this._pixelRatio, this._height * this._pixelRatio );
				renderTarget.texture.name = 'EffectComposer.rt1';

			} else {

				this._pixelRatio = 1;
				this._width = renderTarget.width;
				this._height = renderTarget.height;

			}

			this.renderTarget1 = renderTarget;
			this.renderTarget2 = renderTarget.clone();
			this.renderTarget2.texture.name = 'EffectComposer.rt2';
			this.writeBuffer = this.renderTarget1;
			this.readBuffer = this.renderTarget2;
			this.renderToScreen = true;
			this.passes = []; // dependencies

			if ( THREE.CopyShader === undefined ) {

				console.error( 'THREE.EffectComposer relies on THREE.CopyShader' );

			}

			if ( THREE.ShaderPass === undefined ) {

				console.error( 'THREE.EffectComposer relies on THREE.ShaderPass' );

			}

			this.copyPass = new THREE.ShaderPass( THREE.CopyShader );
			this.clock = new THREE.Clock();

		}

		swapBuffers() {

			const tmp = this.readBuffer;
			this.readBuffer = this.writeBuffer;
			this.writeBuffer = tmp;

		}

		addPass( pass ) {

			this.passes.push( pass );
			pass.setSize( this._width * this._pixelRatio, this._height * this._pixelRatio );

		}

		insertPass( pass, index ) {

			this.passes.splice( index, 0, pass );
			pass.setSize( this._width * this._pixelRatio, this._height * this._pixelRatio );

		}

		removePass( pass ) {

			const index = this.passes.indexOf( pass );

			if ( index !== - 1 ) {

				this.passes.splice( index, 1 );

			}

		}

		isLastEnabledPass( passIndex ) {

			for ( let i = passIndex + 1; i < this.passes.length; i ++ ) {

				if ( this.passes[ i ].enabled ) {

					return false;

				}

			}

			return true;

		}

		render( deltaTime ) {

			// deltaTime value is in seconds
			if ( deltaTime === undefined ) {

				deltaTime = this.clock.getDelta();

			}

			const currentRenderTarget = this.renderer.getRenderTarget();
			let maskActive = false;

			for ( let i = 0, il = this.passes.length; i < il; i ++ ) {

				const pass = this.passes[ i ];
				if ( pass.enabled === false ) continue;
				pass.renderToScreen = this.renderToScreen && this.isLastEnabledPass( i );
				pass.render( this.renderer, this.writeBuffer, this.readBuffer, deltaTime, maskActive );

				if ( pass.needsSwap ) {

					if ( maskActive ) {

						const context = this.renderer.getContext();
						const stencil = this.renderer.state.buffers.stencil; //context.stencilFunc( context.NOTEQUAL, 1, 0xffffffff );

						stencil.setFunc( context.NOTEQUAL, 1, 0xffffffff );
						this.copyPass.render( this.renderer, this.writeBuffer, this.readBuffer, deltaTime ); //context.stencilFunc( context.EQUAL, 1, 0xffffffff );

						stencil.setFunc( context.EQUAL, 1, 0xffffffff );

					}

					this.swapBuffers();

				}

				if ( THREE.MaskPass !== undefined ) {

					if ( pass instanceof THREE.MaskPass ) {

						maskActive = true;

					} else if ( pass instanceof THREE.ClearMaskPass ) {

						maskActive = false;

					}

				}

			}

			this.renderer.setRenderTarget( currentRenderTarget );

		}

		reset( renderTarget ) {

			if ( renderTarget === undefined ) {

				const size = this.renderer.getSize( new THREE.Vector2() );
				this._pixelRatio = this.renderer.getPixelRatio();
				this._width = size.width;
				this._height = size.height;
				renderTarget = this.renderTarget1.clone();
				renderTarget.setSize( this._width * this._pixelRatio, this._height * this._pixelRatio );

			}

			this.renderTarget1.dispose();
			this.renderTarget2.dispose();
			this.renderTarget1 = renderTarget;
			this.renderTarget2 = renderTarget.clone();
			this.writeBuffer = this.renderTarget1;
			this.readBuffer = this.renderTarget2;

		}

		setSize( width, height ) {

			this._width = width;
			this._height = height;
			const effectiveWidth = this._width * this._pixelRatio;
			const effectiveHeight = this._height * this._pixelRatio;
			this.renderTarget1.setSize( effectiveWidth, effectiveHeight );
			this.renderTarget2.setSize( effectiveWidth, effectiveHeight );

			for ( let i = 0; i < this.passes.length; i ++ ) {

				this.passes[ i ].setSize( effectiveWidth, effectiveHeight );

			}

		}

		setPixelRatio( pixelRatio ) {

			this._pixelRatio = pixelRatio;
			this.setSize( this._width, this._height );

		}

	}

	class Pass {

		constructor() {

			// if set to true, the pass is processed by the composer
			this.enabled = true; // if set to true, the pass indicates to swap read and write buffer after rendering

			this.needsSwap = true; // if set to true, the pass clears its buffer before rendering

			this.clear = false; // if set to true, the result of the pass is rendered to screen. This is set automatically by EffectComposer.

			this.renderToScreen = false;

		}

		setSize() {}

		render() {

			console.error( 'THREE.Pass: .render() must be implemented in derived pass.' );

		}

	} // Helper for passes that need to fill the viewport with a single quad.


	const _camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 ); // https://github.com/mrdoob/three.js/pull/21358


	const _geometry = new THREE.BufferGeometry();

	_geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( [ - 1, 3, 0, - 1, - 1, 0, 3, - 1, 0 ], 3 ) );

	_geometry.setAttribute( 'uv', new THREE.Float32BufferAttribute( [ 0, 2, 0, 0, 2, 0 ], 2 ) );

	class FullScreenQuad {

		constructor( material ) {

			this._mesh = new THREE.Mesh( _geometry, material );

		}

		dispose() {

			this._mesh.geometry.dispose();

		}

		render( renderer ) {

			renderer.render( this._mesh, _camera );

		}

		get material() {

			return this._mesh.material;

		}

		set material( value ) {

			this._mesh.material = value;

		}

	}

	THREE.EffectComposer = EffectComposer;
	THREE.FullScreenQuad = FullScreenQuad;
	THREE.Pass = Pass;

} )();

( function () {

	/**
 * Luminosity
 * http://en.wikipedia.org/wiki/Luminosity
 */

	const LuminosityHighPassShader = {
		shaderID: 'luminosityHighPass',
		uniforms: {
			'tDiffuse': {
				value: null
			},
			'luminosityThreshold': {
				value: 1.0
			},
			'smoothWidth': {
				value: 1.0
			},
			'defaultColor': {
				value: new THREE.Color( 0x000000 )
			},
			'defaultOpacity': {
				value: 0.0
			}
		},
		vertexShader:
  /* glsl */
  `

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,
		fragmentShader:
  /* glsl */
  `

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			vec3 luma = vec3( 0.299, 0.587, 0.114 );

			float v = dot( texel.xyz, luma );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`
	};

	THREE.LuminosityHighPassShader = LuminosityHighPassShader;

} )();

( function () {

	/**
 * UnrealBloomPass is inspired by the bloom pass of Unreal Engine. It creates a
 * mip map chain of bloom textures and blurs them with different radii. Because
 * of the weighted combination of mips, and because larger blurs are done on
 * higher mips, this effect provides good quality and performance.
 *
 * Reference:
 * - https://docs.unrealengine.com/latest/INT/Engine/Rendering/PostProcessEffects/Bloom/
 */

	class UnrealBloomPass extends THREE.Pass {

		constructor( resolution, strength, radius, threshold ) {

			super();
			this.strength = strength !== undefined ? strength : 1;
			this.radius = radius;
			this.threshold = threshold;
			this.resolution = resolution !== undefined ? new THREE.Vector2( resolution.x, resolution.y ) : new THREE.Vector2( 256, 256 ); // create color only once here, reuse it later inside the render function

			this.clearColor = new THREE.Color( 0, 0, 0 ); // render targets

			this.renderTargetsHorizontal = [];
			this.renderTargetsVertical = [];
			this.nMips = 5;
			let resx = Math.round( this.resolution.x / 2 );
			let resy = Math.round( this.resolution.y / 2 );
			this.renderTargetBright = new THREE.WebGLRenderTarget( resx, resy );
			this.renderTargetBright.texture.name = 'UnrealBloomPass.bright';
			this.renderTargetBright.texture.generateMipmaps = false;

			for ( let i = 0; i < this.nMips; i ++ ) {

				const renderTargetHorizonal = new THREE.WebGLRenderTarget( resx, resy );
				renderTargetHorizonal.texture.name = 'UnrealBloomPass.h' + i;
				renderTargetHorizonal.texture.generateMipmaps = false;
				this.renderTargetsHorizontal.push( renderTargetHorizonal );
				const renderTargetVertical = new THREE.WebGLRenderTarget( resx, resy );
				renderTargetVertical.texture.name = 'UnrealBloomPass.v' + i;
				renderTargetVertical.texture.generateMipmaps = false;
				this.renderTargetsVertical.push( renderTargetVertical );
				resx = Math.round( resx / 2 );
				resy = Math.round( resy / 2 );

			} // luminosity high pass material


			if ( THREE.LuminosityHighPassShader === undefined ) console.error( 'THREE.UnrealBloomPass relies on THREE.LuminosityHighPassShader' );
			const highPassShader = THREE.LuminosityHighPassShader;
			this.highPassUniforms = THREE.UniformsUtils.clone( highPassShader.uniforms );
			this.highPassUniforms[ 'luminosityThreshold' ].value = threshold;
			this.highPassUniforms[ 'smoothWidth' ].value = 0.01;
			this.materialHighPassFilter = new THREE.ShaderMaterial( {
				uniforms: this.highPassUniforms,
				vertexShader: highPassShader.vertexShader,
				fragmentShader: highPassShader.fragmentShader,
				defines: {}
			} ); // Gaussian Blur Materials

			this.separableBlurMaterials = [];
			const kernelSizeArray = [ 3, 5, 7, 9, 11 ];
			resx = Math.round( this.resolution.x / 2 );
			resy = Math.round( this.resolution.y / 2 );

			for ( let i = 0; i < this.nMips; i ++ ) {

				this.separableBlurMaterials.push( this.getSeperableBlurMaterial( kernelSizeArray[ i ] ) );
				this.separableBlurMaterials[ i ].uniforms[ 'texSize' ].value = new THREE.Vector2( resx, resy );
				resx = Math.round( resx / 2 );
				resy = Math.round( resy / 2 );

			} // Composite material


			this.compositeMaterial = this.getCompositeMaterial( this.nMips );
			this.compositeMaterial.uniforms[ 'blurTexture1' ].value = this.renderTargetsVertical[ 0 ].texture;
			this.compositeMaterial.uniforms[ 'blurTexture2' ].value = this.renderTargetsVertical[ 1 ].texture;
			this.compositeMaterial.uniforms[ 'blurTexture3' ].value = this.renderTargetsVertical[ 2 ].texture;
			this.compositeMaterial.uniforms[ 'blurTexture4' ].value = this.renderTargetsVertical[ 3 ].texture;
			this.compositeMaterial.uniforms[ 'blurTexture5' ].value = this.renderTargetsVertical[ 4 ].texture;
			this.compositeMaterial.uniforms[ 'bloomStrength' ].value = strength;
			this.compositeMaterial.uniforms[ 'bloomRadius' ].value = 0.1;
			this.compositeMaterial.needsUpdate = true;
			const bloomFactors = [ 1.0, 0.8, 0.6, 0.4, 0.2 ];
			this.compositeMaterial.uniforms[ 'bloomFactors' ].value = bloomFactors;
			this.bloomTintColors = [ new THREE.Vector3( 1, 1, 1 ), new THREE.Vector3( 1, 1, 1 ), new THREE.Vector3( 1, 1, 1 ), new THREE.Vector3( 1, 1, 1 ), new THREE.Vector3( 1, 1, 1 ) ];
			this.compositeMaterial.uniforms[ 'bloomTintColors' ].value = this.bloomTintColors; // copy material

			if ( THREE.CopyShader === undefined ) {

				console.error( 'THREE.UnrealBloomPass relies on THREE.CopyShader' );

			}

			const copyShader = THREE.CopyShader;
			this.copyUniforms = THREE.UniformsUtils.clone( copyShader.uniforms );
			this.copyUniforms[ 'opacity' ].value = 1.0;
			this.materialCopy = new THREE.ShaderMaterial( {
				uniforms: this.copyUniforms,
				vertexShader: copyShader.vertexShader,
				fragmentShader: copyShader.fragmentShader,
				blending: THREE.AdditiveBlending,
				depthTest: false,
				depthWrite: false,
				transparent: true
			} );
			this.enabled = true;
			this.needsSwap = false;
			this._oldClearColor = new THREE.Color();
			this.oldClearAlpha = 1;
			this.basic = new THREE.MeshBasicMaterial();
			this.fsQuad = new THREE.FullScreenQuad( null );

		}

		dispose() {

			for ( let i = 0; i < this.renderTargetsHorizontal.length; i ++ ) {

				this.renderTargetsHorizontal[ i ].dispose();

			}

			for ( let i = 0; i < this.renderTargetsVertical.length; i ++ ) {

				this.renderTargetsVertical[ i ].dispose();

			}

			this.renderTargetBright.dispose();

		}

		setSize( width, height ) {

			let resx = Math.round( width / 2 );
			let resy = Math.round( height / 2 );
			this.renderTargetBright.setSize( resx, resy );

			for ( let i = 0; i < this.nMips; i ++ ) {

				this.renderTargetsHorizontal[ i ].setSize( resx, resy );
				this.renderTargetsVertical[ i ].setSize( resx, resy );
				this.separableBlurMaterials[ i ].uniforms[ 'texSize' ].value = new THREE.Vector2( resx, resy );
				resx = Math.round( resx / 2 );
				resy = Math.round( resy / 2 );

			}

		}

		render( renderer, writeBuffer, readBuffer, deltaTime, maskActive ) {

			renderer.getClearColor( this._oldClearColor );
			this.oldClearAlpha = renderer.getClearAlpha();
			const oldAutoClear = renderer.autoClear;
			renderer.autoClear = false;
			renderer.setClearColor( this.clearColor, 0 );
			if ( maskActive ) renderer.state.buffers.stencil.setTest( false ); // Render input to screen

			if ( this.renderToScreen ) {

				this.fsQuad.material = this.basic;
				this.basic.map = readBuffer.texture;
				renderer.setRenderTarget( null );
				renderer.clear();
				this.fsQuad.render( renderer );

			} // 1. Extract Bright Areas


			this.highPassUniforms[ 'tDiffuse' ].value = readBuffer.texture;
			this.highPassUniforms[ 'luminosityThreshold' ].value = this.threshold;
			this.fsQuad.material = this.materialHighPassFilter;
			renderer.setRenderTarget( this.renderTargetBright );
			renderer.clear();
			this.fsQuad.render( renderer ); // 2. Blur All the mips progressively

			let inputRenderTarget = this.renderTargetBright;

			for ( let i = 0; i < this.nMips; i ++ ) {

				this.fsQuad.material = this.separableBlurMaterials[ i ];
				this.separableBlurMaterials[ i ].uniforms[ 'colorTexture' ].value = inputRenderTarget.texture;
				this.separableBlurMaterials[ i ].uniforms[ 'direction' ].value = UnrealBloomPass.BlurDirectionX;
				renderer.setRenderTarget( this.renderTargetsHorizontal[ i ] );
				renderer.clear();
				this.fsQuad.render( renderer );
				this.separableBlurMaterials[ i ].uniforms[ 'colorTexture' ].value = this.renderTargetsHorizontal[ i ].texture;
				this.separableBlurMaterials[ i ].uniforms[ 'direction' ].value = UnrealBloomPass.BlurDirectionY;
				renderer.setRenderTarget( this.renderTargetsVertical[ i ] );
				renderer.clear();
				this.fsQuad.render( renderer );
				inputRenderTarget = this.renderTargetsVertical[ i ];

			} // Composite All the mips


			this.fsQuad.material = this.compositeMaterial;
			this.compositeMaterial.uniforms[ 'bloomStrength' ].value = this.strength;
			this.compositeMaterial.uniforms[ 'bloomRadius' ].value = this.radius;
			this.compositeMaterial.uniforms[ 'bloomTintColors' ].value = this.bloomTintColors;
			renderer.setRenderTarget( this.renderTargetsHorizontal[ 0 ] );
			renderer.clear();
			this.fsQuad.render( renderer ); // Blend it additively over the input texture

			this.fsQuad.material = this.materialCopy;
			this.copyUniforms[ 'tDiffuse' ].value = this.renderTargetsHorizontal[ 0 ].texture;
			if ( maskActive ) renderer.state.buffers.stencil.setTest( true );

			if ( this.renderToScreen ) {

				renderer.setRenderTarget( null );
				this.fsQuad.render( renderer );

			} else {

				renderer.setRenderTarget( readBuffer );
				this.fsQuad.render( renderer );

			} // Restore renderer settings


			renderer.setClearColor( this._oldClearColor, this.oldClearAlpha );
			renderer.autoClear = oldAutoClear;

		}

		getSeperableBlurMaterial( kernelRadius ) {

			return new THREE.ShaderMaterial( {
				defines: {
					'KERNEL_RADIUS': kernelRadius,
					'SIGMA': kernelRadius
				},
				uniforms: {
					'colorTexture': {
						value: null
					},
					'texSize': {
						value: new THREE.Vector2( 0.5, 0.5 )
					},
					'direction': {
						value: new THREE.Vector2( 0.5, 0.5 )
					}
				},
				vertexShader: `varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,
				fragmentShader: `#include <common>
				varying vec2 vUv;
				uniform sampler2D colorTexture;
				uniform vec2 texSize;
				uniform vec2 direction;

				float gaussianPdf(in float x, in float sigma) {
					return 0.39894 * exp( -0.5 * x * x/( sigma * sigma))/sigma;
				}
				void main() {
					vec2 invSize = 1.0 / texSize;
					float fSigma = float(SIGMA);
					float weightSum = gaussianPdf(0.0, fSigma);
					vec3 diffuseSum = texture2D( colorTexture, vUv).rgb * weightSum;
					for( int i = 1; i < KERNEL_RADIUS; i ++ ) {
						float x = float(i);
						float w = gaussianPdf(x, fSigma);
						vec2 uvOffset = direction * invSize * x;
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset).rgb;
						diffuseSum += (sample1 + sample2) * w;
						weightSum += 2.0 * w;
					}
					gl_FragColor = vec4(diffuseSum/weightSum, 1.0);
				}`
			} );

		}

		getCompositeMaterial( nMips ) {

			return new THREE.ShaderMaterial( {
				defines: {
					'NUM_MIPS': nMips
				},
				uniforms: {
					'blurTexture1': {
						value: null
					},
					'blurTexture2': {
						value: null
					},
					'blurTexture3': {
						value: null
					},
					'blurTexture4': {
						value: null
					},
					'blurTexture5': {
						value: null
					},
					'dirtTexture': {
						value: null
					},
					'bloomStrength': {
						value: 1.0
					},
					'bloomFactors': {
						value: null
					},
					'bloomTintColors': {
						value: null
					},
					'bloomRadius': {
						value: 0.0
					}
				},
				vertexShader: `varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,
				fragmentShader: `varying vec2 vUv;
				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform sampler2D dirtTexture;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor(const in float factor) {
					float mirrorFactor = 1.2 - factor;
					return mix(factor, mirrorFactor, bloomRadius);
				}

				void main() {
					gl_FragColor = bloomStrength * ( lerpBloomFactor(bloomFactors[0]) * vec4(bloomTintColors[0], 1.0) * texture2D(blurTexture1, vUv) +
						lerpBloomFactor(bloomFactors[1]) * vec4(bloomTintColors[1], 1.0) * texture2D(blurTexture2, vUv) +
						lerpBloomFactor(bloomFactors[2]) * vec4(bloomTintColors[2], 1.0) * texture2D(blurTexture3, vUv) +
						lerpBloomFactor(bloomFactors[3]) * vec4(bloomTintColors[3], 1.0) * texture2D(blurTexture4, vUv) +
						lerpBloomFactor(bloomFactors[4]) * vec4(bloomTintColors[4], 1.0) * texture2D(blurTexture5, vUv) );
				}`
			} );

		}

	}

	UnrealBloomPass.BlurDirectionX = new THREE.Vector2( 1.0, 0.0 );
	UnrealBloomPass.BlurDirectionY = new THREE.Vector2( 0.0, 1.0 );

	THREE.UnrealBloomPass = UnrealBloomPass;

} )();

/**
 * @author yomboprime https://github.com/yomboprime
 *
 * StarrySkyComputationRenderer, based on SimulationRenderer by zz85
 *
 * The StarrySkyComputationRenderer uses the concept of variables. These variables are RGBA float textures that hold 4 floats
 * for each compute element (texel)
 *
 * Each variable has a fragment shader that defines the computation made to obtain the variable in question.
 * You can use as many variables you need, and make dependencies so you can use textures of other variables in the shader
 * (the sampler uniforms are added automatically) Most of the variables will need themselves as dependency.
 *
 * The renderer has actually two render targets per variable, to make ping-pong. Textures from the current frame are used
 * as inputs to render the textures of the next frame.
 *
 * The render targets of the variables can be used as input textures for your visualization shaders.
 *
 * Variable names should be valid identifiers and should not collide with THREE GLSL used identifiers.
 * a common approach could be to use 'texture' prefixing the variable name; i.e texturePosition, textureVelocity...
 *
 * The size of the computation (sizeX * sizeY) is defined as 'resolution' automatically in the shader. For example:
 * #DEFINE resolution vec2( 1024.0, 1024.0 )
 *
 * -------------
 *
 * Basic use:
 *
 * // Initialization...
 *
 * // Create computation renderer
 * var gpuCompute = new THREE.StarrySkyComputationRenderer( 1024, 1024, renderer );
 *
 * // Create initial state float textures
 * var pos0 = gpuCompute.createTexture();
 * var vel0 = gpuCompute.createTexture();
 * // and fill in here the texture data...
 *
 * // Add texture variables
 * var velVar = gpuCompute.addVariable( "textureVelocity", fragmentShaderVel, pos0 );
 * var posVar = gpuCompute.addVariable( "texturePosition", fragmentShaderPos, vel0 );
 *
 * // Add variable dependencies
 * gpuCompute.setVariableDependencies( velVar, [ velVar, posVar ] );
 * gpuCompute.setVariableDependencies( posVar, [ velVar, posVar ] );
 *
 * // Add custom uniforms
 * velVar.material.uniforms.time = { value: 0.0 };
 *
 * // Check for completeness
 * var error = gpuCompute.init();
 * if ( error !== null ) {
 *		console.error( error );
  * }
 *
 *
 * // In each frame...
 *
 * // Compute!
 * gpuCompute.compute();
 *
 * // Update texture uniforms in your visualization materials with the gpu renderer output
 * myMaterial.uniforms.myTexture.value = gpuCompute.getCurrentRenderTarget( posVar ).texture;
 *
 * // Do your rendering
 * renderer.render( myScene, myCamera );
 *
 * -------------
 *
 * Also, you can use utility functions to create ShaderMaterial and perform computations (rendering between textures)
 * Note that the shaders can have multiple input textures.
 *
 * var myFilter1 = gpuCompute.createShaderMaterial( myFilterFragmentShader1, { theTexture: { value: null } } );
 * var myFilter2 = gpuCompute.createShaderMaterial( myFilterFragmentShader2, { theTexture: { value: null } } );
 *
 * var inputTexture = gpuCompute.createTexture();
 *
 * // Fill in here inputTexture...
 *
 * myFilter1.uniforms.theTexture.value = inputTexture;
 *
 * var myRenderTarget = gpuCompute.createRenderTarget();
 * myFilter2.uniforms.theTexture.value = myRenderTarget.texture;
 *
 * var outputRenderTarget = gpuCompute.createRenderTarget();
 *
 * // Now use the output texture where you want:
 * myMaterial.uniforms.map.value = outputRenderTarget.texture;
 *
 * // And compute each frame, before rendering to screen:
 * gpuCompute.doRenderTarget( myFilter1, myRenderTarget );
 * gpuCompute.doRenderTarget( myFilter2, outputRenderTarget );
 *
 *
 *
 * @param {int} sizeX Computation problem size is always 2d: sizeX * sizeY elements.
 * @param {int} sizeY Computation problem size is always 2d: sizeX * sizeY elements.
 * @param {WebGLRenderer} renderer The renderer
  */

//Like our normal GPU Compute Renderer, but with calculated tangents
//
//NOTE: This is almost like GPU Compute renderer, but it also includes attributes for our tangents
//so we can do multi-pass rendering on our moon.
//
THREE.StarrySkyComputationRenderer = function ( sizeX, sizeY, renderer, computeTangets = false) {

	this.variables = [];

	this.currentTextureIndex = 0;

	var scene = new THREE.Scene();

	var camera = new THREE.Camera();
	camera.position.z = 1;

	var passThruUniforms = {
		passThruTexture: { value: null }
	};

	var passThruShader = createShaderMaterial( getPassThroughFragmentShader(), passThruUniforms );

  let planeGeometry = new THREE.PlaneBufferGeometry( 2, 2 );
  if(computeTangets){
    THREE.BufferGeometryUtils.computeTangents(planeGeometry);
  }
	let mesh = new THREE.Mesh(planeGeometry , passThruShader );
	scene.add( mesh );

  let self = this;
	this.addVariable = function ( variableName, computeFragmentShader, initialValueTexture ) {

		var material = this.createShaderMaterial( computeFragmentShader );

		var variable = {
			name: variableName,
			initialValueTexture: initialValueTexture,
			material: material,
			dependencies: null,
			renderTargets: [],
			wrapS: null,
			wrapT: null,
			minFilter: THREE.NearestFilter,
			magFilter: THREE.NearestFilter
		};

		this.variables.push( variable );

		return variable;

	};

	this.setVariableDependencies = function ( variable, dependencies ) {

		variable.dependencies = dependencies;

	};

	this.init = function () {

		if ( ! renderer.capabilities.isWebGL2 &&
			 ! renderer.extensions.get( "OES_texture_float" ) ) {

			return "No OES_texture_float support for float textures.";

		}

		if ( renderer.capabilities.maxVertexTextures === 0 ) {

			return "No support for vertex shader textures.";

		}

		for ( var i = 0; i < this.variables.length; i ++ ) {

			var variable = this.variables[ i ];

			// Creates rendertargets and initialize them with input texture
			variable.renderTargets[ 0 ] = this.createRenderTarget( sizeX, sizeY, variable.wrapS, variable.wrapT, variable.minFilter, variable.magFilter );
			variable.renderTargets[ 1 ] = this.createRenderTarget( sizeX, sizeY, variable.wrapS, variable.wrapT, variable.minFilter, variable.magFilter );
			this.renderTexture( variable.initialValueTexture, variable.renderTargets[ 0 ] );
			this.renderTexture( variable.initialValueTexture, variable.renderTargets[ 1 ] );

			// Adds dependencies uniforms to the ShaderMaterial
			var material = variable.material;
			var uniforms = material.uniforms;
			if ( variable.dependencies !== null ) {

				for ( var d = 0; d < variable.dependencies.length; d ++ ) {

					var depVar = variable.dependencies[ d ];

					if ( depVar.name !== variable.name ) {

						// Checks if variable exists
						var found = false;
						for ( var j = 0; j < this.variables.length; j ++ ) {

							if ( depVar.name === this.variables[ j ].name ) {

								found = true;
								break;

							}

						}
						if ( ! found ) {

							return "Variable dependency not found. Variable=" + variable.name + ", dependency=" + depVar.name;

						}

					}

					uniforms[ depVar.name ] = { value: null };

					material.fragmentShader = "\nuniform sampler2D " + depVar.name + ";\n" + material.fragmentShader;

				}

			}

		}

		this.currentTextureIndex = 0;

		return null;

	};

	this.compute = function () {

		var currentTextureIndex = this.currentTextureIndex;
		var nextTextureIndex = this.currentTextureIndex === 0 ? 1 : 0;

		for ( var i = 0, il = this.variables.length; i < il; i ++ ) {

			var variable = this.variables[ i ];

			// Sets texture dependencies uniforms
			if ( variable.dependencies !== null ) {

				var uniforms = variable.material.uniforms;
				for ( var d = 0, dl = variable.dependencies.length; d < dl; d ++ ) {

					var depVar = variable.dependencies[ d ];

					uniforms[ depVar.name ].value = depVar.renderTargets[ currentTextureIndex ].texture;

				}

			}

			// Performs the computation for this variable
			this.doRenderTarget( variable.material, variable.renderTargets[ nextTextureIndex ] );

		}

		this.currentTextureIndex = nextTextureIndex;

	};

	this.getCurrentRenderTarget = function ( variable ) {

		return variable.renderTargets[ this.currentTextureIndex ];

	};

	this.getAlternateRenderTarget = function ( variable ) {

		return variable.renderTargets[ this.currentTextureIndex === 0 ? 1 : 0 ];

	};

	function addResolutionDefine( materialShader ) {

		materialShader.defines.resolution = 'vec2( ' + sizeX.toFixed( 1 ) + ', ' + sizeY.toFixed( 1 ) + " )";

	}
	this.addResolutionDefine = addResolutionDefine;


	// The following functions can be used to compute things manually

	function createShaderMaterial( computeFragmentShader, uniforms ) {

		uniforms = uniforms || {};

		var material = new THREE.ShaderMaterial( {
			uniforms: uniforms,
			vertexShader: getPassThroughVertexShader(),
			fragmentShader: computeFragmentShader
		} );

		addResolutionDefine( material );

		return material;

	}

	this.createShaderMaterial = createShaderMaterial;

	this.createRenderTarget = function ( sizeXTexture, sizeYTexture, wrapS, wrapT, minFilter, magFilter ) {

		sizeXTexture = sizeXTexture || sizeX;
		sizeYTexture = sizeYTexture || sizeY;

		wrapS = wrapS || THREE.ClampToEdgeWrapping;
		wrapT = wrapT || THREE.ClampToEdgeWrapping;

		minFilter = minFilter || THREE.NearestFilter;
		magFilter = magFilter || THREE.NearestFilter;

		var renderTarget = new THREE.WebGLRenderTarget( sizeXTexture, sizeYTexture, {
			wrapS: wrapS,
			wrapT: wrapT,
			minFilter: minFilter,
			magFilter: magFilter,
			type: ( /(iPad|iPhone|iPod)/g.test( navigator.userAgent ) ) ? THREE.HalfFloatType : THREE.FloatType,
			stencilBuffer: false,
			depthBuffer: false
		} );

		return renderTarget;

	};

	this.createTexture = function (inData = false) {
    var data
    if(!inData){
		  data = new Float32Array( sizeX * sizeY * 4 );
    }
    else{
      data = inData;
    }
		return new THREE.DataTexture( data, sizeX, sizeY );
	};

	this.renderTexture = function ( input, output ) {

		// Takes a texture, and render out in rendertarget
		// input = Texture
		// output = RenderTarget

		passThruUniforms.passThruTexture.value = input;

		this.doRenderTarget( passThruShader, output );

		passThruUniforms.passThruTexture.value = null;

	};

	this.doRenderTarget = function ( material, output ) {

		var currentRenderTarget = renderer.getRenderTarget();

		mesh.material = material;

		//Using guidance from https://github.com/mrdoob/three.js/issues/18746#issuecomment-591441598
		var currentXrEnabled = renderer.xr.enabled;
		var currentShadowAutoUpdate = renderer.shadowMap.autoUpdate;

		renderer.xr.enabled = false;
		renderer.shadowMap.autoUpdate = false;

		renderer.setRenderTarget( output );
		renderer.clear();

    renderer.render( scene, camera );

		renderer.xr.enabled = currentXrEnabled;
		renderer.shadowMap.autoUpdate = currentShadowAutoUpdate;

		mesh.material = passThruShader;

		renderer.setRenderTarget( currentRenderTarget );
	};

	// Shaders

	function getPassThroughVertexShader() {

		return	"void main()	{\n" +
				"\n" +
				"	gl_Position = vec4( position, 1.0 );\n" +
				"\n" +
				"}\n";

	}

	function getPassThroughFragmentShader() {

		return	"uniform sampler2D passThruTexture;\n" +
				"\n" +
				"void main() {\n" +
				"\n" +
				"	vec2 uv = gl_FragCoord.xy / resolution.xy;\n" +
				"\n" +
				"	gl_FragColor = texture2D( passThruTexture, uv );\n" +
				"\n" +
				"}\n";

	}

};

//Basic skeleton for the overall namespace of the A-Starry-Sky
StarrySky = {
  DefaultData: {},
  assetPaths: {},
  Materials: {
    Atmosphere: {},
    Stars: {},
    Sun: {},
    Moon: {},
    Postprocessing: {},
    Autoexposure: {}
  },
  Renderers: {},
  LUTlibraries: {}
};

//This is not your usual file, instead it is a kind of fragment file that contains
//a partial glsl fragment file with functions that are used in multiple locations
StarrySky.Materials.Atmosphere.atmosphereFunctions = {
  partialFragmentShader: function(textureWidth, textureHeight, packingWidth, packingHeight, mieG){
    let originalGLSL = [

    '//Based on the work of Oskar Elek',

    '//http://old.cescg.org/CESCG-2009/papers/PragueCUNI-Elek-Oskar09.pdf',

    '//and the thesis from http://publications.lib.chalmers.se/records/fulltext/203057/203057.pdf',

    '//by Gustav Bodare and Edvard Sandberg',



    'const float PI = 3.14159265359;',

    'const float PI_TIMES_FOUR = 12.5663706144;',

    'const float PI_TIMES_TWO = 6.28318530718;',

    'const float PI_OVER_TWO = 1.57079632679;',

    'const float RADIUS_OF_EARTH = 6366.7;',

    'const float RADIUS_OF_EARTH_SQUARED = 40534868.89;',

    'const float RADIUS_OF_EARTH_PLUS_RADIUS_OF_ATMOSPHERE_SQUARED = 41559940.89;',

    'const float RADIUS_ATM_SQUARED_MINUS_RADIUS_EARTH_SQUARED = 1025072.0;',

    'const float ATMOSPHERE_HEIGHT = 80.0;',

    'const float ATMOSPHERE_HEIGHT_SQUARED = 6400.0;',

    'const float ONE_OVER_MIE_SCALE_HEIGHT = 0.833333333333333333333333333333333333;',

    'const float ONE_OVER_RAYLEIGH_SCALE_HEIGHT = 0.125;',

    '//Mie Beta / 0.9, http://www-ljk.imag.fr/Publications/Basilic/com.lmc.publi.PUBLI_Article@11e7cdda2f7_f64b69/article.pdf',

    '//const float EARTH_MIE_BETA_EXTINCTION = 0.00000222222222222222222222222222222222222222;',

    'const float EARTH_MIE_BETA_EXTINCTION = 0.0044444444444444444444444444444444444444444444;',

    'const float ELOK_Z_CONST = 0.9726762775527075;',

    'const float ONE_OVER_EIGHT_PI = 0.039788735772973836;',



    'const float MIE_G = $mieG;',

    'const float MIE_G_SQUARED = $mieGSquared;',

    'const float MIE_PHASE_FUNCTION_COEFFICIENT = $miePhaseFunctionCoefficient; //(1.5 * (1.0 - MIE_G_SQUARED) / (2.0 + MIE_G_SQUARED))',



    '//8 * (PI^3) *(( (n_air^2) - 1)^2) / (3 * N_atmos * ((lambda_color)^4))',

    '//I actually found the values from the ET Engine by Illation',

    '//https://github.com/Illation/ETEngine',

    '//Far more helpful for determining my mie and rayleigh values',

    'const vec3 RAYLEIGH_BETA = vec3(5.8e-3, 1.35e-2, 3.31e-2);',



    '//As per http://skyrenderer.blogspot.com/2012/10/ozone-absorption.html',

    'const float OZONE_PERCENT_OF_RAYLEIGH = 6e-7;',

    'const vec3 OZONE_BETA = vec3(413.470734338, 413.470734338, 2.1112886E-13);',



    '//',

    '//General methods',

    '//',

    'float fModulo(float a, float b){',

      'return (a - (b * floor(a / b)));',

    '}',



    '//',

    '//Scattering functions',

    '//',

    'float rayleighPhaseFunction(float cosTheta){',

      'return 1.12 + 0.4 * cosTheta;',

    '}',



    'float miePhaseFunction(float cosTheta){',

      'return MIE_PHASE_FUNCTION_COEFFICIENT * ((1.0 + cosTheta * cosTheta) / pow(1.0 + MIE_G_SQUARED - 2.0 * MIE_G * cosTheta, 1.5));',

    '}',



    '//',

    '//Sphere Collision methods',

    '//',

    'vec2 intersectRaySphere(vec2 rayOrigin, vec2 rayDirection) {',

        'float b = dot(rayDirection, rayOrigin);',

        'float c = dot(rayOrigin, rayOrigin) - RADIUS_OF_EARTH_PLUS_RADIUS_OF_ATMOSPHERE_SQUARED;',

        'float t = (-b + sqrt((b * b) - c));',

        'return rayOrigin + t * rayDirection;',

    '}',



    '//From page 178 of Real Time Collision Detection by Christer Ericson',

    'bool intersectsSphere(vec2 origin, vec2 direction, float radius){',

      '//presume that the sphere is located at the origin (0,0)',

      'bool collides = true;',

      'float b = dot(origin, direction);',

      'float c = dot(origin, origin) - radius * radius;',

      'if(c > 0.0 && b > 0.0){',

        'collides = false;',

      '}',

      'else{',

        'collides = (b * b - c) < 0.0 ? false : true;',

      '}',

      'return collides;',

    '}',



    '//solar-zenith angle parameterization methods',

    'float inverseParameterizationOfZToCosOfSourceZenith(float z){',

        'return -(log(1.0 - z * ELOK_Z_CONST) + 0.8) / 2.8;',

    '}',



    'float parameterizationOfCosOfSourceZenithToZ(float cosOfSolarZenithAngle){',

      'return (1.0 - exp(-2.8 * cosOfSolarZenithAngle - 0.8)) / ELOK_Z_CONST;',

    '}',



    '//view-zenith angle parameterization methods',

    'float inverseParameterizationOfXToCosOfViewZenith(float x){',

      'return 2.0 * x - 1.0;',

    '}',



    '//height parameterization methods',

    '//[0, 1]',

    'float parameterizationOfCosOfViewZenithToX(float cosOfTheViewAngle){',

      'return 0.5 * (1.0 + cosOfTheViewAngle);',

    '}',



    '//',

    '//Converts the parameterized y to a radius (r + R_e) between R_e and R_e + 80',

    '//[R_earth, R_earth + 80km]',

    'float inverseParameterizationOfYToRPlusRe(float y){',

      'return sqrt(y * y * RADIUS_ATM_SQUARED_MINUS_RADIUS_EARTH_SQUARED + RADIUS_OF_EARTH_SQUARED);',

    '}',



    '//Converts radius (r + R_e) to a y value between 0 and 1',

    'float parameterizationOfHeightToY(float r){',

      'return sqrt((r * r - RADIUS_OF_EARTH_SQUARED) / RADIUS_ATM_SQUARED_MINUS_RADIUS_EARTH_SQUARED);',

    '}',



    '//2D-3D texture conversion methods',

    '//All of this stuff is zero-indexed',

    'const float textureWidth = $textureWidth;',

    'const float textureHeight = $textureHeight;',

    'const float packingWidth = $packingWidth;',

    'const float packingHeight = $packingHeight;',



    'vec3 get3DUVFrom2DUV(vec2 uv2){',

      'vec3 uv3;',

      'vec2 parentTextureDimensions = vec2(textureWidth, textureHeight * packingHeight);',

      'vec2 pixelPosition = uv2 * parentTextureDimensions;',

      'float row = floor(pixelPosition.y / textureHeight);',

      'float rowRemainder = pixelPosition.y - row * textureHeight;',

      'uv3.x = pixelPosition.x / textureWidth;',

      'uv3.y = rowRemainder / textureHeight;',

      'uv3.z = row / packingHeight;',



      'return uv3;',

    '}',
    ];

    const textureDepth = packingWidth * packingHeight;
    const mieGSquared = mieG * mieG;
    const miePhaseCoefficient = (1.5 * (1.0 - mieGSquared) / (2.0 + mieGSquared))

    let updatedLines = [];
    for(let i = 0, numLines = originalGLSL.length; i < numLines; ++i){
      let updatedGLSL = originalGLSL[i].replace(/\$textureWidth/g, textureWidth.toFixed(1));
      updatedGLSL = updatedGLSL.replace(/\$textureHeight/g, textureHeight.toFixed(1));
      updatedGLSL = updatedGLSL.replace(/\$textureDepth/g, textureDepth.toFixed(1));
      updatedGLSL = updatedGLSL.replace(/\$packingWidth/g, packingWidth.toFixed(1));
      updatedGLSL = updatedGLSL.replace(/\$packingHeight/g, packingHeight.toFixed(1));

      updatedGLSL = updatedGLSL.replace(/\$mieGSquared/g, mieGSquared.toFixed(16));
      updatedGLSL = updatedGLSL.replace(/\$miePhaseFunctionCoefficient/g, miePhaseCoefficient.toFixed(16));
      updatedGLSL = updatedGLSL.replace(/\$mieG/g, mieG.toFixed(16));

      updatedLines.push(updatedGLSL);
    }

    return updatedLines.join('\n');
  }
}

StarrySky.Materials.Atmosphere.transmittanceMaterial = {
  uniforms: {},
  fragmentShader: function(numberOfPoints, atmosphereFunctions){
    let originalGLSL = [

    '//Based on the work of Oskar Elek',

    '//http://old.cescg.org/CESCG-2009/papers/PragueCUNI-Elek-Oskar09.pdf',

    '//and the thesis from http://publications.lib.chalmers.se/records/fulltext/203057/203057.pdf',

    '//by Gustav Bodare and Edvard Sandberg',



    '$atmosphericFunctions',



    'void main(){',

      'vec2 uv = gl_FragCoord.xy / resolution.xy;',

      'float r = inverseParameterizationOfYToRPlusRe(uv.y);',

      'float h = r - RADIUS_OF_EARTH;',

      'vec2 pA = vec2(0.0, r);',

      'vec2 p = pA;',

      'float cosOfViewZenith = inverseParameterizationOfXToCosOfViewZenith(uv.x);',

      '//sqrt(1.0 - cos(zenith)^2) = sin(zenith), which is the view direction',

      'vec2 cameraDirection = vec2(sqrt(1.0 - cosOfViewZenith * cosOfViewZenith), cosOfViewZenith);',



      '//Check if we intersect the earth. If so, return a transmittance of zero.',

      '//Otherwise, intersect our ray with the atmosphere.',

      'vec2 pB = intersectRaySphere(vec2(0.0, r), cameraDirection);',

      'vec3 transmittance = vec3(0.0);',

      'float distFromPaToPb = 0.0;',

      'bool intersectsEarth = intersectsSphere(p, cameraDirection, RADIUS_OF_EARTH);',

      'if(!intersectsEarth){',

        'distFromPaToPb = distance(pA, pB);',

        'float chunkLength = distFromPaToPb / $numberOfChunks;',

        'vec2 direction = (pB - pA) / distFromPaToPb;',

        'vec2 deltaP = direction * chunkLength;',



        '//Prime our trapezoidal rule',

        'float previousMieDensity = exp(-h * ONE_OVER_MIE_SCALE_HEIGHT);',

        'float previousRayleighDensity = exp(-h * ONE_OVER_RAYLEIGH_SCALE_HEIGHT);',

        'float totalDensityMie = 0.0;',

        'float totalDensityRayleigh = 0.0;',



        '//Integrate from Pa to Pb to determine the total transmittance',

        '//Using the trapezoidal rule.',

        'float mieDensity;',

        'float rayleighDensity;',

        '#pragma unroll',

        'for(int i = 1; i < $numberOfChunksInt; i++){',

          'p += deltaP;',

          'h = length(p) - RADIUS_OF_EARTH;',

          'mieDensity = exp(-h * ONE_OVER_MIE_SCALE_HEIGHT);',

          'rayleighDensity = exp(-h * ONE_OVER_RAYLEIGH_SCALE_HEIGHT);',

          'totalDensityMie += (previousMieDensity + mieDensity) * chunkLength;',

          'totalDensityRayleigh += (previousRayleighDensity + rayleighDensity) * chunkLength;',



          '//Store our values for the next iteration',

          'previousMieDensity = mieDensity;',

          'previousRayleighDensity = rayleighDensity;',

        '}',

        'totalDensityMie *= 0.5;',

        'totalDensityRayleigh *= 0.5;',



        'float integralOfOzoneDensityFunction = totalDensityRayleigh * OZONE_PERCENT_OF_RAYLEIGH;',

        'transmittance = exp(-1.0 * (totalDensityRayleigh * RAYLEIGH_BETA + EARTH_MIE_BETA_EXTINCTION + integralOfOzoneDensityFunction * OZONE_BETA));',

      '}',



      'gl_FragColor = vec4(transmittance, 1.0);',

    '}',
    ];

    let updatedLines = [];
    let numberOfChunks = numberOfPoints - 1;
    for(let i = 0, numLines = originalGLSL.length; i < numLines; ++i){
      let updatedGLSL = originalGLSL[i].replace(/\$numberOfChunksInt/g, numberOfChunks);
      updatedGLSL = updatedGLSL.replace(/\$numberOfChunks/g, numberOfChunks.toFixed(1));
      updatedGLSL = updatedGLSL.replace(/\$atmosphericFunctions/g, atmosphereFunctions);

      updatedLines.push(updatedGLSL);
    }

    return updatedLines.join('\n');
  }
};

StarrySky.Materials.Atmosphere.singleScatteringMaterial = {
  uniforms: {
    transmittanceTexture: {value: null}
  },
  fragmentShader: function(numberOfPoints, textureWidth, textureHeight, packingWidth, packingHeight, isRayleigh, atmosphereFunctions){
    let originalGLSL = [

    '//Based on the work of Oskar Elek',

    '//http://old.cescg.org/CESCG-2009/papers/PragueCUNI-Elek-Oskar09.pdf',

    '//and the thesis from http://publications.lib.chalmers.se/records/fulltext/203057/203057.pdf',

    '//by Gustav Bodare and Edvard Sandberg',



    'uniform sampler2D transmittanceTexture;',



    '$atmosphericFunctions',



    'void main(){',

      '//This is actually a packed 3D Texture',

      'vec3 uv = get3DUVFrom2DUV(gl_FragCoord.xy/resolution.xy);',

      'float r = inverseParameterizationOfYToRPlusRe(uv.y);',

      'float h = r - RADIUS_OF_EARTH;',

      'vec2 pA = vec2(0.0, r);',

      'vec2 p = pA;',

      'float cosOfViewZenith = inverseParameterizationOfXToCosOfViewZenith(uv.x);',

      'float cosOfSunZenith = inverseParameterizationOfZToCosOfSourceZenith(uv.z);',

      '//sqrt(1.0 - cos(zenith)^2) = sin(zenith), which is the view direction',

      'vec2 cameraDirection = vec2(sqrt(1.0 - cosOfViewZenith * cosOfViewZenith), cosOfViewZenith);',

      'vec2 sunDirection = vec2(sqrt(1.0 - cosOfSunZenith * cosOfSunZenith), cosOfSunZenith);',

      'float initialSunAngle = atan(sunDirection.x, sunDirection.y);',



      '//Check if we intersect the earth. If so, return a transmittance of zero.',

      '//Otherwise, intersect our ray with the atmosphere.',

      'vec2 pB = intersectRaySphere(pA, cameraDirection);',

      'float distFromPaToPb = distance(pA, pB);',

      'float chunkLength = distFromPaToPb / $numberOfChunks;',

      'vec2 direction = (pB - pA) / distFromPaToPb;',

      'vec2 deltaP = direction * chunkLength;',



      'bool intersectsEarth = intersectsSphere(p, cameraDirection, RADIUS_OF_EARTH);',

      'vec3 totalInscattering = vec3(0.0);',

      'if(!intersectsEarth){',

        '//Prime our trapezoidal rule',

        'float previousMieDensity = exp(-h * ONE_OVER_MIE_SCALE_HEIGHT);',

        'float previousRayleighDensity = exp(-h * ONE_OVER_RAYLEIGH_SCALE_HEIGHT);',

        'float totalDensityMie = 0.0;',

        'float totalDensityRayleigh = 0.0;',



        'vec3 transmittancePaToP = vec3(1.0);',

        '//Was better when this was just the initial angle of the sun',

        'vec2 uvt = vec2(parameterizationOfCosOfViewZenithToX(cosOfSunZenith), parameterizationOfHeightToY(r));',

        'vec3 transmittance = transmittancePaToP * texture(transmittanceTexture, uvt).rgb;',



        '#if($isRayleigh)',

          'vec3 previousInscattering = previousMieDensity * transmittance;',

        '#else',

          'vec3 previousInscattering = previousRayleighDensity * transmittance;',

        '#endif',



        '//Integrate from Pa to Pb to determine the total transmittance',

        '//Using the trapezoidal rule.',

        'float mieDensity;',

        'float rayleighDensity;',

        'float integralOfOzoneDensityFunction;',

        'float r_p;',

        'float sunAngle;',

        'vec3 inscattering;',

        '#pragma unroll',

        'for(int i = 1; i < $numberOfChunksInt; i++){',

          'p += deltaP;',

          'r_p = length(p);',

          'h = r_p - RADIUS_OF_EARTH;',



          '//Only inscatter if this point is outside of the earth',

          '//otherwise it contributes nothing to the final result',

          'if(h > 0.0){',

            'sunAngle = initialSunAngle - atan(p.x, p.y);',



            '//Iterate our progress through the transmittance along P',

            '//We do this for both mie and rayleigh as we are reffering to the transmittance here',

            'mieDensity = exp(-h * ONE_OVER_MIE_SCALE_HEIGHT);',

            'rayleighDensity = exp(-h * ONE_OVER_RAYLEIGH_SCALE_HEIGHT);',

            'totalDensityMie += (previousMieDensity + mieDensity) * chunkLength * 0.5;',

            'totalDensityRayleigh += (previousRayleighDensity + rayleighDensity) * chunkLength * 0.5;',

            'integralOfOzoneDensityFunction = totalDensityRayleigh * OZONE_PERCENT_OF_RAYLEIGH;',

            'transmittancePaToP = exp(-1.0 * (totalDensityRayleigh * RAYLEIGH_BETA + totalDensityMie * EARTH_MIE_BETA_EXTINCTION + integralOfOzoneDensityFunction * OZONE_BETA));',



            '//Now that we have the transmittance from Pa to P, get the transmittance from P to Pc',

            '//and combine them to determine the net transmittance',

            'uvt = vec2(parameterizationOfCosOfViewZenithToX(cos(sunAngle)), parameterizationOfHeightToY(r_p));',

            'transmittance = transmittancePaToP * texture(transmittanceTexture, uvt).rgb;',

            '#if($isRayleigh)',

              '//Is Rayleigh Scattering',

              'inscattering = rayleighDensity * transmittance;',

            '#else',

              '//Is Mie Scattering',

              'inscattering = mieDensity * transmittance;',

            '#endif',

            'totalInscattering += (previousInscattering + inscattering) * chunkLength;',



            '//Store our values for the next iteration',

            'previousInscattering = inscattering;',

            'previousMieDensity = mieDensity;',

            'previousRayleighDensity = rayleighDensity;',

          '}',

        '}',



        '//Note that we ignore intensity until the final render as a multiplicative factor',

        '#if($isRayleigh)',

          'totalInscattering *= ONE_OVER_EIGHT_PI * RAYLEIGH_BETA;',

        '#else',

          'totalInscattering *= ONE_OVER_EIGHT_PI * EARTH_MIE_BETA_EXTINCTION  / 0.9;',

        '#endif',

      '}',



      'gl_FragColor = vec4(totalInscattering, 1.0);',

    '}',
    ];

    let updatedLines = [];
    let numberOfChunks = numberOfPoints - 1;
    for(let i = 0, numLines = originalGLSL.length; i < numLines; ++i){
      let updatedGLSL = originalGLSL[i].replace(/\$numberOfChunksInt/g, numberOfChunks);
      updatedGLSL = updatedGLSL.replace(/\$atmosphericFunctions/g, atmosphereFunctions);
      updatedGLSL = updatedGLSL.replace(/\$numberOfChunks/g, numberOfChunks.toFixed(1));
      updatedGLSL = updatedGLSL.replace(/\$textureWidth/g, textureWidth.toFixed(1));
      updatedGLSL = updatedGLSL.replace(/\$textureHeight/g, textureHeight.toFixed(1));

      //Choose which texture to use
      updatedGLSL = updatedGLSL.replace(/\$isRayleigh/g, isRayleigh ? '1' : '0');

      //Texture depth is packingWidth * packingHeight
      updatedGLSL = updatedGLSL.replace(/\$packingWidth/g, packingWidth.toFixed(1));
      updatedGLSL = updatedGLSL.replace(/\$packingHeight/g, packingHeight.toFixed(1));

      updatedLines.push(updatedGLSL);
    }

    return updatedLines.join('\n');
  }
};

StarrySky.Materials.Atmosphere.inscatteringSumMaterial = {
  uniforms: {
    previousInscatteringSum: {'value': null},
    inscatteringTexture : {'value': null},
    isNotFirstIteration: {'value': false}
  },
  fragmentShader: [

    '//Based on the work of Oskar Elek',

    '//http://old.cescg.org/CESCG-2009/papers/PragueCUNI-Elek-Oskar09.pdf',

    '//and the thesis from http://publications.lib.chalmers.se/records/fulltext/203057/203057.pdf',

    '//by Gustav Bodare and Edvard Sandberg',



    'uniform sampler2D inscatteringTexture;',

    'uniform sampler2D previousInscatteringSum;',

    'uniform bool isNotFirstIteration;',



    'void main(){',

      'vec2 uv = gl_FragCoord.xy / resolution.xy;',

      'vec4 kthInscattering = vec4(0.0);',

      'if(isNotFirstIteration){',

        'kthInscattering = texture(previousInscatteringSum, uv);',

      '}',

      'kthInscattering += max(texture(inscatteringTexture, uv), vec4(0.0));',



      'gl_FragColor = vec4(kthInscattering.rgb, 1.0);',

    '}',
  ].join('\n')
};

StarrySky.Materials.Atmosphere.kthInscatteringMaterial = {
  uniforms: {
    transmittanceTexture: {value: null},
    inscatteredLightLUT: {value: null},
  },
  fragmentShader: function(numberOfPoints, textureWidth, textureHeight, packingWidth, packingHeight, mieGCoefficient, isRayleigh, atmosphereFunctions){
    let originalGLSL = [

    '//Based on the work of Oskar Elek',

    '//http://old.cescg.org/CESCG-2009/papers/PragueCUNI-Elek-Oskar09.pdf',

    '//and the thesis from http://publications.lib.chalmers.se/records/fulltext/203057/203057.pdf',

    '//by Gustav Bodare and Edvard Sandberg',

    'precision highp sampler3D;',



    'uniform sampler3D inscatteredLightLUT;',

    'uniform sampler2D transmittanceTexture;',



    'const float mieGCoefficient = $mieGCoefficient;',



    '$atmosphericFunctions',



    'vec3 gatherInscatteredLight(float r, float sunAngleAtP){',

      'float x;',

      'float y = parameterizationOfHeightToY(r);',

      'float z = parameterizationOfCosOfSourceZenithToZ(sunAngleAtP);',

      'vec3 uv3 = vec3(x, y, z);',

      'vec2 inscatteredUV2;',

      'vec3 gatheredInscatteredIntensity = vec3(0.0);',

      'vec3 transmittanceFromPToPb;',

      'vec3 inscatteredLight;',

      'float theta = 0.0;',

      'float angleBetweenCameraAndIncomingRay;',

      'float phaseValue;',

      'float cosAngle;',

      'float deltaTheta = PI_TIMES_TWO / $numberOfChunks;',

      'float depthInPixels = $textureDepth;',



      '#pragma unroll',

      'for(int i = 1; i < $numberOfChunksInt; i++){',

        'theta += deltaTheta;',

        'uv3.x = parameterizationOfCosOfViewZenithToX(cos(theta));',



        '//Get our transmittance value',

        'transmittanceFromPToPb = texture(transmittanceTexture, uv3.xy).rgb;',



        '//Get our value from our 3-D Texture',

        'inscatteredLight = texture(inscatteredLightLUT, uv3).rgb;',



        'angleBetweenCameraAndIncomingRay = abs(fModulo(abs(theta - sunAngleAtP), PI_TIMES_TWO)) - PI;',

        'cosAngle = cos(angleBetweenCameraAndIncomingRay);',

        '#if($isRayleigh)',

          'phaseValue = rayleighPhaseFunction(cosAngle);',

        '#else',

          'phaseValue = miePhaseFunction(cosAngle);',

        '#endif',



        'gatheredInscatteredIntensity += inscatteredLight * phaseValue * transmittanceFromPToPb;',

      '}',

      'return gatheredInscatteredIntensity * PI_TIMES_FOUR / $numberOfChunks;',

    '}',



    'void main(){',

      '//This is actually a packed 3D Texture',

      'vec3 uv = get3DUVFrom2DUV(gl_FragCoord.xy/resolution.xy);',

      'float r = inverseParameterizationOfYToRPlusRe(uv.y);',

      'float h = r - RADIUS_OF_EARTH;',

      'vec2 pA = vec2(0.0, r);',

      'vec2 p = pA;',

      'float cosOfViewZenith = inverseParameterizationOfXToCosOfViewZenith(uv.x);',

      'float cosOfSunZenith = inverseParameterizationOfZToCosOfSourceZenith(uv.z);',

      '//sqrt(1.0 - cos(zenith)^2) = sin(zenith), which is the view direction',

      'vec2 cameraDirection = vec2(sqrt(1.0 - cosOfViewZenith * cosOfViewZenith), cosOfViewZenith);',

      'vec2 sunDirection = vec2(sqrt(1.0 - cosOfSunZenith * cosOfSunZenith), cosOfSunZenith);',

      'float initialSunAngle = atan(sunDirection.x, sunDirection.y);',



      '//Check if we intersect the earth. If so, return a transmittance of zero.',

      '//Otherwise, intersect our ray with the atmosphere.',

      'vec2 pB = intersectRaySphere(pA, cameraDirection);',

      'float distFromPaToPb = distance(pA, pB);',

      'float chunkLength = distFromPaToPb / $numberOfChunks;',

      'vec2 deltaP = cameraDirection * chunkLength;',



      'bool intersectsEarth = intersectsSphere(p, cameraDirection, RADIUS_OF_EARTH);',

      'vec3 totalInscattering = vec3(0.0);',

      'if(!intersectsEarth){',

        '//Prime our trapezoidal rule',

        'float previousMieDensity = exp(-h * ONE_OVER_MIE_SCALE_HEIGHT);',

        'float previousRayleighDensity = exp(-h * ONE_OVER_RAYLEIGH_SCALE_HEIGHT);',

        'float totalDensityMie = 0.0;',

        'float totalDensityRayleigh = 0.0;',



        'vec3 transmittancePaToP = vec3(1.0);',

        'vec2 uvt = vec2(parameterizationOfCosOfViewZenithToX(cosOfSunZenith), parameterizationOfHeightToY(r));',



        'vec3 gatheringFunction = gatherInscatteredLight(length(p), initialSunAngle);',

        '#if($isRayleigh)',

          'vec3 previousInscattering = gatheringFunction * previousMieDensity * transmittancePaToP;',

        '#else',

          'vec3 previousInscattering = gatheringFunction * previousRayleighDensity * transmittancePaToP;',

        '#endif',



        '//Integrate from Pa to Pb to determine the total transmittance',

        '//Using the trapezoidal rule.',

        'float mieDensity;',

        'float rayleighDensity;',

        'float integralOfOzoneDensityFunction;',

        'float r_p;',

        'float sunAngle;',

        'vec3 inscattering;',

        '#pragma unroll',

        'for(int i = 1; i < $numberOfChunksInt; i++){',

          'p += deltaP;',

          'r_p = length(p);',

          'h = r_p - RADIUS_OF_EARTH;',

          '//Only inscatter if this point is outside of the earth',

          '//otherwise it contributes nothing to the final result',

          'if(h > 0.0){',

            'sunAngle = initialSunAngle - atan(p.x, p.y);',



            '//Iterate our progress through the transmittance along P',

            'mieDensity = exp(-h * ONE_OVER_MIE_SCALE_HEIGHT);',

            'rayleighDensity = exp(-h * ONE_OVER_RAYLEIGH_SCALE_HEIGHT);',

            'totalDensityMie += (previousMieDensity + mieDensity) * chunkLength * 0.5;',

            'totalDensityRayleigh += (previousRayleighDensity + rayleighDensity) * chunkLength * 0.5;',

            'integralOfOzoneDensityFunction = totalDensityRayleigh * OZONE_PERCENT_OF_RAYLEIGH;',

            'transmittancePaToP = exp(-1.0 * (totalDensityRayleigh * RAYLEIGH_BETA + totalDensityMie * EARTH_MIE_BETA_EXTINCTION + integralOfOzoneDensityFunction * OZONE_BETA));',



            '//Now that we have the transmittance from Pa to P, get the transmittance from P to Pc',

            '//and combine them to determine the net transmittance',

            'uvt = vec2(parameterizationOfCosOfViewZenithToX(cos(sunAngle)), parameterizationOfHeightToY(r_p));',

            'gatheringFunction = gatherInscatteredLight(r_p, sunAngle);',

            '#if($isRayleigh)',

              'inscattering = gatheringFunction * rayleighDensity * transmittancePaToP;',

            '#else',

              'inscattering = gatheringFunction * mieDensity * transmittancePaToP;',

            '#endif',

            'totalInscattering += (previousInscattering + inscattering) * chunkLength;',



            '//Store our values for the next iteration',

            'previousInscattering = inscattering;',

            'previousMieDensity = mieDensity;',

            'previousRayleighDensity = rayleighDensity;',

          '}',

        '}',

        '#if($isRayleigh)',

          'totalInscattering *= ONE_OVER_EIGHT_PI * RAYLEIGH_BETA;',

        '#else',

          'totalInscattering *= ONE_OVER_EIGHT_PI * EARTH_MIE_BETA_EXTINCTION / 0.9;',

        '#endif',

      '}',



      'gl_FragColor = vec4(totalInscattering, 1.0);',

    '}',
    ];

    let updatedLines = [];
    let numberOfChunks = numberOfPoints - 1;
    let textureDepth = packingWidth * packingHeight;
    for(let i = 0, numLines = originalGLSL.length; i < numLines; ++i){
      let updatedGLSL = originalGLSL[i].replace(/\$numberOfChunksInt/g, numberOfChunks);
      updatedGLSL = updatedGLSL.replace(/\$atmosphericFunctions/g, atmosphereFunctions);
      updatedGLSL = updatedGLSL.replace(/\$numberOfChunks/g, numberOfChunks.toFixed(1));
      updatedGLSL = updatedGLSL.replace(/\$mieGCoefficient/g, mieGCoefficient.toFixed(16));

      //Texture constants
      updatedGLSL = updatedGLSL.replace(/\$textureDepth/g, textureDepth.toFixed(1));
      updatedGLSL = updatedGLSL.replace(/\$textureWidth/g, textureWidth.toFixed(1));
      updatedGLSL = updatedGLSL.replace(/\$textureHeight/g, textureHeight.toFixed(1));
      updatedGLSL = updatedGLSL.replace(/\$packingWidth/g, packingWidth.toFixed(1));
      updatedGLSL = updatedGLSL.replace(/\$packingHeight/g, packingHeight.toFixed(1));


      //Choose which texture to use
      updatedGLSL = updatedGLSL.replace(/\$isRayleigh/g, isRayleigh ? '1' : '0');

      updatedLines.push(updatedGLSL);
    }

    return updatedLines.join('\n');
  }
};

StarrySky.Materials.Atmosphere.atmosphereShader = {
  uniforms: function(isSunShader = false, isMoonShader = false, isMeteringShader = false){
    let uniforms = {
      uTime: {value: 0.0},
      localSiderealTime: {value: 0.0},
      latitude: {value: 0.0},
      sunPosition: {value: new THREE.Vector3()},
      moonPosition: {value: new THREE.Vector3()},
      moonLightColor: {value: new THREE.Vector3()},
      mieInscatteringSum: {value: new THREE.DataTexture3D()},
      rayleighInscatteringSum: {value: new THREE.DataTexture3D()},
      transmittance: {value: null},
      sunHorizonFade: {value: 1.0},
      moonHorizonFade: {value: 1.0},
      scatteringSunIntensity: {value: 20.0},
      scatteringMoonIntensity: {value: 1.4}
    }

    if(!isSunShader && !isMeteringShader){
      uniforms.blueNoiseTexture = {type: 't', value: null};
    }

    //Pass our specific uniforms in here.
    if(isSunShader){
      uniforms.sunAngularDiameterCos = {type: 'f', value: 1.0};
      uniforms.radiusOfSunPlane = {type: 'f', value: 1.0};
      uniforms.moonRadius = {type: 'f', value: 1.0};
      uniforms.worldMatrix = {type: 'mat4', value: new THREE.Matrix4()};
      uniforms.solarEclipseMap = {type: 't', value: null};
      uniforms.moonDiffuseMap = {type: 't', value: null};
    }
    else if(isMoonShader){
      uniforms.moonExposure = {type: 'f', value: 1.0};
      uniforms.moonAngularDiameterCos = {type: 'f', value: 1.0};
      uniforms.sunRadius = {type: 'f', value: 1.0};
      uniforms.radiusOfMoonPlane = {type: 'f', value: 1.0};
      uniforms.distanceToEarthsShadowSquared = {type: 'f', value: 1.0};
      uniforms.oneOverNormalizedLunarDiameter = {type: 'f', value: 1.0};
      uniforms.worldMatrix = {type: 'mat4', value: new THREE.Matrix4()};
      uniforms.sunLightDirection = {type: 'vec3', value: new THREE.Vector3()};
      uniforms.earthsShadowPosition = {type: 'vec3', value: new THREE.Vector3()};
      uniforms.moonDiffuseMap = {type: 't', value: null};
      uniforms.moonNormalMap = {type: 't', value: null};
      uniforms.moonRoughnessMap = {type: 't', value: null};
      uniforms.moonApertureSizeMap = {type: 't', value: null};
      uniforms.moonApertureOrientationMap = {type: 't', value: null};
    }

    if(!isSunShader){
      uniforms.starHashCubemap = {type: 't', value: null};
      uniforms.dimStarData = {type: 't', value: null};
      uniforms.medStarData = {type: 't', value: null};
      uniforms.brightStarData = {type: 't', value: null};
      uniforms.starColorMap = {type: 't', value: null};

      uniforms.mercuryPosition = {type: 'vec3', value: new THREE.Vector3()};
      uniforms.venusPosition = {type: 'vec3', value: new THREE.Vector3()};
      uniforms.marsPosition = {type: 'vec3', value: new THREE.Vector3()};
      uniforms.jupiterPosition = {type: 'vec3', value: new THREE.Vector3()};
      uniforms.saturnPosition = {type: 'vec3', value: new THREE.Vector3()};

      uniforms.mercuryBrightness = {type: 'f', value: 0.0};
      uniforms.venusBrightness = {type: 'f', value: 0.0};
      uniforms.marsBrightness = {type: 'f', value: 0.0};
      uniforms.jupiterBrightness = {type: 'f', value: 0.0};
      uniforms.saturnBrightness = {type: 'f', value: 0.0};
    }

    if(!isSunShader && !isMeteringShader){
      uniforms.starsExposure = {type: 'f', value: -4.0};
    }

    if(isMeteringShader){
      uniforms.sunLuminosity = {type: 'f', value: 20.0};
      uniforms.moonLuminosity = {type: 'f', value: 1.4};
    }

    return uniforms;
  },
  vertexShader: [

    'varying vec3 vWorldPosition;',

    'varying vec3 galacticCoordinates;',

    'varying vec2 screenPosition;',

    'uniform float latitude;',

    'uniform float localSiderealTime;',

    'const float northGalaticPoleRightAscension = 3.36601290657539744989;',

    'const float northGalaticPoleDec = 0.473507826066061614219;',

    'const float sinOfNGP = 0.456010959101623894601;',

    'const float cosOfNGP = 0.8899741598379231031239;',

    'const float piTimes2 = 6.283185307179586476925286;',

    'const float piOver2 = 1.5707963267948966192313;',

    'const float threePiOverTwo = 4.712388980384689857693;',

    'const float pi = 3.141592653589793238462;',



    'void main() {',

      'vec4 worldPosition = modelMatrix * vec4(position, 1.0);',

      'vWorldPosition = normalize(vec3(-worldPosition.z, worldPosition.y, -worldPosition.x));',



      '//Convert coordinate position to RA and DEC',

      'float altitude = piOver2 - acos(vWorldPosition.y);',

      'float azimuth = pi - atan(vWorldPosition.z, vWorldPosition.x);',

      'float declination = asin(sin(latitude) * sin(altitude) - cos(latitude) * cos(altitude) * cos(azimuth));',

      'float hourAngle = atan(sin(azimuth), (cos(azimuth) * sin(latitude) + tan(altitude) * cos(latitude)));',



      '//fmodulo return (a - (b * floor(a / b)));',

      'float a = localSiderealTime - hourAngle;',

      'float rightAscension = a - (piTimes2 * floor(a / piTimes2));',



      '//Convert coordinate position to Galactic Coordinates',

      'float sinOfDec = sin(declination);',

      'float cosOfDec = cos(declination);',

      'float cosOfRaMinusGalacticNGPRa = cos(rightAscension - northGalaticPoleRightAscension);',

      'float galaticLatitude = threePiOverTwo - asin(sinOfNGP * sinOfDec + cosOfNGP * cosOfDec * cosOfRaMinusGalacticNGPRa);',

      'float galaticLongitude = cosOfDec * sin(rightAscension - northGalaticPoleRightAscension);',

      'galaticLongitude = atan(galaticLongitude, cosOfNGP * sinOfDec - sinOfNGP * cosOfDec * cosOfRaMinusGalacticNGPRa) + pi;',

      'galacticCoordinates.x = sin(galaticLatitude) * cos(galaticLongitude);',

      'galacticCoordinates.y = cos(galaticLatitude);',

      'galacticCoordinates.z = sin(galaticLatitude) * sin(galaticLongitude);',



      'vec4 projectionPosition = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',

      'vec3 normalizedPosition = projectionPosition.xyz / projectionPosition.w;',

      'screenPosition = vec2(0.5) + 0.5 * normalizedPosition.xy;',

      'gl_Position = projectionPosition;',

    '}',
  ].join('\n'),
  fragmentShader: function(mieG, textureWidth, textureHeight, packingWidth, packingHeight, atmosphereFunctions, sunCode = false, moonCode = false, meteringCode = false){
    let originalGLSL = [

    'precision highp sampler3D;',



    'varying vec3 vWorldPosition;',

    'varying vec3 galacticCoordinates;',

    'varying vec2 screenPosition;',



    'uniform float uTime;',

    'uniform vec3 sunPosition;',

    'uniform vec3 moonPosition;',

    'uniform float sunHorizonFade;',

    'uniform float moonHorizonFade;',

    'uniform float scatteringMoonIntensity;',

    'uniform float scatteringSunIntensity;',

    'uniform vec3 moonLightColor;',

    'uniform sampler3D mieInscatteringSum;',

    'uniform sampler3D rayleighInscatteringSum;',

    'uniform sampler2D transmittance;',



    '#if(!$isSunPass && !$isMoonPass && !$isMeteringPass)',

    'uniform sampler2D blueNoiseTexture;',

    '#endif',



    '#if(!$isSunPass && !$isMeteringPass)',

      'uniform samplerCube starHashCubemap;',

      'uniform sampler2D dimStarData;',

      'uniform sampler2D medStarData;',

      'uniform sampler2D brightStarData;',

      'uniform sampler2D starColorMap;',



      'uniform vec3 mercuryPosition;',

      'uniform vec3 venusPosition;',

      'uniform vec3 marsPosition;',

      'uniform vec3 jupiterPosition;',

      'uniform vec3 saturnPosition;',



      'uniform float mercuryBrightness;',

      'uniform float venusBrightness;',

      'uniform float marsBrightness;',

      'uniform float jupiterBrightness;',

      'uniform float saturnBrightness;',



      'const vec3 mercuryColor = vec3(1.0);',

      'const vec3 venusColor = vec3(0.913, 0.847, 0.772);',

      'const vec3 marsColor = vec3(0.894, 0.509, 0.317);',

      'const vec3 jupiterColor = vec3(0.901, 0.858, 0.780);',

      'const vec3 saturnColor = vec3(0.905, 0.772, 0.494);',

    '#endif',



    'const float piOver2 = 1.5707963267948966192313;',

    'const float piTimes2 = 6.283185307179586476925286;',

    'const float pi = 3.141592653589793238462;',

    'const vec3 inverseGamma = vec3(0.454545454545454545454545);',

    'const vec3 gamma = vec3(2.2);',



    '#if($isSunPass)',

      'uniform float sunAngularDiameterCos;',

      'uniform float moonRadius;',

      'uniform sampler2D moonDiffuseMap;',

      'uniform sampler2D solarEclipseMap;',

      'varying vec2 vUv;',

      'const float sunDiskIntensity = 30.0;',



      '//From https://twiki.ph.rhul.ac.uk/twiki/pub/Public/Solar_Limb_Darkening_Project/Solar_Limb_Darkening.pdf',

      'const float ac1 = 0.46787619;',

      'const float ac2 = 0.67104811;',

      'const float ac3 = -0.06948355;',

    '#elif($isMoonPass)',

      'uniform float starsExposure;',

      'uniform float moonExposure;',

      'uniform float moonAngularDiameterCos;',

      'uniform float sunRadius;',

      'uniform float distanceToEarthsShadowSquared;',

      'uniform float oneOverNormalizedLunarDiameter;',

      'uniform vec3 earthsShadowPosition;',

      'uniform sampler2D moonDiffuseMap;',

      'uniform sampler2D moonNormalMap;',

      'uniform sampler2D moonRoughnessMap;',

      'uniform sampler2D moonApertureSizeMap;',

      'uniform sampler2D moonApertureOrientationMap;',

      'varying vec2 vUv;',



      '//Tangent space lighting',

      'varying vec3 tangentSpaceSunLightDirection;',

      'varying vec3 tangentSpaceViewDirection;',

    '#elif($isMeteringPass)',

      'varying vec2 vUv;',

      'uniform float moonLuminosity;',

      'uniform float sunLuminosity;',

    '#else',

      'uniform float starsExposure;',

    '#endif',



    '$atmosphericFunctions',



    '#if(!$isSunPass && !$isMeteringPass)',

      'vec3 getSpectralColor(){',

        'return vec3(1.0);',

      '}',



      '//From http://byteblacksmith.com/improvements-to-the-canonical-one-liner-glsl-rand-for-opengl-es-2-0/',

      'float rand(float x){',

        'float a = 12.9898;',

        'float b = 78.233;',

        'float c = 43758.5453;',

        'float dt= dot(vec2(x, x) ,vec2(a,b));',

        'float sn= mod(dt,3.14);',

        'return fract(sin(sn) * c);',

      '}',



      '//From The Book of Shaders :D',

      '//https://thebookofshaders.com/11/',

      'float noise(float x){',

        'float i = floor(x);',

        'float f = fract(x);',

        'float y = mix(rand(i), rand(i + 1.0), smoothstep(0.0,1.0,f));',



        'return y;',

      '}',



      'float brownianNoise(float lacunarity, float gain, float initialAmplitude, float initialFrequency, float timeInSeconds){',

        'float amplitude = initialAmplitude;',

        'float frequency = initialFrequency;',



        '// Loop of octaves',

        'float y = 0.0;',

        'float maxAmplitude = initialAmplitude;',

        'for (int i = 0; i < 5; i++) {',

        '	y += amplitude * noise(frequency * timeInSeconds);',

        '	frequency *= lacunarity;',

        '	amplitude *= gain;',

        '}',



        'return y;',

      '}',



      'const float twinkleDust = 0.0010;',

      'float twinkleFactor(vec3 starposition, float atmosphericDistance, float starBrightness){',

        'float randSeed = uTime * twinkleDust + (starposition.x + starposition.y + starposition.z) * 10000.0;',



        '//lacunarity, gain, initialAmplitude, initialFrequency',

        'return 1.0 + (1.0 - atmosphericDistance) * brownianNoise(0.5, 0.2, starBrightness, 6.0, randSeed);',

      '}',



      'float colorTwinkleFactor(vec3 starposition){',

        'float randSeed = uTime * 0.0007 + (starposition.x + starposition.y + starposition.z) * 10000.0;',



        '//lacunarity, gain, initialAmplitude, initialFrequency',

        'return 0.7 * (2.0 * noise(randSeed) - 1.0);',

      '}',



      'float fastAiry(float r){',

        '//Variation of Airy Disk approximation from https://www.shadertoy.com/view/tlc3zM to create our stars brightness',

        'float one_over_r_cubed = 1.0 / abs(r * r * r);',

        'float gauss_r_over_1_4 = exp(-.5 * (0.71428571428 * r) * (0.71428571428 * r));',

        'return abs(r) < 1.88 ? gauss_r_over_1_4 : abs(r) > 6.0 ? 1.35 * one_over_r_cubed : (gauss_r_over_1_4 + 2.7 * one_over_r_cubed) * 0.5;',

      '}',



      'vec2 getUV2OffsetFromStarColorTemperature(float zCoordinate, float normalizedYPosition, float noise){',

        'float row = clamp(floor(zCoordinate / 4.0), 0.0, 8.0); //range: [0-8]',

        'float col = clamp(zCoordinate - row * 4.0, 0.0, 3.0); //range: [0-3]',



        '//Note: We are still in pixel space, our texture areas are 32 pixels wide',

        '//even though our subtextures are only 30x14 pixels due to 1 pixel padding.',

        'float xOffset = col * 32.0 + 15.0;',

        'float yOffset = row * 16.0 + 1.0;',



        'float xPosition =  xOffset + 13.0 * noise;',

        'float yPosition = yOffset + 15.0 * normalizedYPosition;',



        'return vec2(xPosition / 128.0, yPosition / 128.0);',

      '}',



      'vec3 getStarColor(float temperature, float normalizedYPosition, float noise){',

        '//Convert our temperature to a z-coordinate',

        'float zCoordinate = floor(sqrt((temperature - 2000.0) * (961.0 / 15000.0)));//range: [0-31]',

        'vec2 uv = getUV2OffsetFromStarColorTemperature(zCoordinate, normalizedYPosition, noise);',



        'vec3 starColor = texture(starColorMap, uv).rgb;',

        '//TODO: Vary these to change the color colors',

        '// starColor *= starColor;',

        '// starColor.r *= max((zCoordinate / 31.0), 1.0);',

        '// starColor.g *= max((zCoordinate / 31.0), 1.0);',

        '// starColor.b *= max((zCoordinate / 10.0), 1.0);',

        '// starColor = sqrt(starColor);',



        '//Interpolate between the 2 colors (ZCoordinateC and zCoordinate are never more then 1 apart)',

        'return starColor;',

      '}',



      'vec3 drawStarLight(vec4 starData, vec3 galacticSphericalPosition, vec3 skyPosition, float starAndSkyExposureReduction){',

        '//I hid the temperature inside of the magnitude of the stars equitorial position, as the position vector must be normalized.',

        'float temperature = sqrt(dot(starData.xyz, starData.xyz));',

        'vec3 normalizedStarPosition = starData.xyz / temperature;',



        '//Get the distance the light ray travels',

        'vec2 skyIntersectionPoint = intersectRaySphere(vec2(0.0, RADIUS_OF_EARTH), normalize(vec2(length(vec2(skyPosition.xz)), skyPosition.y)));',

        'vec2 normalizationIntersectionPoint = intersectRaySphere(vec2(0.0, RADIUS_OF_EARTH), vec2(1.0, 0.0));',

        'float distanceToEdgeOfSky = clamp((1.0 - distance(vec2(0.0, RADIUS_OF_EARTH), skyIntersectionPoint) / distance(vec2(0.0, RADIUS_OF_EARTH), normalizationIntersectionPoint)), 0.0, 1.0);',



        "//Use the distance to the star to determine it's perceived twinkling",

        'float starBrightness = pow(150.0, (-starData.a + min(starAndSkyExposureReduction, 2.7)) * 0.20);',

        'float approximateDistanceOnSphereStar = distance(galacticSphericalPosition, normalizedStarPosition) * 1700.0;',



        '//Modify the intensity and color of this star using approximation of stellar scintillation',

        'vec3 starColor = getStarColor(temperature, distanceToEdgeOfSky, colorTwinkleFactor(normalizedStarPosition));',



        '//Pass this brightness into the fast Airy function to make the star glow',

        'starBrightness *= max(fastAiry(approximateDistanceOnSphereStar), 0.0) * twinkleFactor(normalizedStarPosition, distanceToEdgeOfSky, sqrt(starBrightness) + 3.0);',

        'return vec3(sqrt(starBrightness)) * pow(starColor, vec3(1.2));',

      '}',



      'vec3 drawPlanetLight(vec3 planetColor, float planetMagnitude, vec3 planetPosition, vec3 skyPosition, float starAndSkyExposureReduction){',

        "//Use the distance to the star to determine it's perceived twinkling",

        'float planetBrightness = pow(100.0, (-planetMagnitude + starAndSkyExposureReduction) * 0.2);',

        'float approximateDistanceOnSphereStar = distance(skyPosition, planetPosition) * 1400.0;',



        '//Pass this brightness into the fast Airy function to make the star glow',

        'planetBrightness *= max(fastAiry(approximateDistanceOnSphereStar), 0.0);',

        'return sqrt(vec3(planetBrightness)) * planetColor;',

      '}',

    '#endif',



    '#if($isMoonPass)',

    'vec3 getLunarEcclipseShadow(vec3 sphericalPosition){',

      '//Determine the distance from this pixel to the center of the sun.',

      'float distanceToPixel = distance(sphericalPosition, earthsShadowPosition);',

      'float pixelToCenterDistanceInMoonDiameter = 4.0 * distanceToPixel * oneOverNormalizedLunarDiameter;',

      'float umbDistSq = pixelToCenterDistanceInMoonDiameter * pixelToCenterDistanceInMoonDiameter * 0.5;',

      'float pUmbDistSq = umbDistSq * 0.3;',

      'float umbraBrightness = 0.5 + 0.5 * clamp(umbDistSq, 0.0, 1.0);',

      'float penumbraBrightness = 0.15 + 0.85 * clamp(pUmbDistSq, 0.0, 1.0);',

      'float totalBrightness = clamp(min(umbraBrightness, penumbraBrightness), 0.0, 1.0);',



      '//Get color intensity based on distance from penumbra',

      'vec3 colorOfLunarEcclipse = vec3(1.0, 0.45, 0.05);',

      'float colorIntensity = clamp(16.0 * distanceToEarthsShadowSquared * oneOverNormalizedLunarDiameter * oneOverNormalizedLunarDiameter, 0.0, 1.0);',

      'colorOfLunarEcclipse = clamp(colorOfLunarEcclipse + (1.0 - colorOfLunarEcclipse) * colorIntensity, 0.0, 1.0);',



      'return totalBrightness * colorOfLunarEcclipse;',

    '}',

    '#endif',



    'vec3 linearAtmosphericPass(vec3 sourcePosition, vec3 sourceIntensity, vec3 sphericalPosition, sampler3D mieLookupTable, sampler3D rayleighLookupTable, float intensityFader, vec2 uv2OfTransmittance){',

      'float cosOfAngleBetweenCameraPixelAndSource = dot(sourcePosition, sphericalPosition);',

      'float cosOFAngleBetweenZenithAndSource = sourcePosition.y;',

      'vec3 uv3 = vec3(uv2OfTransmittance.x, uv2OfTransmittance.y, parameterizationOfCosOfSourceZenithToZ(cosOFAngleBetweenZenithAndSource));',



      '//Interpolated scattering values',

      'vec3 interpolatedMieScattering = texture(mieLookupTable, uv3).rgb;',

      'vec3 interpolatedRayleighScattering = texture(rayleighLookupTable, uv3).rgb;',



      'return intensityFader * sourceIntensity * (miePhaseFunction(cosOfAngleBetweenCameraPixelAndSource) * interpolatedMieScattering + rayleighPhaseFunction(cosOfAngleBetweenCameraPixelAndSource) * interpolatedRayleighScattering);',

    '}',



    '//Including this because someone removed this in a future version of THREE. Why?!',

    'vec3 MyAESFilmicToneMapping(vec3 color) {',

      'return clamp((color * (2.51 * color + 0.03)) / (color * (2.43 * color + 0.59) + 0.14), 0.0, 1.0);',

    '}',



    'void main(){',



      '#if($isMeteringPass)',

        'float rho = length(vUv.xy);',

        'float height = sqrt(1.0 - rho * rho);',

        'float phi = piOver2 - atan(height, rho);',

        'float theta = atan(vUv.y, vUv.x);',

        'vec3 sphericalPosition;',

        'sphericalPosition.x = sin(phi) * cos(theta);',

        'sphericalPosition.z = sin(phi) * sin(theta);',

        'sphericalPosition.y = cos(phi);',

        'sphericalPosition = normalize(sphericalPosition);',

      '#else',

        'vec3 sphericalPosition = normalize(vWorldPosition);',

      '#endif',



      '//Get our transmittance for this texel',

      '//Note that for uv2OfTransmittance, I am clamping the cosOfViewAngle',

      '//to avoid edge interpolation in the 2-D texture with a different z',

      'float cosOfViewAngle = sphericalPosition.y;',

      'vec2 uv2OfTransmittance = vec2(parameterizationOfCosOfViewZenithToX(max(cosOfViewAngle, 0.0)), parameterizationOfHeightToY(RADIUS_OF_EARTH));',

      'vec3 transmittanceFade = texture(transmittance, uv2OfTransmittance).rgb;',



      '//In the event that we have a moon shader, we need to block out all astronomical light blocked by the moon',

      '#if($isMoonPass)',

        '//Get our lunar occlusion texel',

        'vec2 offsetUV = clamp(vUv * 4.0 - vec2(1.5), vec2(0.0), vec2(1.0));',

        'vec4 lunarDiffuseTexel = texture(moonDiffuseMap, offsetUV);',

        'vec3 lunarDiffuseColor = lunarDiffuseTexel.rgb;',

      '#elif($isSunPass)',

        '//Get our lunar occlusion texel in the frame of the sun',

        'vec2 offsetUV = clamp(vUv * 4.0 - vec2(1.5), vec2(0.0), vec2(1.0));',

        'float lunarMask = texture(moonDiffuseMap, offsetUV).a;',

      '#endif',



      '//Atmosphere (We multiply the scattering sun intensity by vec3 to convert it to a vector)',

      'vec3 solarAtmosphericPass = linearAtmosphericPass(sunPosition, scatteringSunIntensity * vec3(1.0), sphericalPosition, mieInscatteringSum, rayleighInscatteringSum, sunHorizonFade, uv2OfTransmittance);',

      'vec3 lunarAtmosphericPass = linearAtmosphericPass(moonPosition, scatteringMoonIntensity * moonLightColor, sphericalPosition, mieInscatteringSum, rayleighInscatteringSum, moonHorizonFade, uv2OfTransmittance);',

      'vec3 baseSkyLighting = 0.25 * vec3(2E-3, 3.5E-3, 9E-3) * transmittanceFade;',



      '//This stuff never shows up near our sun, so we can exclude it',

      '#if(!$isSunPass && !$isMeteringPass)',

        '//Get the intensity of our sky color',

        'vec3 intensityVector = vec3(0.3, 0.59, 0.11);',

        'float starAndSkyExposureReduction =  starsExposure - 10.0 * dot(pow(solarAtmosphericPass + lunarAtmosphericPass, inverseGamma), intensityVector);',



        '//Get the stellar starting id data from the galactic cube map',

        'vec3 normalizedGalacticCoordinates = normalize(galacticCoordinates);',

        'vec4 starHashData = textureCube(starHashCubemap, normalizedGalacticCoordinates);',



        '//Red',

        'float scaledBits = starHashData.r * 255.0;',

        'float leftBits = floor(scaledBits / 2.0);',

        'float starXCoordinate = leftBits / 127.0; //Dim Star',

        'float rightBits = scaledBits - leftBits * 2.0;',



        '//Green',

        'scaledBits = starHashData.g * 255.0;',

        'leftBits = floor(scaledBits / 8.0);',

        'float starYCoordinate = (rightBits + leftBits * 2.0) / 63.0; //Dim Star',

        'rightBits = scaledBits - leftBits * 8.0;',



        '//Add the dim stars lighting',

        'vec4 starData = texture(dimStarData, vec2(starXCoordinate, starYCoordinate));',

        'vec3 galacticLighting = max(drawStarLight(starData, normalizedGalacticCoordinates, sphericalPosition, starAndSkyExposureReduction), 0.0);',



        '//Blue',

        'scaledBits = starHashData.b * 255.0;',

        'leftBits = floor(scaledBits / 64.0);',

        'starXCoordinate = (rightBits + leftBits * 8.0) / 31.0; //Medium Star',

        'rightBits = scaledBits - leftBits * 64.0;',

        'leftBits = floor(rightBits / 2.0);',

        'starYCoordinate = (leftBits  / 31.0); //Medium Star',



        '//Add the medium stars lighting',

        'starData = texture(medStarData, vec2(starXCoordinate, starYCoordinate));',

        'galacticLighting += max(drawStarLight(starData, normalizedGalacticCoordinates, sphericalPosition, starAndSkyExposureReduction), 0.0);',



        '//Alpha',

        'scaledBits = starHashData.a * 255.0;',

        'leftBits = floor(scaledBits / 32.0);',

        'starXCoordinate = leftBits / 7.0;',

        'rightBits = scaledBits - leftBits * 32.0;',

        'leftBits = floor(rightBits / 4.0);',

        'starYCoordinate = leftBits  / 7.0;',



        '//Add the bright stars lighting',

        'starData = texture(brightStarData, vec2(starXCoordinate, starYCoordinate));',

        'galacticLighting += max(drawStarLight(starData, normalizedGalacticCoordinates, sphericalPosition, starAndSkyExposureReduction), 0.0);',



        '//Check our distance from each of the four primary planets',

        'galacticLighting += max(drawPlanetLight(mercuryColor, mercuryBrightness, mercuryPosition, sphericalPosition, starAndSkyExposureReduction), 0.0);',

        'galacticLighting += max(drawPlanetLight(venusColor, venusBrightness, venusPosition, sphericalPosition, starAndSkyExposureReduction), 0.0);',

        'galacticLighting += max(drawPlanetLight(marsColor, marsBrightness, marsPosition, sphericalPosition, starAndSkyExposureReduction), 0.0);',

        'galacticLighting += max(drawPlanetLight(jupiterColor, jupiterBrightness, jupiterPosition, sphericalPosition, starAndSkyExposureReduction), 0.0);',

        'galacticLighting += max(drawPlanetLight(saturnColor, saturnBrightness, saturnPosition, sphericalPosition, starAndSkyExposureReduction), 0.0);',



        '//Apply the transmittance function to all of our light sources',

        'galacticLighting = pow(galacticLighting, gamma) * transmittanceFade;',

      '#endif',



      '//Sun and Moon layers',

      '#if($isSunPass)',

        'vec3 combinedPass = lunarAtmosphericPass + solarAtmosphericPass + baseSkyLighting;',



        '$draw_sun_pass',



        'combinedPass = pow(MyAESFilmicToneMapping(combinedPass + sunTexel), inverseGamma);',

      '#elif($isMoonPass)',

        'vec3 combinedPass = lunarAtmosphericPass + solarAtmosphericPass + baseSkyLighting;',

        'vec3 earthsShadow = getLunarEcclipseShadow(sphericalPosition);',



        '$draw_moon_pass',



        '//Now mix in the moon light',

        'combinedPass = mix(combinedPass + galacticLighting, combinedPass + moonTexel, lunarDiffuseTexel.a);',



        '//And bring it back to the normal gamma afterwards',

        'combinedPass = pow(MyAESFilmicToneMapping(combinedPass), inverseGamma);',

      '#elif($isMeteringPass)',

        '//Cut this down to the circle of the sky ignoring the galatic lighting',

        'float circularMask = 1.0 - step(1.0, rho);',

        'vec3 combinedPass = (lunarAtmosphericPass + solarAtmosphericPass + baseSkyLighting) * circularMask;',



        '//Combine the colors together and apply a transformation from the scattering intensity to the moon luminosity',

        'vec3 intensityPassColors = lunarAtmosphericPass * (moonLuminosity / scatteringMoonIntensity) + solarAtmosphericPass * (sunLuminosity / scatteringSunIntensity);',



        '//Get the greyscale color of the sky for the intensity pass verses the r, g and b channels',

        'float intensityPass = (0.3 * intensityPassColors.r + 0.59 * intensityPassColors.g + 0.11 * intensityPassColors.b) * circularMask;',



        '//Now apply the ACESFilmicTonemapping',

        'combinedPass = pow(MyAESFilmicToneMapping(combinedPass), inverseGamma);',

      '#else',

        '//Regular atmospheric pass',

        'vec3 combinedPass = lunarAtmosphericPass + solarAtmosphericPass + galacticLighting + baseSkyLighting;',



        '//Now apply the ACESFilmicTonemapping',

        'combinedPass = pow(MyAESFilmicToneMapping(combinedPass), inverseGamma);',



        '//Now apply the blue noise',

        'combinedPass += (texelFetch(blueNoiseTexture, (ivec2(gl_FragCoord.xy) + ivec2(128.0 * noise(uTime),  128.0 * noise(uTime + 511.0))) % 128, 0).rgb - vec3(0.5)) / vec3(128.0);',

      '#endif',



      '#if($isMeteringPass)',

        'gl_FragColor = vec4(combinedPass, intensityPass);',

      '#else',

        '//Triangular Blue Noise Dithering Pass',

        'gl_FragColor = vec4(combinedPass, 1.0);',

      '#endif',

    '}',
    ];

    let mieGSquared = mieG * mieG;
    let miePhaseFunctionCoefficient = (1.5 * (1.0 - mieGSquared) / (2.0 + mieGSquared));
    let textureDepth = packingWidth * packingHeight;

    let updatedLines = [];
    for(let i = 0, numLines = originalGLSL.length; i < numLines; ++i){
      let updatedGLSL = originalGLSL[i].replace(/\$atmosphericFunctions/g, atmosphereFunctions);
      updatedGLSL = updatedGLSL.replace(/\$mieG/g, mieG.toFixed(16));
      updatedGLSL = updatedGLSL.replace(/\$mieGSquared/g, mieGSquared.toFixed(16));
      updatedGLSL = updatedGLSL.replace(/\$miePhaseFunctionCoefficient/g, miePhaseFunctionCoefficient.toFixed(16));

      //Texture constants
      updatedGLSL = updatedGLSL.replace(/\$textureWidth/g, textureWidth.toFixed(1));
      updatedGLSL = updatedGLSL.replace(/\$textureHeight/g, textureHeight.toFixed(1));
      updatedGLSL = updatedGLSL.replace(/\$packingWidth/g, packingWidth.toFixed(1));
      updatedGLSL = updatedGLSL.replace(/\$packingHeight/g, packingHeight.toFixed(1));
      updatedGLSL = updatedGLSL.replace(/\$textureDepth/g, textureDepth.toFixed(1));

      //Additional injected code for sun and moon
      if(moonCode !== false){
        updatedGLSL = updatedGLSL.replace(/\$isMoonPass/g, '1');
        updatedGLSL = updatedGLSL.replace(/\$isSunPass/g, '0');
        updatedGLSL = updatedGLSL.replace(/\$draw_sun_pass/g, '');
        updatedGLSL = updatedGLSL.replace(/\$draw_moon_pass/g, moonCode);
        updatedGLSL = updatedGLSL.replace(/\$isMeteringPass/g, '0');
      }
      else if(sunCode !== false){
        updatedGLSL = updatedGLSL.replace(/\$isMoonPass/g, '0');
        updatedGLSL = updatedGLSL.replace(/\$draw_moon_pass/g, '');
        updatedGLSL = updatedGLSL.replace(/\$isSunPass/g, '1');
        updatedGLSL = updatedGLSL.replace(/\$draw_sun_pass/g, sunCode);
        updatedGLSL = updatedGLSL.replace(/\$isMeteringPass/g, '0');
      }
      else if(meteringCode !== false){
        updatedGLSL = updatedGLSL.replace(/\$isMoonPass/g, '0');
        updatedGLSL = updatedGLSL.replace(/\$draw_moon_pass/g, '');
        updatedGLSL = updatedGLSL.replace(/\$isSunPass/g, '0');
        updatedGLSL = updatedGLSL.replace(/\$draw_sun_pass/g, '');
        updatedGLSL = updatedGLSL.replace(/\$isMeteringPass/g, '1');
      }
      else{
        updatedGLSL = updatedGLSL.replace(/\$isMoonPass/g, '0');
        updatedGLSL = updatedGLSL.replace(/\$draw_moon_pass/g, '');
        updatedGLSL = updatedGLSL.replace(/\$isSunPass/g, '0');
        updatedGLSL = updatedGLSL.replace(/\$draw_sun_pass/g, '');
        updatedGLSL = updatedGLSL.replace(/\$isMeteringPass/g, '0');
      }

      updatedLines.push(updatedGLSL);
    }

    return updatedLines.join('\n');
  }
}

StarrySky.Materials.Postprocessing.moonAndSunOutput = {
  uniforms: {
    blueNoiseTexture: {type: 't', 'value': null},
    outputImage: {type: 't', 'value': null},
    uTime: {'value': 0.0},
  },
  fragmentShader: [

    'uniform sampler2D blueNoiseTexture;',

    'uniform sampler2D outputImage;',

    'uniform float uTime;',



    'varying vec3 vWorldPosition;',

    'varying vec2 vUv;',

    'const vec3 inverseGamma = vec3(0.454545454545454545454545);',

    'const float sqrtOfOneHalf = 0.7071067811865475244008443;',



    '//From http://byteblacksmith.com/improvements-to-the-canonical-one-liner-glsl-rand-for-opengl-es-2-0/',

    'float rand(float x){',

      'float a = 12.9898;',

      'float b = 78.233;',

      'float c = 43758.5453;',

      'float dt= dot(vec2(x, x) ,vec2(a,b));',

      'float sn= mod(dt,3.14);',

      'return fract(sin(sn) * c);',

    '}',



    '//From The Book of Shaders :D',

    '//https://thebookofshaders.com/11/',

    'float noise(float x){',

      'float i = floor(x);',

      'float f = fract(x);',

      'float y = mix(rand(i), rand(i + 1.0), smoothstep(0.0,1.0,f));',



      'return y;',

    '}',



    '//Including this because someone removed this in a future version of THREE. Why?!',

    'vec3 MyAESFilmicToneMapping(vec3 color) {',

      'return clamp((color * (2.51 * color + 0.03)) / (color * (2.43 * color + 0.59) + 0.14), 0.0, 1.0);',

    '}',



    'void main(){',

      'float distanceFromCenter = distance(vUv, vec2(0.5));',

      'float falloffDisk = clamp(smoothstep(0.0, 1.0, (sqrtOfOneHalf - min(distanceFromCenter * 2.7 - 0.8, 1.0))), 0.0, 1.0);',

      'vec3 combinedPass = texture(outputImage, vUv).rgb;',

      'combinedPass += (texelFetch(blueNoiseTexture, (ivec2(gl_FragCoord.xy) + ivec2(128.0 * noise(uTime),  128.0 * noise(uTime + 511.0))) % 128, 0).rgb - vec3(0.5)) / vec3(128.0);',

      'gl_FragColor = vec4(combinedPass, falloffDisk);',

    '}',
  ].join('\n'),
  vertexShader: [

    'varying vec3 vWorldPosition;',

    'varying vec2 vUv;',



    'void main() {',

      'vec4 worldPosition = modelMatrix * vec4(position, 1.0);',

      'vWorldPosition = worldPosition.xyz;',

      'vUv = uv;',



      'vec4 projectionPosition = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',

      'vec3 normalizedPosition = projectionPosition.xyz / projectionPosition.w;',

      'gl_Position = projectionPosition;',



      '//We offset our sun z-position by 0.01 to avoid Z-Fighting with the back sky plane',

      'gl_Position.z -= 0.01;',

    '}',
  ].join('\n')
};

//This helps
//--------------------------v
//https://threejs.org/docs/#api/en/core/Uniform
StarrySky.Materials.Sun.baseSunPartial = {
  fragmentShader: function(sunAngularDiameter){
    let originalGLSL = [

    '//We enter and leave with additionalPassColor, which we add our sun direct',

    '//lighting to, after it has been attenuated by our transmittance.',



    '//Our sun is located in the middle square of our quad, so that we give our',

    '//solar bloom enough room to expand into without clipping the edge.',

    '//We also fade out our quad towards the edge to reduce the visibility of sharp',

    '//edges.',

    'float pixelDistanceFromSun = distance(offsetUV, vec2(0.5));',



    '//From https://github.com/supermedium/superframe/blob/master/components/sun-sky/shaders/fragment.glsl',

    'float sundisk = smoothstep(0.0, 0.1, (0.5 - (pixelDistanceFromSun)));',



    '//We can use this for our solar limb darkening',

    '//From https://twiki.ph.rhul.ac.uk/twiki/pub/Public/Solar_Limb_Darkening_Project/Solar_Limb_Darkening.pdf',

    'float rOverR = pixelDistanceFromSun / 0.5;',

    'float mu = sqrt(clamp(1.0 - rOverR * rOverR, 0.0, 1.0));',

    'float limbDarkening = (ac1 + ac2 * mu + 2.0 * ac3 * mu * mu);',



    '//Apply transmittance to our sun disk direct lighting',

    'vec3 normalizedWorldPosition = normalize(vWorldPosition);',

    'vec3 vectorBetweenMoonAndPixel = normalizedWorldPosition - moonPosition;',

    'float distanceBetweenPixelAndMoon = length(vectorBetweenMoonAndPixel);',

    'vec3 sunTexel = (sundisk * sunDiskIntensity * limbDarkening + 2.0 * texture2D(solarEclipseMap, vUv * 1.9 - vec2(0.45)).r)* transmittanceFade;',

    'sunTexel *= smoothstep(0.97 * moonRadius, moonRadius, distanceBetweenPixelAndMoon);',
    ];

    let updatedLines = [];
    for(let i = 0, numLines = originalGLSL.length; i < numLines; ++i){
      let updatedGLSL = originalGLSL[i].replace(/\$sunAngularDiameter/g, sunAngularDiameter.toFixed(5));

      updatedLines.push(updatedGLSL);
    }

    return updatedLines.join('\n');
  },
  vertexShader: [

    'uniform float radiusOfSunPlane;',

    'uniform mat4 worldMatrix;',

    'varying vec3 vWorldPosition;',

    'varying vec2 vUv;',



    'void main() {',

      'vec4 worldPosition = worldMatrix * vec4(position * radiusOfSunPlane * 2.0, 1.0);',

      'vWorldPosition = vec3(-worldPosition.z, worldPosition.y, -worldPosition.x);',



      'vUv = uv;',



      'gl_Position = vec4(position, 1.0);',

    '}',
  ].join('\n'),
}

//This helps
//--------------------------v
//https://threejs.org/docs/#api/en/core/Uniform
StarrySky.Materials.Moon.baseMoonPartial = {
  fragmentShader: function(moonAngularDiameter){
    let originalGLSL = [

    '//We enter and leave with additionalPassColor, which we add our moon direct',

    '//lighting to, after it has been attenuated by our transmittance.',



    '//Calculate the light from the moon. Note that our normal is on a quad, which makes',

    '//transforming our normals really easy, as we just have to transform them by the world matrix.',

    '//and everything should work out. Furthermore, the light direction for the moon should just',

    '//be our sun position in the sky.',

    'vec3 texelNormal = normalize(2.0 * texture2D(moonNormalMap, offsetUV).rgb - 1.0);',



    '//Lunar surface roughness from https://sos.noaa.gov/datasets/moon-surface-roughness/',

    'float moonRoughnessTexel = piOver2 - (1.0 - texture2D(moonRoughnessMap, offsetUV).r);',



    '//Implmentatation of the Ambient Appeture Lighting Equation',

    'float sunArea = pi * sunRadius * sunRadius;',

    'float apertureRadius = acos(1.0 - texture2D(moonApertureSizeMap, offsetUV).r);',

    'vec3 apertureOrientation = normalize(2.0 * texture2D(moonApertureOrientationMap, offsetUV).rgb - 1.0);',

    'float apertureToSunHaversineDistance = acos(dot(apertureOrientation, tangentSpaceSunLightDirection));',



    'float observableSunFraction;',

    'vec3 test = vec3(0.0);',

    'if(apertureToSunHaversineDistance >= (apertureRadius + sunRadius)){',

      'observableSunFraction = 0.0;',

    '}',

    'else if(apertureToSunHaversineDistance <= (apertureRadius - sunRadius)){',

      'observableSunFraction = 1.0;',

    '}',

    'else{',

      'float absOfRpMinusRl = abs(apertureRadius - sunRadius);',

      'observableSunFraction = smoothstep(0.0, 1.0, 1.0 - ((apertureToSunHaversineDistance - absOfRpMinusRl) / (apertureRadius + sunRadius - absOfRpMinusRl)));',

    '}',

    'float omega = (sunRadius - apertureRadius + apertureToSunHaversineDistance) / (2.0 * apertureToSunHaversineDistance);',

    'vec3 bentTangentSpaceSunlightDirection = normalize(mix(tangentSpaceSunLightDirection, apertureOrientation, omega));',



    '//I opt to use the Oren-Nayar model over Hapke-Lommel-Seeliger',

    '//As Oren-Nayar lacks a lunar phase component and is more extensible for',

    '//Additional parameters, I used the following code as a guide',

    '//https://patapom.com/blog/BRDF/MSBRDFEnergyCompensation/#fn:4',

    'float NDotL = max(dot(bentTangentSpaceSunlightDirection, texelNormal), 0.0);',

    'float NDotV = max(dot(tangentSpaceViewDirection, texelNormal), 0.0);',

    'float gamma = dot(tangentSpaceViewDirection - texelNormal * NDotV, bentTangentSpaceSunlightDirection - texelNormal * NDotL);',

    'gamma = gamma / (sqrt(clamp(1.0 - NDotV * NDotV, 0.0, 1.0)) * sqrt(clamp(1.0 - NDotL * NDotL, 0.0, 1.0)));',

    'float roughnessSquared = moonRoughnessTexel * moonRoughnessTexel;',

    'float A = 1.0 - 0.5 * (roughnessSquared / (roughnessSquared + 0.33));',

    'float B = 0.45 * (roughnessSquared / (roughnessSquared + 0.09));',

    'vec2 cos_alpha_beta = NDotV < NDotL ? vec2(NDotV, NDotL) : vec2(NDotL, NDotV);',

    'vec2 sin_alpha_beta = sqrt(clamp(1.0 - cos_alpha_beta * cos_alpha_beta, 0.0, 1.0));',

    'float C = sin_alpha_beta.x * sin_alpha_beta.y / (1e-6 + cos_alpha_beta.y);',



    'vec3 moonTexel = 2.0 * observableSunFraction * NDotL * (A + B * max(0.0, gamma) * C) * lunarDiffuseColor * transmittanceFade * earthsShadow;',
    ];

    let updatedLines = [];
    for(let i = 0, numLines = originalGLSL.length; i < numLines; ++i){
      let updatedGLSL = originalGLSL[i].replace(/\$moonAngularDiameter/g, moonAngularDiameter.toFixed(5));

      updatedLines.push(updatedGLSL);
    }

    return updatedLines.join('\n');
  },
  vertexShader: [

    'attribute vec4 tangent;',



    'uniform float radiusOfMoonPlane;',

    'uniform mat4 worldMatrix;',

    'uniform vec3 sunLightDirection;',



    'varying vec3 vWorldPosition;',

    'varying vec2 vUv;',

    'varying vec3 tangentSpaceSunLightDirection;',

    'varying vec3 tangentSpaceViewDirection;',



    'varying vec3 galacticCoordinates;',

    'uniform float latitude;',

    'uniform float localSiderealTime;',

    'const float northGalaticPoleRightAscension = 3.36601290657539744989;',

    'const float northGalaticPoleDec = 0.473507826066061614219;',

    'const float sinOfNGP = 0.456010959101623894601;',

    'const float cosOfNGP = 0.8899741598379231031239;',

    'const float piTimes2 = 6.283185307179586476925286;',

    'const float piOver2 = 1.5707963267948966192313;',

    'const float threePiOverTwo = 4.712388980384689857693;',

    'const float pi = 3.141592653589793238462;',



    'void main() {',

      'vec4 worldPosition = worldMatrix * vec4(position * radiusOfMoonPlane * 2.0, 1.0);',

      'vec3 normalizedWorldPosition = normalize(worldPosition.xyz);',

      'vWorldPosition = vec3(-normalizedWorldPosition.z, normalizedWorldPosition.y, -normalizedWorldPosition.x);',



      'vUv = uv;',



      '//Other then our bitangent, all of our other values are already normalized',

      'vec3 bitangent = normalize((tangent.w * cross(normal, tangent.xyz)));',

      'vec3 cameraSpaceTangent = (worldMatrix * vec4(tangent.xyz, 0.0)).xyz;',

      'vec3 b = (worldMatrix * vec4(bitangent.xyz, 0.0)).xyz;',

      'vec3 n = (worldMatrix * vec4(normal.xyz, 0.0)).xyz;',



      '//There is no matrix transpose, so we will do this ourselves',

      'mat3 TBNMatrix = mat3(vec3(cameraSpaceTangent.x, b.x, n.x), vec3(cameraSpaceTangent.y, b.y, n.y), vec3(cameraSpaceTangent.z, b.z, n.z));',

      'tangentSpaceSunLightDirection = normalize(TBNMatrix * sunLightDirection);',

      'tangentSpaceViewDirection = normalize(TBNMatrix * -normalizedWorldPosition);',



      '//Convert coordinate position to RA and DEC',

      'float altitude = piOver2 - acos(vWorldPosition.y);',

      'float azimuth = pi - atan(vWorldPosition.z, vWorldPosition.x);',

      'float declination = asin(sin(latitude) * sin(altitude) - cos(latitude) * cos(altitude) * cos(azimuth));',

      'float hourAngle = atan(sin(azimuth), (cos(azimuth) * sin(latitude) + tan(altitude) * cos(latitude)));',



      '//fmodulo return (a - (b * floor(a / b)));',

      'float a = localSiderealTime - hourAngle;',

      'float rightAscension = a - (piTimes2 * floor(a / piTimes2));',



      '//Convert coordinate position to Galactic Coordinates',

      'float sinOfDec = sin(declination);',

      'float cosOfDec = cos(declination);',

      'float cosOfRaMinusGalacticNGPRa = cos(rightAscension - northGalaticPoleRightAscension);',

      'float galaticLatitude = threePiOverTwo - asin(sinOfNGP * sinOfDec + cosOfNGP * cosOfDec * cosOfRaMinusGalacticNGPRa);',

      'float galaticLongitude = cosOfDec * sin(rightAscension - northGalaticPoleRightAscension);',

      'galaticLongitude = atan(galaticLongitude, cosOfNGP * sinOfDec - sinOfNGP * cosOfDec * cosOfRaMinusGalacticNGPRa) + pi;',

      'galacticCoordinates.x = sin(galaticLatitude) * cos(galaticLongitude);',

      'galacticCoordinates.y = cos(galaticLatitude);',

      'galacticCoordinates.z = sin(galaticLatitude) * sin(galaticLongitude);',



      'gl_Position = vec4(position, 1.0);',

    '}',
  ].join('\n'),
}

//This helps
//--------------------------v
//https://threejs.org/docs/#api/en/core/Uniform
StarrySky.Materials.Stars.starDataMap = {
  uniforms: {
    textureRChannel: {type: 't', 'value': null},
    textureGChannel: {type: 't', 'value': null},
    textureBChannel: {type: 't', 'value': null},
    textureAChannel: {type: 't', 'value': null},
  },
  fragmentShader: [

    'precision highp float;',



    'uniform sampler2D textureRChannel;',

    'uniform sampler2D textureGChannel;',

    'uniform sampler2D textureBChannel;',

    'uniform sampler2D textureAChannel;',



    'float rgba2Float(vec4 rgbaValue, float minValue, float maxValue){',

      'vec4 v = rgbaValue * 255.0;',



      '//First convert this to the unscaled integer values',

      'float scaledIntValue = v.a + 256.0 * (v.b + 256.0 * (v.g + 256.0 * v.r));',



      '//Now scale the float down to the appropriate range',

      'return (scaledIntValue / 4294967295.0) * (maxValue - minValue) + minValue;',

    '}',



    'void main(){',

      'vec2 vUv = gl_FragCoord.xy / resolution.xy;',



      'float r = rgba2Float(texture2D(textureRChannel, vUv), -17000.0, 17000.0);',

      'float g = rgba2Float(texture2D(textureGChannel, vUv), -17000.0, 17000.0);',

      'float b = rgba2Float(texture2D(textureBChannel, vUv), -17000.0, 17000.0);',

      'float a = rgba2Float(texture2D(textureAChannel, vUv), -2.0, 7.0);',



      'gl_FragColor = vec4(r, g, b, a);',

    '}',
  ].join('\n')
}

//This helps
//--------------------------v
//https://threejs.org/docs/#api/en/core/Uniform
StarrySky.Materials.Autoexposure.meteringSurvey = {
  vertexShader: [

    'varying vec3 vWorldPosition;',

    'varying vec2 vUv;',



    'void main() {',

      '//Just pass over the texture coordinates',

      'vUv = uv * 2.0 - 1.0;',



      'gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',

    '}',
  ].join('\n'),
}

//Child classes
window.customElements.define('sky-moon-diffuse-map', class extends HTMLElement{});
window.customElements.define('sky-moon-normal-map', class extends HTMLElement{});
window.customElements.define('sky-moon-roughness-map', class extends HTMLElement{});
window.customElements.define('sky-moon-aperture-size-map', class extends HTMLElement{});
window.customElements.define('sky-moon-aperture-orientation-map', class extends HTMLElement{});
window.customElements.define('sky-star-cubemap-maps', class extends HTMLElement{});
window.customElements.define('sky-dim-star-maps', class extends HTMLElement{});
window.customElements.define('sky-med-star-maps', class extends HTMLElement{});
window.customElements.define('sky-bright-star-maps', class extends HTMLElement{});
window.customElements.define('sky-star-color-map', class extends HTMLElement{});
window.customElements.define('sky-blue-noise-maps', class extends HTMLElement{});
window.customElements.define('sky-solar-eclipse-map', class extends HTMLElement{});

StarrySky.DefaultData.fileNames = {
  moonDiffuseMap: 'lunar-diffuse-map.webp',
  moonNormalMap: 'lunar-normal-map.webp',
  moonRoughnessMap: 'lunar-roughness-map.webp',
  moonApertureSizeMap: 'lunar-aperture-size-map.webp',
  moonApertureOrientationMap: 'lunar-aperture-orientation-map.webp',
  starHashCubemap: [
    'star-dictionary-cubemap-px.png',
    'star-dictionary-cubemap-nx.png',
    'star-dictionary-cubemap-py.png',
    'star-dictionary-cubemap-ny.png',
    'star-dictionary-cubemap-pz.png',
    'star-dictionary-cubemap-nz.png',
  ],
  dimStarDataMaps: [
    'dim-star-data-r-channel.png',
    'dim-star-data-g-channel.png',
    'dim-star-data-b-channel.png',
    'dim-star-data-a-channel.png'
  ],
  medStarDataMaps: [
    'med-star-data-r-channel.png',
    'med-star-data-g-channel.png',
    'med-star-data-b-channel.png',
    'med-star-data-a-channel.png'
  ],
  brightStarDataMaps:[
    'bright-star-data-r-channel.png', //We choose to use PNG for the bright star data as webp is actually twice as big
    'bright-star-data-g-channel.png',
    'bright-star-data-b-channel.png',
    'bright-star-data-a-channel.png'
  ],
  starColorMap: 'star-color-map.png',
  blueNoiseMaps:[
    'blue-noise-0.bmp',
    'blue-noise-1.bmp',
    'blue-noise-2.bmp',
    'blue-noise-3.bmp',
    'blue-noise-4.bmp'
  ],
  solarEclipseMap: 'solar-eclipse-map.webp'
};

StarrySky.DefaultData.assetPaths = {
  moonDiffuseMap: './assets/moon/' + StarrySky.DefaultData.fileNames.moonDiffuseMap,
  moonNormalMap: './assets/moon/' + StarrySky.DefaultData.fileNames.moonNormalMap,
  moonRoughnessMap: './assets/moon/' + StarrySky.DefaultData.fileNames.moonRoughnessMap,
  moonApertureSizeMap: './assets/moon/' + StarrySky.DefaultData.fileNames.moonApertureSizeMap,
  moonApertureOrientationMap: './assets/moon/' + StarrySky.DefaultData.fileNames.moonApertureOrientationMap,
  solarEclipseMap: './assets/solar_eclipse/' + StarrySky.DefaultData.fileNames.solarEclipseMap,
  starHashCubemap: StarrySky.DefaultData.fileNames.starHashCubemap.map(x => './assets/star_data/' + x),
  dimStarDataMaps: StarrySky.DefaultData.fileNames.dimStarDataMaps.map(x => './assets/star_data/' + x),
  medStarDataMaps: StarrySky.DefaultData.fileNames.medStarDataMaps.map(x => './assets/star_data/' + x),
  brightStarDataMaps: StarrySky.DefaultData.fileNames.brightStarDataMaps.map(x => './assets/star_data/' + x),
  starColorMap: './assets/star_data/' + StarrySky.DefaultData.fileNames.starColorMap,
  blueNoiseMaps: StarrySky.DefaultData.fileNames.blueNoiseMaps.map(x => './assets/blue_noise/' + x)
};

//Clone the above, in the event that any paths are found to differ, we will
//replace them.
StarrySky.assetPaths = JSON.parse(JSON.stringify(StarrySky.DefaultData.assetPaths));

//Parent class
class SkyAssetsDir extends HTMLElement {
  constructor(){
    super();

    //Check if there are any child elements. Otherwise set them to the default.
    this.skyDataLoaded = false;
    this.data = StarrySky.DefaultData.assetPaths;
    this.isRoot = false;
  }

  connectedCallback(){
    //Hide the element
    this.style.display = "none";

    const self = this;
    document.addEventListener('DOMContentLoaded', function(evt){
      //Check this this has a parent sky-assets-dir
      self.isRoot = self.parentElement.nodeName.toLowerCase() !== 'sky-assets-dir';
      let path = 'dir' in self.attributes ? self.attributes.dir.value : '/';
      let parentTag = self.parentElement;

      //If this isn't root, we should recursively travel up the tree until we have constructed
      //our path.
      var i = 0;
      while(parentTag.nodeName.toLowerCase() === 'sky-assets-dir'){
        let parentDir;
        if('dir' in parentTag.attributes){
          parentDir = parentTag.attributes.dir.value;
        }
        else{
          parentDir = '';
        }
        if(parentDir.length > 0){
          //We add the trailing / back in if we are going another level deeper
          parentDir = parentDir.endsWith('/') ? parentDir : parentDir + '/';

          //Remove the trailing and ending /s for appropriate path construction
          path = path.startsWith('/') ? path.slice(1, path.length - 1) : path;
          path = path.endsWith('/') ? path.slice(0, path.length - 2) : path;
          path = parentDir + path;
        }
        else{
          path = parentDir + path;
        }
        parentTag = parentTag.parentElement;
        i++;
        if(i > 100){
          console.error("Why do you need a hundred of these?! You should be able to use like... 2. Maybe 3? I'm breaking to avoid freezing your machine.");
          return; //Oh, no, you don't just get to break, we're shutting down the entire function
        }
      }

      //Get child tags and acquire their values.
      const childNodes = Array.from(self.children);
      const moonDiffuseMapTags = childNodes.filter(x => x.nodeName.toLowerCase() === 'sky-moon-diffuse-map');
      const moonNormalMapTags = childNodes.filter(x => x.nodeName.toLowerCase() === 'sky-moon-normal-map');
      const moonRoughnessMapTags = childNodes.filter(x => x.nodeName.toLowerCase() === 'sky-moon-roughness-map');
      const moonApertureSizeMapTags = childNodes.filter(x => x.nodeName.toLowerCase() === 'sky-moon-aperture-size-map');
      const solarEclipseMapTags = childNodes.filter(x => x.nodeName.toLowerCase() === 'sky-solar-eclipse-map');
      const moonApertureOrientationMapTags = childNodes.filter(x => x.nodeName.toLowerCase() === 'sky-moon-aperture-orientation-map');
      const starCubemapTags = childNodes.filter(x => x.nodeName.toLowerCase() === 'sky-star-cubemap-map');
      const dimStarMapTags = childNodes.filter(x => x.nodeName.toLowerCase() === 'sky-dim-star-map');
      const medStarMapTags = childNodes.filter(x => x.nodeName.toLowerCase() === 'sky-med-star-map');
      const brightStarMapTags = childNodes.filter(x => x.nodeName.toLowerCase() === 'sky-bright-star-map');
      const starColorMapTags = childNodes.filter(x => x.nodeName.toLowerCase() === 'sky-star-color-map');
      const blueNoiseMapTags = childNodes.filter(x => x.nodeName.toLowerCase() === 'sky-blue-noise-maps');

      const objectProperties = ['moonDiffuseMap', 'moonNormalMap',
        'moonRoughnessMap', 'moonApertureSizeMap', 'moonApertureOrientationMap', 'starHashCubemap',
        'dimStarMaps', 'medStarMaps', 'brightStarMaps', 'starColorMap', 'blueNoiseMaps', 'solarEclipseMap']
      const tagsList = [moonDiffuseMapTags, moonNormalMapTags,
        moonRoughnessMapTags, moonApertureSizeMapTags, moonApertureOrientationMapTags, starCubemapTags,
        medStarMapTags, dimStarMapTags, brightStarMapTags, starColorMapTags, blueNoiseMapTags, solarEclipseMapTags];
      const numberOfTagTypes = tagsList.length;
      if(self.hasAttribute('texture-path') && self.getAttribute('texture-path').toLowerCase() !== 'false'){
        const singleTextureKeys = ['moonDiffuseMap', 'moonNormalMap', 'moonRoughnessMap',
        'moonApertureSizeMap', 'moonApertureOrientationMap', 'starColorMap', 'solarEclipseMap'];
        const multiTextureKeys = ['starHashCubemap','dimStarDataMaps', 'medStarDataMaps', 'brightStarDataMaps',
        'blueNoiseMaps'];

        //Process single texture keys
        for(let i = 0; i < singleTextureKeys.length; ++i){
          StarrySky.assetPaths[singleTextureKeys[i]] = path + '/' + StarrySky.DefaultData.fileNames[singleTextureKeys[i]];
        }

        //Process multi texture keys
        for(let i = 0; i < multiTextureKeys.length; ++i){
          let multiTextureFileNames = multiTextureKeys[i];
          for(let j = 0; j < multiTextureFileNames.length; ++j){
            StarrySky.assetPaths[multiTextureFileNames[i]][j] = path + '/' + StarrySky.DefaultData.fileNames[singleTextureKeys[i]][j];
          }
        }
      }
      else if(self.hasAttribute('moon-path') && self.getAttribute('moon-path').toLowerCase() !== 'false'){
        const moonTextureKeys = ['moonDiffuseMap', 'moonNormalMap', 'moonRoughnessMap',
        'moonApertureSizeMap', 'moonApertureOrientationMap'];
        for(let i = 0; i < moonTextureKeys.length; ++i){
          StarrySky.assetPaths[moonTextureKeys[i]] = path + '/' + StarrySky.DefaultData.fileNames[moonTextureKeys[i]];
        }
      }
      else if(self.hasAttribute('star-path') && self.getAttribute('star-path').toLowerCase() !== 'false'){
        const starTextureKeys = ['starHashCubemap', 'dimStarDataMaps', 'medStarDataMaps', 'brightStarDataMaps'];
        for(let i = 0; i < starTextureKeys.length; ++i){
          let starMapFileNames =  StarrySky.DefaultData.fileNames[starTextureKeys[i]];
          for(let j = 0; j < starMapFileNames.length; ++j){
            StarrySky.assetPaths[starTextureKeys[i]][j] = path + '/' + starMapFileNames[j];
          }
        }

        StarrySky.assetPaths['starColorMap'] = path + '/' + StarrySky.DefaultData.fileNames['starColorMap'];
      }
      else if(self.hasAttribute('blue-noise-path') && self.getAttribute('blue-noise-path').toLowerCase() !== 'false'){
        for(let i = 0; i < 5; ++i){
          let blueNoiseFileNames =  StarrySky.DefaultData.fileNames['blue-noise-' + i];
          StarrySky.assetPaths['blueNoiseMaps'][i] = path + '/' + StarrySky.DefaultData.fileNames['blueNoiseMaps'][i];
        }
      }
      else if(self.hasAttribute('solar-eclipse-path') && self.getAttribute('solar-eclipse-path').toLowerCase() !== 'false'){
        StarrySky.assetPaths['solarEclipseMap'] = path + '/' + StarrySky.DefaultData.fileNames['solarEclipseMap'];
      }

      self.skyDataLoaded = true;
      document.dispatchEvent(new Event('Sky-Data-Loaded'));
    });

    this.loaded = true;
  };
}
window.customElements.define('sky-assets-dir', SkyAssetsDir);

//Child tags
window.customElements.define('sky-mie-directional-g', class extends HTMLElement{});
window.customElements.define('sky-sun-angular-diameter', class extends HTMLElement{});
window.customElements.define('sky-moon-angular-diameter', class extends HTMLElement{});

StarrySky.DefaultData.skyAtmosphericParameters = {
  solarIntensity: 1367.0,
  lunarMaxIntensity: 29,
  solarColor: {
    red: 6.5E-7,
    green: 5.1E-7,
    blue: 4.75E-7
  },
  lunarColor: {
    red: 6.5E-7,
    green: 5.1E-7,
    blue: 4.75E-7
  },
  mieBeta: {
    red: 2E-6,
    green: 2E-6,
    blue: 2E-6
  },
  mieDirectionalG: 0.8,
  numberOfRaySteps: 30,
  numberOfGatheringSteps: 30,
  ozoneEnabled: true,
  sunAngularDiameter: 3.38,
  moonAngularDiameter: 3.15,
};

//Parent tag
class SkyAtmosphericParameters extends HTMLElement {
  constructor(){
    super();

    //Check if there are any child elements. Otherwise set them to the default.
    this.skyDataLoaded = false;
    this.data = StarrySky.DefaultData.skyAtmosphericParameters;
  }

  connectedCallback(){
    //Hide the element
    this.style.display = "none";

    let self = this;
    document.addEventListener('DOMContentLoaded', function(evt){
      //Get child tags and acquire their values.
      let mieDirectionalGTags = self.getElementsByTagName('sky-mie-directional-g');
      let sunAngularDiameterTags = self.getElementsByTagName('sky-sun-angular-diameter');
      let moonAngularDiameterTags = self.getElementsByTagName('sky-moon-angular-diameter');

      [mieDirectionalGTags, sunAngularDiameterTags, moonAngularDiameterTags].forEach(function(tags){
        if(tags.length > 1){
          console.error(`The <sky-parameters> tag can only contain 1 tag of type <${tags[0].tagName}>. ${tags.length} found.`);
        }
      });

      //Set the params to appropriate values or default
      self.data.mieDirectionalG = mieDirectionalGTags.length > 0 ? parseFloat(mieDirectionalGTags[0].innerHTML) : self.data.mieDirectionalG;
      self.data.sunAngularDiameter = sunAngularDiameterTags.length > 0 ? parseFloat(sunAngularDiameterTags[0].innerHTML) : self.data.sunAngularDiameter;
      self.data.moonAngularDiameter = moonAngularDiameterTags.length > 0 ? parseFloat(moonAngularDiameterTags[0].innerHTML) : self.data.moonAngularDiameter;

      //Clamp our results to the appropriate ranges
      let clampAndWarn = function(inValue, minValue, maxValue, tagName){
        let result = Math.min(Math.max(inValue, minValue), maxValue);
        if(inValue > maxValue){
          console.warn(`The tag, ${tagName}, with a value of ${inValue} is outside of it's range and was clamped. It has a max value of ${maxValue} and a minimum value of ${minValue}.`);
        }
        else if(inValue < minValue){
          console.warn(`The tag, ${tagName}, with a value of ${inValue} is outside of it's range and was clamped. It has a minmum value of ${minValue} and a minimum value of ${minValue}.`);
        }
        return result;
      };

      self.data.mieDirectionalG = clampAndWarn(self.data.mieDirectionalG, -1.0, 1.0, '<sky-mie-directional-g>');
      self.data.sunAngularDiameter = clampAndWarn(self.data.sunAngularDiameter, 0.1, 90.0, '<sky-sun-angular-diameter>');
      self.data.moonAngularDiameter = clampAndWarn(self.data.moonAngularDiameter, 0.1, 90.0, '<sky-moon-angular-diameter>');

      self.skyDataLoaded = true;
      document.dispatchEvent(new Event('Sky-Data-Loaded'));
    });
  };
}
window.customElements.define('sky-atmospheric-parameters', SkyAtmosphericParameters);

//child tags
window.customElements.define('sky-latitude', class extends HTMLElement{});
window.customElements.define('sky-longitude', class extends HTMLElement{});

StarrySky.DefaultData.location = {
  latitude: 38,
  longitude: -122
};

//Parent method
class SkyLocation extends HTMLElement {
  constructor(){
    super();

    //Get the child values and make sure both are present or default to San Francisco
    //And throw a console warning
    this.skyDataLoaded = false;
    this.data = StarrySky.DefaultData.location;
  }

  connectedCallback(){
    //Hide the element
    this.style.display = "none";

    let self = this;
    document.addEventListener('DOMContentLoaded', function(evt){
      //Get child tags and acquire their values.
      let latitudeTags = self.getElementsByTagName('sky-latitude');
      let longitudeTags = self.getElementsByTagName('sky-longitude');

      [latitudeTags, longitudeTags].forEach(function(tags){
        if(tags.length > 1){
          console.error(`The <sky-location> tag can only contain 1 tag of type <${tags[0].tagName}>. ${tags.length} found.`);
        }
      });

      //Logical XOR ( a || b ) && !( a && b )
      let conditionA = latitudeTags.length === 1;
      let conditionB = longitudeTags.length === 1;
      if((conditionA || conditionB) && !(conditionA && conditionB)){
        if(conditionA){
          console.error('The <sky-location> tag must contain both a <sky-latitude> and <sky-longitude> tag. Only a <sky-latitude> tag was found.');
        }
        else{
          console.error('The <sky-location> tag must contain both a <sky-latitude> and <sky-longitude> tag. Only a <sky-longitude> tag was found.');
        }
      }

      //Set the params to appropriate values or default
      self.data.latitude = latitudeTags.length > 0 ? parseFloat(latitudeTags[0].innerHTML) : self.data.latitude;
      self.data.longitude = longitudeTags.length > 0 ? parseFloat(longitudeTags[0].innerHTML) : self.data.longitude;

      //Clamp the results
      let clampAndWarn = function(inValue, minValue, maxValue, tagName){
        let result = Math.min(Math.max(inValue, minValue), maxValue);
        if(inValue > maxValue){
          console.warn(`The tag, ${tagName}, with a value of ${inValue} is outside of it's range and was clamped. It has a max value of ${maxValue} and a minimum value of ${minValue}.`);
        }
        else if(inValue < minValue){
          console.warn(`The tag, ${tagName}, with a value of ${inValue} is outside of it's range and was clamped. It has a minmum value of ${minValue} and a minimum value of ${minValue}.`);
        }
        return result;
      };

      //By some horrible situation. The maximum and minimum offset for UTC timze is 26 hours apart.
      self.data.latitude = self.data.latitude ? clampAndWarn(self.data.latitude, -90.0, 90.0, '<sky-latitude>') : null;
      self.data.longitude = self.data.longitude ? clampAndWarn(self.data.longitude, -180.0, 180.0, '<sky-longitude>') : null;
      self.skyDataLoaded = true;
      document.dispatchEvent(new Event('Sky-Data-Loaded'));
    });
  };
}
window.customElements.define('sky-location', SkyLocation);

//Child tags
window.customElements.define('sky-date', class extends HTMLElement{});
window.customElements.define('sky-speed', class extends HTMLElement{});
window.customElements.define('sky-utc-offset', class extends HTMLElement{});

let hideStarrySkyTemplate = document.createElement('template');
hideStarrySkyTemplate.innerHTML = `<style display="none;">{ ... }</style>`;

StarrySky.DefaultData.time;
(function setupAStarrySkyDefaultTimeData(){
  //Using https://stackoverflow.com/questions/10632346/how-to-format-a-date-in-mm-dd-yyyy-hhmmss-format-in-javascript
  const now = new Date();
  StarrySky.DefaultData.time = {
    date: [now.getMonth()+1,
               now.getDate(),
               now.getFullYear()].join('/')+' '+
              [now.getHours(),
               now.getMinutes(),
               now.getSeconds()].join(':'),
    utcOffset: 7,
    speed: 1.0
  };
})();

//Parent tag
class SkyTime extends HTMLElement {
  constructor(){
    super();

    this.skyDataLoaded = false;
    this.data = StarrySky.DefaultData.time;
  };

  connectedCallback(){
    //Hide the element
    this.style.display = "none";

    let self = this;
    document.addEventListener('DOMContentLoaded', function(evt){
      //Get child tags and acquire their values.
      let skyDateTags = self.getElementsByTagName('sky-date');
      let speedTags = self.getElementsByTagName('sky-speed');
      let utcOffsetTags = self.getElementsByTagName('sky-utc-offset');

      [skyDateTags, utcOffsetTags, speedTags].forEach(function(tags){
        if(tags.length > 1){
          console.error(`The <sky-time> tag can only contain 1 tag of type <${tags[0].tagName}>. ${tags.length} found.`);
        }
      });

      //Set the params to appropriate values or default
      self.data.date = skyDateTags.length > 0 ? skyDateTags[0].innerHTML : self.data.date;
      self.data.utcOffset = utcOffsetTags.length > 0 ? -parseFloat(utcOffsetTags[0].innerHTML) : self.data.utcOffset;
      self.data.speed = speedTags.length > 0 ? parseFloat(speedTags[0].innerHTML) : self.data.speed;

      let clampAndWarn = function(inValue, minValue, maxValue, tagName){
        let result = Math.min(Math.max(inValue, minValue), maxValue);
        if(inValue > maxValue){
          console.warn(`The tag, ${tagName}, with a value of ${inValue} is outside of it's range and was clamped. It has a max value of ${maxValue} and a minimum value of ${minValue}.`);
        }
        else if(inValue < minValue){
          console.warn(`The tag, ${tagName}, with a value of ${inValue} is outside of it's range and was clamped. It has a minmum value of ${minValue} and a minimum value of ${minValue}.`);
        }
        return result;
      };

      //By some horrible situation. The maximum and minimum offset for UTC timze is 26 hours apart.
      self.data.utcOffset = self.data.utcOffset ? clampAndWarn(self.data.utcOffset, -14.0, 12.0, '<sky-utc-offset>') : null;
      self.data.speed = self.data.speed ? clampAndWarn(self.data.speed, 0.0, 1000.0, '<sky-speed>') :null;
      self.skyDataLoaded = true;
      document.dispatchEvent(new Event('Sky-Data-Loaded'));
    });
  };
}
window.customElements.define('sky-time', SkyTime);

//Child tags
window.customElements.define('sky-ground-color', class extends HTMLElement{});
window.customElements.define('sky-ground-color-red', class extends HTMLElement{});
window.customElements.define('sky-ground-color-green', class extends HTMLElement{});
window.customElements.define('sky-ground-color-blue', class extends HTMLElement{});
window.customElements.define('sky-atmospheric-perspective-density', class extends HTMLElement{});
window.customElements.define('sky-shadow-camera-size', class extends HTMLElement{});
window.customElements.define('sky-shadow-camera-resolution', class extends HTMLElement{});

StarrySky.DefaultData.lighting = {
  groundColor: {
    red: 66,
    green: 44,
    blue: 2
  },
  atmosphericPerspectiveEnabled: true,
  atmosphericPerspectiveDensity: 0.007,
  shadowCameraSize: 32.0,
  shadowCameraResolution: 2048
};

//Parent tag
class SkyLighting extends HTMLElement {
  constructor(){
    super();

    //Check if there are any child elements. Otherwise set them to the default.
    this.skyDataLoaded = false;
    this.data = StarrySky.DefaultData.lighting;
  }

  connectedCallback(){
    //Hide the element
    this.style.display = "none";

    let self = this;
    document.addEventListener('DOMContentLoaded', function(evt){
      //Get child tags and acquire their values.
      let groundColorTags = self.getElementsByTagName('sky-ground-color');
      let atmosphericPerspectiveDensityTags = self.getElementsByTagName('sky-atmospheric-perspective-density');
      let shadowCameraSizeTags = self.getElementsByTagName('sky-shadow-camera-size');
      let shadowCameraResolutionTags = self.getElementsByTagName('sky-shadow-camera-resolution');

      [groundColorTags, atmosphericPerspectiveDensityTags, shadowCameraSizeTags, shadowCameraResolutionTags].forEach(function(tags){
        if(tags.length > 1){
          console.error(`The <sky-lighting-parameters> tag can only contain 1 tag of type <${tags[0].tagName}>. ${tags.length} found.`);
        }
      });

      //With special subcases for our ground color tags
      [groundColorTags].forEach(function(tags){
        if(tags.length === 1){
          //Check that it only contains one of each of the following child tags
          let redTags = tags[0].getElementsByTagName('sky-ground-color-red');
          let greenTags = tags[0].getElementsByTagName('sky-ground-color-green');
          let blueTags = tags[0].getElementsByTagName('sky-ground-color-blue');
          [redTags, greenTags, blueTags].forEach(function(colorTags){
            if(tags.length !== 1){
              console.error(`The <${tags[0].tagName}> tag must contain 1 and only 1 tag of type <${colorTags[0].tagName}>. ${colorTags.length} found.`);
            }
          });
        }
      });

      //Parse the values in our tags
      self.data.atmosphericPerspectiveDensity = atmosphericPerspectiveDensityTags.length > 0 ? parseFloat(atmosphericPerspectiveDensityTags[0].innerHTML) : self.data.atmosphericPerspectiveDensity;
      self.data.atmosphericPerspectiveEnabled = self.data.atmosphericPerspectiveDensity > 0.0;
      self.data.shadowCameraSize = shadowCameraSizeTags.length > 0 ? parseFloat(shadowCameraSizeTags[0].innerHTML) : self.data.shadowCameraSize;
      self.data.shadowCameraResolution = shadowCameraResolutionTags.length > 0 ? parseFloat(shadowCameraResolutionTags[0].innerHTML) : self.data.shadowCameraResolution;

      //Clamp our results to the appropriate ranges
      let clampAndWarn = function(inValue, minValue, maxValue, tagName){
        let result = Math.min(Math.max(inValue, minValue), maxValue);
        if(inValue > maxValue){
          console.warn(`The tag, ${tagName}, with a value of ${inValue} is outside of it's range and was clamped. It has a max value of ${maxValue} and a minimum value of ${minValue}.`);
        }
        else if(inValue < minValue){
          console.warn(`The tag, ${tagName}, with a value of ${inValue} is outside of it's range and was clamped. It has a minmum value of ${minValue} and a minimum value of ${minValue}.`);
        }
        return result;
      };

      //Clamp the values in our tags
      self.data.atmosphericPerspectiveDensity = clampAndWarn(self.data.atmosphericPerspectiveDensity, 0.0, Infinity, '<sky-atmospheric-perspective-density>');
      self.data.shadowCameraSize = clampAndWarn(self.data.shadowCameraSize, 0.0, Infinity, '<sky-shadow-camera-size>');
      self.data.shadowCameraResolution = clampAndWarn(self.data.shadowCameraResolution, 32, 15360, '<sky-shadow-camera-resolution>');

      //Parse our ground color
      if(groundColorTags.length === 1){
        const firstGroundColorTagGroup = groundColorTags[0];
        if(firstGroundColorTagGroup.getElementsByTagName('sky-ground-color-red').length > 0){
          self.data.groundColor.red = clampAndWarn(parseInt(firstGroundColorTagGroup.getElementsByTagName('sky-ground-color-red')[0].innerHTML), 0, 255, 'sky-ground-color-red');
        }
        if(firstGroundColorTagGroup.getElementsByTagName('sky-ground-color-green').length > 0){
          self.data.groundColor.green = clampAndWarn(parseInt(firstGroundColorTagGroup.getElementsByTagName('sky-ground-color-green')[0].innerHTML), 0, 255, 'sky-ground-color-red');
        }
        if(firstGroundColorTagGroup.getElementsByTagName('sky-ground-color-blue').length > 0){
          self.data.groundColor.blue = clampAndWarn(parseInt(firstGroundColorTagGroup.getElementsByTagName('sky-ground-color-blue')[0].innerHTML), 0, 255, 'sky-ground-color-red');
        }
      }

      self.skyDataLoaded = true;
      document.dispatchEvent(new Event('Sky-Data-Loaded'));
    });
  };
}
window.customElements.define('sky-lighting', SkyLighting);

StarrySky.LUTlibraries.AtmosphericLUTLibrary = function(data, renderer, scene){
  this.renderer = renderer;
  this.data = data;
  this.sunLUT;
  this.moonLUT;
  this.lunarEcclipseLUTs = [];
  document.body.appendChild(renderer.domElement);

  //Create our first renderer, for transmittance
  const TRANSMITTANCE_TEXTURE_SIZE = 512;
  const SCATTERING_TEXTURE_WIDTH = 256;
  const SCATTERING_TEXTURE_HEIGHT = 1024; //32x32
  this.transmittanceTextureSize = TRANSMITTANCE_TEXTURE_SIZE;
  let transmittanceRenderer = new THREE.StarrySkyComputationRenderer(TRANSMITTANCE_TEXTURE_SIZE, TRANSMITTANCE_TEXTURE_SIZE, renderer);
  let singleScatteringRenderer = new THREE.StarrySkyComputationRenderer(SCATTERING_TEXTURE_WIDTH, SCATTERING_TEXTURE_HEIGHT, renderer);
  let scatteringSumRenderer = new THREE.StarrySkyComputationRenderer(SCATTERING_TEXTURE_WIDTH, SCATTERING_TEXTURE_HEIGHT, renderer);

  let materials = StarrySky.Materials.Atmosphere;

  //Depth texture parameters. Note that texture depth is packing width * packing height
  this.scatteringTextureWidth = 256;
  this.scatteringTextureHeight = 32;
  this.scatteringTexturePackingWidth = 1;
  this.scatteringTexturePackingHeight = 32;
  const mieGCoefficient = data.skyAtmosphericParameters.mieDirectionalG;

  //Grab our atmospheric functions partial, we also store it in the library
  //as we use it in the final atmospheric material.
  this.atmosphereFunctionsString = materials.atmosphereFunctions.partialFragmentShader(
    this.scatteringTextureWidth,
    this.scatteringTextureHeight,
    this.scatteringTexturePackingWidth,
    this.scatteringTexturePackingHeight,
    this.data.skyAtmosphericParameters.mieDirectionalG
  );
  let atmosphereFunctions = this.atmosphereFunctionsString;

  //Set up our transmittance texture
  let transmittanceTexture = transmittanceRenderer.createTexture();
  let transmittanceVar = transmittanceRenderer.addVariable('transmittanceTexture',
    materials.transmittanceMaterial.fragmentShader(data.skyAtmosphericParameters.numberOfRaySteps, atmosphereFunctions),
    transmittanceTexture
  );
  transmittanceRenderer.setVariableDependencies(transmittanceVar, []);
  transmittanceVar.material.uniforms = {};
  transmittanceVar.type = THREE.FloatType;
  transmittanceVar.format = THREE.RGBAFormat;
  transmittanceVar.minFilter = THREE.LinearFilter;
  transmittanceVar.magFilter = THREE.LinearFilter;
  transmittanceVar.wrapS = THREE.ClampToEdgeWrapping;
  transmittanceVar.wrapT = THREE.ClampToEdgeWrapping;
  transmittanceVar.encoding = THREE.LinearEncoding;

  //Check for any errors in initialization
  let error1 = transmittanceRenderer.init();
  if(error1 !== null){
    console.error(`Transmittance Renderer: ${error1}`);
  }

  //Run the actual shader
  transmittanceRenderer.compute();
  let transmittanceRenderTarget = transmittanceRenderer.getCurrentRenderTarget(transmittanceVar);
  let transmittanceLUT = transmittanceRenderTarget.texture;
  const BYTES_PER_32_BIT_FLOAT = 4;
  this.transferrableTransmittanceBuffer = new ArrayBuffer(BYTES_PER_32_BIT_FLOAT * TRANSMITTANCE_TEXTURE_SIZE * TRANSMITTANCE_TEXTURE_SIZE * 4);
  this.transferableTransmittanceFloat32Array = new Float32Array(this.transferrableTransmittanceBuffer);
  this.renderer.readRenderTargetPixels(transmittanceRenderTarget, 0, 0, TRANSMITTANCE_TEXTURE_SIZE, TRANSMITTANCE_TEXTURE_SIZE, this.transferableTransmittanceFloat32Array);

  //
  //Set up our single scattering texture
  //
  //Mie
  let singleScatteringMieTexture = singleScatteringRenderer.createTexture();
  let singleScatteringMieVar = singleScatteringRenderer.addVariable('kthInscatteringMie',
    materials.singleScatteringMaterial.fragmentShader(
      data.skyAtmosphericParameters.numberOfRaySteps,
      this.scatteringTextureWidth,
      this.scatteringTextureHeight,
      this.scatteringTexturePackingWidth,
      this.scatteringTexturePackingHeight,
      false, //Is Rayleigh
      atmosphereFunctions
    ),
    singleScatteringMieTexture
  );
  singleScatteringRenderer.setVariableDependencies(singleScatteringMieVar, []);
  singleScatteringMieVar.material.uniforms = JSON.parse(JSON.stringify(materials.singleScatteringMaterial.uniforms));
  singleScatteringMieVar.material.uniforms.transmittanceTexture.value = transmittanceLUT;
  singleScatteringMieVar.type = THREE.FloatType;
  singleScatteringMieVar.format = THREE.RGBAFormat;
  singleScatteringMieVar.minFilter = THREE.NearestFilter;
  singleScatteringMieVar.magFilter = THREE.NearestFilter;
  singleScatteringMieVar.wrapS = THREE.ClampToEdgeWrapping;
  singleScatteringMieVar.wrapT = THREE.ClampToEdgeWrapping;
  singleScatteringMieVar.encoding = THREE.LinearEncoding;

  //Rayleigh
  let singleScatteringRayleighTexture = singleScatteringRenderer.createTexture();
  let singleScatteringRayleighVar = singleScatteringRenderer.addVariable('kthInscatteringRayleigh',
    materials.singleScatteringMaterial.fragmentShader(
      data.skyAtmosphericParameters.numberOfRaySteps,
      this.scatteringTextureWidth,
      this.scatteringTextureHeight,
      this.scatteringTexturePackingWidth,
      this.scatteringTexturePackingHeight,
      true, //Is Rayleigh
      atmosphereFunctions
    ),
    singleScatteringRayleighTexture
  );
  singleScatteringRenderer.setVariableDependencies(singleScatteringRayleighVar, []);
  singleScatteringRayleighVar.material.uniforms = JSON.parse(JSON.stringify(materials.singleScatteringMaterial.uniforms));
  singleScatteringRayleighVar.material.uniforms.transmittanceTexture.value = transmittanceLUT;
  singleScatteringRayleighVar.type = THREE.FloatType;
  singleScatteringRayleighVar.format = THREE.RGBAFormat;
  singleScatteringRayleighVar.minFilter = THREE.NearestFilter;
  singleScatteringRayleighVar.magFilter = THREE.NearestFilter;
  singleScatteringRayleighVar.wrapS = THREE.ClampToEdgeWrapping;
  singleScatteringRayleighVar.wrapT = THREE.ClampToEdgeWrapping;
  singleScatteringRayleighVar.encoding = THREE.LinearEncoding;

  //Check for any errors in initialization
  let error2 = singleScatteringRenderer.init();
  if(error2 !== null){
    console.error(`Single Scattering Renderer: ${error2}`);
  }

  //Run the scattering shader
  singleScatteringRenderer.compute();
  const mieSingleScatteringRenderTarget = singleScatteringRenderer.getCurrentRenderTarget(singleScatteringMieVar);
  const rayleighSingleScatteringRenderTarget = singleScatteringRenderer.getCurrentRenderTarget(singleScatteringRayleighVar);
  //Convert this to a 3-D LUT
  const singleScatteringMieFloat32Array = new Float32Array(SCATTERING_TEXTURE_WIDTH * SCATTERING_TEXTURE_HEIGHT * 4);
  renderer.readRenderTargetPixels(mieSingleScatteringRenderTarget, 0, 0, SCATTERING_TEXTURE_WIDTH, SCATTERING_TEXTURE_HEIGHT, singleScatteringMieFloat32Array);
  const singleScatteringMie3DLUT = new THREE.DataTexture3D(singleScatteringMieFloat32Array, SCATTERING_TEXTURE_WIDTH, this.scatteringTextureHeight, this.scatteringTexturePackingHeight);
  singleScatteringMie3DLUT.type = THREE.FloatType;
  singleScatteringMie3DLUT.format = THREE.RGBAFormat;
  singleScatteringMie3DLUT.minFilter = THREE.LinearFilter;
  singleScatteringMie3DLUT.magFilter = THREE.LinearFilter;
  singleScatteringMie3DLUT.wrapS = THREE.ClampToEdgeWrapping;
  singleScatteringMie3DLUT.wrapT = THREE.ClampToEdgeWrapping;
  singleScatteringMie3DLUT.wrapR = THREE.ClampToEdgeWrapping;
  singleScatteringMie3DLUT.encoding = THREE.LinearEncoding;
  singleScatteringMie3DLUT.needsUpdate = true;

  const singleScatteringRayleighFloat32Array = new Float32Array(SCATTERING_TEXTURE_WIDTH * SCATTERING_TEXTURE_HEIGHT * 4);
  renderer.readRenderTargetPixels(rayleighSingleScatteringRenderTarget, 0, 0, SCATTERING_TEXTURE_WIDTH, SCATTERING_TEXTURE_HEIGHT, singleScatteringRayleighFloat32Array);
  const singleScatteringRayleigh3DLUT = new THREE.DataTexture3D(singleScatteringRayleighFloat32Array, SCATTERING_TEXTURE_WIDTH, this.scatteringTextureHeight, this.scatteringTexturePackingHeight);
  singleScatteringRayleigh3DLUT.type = THREE.FloatType;
  singleScatteringRayleigh3DLUT.format = THREE.RGBAFormat;
  singleScatteringRayleigh3DLUT.minFilter = THREE.LinearFilter;
  singleScatteringRayleigh3DLUT.magFilter = THREE.LinearFilter;
  singleScatteringRayleigh3DLUT.wrapS = THREE.ClampToEdgeWrapping;
  singleScatteringRayleigh3DLUT.wrapT = THREE.ClampToEdgeWrapping;
  singleScatteringRayleigh3DLUT.wrapR = THREE.ClampToEdgeWrapping;
  singleScatteringRayleigh3DLUT.encoding = THREE.LinearEncoding;
  singleScatteringRayleigh3DLUT.needsUpdate = true;

  //Combine our two shaders together into an inscattering sum texture
  let inscatteringRayleighSumTexture = scatteringSumRenderer.createTexture();
  let inscatteringRayleighSumVar = scatteringSumRenderer.addVariable('inscatteringRayleighSumTexture',
    materials.inscatteringSumMaterial.fragmentShader, //Initializing
    inscatteringRayleighSumTexture
  );
  scatteringSumRenderer.setVariableDependencies(inscatteringRayleighSumVar, []);
  inscatteringRayleighSumVar.material.uniforms = JSON.parse(JSON.stringify(materials.inscatteringSumMaterial.uniforms));
  inscatteringRayleighSumVar.material.uniforms.isNotFirstIteration.value = 0;
  inscatteringRayleighSumVar.material.uniforms.inscatteringTexture.value = rayleighSingleScatteringRenderTarget.texture;
  inscatteringRayleighSumVar.type = THREE.FloatType;
  inscatteringRayleighSumVar.format = THREE.RGBAFormat;
  inscatteringRayleighSumVar.minFilter = THREE.NearestFilter;
  inscatteringRayleighSumVar.magFilter = THREE.NearestFilter;
  inscatteringRayleighSumVar.wrapS = THREE.ClampToEdgeWrapping;
  inscatteringRayleighSumVar.wrapT = THREE.ClampToEdgeWrapping;
  inscatteringRayleighSumVar.encoding = THREE.LinearEncoding;

  let inscatteringMieSumTexture = scatteringSumRenderer.createTexture();
  let inscatteringMieSumVar = scatteringSumRenderer.addVariable('inscatteringMieSumTexture',
    materials.inscatteringSumMaterial.fragmentShader, //Initializing
    inscatteringMieSumTexture
  );
  scatteringSumRenderer.setVariableDependencies(inscatteringMieSumVar, []);
  inscatteringMieSumVar.material.uniforms = JSON.parse(JSON.stringify(materials.inscatteringSumMaterial.uniforms));
  inscatteringMieSumVar.material.uniforms.isNotFirstIteration.value = 0;
  inscatteringMieSumVar.material.uniforms.inscatteringTexture.value = mieSingleScatteringRenderTarget.texture;
  inscatteringMieSumVar.type = THREE.FloatType;
  inscatteringMieSumVar.format = THREE.RGBAFormat;
  inscatteringMieSumVar.minFilter = THREE.NearestFilter;
  inscatteringMieSumVar.magFilter = THREE.NearestFilter;
  inscatteringMieSumVar.wrapS = THREE.ClampToEdgeWrapping;
  inscatteringMieSumVar.wrapT = THREE.ClampToEdgeWrapping;
  inscatteringMieSumVar.encoding = THREE.LinearEncoding;

  //Check for any errors in initialization
  let error3 = scatteringSumRenderer.init();
  if(error3 !== null){
    console.error(`Single Scattering Sum Renderer: ${error3}`);
  }
  scatteringSumRenderer.compute();

  let mieScatteringSumRenderTarget = scatteringSumRenderer.getCurrentRenderTarget(inscatteringMieSumVar);
  let mieScatteringSum = mieScatteringSumRenderTarget.texture;
  let rayleighScatteringSumRenderTarget = scatteringSumRenderer.getCurrentRenderTarget(inscatteringRayleighSumVar);
  rayleighScatteringSumRenderTarget = scatteringSumRenderer.getCurrentRenderTarget(inscatteringRayleighSumVar);
  let rayleighScatteringSum = rayleighScatteringSumRenderTarget.texture;

  //
  //Set up our multiple scattering textures
  //
  let multipleScatteringRenderer = new THREE.StarrySkyComputationRenderer(SCATTERING_TEXTURE_WIDTH, SCATTERING_TEXTURE_HEIGHT, renderer);

  //Mie
  let multipleScatteringMieTexture = multipleScatteringRenderer.createTexture();
  let multipleScatteringMieVar = multipleScatteringRenderer.addVariable('kthInscatteringMie',
    materials.kthInscatteringMaterial.fragmentShader(
      data.skyAtmosphericParameters.numberOfRaySteps,
      this.scatteringTextureWidth,
      this.scatteringTextureHeight,
      this.scatteringTexturePackingWidth,
      this.scatteringTexturePackingHeight,
      mieGCoefficient,
      false, //Is Rayleigh
      atmosphereFunctions
    ),
    multipleScatteringMieTexture
  );
  multipleScatteringRenderer.setVariableDependencies(multipleScatteringMieVar, []);
  multipleScatteringMieVar.material.uniforms = JSON.parse(JSON.stringify(materials.kthInscatteringMaterial.uniforms));
  multipleScatteringMieVar.material.uniforms.transmittanceTexture.value = transmittanceLUT;
  multipleScatteringMieVar.material.uniforms.inscatteredLightLUT.value = singleScatteringMie3DLUT;
  multipleScatteringMieVar.type = THREE.FloatType;
  multipleScatteringMieVar.format = THREE.RGBAFormat;
  multipleScatteringMieVar.minFilter = THREE.NearestFilter;
  multipleScatteringMieVar.magFilter = THREE.NearestFilter;
  multipleScatteringMieVar.wrapS = THREE.ClampToEdgeWrapping;
  multipleScatteringMieVar.wrapT = THREE.ClampToEdgeWrapping;
  multipleScatteringMieVar.encoding = THREE.LinearEncoding;

  //Rayleigh
  let multipleScatteringRayleighTexture = multipleScatteringRenderer.createTexture();
  let multipleScatteringRayleighVar = multipleScatteringRenderer.addVariable('kthInscatteringRayleigh',
    materials.kthInscatteringMaterial.fragmentShader(
      data.skyAtmosphericParameters.numberOfRaySteps,
      this.scatteringTextureWidth,
      this.scatteringTextureHeight,
      this.scatteringTexturePackingWidth,
      this.scatteringTexturePackingHeight,
      mieGCoefficient,
      true, //Is Rayleigh
      atmosphereFunctions
    ),
    multipleScatteringRayleighTexture
  );
  multipleScatteringRenderer.setVariableDependencies(multipleScatteringRayleighVar, []);
  multipleScatteringRayleighVar.material.uniforms = JSON.parse(JSON.stringify(materials.kthInscatteringMaterial.uniforms));
  multipleScatteringRayleighVar.material.uniforms.transmittanceTexture.value = transmittanceLUT;
  multipleScatteringRayleighVar.material.uniforms.inscatteredLightLUT.value = singleScatteringRayleigh3DLUT;
  multipleScatteringRayleighVar.type = THREE.FloatType;
  multipleScatteringRayleighVar.format = THREE.RGBAFormat;
  multipleScatteringRayleighVar.minFilter = THREE.NearestFilter;
  multipleScatteringRayleighVar.magFilter = THREE.NearestFilter;
  multipleScatteringRayleighVar.wrapS = THREE.ClampToEdgeWrapping;
  multipleScatteringRayleighVar.wrapT = THREE.ClampToEdgeWrapping;
  multipleScatteringRayleighVar.encoding = THREE.LinearEncoding;

  //Check for any errors in initialization
  let error4 = multipleScatteringRenderer.init();
  if(error4 !== null){
    console.error(`Multiple Scattering Renderer: ${error4}`);
  }

  //Run the multiple scattering shader
  multipleScatteringRenderer.compute();
  let multipleMieScatteringRenderTarget = multipleScatteringRenderer.getCurrentRenderTarget(multipleScatteringMieVar);
  let multipleRayleighScatteringRenderTarget = multipleScatteringRenderer.getCurrentRenderTarget(multipleScatteringRayleighVar);

  // //And create our 3-D Texture again...
  let multipleScatteringMieFloat32Array = new Float32Array(SCATTERING_TEXTURE_WIDTH * SCATTERING_TEXTURE_HEIGHT * 4);
  renderer.readRenderTargetPixels(multipleMieScatteringRenderTarget, 0, 0, SCATTERING_TEXTURE_WIDTH, SCATTERING_TEXTURE_HEIGHT, multipleScatteringMieFloat32Array);
  let multipleScatteringMie3DLUT = new THREE.DataTexture3D(multipleScatteringMieFloat32Array, SCATTERING_TEXTURE_WIDTH, this.scatteringTextureHeight, this.scatteringTexturePackingHeight);
  multipleScatteringMie3DLUT.type = THREE.FloatType;
  multipleScatteringMie3DLUT.format = THREE.RGBAFormat;
  multipleScatteringMie3DLUT.minFilter = THREE.LinearFilter;
  multipleScatteringMie3DLUT.magFilter = THREE.LinearFilter;
  multipleScatteringMie3DLUT.wrapS = THREE.ClampToEdgeWrapping;
  multipleScatteringMie3DLUT.wrapT = THREE.ClampToEdgeWrapping;
  multipleScatteringMie3DLUT.wrapR = THREE.ClampToEdgeWrapping;
  multipleScatteringMie3DLUT.encoding = THREE.LinearEncoding;
  multipleScatteringMie3DLUT.needsUpdate = true;
  //
  let multipleScatteringRayleighFloat32Array = new Float32Array(SCATTERING_TEXTURE_WIDTH * SCATTERING_TEXTURE_HEIGHT * 4);
  renderer.readRenderTargetPixels(multipleRayleighScatteringRenderTarget, 0, 0, SCATTERING_TEXTURE_WIDTH, SCATTERING_TEXTURE_HEIGHT, multipleScatteringRayleighFloat32Array);
  let multipleScatteringRayleigh3DLUT = new THREE.DataTexture3D(multipleScatteringRayleighFloat32Array, SCATTERING_TEXTURE_WIDTH, this.scatteringTextureHeight, this.scatteringTexturePackingHeight);
  multipleScatteringRayleigh3DLUT.type = THREE.FloatType;
  multipleScatteringRayleigh3DLUT.format = THREE.RGBAFormat;
  multipleScatteringRayleigh3DLUT.minFilter = THREE.LinearFilter;
  multipleScatteringRayleigh3DLUT.magFilter = THREE.LinearFilter;
  multipleScatteringRayleigh3DLUT.wrapS = THREE.ClampToEdgeWrapping;
  multipleScatteringRayleigh3DLUT.wrapT = THREE.ClampToEdgeWrapping;
  multipleScatteringRayleigh3DLUT.wrapR = THREE.ClampToEdgeWrapping;
  multipleScatteringRayleigh3DLUT.encoding = THREE.LinearEncoding;
  multipleScatteringRayleigh3DLUT.needsUpdate = true;

  //Sum
  inscatteringRayleighSumVar.material.uniforms.isNotFirstIteration.value = 1;
  inscatteringRayleighSumVar.material.uniforms.inscatteringTexture.value = multipleRayleighScatteringRenderTarget.texture;
  inscatteringRayleighSumVar.material.uniforms.previousInscatteringSum.value = rayleighScatteringSum;
  inscatteringMieSumVar.material.uniforms.isNotFirstIteration.value = 1;
  inscatteringMieSumVar.material.uniforms.inscatteringTexture.value = multipleMieScatteringRenderTarget.texture;
  inscatteringMieSumVar.material.uniforms.previousInscatteringSum.value = mieScatteringSum;
  scatteringSumRenderer.compute();
  rayleighScatteringSumRenderTarget = scatteringSumRenderer.getCurrentRenderTarget(inscatteringRayleighSumVar);
  mieScatteringSumRenderTarget = scatteringSumRenderer.getCurrentRenderTarget(inscatteringMieSumVar);
  rayleighScatteringSum = rayleighScatteringSumRenderTarget.texture;
  mieScatteringSum = mieScatteringSumRenderTarget.texture;

  // Let's just focus on the second order scattering until that looks correct, possibly giving
  // another look over the first order scattering to make sure we have that correct as well.
  for(let i = 0; i < 7; ++i){
    multipleScatteringMieVar.material.uniforms.inscatteredLightLUT.value = multipleScatteringMie3DLUT;
    multipleScatteringRayleighVar.material.uniforms.inscatteredLightLUT.value = multipleScatteringRayleigh3DLUT;

    //Compute this mie and rayliegh scattering order
    multipleScatteringRenderer.compute();
    multipleMieScatteringRenderTarget = multipleScatteringRenderer.getCurrentRenderTarget(multipleScatteringMieVar);
    multipleRayleighScatteringRenderTarget = multipleScatteringRenderer.getCurrentRenderTarget(multipleScatteringRayleighVar);

    //And create our 3-D textures again...
    if(i !== 6){
      multipleScatteringMieFloat32Array = new Float32Array(SCATTERING_TEXTURE_WIDTH * SCATTERING_TEXTURE_HEIGHT * 4);
      renderer.readRenderTargetPixels(multipleMieScatteringRenderTarget, 0, 0, SCATTERING_TEXTURE_WIDTH, SCATTERING_TEXTURE_HEIGHT, multipleScatteringMieFloat32Array);
      multipleScatteringMie3DLUT = new THREE.DataTexture3D(multipleScatteringMieFloat32Array, SCATTERING_TEXTURE_WIDTH, this.scatteringTextureHeight, this.scatteringTexturePackingHeight);
      multipleScatteringMie3DLUT.type = THREE.FloatType;
      multipleScatteringMie3DLUT.format = THREE.RGBAFormat;
      multipleScatteringMie3DLUT.minFilter = THREE.LinearFilter;
      multipleScatteringMie3DLUT.magFilter = THREE.LinearFilter;
      multipleScatteringMie3DLUT.wrapS = THREE.ClampToEdgeWrapping;
      multipleScatteringMie3DLUT.wrapT = THREE.ClampToEdgeWrapping;
      multipleScatteringMie3DLUT.wrapR = THREE.ClampToEdgeWrapping;
      multipleScatteringMie3DLUT.encoding = THREE.LinearEncoding;
      multipleScatteringMie3DLUT.needsUpdate = true;

      multipleScatteringRayleighFloat32Array = new Float32Array(SCATTERING_TEXTURE_WIDTH * SCATTERING_TEXTURE_HEIGHT * 4);
      renderer.readRenderTargetPixels(multipleRayleighScatteringRenderTarget, 0, 0, SCATTERING_TEXTURE_WIDTH, SCATTERING_TEXTURE_HEIGHT, multipleScatteringRayleighFloat32Array);
      multipleScatteringRayleigh3DLUT = new THREE.DataTexture3D(multipleScatteringRayleighFloat32Array, SCATTERING_TEXTURE_WIDTH, this.scatteringTextureHeight, this.scatteringTexturePackingHeight);
      multipleScatteringRayleigh3DLUT.type = THREE.FloatType;
      multipleScatteringRayleigh3DLUT.format = THREE.RGBAFormat;
      multipleScatteringRayleigh3DLUT.minFilter = THREE.LinearFilter;
      multipleScatteringRayleigh3DLUT.magFilter = THREE.LinearFilter;
      multipleScatteringRayleigh3DLUT.wrapS = THREE.ClampToEdgeWrapping;
      multipleScatteringRayleigh3DLUT.wrapT = THREE.ClampToEdgeWrapping;
      multipleScatteringRayleigh3DLUT.wrapR = THREE.ClampToEdgeWrapping;
      multipleScatteringRayleigh3DLUT.encoding = THREE.LinearEncoding;
      multipleScatteringRayleigh3DLUT.needsUpdate = true;
    }

    //Sum
    inscatteringRayleighSumVar.material.uniforms.inscatteringTexture.value = multipleRayleighScatteringRenderTarget.texture;
    inscatteringRayleighSumVar.material.uniforms.previousInscatteringSum.value = rayleighScatteringSum;
    inscatteringMieSumVar.material.uniforms.inscatteringTexture.value = multipleMieScatteringRenderTarget.texture;
    inscatteringMieSumVar.material.uniforms.previousInscatteringSum.value = mieScatteringSum;
    scatteringSumRenderer.compute();
    rayleighScatteringSumRenderTarget = scatteringSumRenderer.getCurrentRenderTarget(inscatteringRayleighSumVar);
    rayleighScatteringSum = rayleighScatteringSumRenderTarget.texture;
    mieScatteringSumRenderTarget = scatteringSumRenderer.getCurrentRenderTarget(inscatteringMieSumVar);
    mieScatteringSum = mieScatteringSumRenderTarget.texture;
  }

  //And finally create a 3-D texture for our sum, which is what we really want...
  renderer.readRenderTargetPixels(mieScatteringSumRenderTarget, 0, 0, SCATTERING_TEXTURE_WIDTH, SCATTERING_TEXTURE_HEIGHT, multipleScatteringMieFloat32Array);
  multipleScatteringMie3DLUT = new THREE.DataTexture3D(multipleScatteringMieFloat32Array, SCATTERING_TEXTURE_WIDTH, this.scatteringTextureHeight, this.scatteringTexturePackingHeight);
  multipleScatteringMie3DLUT.type = THREE.FloatType;
  multipleScatteringMie3DLUT.format = THREE.RGBAFormat;
  multipleScatteringMie3DLUT.minFilter = THREE.LinearFilter;
  multipleScatteringMie3DLUT.magFilter = THREE.LinearFilter;
  multipleScatteringMie3DLUT.wrapS = THREE.ClampToEdgeWrapping;
  multipleScatteringMie3DLUT.wrapT = THREE.ClampToEdgeWrapping;
  multipleScatteringMie3DLUT.wrapR = THREE.ClampToEdgeWrapping;
  multipleScatteringMie3DLUT.encoding = THREE.LinearEncoding;
  multipleScatteringMie3DLUT.needsUpdate = true;

  renderer.readRenderTargetPixels(rayleighScatteringSumRenderTarget, 0, 0, SCATTERING_TEXTURE_WIDTH, SCATTERING_TEXTURE_HEIGHT, multipleScatteringRayleighFloat32Array);
  multipleScatteringRayleigh3DLUT = new THREE.DataTexture3D(multipleScatteringRayleighFloat32Array, SCATTERING_TEXTURE_WIDTH, this.scatteringTextureHeight, this.scatteringTexturePackingHeight);
  multipleScatteringRayleigh3DLUT.type = THREE.FloatType;
  multipleScatteringRayleigh3DLUT.format = THREE.RGBAFormat;
  multipleScatteringRayleigh3DLUT.minFilter = THREE.LinearFilter;
  multipleScatteringRayleigh3DLUT.magFilter = THREE.LinearFilter;
  multipleScatteringRayleigh3DLUT.wrapS = THREE.ClampToEdgeWrapping;
  multipleScatteringRayleigh3DLUT.wrapT = THREE.ClampToEdgeWrapping;
  multipleScatteringRayleigh3DLUT.wrapR = THREE.ClampToEdgeWrapping;
  multipleScatteringRayleigh3DLUT.encoding = THREE.LinearEncoding;
  multipleScatteringRayleigh3DLUT.needsUpdate = true;

  //Clean up and finishin attaching things we will need
  this.transmittance = transmittanceLUT;
  this.mieScatteringSum = multipleScatteringMie3DLUT;
  this.rayleighScatteringSum = multipleScatteringRayleigh3DLUT;
}

StarrySky.LUTlibraries.StellarLUTLibrary = function(data, renderer, scene){
  this.renderer = renderer;
  this.dimStarDataMap;
  this.medStarDataMap;
  this.brightStarDataMap;
  this.noiseMap;

  //Enable the OES_texture_float_linear extension
  if(!renderer.capabilities.isWebGL2 && !renderer.extensions.get("OES_texture_float_linear")){
    console.error("No linear interpolation of OES textures allowed.");
    return false;
  }

  //Enable 32 bit float textures
  if(!renderer.capabilities.isWebGL2 && !renderer.extensions.get("WEBGL_color_buffer_float")){
    console.error("No float WEBGL color buffers allowed.");
    return false;
  }
  const materials = StarrySky.Materials.Stars;

  this.dimStarDataRenderer = new THREE.StarrySkyComputationRenderer(128, 64, renderer);
  this.dimStarMapTexture = this.dimStarDataRenderer.createTexture();
  this.dimStarMapVar = this.dimStarDataRenderer.addVariable('dimStarMapTexture',
    materials.starDataMap.fragmentShader,
    this.dimStarMapTexture
  );
  this.dimStarDataRenderer.setVariableDependencies(this.dimStarMapVar, []);
  this.dimStarMapVar.material.uniforms = JSON.parse(JSON.stringify(materials.starDataMap.uniforms));
  this.dimStarMapVar.format = THREE.RGBAFormat;
  this.dimStarMapVar.encoding = THREE.LinearEncoding;
  this.dimStarMapVar.minFilter = THREE.NearestFilter;
  this.dimStarMapVar.magFilter = THREE.NearestFilter;
  this.dimStarMapVar.wrapS = THREE.ClampToEdgeWrapping;
  this.dimStarMapVar.wrapT = THREE.ClampToEdgeWrapping;

  //Check for any errors in initialization
  let error1 = this.dimStarDataRenderer.init();
  if(error1 !== null){
    console.error(`Star map Renderer: ${error1}`);
  }

  this.medStarDataRenderer = new THREE.StarrySkyComputationRenderer(32, 32, renderer);
  this.medStarMapTexture = this.medStarDataRenderer.createTexture();
  this.medStarMapVar = this.medStarDataRenderer.addVariable('medStarMapTexture',
    materials.starDataMap.fragmentShader,
    this.medStarMapTexture
  );
  this.medStarDataRenderer.setVariableDependencies(this.medStarMapVar, []);
  this.medStarMapVar.material.uniforms = JSON.parse(JSON.stringify(materials.starDataMap.uniforms));
  this.medStarMapVar.format = THREE.RGBAFormat;
  this.medStarMapVar.encoding = THREE.LinearEncoding;
  this.medStarMapVar.minFilter = THREE.NearestFilter;
  this.medStarMapVar.magFilter = THREE.NearestFilter;
  this.medStarMapVar.wrapS = THREE.ClampToEdgeWrapping;
  this.medStarMapVar.wrapT = THREE.ClampToEdgeWrapping;

  //Check for any errors in initialization
  let error2 = this.medStarDataRenderer.init();
  if(error2 !== null){
    console.error(`Star map Renderer: ${error2}`);
  }

  this.brightStarDataRenderer = new THREE.StarrySkyComputationRenderer(8, 8, renderer);
  this.brightStarMapTexture = this.brightStarDataRenderer.createTexture();
  this.brightStarMapVar = this.brightStarDataRenderer.addVariable('brightStarMapTexture',
    materials.starDataMap.fragmentShader,
    this.brightStarMapTexture
  );
  this.brightStarDataRenderer.setVariableDependencies(this.brightStarMapVar, []);
  this.brightStarMapVar.material.uniforms = JSON.parse(JSON.stringify(materials.starDataMap.uniforms));
  this.brightStarMapVar.format = THREE.RGBAFormat;
  this.brightStarMapVar.encoding = THREE.LinearEncoding;
  this.brightStarMapVar.minFilter = THREE.NearestFilter;
  this.brightStarMapVar.magFilter = THREE.NearestFilter;
  this.brightStarMapVar.wrapS = THREE.ClampToEdgeWrapping;
  this.brightStarMapVar.wrapT = THREE.ClampToEdgeWrapping;

  //Check for any errors in initialization
  let error3 = this.brightStarDataRenderer.init();
  if(error3 !== null){
    console.error(`Star map Renderer: ${error3}`);
  }

  let self = this;
  this.dimStarMapPass = function(rImg, gImg, bImg, aImg){
    self.dimStarMapVar.material.uniforms.textureRChannel.value = rImg;
    self.dimStarMapVar.material.uniforms.textureGChannel.value = gImg;
    self.dimStarMapVar.material.uniforms.textureBChannel.value = bImg;
    self.dimStarMapVar.material.uniforms.textureAChannel.value = aImg;

    self.dimStarDataRenderer.compute();
    self.dimStarDataMap = self.dimStarDataRenderer.getCurrentRenderTarget(self.dimStarMapVar).texture;
    return self.dimStarDataMap;
  };

  this.medStarMapPass = function(rImg, gImg, bImg, aImg){
    self.medStarMapVar.material.uniforms.textureRChannel.value = rImg;
    self.medStarMapVar.material.uniforms.textureGChannel.value = gImg;
    self.medStarMapVar.material.uniforms.textureBChannel.value = bImg;
    self.medStarMapVar.material.uniforms.textureAChannel.value = aImg;

    self.medStarDataRenderer.compute();
    self.medStarDataMap = self.medStarDataRenderer.getCurrentRenderTarget(self.medStarMapVar).texture;
    return self.medStarDataMap;
  };

  this.brightStarMapPass = function(rImg, gImg, bImg, aImg){
    self.brightStarMapVar.material.uniforms.textureRChannel.value = rImg;
    self.brightStarMapVar.material.uniforms.textureGChannel.value = gImg;
    self.brightStarMapVar.material.uniforms.textureBChannel.value = bImg;
    self.brightStarMapVar.material.uniforms.textureAChannel.value = aImg;

    self.brightStarDataRenderer.compute();
    self.brightStarDataMap = self.brightStarDataRenderer.getCurrentRenderTarget(self.brightStarMapVar).texture;
    return self.brightStarDataMap;
  };
};

StarrySky.Renderers.AtmosphereRenderer = function(skyDirector){
  this.skyDirector = skyDirector;
  this.geometry = new THREE.IcosahedronBufferGeometry(5000.0, 4);

  //Create our material late
  this.atmosphereMaterial = new THREE.ShaderMaterial({
    uniforms: JSON.parse(JSON.stringify(StarrySky.Materials.Atmosphere.atmosphereShader.uniforms())),
    side: THREE.BackSide,
    blending: THREE.NormalBlending,
    transparent: false,
    vertexShader: StarrySky.Materials.Atmosphere.atmosphereShader.vertexShader,
    fragmentShader: StarrySky.Materials.Atmosphere.atmosphereShader.fragmentShader(
      skyDirector.assetManager.data.skyAtmosphericParameters.mieDirectionalG,
      skyDirector.atmosphereLUTLibrary.scatteringTextureWidth,
      skyDirector.atmosphereLUTLibrary.scatteringTextureHeight,
      skyDirector.atmosphereLUTLibrary.scatteringTexturePackingWidth,
      skyDirector.atmosphereLUTLibrary.scatteringTexturePackingHeight,
      skyDirector.atmosphereLUTLibrary.atmosphereFunctionsString
    )
  });
  this.atmosphereMaterial.uniforms.rayleighInscatteringSum.value = skyDirector.atmosphereLUTLibrary.rayleighScatteringSum;
  this.atmosphereMaterial.uniforms.mieInscatteringSum.value = skyDirector.atmosphereLUTLibrary.mieScatteringSum;
  this.atmosphereMaterial.uniforms.transmittance.value = skyDirector.atmosphereLUTLibrary.transmittance;

  if(this.skyDirector.assetManager.hasLoadedImages){
    this.atmosphereMaterial.uniforms.starColorMap.value = this.skyDirector.assetManager.images.starImages.starColorMap;
  }

  //Attach the material to our geometry
  this.skyMesh = new THREE.Mesh(this.geometry, this.atmosphereMaterial);
  this.skyMesh.castShadow = false;
  this.skyMesh.receiveShadow = false;
  this.skyMesh.fog = false;

  let self = this;
  this.tick = function(t){
    let cameraPosition = self.skyDirector.camera.position;
    self.skyMesh.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
    self.skyMesh.updateMatrix();
    self.skyMesh.updateMatrixWorld();

    //Update the uniforms so that we can see where we are on this sky.
    self.atmosphereMaterial.uniforms.sunHorizonFade.value = self.skyDirector.skyState.sun.horizonFade;
    self.atmosphereMaterial.uniforms.moonHorizonFade.value = self.skyDirector.skyState.moon.horizonFade;
    self.atmosphereMaterial.uniforms.uTime.value = t;
    self.atmosphereMaterial.uniforms.localSiderealTime.value = self.skyDirector.skyState.LSRT;
    self.atmosphereMaterial.uniforms.starsExposure.value = self.skyDirector.exposureVariables.starsExposure;
    self.atmosphereMaterial.uniforms.scatteringSunIntensity.value = self.skyDirector.skyState.sun.intensity;
    self.atmosphereMaterial.uniforms.scatteringMoonIntensity.value = self.skyDirector.skyState.moon.intensity;

    const blueNoiseTextureRef = self.skyDirector.assetManager.images.blueNoiseImages[self.skyDirector.randomBlueNoiseTexture];
    self.atmosphereMaterial.uniforms.blueNoiseTexture.value = blueNoiseTextureRef;
  }

  //Upon completion, this method self destructs
  this.firstTick = function(t){
    //Connect up our reference values
    self.atmosphereMaterial.uniforms.sunPosition.value = self.skyDirector.skyState.sun.position;
    self.atmosphereMaterial.uniforms.moonPosition.value = self.skyDirector.skyState.moon.position;
    self.atmosphereMaterial.uniforms.latitude.value = self.skyDirector.assetManager.data.skyLocationData.latitude * (Math.PI / 180.0);

    self.atmosphereMaterial.uniforms.mercuryPosition.value = self.skyDirector.skyState.mercury.position;
    self.atmosphereMaterial.uniforms.venusPosition.value = self.skyDirector.skyState.venus.position;
    self.atmosphereMaterial.uniforms.marsPosition.value = self.skyDirector.skyState.mars.position;
    self.atmosphereMaterial.uniforms.jupiterPosition.value = self.skyDirector.skyState.jupiter.position;
    self.atmosphereMaterial.uniforms.saturnPosition.value = self.skyDirector.skyState.saturn.position;

    self.atmosphereMaterial.uniforms.mercuryBrightness.value = self.skyDirector.skyState.mercury.intensity;
    self.atmosphereMaterial.uniforms.venusBrightness.value = self.skyDirector.skyState.venus.intensity;
    self.atmosphereMaterial.uniforms.marsBrightness.value = self.skyDirector.skyState.mars.intensity;
    self.atmosphereMaterial.uniforms.jupiterBrightness.value = self.skyDirector.skyState.jupiter.intensity;
    self.atmosphereMaterial.uniforms.saturnBrightness.value = self.skyDirector.skyState.saturn.intensity;
    self.atmosphereMaterial.uniforms.moonLightColor.value = self.skyDirector.skyState.moon.lightingModifier;

    //Connect up our images if they don't exist yet
    if(self.skyDirector.assetManager){
      self.atmosphereMaterial.uniforms.starHashCubemap.value = self.skyDirector.assetManager.images.starImages.starHashCubemap;
      self.atmosphereMaterial.uniforms.dimStarData.value = self.skyDirector.stellarLUTLibrary.dimStarDataMap;
      self.atmosphereMaterial.uniforms.medStarData.value = self.skyDirector.stellarLUTLibrary.medStarDataMap;
      self.atmosphereMaterial.uniforms.brightStarData.value = self.skyDirector.stellarLUTLibrary.brightStarDataMap;
    }

    //Proceed with the first tick
    self.tick(t);

    //Add this object to the scene
    self.skyDirector.scene.add(self.skyMesh);
  }
}

StarrySky.Renderers.SunRenderer = function(skyDirector){
	const renderer = skyDirector.renderer;
	const assetManager = skyDirector.assetManager;
	const atmosphereLUTLibrary = skyDirector.atmosphereLUTLibrary;
	const skyState = skyDirector.skyState;
	const RENDER_TARGET_SIZE = 256;
  const RADIUS_OF_SKY = 5000.0;
  const DEG_2_RAD = 0.017453292519943295769236907684886;
  const moonAngularRadiusInRadians = assetManager.data.skyAtmosphericParameters.moonAngularDiameter * DEG_2_RAD * 0.5;
  const baseRadiusOfTheMoon = Math.sin(moonAngularRadiusInRadians)
	this.sunAngularRadiusInRadians = assetManager.data.skyAtmosphericParameters.sunAngularDiameter * DEG_2_RAD * 0.5;
  const radiusOfSunPlane = RADIUS_OF_SKY * Math.sin(this.sunAngularRadiusInRadians) * 2.0;
  const diameterOfSunPlane = 4.0 * radiusOfSunPlane;

	//All of this eventually gets drawn out to a single quad
  this.geometry = new THREE.PlaneBufferGeometry(diameterOfSunPlane, diameterOfSunPlane, 1);

	//Prepare our scene and render target object
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
	outputRenderTarget = new THREE.WebGLRenderTarget(RENDER_TARGET_SIZE, RENDER_TARGET_SIZE);
  outputRenderTarget.texture.minFilter = THREE.LinearMipmapLinearFilter;
  outputRenderTarget.texture.magFilter = THREE.LinearFilter;
	outputRenderTarget.texture.format = THREE.RGBAFormat;
  outputRenderTarget.texture.type = THREE.FloatType;
  outputRenderTarget.texture.generateMipmaps = true;
  outputRenderTarget.texture.anisotropy = 4;
  outputRenderTarget.texture.samples = 8;
	const composer = new THREE.EffectComposer(renderer, outputRenderTarget);
	composer.renderToScreen = false;

	const baseSunMaterial = new THREE.ShaderMaterial({
    uniforms: JSON.parse(JSON.stringify(StarrySky.Materials.Atmosphere.atmosphereShader.uniforms(true))),
    vertexShader: StarrySky.Materials.Sun.baseSunPartial.vertexShader,
    fragmentShader: StarrySky.Materials.Atmosphere.atmosphereShader.fragmentShader(
      assetManager.data.skyAtmosphericParameters.mieDirectionalG,
      atmosphereLUTLibrary.scatteringTextureWidth,
      atmosphereLUTLibrary.scatteringTextureHeight,
      atmosphereLUTLibrary.scatteringTexturePackingWidth,
      atmosphereLUTLibrary.scatteringTexturePackingHeight,
      atmosphereLUTLibrary.atmosphereFunctionsString,
      StarrySky.Materials.Sun.baseSunPartial.fragmentShader(this.sunAngularRadiusInRadians),
      false
    ),
  });
  baseSunMaterial.uniforms.radiusOfSunPlane.value = radiusOfSunPlane;
  baseSunMaterial.uniforms.rayleighInscatteringSum.value = atmosphereLUTLibrary.rayleighScatteringSum;
  baseSunMaterial.uniforms.mieInscatteringSum.value = atmosphereLUTLibrary.mieScatteringSum;
  baseSunMaterial.uniforms.transmittance.value = atmosphereLUTLibrary.transmittance;
  baseSunMaterial.defines.resolution = 'vec2( ' + RENDER_TARGET_SIZE + ', ' + RENDER_TARGET_SIZE + " )";
	const renderBufferMesh = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(2, 2),
    baseSunMaterial
  );
  scene.add(renderBufferMesh);

	const renderPass = new THREE.RenderPass(scene, camera);
	composer.addPass(renderPass);
	const bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(RENDER_TARGET_SIZE, RENDER_TARGET_SIZE), 1.5, 0.4, 0.85 );
	bloomPass.threshold = 0.97;
	bloomPass.strength = 1.0;
	bloomPass.radius = 1.0;
	composer.addPass(bloomPass);

	//Attach the material to our geometry
	const outputMaterial = new THREE.ShaderMaterial({
    uniforms: JSON.parse(JSON.stringify(StarrySky.Materials.Postprocessing.moonAndSunOutput.uniforms)),
    vertexShader: StarrySky.Materials.Postprocessing.moonAndSunOutput.vertexShader,
    fragmentShader: StarrySky.Materials.Postprocessing.moonAndSunOutput.fragmentShader
  });
	outputMaterial.defines.resolution = 'vec2( ' + RENDER_TARGET_SIZE + ', ' + RENDER_TARGET_SIZE + " )";
  this.sunMesh = new THREE.Mesh(this.geometry, outputMaterial);
  outputMaterial.castShadow = false;
  outputMaterial.fog = false;
	outputMaterial.side = THREE.FrontSide;
	outputMaterial.dithering = false;
	outputMaterial.toneMapped = false;
	outputMaterial.transparent = true;
	baseSunMaterial.uniforms.worldMatrix.value = this.sunMesh.matrixWorld;

	const self = this;
  this.tick = function(t){
		//Using guidance from https://github.com/mrdoob/three.js/issues/18746#issuecomment-591441598
		const initialRenderTarget = renderer.getRenderTarget();
		const currentXrEnabled = renderer.xr.enabled;
		const currentShadowAutoUpdate = renderer.shadowMap.autoUpdate;
		renderer.xr.enabled = false;
		renderer.shadowMap.autoUpdate = false;

    //Update the position of our mesh
    const cameraPosition = skyDirector.camera.position;
    const quadOffset = skyDirector.skyState.sun.quadOffset;
    self.sunMesh.position.set(quadOffset.x, quadOffset.y, quadOffset.z).add(cameraPosition);
    self.sunMesh.lookAt(cameraPosition.x, cameraPosition.y, cameraPosition.z); //Use the basic look-at function to always have this plane face the camera.
    self.sunMesh.updateMatrix();
    self.sunMesh.updateMatrixWorld();

    //Update our shader material
    baseSunMaterial.uniforms.moonHorizonFade.value = skyState.moon.horizonFade;
    baseSunMaterial.uniforms.sunHorizonFade.value = skyState.sun.horizonFade;
    baseSunMaterial.uniforms.uTime.value = t;
    baseSunMaterial.uniforms.scatteringSunIntensity.value = skyState.sun.intensity;
    baseSunMaterial.uniforms.scatteringMoonIntensity.value = skyState.moon.intensity;
    baseSunMaterial.uniforms.localSiderealTime.value = skyState.LSRT;
    baseSunMaterial.uniforms.moonRadius.value = skyState.moon.scale * baseRadiusOfTheMoon;

    //Run our float shaders shaders
		composer.render();
    const blueNoiseTextureRef = assetManager.images.blueNoiseImages[skyDirector.randomBlueNoiseTexture];
		outputMaterial.uniforms.blueNoiseTexture.value = blueNoiseTextureRef;
	  outputMaterial.uniforms.outputImage.value = composer.readBuffer.texture;
	  outputMaterial.uniforms.uTime.value = t;

		//Clean up shadows and XR stuff
	  renderer.xr.enabled = currentXrEnabled;
	  renderer.shadowMap.autoUpdate = currentShadowAutoUpdate;
	  renderer.setRenderTarget(initialRenderTarget);
  }

  //Upon completion, this method self destructs
  this.firstTick = function(t){
    //Connect up our reference values
    baseSunMaterial.uniforms.sunPosition.value = skyState.sun.position;
    baseSunMaterial.uniforms.moonPosition.value = skyState.moon.position;
    baseSunMaterial.uniforms.latitude.value = assetManager.data.skyLocationData.latitude * (Math.PI / 180.0);
    baseSunMaterial.uniforms.moonLightColor.value = skyState.moon.lightingModifier;

    //Connect up our images if they don't exist yet
    if(assetManager.hasLoadedImages){
      //Image of the solar corona for our solar ecclipse
      baseSunMaterial.uniforms.solarEclipseMap.value = assetManager.images.solarEclipseImage;
    }

    //Proceed with the first tick
    self.tick(t);

    //Add this object to the scene
    skyDirector.scene.add(self.sunMesh);
  }
}

StarrySky.Renderers.MoonRenderer = function(skyDirector){
  this.parallacticAxis = new THREE.Vector3();
  const renderer = skyDirector.renderer;
	const assetManager = skyDirector.assetManager;
	const atmosphereLUTLibrary = skyDirector.atmosphereLUTLibrary;
	const skyState = skyDirector.skyState;
  const RENDER_TARGET_SIZE = 512;
  const RADIUS_OF_SKY = 5000.0;
  const DEG_2_RAD = 0.017453292519943295769236907684886;
  const sunAngularRadiusInRadians = assetManager.data.skyAtmosphericParameters.sunAngularDiameter * DEG_2_RAD * 0.5;
  this.moonAngularRadiusInRadians = assetManager.data.skyAtmosphericParameters.moonAngularDiameter * DEG_2_RAD * 0.5;
  const radiusOfMoonPlane = RADIUS_OF_SKY * Math.sin(this.moonAngularRadiusInRadians) * 2.0;
  const diameterOfMoonPlane = 4.0 * radiusOfMoonPlane;
  const blinkOutDistance = Math.SQRT2 * diameterOfMoonPlane;

  //All of this eventually gets drawn out to a single quad
  this.geometry = new THREE.PlaneBufferGeometry(diameterOfMoonPlane, diameterOfMoonPlane, 1);

  //Prepare our scene and render target object
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  outputRenderTarget = new THREE.WebGLRenderTarget(RENDER_TARGET_SIZE, RENDER_TARGET_SIZE);
  outputRenderTarget.texture.minFilter = THREE.LinearMipmapLinearFilter;
  outputRenderTarget.texture.magFilter = THREE.LinearFilter;
  outputRenderTarget.texture.format = THREE.RGBAFormat;
  outputRenderTarget.texture.type = THREE.FloatType;
  outputRenderTarget.texture.generateMipmaps = true;
  outputRenderTarget.texture.anisotropy = 4;
  outputRenderTarget.texture.samples = 8;
  const composer = new THREE.EffectComposer(renderer, outputRenderTarget);
  composer.renderToScreen = false;

  const moonMaterial = new THREE.ShaderMaterial({
    uniforms: JSON.parse(JSON.stringify(StarrySky.Materials.Atmosphere.atmosphereShader.uniforms(false, true))),
    vertexShader: StarrySky.Materials.Moon.baseMoonPartial.vertexShader,
    fragmentShader: StarrySky.Materials.Atmosphere.atmosphereShader.fragmentShader(
      assetManager.data.skyAtmosphericParameters.mieDirectionalG,
      atmosphereLUTLibrary.scatteringTextureWidth,
      atmosphereLUTLibrary.scatteringTextureHeight,
      atmosphereLUTLibrary.scatteringTexturePackingWidth,
      atmosphereLUTLibrary.scatteringTexturePackingHeight,
      atmosphereLUTLibrary.atmosphereFunctionsString,
      false,
      StarrySky.Materials.Moon.baseMoonPartial.fragmentShader(this.moonAngularRadiusInRadians),
    )
  });
  //Attach the material to our geometry
  moonMaterial.uniforms.radiusOfMoonPlane.value = radiusOfMoonPlane;
  moonMaterial.uniforms.rayleighInscatteringSum.value = atmosphereLUTLibrary.rayleighScatteringSum;
  moonMaterial.uniforms.mieInscatteringSum.value = atmosphereLUTLibrary.mieScatteringSum;
  moonMaterial.uniforms.transmittance.value = atmosphereLUTLibrary.transmittance;
  moonMaterial.uniforms.sunRadius.value = sunAngularRadiusInRadians;
  moonMaterial.defines.resolution = 'vec2( ' + RENDER_TARGET_SIZE + ', ' + RENDER_TARGET_SIZE + " )";
  const renderTargetGeometry = new THREE.PlaneBufferGeometry(2, 2);
  THREE.BufferGeometryUtils.computeTangents(renderTargetGeometry);
  const renderBufferMesh = new THREE.Mesh(
    renderTargetGeometry,
    moonMaterial
  );
  scene.add(renderBufferMesh);

  //If our images have finished loading, update our uniforms
  if(assetManager.hasLoadedImages){
    const moonTextures = ['moonDiffuseMap', 'moonNormalMap', 'moonRoughnessMap', 'moonApertureSizeMap', 'moonApertureOrientationMap'];
    for(let i = 0; i < moonTextures.length; ++i){
      const moonTextureProperty = moonTextures[i];
      moonMaterial.uniforms[moonTextureProperty].value = assetManager.images[moonTextureProperty];
    }

    moonMaterial.uniforms.starColorMap.value = assetManager.images.starImages.starColorMap;
  }

  const renderPass = new THREE.RenderPass(scene, camera);
  composer.addPass(renderPass);
  this.bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(RENDER_TARGET_SIZE, RENDER_TARGET_SIZE), 1.5, 0.4, 0.85);
  this.bloomPass.threshold = 0.55;
  this.bloomPass.strength = 0.9;
  this.bloomPass.radius = 1.4;
  composer.addPass(this.bloomPass);

  //Attach the material to our geometry
	const outputMaterial = new THREE.ShaderMaterial({
    uniforms: JSON.parse(JSON.stringify(StarrySky.Materials.Postprocessing.moonAndSunOutput.uniforms)),
    vertexShader: StarrySky.Materials.Postprocessing.moonAndSunOutput.vertexShader,
    fragmentShader: StarrySky.Materials.Postprocessing.moonAndSunOutput.fragmentShader
  });
	outputMaterial.defines.resolution = 'vec2( ' + RENDER_TARGET_SIZE + ', ' + RENDER_TARGET_SIZE + " )";
  this.moonMesh = new THREE.Mesh(this.geometry, outputMaterial);
  outputMaterial.castShadow = false;
  outputMaterial.fog = false;
	outputMaterial.side = THREE.FrontSide;
	outputMaterial.dithering = false;
	outputMaterial.toneMapped = false;
	outputMaterial.transparent = true;
	moonMaterial.uniforms.worldMatrix.value = this.moonMesh.matrixWorld;

  const self = this;
  this.tick = function(t){
    //Using guidance from https://github.com/mrdoob/three.js/issues/18746#issuecomment-591441598
    const initialRenderTarget = renderer.getRenderTarget();
    const currentXrEnabled = renderer.xr.enabled;
    const currentShadowAutoUpdate = renderer.shadowMap.autoUpdate;
    renderer.xr.enabled = false;
    renderer.shadowMap.autoUpdate = false;

    const distanceFromSunToMoon = skyState.sun.position.distanceTo(skyState.moon.position) * RADIUS_OF_SKY;
    if(distanceFromSunToMoon < blinkOutDistance && self.moonMesh.visible){
      self.moonMesh.visible = false;
    }
    else if(distanceFromSunToMoon >= blinkOutDistance && !self.moonMesh.visible){
      self.moonMesh.visible = true;
    }

    //Update the position of our mesh
    const cameraPosition = skyDirector.camera.position;
    const quadOffset = skyState.moon.quadOffset;
    self.moonMesh.position.set(quadOffset.x, quadOffset.y, quadOffset.z).add(cameraPosition);
    self.parallacticAxis.copy(quadOffset).normalize();
    self.moonMesh.lookAt(cameraPosition); //Use the basic look-at function to always have this plane face the camera.
    self.moonMesh.rotateOnWorldAxis(self.parallacticAxis, -skyState.moon.parallacticAngle); //And rotate the mesh by the parallactic angle.
    self.moonMesh.updateMatrix();
    self.moonMesh.updateMatrixWorld();

    //Update our shader material
    moonMaterial.uniforms.moonHorizonFade.value = skyState.moon.horizonFade;
    moonMaterial.uniforms.sunHorizonFade.value = skyState.sun.horizonFade;
    moonMaterial.uniforms.uTime.value = t;
    moonMaterial.uniforms.localSiderealTime.value = skyDirector.skyState.LSRT;
    moonMaterial.uniforms.scatteringSunIntensity.value = skyState.sun.intensity;
    moonMaterial.uniforms.scatteringMoonIntensity.value = skyState.moon.intensity;
    moonMaterial.uniforms.starsExposure.value = skyDirector.exposureVariables.starsExposure;
    moonMaterial.uniforms.moonExposure.value = skyDirector.exposureVariables.moonExposure;
    moonMaterial.uniforms.distanceToEarthsShadowSquared.value = skyState.moon.distanceToEarthsShadowSquared;
    moonMaterial.uniforms.oneOverNormalizedLunarDiameter.value = skyState.moon.oneOverNormalizedLunarDiameter;

    //Update our bloom threshold so we don't bloom the moon during the day
    this.bloomPass.threshold = 1.0 - 0.43 * Math.max(skyDirector.exposureVariables.starsExposure, 0.0) / 3.4;

    //Run our float shaders shaders
    composer.render();
    const blueNoiseTextureRef = assetManager.images.blueNoiseImages[skyDirector.randomBlueNoiseTexture];
    outputMaterial.uniforms.blueNoiseTexture.value = blueNoiseTextureRef;
    outputMaterial.uniforms.outputImage.value = composer.readBuffer.texture;
    outputMaterial.uniforms.uTime.value = t;

    //Clean up shadows and XR stuff
    renderer.xr.enabled = currentXrEnabled;
    renderer.shadowMap.autoUpdate = currentShadowAutoUpdate;
    renderer.setRenderTarget(initialRenderTarget);
  }

  //Upon completion, this method self destructs
  this.firstTick = function(t){
    //Connect up our reference values
    moonMaterial.uniforms.sunPosition.value = skyState.sun.position;
    moonMaterial.uniforms.moonPosition.value = skyState.moon.position;
    moonMaterial.uniforms.sunLightDirection.value = skyState.sun.quadOffset;

    moonMaterial.uniforms.mercuryPosition.value = skyState.mercury.position;
    moonMaterial.uniforms.venusPosition.value = skyState.venus.position;
    moonMaterial.uniforms.marsPosition.value = skyState.mars.position;
    moonMaterial.uniforms.jupiterPosition.value = skyState.jupiter.position;
    moonMaterial.uniforms.saturnPosition.value = skyState.saturn.position;

    moonMaterial.uniforms.mercuryBrightness.value = skyState.mercury.intensity;
    moonMaterial.uniforms.venusBrightness.value = skyState.venus.intensity;
    moonMaterial.uniforms.marsBrightness.value = skyState.mars.intensity;
    moonMaterial.uniforms.jupiterBrightness.value = skyState.jupiter.intensity;
    moonMaterial.uniforms.saturnBrightness.value = skyState.saturn.intensity;
    moonMaterial.uniforms.earthsShadowPosition.value = skyState.moon.earthsShadowPosition;
    moonMaterial.uniforms.moonLightColor.value = skyState.moon.lightingModifier;

    //Connect up our images if they don't exist yet
    if(assetManager){
      //Moon Textures
      for(let [property, value] of Object.entries(assetManager.images.moonImages)){
        moonMaterial.uniforms[property].value = value;
      }

      //Update our star data
      moonMaterial.uniforms.latitude.value = assetManager.data.skyLocationData.latitude * (Math.PI / 180.0);
      moonMaterial.uniforms.starHashCubemap.value = assetManager.images.starImages.starHashCubemap;
      moonMaterial.uniforms.dimStarData.value = skyDirector.stellarLUTLibrary.dimStarDataMap;
      moonMaterial.uniforms.medStarData.value = skyDirector.stellarLUTLibrary.medStarDataMap;
      moonMaterial.uniforms.brightStarData.value = skyDirector.stellarLUTLibrary.brightStarDataMap;
    }

    //Proceed with the first tick
    self.tick(t);

    //Add this object to the scene
    skyDirector.scene.add(self.moonMesh);
  }
}

//Renders a seperate version of our sky using a fisheye lens
//for consumption by our sky director and web worker state engine
//which produces the log histogram average intensity of our pixels
//for auto-exposure.
StarrySky.Renderers.MeteringSurveyRenderer = function(skyDirector){
  this.renderer = skyDirector.renderer;
  this.skyDirector = skyDirector;
  this.meteringSurveyTextureSize = 64;

  this.meteringSurveyRenderer = new THREE.StarrySkyComputationRenderer(this.meteringSurveyTextureSize, this.meteringSurveyTextureSize, this.renderer);
  this.meteringSurveyTexture = this.meteringSurveyRenderer.createTexture();
  this.meteringSurveyVar = this.meteringSurveyRenderer.addVariable(`meteringSurveyVar`,
    StarrySky.Materials.Atmosphere.atmosphereShader.fragmentShader(
      skyDirector.assetManager.data.skyAtmosphericParameters.mieDirectionalG,
      skyDirector.atmosphereLUTLibrary.scatteringTextureWidth,
      skyDirector.atmosphereLUTLibrary.scatteringTextureHeight,
      skyDirector.atmosphereLUTLibrary.scatteringTexturePackingWidth,
      skyDirector.atmosphereLUTLibrary.scatteringTexturePackingHeight,
      skyDirector.atmosphereLUTLibrary.atmosphereFunctionsString,
      false,
      false,
      true
    ),
    this.meteringSurveyTexture
  );
  this.meteringSurveyRenderer.setVariableDependencies(this.meteringSurveyVar, []);
  this.meteringSurveyVar.material.vertexShader = StarrySky.Materials.Autoexposure.meteringSurvey.vertexShader;
  this.meteringSurveyVar.material.uniforms = JSON.parse(JSON.stringify(StarrySky.Materials.Atmosphere.atmosphereShader.uniforms(false, false, true)));
  this.meteringSurveyVar.material.uniforms.rayleighInscatteringSum.value = skyDirector.atmosphereLUTLibrary.rayleighScatteringSum;
  this.meteringSurveyVar.material.uniforms.mieInscatteringSum.value = skyDirector.atmosphereLUTLibrary.mieScatteringSum;
  this.meteringSurveyVar.material.uniforms.transmittance.value = skyDirector.atmosphereLUTLibrary.transmittance;
  this.meteringSurveyVar.material.uniforms.latitude.value = skyDirector.assetManager.data.skyLocationData.latitude * (Math.PI / 180.0);
  this.meteringSurveyVar.material.uniforms.moonLightColor.value = skyDirector.skyState.moon.lightingModifier;

  this.meteringSurveyVar.format = THREE.RGBAFormat;
  this.meteringSurveyVar.minFilter = THREE.NearestFilter;
  this.meteringSurveyVar.magFilter = THREE.NearestFilter;
  this.meteringSurveyVar.wrapS = THREE.ClampToEdgeWrapping;
  this.meteringSurveyVar.wrapT = THREE.ClampToEdgeWrapping;

  //Check for any errors in initialization
  let error1 = this.meteringSurveyRenderer.init();
  if(error1 !== null){
    console.error(`Metering Survey Renderer: ${error1}`);
  }

  this.meteringSurveyRenderer.compute();
  let test = this.meteringSurveyRenderer.getCurrentRenderTarget(this.meteringSurveyVar).texture;

  //Let's test this out by adding it to a plane in the scene
  //let plane = new THREE.PlaneBufferGeometry(2.0, 2.0, 1);

  // //Create our material late
  //This is useful for debugging metering and other textures
  // let material = new THREE.MeshBasicMaterial({
  //   side: THREE.DoubleSide,
  //   blending: THREE.NormalBlending,
  //   transparent: true,
  //   map: test,
  // });
  //
  // //Attach the material to our geometry
  // let testMesh = new THREE.Mesh(plane, material);
  // testMesh.position.set(0.0, 2.0, -2.0);

  //Inject this mesh into our scene
  //this.skyDirector.scene.add(testMesh);

  let self = this;
  this.render = function(sunPosition, moonPosition, sunFade, moonFade){
    //Update the uniforms so that we can see where we are on this sky.
    self.meteringSurveyVar.material.uniforms.sunPosition.value = sunPosition;
    self.meteringSurveyVar.material.uniforms.moonPosition.value = moonPosition;
    self.meteringSurveyVar.material.uniforms.sunHorizonFade.value = sunFade;
    self.meteringSurveyVar.material.uniforms.moonHorizonFade.value = Math.max(1.0 - sunFade, 0.0);
    self.meteringSurveyVar.material.uniforms.scatteringSunIntensity.value = self.skyDirector.skyState.sun.intensity;
    self.meteringSurveyVar.material.uniforms.sunLuminosity.value = self.skyDirector.skyState.sun.luminosity;
    self.meteringSurveyVar.material.uniforms.scatteringMoonIntensity.value = self.skyDirector.skyState.moon.intensity;
    self.meteringSurveyVar.material.uniforms.moonLuminosity.value = self.skyDirector.skyState.moon.luminosity;

    self.meteringSurveyRenderer.compute();
    const skyRenderTarget = self.meteringSurveyRenderer.getCurrentRenderTarget(this.meteringSurveyVar);
    return skyRenderTarget;
  }
}

//The lighting for our scene contains 3 hemispherical lights and 1 directional light
//with shadows enabled. The shadow enabled directional light is shared between the sun
//and the moon in order to reduce the rendering load.
StarrySky.LightingManager = function(parentComponent){
  const RADIUS_OF_SKY = 5000.0;
  this.skyDirector = parentComponent;
  const lightingData = this.skyDirector.assetManager.data.skyLighting;
  const lunarEclipseLightingModifier = this.skyDirector.skyState.moon.lightingModifier;
  this.sourceLight = new THREE.DirectionalLight(0xffffff, 4.0);
  const shadow = this.sourceLight.shadow;
  this.sourceLight.castShadow = true;
  shadow.mapSize.width = lightingData.shadowCameraResolution;
  shadow.mapSize.height = lightingData.shadowCameraResolution;
  shadow.camera.near = 128.0;
  shadow.camera.far = RADIUS_OF_SKY * 2.0;
  const directLightingCameraSize = lightingData.shadowCameraSize;
  shadow.camera.left = -directLightingCameraSize;
  shadow.camera.right = directLightingCameraSize;
  shadow.camera.bottom = -directLightingCameraSize;
  shadow.camera.top = directLightingCameraSize;
  this.sourceLight.target = this.skyDirector.camera;
  const  totalDistance = lightingData.shadowDrawDistance + lightingData.shadowDrawBehindDistance;
  this.targetScalar = 0.5 * totalDistance - lightingData.shadowDrawBehindDistance;
  this.shadowTarget = new THREE.Vector3();
  this.shadowTargetOffset = new THREE.Vector3();
  this.fogColorVector = new THREE.Color();
  this.xAxisHemisphericalLight = new THREE.HemisphereLight( 0x000000, 0x000000, 0.0);
  this.yAxisHemisphericalLight = new THREE.HemisphereLight( 0x000000, 0x000000, 1.0);
  this.zAxisHemisphericalLight = new THREE.HemisphereLight( 0x000000, 0x000000, 0.0);
  this.xAxisHemisphericalLight.position.set(1,0,0);
  this.yAxisHemisphericalLight.position.set(0,1,0);
  this.zAxisHemisphericalLight.position.set(0,0,1);

  parentComponent.scene.fog = this.fog;
  const maxFogDensity = lightingData.atmosphericPerspectiveDensity;
  if(lightingData.atmosphericPerspectiveEnabled){
    this.fog = new THREE.FogExp2(0xFFFFFF, maxFogDensity);
    parentComponent.scene.fog = this.fog;
  }

  const scene = parentComponent.scene;
  scene.add(this.sourceLight);
  scene.add(this.xAxisHemisphericalLight);
  scene.add(this.yAxisHemisphericalLight);
  scene.add(this.zAxisHemisphericalLight);
  this.cameraRef = parentComponent.camera;
  const self = this;
  this.tick = function(lightingState){
    //
    //TODO: We should move our fog color to a shader hack approach,
    //as described in https://snayss.medium.com/three-js-fog-hacks-fc0b42f63386
    //along with adding a volumetric fog system.
    //
    //The colors for this fog could then driven by a shader as described in
    //http://publications.lib.chalmers.se/records/fulltext/203057/203057.pdf
    //

    //I also need to hook in the code from our tags for fog density under
    //sky-atmospheric-parameters and hook that value into this upon starting.
    //And drive the shadow type based on the shadow provided in sky-lighting.
    if(lightingData.atmosphericPerspectiveEnabled){
      self.fogColorVector.fromArray(lightingState, 21);
      const maxColor = Math.max(self.fogColorVector.r, self.fogColorVector.g, self.fogColorVector.b);

      //The fog color is taken from sky color hemispherical data alone (excluding ground color)
      //and is the color taken by dotting the camera direction with the colors of our
      //hemispherical lighting along the x, z axis.
      self.fog.density = Math.pow(maxColor, 0.3) * maxFogDensity;
      self.fog.color.copy(self.fogColorVector);
    }

    //We update our directional light so that it's always targetting the camera.
    //We originally were going to target a point in front of the camera
    //but this resulted in terrible artifacts that caused the shadow to shimer
    //from the aliasing of the texture - without this shimmering
    //we can greatly reduce the size of our shadow map for the same quality.
    //LUT and is done in WASM, while the intensity is determined by whether the sun
    //or moon is in use and transitions between the two.
    //The target is a position weighted by the
    self.sourceLight.position.x = -RADIUS_OF_SKY * lightingState[27];
    self.sourceLight.position.y = RADIUS_OF_SKY * lightingState[26];
    self.sourceLight.position.z = -RADIUS_OF_SKY * lightingState[25];
    self.sourceLight.color.r = lunarEclipseLightingModifier.x * lightingState[18];
    self.sourceLight.color.g = lunarEclipseLightingModifier.y * lightingState[19];
    self.sourceLight.color.b = lunarEclipseLightingModifier.z * lightingState[20];
    const intensityModifier = Math.min(Math.max(lightingState[24] * 2.0, 0.0), 0.1) / 0.1;
    self.sourceLight.intensity = lightingState[24] * 0.5;

    //The hemispherical light colors replace ambient lighting and are calculated
    //in a web worker along with our sky metering. They are the light colors in the
    //directions of x, y and z.
    self.xAxisHemisphericalLight.color.fromArray(lightingState, 0);
    self.yAxisHemisphericalLight.color.fromArray(lightingState, 3);
    self.zAxisHemisphericalLight.color.fromArray(lightingState, 6);
    self.xAxisHemisphericalLight.groundColor.fromArray(lightingState, 9);
    self.yAxisHemisphericalLight.groundColor.fromArray(lightingState, 12);
    self.zAxisHemisphericalLight.groundColor.fromArray(lightingState, 15);
    const indirectLightIntensity = 0.01 + intensityModifier * 0.15;
    self.xAxisHemisphericalLight.intensity = indirectLightIntensity;
    self.yAxisHemisphericalLight.intensity = indirectLightIntensity;
    self.zAxisHemisphericalLight.intensity = indirectLightIntensity;
  }
};

StarrySky.AssetManager = function(skyDirector){
  this.skyDirector = skyDirector;
  this.data = {};
  this.images = {
    moonImages: {},
    starImages: {},
    blueNoiseImages: {},
    solarEclipseImage: null
  };
  const starrySkyComponent = skyDirector.parentComponent;

  //------------------------
  //Capture all the information from our child elements for our usage here.
  //------------------------
  //Get all of our tags
  var tagLists = [];
  const skyLocationTags = starrySkyComponent.el.getElementsByTagName('sky-location');
  tagLists.push(skyLocationTags);
  const skyTimeTags = starrySkyComponent.el.getElementsByTagName('sky-time');
  tagLists.push(skyTimeTags);
  const skyAtmosphericParametersTags = starrySkyComponent.el.getElementsByTagName('sky-atmospheric-parameters');
  tagLists.push(skyAtmosphericParametersTags);
  tagLists.forEach(function(tags){
    if(tags.length > 1){
      console.error(`The <a-starry-sky> tag can only contain 1 tag of type <${tags[0].tagName}>. ${tags.length} found.`);
    }
  });
  const skyLightingTags = starrySkyComponent.el.getElementsByTagName('sky-lighting');
  tagLists.push(skyLightingTags);
  //These are excluded from our search above :D
  const skyAssetsTags = starrySkyComponent.el.getElementsByTagName('sky-assets-dir');

  //Now grab each of or our elements and check for events.
  this.starrySkyComponent = starrySkyComponent;
  this.skyDataSetsLoaded = 0;
  this.skyDataSetsLength = 0;
  this.skyLocationTag;
  this.hasSkyLocationTag = false;
  this.skyTimeTag;
  this.hasSkyTimeTag = false;
  this.skyAtmosphericParametersTag;
  this.hasSkyAtmosphericParametersTag = false;
  this.skyLightingTag;
  this.hasSkyLightingTag = false;
  this.skyAssetsTags;
  this.hasSkyAssetsTag = false;
  this.hasLoadedImages = false;
  this.readyForTickTock = false;
  this.loadSkyDataHasNotRun = true;
  this.tickSinceLastUpdateRequest = 5;
  this.numberOfTexturesLoaded = 0;
  this.totalNumberOfTextures;
  const self = this;

  //Asynchronously load all of our images because, we don't care about when these load
  this.loadImageAssets = async function(renderer){
    //Just use our THREE Texture Loader for now
    const textureLoader = new THREE.TextureLoader();

    //The amount of star texture data
    const numberOfStarTextures = 4;

    //Load all of our moon textures
    const moonTextures = ['moonDiffuseMap', 'moonNormalMap', 'moonRoughnessMap', 'moonApertureSizeMap', 'moonApertureOrientationMap'];
    const moonEncodings = [THREE.LinearEncoding, THREE.LinearEncoding, THREE.LinearEncoding, THREE.LinearEncoding, THREE.LinearEncoding];
    const numberOfMoonTextures = moonTextures.length;
    const numberOfBlueNoiseTextures = 5;
    const oneSolarEclipseImage = 1;
    this.totalNumberOfTextures = numberOfMoonTextures + numberOfStarTextures + numberOfBlueNoiseTextures + oneSolarEclipseImage;

    //Recursive based functional for loop, with asynchronous execution because
    //Each iteration is not dependent upon the last, but it's just a set of similiar code
    //that can be run in parallel.
    (async function createNewMoonTexturePromise(i){
      let next = i + 1;
      if(next < numberOfMoonTextures){
        createNewMoonTexturePromise(next);
      }

      let texturePromise = new Promise(function(resolve, reject){
        textureLoader.load(StarrySky.assetPaths[moonTextures[i]], function(texture){resolve(texture);});
      });
      texturePromise.then(function(texture){
        //Fill in the details of our texture
        texture.format = THREE.RGBAFormat;
        texture.type = THREE.FloatType;
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.magFilter = THREE.LinearFilter;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.anisotropy = 4;
        texture.samples = 8;
        texture.generateMipmaps = true;
        texture.encoding = moonEncodings[i];
        self.images.moonImages[moonTextures[i]] = texture;

        //If the renderer already exists, go in and update the uniform
        if(self.skyDirector?.renderers?.moonRenderer !== undefined){
          const textureRef = self.skyDirector.renderers.moonRenderer.baseMoonVar.uniforms[moonTextures[i]];
          textureRef.value = texture;
        }

        self.numberOfTexturesLoaded += 1;
        if(self.numberOfTexturesLoaded === self.totalNumberOfTextures){
          self.hasLoadedImages = true;
        }
      }, function(err){
        console.error(err);
      });
    })(0);

    //Load our star color LUT
    let texturePromise = new Promise(function(resolve, reject){
      textureLoader.load(StarrySky.assetPaths.starColorMap, function(texture){resolve(texture);});
    });
    texturePromise.then(function(texture){
      //Fill in the details of our texture
      texture.format = THREE.RGBAFormat;
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.magFilter = THREE.LinearFilter;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.encoding = THREE.LinearEncoding;
      texture.type = THREE.FloatType;
      texture.generateMipmaps = true;
      //Swap this tomorrow and implement custom mip-maps
      self.images.starImages.starColorMap = texture;

      //If the renderer already exists, go in and update the uniform
      //I presume if the moon renderer is loaded the atmosphere renderer is loaded as well
      if(self.skyDirector?.renderers?.moonRenderer !== undefined){
        const atmosphereTextureRef = self.skyDirector.renderers.atmosphereRenderer.atmosphereMaterial.uniforms.starColorMap;
        atmosphereTextureRef.value = texture;

        const moonTextureRef = skyDirector.renderers.moonRenderer.baseMoonVar.material.uniforms.starColorMap;
        moonTextureRef.value = texture;
      }

      self.numberOfTexturesLoaded += 1;
      if(self.numberOfTexturesLoaded === self.totalNumberOfTextures){
        self.hasLoadedImages = true;
      }
    }, function(err){
      console.error(err);
    });

    //Set up our star hash cube map
    const loader = new THREE.CubeTextureLoader();

    let texturePromise2 = new Promise(function(resolve, reject){
      loader.load(StarrySky.assetPaths.starHashCubemap, function(cubemap){resolve(cubemap);});
    });
    texturePromise2.then(function(cubemap){

      //Make sure that our cubemap is using the appropriate settings
      cubemap.format = THREE.RGBAFormat;
      cubemap.magFilter = THREE.NearestFilter;
      cubemap.minFilter = THREE.NearestFilter;
      cubemap.encoding = THREE.LinearEncoding;
      cubemap.type = THREE.FloatType;

      self.numberOfTexturesLoaded += 1;
      if(self.numberOfTexturesLoaded === self.totalNumberOfTextures){
        self.hasLoadedImages = true;
      }
      self.images.starImages.starHashCubemap = cubemap;

      if(self.skyDirector?.renderers?.moonRenderer !== undefined){
        const atmosphereCubemapRef = self.skyDirector.renderers.atmosphereRenderer.atmosphereMaterial.uniforms.starHashCubemap;
        atmosphereCubemapRef.value = cubemap;

        const moonCubemapRef = self.skyDirector.renderers.moonRenderer.baseMoonVar.material.uniforms.starHashCubemap;
        moonCubemapRef.value = cubemap;
      }
    });

    //Load all of our dim star data maps
    let numberOfDimStarChannelsLoaded = 0;
    const channels = ['r', 'g', 'b', 'a'];
    const dimStarChannelImages = {r: null, g: null, b: null, a: null};
    //Recursive based functional for loop, with asynchronous execution because
    //Each iteration is not dependent upon the last, but it's just a set of similiar code
    //that can be run in parallel.
    (async function createNewDimStarTexturePromise(i){
      const next = i + 1;
      if(next < 4){
        createNewDimStarTexturePromise(next);
      }

      const texturePromise = new Promise(function(resolve, reject){
        textureLoader.load(StarrySky.assetPaths.dimStarDataMaps[i], function(texture){resolve(texture);});
      });
      texturePromise.then(function(texture){
        //Fill in the details of our texture
        texture.format = THREE.RGBAFormat;
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        texture.encoding = THREE.LinearEncoding;
        texture.type = THREE.FloatType;
        dimStarChannelImages[channels[i]] = texture;

        numberOfDimStarChannelsLoaded += 1;
        if(numberOfDimStarChannelsLoaded === 4){
          //Create our Star Library LUTs if it does not exists
          let skyDirector = self.skyDirector;
          if(skyDirector.stellarLUTLibrary === undefined){
            skyDirector.stellarLUTLibrary = new StarrySky.LUTlibraries.StellarLUTLibrary(skyDirector.assetManager.data, skyDirector.renderer, skyDirector.scene);
          }

          //Create our texture from these four textures
          skyDirector.stellarLUTLibrary.dimStarMapPass(dimStarChannelImages.r, dimStarChannelImages.g, dimStarChannelImages.b, dimStarChannelImages.a);

          //And send it off as a uniform for our atmospheric renderer
          //I presume if the moon renderer is loaded the atmosphere renderer is loaded as well
          if(self.skyDirector?.renderers?.moonRenderer !== undefined){
            const atmosphereTextureRef = skyDirector.renderers.atmosphereRenderer.atmosphereMaterial.uniforms.dimStarData;
            atmosphereTextureRef.value = skyDirector.stellarLUTLibrary.dimStarDataMap;

            const moonTextureRef = skyDirector.renderers.moonRenderer.baseMoonVar.material.uniforms.dimStarData;
            moonTextureRef.value = skyDirector.stellarLUTLibrary.dimStarDataMap;
          }

          self.numberOfTexturesLoaded += 1;
          if(self.numberOfTexturesLoaded === self.totalNumberOfTextures){
            self.hasLoadedImages = true;
          }
        }
      }, function(err){
        console.error(err);
      });
    })(0);

    //Load all of our bright star data maps
    let numberOfMedStarChannelsLoaded = 0;
    let medStarChannelImages = {r: null, g: null, b: null, a: null};
    //Recursive based functional for loop, with asynchronous execution because
    //Each iteration is not dependent upon the last, but it's just a set of similiar code
    //that can be run in parallel.
    (async function createNewMedStarTexturePromise(i){
      let next = i + 1;
      if(next < 4){
        createNewMedStarTexturePromise(next);
      }

      let texturePromise = new Promise(function(resolve, reject){
        textureLoader.load(StarrySky.assetPaths.medStarDataMaps[i], function(texture){resolve(texture);});
      });
      texturePromise.then(function(texture){
        //Fill in the details of our texture
        texture.format = THREE.RGBAFormat;
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        texture.encoding = THREE.LinearEncoding;
        texture.type = THREE.FloatType;
        medStarChannelImages[channels[i]] = texture;

        numberOfMedStarChannelsLoaded += 1;
        if(numberOfMedStarChannelsLoaded === 4){
          //Create our Star Library LUTs if it does not exists
          let skyDirector = self.skyDirector;
          if(skyDirector.stellarLUTLibrary === undefined){
            skyDirector.stellarLUTLibrary = new StarrySky.LUTlibraries.StellarLUTLibrary(skyDirector.assetManager.data, skyDirector.renderer, skyDirector.scene);
          }

          //Create our texture from these four textures
          skyDirector.stellarLUTLibrary.medStarMapPass(medStarChannelImages.r, medStarChannelImages.g, medStarChannelImages.b, medStarChannelImages.a);

          //And send it off as a uniform for our atmospheric renderer
          //I presume if the moon renderer is loaded the atmosphere renderer is loaded as well
          if(skyDirector?.renderers?.moonRenderer !== undefined){
            const atmosphereTextureRef = skyDirector.renderers.atmosphereRenderer.atmosphereMaterial.uniforms.medStarData;
            atmosphereTextureRef.value = skyDirector.stellarLUTLibrary.medStarDataMap;

            const moonTextureRef = skyDirector.renderers.moonRenderer.baseMoonVar.material.uniforms.medStarData;
            moonTextureRef.value = skyDirector.stellarLUTLibrary.medStarDataMap;
          }

          self.numberOfTexturesLoaded += 1;
          if(self.numberOfTexturesLoaded === self.totalNumberOfTextures){
            self.hasLoadedImages = true;
          }
        }
      }, function(err){
        console.error(err);
      });
    })(0);

    //Load all of our bright star data maps
    let numberOfBrightStarChannelsLoaded = 0;
    let brightStarChannelImages = {r: null, g: null, b: null, a: null};
    //Recursive based functional for loop, with asynchronous execution because
    //Each iteration is not dependent upon the last, but it's just a set of similiar code
    //that can be run in parallel.
    (async function createNewBrightStarTexturePromise(i){
      let next = i + 1;
      if(next < 4){
        createNewBrightStarTexturePromise(next);
      }

      let texturePromise = new Promise(function(resolve, reject){
        textureLoader.load(StarrySky.assetPaths.brightStarDataMaps[i], function(texture){resolve(texture);});
      });
      texturePromise.then(function(texture){
        //Fill in the details of our texture
        texture.format = THREE.RGBAFormat;
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        texture.encoding = THREE.LinearEncoding;
        texture.type = THREE.FloatType;
        brightStarChannelImages[channels[i]] = texture;

        numberOfBrightStarChannelsLoaded += 1;
        if(numberOfBrightStarChannelsLoaded === 4){
          //Create our Star Library LUTs if it does not exists
          let skyDirector = self.skyDirector;
          if(skyDirector.stellarLUTLibrary === undefined){
            skyDirector.stellarLUTLibrary = new StarrySky.LUTlibraries.StellarLUTLibrary(skyDirector.assetManager.data, skyDirector.renderer, skyDirector.scene);
          }

          //Create our texture from these four textures
          skyDirector.stellarLUTLibrary.brightStarMapPass(brightStarChannelImages.r, brightStarChannelImages.g, brightStarChannelImages.b, brightStarChannelImages.a);

          //And send it off as a uniform for our atmospheric renderer
          //I presume if the moon renderer is loaded the atmosphere renderer is loaded as well
          if(skyDirector?.renderers?.moonRenderer !== undefined){
            const atmosphereTextureRef = skyDirector.renderers.atmosphereRenderer.atmosphereMaterial.uniforms.brightStarData;
            atmosphereTextureRef.value = skyDirector.stellarLUTLibrary.brightStarDataMap;

            const moonTextureRef = skyDirector.renderers.moonRenderer.baseMoonVar.material.uniforms.brightStarData;
            moonTextureRef.value = skyDirector.stellarLUTLibrary.brightStarDataMap;
          }

          self.numberOfTexturesLoaded += 1;
          if(self.numberOfTexturesLoaded === self.totalNumberOfTextures){
            self.hasLoadedImages = true;
          }
        }
      }, function(err){
        console.error(err);
      });
    })(0);

    //Load blue noise textures
    //Recursive based functional for loop, with asynchronous execution because
    //Each iteration is not dependent upon the last, but it's just a set of similiar code
    //that can be run in parallel.
    (async function createNewBlueNoiseTexturePromise(i){
      let next = i + 1;
      if(next < numberOfBlueNoiseTextures){
        createNewBlueNoiseTexturePromise(next);
      }

      let texturePromise = new Promise(function(resolve, reject){
        textureLoader.load(StarrySky.assetPaths['blueNoiseMaps'][i], function(texture){resolve(texture);});
      });
      texturePromise.then(function(texture){
        //Fill in the details of our texture
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.format = THREE.RGBAFormat;
        texture.generateMipmaps = true;
        texture.magFilter = THREE.LinearFilter;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.encoding = THREE.LinearEncoding;
        texture.type = THREE.FloatType;
        self.images.blueNoiseImages[i] = texture;

        self.numberOfTexturesLoaded += 1;
        if(self.numberOfTexturesLoaded === self.totalNumberOfTextures){
          self.hasLoadedImages = true;
        }
      }, function(err){
        console.error(err);
      });
    })(0);

    let solarEclipseTexturePromise = new Promise(function(resolve, reject){
      textureLoader.load(StarrySky.assetPaths.solarEclipseMap, function(texture){resolve(texture);});
    });
    solarEclipseTexturePromise.then(function(texture){
      //Fill in the details of our texture
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.generateMipmaps = true;
      texture.magFilter = THREE.LinearFilter;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.encoding = THREE.LinearEncoding;
      texture.type = THREE.FloatType;
      self.images.solarEclipseImage = texture;

      //If the renderer already exists, go in and update the uniform
      //I presume if the moon renderer is loaded the atmosphere renderer is loaded as well
      if(self.skyDirector?.renderers?.SunRenderer !== undefined){
        const atmosphereTextureRef = self.skyDirector.renderers.atmosphereRenderer.atmosphereMaterial.uniforms.solarEclipseMap;
        atmosphereTextureRef.value = texture;
      }

      self.numberOfTexturesLoaded += 1;
      if(self.numberOfTexturesLoaded === self.totalNumberOfTextures){
        self.hasLoadedImages = true;
      }
    }, function(err){
      console.error(err);
    });

    //Load any additional textures
  }

  //Internal function for loading our sky data once the DOM is ready
  this.loadSkyData = function(){
    if(self.loadSkyDataHasNotRun){
      //Don't run this twice
      self.loadSkyDataHasNotRun = false;

      //Now that we have verified our tags, let's grab the first one in each.
      const defaultValues = self.starrySkyComponent.defaultValues;
      self.data.skyLocationData = self.hasSkyLocationTag ? self.skyLocationTag.data : defaultValues.location;
      self.data.skyTimeData = self.hasSkyTimeTag ? self.skyTimeTag.data : defaultValues.time;
      self.data.skyAtmosphericParameters = self.hasSkyAtmosphericParametersTag ? self.skyAtmosphericParametersTag.data : defaultValues.skyAtmosphericParameters;
      self.data.skyLighting = self.hasSkyLightingTag ? self.skyLightingTag.data : defaultValues.lighting;
      self.data.skyAssetsData = self.hasSkyAssetsTag ? StarrySky.assetPaths : StarrySky.DefaultData.skyAssets;
      self.loadImageAssets(self.skyDirector.renderer);

      skyDirector.assetManagerInitialized = true;
      skyDirector.initializeSkyDirectorWebWorker();
    }
  };

  //This is the function that gets called each time our data loads.
  //In the event that we have loaded everything the number of tags should
  //equal the number of events.
  let checkIfNeedsToLoadSkyData = function(e = false){
    self.skyDataSetsLoaded += 1;
    if(self.skyDataSetsLoaded >= self.skyDataSetsLength){
      if(!e || (e.nodeName.toLowerCase() !== "sky-assets-dir" || e.isRoot)){
        self.loadSkyData();
      }
    }
  };

  //Closure to simplify our code below to avoid code duplication.
  function checkIfAllHTMLDataLoaded(tag){
    if(!tag.skyDataLoaded || !checkIfNeedsToLoadSkyData()){
      //Tags still yet exist to be loaded? Add a listener for the next event
      tag.addEventListener('Sky-Data-Loaded', checkIfNeedsToLoadSkyData);
    }
  }

  let activeTags = [];
  if(skyLocationTags.length === 1){
    this.skyDataSetsLength += 1;
    this.skyLocationTag = skyLocationTags[0];
    this.hasSkyLocationTag = true;
    hasSkyDataLoadedEventListener = false;
    activeTags.push(this.skyLocationTag);
  }
  if(skyTimeTags.length === 1){
    this.skyDataSetsLength += 1;
    this.skyTimeTag = skyTimeTags[0];
    this.hasSkyTimeTag = true;
    activeTags.push(this.skyTimeTag);
  }
  if(skyAtmosphericParametersTags.length === 1){
    this.skyDataSetsLength += 1;
    this.skyAtmosphericParametersTag = skyAtmosphericParametersTags[0];
    this.hasSkyAtmosphericParametersTag = true;
    activeTags.push(this.skyAtmosphericParametersTag);
  }
  if(skyAssetsTags.length > 0){
    this.skyDataSetsLength += skyAssetsTags.length;
    this.skyAssetsTags = skyAssetsTags;
    this.hasSkyAssetsTag = true;
    for(let i = 0; i < skyAssetsTags.length; ++i){
      activeTags.push(skyAssetsTags[i]);
    }
  }
  if(skyLightingTags.length === 1){
    this.skyDataSetsLength += 1;
    this.skyLightingTag = skyLightingTags[0];
    this.hasSkyLightingTag = true;
    activeTags.push(this.skyLightingTag);
  }
  for(let i = 0; i < activeTags.length; ++i){
    checkIfAllHTMLDataLoaded(activeTags[i]);
  }

  if(this.skyDataSetsLength === 0 || this.skyDataSetsLoaded === this.skyDataSetsLength){
    this.loadSkyData();
  }
};

StarrySky.SkyDirector = function(parentComponent, webWorkerURI){
  this.skyDirectorWASMIsReady = false;
  this.skyInterpolatorWASMIsReady = false;
  this.assetManagerInitialized = false;
  this.lightingManager = false;
  this.skyState;
  this.EVENT_INITIALIZE_SKY_STATE = 0;
  this.EVENT_INITIALIZATION_SKY_STATE_RESPONSE = 1;
  this.EVENT_UPDATE_LATEST_SKY_STATE = 2;
  this.EVENT_RETURN_LATEST_SKY_STATE = 3;
  this.EVENT_INITIALIZE_AUTOEXPOSURE = 4;
  this.EVENT_INITIALIZATION_AUTOEXPOSURE_RESPONSE = 5;
  this.EVENT_UPDATE_AUTOEXPOSURE = 6;
  this.EVENT_RETURN_AUTOEXPOSURE = 7;
  const RADIUS_OF_SKY = 5000.0;
  const BYTES_PER_32_BIT_FLOAT = 4;
  const NUMBER_OF_FLOATS = 27;
  const NUMBER_OF_ROTATIONAL_OBJECTS = 7;
  const NUMBER_OF_HORIZON_FADES = 2;
  const NUMBER_OF_PARALLACTIC_ANGLES = 1;
  const NUMBER_OF_LUNAR_ECLIPSE_UNIFORMS = 8;
  const NUMBER_OF_ROTATIONAL_TRANSFORMATIONS = NUMBER_OF_ROTATIONAL_OBJECTS * 2;
  const NUMBER_OF_ROTATION_OUTPUT_VALUES = NUMBER_OF_ROTATIONAL_OBJECTS * 3;
  const START_OF_LUNAR_ECLIPSE_INDEX = NUMBER_OF_HORIZON_FADES + NUMBER_OF_PARALLACTIC_ANGLES;
  const NUMBER_OF_ROTATIONALLY_DEPENDENT_OUTPUT_VALUES = NUMBER_OF_HORIZON_FADES + NUMBER_OF_PARALLACTIC_ANGLES + NUMBER_OF_LUNAR_ECLIPSE_UNIFORMS;
  const NUMBER_OF_LINEAR_INTERPOLATIONS = 12;
  const NUMBER_OF_LIGHTING_COLOR_CHANNELS = 25;
  const NUMBER_OF_LIGHTING_OUT_VALUES = 35;
  const LINEAR_ARRAY_START = NUMBER_OF_ROTATIONAL_TRANSFORMATIONS + 1;
  const LINEAR_ARRAY_END = LINEAR_ARRAY_START + NUMBER_OF_LINEAR_INTERPOLATIONS + 1;
  const COLOR_ARRAY_START = LINEAR_ARRAY_END + 1;
  const COLOR_ARRAY_END = COLOR_ARRAY_START + NUMBER_OF_LIGHTING_COLOR_CHANNELS + 1;
  const TOTAL_BYTES_FOR_WORKER_BUFFERS = BYTES_PER_32_BIT_FLOAT * NUMBER_OF_FLOATS;
  const ONE_MINUTE = 60.0;
  const HALF_A_SECOND = 0.5;
  const FOUR_SECONDS = 4.0;
  const TWENTY_MINUTES = 20.0 * ONE_MINUTE;
  const PI_OVER_TWO = Math.PI * 0.5;
  const DEG_2_RAD = 0.017453292519943295769236907684886;
  let transferableInitialStateBuffer = new ArrayBuffer(TOTAL_BYTES_FOR_WORKER_BUFFERS);
  this.transferableFinalStateBuffer = new ArrayBuffer(TOTAL_BYTES_FOR_WORKER_BUFFERS);
  this.finalStateFloat32Array = new Float32Array(this.transferableFinalStateBuffer);
  this.astroPositions_0_ptr;
  this.astroPositions_f_ptr;
  this.rotatedAstroPositions_ptr;
  this.rotatedAstroPositions;
  this.astronomicalLinearValues_0_ptr;
  this.astronomicalLinearValues_f_ptr;
  this.astronomicalLinearValues_ptr;
  this.astronomicalLinearValues;
  this.rotatedAstroDependentValues;
  this.lightingColorValues_0_ptr;
  this.lightingColorValues_f_ptr;
  this.lightingColorValues_ptr;
  this.finalLSRT;
  this.speed;
  this.interpolationT = 0.0;
  this.finalAstronomicalT = TWENTY_MINUTES;
  this.exposureT = 0.0;
  this.time = 0.0;
  this.interpolatedSkyIntensityMagnitude = 1.0;
  this.ready = false;
  this.parentComponent = parentComponent;
  this.renderer = parentComponent.el.sceneEl.renderer;
  this.scene = parentComponent.el.sceneEl.object3D;
  this.assetManager;
  this.LUTLibraries;
  this.renderers;
  this.interpolator = null;
  this.camera;
  this.pixelsPerRadian;
  this.atmosphereLUTLibrary;
  this.stellarLUTLibrary;
  this.moonAndSunRendererSize;
  this.dominantLightIsSun0;
  this.dominantLightIsSunf;
  this.dominantLightY0;
  this.dominantLightYf;
  this.exposureVariables = {
    sunPosition: new THREE.Vector3(),
    moonPosition: new THREE.Vector3(),
    sunHorizonFade: 0.0,
    moonHorizonFade: 0.0,
    exposureCoefficient0: 0.0,
    starsExposure: 0.0,
    moonExposure: 0.0,
    exposureCoefficientf: 0.0,
  };
  let transferableIntialLightingFloat32Array;
  this.transferableSkyFinalLightingBuffer;
  this.transferableSkyFinalLightingFloat32Array;
  this.lightingColorBufferf;
  this.lightingColorArrayf;
  this.currentCameraLookAtTarget = new THREE.Vector3();
  this.previousCameraLookAtVector = new THREE.Vector3();
  this.clonedPreviousCameraLookAtVector = new THREE.Vector3();
  this.previousCameraHeight = 0.0;
  this.lookAtInterpolationQuaternion = new THREE.Quaternion();
  this.lookAtInterpolatedQuaternion = new THREE.Quaternion();
  this.randomBlueNoiseTexture = 0;
  this.sunRadius;
  this.moonRadius;
  this.distanceForSolarEclipse;

  //Set up our web assembly hooks
  let self = this;

  //Called from the asset manager when all of our assets have finished loading
  //Also colled when our local web assembly has finished loading as both are pre-requisites
  //for running the responses produced by our web worker
  this.initializeSkyDirectorWebWorker = function(){
    //Attach our asset manager if it has been passed over
    if(self.assetManagerInitialized && self.skyInterpolatorWASMIsReady){
      self.sunRadius = Math.sin(this.assetManager.data.skyAtmosphericParameters.sunAngularDiameter * DEG_2_RAD * 0.5);
      self.moonRadius = Math.sin(this.assetManager.data.skyAtmosphericParameters.moonAngularDiameter * DEG_2_RAD * 0.5);
      self.distanceForSolarEclipse = 2.0 * Math.SQRT2 * Math.max(self.sunRadius, self.moonRadius);

      //Post our message to the web worker to get the initial state of our sky
      self.webAssemblyWorker.postMessage({
        eventType: self.EVENT_INITIALIZE_SKY_STATE,
        latitude: self.assetManager.data.skyLocationData.latitude,
        longitude: self.assetManager.data.skyLocationData.longitude,
        date: self.assetManager.data.skyTimeData.date,
        utcOffset: self.assetManager.data.skyTimeData.utcOffset,
        transferableInitialStateBuffer: transferableInitialStateBuffer,
        transferableFinalStateBuffer: self.transferableFinalStateBuffer
      }, [transferableInitialStateBuffer, self.transferableFinalStateBuffer]);

      //Iitialize one of our key constants
      BASE_RADIUS_OF_SUN = self.assetManager.data.skyAtmosphericParameters.sunAngularDiameter * DEG_2_RAD * 0.5;

      //Initialize our LUTs
      self.atmosphereLUTLibrary = new StarrySky.LUTlibraries.AtmosphericLUTLibrary(self.assetManager.data, self.renderer, self.scene);
    }
  }

  this.initializeRenderers = function(){
    //All systems must be up and running before we are ready to begin
    if(self.assetManagerInitialized && self.skyDirectorWASMIsReady){
      //Attach our camera, which should be loaded by now.
      const DEG_2_RAD = Math.PI / 180.0;
      self.camera = self.parentComponent.el.sceneEl.camera;
      self.previousCameraHeight = self.camera.position.y;
      self.pixelsPerRadian = screen.width / (this.camera.fov * DEG_2_RAD);

      //Determine the best texture size for our renderers
      const sunAngularDiameterInRadians = self.assetManager.data.skyAtmosphericParameters.sunAngularDiameter * DEG_2_RAD;
      const sunRendererTextureSize = Math.floor(self.pixelsPerRadian * sunAngularDiameterInRadians * 2.0);
      //Floor and ceiling to nearest power of 2, Page 61 of Hacker's Delight
      const ceilSRTS = Math.min(parseInt(1 << (32 - Math.clz32(sunRendererTextureSize - 1), 10)), 1024);
      const floorSRTS = ceilSRTS >> 1; //Divide by 2! Without the risk of floating point errors
      const SRTSToNearestPowerOfTwo = Math.abs(sunRendererTextureSize - floorSRTS) <= Math.abs(sunRendererTextureSize - ceilSRTS) ? floorSRTS : ceilSRTS;

      const moonAngularDiameterInRadians = self.assetManager.data.skyAtmosphericParameters.moonAngularDiameter * DEG_2_RAD;
      const moonRendererTextureSize = Math.floor(self.pixelsPerRadian * moonAngularDiameterInRadians * 2.0);
      //Floor and ceiling to nearest power of 2, Page 61 of Hacker's Delight
      const ceilMRTS = Math.min(parseInt(1 << (32 - Math.clz32(moonRendererTextureSize - 1), 10)), 1024);
      const floorMRTS = ceilMRTS >> 1; //Divide by 2! Without the risk of floating point errors
      const MRTSToNearestPowerOfTwo = Math.abs(moonRendererTextureSize - floorMRTS) <= Math.abs(moonRendererTextureSize - ceilMRTS) ? floorMRTS : ceilMRTS;

      if(SRTSToNearestPowerOfTwo !== MRTSToNearestPowerOfTwo){
        console.warn("The moon and sun should be a similiar angular diameters to avoid unwanted texture artifacts.");
      }

      //Choose the bigger of the two textures
      self.moonAndSunRendererSize = Math.max(SRTSToNearestPowerOfTwo, MRTSToNearestPowerOfTwo);

      //Prepare all of our renderers to display stuff
      self.speed = self.assetManager.data.skyTimeData.speed;
      self.renderers.atmosphereRenderer = new StarrySky.Renderers.AtmosphereRenderer(self);
      self.renderers.sunRenderer = new StarrySky.Renderers.SunRenderer(self);
      self.renderers.moonRenderer = new StarrySky.Renderers.MoonRenderer(self);
      self.renderers.meteringSurveyRenderer = new StarrySky.Renderers.MeteringSurveyRenderer(self);

      //Now set up our auto-exposure system
      self.initializeAutoExposure();
    }
  }

  this.updateFinalSkyState = function(lsrt_0, lsrt_f){
    //Update the Module Heap and final LSRT
    let intitialLSRT = self.finalLSRT;
    //let strtingPtr2 = self.astroPositions_f_ptr;
    let insertIndex = self.astroPositions_0_ptr / BYTES_PER_32_BIT_FLOAT;
    let copyFromIndex = self.astroPositions_f_ptr / BYTES_PER_32_BIT_FLOAT;
    let copyEndIndex = copyFromIndex + NUMBER_OF_ROTATIONAL_TRANSFORMATIONS;
    Module.HEAPF32.copyWithin(insertIndex, copyFromIndex, copyEndIndex);
    insertIndex = self.astronomicalLinearValues_0_ptr / BYTES_PER_32_BIT_FLOAT;
    copyFromIndex = self.astronomicalLinearValues_f_ptr / BYTES_PER_32_BIT_FLOAT;
    copyEndIndex = copyFromIndex + NUMBER_OF_LINEAR_INTERPOLATIONS;
    Module.HEAPF32.copyWithin(insertIndex, copyFromIndex, copyEndIndex);
    self.finalLSRT = self.finalStateFloat32Array[14];
    Module.HEAPF32.set(self.finalStateFloat32Array.slice(0, NUMBER_OF_ROTATIONAL_TRANSFORMATIONS), self.astroPositions_f_ptr / BYTES_PER_32_BIT_FLOAT);
    Module.HEAPF32.set(self.finalStateFloat32Array.slice(LINEAR_ARRAY_START, LINEAR_ARRAY_END), self.astronomicalLinearValues_f_ptr / BYTES_PER_32_BIT_FLOAT);

    //Set initial values to final values in module and update our final values to the values
    //returned from our worker.
    Module._updateFinalAstronomicalValues(self.astroPositions_f_ptr, self.astronomicalLinearValues_f_ptr);
    self.finalAstronomicalT = self.interpolationT + TWENTY_MINUTES;
    Module._updateAstronomicalTimeData(self.interpolationT, self.finalAstronomicalT, lsrt_0, self.finalLSRT);

    //Return the final state back to the worker thread so it can determine the state five minutes from now
    self.webAssemblyWorker.postMessage({
      eventType: self.EVENT_UPDATE_LATEST_SKY_STATE,
      transferableFinalStateBuffer: self.transferableFinalStateBuffer
    }, [self.transferableFinalStateBuffer]);
  }

  this.i = 0;

  this.tick = function(time, timeDelta){
    if(parentComponent.initialized){
      const timeDeltaInSeconds = timeDelta * 0.001;
      self.exposureT += timeDeltaInSeconds;
      self.time = time * 0.001;
      self.interpolationT += timeDeltaInSeconds * self.speed;

      //Update our sky state
      self.skyState.LSRT = Module._tick_astronomicalInterpolations(self.interpolationT);

      //Update our astronomical positions
      self.skyState.sun.position.fromArray(self.rotatedAstroPositions.slice(0, 3));
      let sp = self.skyState.sun.position;
      self.skyState.sun.quadOffset.set(-sp.z, sp.y, -sp.x).normalize().multiplyScalar(RADIUS_OF_SKY);
      self.skyState.moon.position.fromArray(self.rotatedAstroPositions.slice(3, 6));
      let mp = self.skyState.moon.position;
      self.skyState.moon.quadOffset.set(-mp.z, mp.y, -mp.x).normalize().multiplyScalar(RADIUS_OF_SKY);
      self.skyState.moon.parallacticAngle = self.rotatedAstroDependentValues[2] - PI_OVER_TWO;
      self.skyState.mercury.position.fromArray(self.rotatedAstroPositions.slice(6, 9));
      self.skyState.venus.position.fromArray(self.rotatedAstroPositions.slice(9, 12));
      self.skyState.mars.position.fromArray(self.rotatedAstroPositions.slice(12, 15));
      self.skyState.jupiter.position.fromArray(self.rotatedAstroPositions.slice(15, 18));
      self.skyState.saturn.position.fromArray(self.rotatedAstroPositions.slice(18, 21));

      //Update our linear values
      self.skyState.sun.luminosity = 100000.0 * self.astronomicalLinearValues[0] / 1300.0;
      self.skyState.sun.intensity = 10.0 *  self.astronomicalLinearValues[0] / 1300.0;
      self.skyState.sun.horizonFade = self.rotatedAstroDependentValues[0];
      self.skyState.sun.scale = self.astronomicalLinearValues[1];
      self.skyState.moon.luminosity = 200.0 * self.astronomicalLinearValues[2];
      self.skyState.moon.intensity = 500.0 * self.astronomicalLinearValues[2];
      self.skyState.moon.horizonFade = self.rotatedAstroDependentValues[1];
      self.skyState.moon.scale = self.astronomicalLinearValues[3];
      self.skyState.moon.earthshineIntensity = self.astronomicalLinearValues[5];
      self.skyState.mercury.intensity = self.astronomicalLinearValues[6];
      self.skyState.venus.intensity = self.astronomicalLinearValues[7];
      self.skyState.mars.intensity = self.astronomicalLinearValues[8];
      self.skyState.jupiter.intensity = self.astronomicalLinearValues[9];
      self.skyState.saturn.intensity = self.astronomicalLinearValues[10];

      //Check if we need to update our final state again
      if(self.interpolationT >= self.finalAstronomicalT){
        self.updateFinalSkyState(self.skyState.LSRT, self.finalStateFloat32Array[14]);
      }

      //Interpolate our log average of the sky intensity
      Module._tick_lightingInterpolations(self.time);
      self.interpolatedSkyIntensityMagnitude = self.lightingColorValues[28];
      self.exposureVariables.starsExposure = Math.min(6.8 - self.interpolatedSkyIntensityMagnitude, 3.7);

      //Update values associated with lunar eclipses
      self.skyState.moon.distanceToEarthsShadowSquared = self.rotatedAstroDependentValues[START_OF_LUNAR_ECLIPSE_INDEX];
      self.skyState.moon.oneOverNormalizedLunarDiameter = self.rotatedAstroDependentValues[START_OF_LUNAR_ECLIPSE_INDEX + 1];
      self.skyState.moon.earthsShadowPosition.fromArray(self.rotatedAstroDependentValues.slice(START_OF_LUNAR_ECLIPSE_INDEX + 2, START_OF_LUNAR_ECLIPSE_INDEX + 5));
      self.skyState.moon.lightingModifier.fromArray(self.rotatedAstroDependentValues.slice(START_OF_LUNAR_ECLIPSE_INDEX + 5, START_OF_LUNAR_ECLIPSE_INDEX + 8));

      //Tick our light positions before we might just use them to set up the next interpolation
      self.lightingManager.tick(self.lightingColorValues);

      //Update our random blue noise texture
      self.randomBlueNoiseTexture = Math.floor(Math.random() * 4.9999);

      //Check if we need to update our auto-exposure final state again
      if(self.exposureT >= HALF_A_SECOND && self.transferableSkyFinalLightingBuffer.byteLength !== 0){
        self.exposureT = 0.0;
        //Our colors are normalized and the brightnesses pulled out of them
        //so we need to inject those values back in before updating all of our colors again
        Module._denormalizeSkyIntensity0();
        Module.HEAPF32.set(self.lightingColorValues.slice(0, NUMBER_OF_LIGHTING_COLOR_CHANNELS), self.lightingColorValues_0_ptr / BYTES_PER_32_BIT_FLOAT);
        Module.HEAPF32.set(self.lightingColorArrayf.slice(0, NUMBER_OF_LIGHTING_COLOR_CHANNELS), self.lightingColorValues_f_ptr / BYTES_PER_32_BIT_FLOAT);

        //While we are still on this thread, we need to copy the previous look up vector before it
        //gets changed below, as the upcoming methods invoke async
        this.clonedPreviousCameraLookAtVector.copy(this.previousCameraLookAtVector);
        this.clonedPreviousCameraLookAtVector.normalize();

        //We should also save the last position for the sun to determine if the dominant light is the sun or not
        const sunRadiusf = Math.sin(self.renderers.sunRenderer.sunAngularRadiusInRadians * self.skyState.sun.scale);
        self.dominantLightIsSun0 = true;
        let dominantLightY0 = sp.y;
        if(self.skyState.sun.position.y < -sunRadiusf){
          self.dominantLightIsSun0 = false;
          dominantLightY0 = mp.y;
        }
        self.dominantLightY0 = dominantLightY0;

        //Is this what they mean by dependency injection overload?
        //void updateLightingValues(float skyIntensity0, float skyIntensityf, bool dominantLightIsSun0,
        //bool dominantLightIsSunf, float dominantLightY0, float dominantLightf, float dominantLightIntensity0,
        //float dominantLightIntensityf, float* lightColors0, float* lightColorsf, float t_0, float t_f);
        Module._updateLightingValues(self.interpolatedSkyIntensityMagnitude, self.exposureVariables.exposureCoefficientf,
          self.dominantLightIsSun0, self.dominantLightIsSunf,
          self.dominantLightY0, self.dominantLightYf,
          self.lightingColorValues_ptr, self.lightingColorValues_f_ptr,
          self.time, self.time + HALF_A_SECOND);

        self.updateAutoExposure(timeDeltaInSeconds);

        //Set our previous lookup target
        const cameraLookAtTarget = new THREE.Vector3(self.camera.matrix[8], self.camera.matrix[9], self.camera.matrix[10]);
        this.previousCameraLookAtVector.set(cameraLookAtTarget.xyz);
        this.previousCameraHeight = self.camera.position.y;
      }
    }
  }

  //Prepare our WASM Modules
  console.log(webWorkerURI);
  this.webAssemblyWorker = new Worker(webWorkerURI);
  this.webAssemblyWorker.addEventListener('message', function(e){
    let postObject = e.data;
    if(postObject.eventType === self.EVENT_RETURN_LATEST_SKY_STATE){
      //Attach our 32 bit float array buffers back to this thread again
      self.transferableFinalStateBuffer = postObject.transferableFinalStateBuffer;
      self.finalStateFloat32Array = new Float32Array(self.transferableFinalStateBuffer);
    }
    else if(postObject.eventType === self.EVENT_INITIALIZATION_SKY_STATE_RESPONSE){
      //Attach our 32 bit float array buffers back to this thread again
      transferableInitialStateBuffer = postObject.transferableInitialStateBuffer;
      self.transferableFinalStateBuffer = postObject.transferableFinalStateBuffer;
      self.finalStateFloat32Array = new Float32Array(self.transferableFinalStateBuffer);
      let initialStateFloat32Array = new Float32Array(transferableInitialStateBuffer);

      //Prepare the heap memory for our interpolation engine
      self.astroPositions_0_ptr = Module._malloc(NUMBER_OF_ROTATIONAL_TRANSFORMATIONS * BYTES_PER_32_BIT_FLOAT);
      Module.HEAPF32.set(initialStateFloat32Array.slice(0, NUMBER_OF_ROTATIONAL_TRANSFORMATIONS), self.astroPositions_0_ptr / BYTES_PER_32_BIT_FLOAT);
      self.astroPositions_f_ptr = Module._malloc(NUMBER_OF_ROTATIONAL_TRANSFORMATIONS * BYTES_PER_32_BIT_FLOAT);
      Module.HEAPF32.set(self.finalStateFloat32Array.slice(0, NUMBER_OF_ROTATIONAL_TRANSFORMATIONS), self.astroPositions_f_ptr / BYTES_PER_32_BIT_FLOAT);
      self.rotatedAstroPositions_ptr = Module._malloc(NUMBER_OF_ROTATION_OUTPUT_VALUES * BYTES_PER_32_BIT_FLOAT);
      self.rotatedAstroDepedentValues_ptr = Module._malloc(NUMBER_OF_ROTATIONALLY_DEPENDENT_OUTPUT_VALUES * BYTES_PER_32_BIT_FLOAT);

      self.astronomicalLinearValues_0_ptr = Module._malloc(NUMBER_OF_LINEAR_INTERPOLATIONS * BYTES_PER_32_BIT_FLOAT);
      Module.HEAPF32.set(initialStateFloat32Array.slice(LINEAR_ARRAY_START, LINEAR_ARRAY_END), self.astronomicalLinearValues_0_ptr / BYTES_PER_32_BIT_FLOAT);
      self.astronomicalLinearValues_f_ptr = Module._malloc(NUMBER_OF_LINEAR_INTERPOLATIONS * BYTES_PER_32_BIT_FLOAT);
      Module.HEAPF32.set(self.finalStateFloat32Array.slice(LINEAR_ARRAY_START, LINEAR_ARRAY_END), self.astronomicalLinearValues_f_ptr / BYTES_PER_32_BIT_FLOAT);
      self.astronomicalLinearValues_ptr = Module._malloc(NUMBER_OF_LINEAR_INTERPOLATIONS * BYTES_PER_32_BIT_FLOAT);

      //Setting this buffer is deffered until our lighting worker is complete
      self.lightingColorValues_0_ptr = Module._malloc(NUMBER_OF_LIGHTING_COLOR_CHANNELS * BYTES_PER_32_BIT_FLOAT);
      self.lightingColorValues_f_ptr = Module._malloc(NUMBER_OF_LIGHTING_COLOR_CHANNELS * BYTES_PER_32_BIT_FLOAT);
      self.lightingColorValues_ptr = Module._malloc(NUMBER_OF_LIGHTING_OUT_VALUES * BYTES_PER_32_BIT_FLOAT);

      //Attach references to our interpolated values
      self.rotatedAstroPositions = new Float32Array(Module.HEAPF32.buffer, self.rotatedAstroPositions_ptr, NUMBER_OF_ROTATION_OUTPUT_VALUES);
      self.astronomicalLinearValues = new Float32Array(Module.HEAPF32.buffer, self.astronomicalLinearValues_ptr, NUMBER_OF_LINEAR_INTERPOLATIONS);
      self.rotatedAstroDependentValues = new Float32Array(Module.HEAPF32.buffer, self.rotatedAstroDepedentValues_ptr, NUMBER_OF_ROTATIONALLY_DEPENDENT_OUTPUT_VALUES);

      //Run our sky interpolator to determine our azimuth, altitude and other variables
      let latitude = self.assetManager.data.skyLocationData.latitude;
      const twiceTheSinOfSolarRadius = 2.0 * Math.sin(self.assetManager.data.skyAtmosphericParameters.sunAngularDiameter * DEG_2_RAD * 0.5);
      Module._setupInterpolators(latitude, twiceTheSinOfSolarRadius, self.sunRadius, self.moonRadius, self.distanceForSolarEclipse,
        self.astroPositions_0_ptr, self.rotatedAstroPositions_ptr, self.astronomicalLinearValues_0_ptr,
        self.astronomicalLinearValues_ptr, self.rotatedAstroDepedentValues_ptr);
      Module._updateFinalAstronomicalValues(self.astroPositions_f_ptr, self.astronomicalLinearValues_f_ptr);
      self.finalLSRT = self.finalStateFloat32Array[14];
      self.finalAstronomicalT = self.interpolationT + TWENTY_MINUTES;
      Module._updateAstronomicalTimeData(self.interpolationT, self.finalAstronomicalT, initialStateFloat32Array[14], self.finalLSRT);

      self.skyState = {
        sun: {
          position: new THREE.Vector3(),
          quadOffset: new THREE.Vector3()
        },
        moon: {
          position: new THREE.Vector3(),
          quadOffset: new THREE.Vector3(),
          distanceToEarthsShadowSquared: 0.0,
          oneOverNormalizedLunarDiameter: 0.0,
          earthsShadowPosition: new THREE.Vector3(),
          lightingModifier: new THREE.Vector3()
        },
        mercury: {
          position: new THREE.Vector3()
        },
        venus: {
          position: new THREE.Vector3()
        },
        mars: {
          position: new THREE.Vector3()
        },
        jupiter: {
          position: new THREE.Vector3()
        },
        saturn: {
          position: new THREE.Vector3()
        }
      };

      //Return the final state back to the worker thread so it can determine the state five minutes from now
      self.webAssemblyWorker.postMessage({
        eventType: self.EVENT_UPDATE_LATEST_SKY_STATE,
        transferableFinalStateBuffer: self.transferableFinalStateBuffer
      }, [self.transferableFinalStateBuffer]);

      //Proceed to renderer setup
      self.skyDirectorWASMIsReady = true;
      self.initializeRenderers();
    }
    else if(postObject.eventType === self.EVENT_INITIALIZATION_AUTOEXPOSURE_RESPONSE){
      //Hook up our intial color buffers that were created on the web worker
      const lightingColorArray0 = postObject.lightingColorArray0;
      self.lightingColorArrayf = postObject.lightingColorArrayf;

      //Set up our lighting color values for the first time
      Module.HEAPF32.set(lightingColorArray0, self.lightingColorValues_0_ptr / BYTES_PER_32_BIT_FLOAT);
      Module.HEAPF32.set(self.lightingColorArrayf, self.lightingColorValues_f_ptr / BYTES_PER_32_BIT_FLOAT);
      self.lightingColorValues = new Float32Array(Module.HEAPF32.buffer, self.lightingColorValues_ptr, NUMBER_OF_LIGHTING_OUT_VALUES);

      //Hook up our output lighting value array so we can get back multiple values from interpolating our lighting
      Module._initializeLightingValues(self.lightingColorValues_ptr);
      Module._updateLightingValues(postObject.exposureCoefficient0,  postObject.exposureCoefficientf,
        self.dominantLightIsSun0, self.dominantLightIsSunf,
        postObject.dominantLightY0, postObject.dominantLightYf,
        self.lightingColorValues_0_ptr, self.lightingColorValues_f_ptr,
        self.time, self.time + HALF_A_SECOND);

      //Now re-attach our array for use in the renderer
      self.transferableSkyFinalLightingBuffer = postObject.meteringSurveyFloatArray.buffer;

      //Hook up our results to our interpolator for constant exposure variation
      self.exposureVariables.exposureCoefficient0 = postObject.exposureCoefficient0;
      self.exposureVariables.exposureCoefficientf = postObject.exposureCoefficientf;

      //Hook up lighting values for interpolation for our hemispherical, direct lighting and fog
      self.lightingManager = new StarrySky.LightingManager(self);

      //Pass the data back to the worker to get the next data set
      const deltaT = 1.0 / 60.0; //Presume 60 FPS on this first frame
      self.updateAutoExposure(deltaT);

      //Start the sky here - as we should have everything back and ready by now
      self.start();
    }
    else if(postObject.eventType === self.EVENT_RETURN_AUTOEXPOSURE){
      ///Hook up our intial color buffers that were created on the web worker
      self.lightingColorArrayf = postObject.lightingColorArrayf;
      self.lightingColorValuesf = new Float32Array(Module.HEAPF32.buffer, self.lightingColorValues_f_ptr, NUMBER_OF_LIGHTING_COLOR_CHANNELS);

      //Hook up our results to our interpolator for constant exposure variation
      self.exposureVariables.exposureCoefficientf = postObject.exposureCoefficientf;

      //Now re-attach our array for use in the renderer
      self.transferableSkyFinalLightingBuffer = postObject.meteringSurveyFloatArray.buffer;
    }

    return false;
  });

  this.initializeAutoExposure = async function(){
      const meteringTextureSize = self.renderers.meteringSurveyRenderer.meteringSurveyTextureSize;
      const numberOfPixelsInMeteringBuffer = meteringTextureSize * meteringTextureSize;
      const numberOfColorChannelsInMeteringPixel = 4;
      const groundColorRef = self.assetManager.data.skyLighting.groundColor;
      const groundColorArray = new Float32Array(3);
      groundColorArray[0] = groundColorRef.red / 255.0;
      groundColorArray[1] = groundColorRef.green / 255.0;
      groundColorArray[2] = groundColorRef.blue / 255.0;

      //Get the initial position of our sun and moon
      //and pass them into our metering survey
      Module._setSunAndMoonTimeTo(0.0);
      self.exposureVariables.sunPosition.fromArray(self.rotatedAstroPositions.slice(0, 3));
      self.exposureVariables.moonPosition.fromArray(self.rotatedAstroPositions.slice(3, 6));
      const sunYPos0 = self.rotatedAstroPositions[1];
      const moonYPos0 = self.rotatedAstroPositions[4];
      const sunRadius0 = Math.sin(self.renderers.sunRenderer.sunAngularRadiusInRadians * self.astronomicalLinearValues[1]);
      const moonRadius0 = Math.sin(self.renderers.moonRenderer.moonAngularRadiusInRadians * self.astronomicalLinearValues[3]);
      const sunIntensity0 = self.astronomicalLinearValues[0];
      const moonIntensity0 = self.astronomicalLinearValues[2];
      self.exposureVariables.sunHorizonFade = self.rotatedAstroDependentValues[0];
      self.exposureVariables.moonHorizonFade = self.rotatedAstroDependentValues[1];
      let skyRenderTarget = self.renderers.meteringSurveyRenderer.render(self.exposureVariables.sunPosition, self.exposureVariables.moonPosition, self.exposureVariables.sunHorizonFade, self.exposureVariables.moonHorizonFade);
      transferableSkyIntialLightingBuffer = new ArrayBuffer(BYTES_PER_32_BIT_FLOAT * numberOfPixelsInMeteringBuffer * numberOfColorChannelsInMeteringPixel);
      transferableIntialSkyLightingFloat32Array = new Float32Array(transferableSkyIntialLightingBuffer);
      self.renderer.readRenderTargetPixels(skyRenderTarget, 0, 0, meteringTextureSize, meteringTextureSize, transferableIntialSkyLightingFloat32Array);

      //Determine if our sun is the dominant light source when we start
      self.dominantLightIsSun0 = true;
      self.dominantLightY0 = sunYPos0;
      if(sunYPos0 < -sunRadius0){
        self.dominantLightIsSun0 = false;
        self.dominantLightY0 = moonYPos0;
      }

      //Get our position for the sun and moon 2 seconds from now
      Module._setSunAndMoonTimeTo(HALF_A_SECOND * self.speed);
      self.exposureVariables.sunPosition.fromArray(self.rotatedAstroPositions.slice(0, 3));
      self.exposureVariables.moonPosition.fromArray(self.rotatedAstroPositions.slice(3, 6));
      const sunYPosf = self.rotatedAstroPositions[1];
      const moonYPosf = self.rotatedAstroPositions[4];
      const sunRadiusf = Math.sin(self.renderers.sunRenderer.sunAngularRadiusInRadians * self.astronomicalLinearValues[1]);
      const moonRadiusf = Math.sin(self.renderers.moonRenderer.moonAngularRadiusInRadians * self.astronomicalLinearValues[3]);
      const sunIntensityf = self.astronomicalLinearValues[0];
      const moonIntensityf = self.astronomicalLinearValues[2];
      self.exposureVariables.sunHorizonFade = self.rotatedAstroDependentValues[0];
      self.exposureVariables.moonHorizonFade = self.rotatedAstroDependentValues[1];
      skyRenderTarget = self.renderers.meteringSurveyRenderer.render(self.exposureVariables.sunPosition, self.exposureVariables.moonPosition, self.exposureVariables.sunHorizonFade, self.exposureVariables.moonHorizonFade);
      self.transferableSkyFinalLightingBuffer = new ArrayBuffer(BYTES_PER_32_BIT_FLOAT * numberOfPixelsInMeteringBuffer * numberOfColorChannelsInMeteringPixel);
      self.transferableSkyFinalLightingFloat32Array = new Float32Array(transferableSkyIntialLightingBuffer);
      self.renderer.readRenderTargetPixels(skyRenderTarget, 0, 0, meteringTextureSize, meteringTextureSize, self.transferableSkyFinalLightingFloat32Array);

      //Get the look at target for our camera to see where we are looking
      const cameraLookAtTarget = new THREE.Vector3(self.camera.matrix[8], self.camera.matrix[9], self.camera.matrix[10]);
      this.previousCameraHeight = self.camera.position.y;
      this.previousCameraLookAtVector.set(cameraLookAtTarget.xyz);

      //Determine if our sun is the dominant light source when we end this interpolation
      self.dominantLightIsSunf = true;
      self.dominantLightYf = sunYPosf;
      if(sunYPosf < -sunRadiusf){
        self.dominantLightIsSunf = false;
        self.dominantLightYf = moonYPosf;
      }

      //Pass this information to our web worker to get our exposure value
      self.webAssemblyWorker.postMessage({
        eventType: self.EVENT_INITIALIZE_AUTOEXPOSURE,
        heightOfCamera: this.previousCameraHeight,
        hmdViewX: this.previousCameraLookAtVector.x,
        hmdViewZ: this.previousCameraLookAtVector.z,
        sunYPosition0: sunYPos0,
        sunYPositionf: sunYPosf,
        sunRadius0: sunRadius0,
        sunRadiusf: sunRadiusf,
        sunIntensity0: sunIntensity0,
        sunIntensityf: sunIntensityf,
        moonYPosition0: moonYPos0,
        moonYPositionf: moonYPosf,
        moonRadius0: moonRadius0,
        moonRadiusf: moonRadiusf,
        moonIntensity0: moonIntensity0,
        moonIntensityf: moonIntensityf,
        transmittanceTextureSize: self.atmosphereLUTLibrary.transmittanceTextureSize,
        meteringSurveyTextureSize: self.renderers.meteringSurveyRenderer.meteringSurveyTextureSize,
        meteringSurveyFloatArray0: transferableIntialSkyLightingFloat32Array,
        meteringSurveyFloatArrayf: self.transferableSkyFinalLightingFloat32Array,
        transmittanceTextureLUT: self.atmosphereLUTLibrary.transferableTransmittanceFloat32Array,
        groundColor: groundColorArray,
      }, [
        transferableSkyIntialLightingBuffer,
        self.transferableSkyFinalLightingBuffer,
        self.atmosphereLUTLibrary.transferrableTransmittanceBuffer,
        groundColorArray.buffer
      ]);
  }

  this.updateAutoExposure = function(deltaT){
    const meteringTextureSize = self.renderers.meteringSurveyRenderer.meteringSurveyTextureSize;

    Module._setSunAndMoonTimeTo(self.interpolationT + 2.0 * HALF_A_SECOND * self.speed);
    self.exposureVariables.sunPosition.fromArray(self.rotatedAstroPositions.slice(0, 3));
    self.exposureVariables.moonPosition.fromArray(self.rotatedAstroPositions.slice(3, 6));
    self.exposureVariables.sunHorizonFade = self.rotatedAstroDependentValues[0];
    self.exposureVariables.moonHorizonFade = self.rotatedAstroDependentValues[1];
    const sunYPosf = self.rotatedAstroPositions[1];
    const moonYPosf = self.rotatedAstroPositions[4];
    const sunRadiusf = Math.sin(self.renderers.sunRenderer.sunAngularRadiusInRadians * self.astronomicalLinearValues[1]);
    const moonRadiusf = Math.sin(self.renderers.moonRenderer.moonAngularRadiusInRadians * self.astronomicalLinearValues[3]);
    const sunIntensityf = self.astronomicalLinearValues[0];
    const moonIntensityf = self.astronomicalLinearValues[2];
    const renderTarget = self.renderers.meteringSurveyRenderer.render(self.exposureVariables.sunPosition, self.exposureVariables.moonPosition, self.exposureVariables.sunHorizonFade, self.exposureVariables.moonHorizonFade);
    self.transferableSkyFinalLightingFloat32Array = new Float32Array(self.transferableSkyFinalLightingBuffer);
    self.renderer.readRenderTargetPixels(renderTarget, 0, 0, meteringTextureSize, meteringTextureSize, self.transferableSkyFinalLightingFloat32Array);

    //Once we know what the final estimated position will be, we determine if the final dominant light will be the sun
    //or not
    self.dominantLightIsSunf = true;
    self.dominantLightYf = sunYPosf;
    if(sunYPosf < -sunRadiusf){
      self.dominantLightIsSunf = false;
      self.dominantLightYf = moonYPosf;
    }

    //Just use the current cameras position as an estimate for where the camera will be in 0.5 seconds
    self.camera.getWorldDirection( self.currentCameraLookAtTarget );

    //Pass this information to our web worker to get our exposure value
    //This is a dummy post for above
    self.webAssemblyWorker.postMessage({
      eventType: self.EVENT_UPDATE_AUTOEXPOSURE,
      sunYPositionf: sunYPosf,
      moonYPositionf: moonYPosf,
      sunRadiusf: sunRadiusf,
      moonRadiusf: moonRadiusf,
      sunIntensityf: sunIntensityf,
      moonIntensityf: moonIntensityf,
      heightOfCamera: 2.0 * self.camera.position.y - self.previousCameraHeight,
      hmdViewX: self.currentCameraLookAtTarget.x,
      hmdViewZ: self.currentCameraLookAtTarget.z,
      meteringSurveyFloatArrayf: self.transferableSkyFinalLightingFloat32Array
    }, [self.transferableSkyFinalLightingBuffer]);
  }

  this.renderers = {};

  this.start = function(){
    //Update our tick and tock functions
    parentComponent.tick = function(time, timeDelta){
      //Run our interpolation engine
      self.tick(time, timeDelta);

      //Update all of our renderers
      self.renderers.atmosphereRenderer.firstTick();
      self.renderers.sunRenderer.firstTick();
      self.renderers.moonRenderer.firstTick();

      self.setupNextTick();
    }
    parentComponent.initialized = true;
  }

  this.setupNextTick = function(){
    parentComponent.tick = function(time, timeDelta){
      //Run our interpolation engine
      self.tick(time, timeDelta);

      //Update all of our renderers
      self.renderers.atmosphereRenderer.tick(time);
      self.renderers.sunRenderer.tick(time);
      self.renderers.moonRenderer.tick(time);
    }
  }

  if(document.readyState === "complete" || document.readyState === "loaded"){
    //Grab all of our assets
    self.assetManager = new StarrySky.AssetManager(self);
  }
  else{
    window.addEventListener('DOMContentLoaded', function(){
      //Grab all of our assets
      self.assetManager = new StarrySky.AssetManager(self);
    });
  }

  //
  //These hooks are here as user functions because users may wish to
  //disable atmospheric perspective.
  //
  this.disableAtmosphericPerspective = function(){
    self.assetManager.data.atmosphericPerspectiveEnabled = false;
  }

  this.enableAtmosphericPerspective = function(){
    self.assetManager.data.atmosphericPerspectiveEnabled = true;
  }

  function onRuntimeInitialized() {
      self.skyInterpolatorWASMIsReady = true;
      self.initializeSkyDirectorWebWorker();
  }
  Module['onRuntimeInitialized'] = onRuntimeInitialized;
}

//Create primitive data associated with this, based off a-sky
//https://github.com/aframevr/aframe/blob/master/src/extras/primitives/primitives/a-sky.js
AFRAME.registerPrimitive('a-starry-sky', AFRAME.utils.extendDeep({}, AFRAME.primitives.getMeshMixin(), {
  // Preset default components. These components and component properties will be attached to the entity out-of-the-box.
  defaultComponents: {
    starryskywrapper: {}
  }
}));

AFRAME.registerComponent('starryskywrapper', {
  defaultValues: StarrySky.DefaultData,
  skyDirector: null,
  initialized: false,
  init: function(){
    this.skyDirector = new StarrySky.SkyDirector(this, this.el.getAttribute('web-worker-src'));
  },
  tick: function(time, timeDelta){
    /*Do Nothing*/
  }
});
