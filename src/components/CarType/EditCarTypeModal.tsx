import { Dialog, DialogContent, DialogTitle } from '@mui/material'
import type { DialogProps } from '@mui/material'
import DialogCloseIcon from '../DialogCloseIcon'
import { useTranslation } from 'react-i18next'
import CarTypeForm from './CarTypeForm'
import type { TCarType } from '../../types'
import { useCarTypeUpdateMutation } from '../../query/carTypes.query'

interface Props {
  onClose: () => void
  open: boolean
  data: TCarType
}

function EditCarTypeModal({ open, onClose, data }: Props) {
  const { t } = useTranslation('common')

  const handleClose: DialogProps['onClose'] = (_event, reason) => {
    if (reason && reason === 'backdropClick') return
    onClose()
  }

  const { mutate, isPending } = useCarTypeUpdateMutation()

  const updateCarType = (carType: Omit<TCarType, 'id'>) => {
    const id = data.id
    mutate({ ...carType, id }, {
      onSuccess: () => {
        onClose()
      }
    })
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
        {t('modals.updateCarType')}
        <DialogCloseIcon onClick={handleClose} />
      </DialogTitle>
      <DialogContent>
        <CarTypeForm data={data} isPending={isPending} onCancel={onClose} onConfirm={updateCarType} />
      </DialogContent>
    </Dialog>
  )
}

export default EditCarTypeModal
