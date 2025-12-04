/* eslint-disable jsx-a11y/alt-text */
import { Box, Grid, IconButton, List, ListItem, ListItemIcon, ListItemText, Typography } from "@mui/material"
import { useDropzone, type FileWithPath } from "react-dropzone"
import { useTranslation } from "react-i18next"
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import { useTheme } from "@mui/material/styles";
import { useEffect, useState } from "react";
import AppActionButton from "./AppActionButton";
import ErrorTwoToneIcon from '@mui/icons-material/ErrorTwoTone';
import AppDialog from "./AppDialog/AppDialog";
import DownloadIcon from '@mui/icons-material/Download';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import { AnimatePresence, motion } from "motion/react"


interface DropZoneFieldProps {
  name?: string
  label?: string
  onChange: (files: FileWithPath[]) => void
  maxFiles?: number
  maxFileSize?: number
  defaultFiles?: string[]
  onRemoveFile?: (file: FileWithPath) => void
  onDrop?: () => void
  previewWidth?: number
  previewHeight?: number
}

type FileWithPreview = FileWithPath & { preview: string };

const DropZoneField = ({ name, label, onChange, maxFiles, maxFileSize, defaultFiles, onRemoveFile, onDrop, previewWidth, previewHeight }: DropZoneFieldProps) => {

  const MAX_FILE_SIZE = maxFileSize || 204800 // 200 килобайт
  const PREVIEW_WIDTH = previewWidth || 100
  const PREVIEW_HEIGHT = previewHeight || 100

  const { t } = useTranslation()
  const theme = useTheme()
  const [openPreview, setOpenPreview] = useState(false);
  const [previewImg, setPreviewImg] = useState<string | null>(null);


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

      setFiles(prevFiles => {
        const maxFilesCount = maxFiles || 1;
        const currentCount = prevFiles.length;
        const canAddCount = Math.max(0, maxFilesCount - currentCount);

        const filesToAdd = acceptedFiles.slice(0, canAddCount);

        return [
          ...prevFiles,
          ...filesToAdd.map(file => Object.assign(file, {
            preview: URL.createObjectURL(file)
          }))
        ];
      });

      // setFiles(acceptedFiles.map(file => Object.assign(file, {
      //   preview: URL.createObjectURL(file)
      // })));


      onDrop?.()
    },
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.svg'],
    },
    maxFiles: maxFiles || 1,
    validator: validateFn
  })

  const handleRemoveFile = (fileToRemove: FileWithPreview) => {
    setFiles(files => files.filter(file => file !== fileToRemove));
    onRemoveFile?.(fileToRemove)
  };

  const handlePreview = (preview: string) => {
    setOpenPreview(true);
    setPreviewImg(preview);
  };

  const Previews = (
    <AnimatePresence mode="popLayout">
      {files.map((file: FileWithPreview) => (
        <motion.div
          key={file.name}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.1 }}
          layout
        >
          <Box
            sx={{
              width: PREVIEW_WIDTH,
              height: PREVIEW_HEIGHT,
              border: '1px solid #ccc',
              borderRadius: theme.shape.borderRadius,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: theme.palette.mode === 'dark' ? '#000' : '#f7f7f9',
              position: 'relative',
            }}>
            {/* Кнопка скачать */}
            <IconButton
              size="small"
              sx={{ position: 'absolute', bottom: 2, right: 2, zIndex: 2, backgroundColor: theme.palette.background.paper }}
              component="a"
              href={file.preview}
              download={file.name}
              onClick={e => e.stopPropagation()}
            >
              <DownloadIcon fontSize="small" />
            </IconButton>

            {/* Кнопка увеличить */}
            <IconButton
              size="small"
              sx={{ position: 'absolute', bottom: 2, left: 2, zIndex: 2, backgroundColor: theme.palette.background.paper }}
              onClick={e => {
                e.stopPropagation();
                handlePreview(file.preview);
              }}
            >
              <ZoomInIcon fontSize="small" />
            </IconButton>

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
                width: '80%',
                height: '80%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          </Box>
        </motion.div>
      ))}
    </AnimatePresence>
  )

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
      <Grid container columns={12} sx={{ gap: 2, position: 'relative', mt: 0 }} >
        {label && (
          <Typography sx={{ position: 'absolute', top: -28, left: 14, fontSize: '14.5px', fontWeight: 400, color: theme.palette.text.secondary }}>
            {label}
          </Typography>
        )}

        <Grid size={'auto'}>
          <Box
            {...getRootProps()}
            sx={{
              backgroundColor: theme.palette.background.paper,
              height: "100px",
              width: "150px",
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
              {/* <Box textAlign="center">
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
              </Box> */}
            </Box>
            <input
              name={name}
              {...getInputProps()}
            />
          </Box>
        </Grid>


        {files.length > 0 && (
          <Grid size={'grow'} sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
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
      <AppDialog
        open={openPreview}
        onClose={() => setOpenPreview(false)}
        title={label || ''}
      >
        {previewImg && (
          <img src={previewImg} alt="preview" style={{ maxWidth: '90vw', maxHeight: '90vh', display: 'block', margin: 'auto' }} />
        )}
      </AppDialog>
    </>
  );
}
export default DropZoneField