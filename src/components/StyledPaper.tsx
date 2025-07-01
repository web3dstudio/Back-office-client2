import { Paper } from "@mui/material";
import { styled } from "@mui/material/styles";


const StyledPaper = styled(Paper)(() => ({
  borderRadius: "42px",
  padding: '38px',
  boxShadow: "0px 0px 20px rgba(28, 41, 61, .1), 0px 0px 20px rgba(28, 41, 61, 0.06);",
  width: '100%'
}));

export default StyledPaper