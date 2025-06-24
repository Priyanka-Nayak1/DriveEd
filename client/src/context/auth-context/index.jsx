import { Skeleton } from "@/components/ui/skeleton";
import { initialSignInFormData, initialSignUpFormData } from "@/config";
import { toast } from "react-toastify";
import {
  checkAuthService,
  loginService,
  registerService,
} from "@/services";
import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
  const [signInFormData, setSignInFormData] = useState(initialSignInFormData);
  const [signUpFormData, setSignUpFormData] = useState(initialSignUpFormData);
  const [auth, setAuth] = useState({
    authenticate: false,
    user: null,
  });
  const [loading, setLoading] = useState(true);

  // Register
  async function handleRegisterUser(event) {
    event.preventDefault();
    try {
      const data = await registerService({ ...signUpFormData, role: "user" });
      if (data?.success) {
        setSignUpFormData({
          userName: "",
          userEmail: "",
          password: "",
          faceDescriptor: [],
        });
  
        toast.success("Registration successful!");      } else {
        toast.error(data?.message || "User already exists");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Something went wrong");
    }
  }

  // Login
  async function handleLoginUser(event) {
    event.preventDefault();
    try {
      const data = await loginService(signInFormData);
      if (data?.success) {
        toast.success("Welcome To Drive Ed!");

        sessionStorage.setItem(
          "accessToken",
          JSON.stringify(data.data.accessToken)
        );

        setAuth({
          authenticate: true,
          user: data.data.user,
        });
      } else {
        toast.error(data?.message || "Login Failed");
        setAuth({
          authenticate: false,
          user: null,
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Something went wrong");
      setAuth({
        authenticate: false,
        user: null,
      });
    }
  }

  // Check current user auth
  async function checkAuthUser() {
    try {
      const data = await checkAuthService();
      if (data?.success) {
        setAuth({
          authenticate: true,
          user: data.data.user,
        });
      } else {
        setAuth({
          authenticate: false,
          user: null,
        });
      }
    } catch (error) {
      setAuth({
        authenticate: false,
        user: null,
      });
    } finally {
      setLoading(false);
    }
  }

  function resetCredentials() {
    setAuth({
      authenticate: false,
      user: null,
    });
  }

  useEffect(() => {
    checkAuthUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        signInFormData,
        setSignInFormData,
        signUpFormData,
        setSignUpFormData,
        handleRegisterUser,
        handleLoginUser,
        auth,
        resetCredentials,
      }}
    >
      {loading ? <Skeleton /> : children}
    </AuthContext.Provider>
  );
}
