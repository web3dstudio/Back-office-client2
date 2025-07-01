import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@mui/material'
import type { DialogProps } from '@mui/material'
import DialogCloseIcon from '../DialogCloseIcon'
import { useTranslation } from 'react-i18next'
import CarTypeForm from './CarTypeForm'
import type { TCarType } from '../../types'
import { useCarTypeAddMutation } from '../../query/carTypes.query'

interface Props {
  onClose: () => void
  open: boolean
}

function AddCarTypeModal({ open, onClose }: Props) {

  const { t } = useTranslation('common')

  const handleClose: DialogProps['onClose'] = (_event, reason) => {
    if (reason && reason === 'backdropClick') return
    onClose()
  }

  const { mutate, isPending } = useCarTypeAddMutation()

  const addCarType = (carType: Omit<TCarType, 'id'>) => {
    console.log('addCarType', carType)
    mutate(carType, {
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
        {t('modals.addCarType')}
        <DialogCloseIcon onClick={handleClose} />
      </DialogTitle>
      <DialogContent>
        <CarTypeForm onCancel={onClose} data={null} onConfirm={addCarType} isPending={isPending} />
      </DialogContent>

    </Dialog>
  )
}

export default AddCarTypeModal