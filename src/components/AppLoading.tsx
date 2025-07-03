import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'

function AppLoading() {
  return (
    <Box sx={{ display: 'flex', justifyContent:'center', alignItems: 'center', width: '100%', height: '100%', flexGrow: 1 }}>
      <CircularProgress />
    </Box>
  )
}

export default AppLoading
