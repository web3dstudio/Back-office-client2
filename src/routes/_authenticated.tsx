import { createFileRoute } from '@tanstack/react-router'


export const Route = createFileRoute('/_authenticated')({
  component: Layout,
})


// Layout for auth pages
export default function Layout() {


  return (<></>)

}
