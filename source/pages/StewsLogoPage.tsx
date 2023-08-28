import {
  PerspectiveGraphic,
  WorldPoint,
} from '../components/PerspectiveGraphic'

const PALETTE = {
  darkGreen: '#1B5E20',
}

export function StewsLogoPage() {
  return (
    <div
      style={{
        display: 'flex',
        maxInlineSize: 512,
      }}
    >
      <PerspectiveGraphic
        backgroundColor={'lightgrey'}
        graphicType={'circle'}
        cameraDepth={-8}
        lightDepth={100}
        perspectiveDepthFar={100}
        perspectiveDepthNear={0.1}
        perspectiveVerticalFieldOfViewAngle={(1.75 / 3) * Math.PI}
        someWorldPoints={getOrbitalPoints({
          orbitalResolution: 128,
          orbitalRadius: 5,
          ditherSize: 0.2,
          ditherColor: PALETTE.darkGreen,
          getPointDepthAngle: (pointStamp) =>
            (Math.PI / 1) * Math.sin(3 * (2 * Math.PI * pointStamp)) +
            Math.PI / 2,
          getPointSliceAngle: (pointStamp) => 2 * Math.PI * pointStamp,
          depthCosine: Math.cos,
          depthSine: Math.sin,
          sliceCosine: Math.cos,
          sliceSine: Math.sin,
        })}
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
