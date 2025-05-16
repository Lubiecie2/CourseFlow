import { io } from "socket.io-client";

export default defineNuxtPlugin((nuxtApp) => {
  const socket = io("http://localhost:4000", {
    autoConnect: false,
    withCredentials: true,
  });

  return {
    provide: {
      socket,
    },
  };
});
