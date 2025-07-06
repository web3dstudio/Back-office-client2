import { Box, Typography } from '@mui/material'


function AppNotFound() {
  return (
    <Box sx={{ width: '100%', height:'100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Box sx={{ display: 'flex', gap: 3, alignItems: 'center'}}>
        <Box>
          <Typography variant='h3' color='#CCC'>404</Typography>
        </Box>
        <Box>Page not found</Box>
      </Box>
    </Box>
  )
}

export default AppNotFound
