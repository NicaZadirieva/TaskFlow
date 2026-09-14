import { Button, Checkbox } from "@mui/material";
import LoadingIconButton from "./loading_icon_button";
import LogoutIcon from "@mui/icons-material/Logout";
import Checkboxes from './checkboxes';
import AddUserForm from './add_user_form';
import SideMenu from '../components/menu';

export default function TestMui() {
  return (
    <div>
      <Button
        variant="contained"
        endIcon={<LogoutIcon />}
        aria-label="Выход из приложения"
      >
        Выход
      </Button>
      <LoadingIconButton></LoadingIconButton>
	  <Checkboxes/>
	  <SideMenu/>

	  <AddUserForm></AddUserForm>
    </div>
  );
}
