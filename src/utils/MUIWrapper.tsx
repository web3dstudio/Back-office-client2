/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useMemo, useState } from 'react'

import {
  type PaletteMode,
  createTheme,
  useMediaQuery,
  ThemeProvider,
  type Direction,
} from '@mui/material'
import rtlPlugin from 'stylis-plugin-rtl'
import { prefixer } from 'stylis'
import { CacheProvider } from '@emotion/react'
import createCache from '@emotion/cache'
import { CssBaseline } from '@mui/material'
import { useLocalStorage } from '../hooks/useLocalStorage'
import i18next from '../i18next'
import { ColorModeContext } from './ColorModeContext'

// Create rtl cache
const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
})

const emptyCache = createCache({
  key: 'meaningless-key',
})

export default function MUIWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const [clientMode, setClientMode] = useLocalStorage('theme', 'light')
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
  const [mode, setMode] = useState<PaletteMode>('light')
  const clientDir = i18next.dir()

  const [direction, setDirection] = useState<Direction>(clientDir)

  useEffect(() => {
    if (!clientMode || clientMode === 'system') {
      setMode(prefersDarkMode ? 'dark' : 'light')
    } else {
      setMode(clientMode)
    }
  }, [clientMode, prefersDarkMode])

  const theme = useMemo(
    () =>
      createTheme({
        direction: direction,
        palette: {
          mode: mode === 'dark' ? 'dark' : 'light',
        },
        typography: {
          fontFamily:
            'Rubik, Poppins, -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          fontSize: 14,
        },
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              '@global': {
                'input:-webkit-autofill': {
                  WebkitBoxShadow: '0 0 0 1000px transparent inset',
                  WebkitTextFillColor: '#000',
                  transition: 'background-color 5000s ease-in-out 0s',
                },
                'input:-webkit-autofill:focus': {
                  WebkitBoxShadow: '0 0 0 1000px transparent inset',
                  WebkitTextFillColor: '#333',
                },
              },
              fontFamily:
                'Rubik, Poppins, -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            },
          },

          MuiButtonBase: {
            styleOverrides: {
              root: {
                fontSize: '16px',
                fontWeight: 'bold',
                '& .MuiLoadingButton-label .MuiTypography-root': {
                  fontSize: '16px',
                  fontWeight: 'bold',
                },
              },
            },
          },

          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: '20px',
                textTransform: 'none',
                height: '40px',
                fontSize: '16px',
                fontWeight: 'bold',
                padding: '0px 24px',
                '& div.MuiBox-root': {
                  paddingBottom: '2px',
                },
              },
            },
          },

          MuiTextField: {
            styleOverrides: {
              root: {
                '& input:-webkit-autofill': {
                  WebkitBoxShadow: '0 0 0 1000px transparent inset',
                },
              },
            },
          },

          MuiOutlinedInput: {
            styleOverrides: {
              root: {
                // height: '40px',
                borderRadius: '20px',
              },
            },
          },

          MuiAutocomplete: {
            styleOverrides: {
              input: {
                padding: '2.5px 4px 2.5px 16px !important;',
              },
            },
          },

          MuiDialog: {
            styleOverrides: {
              paper: {
                borderRadius: '20px'
              }
            }
          },
        },
      }),

    [mode, direction]
  )

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode: PaletteMode) => {
          if (prevMode === 'light') {
            setClientMode('dark')
            return 'dark'
          } else {
            setClientMode('light')
            return 'light'
          }
        })
      },
      changeDirection: (dir: Direction) => {
        setDirection(dir)
      },
    }),
    [setClientMode]
  )

  useEffect(() => {
    document.dir = direction
  }, [direction])


  return (
    <CacheProvider value={direction === 'rtl' ? cacheRtl : emptyCache}>
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <CssBaseline enableColorScheme />
          {children}
        </ThemeProvider>
      </ColorModeContext.Provider>
    </CacheProvider>
  )
}
