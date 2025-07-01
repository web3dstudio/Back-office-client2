import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	type SxProps,
	type DialogProps,
	Typography,
} from '@mui/material'
import DialogCloseIcon from '../DialogCloseIcon'
import { useTranslation } from 'react-i18next'

interface IProps {
	open: boolean
	onClose: () => void
	onSubmit: () => void
	title: string
	children?: React.ReactNode
	sx?: SxProps
	actions?: React.ReactNode
	isPending?: boolean
}

export default function AppDialog({ open, onClose, onSubmit, title, children, sx, actions, isPending = false, }: IProps) {

	const { t } = useTranslation('common')

	const handleClose: DialogProps['onClose'] = (_event, reason) => {
		if (reason && reason === 'backdropClick') return
		onClose()
	}
	return (
		<Dialog
			open={open}
			fullWidth
			maxWidth='md'
			onClose={handleClose}
			tabIndex={-1}
			role='dialog'
			aria-labelledby='dialog-title'
			aria-describedby='dialog-description'
			sx={sx}
		>
			<DialogTitle>
				<DialogCloseIcon onClick={onClose} />
				{title}
			</DialogTitle>
			<DialogContent>
				{children}
			</DialogContent>
			<DialogActions sx={{ px: 3, pb: 3 }}>
				{!actions && <>
					<Button
						color='primary'
						size='small'
						onClick={onClose}
						variant='outlined'
					>
						<Typography sx={{ textWrap: 'nowrap', fontSize: '14px', fontWeight: 'bold' }}>
							{t('modals.cancel')}
						</Typography>
					</Button>
					<Button
						color='primary'
						onClick={onSubmit}
						variant='contained'
						loading={isPending}
					>
						<Typography sx={{ textWrap: 'nowrap' }}>
							{t('modals.save')}
						</Typography>
					</Button>
				</>}
			</DialogActions>
		</Dialog>
	)
}