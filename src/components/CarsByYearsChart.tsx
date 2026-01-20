import * as React from 'react'
import { useTheme, styled } from '@mui/material/styles'
import { BarChart } from '@mui/x-charts/BarChart'
import { useAnimate, useAnimateBar, useDrawingArea } from '@mui/x-charts/hooks'
import { interpolateObject } from '@mui/x-charts-vendor/d3-interpolate'
import Box from '@mui/material/Box'
import type { TCarsByYears } from '../types'

interface Props {
  data: TCarsByYears[]
}

const Text = styled('text')(({ theme }) => ({
  ...theme?.typography?.body2,
  stroke: 'none',
  fill: (theme.vars || theme).palette.common.white,
  transition: 'opacity 0.2s ease-in, fill 0.2s ease-in',
  textAnchor: 'start',
  dominantBaseline: 'central',
  pointerEvents: 'none',
  fontWeight: 600,
}))

function BarLabelAtBase(props: any) {
  const {
    seriesId,
    dataIndex,
    color,
    isFaded,
    isHighlighted,
    classes,
    xOrigin,
    yOrigin,
    x,
    y,
    width,
    height,
    layout,
    skipAnimation,
    ...otherProps
  } = props

  const animatedProps = useAnimate(
    { x: xOrigin + 8, y: y + height / 2 },
    {
      initialProps: { x: xOrigin, y: y + height / 2 },
      createInterpolator: interpolateObject,
      transformProps: (p) => p,
      applyProps: (element: SVGTextElement, p) => {
        element.setAttribute('x', p.x.toString())
        element.setAttribute('y', p.y.toString())
      },
      skip: skipAnimation,
    },
  )

  return <Text {...otherProps} {...animatedProps} />
}

export function BarShadedBackground(props: any) {
  const { ownerState, skipAnimation, id, dataIndex, xOrigin, yOrigin, ...other } = props
  const theme = useTheme()

  const animatedProps = useAnimateBar(props)
  const { width } = useDrawingArea()
  return (
    <React.Fragment>
      <rect
        {...other}
        fill={(theme.vars || theme).palette.text.primary}
        opacity={theme.palette.mode === 'dark' ? 0.05 : 0.1}
        x={other.x}
        width={width}
      />
      <rect
        {...other}
        fill={theme.palette.primary.main}
        filter={ownerState.isHighlighted ? 'brightness(120%)' : undefined}
        opacity={ownerState.isFaded ? 0.3 : 1}
        data-highlighted={ownerState.isHighlighted || undefined}
        data-faded={ownerState.isFaded || undefined}
        {...animatedProps}
      />
    </React.Fragment>
  )
}

export default function CarsByYearsChart({ data }: Props) {
  const dataset = data.map((item) => ({
    year: item.year.toString(),
    items: item.items,
  }))

  return (
    <Box width="100%">
      <BarChart
        height={900}
        dataset={dataset}
        series={[
          {
            id: 'items',
            dataKey: 'items',
            valueFormatter: (value: number | null) => String(value ?? 0),
          },
        ]}
        layout="horizontal"
        xAxis={[
          {
            id: 'items',
            min: 0,
            valueFormatter: (value: number) => String(Math.round(value)),
          },
        ]}
        barLabel={(v) => String(v.value)}
        yAxis={[
          {
            scaleType: 'band',
            dataKey: 'year',
            width: 60,
          },
        ]}
        slots={{
          barLabel: BarLabelAtBase,
          bar: BarShadedBackground,
        }}
      />
    </Box>
  )
}
