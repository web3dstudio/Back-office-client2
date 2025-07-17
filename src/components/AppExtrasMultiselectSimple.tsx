import { useFieldArray, useFormContext } from "react-hook-form";
import AppExtrasItemSimple from "./AppExtrasItemSimple"
import { Grid, Skeleton } from "@mui/material";


function AppExtrasMultiselectSimple({ name = "extras", loading = false }) {
  const { control } = useFormContext();
  const { fields } = useFieldArray({ control, name });
  const fieldsDefault = control._defaultValues?.[name] || [];


  return (
    <Grid container columns={12} spacing={2}>
      {loading &&
        Array.from({ length: 12 }).map((_, idx) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }} key={idx}>
            <Skeleton variant="rectangular" width="100%" height={40} sx={{ borderRadius: '20px' }} />
          </Grid>
        ))
      }
      {!loading && fields.map((field, index) => {
        return (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3, xl: 2 }} key={field.id}>
            <AppExtrasItemSimple
              key={field.id}
              index={index}
              name={name}
              field={{ ...fieldsDefault[index], ...field }}
            />
          </Grid>
        );
      })}
    </Grid>
  );
}

export default AppExtrasMultiselectSimple