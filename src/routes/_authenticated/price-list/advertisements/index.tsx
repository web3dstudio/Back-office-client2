import { createFileRoute, Navigate } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_authenticated/price-list/advertisements/',
)({
  component: AdvertisementsPage,
})

function AdvertisementsPage() {
  return <Navigate to="/price-list/advertisements/layouts" replace />
}


