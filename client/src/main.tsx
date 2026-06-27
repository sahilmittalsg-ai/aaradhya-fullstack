import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App";
import { CartProvider } from "./context/CartContext";
import "./index.css";

// Preserve old BrowserRouter bookmarks while making all future reloads static-host safe.
if (!window.location.hash && window.location.pathname !== "/") {
  const route = `${window.location.pathname}${window.location.search}`;
  window.history.replaceState(null, "", `/#${route}`);
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HashRouter>
      <CartProvider>
        <App />
      </CartProvider>
    </HashRouter>
  </React.StrictMode>
);
