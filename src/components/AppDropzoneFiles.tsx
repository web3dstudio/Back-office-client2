import { Box, Divider, Grid, IconButton, List, ListItem, ListItemIcon, ListItemText, Typography } from '@mui/material'
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined'
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined'
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined'
import { useTheme } from '@mui/material/styles'
import { useDropzone, type FileWithPath } from 'react-dropzone'
import { Fragment } from 'react'

type Props = {
  label?: string
  files: FileWithPath[]
  onChange: (files: FileWithPath[]) => void
  accept?: Record<string, string[]>
  maxFiles?: number
  maxFileSize?: number
}

function getExtension(name: string) {
  const i = name.lastIndexOf('.')
  if (i === -1) return ''
  return name.slice(i + 1).toLowerCase()
}

function getFileIcon(ext: string) {
  if (ext === 'pdf') return <PictureAsPdfOutlinedIcon fontSize="small" />
  if (ext === 'jpg' || ext === 'jpeg' || ext === 'png' || ext === 'gif' || ext === 'tif' || ext === 'tiff') {
    return <ImageOutlinedIcon fontSize="small" />
  }
  return <InsertDriveFileOutlinedIcon fontSize="small" />
}

export default function AppDropzoneFiles({
  label,
  files,
  onChange,
  accept,
  maxFiles = 1,
  maxFileSize,
}: Props) {
  const theme = useTheme()

  const validateFn = (file: File) => {
    if (maxFileSize && file.size > maxFileSize) {
      return { code: 'size-too-large', message: 'File is too large' }
    }
    return null
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      const next = [...files, ...acceptedFiles]
      onChange(next.slice(0, maxFiles))
    },
    accept,
    multiple: true,
    validator: validateFn,
  })

  return (
    <Grid container columns={12} spacing={2} sx={{ width: '100%', mt: 1 }}>
      {label && (
        <Grid size={12}>
          <Typography sx={{ fontSize: '14.5px', fontWeight: 400, color: theme.palette.text.secondary }}>
            {label}
          </Typography>
        </Grid>
      )}

      <Grid size={12}>
        <Box
          {...getRootProps()}
          sx={{
            backgroundColor: theme.palette.background.paper,
            height: 110,
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px dashed',
            borderRadius: '24px',
            borderColor: isDragActive ? theme.palette.grey[700] : theme.palette.grey[900],
            '&:hover': {
              borderColor: theme.palette.primary.main,
              cursor: 'pointer',
              backgroundColor: theme.palette.grey[100],
            },
          }}
        >
          <input {...getInputProps()} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: theme.palette.grey[600] }}>
            <CloudUploadOutlinedIcon fontSize="medium" />
            <Typography variant="body2">
              {isDragActive ? 'Drop files here' : 'Click or drag files here'}
            </Typography>
          </Box>
        </Box>
      </Grid>

      {files.length > 0 && (
        <Grid size={12}>
          <List dense sx={{ p: 0 }}>
            {files.map((file, idx) => {
              const ext = getExtension(file.name)
              return (
                <Fragment key={`${file.name}-${file.size}-${file.lastModified}`}>
                  <ListItem
                    dense
                    disableGutters
                    sx={{ py: 0.25, minHeight: 32 }}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        size="small"
                        onClick={() => onChange(files.filter(f => f !== file))}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    }
                  >
                    <ListItemIcon sx={{ minWidth: 30 }}>
                      {getFileIcon(ext)}
                    </ListItemIcon>
                    <ListItemText
                      primary={file.name}
                      secondary={`${Math.round(file.size / 1024)} KB`}
                    />
                  </ListItem>
                  {idx < files.length - 1 && <Divider component="li" />}
                </Fragment>
              )
            })}
          </List>
        </Grid>
      )}
    </Grid>
  )
}


