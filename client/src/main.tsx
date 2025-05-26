import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, redirect, RouterProvider } from "react-router";
import RootLayout from "./routes/rootLayout";
import GameRoute from "./routes/gameRoute";
import Home from "./components/Home";
import MatchMaking from "./routes/matchMaking";

import axios from "axios";

const router = createBrowserRouter([
    {
        path: "/",
        element: <RootLayout />,
        children: [
            {
                path: "/",
                element: <Home />,
            },
            {
                path: "/game/:gameId",
                loader: async ({ params }) => {
                    try {
                        return (
                            await axios.get(
                                `${import.meta.env.VITE_API_URL}/game/${
                                    params.gameId
                                }`
                            )
                        ).data;
                    } catch (error) {
                        return redirect("/");
                    }
                },
                element: <GameRoute />,
            },
            {
                path: "/matchmaking/:gameId",
                element: <MatchMaking />,
            },
        ],
    },
]);

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>
);
