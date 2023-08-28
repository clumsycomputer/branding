import Color from 'color'
import { JSXInternal } from 'preact/src/jsx'

export type GenericWorldPoint = [...WorldPoint, ...Array<unknown>]

export type WorldPoint = [
  x: number,
  y: number,
  z: number,
  size: number,
  color: string
]

interface PerspectiveGraphicProps extends PerspectiveGraphicDataProps {
  graphicType: 'square' | 'circle'
}

export function PerspectiveGraphic(props: PerspectiveGraphicProps) {
  const { graphicType, ...dataProps } = props
  const SomePerspectiveGraphic =
    graphicType === 'circle'
      ? CirclePerspectiveGraphic
      : graphicType === 'square'
      ? SquarePerspectiveGraphic
      : throwInvalidPathError('PerspectiveGraphic.SomePerspectiveGraphic')
  return <SomePerspectiveGraphic {...dataProps} />
}

interface CirclePerspectiveGraphicProps extends PerspectiveGraphicDataProps {}

function CirclePerspectiveGraphic(props: CirclePerspectiveGraphicProps) {
  return (
    <PerspectiveGraphicBase
      GraphicPointDisplay={CirclePointGraphicDisplay}
      {...props}
    />
  )
}

function CirclePointGraphicDisplay(props: GraphicPointDisplayProps) {
  const { graphicPointX, graphicPointY, graphicPointSize, graphicPointColor } =
    props
  return (
    <circle
      cx={graphicPointX}
      cy={graphicPointY}
      r={graphicPointSize}
      fill={graphicPointColor}
    />
  )
}

interface SquarePerspectiveGraphicProps extends PerspectiveGraphicDataProps {}

function SquarePerspectiveGraphic(props: SquarePerspectiveGraphicProps) {
  return (
    <PerspectiveGraphicBase
      GraphicPointDisplay={SquarePointGraphicDisplay}
      {...props}
    />
  )
}

function SquarePointGraphicDisplay(props: GraphicPointDisplayProps) {
  const { graphicPointSize, graphicPointX, graphicPointY, graphicPointColor } =
    props
  const doubleGraphicPointSize = 2 * graphicPointSize
  return (
    <rect
      x={graphicPointX - graphicPointSize}
      y={graphicPointY - graphicPointSize}
      width={doubleGraphicPointSize}
      height={doubleGraphicPointSize}
      fill={graphicPointColor}
    />
  )
}

interface PerspectiveGraphicBaseProps
  extends PerspectiveGraphicDataProps,
    PerspectiveGraphicConfigProps {}

interface PerspectiveGraphicDataProps {
  backgroundColor: string
  cameraDepth: number
  perspectiveVerticalFieldOfViewAngle: number
  perspectiveDepthNear: number
  perspectiveDepthFar: number
  lightDepth: number
  someWorldPoints: Array<GenericWorldPoint>
}

interface PerspectiveGraphicConfigProps {
  GraphicPointDisplay: (props: GraphicPointDisplayProps) => JSXInternal.Element
}

type GraphicPoint = [...WorldPoint, number]

interface GraphicPointDisplayProps {
  graphicPointX: number
  graphicPointY: number
  graphicPointSize: number
  graphicPointColor: string
}

function PerspectiveGraphicBase(props: PerspectiveGraphicBaseProps) {
  const {
    someWorldPoints,
    cameraDepth,
    perspectiveDepthNear,
    perspectiveDepthFar,
    perspectiveVerticalFieldOfViewAngle,
    backgroundColor,
    GraphicPointDisplay,
    lightDepth,
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
              perspectivePointX,
              perspectivePointY,
              perspectivePointZ,
              perspectivePointSize,
              perspectivePointColor,
              perspectivePointDistance,
            ]) =>
              perspectivePointDistance >= perspectiveDepthNear &&
              perspectivePointDistance <= perspectiveDepthFar ? (
                <GraphicPointDisplay
                  graphicPointX={perspectivePointX / perspectivePointDistance}
                  graphicPointY={perspectivePointY / perspectivePointDistance}
                  graphicPointSize={
                    perspectivePointSize / perspectivePointDistance
                  }
                  graphicPointColor={perspectivePointColor}
                  // fill={new Color(perspectivePointColor)
                  //   .darken(perspectivePointDistance / lightDepth)
                  //   .string()}
                />
              ) : null
          )}
      </g>
    </svg>
  )
}

interface GetPerspectivePointsApi
  extends Pick<
    PerspectiveGraphicBaseProps,
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

function throwInvalidPathError(errorMessage: string): never {
  throw new Error(errorMessage)
}
