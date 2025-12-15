import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/catalog/edit/')({
  beforeLoad: () => {
    throw redirect({
      to: '/catalog',
    })
  },
})

