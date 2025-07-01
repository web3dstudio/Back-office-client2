import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/advertisements/')({
  component: () => <div>Hello /_authenticated/advertisements/!</div>,
})
