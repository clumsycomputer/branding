import {
  LOOP_ONE,
  LOOP_ZERO,
  LoopStructure,
  loopCosine,
  loopPoint,
  loopSine,
} from 'clumsy-math'
import {
  PerspectiveGraphic,
  WorldPoint,
} from '../components/PerspectiveGraphic'
import { Vector3, normalizedVector, rotatedVector } from '../library/Vector3'

const PALETTE = {
  darkGreen: '#2E7D32',
  darkOrange: '#FF8F00',
  yellow: '#FFD600',
}

export function StewsLogoPage() {
  const depthLoopStructureA: LoopStructure = [[0.99, LOOP_ONE, 0, 0, 0]]
  const sliceLoopStructureA: LoopStructure = [
    [0.675, LOOP_ONE, Math.PI / 2, 0, 0],
  ]
  const orbitalPointsA = getOrbitalPoints({
    ditherColor: 'black',
    orbitalResolution: 512,
    orbitalRadius: 11,
    ditherSize: 0.3,
    rotationOrientationAxis: normalizedVector([1, 0, 0]),
    rotationAngle: (Math.PI / 2) * 1.4,
    translationVector: [0, 9, -3],
    getPointDepthAngle: (pointStamp) =>
      (Math.PI / 24) * Math.sin(3 * 2 * Math.PI * pointStamp) + Math.PI / 2,
    getPointSliceAngle: (pointStamp) => 1 * 2 * Math.PI * pointStamp,
    // depthCosine: Math.cos,
    // depthSine: Math.sin,
    // sliceCosine: Math.cos,
    // sliceSine: Math.sin,
    depthCosine: (a) =>
      loopCosine(loopPoint(depthLoopStructureA, normalizedAngle(a))),
    depthSine: (a) =>
      loopSine(loopPoint(depthLoopStructureA, normalizedAngle(a))),
    sliceCosine: (a) =>
      loopCosine(loopPoint(sliceLoopStructureA, normalizedAngle(a))),
    sliceSine: (a) =>
      loopSine(loopPoint(sliceLoopStructureA, normalizedAngle(a))),
  })
  const depthLoopStructureB: LoopStructure = [[0.99, LOOP_ONE, 0, 0, 0]]
  const sliceLoopStructureB: LoopStructure = [
    [0.675, LOOP_ONE, Math.PI / 2, 0, 0],
  ]
  const orbitalPointsB = getOrbitalPoints({
    ditherColor: 'black',
    orbitalResolution: 512,
    orbitalRadius: 9,
    ditherSize: 0.3,
    rotationOrientationAxis: normalizedVector([1, 0, 0]),
    rotationAngle: (Math.PI / 2) * 0.75,
    translationVector: [0, 0, -3],
    getPointDepthAngle: (pointStamp) =>
      (Math.PI / 24) * Math.sin(3 * 2 * Math.PI * pointStamp) + Math.PI / 2,
    getPointSliceAngle: (pointStamp) => 1 * 2 * Math.PI * pointStamp,
    // depthCosine: Math.cos,
    // depthSine: Math.sin,
    // sliceCosine: Math.cos,
    // sliceSine: Math.sin,
    depthCosine: (a) =>
      loopCosine(loopPoint(depthLoopStructureB, normalizedAngle(a))),
    depthSine: (a) =>
      loopSine(loopPoint(depthLoopStructureB, normalizedAngle(a))),
    sliceCosine: (a) =>
      loopCosine(loopPoint(sliceLoopStructureB, normalizedAngle(a))),
    sliceSine: (a) =>
      loopSine(loopPoint(sliceLoopStructureB, normalizedAngle(a))),
  })
  const depthLoopStructureC: LoopStructure = [[0.99, LOOP_ONE, 0, 0, 0]]
  const sliceLoopStructureC: LoopStructure = [
    [0.675, LOOP_ONE, Math.PI / 2, 0, 0],
  ]
  const orbitalPointsC = getOrbitalPoints({
    ditherColor: 'black',
    orbitalResolution: 512,
    orbitalRadius: 10,
    ditherSize: 0.5,
    rotationOrientationAxis: normalizedVector([1, 0, 0]),
    rotationAngle: (Math.PI / 2) * 0,
    translationVector: [0, -14, -10],
    getPointDepthAngle: (pointStamp) =>
      (Math.PI / 24) * Math.sin(1 * 2 * Math.PI * pointStamp) + Math.PI / 2,
    getPointSliceAngle: (pointStamp) => 1 * 2 * Math.PI * pointStamp,
    // depthCosine: Math.cos,
    // depthSine: Math.sin,
    // sliceCosine: Math.cos,
    // sliceSine: Math.sin,
    depthCosine: (a) =>
      loopCosine(loopPoint(depthLoopStructureC, normalizedAngle(a))),
    depthSine: (a) =>
      loopSine(loopPoint(depthLoopStructureC, normalizedAngle(a))),
    sliceCosine: (a) =>
      loopCosine(loopPoint(sliceLoopStructureC, normalizedAngle(a))),
    sliceSine: (a) =>
      loopSine(loopPoint(sliceLoopStructureC, normalizedAngle(a))),
  })
  return (
    <div
      style={{
        display: 'flex',
        maxInlineSize: 512,
      }}
    >
      <PerspectiveGraphic
        backgroundColor={'white'}
        graphicType={'circle'}
        cameraDepth={-8}
        lightDepth={100}
        perspectiveDepthFar={100}
        perspectiveDepthNear={0.01}
        perspectiveVerticalFieldOfViewAngle={(1.75 / 3) * Math.PI}
        someWorldPoints={[
          ...orbitalPointsA,
          ...orbitalPointsB,
          ...orbitalPointsC,
        ]}
      />
    </div>
  )
}

type SphericalCoordinate = [
  radius: number,
  depthPlaneAngle: number,
  slicePlaneAngle: number
]

type PlaneComponentFunction = (someAngle: number) => number

type Point3 = [x: number, y: number, z: number]

function sphericalToCartesian(
  depthCosine: PlaneComponentFunction,
  depthSine: PlaneComponentFunction,
  sliceCosine: PlaneComponentFunction,
  sliceSine: PlaneComponentFunction,
  someSpherical: SphericalCoordinate
): Point3 {
  const currentDepthSine = depthSine(someSpherical[1])
  return [
    someSpherical[0] * currentDepthSine * sliceCosine(someSpherical[2]),
    someSpherical[0] * currentDepthSine * sliceSine(someSpherical[2]),
    someSpherical[0] * depthCosine(someSpherical[1]),
  ]
}

interface GetOrbitalPointsApi {
  depthCosine: PlaneComponentFunction
  depthSine: PlaneComponentFunction
  sliceCosine: PlaneComponentFunction
  sliceSine: PlaneComponentFunction
  orbitalResolution: number
  orbitalRadius: number
  ditherSize: number
  ditherColor: string
  getPointDepthAngle: (pointStamp: number) => number
  getPointSliceAngle: (pointStamp: number) => number
  rotationOrientationAxis: Vector3
  rotationAngle: number
  translationVector: Vector3
}

function getOrbitalPoints(api: GetOrbitalPointsApi): Array<WorldPoint> {
  const {
    orbitalResolution,
    rotationOrientationAxis,
    rotationAngle,
    depthCosine,
    depthSine,
    sliceCosine,
    sliceSine,
    orbitalRadius,
    getPointDepthAngle,
    getPointSliceAngle,
    translationVector,
    ditherSize,
    ditherColor,
  } = api
  const resultPoints: Array<WorldPoint> = []
  for (let pointIndex = 0; pointIndex < orbitalResolution; pointIndex++) {
    const pointStamp = pointIndex / orbitalResolution
    const basePoint = sphericalToCartesian(
      depthCosine,
      depthSine,
      sliceCosine,
      sliceSine,
      [
        orbitalRadius,
        getPointDepthAngle(pointStamp),
        getPointSliceAngle(pointStamp),
      ]
    )
    const rotatedPoint = rotatedVector(
      rotationOrientationAxis,
      rotationAngle,
      basePoint
    )
    const translatedPoint: Vector3 = [
      rotatedPoint[0] + translationVector[0],
      rotatedPoint[1] + translationVector[1],
      rotatedPoint[2] + translationVector[2],
    ]
    resultPoints.push([...translatedPoint, ditherSize, ditherColor])
  }
  return resultPoints
}

function normalizedAngle(someAngle: number) {
  return ((someAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
}
