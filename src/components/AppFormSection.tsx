import { Box, Typography, Divider } from "@mui/material"

interface FormSectionProps {
  title?: string
  sx?: any
}

function AppFormSection({ title, sx }: FormSectionProps) {
  return (
    <Box sx={{ mb: 3, ...sx }}>
      {title && (
        <>
          <Typography variant="body1" sx={{ mb: 1, fontWeight: 'bold' }}>
            {title}
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </>
      )}
    </Box>
  )
}

export default AppFormSection