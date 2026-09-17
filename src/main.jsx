import "./lib/storage.js";
import "./index.css";

import React from "react";
import ReactDOM from "react-dom/client";
import MatPlan from "./MatPlan.jsx";
import AuthGate from "./Auth.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthGate>
      <MatPlan />
    </AuthGate>
  </React.StrictMode>
);
