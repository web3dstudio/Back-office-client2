import { Box, useTheme } from "@mui/material"
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import ClearTwoToneIcon from '@mui/icons-material/ClearTwoTone';


interface IProps {
    type: 'edit' | 'delete'
    onClick: () => void
}

function AppActionButton({ type, onClick }: IProps) {
    const theme = useTheme()
    return (
        <Box
            onClick={onClick}
            sx={{
                backgroundColor: type === 'edit' ? 'primary.main' : 'error.main',
                color: theme.palette.common.white,
                borderRadius: '50%',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                '&:hover': {
                    backgroundColor: type === 'edit' ? 'primary.dark' : 'error.dark',
                    cursor: 'pointer',
                },
            }}
        >
            {type === 'edit' && <EditTwoToneIcon fontSize="small" />}
            {type === 'delete' && <ClearTwoToneIcon fontSize="small" />}
        </Box>
    )
}

export default AppActionButton