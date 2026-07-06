// theme.js
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    background: { default: "#FBF8F1" },
    text: { primary: "#21201C" },
    primary: { main: "#2E5EAA" },
    error: { main: "#E4572E" },
  },
  typography: {
    fontFamily: "'Nunito', sans-serif",
  },
  shape: { borderRadius: 14 },
});

export default theme;
