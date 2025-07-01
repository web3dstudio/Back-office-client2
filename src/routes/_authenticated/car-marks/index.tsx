import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/car-marks/')({
  component: () => <div>Hello /_authenticated/car-marks/!</div>,
})
