import { Box, type SxProps, useTheme, CircularProgress } from "@mui/material"
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import ClearTwoToneIcon from '@mui/icons-material/ClearTwoTone';
import SendTwoToneIcon from '@mui/icons-material/SendTwoTone';
import ContentCopyTwoToneIcon from '@mui/icons-material/ContentCopyTwoTone';


interface IProps {
    type: 'edit' | 'delete' | 'send' | 'duplicate'
    onClick: () => void
    sx?: SxProps
    loading?: boolean
}

function AppActionButton({ type, onClick, sx, loading }: IProps) {
    const theme = useTheme()
    return (
        <Box
            onClick={onClick}
            sx={{
                width: '28px',
                height: '28px',
                backgroundColor:
                    type === 'edit' || type === 'duplicate'
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
                    backgroundColor: type === 'edit' || type === 'duplicate'
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
            {loading ? (
                <CircularProgress size={16} color="inherit" />
            ) : (
                <>
                    {type === 'edit' && <EditTwoToneIcon fontSize="small" />}
                    {type === 'delete' && <ClearTwoToneIcon fontSize="small" />}
                    {type === 'send' && <SendTwoToneIcon fontSize="small" />}
                    {type === 'duplicate' && <ContentCopyTwoToneIcon fontSize="small" />}
                </>
            )}
        </Box>
    )
}

export default AppActionButton