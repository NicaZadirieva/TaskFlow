import { Button} from "@mui/material";
import LoadingIconButton from "./loading_icon_button";
import LogoutIcon from "@mui/icons-material/Logout";
import Checkboxes from './checkboxes';
import AddUserForm from './add_user_form';
import SetDoneButton from './set_done_btn';

export default function TestMui() {
  return (
    <>
      <Button
        variant="contained"
        endIcon={<LogoutIcon />}
        aria-label="Выход из приложения"
      >
        Выход
      </Button>
      <LoadingIconButton></LoadingIconButton>
	  <Checkboxes/>
    <SetDoneButton/>
    <AddUserForm/>

   
    </>
  );
}
