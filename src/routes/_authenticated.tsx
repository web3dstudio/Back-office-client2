import { Outlet, createFileRoute, redirect, useNavigate, useRouterState } from '@tanstack/react-router'
import Logo from '../assets/logo.png'
import { useAuthStore } from '../store/authStore'
import AppChangeLanguage from '../components/AppChangeLanguage'
import {
  AppBar,
  Box,
  Drawer,
  Toolbar,
  useTheme,
  Divider
} from '@mui/material'
import MainNavTabs from '../components/MainNavTabs'
import ClientSupport from '../components/ClientSupport'
import ProfileMenu from '../components/ProfileMenu'
import AppSettings from '../components/AppSettings'
import { useCurrentUserQuery } from '../query/user.query'
import { useEffect } from 'react'



export const Route = createFileRoute('/_authenticated')({
  component: Layout,
  beforeLoad: ({ location }) => {
    const isAuthenticated = useAuthStore.getState().isAuthenticated
    console.log('beforeLoad isAuthenticated', isAuthenticated)
    if (!isAuthenticated) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      })
    }
  },
})

const drawerWidth = 130

// Layout for auth pages
export default function Layout() {
  const theme = useTheme()
  const navigate = useNavigate()
  const router = useRouterState()
  const { data: currentUserData } = useCurrentUserQuery()
  const shouldRedirectToDefaultPage = useAuthStore((state) => state.shouldRedirectToDefaultPage)
  const setShouldRedirectToDefaultPage = useAuthStore((state) => state.setShouldRedirectToDefaultPage)

  useEffect(() => {
    if (currentUserData?.defaultPage && shouldRedirectToDefaultPage) {
      const currentPath = router.location.pathname
      const defaultPage = currentUserData.defaultPage
      // Редирект если defaultPage установлен и отличается от текущего пути
      if (defaultPage && defaultPage !== currentPath) {
        setShouldRedirectToDefaultPage(false)
        navigate({ to: defaultPage as any })
      } else {
        setShouldRedirectToDefaultPage(false)
      }
    }
  }, [currentUserData, shouldRedirectToDefaultPage, navigate, router.location.pathname, setShouldRedirectToDefaultPage])


  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position='fixed'
        color='inherit'
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <img
              style={{
                width: '100%',
                height: 'auto',
              }}
              src={Logo}
              alt=''
            />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'end' }}>
            <AppSettings />
            <Divider orientation="vertical" sx={{ mx: 1 }} flexItem />
            <ProfileMenu />
            <ClientSupport />
            <Divider orientation="vertical" sx={{ mx: 1 }} flexItem />
            <AppChangeLanguage />
            {/* <ChangeLightDarkMode /> */}
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        variant='permanent'
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: `${theme.palette.primary.main}17`,
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <MainNavTabs userRole={currentUserData?.role ?? 0} />
        </Box>
      </Drawer>

      <Box component='main' sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  )
}
