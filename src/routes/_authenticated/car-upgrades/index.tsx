import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/car-upgrades/')({
  component: () => <div>Hello /_authenticated/car-upgrades/!</div>,
})
