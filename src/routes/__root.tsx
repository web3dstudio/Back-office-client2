import { Outlet, createRootRoute } from '@tanstack/react-router'
// import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import MUIWrapper from '../utils/MUIWrapper'
import QueryClientWrapper from '../utils//QueryClientWrapper'
import { ToastContainer } from 'react-toastify'
import useAuthInitializer from '../hooks/useAuthInitializer'

export const Route = createRootRoute({
  component: Root,
})

function Root() {
  useAuthInitializer()
  return (
    <>
      <QueryClientWrapper>
        <MUIWrapper>
          <ToastContainer
            position='bottom-right'
            autoClose={5000}
            hideProgressBar={true}
            newestOnTop={false}
            closeOnClick={false}
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme='light'
          />
          <Outlet />
          {/* <TanStackRouterDevtools /> */}
        </MUIWrapper>
      </QueryClientWrapper>
    </>
  )
}
