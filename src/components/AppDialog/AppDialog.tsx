import {
	Dialog,
	DialogTitle,
	DialogContent,
	type SxProps,
	type DialogProps,
} from '@mui/material'
import DialogCloseIcon from '../DialogCloseIcon'


interface IProps {
	open: boolean
	onClose: () => void
	title: string
	children?: React.ReactNode
	sx?: SxProps
	maxWidth?: 'sm' | 'md' | 'lg' | 'xl'
}

export default function AppDialog({ open, onClose, title, children, sx, maxWidth = 'md' }: IProps) {

	const handleClose: DialogProps['onClose'] = (_event, reason) => {
		if (reason && reason === 'backdropClick') return
		onClose()
	}
	return (
		<Dialog
			open={open}
			fullWidth
			maxWidth={maxWidth}
			onClose={handleClose}
			tabIndex={-1}
			role='dialog'
			aria-labelledby='dialog-title'
			aria-describedby='dialog-description'
			disableEnforceFocus
			disableAutoFocus
			sx={sx}
		>
			<DialogTitle>
				<DialogCloseIcon onClick={onClose} />
				{title}
			</DialogTitle>
			<DialogContent>
				{children}
			</DialogContent>
		</Dialog>
	)
}