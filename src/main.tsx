import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register(new URL("sw.js", document.baseURI), { updateViaCache: "none" })
      .catch((error) => console.warn("오프라인 기능 등록 실패", error));
  });
}
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
