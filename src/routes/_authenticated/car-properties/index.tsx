import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/car-properties/')({
  component: () => <div>Hello /_authenticated/car-properties/!</div>,
})
