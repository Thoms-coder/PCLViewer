import React, { Component, useRef, useEffect, useState } from 'react'
import { a } from 'react-spring/three'
import ReactDOM from 'react-dom'
import * as THREE from 'three'
import { Canvas, extend, useThree, useRender } from 'react-three-fiber'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import './styles.css'

extend({ OrbitControls })


function OrbitControlsComponent() {
  const ref = useRef()
  const { camera } = useThree()
  useRender(() => ref.current && ref.current.update())
  return <orbitControls ref={ref} args={[camera]} enableDamping dampingFactor={0.1} rotateSpeed={1} />
}

function randColor() {
  let color;
  const getRgb = () => Math.floor(Math.random() * 256);

  const rgbToHex = (r, g, b) =>
    '#' +
    [r, g, b]
      .map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      })
      .join('');

  color = {
    r: getRgb(),
    g: getRgb(),
    b: getRgb(),
  };
  return (rgbToHex(color.r, color.g, color.b));
}

function Dots() {

  const geometry = new THREE.BufferGeometry();
  const points = 10000;
  // const points = THREE.Math.randInt(0, 100000);
  const [number, setNumber] = useState(0);

  let tab = [];
  let col = [];
  // let randx = 0;
  // let randy = 0;
  // let randz = 0;
  for (let i = 0; i < points; i++) {
    
    //vertices
    const x = THREE.Math.randFloatSpread(points);
    const y = THREE.Math.randFloatSpread(points);
    const z = THREE.Math.randFloatSpread(points);
    
    tab.push(x, y, z);

    let randx = THREE.Math.randInt(0, 1);
    let randy = THREE.Math.randInt(0, 1);
    let randz = THREE.Math.randInt(0, 1);

    col.push(randx, randy, randz);
  }
  console.log("b attrib pos", geometry.getAttribute('position'))
  console.log("b attrib col", geometry.getAttribute('color'))
  geometry.removeAttribute('position');
  geometry.removeAttribute('color');
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(tab, 3));
  geometry.setAttribute('color', new THREE.Uint8BufferAttribute(col, 3));
  console.log("a attrib pos", geometry.getAttribute('position'))
  console.log("a attrib col", geometry.getAttribute('color'))
  console.log("END")

  const material = new THREE.PointsMaterial({ size: 10, vertexColors: true, toneMapped: false });

  // const handleKeyUp = (e) => {
  //   if (e.key === "Enter") {
  //     let tab = [];
  //     let col = [];
  //     let randx = THREE.Math.randInt(0, 1);
  //     let randy = THREE.Math.randInt(0, 1);
  //     let randz = THREE.Math.randInt(0, 1);
  //     for (let i = 0; i < 5000; i++) {

  //       //vertices
  //       const x = THREE.Math.randFloatSpread(5000);
  //       const y = THREE.Math.randFloatSpread(5000);
  //       const z = THREE.Math.randFloatSpread(5000);

  //       tab.push(x, y, z);
  //       col.push(0, 0, 0);
  //       col.push(randx, randy, randz);
  //     }
  //     console.log("b attrib pos", geometry.getAttribute('position'))
  //     console.log("b attrib col", geometry.getAttribute('color'))
  //     geometry.removeAttribute('position');
  //     geometry.removeAttribute('color');
  //     geometry.setAttribute('position', new THREE.Float32BufferAttribute(tab, 3));
  //     geometry.setAttribute('color', new THREE.Uint8BufferAttribute(col, 3));
  //     console.log("a attrib pos", geometry.getAttribute('position'))
  //     console.log("a attrib col", geometry.getAttribute('color'))
  //     console.log("END") 
  //   }
  // };
  // document.body.addEventListener('keyup', handleKeyUp);

  useEffect(() => {
    setNumber(number + 1);
  }, [number])


  return (
    <points
      geometry={geometry}
      material={material}
    >
      <bufferGeometry>
        <a.bufferAttribute
          attachObject={['attributes', 'position']}
          count={geometry.getAttribute('position').array.length}
          array={new Float32Array(geometry.getAttribute('position').array)}
          itemSize={3}
        // onUpdate={self => {
        //   self.needsUpdate = true
        //   self.verticesNeedUpdate = true
        // }}
        />
        <a.bufferAttribute
          attachObject={['attributes', 'color']}
          count={geometry.getAttribute('color').array.length}
          array={new Uint8Array(geometry.getAttribute('color').array)}
          itemSize={3}
        // onUpdate={self => {
        //   self.needsUpdate = true
        //   self.verticesNeedUpdate = true
        // }}
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

    return (
      <>
        <Canvas
          style={{ backgroundColor: randColor() }}
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
        </Canvas >
      </>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('root'))
