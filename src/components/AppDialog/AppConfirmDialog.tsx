import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material'
import type { DialogProps } from '@mui/material'
import DialogCloseIcon from '../DialogCloseIcon'
import { useTranslation } from 'react-i18next'

interface Props {
  onClose: () => void
  onSubmit: () => void
  open: boolean
  title?: React.ReactNode | string
  children?: React.ReactNode
  isPending?: boolean
  confirmText?: string
  confirmColor?: 'error' | 'primary' | 'secondary' | 'info' | 'success' | 'warning'
  cancelText?: string
}

const AppConfirmDialog = ({
  isPending = false,
  onClose,
  onSubmit,
  open,
  title,
  children,
  confirmText,
  confirmColor = 'error',
  cancelText,
}: Props) => {

  const { t } = useTranslation('common')

  const handleClose: DialogProps['onClose'] = (_event, reason) => {
    if (reason && reason === 'backdropClick') return
    onClose()
  }

  const handleSubmut = () => {
    onSubmit()
  }

  return (
    <Dialog
      fullWidth
      maxWidth={'sm'}
      open={open}
      onClose={handleClose}
      aria-labelledby='alert-dialog-title'
      aria-describedby='alert-dialog-description'
    >
      <DialogTitle sx={{ mt: 1 }} id='alert-dialog-title'>
        {title}
        <DialogCloseIcon onClick={handleClose} />
      </DialogTitle>
      <DialogContent>{children}</DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button variant='outlined' onClick={() => onClose()}>
          {cancelText || t('modals.cancel')}
        </Button>
        <Button
          loading={isPending}
          color={confirmColor}
          variant='contained'
          onClick={() => handleSubmut()}
        >
          {confirmText || t('modals.delete')}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AppConfirmDialog
