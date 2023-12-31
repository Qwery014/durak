import React, { ReactNode } from "react";

import { Routes, Route } from 'react-router-dom';

import HomePage from "./pages/HomePage";
import PlayTablePage from "./pages/PlayTablePage";


interface interfaceRoute {
  id: number,
  link: string,
  element: ReactNode,
}


const MainRoutes: React.FC = () => {
  const PUBLIC_ROUTES: interfaceRoute[] = [
    {
      id: 1,
      link: "/",
      element: <HomePage />,
    },
    {
      id: 2,
      link: "/table",
      element: <PlayTablePage />,
    },
  ];
  return (
    <Routes>
      {
        PUBLIC_ROUTES.map((route) => (
          <Route path={route.link} element={route.element} key={route.id} />
        ))
      }
    </Routes>
  );
};

export default MainRoutes;
