import apiClient from "@/apiClient";
import { auth } from "@/lib/firebase";
import { LoginResponse, LoginRequest } from "@/types/authentication-Types";
import { 
  createUserWithEmailAndPassword, 
  sendEmailVerification, 
  signInWithEmailAndPassword,
  User
} from "firebase/auth";

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone_Number: string;
  role: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data?: {
    user: any;
    token?: string;
  };
}

export async function loginUser(data: LoginRequest): Promise<LoginResponse> {
     const response = await apiClient.post("/users/api/users/loginWeb", data, {
    withCredentials: true,
  });

  return response.data;
}

export async function registerUser(data: RegisterRequest): Promise<RegisterResponse> {
  try {
    const response = await apiClient.post("/users/api/users/createUserforWeb", data, {
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    console.error("Registration failed:", error);
    throw error;
  }
}
export const registerUserWithEmail = async (email: string, password: string): Promise<User> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Step 2: Send verification email
  if (user) {
    await sendEmailVerification(user, {
      url: `${window.location.origin}/auth/verify`, // callback page in your app
      handleCodeInApp: true,
    });
  }

  return user;
};
export const checkEmailVerification = async (): Promise<boolean> => {
  if (!auth.currentUser) return false;
  await auth.currentUser.reload();
  return auth.currentUser.emailVerified;
};
export const checkUserExists = async (phone_Number: string): Promise<boolean> => {
  try {
    const response = await apiClient.post("/users/api/users/check-user", {
      phone_Number,
    }, {
      withCredentials: true,
    });

    return response.data.data.exists;
  } catch (error: any) {
    console.error("Check user exists failed:", error);
    throw error;
  }
};

export const registerUserWithPhone = async (firebaseToken:string,role:string):Promise<any> => {
  try{
    const response = await apiClient.post("/users/api/users/signup", {
      firebaseToken,
      role,
    }, {
      withCredentials: true,
    });
    return response.data;
  }
  catch(error){
    console.error("Register user with phone failed:", error);
    throw error;
  }

}
export const resetPassword = async (email: string): Promise<any> => {
  try {
    const response = await apiClient.post("/users/api/users/user/send-reset/paswordmail", {
      email,
    }, {
      withCredentials: true,
    });
    return response.data;
  }
  catch(error){
    console.error("Reset password failed:", error);
    throw error;
  }
};


  export const verifyPassword = async (token: string): Promise<any> => {
    try {
      const response = await apiClient.get(`/users/api/users/user/reset/password-verify/${token}`);
      return response.data;
    }
    catch(error){
      console.error("Verify password failed:", error);
      throw error;
    }
  }


export const createNewPassword = async (token: string, newPassword: string): Promise<any> => {
  try {
    const response = await apiClient.post(`/users/api/users/user/reset/password/${token}`, {
      newPassword,
    });
    return response.data;
  }
  catch(error){
    console.error("Create new password failed:", error);
    throw error;
  }
}
