
import { Box } from '@mui/material'
import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_public')({
  component: Layout,
})

// layout for login page
function Layout() {
  return (
    <>
      <Box
        sx={[
          (theme) => ({
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.palette.grey[100],
            ...theme.applyStyles('dark', {
              backgroundColor: theme.palette.background.default,
            })
          }),
        ]}
      >
        <Outlet />
      </Box>
    </>
  )
}
