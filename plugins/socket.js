import { io } from "socket.io-client";

export default defineNuxtPlugin((nuxtApp) => {
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "localhost";
  const socketHost = hostname.endsWith("courseflow.pl")
    ? "https://api.courseflow.pl"
    : "http://localhost:4000";

  const socket = io(socketHost, {
    autoConnect: false,
    withCredentials: true,
  });

  return {
    provide: {
      socket,
    },
  };
});
