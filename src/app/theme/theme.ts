import { createTheme } from '@mui/material/styles';
export default createTheme({
 palette:{primary:{main:'#315e4c'},secondary:{main:'#7a8d69'},background:{default:'#f7f8f4',paper:'#ffffff'},text:{primary:'#293d33',secondary:'#728071'},divider:'#e2e7dc'},
 shape:{borderRadius:12},typography:{fontFamily:'"Noto Sans KR", "Malgun Gothic", "Apple SD Gothic Neo", system-ui, sans-serif',button:{textTransform:'none',fontWeight:600}},
 components:{MuiButton:{defaultProps:{disableElevation:true},styleOverrides:{root:{minHeight:40}}},MuiTooltip:{defaultProps:{arrow:true}}}
});
