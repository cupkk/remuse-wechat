import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/layout/RootLayout";
import Home from "./pages/Home";
import Gallery from "./pages/Gallery";
import ScanEditor from "./pages/ScanEditor";
import ItemDetail from "./pages/ItemDetail";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Workshop from "./pages/Workshop";
import Results from "./pages/Results";
import MemoryChat from "./pages/MemoryChat";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: Home },
      { path: "gallery", Component: Gallery },
      { path: "scan", Component: ScanEditor },
      { path: "item/:id", Component: ItemDetail },
      { path: "profile", Component: Profile },
      { path: "workshop", Component: Workshop },
      { path: "results", Component: Results },
      { path: "chat", Component: MemoryChat },
    ],
  },
]);