import React, { Component, useRef, useMemo, useEffect } from 'react'

import { a } from 'react-spring/three'
import { useSpring } from 'react-spring'
import ReactDOM from 'react-dom'
import * as THREE from 'three'
import { MathUtils } from 'three/src/math/Math'
import { Canvas, extend, useThree, useRender } from 'react-three-fiber'
import DatGui, { DatColor, DatNumber } from '@tim-soft/react-dat-gui'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import generateHeight from './generateHeight'
import './styles.css'

extend({ OrbitControls })

const SCREEN_WIDTH = window.innerWidth
const SCREEN_HEIGHT = window.innerHeight
const VIEW_SIZE = 300
const ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT

function OrbitControlsComponent() {
  const ref = useRef()
  const { camera } = useThree()
  useRender(() => ref.current && ref.current.update())
  return <orbitControls ref={ref} args={[camera]} enableDamping dampingFactor={0.1} rotateSpeed={1} />
}

const getNewVertices = ({ widthDensity, depthDensity, mountainVariation, geometrySize, heightMultiplier }) => {
  const data = generateHeight(widthDensity, depthDensity, mountainVariation)

  const geometry = new THREE.PlaneBufferGeometry(geometrySize, geometrySize, widthDensity - 1, depthDensity - 1)
  geometry.rotateX(-Math.PI / 2)
  const vertices = geometry.attributes.position.array

  const updatedVertices = []

  for (let i = 0, j = 0, l = vertices.length; i < l; i++, j += 3) {
    vertices[j + 1] = data[i] * heightMultiplier
    updatedVertices.push(vertices[i])
  }

  return updatedVertices
}

function Dots() {

  // const vertices = useMemo(() => {
  //   return getNewVertices({ geometrySize, widthDensity, depthDensity, heightMultiplier, mountainVariation })
  // }, [geometrySize, widthDensity, depthDensity, heightMultiplier, mountainVariation])

  // My goal is to use Spring to interpolate between different 'mountain variations'
  // perhaps factor here could be
  // const { factor } = useSpring({
  //   config: { mass: 5, tension: 500, friction: 40 },
  //   from: { factor: getNewVertices({ geometrySize, widthDensity, depthDensity, heightMultiplier, mountainVariation: 0 }) },
  //   to: async next => {
  //     while (true) {
  //       await next({ factor: getNewVertices({ geometrySize, widthDensity, depthDensity, heightMultiplier, mountainVariation: 1 }) })
  //       await next({ factor: getNewVertices({ geometrySize, widthDensity, depthDensity, heightMultiplier, mountainVariation: 2 }) })
  //     }
  //   }
  // })

  const geometry = new THREE.BufferGeometry();
  // const renderer = new THREE.WebGLRenderer();

  const fov = 75;
  const aspect = 2;  // the canvas default
  const near = 0.1;
  const far = 100;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

  // const scene = new THREE.Scene();

  const vertices = [];
  const colors = [];
  const sizes = [];
  const hexa = Math.floor(Math.random()*16777215).toString(16);

  for (let i = 0; i < 5000; i++) {

    //vertices
    const x = THREE.Math.randFloatSpread(5000);
    const y = THREE.Math.randFloatSpread(5000);
    const z = THREE.Math.randFloatSpread(5000);

    vertices.push(x, y, z);

    //colors
    const vx = THREE.Math.randInt(0, 1);
    const vy = THREE.Math.randInt(0, 1);
    const vz = THREE.Math.randInt(0, 1);

    colors.push(vx, vy, vz);

    const size = THREE.Math.randInt(5, 50);

    sizes.push(size);

  }
  console.log("WOOW! ", vertices);
  console.log("WAAW! ", colors);
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('color', new THREE.Uint8BufferAttribute(colors, 3));
  geometry.computeBoundingBox();

  const material = new THREE.PointsMaterial({ size: 10, vertexColors:true, toneMapped:false  });

  const points = new THREE.Points(geometry, material);

  // itemSize = 3 because there are 3 values (components) per vertex
  // geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
  // const material = new THREE.MeshBasicMaterial( { color: dotColor} );
  // const mesh = new THREE.Mesh( geometry, material );

  useEffect(() => {
    if (vertices) {
      console.log("What is that ?" + '\n', vertices)
      console.log("and this ?" + '\n', colors)
      // while (42) {

      //   const x = THREE.Math.randFloatSpread( 2000 );
      //   const y = THREE.Math.randFloatSpread( 2000 );
      //   const z = THREE.Math.randFloatSpread( 2000 );

      //   vertices.push( x, y, z );

      // }
    }
  }, [vertices, colors])

  return (
    <points
      geometry={geometry}
      material={material}
    >
      <bufferGeometry attach="geometry">
        <a.bufferAttribute
          attachObject={['attributes', 'position']}
          count={vertices.length / 3}
          // this renders the dots fine
          array={new Float32Array(vertices)}
          // but I can't get the interpolated values to work
          // might be because bufferAttribute must accept a typed array?
          // array={new Float32Array(factor)}
          itemSize={3}
          onUpdate={self => {
            self.needsUpdate = true
            self.verticesNeedUpdate = true
          }}
        />
        <a.bufferAttribute
          attachObject={['attributes', 'color']}
          count={colors.length / 3}
          // this renders the dots fine
          array={new Uint8Array(colors)}
          // but I can't get the interpolated values to work
          // might be because bufferAttribute must accept a typed array?
          // array={new Float32Array(factor)}
          itemSize={3}
          onUpdate={self => {
            self.needsUpdate = true
            self.verticesNeedUpdate = true
          }}
        />
      </bufferGeometry>

      {/* <pointsMaterial size={100} /> */}
    </points>
  )
}

class App extends Component {
  state = {
    data: {
      dotSize: 5,
      dotColor: '#000000',
      geometrySize: 1000,
      depthDensity: 140,
      widthDensity: 140,
      heightMultiplier: 5,
      mountainVariation: 0
    }
  }

  handleUpdate = newData =>
    this.setState(prevState => ({
      data: { ...prevState.data, ...newData }
    }))

  render() {
    const { data } = this.state

    return (
      <>
        <Canvas
          ref={this.ref}
          camera={{
            fov: 75,
            // left: (-ASPECT * VIEW_SIZE) / 2,
            // right: (ASPECT * VIEW_SIZE) / 2,
            // top: VIEW_SIZE / 2,
            // bottom: -VIEW_SIZE / 2,
            // near: -20000,
            // far: 20000,
            zoom: 1
          }}
          orthographic
          antialias={false}>
          <OrbitControlsComponent />

          <Dots />
        </Canvas>
        {/* 
        <DatGui data={data} onUpdate={this.handleUpdate} className="react-dat-gui-relative-position">
          <DatNumber path="dotSize" label="dotSize" min={0.1} max={3} step={0.01} />
          <DatNumber path="geometrySize" label="geometrySize" min={1000} max={10000} step={10} />
          <DatNumber path="depthDensity" label="depthDensity" min={32} max={512} step={64} />
          <DatNumber path="widthDensity" label="widthDensity" min={32} max={512} step={64} />
          <DatNumber path="heightMultiplier" label="heightMultiplier" min={1} max={50} step={1} />
          <DatNumber path="mountainVariation" label="mountainVariation" min={0} max={50} step={1} />
          <DatColor path="dotColor" label="dotColor" />
        </DatGui> */}
        {/* <p style={{ position: 'fixed', bottom: 0 }}>You can use orbit controls</p> */}
      </>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('root'))
