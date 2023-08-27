import {
  PerspectiveGraphic,
  WorldPoint,
} from '../components/PerspectiveGraphic'

export function StewsLogoPage() {
  const sphereResolution = 6
  const spherePoints: Array<WorldPoint> = []
  for (let depthIndex = 0; depthIndex < sphereResolution; depthIndex++) {
    const depthAngle = ((2 * Math.PI) / sphereResolution) * depthIndex
    if (depthIndex > 2) continue
    for (let sliceIndex = 0; sliceIndex < sphereResolution; sliceIndex++) {
      const sliceAngle = ((2 * Math.PI) / sphereResolution) * sliceIndex
      spherePoints.push([
        ...sphericalToCartesian(Math.cos, Math.sin, Math.cos, Math.sin, [
          5,
          depthAngle,
          sliceAngle,
        ]),
        0.6,
        'black',
      ])
    }
  }
  return (
    <div
      style={{
        display: 'flex',
        maxInlineSize: 512,
      }}
    >
      <PerspectiveGraphic
        cameraDepth={-8}
        lightDepth={100}
        perspectiveDepthFar={100}
        perspectiveDepthNear={0.1}
        perspectiveVerticalFieldOfViewAngle={(1.75 / 3) * Math.PI}
        someWorldPoints={spherePoints}
        backgroundColor={'lightgrey'}
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
