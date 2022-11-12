import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import client from './client';
import { ApolloProvider } from '@apollo/client';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* client에 React 컴포넌트 연결, 모든 하위 컴포넌트가 이 client에 접근하도록함 */}
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </React.StrictMode>
);
