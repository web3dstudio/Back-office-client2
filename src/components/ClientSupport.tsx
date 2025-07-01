import { Help } from '@mui/icons-material'
import { IconButton } from '@mui/material'
import { useNavigate } from '@tanstack/react-router'

function ClientSupport() {
  const navigate = useNavigate()

  return (
    <IconButton
      color='inherit'
      onClick={() =>
        navigate({
          to: '/client-support',
        })
      }
    >
      <Help />
    </IconButton>
  )
}

export default ClientSupport
