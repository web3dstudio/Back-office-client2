
import IconButton from "@mui/material/IconButton";
import CloseIcon from '@mui/icons-material/Close';

function AppDialogCloseIcon({ ...props }) {
  return (
    <IconButton
      aria-label="close"
      onClick={props.onClick}
      sx={{
        position: "absolute",
        right: 16,
        top: 16,
        color: (theme) => theme.palette.grey[500],
      }}
    >
      <CloseIcon />
    </IconButton>
  );
}

export default AppDialogCloseIcon;
