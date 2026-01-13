import { createContext } from 'react'
import type { Direction } from '@mui/material'

export const ColorModeContext = createContext({
  toggleColorMode: () => { },
  changeDirection: (dir: Direction) => {
    console.log(dir)
  },
})

