import { ApolloClient, gql, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
  uri: 'http://localhost:4000/',
  cache: new InMemoryCache(),
});

export default client;

// ApolloClient에서 제공하는 hook을 사용하는 경우가 대부분
/*
client
  .query({
    // gql query를 보냄
    query: gql`
      {
        allMovies {
          title
        }
      }
    `,
  })
  .then((data) => console.log(data));

*/
