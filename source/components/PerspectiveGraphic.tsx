import Color from 'color'

export interface PerspectiveGraphicProps {
  cameraDepth: number
  perspectiveVerticalFieldOfViewAngle: number
  perspectiveDepthNear: number
  perspectiveDepthFar: number
  lightDepth: number
  someWorldPoints: Array<GenericWorldPoint>
  backgroundColor?: string
}

export interface ViewRectangle {
  x: number
  y: number
  width: number
  height: number
}

export type WorldPoint = [
  x: number,
  y: number,
  z: number,
  size: number,
  color: string
]

export type GenericWorldPoint = [...WorldPoint, ...Array<unknown>]

type GraphicPoint = [...WorldPoint, number]

export function PerspectiveGraphic(props: PerspectiveGraphicProps) {
  const {
    someWorldPoints,
    cameraDepth,
    perspectiveDepthNear,
    perspectiveDepthFar,
    perspectiveVerticalFieldOfViewAngle,
    lightDepth,
    backgroundColor = 'black',
  } = props
  const { perspectivePoints } = getPerspectivePoints({
    someWorldPoints,
    cameraDepth,
    perspectiveDepthNear,
    perspectiveDepthFar,
    perspectiveVerticalFieldOfViewAngle,
  })
  const viewRectangle = { x: -1, y: -1, width: 2, height: 2 }
  return (
    <svg
      viewBox={`${viewRectangle.x} ${viewRectangle.y} ${viewRectangle.width} ${viewRectangle.height}`}
    >
      <g transform={'scale(1,-1)'}>
        <rect
          x={viewRectangle.x}
          y={viewRectangle.y}
          width={viewRectangle.width}
          height={viewRectangle.height}
          fill={backgroundColor}
        />
        {perspectivePoints
          .sort((pointA, pointB) => pointA[2] - pointB[2])
          .map(
            ([
              perspectiveCellX,
              perspectiveCellY,
              perspectiveCellZ,
              perspectiveCellSize,
              perspectiveCellColor,
              perspectiveCellDistance,
            ]) => {
              const graphicCellSize =
                perspectiveCellSize / perspectiveCellDistance
              return perspectiveCellDistance >= perspectiveDepthNear &&
                perspectiveCellDistance <= perspectiveDepthFar ? (
                <circle
                  cx={perspectiveCellX / perspectiveCellDistance}
                  cy={perspectiveCellY / perspectiveCellDistance}
                  r={graphicCellSize}
                  fill={new Color(perspectiveCellColor)
                    .darken(perspectiveCellDistance / lightDepth)
                    .string()}
                />
              ) : null
            }
          )}
      </g>
    </svg>
  )
}

interface GetPerspectivePointsApi
  extends Pick<
    PerspectiveGraphicProps,
    | 'cameraDepth'
    | 'perspectiveDepthNear'
    | 'perspectiveDepthFar'
    | 'perspectiveVerticalFieldOfViewAngle'
    | 'someWorldPoints'
  > {}

function getPerspectivePoints(api: GetPerspectivePointsApi) {
  const {
    someWorldPoints,
    cameraDepth,
    perspectiveDepthNear,
    perspectiveDepthFar,
    perspectiveVerticalFieldOfViewAngle,
  } = api
  const verticalFieldOfViewScalar =
    1 / Math.tan(perspectiveVerticalFieldOfViewAngle / 2)
  const perspectiveScalarX = verticalFieldOfViewScalar
  const perspectiveScalarY = verticalFieldOfViewScalar
  const perspectiveScalarSize = verticalFieldOfViewScalar
  const perspectiveDepthDelta = perspectiveDepthNear - perspectiveDepthFar
  const perspectiveScalarZ = -(
    (perspectiveDepthFar + perspectiveDepthNear) /
    perspectiveDepthDelta
  )
  const perspectiveTranslationZ = -(
    (2 * perspectiveDepthFar * perspectiveDepthNear) /
    perspectiveDepthDelta
  )
  const perspectiveScalarDistance = -1
  const resultPerspectivePoints: Array<GraphicPoint> = []
  for (let pointIndex = 0; pointIndex < someWorldPoints.length; pointIndex++) {
    resultPerspectivePoints.push(
      getPerspectivePoint(
        cameraDepth,
        perspectiveScalarX,
        perspectiveScalarY,
        perspectiveScalarZ,
        perspectiveTranslationZ,
        perspectiveScalarSize,
        perspectiveScalarDistance,
        someWorldPoints[pointIndex]!
      )
    )
  }
  return {
    perspectivePoints: resultPerspectivePoints,
  }
}

function getPerspectivePoint(
  cameraDepth: GetPerspectivePointsApi['cameraDepth'],
  perspectiveScalarX: number,
  perspectiveScalarY: number,
  perspectiveScalarZ: number,
  perspectiveTranslationZ: number,
  perspectiveScalarSize: number,
  perspectiveScalarDistance: number,
  someWorldPoint: GetPerspectivePointsApi['someWorldPoints'][number]
): GraphicPoint {
  const pointResult: GraphicPoint = [
    someWorldPoint[0],
    someWorldPoint[1],
    someWorldPoint[2],
    someWorldPoint[3],
    someWorldPoint[4],
    1,
  ]
  pointResult[2] = pointResult[2] + cameraDepth
  const cameraCellZ = pointResult[2]
  pointResult[0] = perspectiveScalarX * pointResult[0]
  pointResult[1] = perspectiveScalarY * pointResult[1]
  pointResult[2] = perspectiveScalarZ * pointResult[2] + perspectiveTranslationZ
  pointResult[3] = perspectiveScalarSize * pointResult[3]
  pointResult[5] = perspectiveScalarDistance * cameraCellZ
  return pointResult
}
