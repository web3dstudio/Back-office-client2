import type { AxiosError } from 'axios'
import { Alert, Box, Button, Typography } from '@mui/material'

type AppErrorProps = {
  error?: unknown
  reset?: () => void
  fullPage?: boolean
}

function isAxiosError(error: unknown): error is AxiosError<any> {
  return !!error && typeof error === 'object' && (error as any).isAxiosError === true
}

function AppError({ error, reset, fullPage }: AppErrorProps) {
  const status = isAxiosError(error) ? error.response?.status : undefined
  const detail =
    isAxiosError(error)
      ? (error.response?.data?.message || error.message)
      : error instanceof Error
        ? error.message
        : undefined

  const isFullPage = fullPage ?? !!reset

  return (
    <Box
      sx={{
        width: '100%',
        ...(isFullPage
          ? { minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3 }
          : { p: 2 }),
      }}
    >
      <Box sx={{ maxWidth: 640, width: '100%' }}>
        <Alert
          severity="error"
          action={
            reset
              ? (
                <Button color="inherit" size="small" onClick={reset}>
                  Retry
                </Button>
              )
              : undefined
          }
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Something went wrong{status ? ` (HTTP ${status})` : ''}
          </Typography>
          {detail && (
            <Typography variant="body2" sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}>
              {detail}
            </Typography>
          )}
        </Alert>
      </Box>
    </Box>
  )
}

export default AppError