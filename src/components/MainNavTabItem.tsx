import { Tab } from '@mui/material'
import { useNavigate } from '@tanstack/react-router'
import type { JSX } from 'react'


interface IMainNavTabItemProps {
  icon: JSX.Element
  label: string
  to: string
  click: () => void
}

export default function MainNavTabItem({
  icon,
  label,
  to,
  click
}: IMainNavTabItemProps) {

  const navigate = useNavigate()

  return (
    <Tab
      onClick={() => {
        click()
        navigate({
          to: to,
        })
      }
      }
      sx={{ textTransform: 'none' }}
      icon={icon}
      label={label}
    />
  )
}
