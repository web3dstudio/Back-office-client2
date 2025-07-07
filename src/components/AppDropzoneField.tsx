/* eslint-disable jsx-a11y/alt-text */
import { Box, Grid, List, ListItem, ListItemIcon, ListItemText, Typography } from "@mui/material"
import { useDropzone, type FileWithPath } from "react-dropzone"
import { useTranslation } from "react-i18next"
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import { useTheme } from "@mui/material/styles";
import { useEffect, useState } from "react";
import AppActionButton from "./AppActionButton";
import ErrorTwoToneIcon from '@mui/icons-material/ErrorTwoTone';

interface DropZoneFieldProps {
  name?: string
  label?: string
  onChange: (files: FileWithPath[]) => void
  maxFiles?: number
  maxFileSize?: number
  defaultFiles?: string[]
}

type FileWithPreview = FileWithPath & { preview: string };

const DropZoneField = ({ name, label, onChange, maxFiles, maxFileSize, defaultFiles }: DropZoneFieldProps) => {

  const MAX_FILE_SIZE = maxFileSize || 204800 // 200 килобайт

  const { t } = useTranslation()
  const theme = useTheme()

  console.log(defaultFiles)

  const [files, setFiles] = useState<FileWithPreview[]>(
    defaultFiles?.map(url => ({
      name: url,
      path: url,
      preview: url,
    }) as any) || []
  );

  const validateFn = (file: any) => {
    if (file.size > MAX_FILE_SIZE) {
      return {
        code: "size-too-large",
        message: t("filepondLabelMaxFileSizeExceeded")
      };
    }
    return null
  }

  const { getRootProps, getInputProps, fileRejections, isDragActive } = useDropzone({
    onDrop: acceptedFiles => {
      setFiles(acceptedFiles.map(file => Object.assign(file, {
        preview: URL.createObjectURL(file)
      })));
    },
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.svg'],
    },
    maxFiles: maxFiles || 1,
    validator: validateFn
  })

  const handleRemoveFile = (fileToRemove: FileWithPreview) => {
    setFiles(files => files.filter(file => file !== fileToRemove));
  };

  const Previews = files.map((file: FileWithPreview, index: number) => (
    <Box
      key={index}
      sx={{
        width: 100,
        height: 100,
        border: '1px solid #ccc',
        borderRadius: theme.shape.borderRadius,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: theme.palette.mode === 'dark' ? '#000' : '#f7f7f9',
        position: 'relative',
      }}>

      <AppActionButton
        type='delete'
        sx={{
          position: 'absolute',
          top: -10,
          right: -10,
        }}
        onClick={() => {
          handleRemoveFile(file)
        }} />
      <img
        src={file?.preview || ''}
        alt={file.name}
        style={{
          maxWidth: '80%',
          maxHeight: '80%',
          objectFit: 'contain',
          display: 'block',
        }}
      />
    </Box>
  ));

  const RejectedFiles = fileRejections.map(({ file, errors }, index: number) => (
    <ListItem alignItems="flex-start" disableGutters disablePadding key={index}>
      <ListItemIcon sx={{ minWidth: '40px' }}>
        <ErrorTwoToneIcon color="error" fontSize="medium" />
      </ListItemIcon>
      <ListItemText primary={file.name} secondary={
        errors.map(e => (
          <span key={e.code}>{t(e.message)}</span>
        ))} />
    </ListItem>
  ));

  useEffect(() => {
    onChange(files)
    // Make sure to revoke the data uris to avoid memory leaks, will run on unmount
    return () => files.forEach(file => URL.revokeObjectURL(file.preview));
  }, [files]);

  return (
    <>

      <Grid container columns={12} sx={{ gap: 3, position: 'relative', mt: 2 }} >
        {label && (

          <Typography sx={{ position: 'absolute', top: -28, left: 14, fontSize: '14.5px', fontWeight: 400, color: theme.palette.text.secondary }}>
            {label}
          </Typography>

        )}

        <Grid size={12}>
          <Box
            {...getRootProps()}
            sx={{
              backgroundColor: theme.palette.background.paper,
              height: "100px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-around",
              border: `1px dashed ${theme.palette.primary.main}`,
              borderRadius: '24px',
              borderColor: isDragActive
                ? theme.palette.grey[700]
                : theme.palette.grey[900],
              "&:hover": {
                border: "1px dashed",
                borderColor: theme.palette.primary.main,
                cursor: "pointer",
                backgroundColor: theme.palette.grey[100],
              },
            }}
          >
            <Box p={2}>
              <Box textAlign="center" color={theme.palette.grey[500]}>
                <CloudUploadOutlinedIcon fontSize="medium" />
              </Box>
              <Box textAlign="center">
                <Typography variant="subtitle2" color={theme.palette.text.disabled}>
                  <span
                    dangerouslySetInnerHTML={{ __html: t("filepondLabelIdle") }}
                  />
                </Typography>
                <Typography variant="subtitle2" color={theme.palette.text.disabled}>
                  {t("filepondLabelMaxFileSize", {
                    filesize: Math.round(MAX_FILE_SIZE / 1024 / 1024)
                  })}
                  {" MB"}
                </Typography>
              </Box>
            </Box>
            <input
              name={name}
              {...getInputProps()}
            />
          </Box>
        </Grid>
        {files.length > 0 && (
          <Grid size={12} sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {Previews}
          </Grid>
        )}
        {fileRejections.length > 0 && (
          <Grid size={12}>
            <List dense>
              {RejectedFiles}
            </List>
          </Grid>
        )}
      </Grid>
    </>
  );
}
export default DropZoneField