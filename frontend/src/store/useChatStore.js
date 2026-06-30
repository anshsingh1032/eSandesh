import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  allContacts: [],
  chats: [],
  messages: [],
  activeTab: "chats",
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isSoundEnabled: JSON.parse(localStorage.getItem("isSoundEnabled")) === true,

  toggleSound: () => {
    localStorage.setItem("isSoundEnabled", !get().isSoundEnabled);
    set({ isSoundEnabled: !get().isSoundEnabled });
  },

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedUser: (selectedUser) => set({ selectedUser }),

  getAllContacts: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/contacts");
      set({ allContacts: res.data.data });
      
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },
  getMyChatPartners: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/chats");
      set({ chats: res.data.data.chatPartners });
    } catch (error) {
      toast.error(error.response?.data?.message);
      console.log(error.response.data);
      
    } finally {
      set({ isUsersLoading: false });
    }
  },
  getMessagesByUserId: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data.data });
      
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      set({ isMessagesLoading: false });
    }
  },
sendMessage: async (messageData) => {
    const { selectedUser } = get();
    const { authUser } = useAuthStore.getState();

    const tempId = `temp-${Date.now()}`;

    // 1. Add optimistic message immediately
    const optimisticMessage = {
        _id: tempId,
        senderId: authUser._id,
        receiverId: selectedUser._id,
        text: messageData.text || null,
        image: messageData.imageFile
            ? URL.createObjectURL(messageData.imageFile) // show preview instantly
            : null,
        createdAt: new Date().toISOString(),
        isOptimistic: true,
    };

    set((state) => ({
        messages: [...state.messages, optimisticMessage]
    }));

    try {
        // 2. Build FormData for multer
        const formData = new FormData();
        if (messageData.text) formData.append("text", messageData.text);
        if (messageData.imageFile) formData.append("image", messageData.imageFile);

        const res = await axiosInstance.post(
            `/messages/send/${selectedUser._id}`,
            formData
        );

        // 3. Replace optimistic message with real DB message
        set((state) => ({
            messages: state.messages.map((m) =>
                m._id === tempId ? res.data.data.newMessage : m
            )
        }));
    } catch (error) {
        // 4. Remove only the failed optimistic message
        set((state) => ({
            messages: state.messages.filter((m) => m._id !== tempId)
        }));
        toast.error(error.response?.data?.message || "Something went wrong");
    }
},
}));