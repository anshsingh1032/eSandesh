import {create} from "zustand"
import {axiosInstance} from "../lib/axios"
import toast from "react-hot-toast"
export const useAuthStore = create((set)=>({
    authUser:null,
    isCheckingAuth:true,
    isSigningUp: false,
    isLoggingIn: false,

    checkAuth: async()=>{
        try {
           const res = await axiosInstance.get("/auth/check")
           set({authUser:res.data}) 
        } catch (error) {
            console.log("error in authCheck",error);
            set({authUser:null})
        }finally{
            set({isCheckingAuth:false})
        }
    },
    signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });

      toast.success("Account created successfully!");
    } catch (error) {
      toast.error(error.response.data.message);
      console.log(error.response);
      
    } finally {
      set({ isSigningUp: false });
    }
  },


  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });

      toast.success("Logged in successfully");
    } catch (error) {
      toast.error(error.response.data.message);
      console.log(error.response.data);
      
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Error logging out");
      console.log("Logout error:", error);
    }
  },
   updateProfile: async (imageFile) => {
    set({ isUpdatingProfile: true });
    try {
        const formData = new FormData();
        formData.append("profilePic", imageFile);

        const res = await axiosInstance.put("/auth/update-profile", formData);
        set({ authUser: res.data.data.updatedUser });
        toast.success("Profile updated successfully!");
    } catch (error) {
        toast.error(error.response?.data?.message || "Update failed");
    } finally {
        set({ isUpdatingProfile: false });
    }
}
}))