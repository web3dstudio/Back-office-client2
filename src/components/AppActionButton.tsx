import { Box, type SxProps, useTheme } from "@mui/material"
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import ClearTwoToneIcon from '@mui/icons-material/ClearTwoTone';
import SendTwoToneIcon from '@mui/icons-material/SendTwoTone';


interface IProps {
    type: 'edit' | 'delete' | 'send'
    onClick: () => void
    sx?: SxProps
}

function AppActionButton({ type, onClick, sx }: IProps) {
    const theme = useTheme()
    return (
        <Box
            onClick={onClick}
            sx={{
                width: '28px',
                height: '28px',
                backgroundColor:
                    type === 'edit'
                        ? 'primary.main'
                        : type === 'delete'
                            ? 'error.main'
                            : type === 'send'
                                ? 'success.main'
                                : undefined,
                color: theme.palette.common.white,
                borderRadius: '50%',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                '&:hover': {
                    backgroundColor: type === 'edit'
                        ? 'primary.main'
                        : type === 'delete'
                            ? 'error.main'
                            : type === 'send'
                                ? 'success.main'
                                : undefined,
                    cursor: 'pointer',
                },
                ...sx,
            }}
        >
            {type === 'edit' && <EditTwoToneIcon fontSize="small" />}
            {type === 'delete' && <ClearTwoToneIcon fontSize="small" />}
            {type === 'send' && <SendTwoToneIcon fontSize="small" sx={{ transform: 'rotate(-45deg) translate(2px, 0px)' }} />
            }
        </Box>
    )
}

export default AppActionButton