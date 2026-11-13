import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import { RouteTree } from './router/RouteTree';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createTheme, MantineProvider } from '@mantine/core';

import { RouterProvider, createRouter } from '@tanstack/react-router';
import { AuthProvider } from './context/AuthContext';

import ShadeBlock from '../base/shade/block';

import '@mantine/core/styles.layer.css';

const brutalistTheme = createTheme({
  fontFamily: 'Courier New, monospace',
  headings: { fontFamily: 'Courier New, monospace' },
  white: '#FFFF00',
});

const queryClient = new QueryClient();
const routeTree = RouteTree();
const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  scrollRestoration: true,
});

const rootEl = document.getElementById('root');

if (rootEl) {
  const root = ReactDOM.createRoot(rootEl);
  root.render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <ShadeBlock />
        <AuthProvider>
          <MantineProvider theme={brutalistTheme}>
            <RouterProvider router={router} />
          </MantineProvider>
        </AuthProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
}
