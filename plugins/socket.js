import { io } from "socket.io-client";

export default defineNuxtPlugin((nuxtApp) => {
  const socket = io("https://api.courseflow.pl", {
    autoConnect: false,
    withCredentials: true,
  });

  return {
    provide: {
      socket,
    },
  };
});
