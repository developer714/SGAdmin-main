import { Navigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

function SignOut() {
  const { signOut } = useAuth();
  const signout = async () => {
    await signOut();
  };
  signout();
  return <Navigate to="/auth/signin" />;
}
export default SignOut;
