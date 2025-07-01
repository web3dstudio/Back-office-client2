import { createFileRoute } from '@tanstack/react-router'
import { toast } from 'react-toastify'

export const Route = createFileRoute('/_authenticated/codes/')({
  component: CodesPage,
})

function CodesPage() {
  return (
    <>
      <button onClick={() => toast.success('Wow so easy!')}>Notify!</button>
    </>
  )
}
