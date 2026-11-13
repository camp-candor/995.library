// 1. Ensure these files are renamed to .tsx
import IndexPage from '../page/000.index/page';
import AxiomPage from '../page/001.axiom/page';
import IntentPage from '../page/003.basic-intent/page';
import ReactControlPage from '../page/004.react-control/page';

import GraphicsPage from '../page/005.graphics-page/page';

import CanvasPage from '../page/006.canvas-page/page';
import GamepadPage from '../page/007.gamepad/page';

import Play002Page from '../template/play-002/index';

import NavBar from './NavBar';

import { Outlet, createRootRoute, createRoute } from '@tanstack/react-router';
import React from 'react';

const rootRoute = createRootRoute({
  component: () => (
    <>
      <div>
        <NavBar />
        <div style={{ position: 'absolute', left: 0, right: 0, marginInline: 'auto', width: '100%' }}>
          <Outlet />
        </div>
      </div>
    </>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: function Index() {
    return <IndexPage />;
  },
});

const gamepadRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/gamepad',
  component: function Index() {
    return <GamepadPage />;
  },
});

const canvasRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/canvas',
  component: function Index() {
    return <CanvasPage />;
  },
});

const axionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/axiom',
  component: function Index() {
    return <AxiomPage />;
  },
});

const graphicsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/graphics',
  component: function Index() {
    return <GraphicsPage />;
  },
});

const reactControlRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/react-control',
  component: function Index() {
    return <ReactControlPage />;
  },
});

const intentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/intent',
  component: function Index() {
    return <IntentPage />;
  },
});

const play002Route = createRoute({
  getParentRoute: () => rootRoute,
  path: '/template/play-002',
  component: function Index() {
    return <Play002Page />;
  },
});

// 2. Changed 'var' to 'const'
export const RouteTree = () => {
  // 3. Ensure titleRoute, testRoute, etc. are imported or defined above this line.
  // If they are missing, you will get more errors here.
  const tree = rootRoute.addChildren([
    indexRoute,
    graphicsRoute,
    axionRoute,
    intentRoute,
    reactControlRoute,
    play002Route,
    canvasRoute,
    gamepadRoute,
    // titleRoute,
    // testRoute,
    // ... add your other routes back here
  ]);

  return tree;
};
