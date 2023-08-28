import {
  PerspectiveGraphic,
  WorldPoint,
} from '../components/PerspectiveGraphic'

const PALETTE = {
  darkGreen: '#2E7D32',
  darkOrange: '#FF8F00',
  yellow: '#FFD600',
}

export function StewsLogoPage() {
  const orbitalPointsA = getOrbitalPoints({
    orbitalResolution: 90,
    orbitalRadius: 6,
    ditherSize: 0.3,
    ditherColor: PALETTE.darkGreen,
    getPointDepthAngle: (pointStamp) =>
      (Math.PI / 2.75) * Math.sin(3 * (2 * Math.PI * pointStamp)) + Math.PI / 7,
    getPointSliceAngle: (pointStamp) => 2 * Math.PI * pointStamp,
    depthCosine: Math.cos,
    depthSine: Math.sin,
    sliceCosine: Math.cos,
    sliceSine: Math.sin,
  })
  const orbitalPointsB = getOrbitalPoints({
    orbitalResolution: 60,
    orbitalRadius: 6,
    ditherSize: 0.3375,
    ditherColor: PALETTE.darkOrange,
    getPointDepthAngle: (pointStamp) =>
      (Math.PI / 1.5) * Math.sin(9 * (2 * Math.PI * pointStamp)) + Math.PI / 4,
    getPointSliceAngle: (pointStamp) => 2 * Math.PI * pointStamp,
    depthCosine: Math.cos,
    depthSine: Math.sin,
    sliceCosine: Math.cos,
    sliceSine: Math.sin,
  })
  const orbitalPointsC = getOrbitalPoints({
    orbitalResolution: 40,
    orbitalRadius: 6,
    ditherSize: 0.4,
    ditherColor: PALETTE.yellow,
    getPointDepthAngle: (pointStamp) =>
      (Math.PI / 1.25) * Math.sin(81 * (2 * Math.PI * pointStamp)) +
      Math.PI / 2,
    getPointSliceAngle: (pointStamp) => 2 * Math.PI * pointStamp,
    depthCosine: Math.cos,
    depthSine: Math.sin,
    sliceCosine: Math.cos,
    sliceSine: Math.sin,
  })
  return (
    <div
      style={{
        display: 'flex',
        maxInlineSize: 128,
      }}
    >
      <PerspectiveGraphic
        backgroundColor={'white'}
        graphicType={'circle'}
        cameraDepth={-8}
        lightDepth={100}
        perspectiveDepthFar={100}
        perspectiveDepthNear={0.1}
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
}

function getOrbitalPoints(api: GetOrbitalPointsApi): Array<WorldPoint> {
  const {
    orbitalResolution,
    depthCosine,
    depthSine,
    sliceCosine,
    sliceSine,
    orbitalRadius,
    getPointDepthAngle,
    getPointSliceAngle,
    ditherSize,
    ditherColor,
  } = api
  const resultPoints: Array<WorldPoint> = []
  for (let pointIndex = 0; pointIndex < orbitalResolution; pointIndex++) {
    const pointStamp = pointIndex / orbitalResolution
    resultPoints.push([
      ...sphericalToCartesian(depthCosine, depthSine, sliceCosine, sliceSine, [
        orbitalRadius,
        getPointDepthAngle(pointStamp),
        getPointSliceAngle(pointStamp),
      ]),
      ditherSize,
      ditherColor,
    ])
  }
  return resultPoints
}
