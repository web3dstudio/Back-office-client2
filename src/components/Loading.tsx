import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'

function Loading() {
  return (
    <Box sx={{ display: 'flex', justifyContent:'center', alignItems: 'center', width: '100%', height: '100%' }}>
      <CircularProgress />
    </Box>
  )
}

export default Loading
