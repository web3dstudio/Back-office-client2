import { Box, type SxProps, useTheme, CircularProgress } from "@mui/material"
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import ClearTwoToneIcon from '@mui/icons-material/ClearTwoTone';
import SendTwoToneIcon from '@mui/icons-material/SendTwoTone';
import ContentCopyTwoToneIcon from '@mui/icons-material/ContentCopyTwoTone';
import VisibilityTwoToneIcon from '@mui/icons-material/VisibilityTwoTone';
import DownloadTwoToneIcon from '@mui/icons-material/DownloadTwoTone';
import AddTwoToneIcon from '@mui/icons-material/AddTwoTone';
import RemoveTwoToneIcon from '@mui/icons-material/RemoveTwoTone';
import RefreshTwoToneIcon from '@mui/icons-material/RefreshTwoTone';
import BlockTwoToneIcon from '@mui/icons-material/BlockTwoTone';


interface IProps {
    type: 'edit' | 'delete' | 'send' | 'duplicate' | 'view' | 'download' | 'add' | 'remove' | 'refresh' | 'block'
    onClick: () => void
    sx?: SxProps
    loading?: boolean
    disabled?: boolean
}

function AppActionButton({ type, onClick, sx, loading, disabled }: IProps) {
    const theme = useTheme()
    return (
        <Box
            onClick={disabled ? undefined : onClick}
            sx={{
                width: '28px',
                height: '28px',
                backgroundColor:
                    type === 'edit' || type === 'duplicate' || type === 'view' || type === 'download' || type === 'add' || type === 'remove' || type === 'refresh'
                        ? 'primary.main'
                        : type === 'delete' || type === 'block'
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
                opacity: disabled ? 0.5 : 1,
                cursor: disabled ? 'not-allowed' : 'pointer',
                '&:hover': {
                    backgroundColor: disabled ? undefined : (type === 'edit' || type === 'duplicate' || type === 'add' || type === 'remove' || type === 'refresh'
                        ? 'primary.main'
                        : type === 'delete' || type === 'block'
                            ? 'error.main'
                            : type === 'send'
                                ? 'success.main'
                                : undefined),
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
                    {type === 'view' && <VisibilityTwoToneIcon fontSize="small" />}
                    {type === 'download' && <DownloadTwoToneIcon fontSize="small" />}
                    {type === 'add' && <AddTwoToneIcon fontSize="small" />}
                    {type === 'remove' && <RemoveTwoToneIcon fontSize="small" />}
                    {type === 'refresh' && <RefreshTwoToneIcon fontSize="small" />}
                    {type === 'block' && <BlockTwoToneIcon fontSize="small" />}
                </>
            )}
        </Box>
    )
}

export default AppActionButton