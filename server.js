import { ApolloServer, gql } from 'apollo-server';
import fetch from 'node-fetch';

// fake DB
let tweets = [
  {
    id: '1',
    text: 'first',
    userId: '2',
  },
  {
    id: '2',
    text: 'second',
    userId: '1',
  },
];

let users = [
  {
    id: '1',
    firstName: 'Eunnho',
    lastName: 'Kim',
  },
  {
    id: '2',
    firstName: 'Doing',
    lastName: 'Lee',
  },
];

// gql 함수는 ``로 묶어야함
const typeDefs = gql`
  # 나만의 type을 만들 수 있다.
  # [Tweet]은 여러 개의 Tweet을 준다는 뜻
  # User은 Tweet이 하나의 author을 가진다는 뜻
  # [Tweet]은 모든 Tweet을 주고, Tweet은 하나의 Tweet만 준다는 것인듯
  type Tweet {
    """
    사이에 글을 쓰면 description이라고 함
    """
    id: ID!
    text: String!
    author: User
    userId: String!
  }

  type User {
    id: ID!
    firstName: String! # 느낌표가 없으면 null이 될 수 있음
    lastName: String!
    fullName: String!
  }
  # Query type은 필수
  # Query type에 넣은 모든 것들은 사용자가 request 가능
  # Query type에 있는 모든 것들은 GET url을 만드는 것과 같다.
  type Query {
    # [Tweet]!은 [Tweet, null, Tweet, ..]이 될 수 있음
    allTweets: [Tweet!]! # REST API에서 GET /allTweets 역할
    allUsers: [User!]!
    # !를 붙이면 required라는 것을 알림
    # 즉 ID argument가 반드시 있어야하고 반드시 하나의 Tweet을 return함을 뜻함
    # 여기선 id가 없는 Tweet이 있을 수 있으므로 !을 뺌
    tweet(id: ID!): Tweet # argument를 줄 수 있다, GET /tweet/:id 같은 역할
    ping: String!
    allMovies: [Movie!]!
    movie(id: String!): Movie
  }

  # user가 보낸 데이터로 mutate하는 동작들을 모두 넣음
  # mutation: modify data in the data store and returns a value.
  # 즉 Mutation type안에 있는 것들은 POST / DELETE / PUT
  type Mutation {
    postTweet(text: String!, userID: ID!): Tweet!
    deleteTweet(id: ID!): Boolean!
  }

  type Movie {
    id: Int!
    url: String!
    imdb_code: String!
    title: String!
    title_english: String!
    title_long: String!
    slug: String!
    year: Int!
    rating: Float!
    runtime: Float!
    genres: [String]!
    summary: String
    description_full: String!
    synopsis: String
    yt_trailer_code: String!
    language: String!
    background_image: String!
    background_image_original: String!
    small_cover_image: String!
    medium_cover_image: String!
    large_cover_image: String!
  }
`;

// Apollo에서 Default은 query, mutation을 쓰려면 명시적으로 해야함

// type 정의한 이름과 같아야함
const resolvers = {
  // Query type에 있는 tweet field를 요청하면 Apllo는 resolvers의 query type의 tweet function으로
  // 가서 이 함수를 호출
  Query: {
    // tweet() {
    //   console.log('Called'); // Query 내의 Tweet을 받으면 콘솔에 찍힘
    //   return null;
    // },
    ping() {
      return 'pong'; //
    },
    allTweets() {
      return tweets;
    },
    tweet(root, args) {
      // 유저가 argument를 보낼 때 resolvers의 두 번째 파라미터에 담김
      console.log(args);
      return tweets.find((tweet) => tweet.id === args.id);
    },
    allUsers() {
      return users;
    },
    allMovies() {
      return fetch('https://yts.torrentbay.to/api/v2/list_movies.json')
        .then((res) => res.json())
        .then((json) => json.data.movies);
    },
    movie(_, { id }) {
      return fetch(
        `https://yts.torrentbay.to/api/v2/movie_details.json?movie_id=${id}`
      )
        .then((res) => res.json())
        .then((json) => json.data.movie);
    },
  },
  // Query resolvers에서도 push 등으로 Mutation이 가능하지만 개념적으로 나누기 위해
  Mutation: {
    postTweet(root, { text, userID }) {
      const check = users.find((user) => user.id === userID);
      if (!check) {
        throw new error('user is not find.');
      }
      const newTweet = {
        // Apollo에서 POST 가능
        id: tweets.length + 1,
        text,
        userID,
      };
      tweets.push(newTweet);
      return newTweet;
    },
    deleteTweet(root, { id }) {
      const tweet = tweets.find((tweet) => tweet.id === id);
      if (!tweet) return false;
      // filter로 준 id와 다른 것만 받음 -> 준 id tweet은 삭제
      tweets = tweets.filter((tweet) => tweet.id !== id);
      return true;
    },
  },
  /*
  users에는 fullName이 없는데 type User에는 있음. allUsers에서 return users를 하면 fullName
  을 찾기위해 User fullname() resolvers가 있는지 찾음.
  이때 root가 사용됨, root는 부모 resolovers라고 할 수 있는 것
  즉 fullName을 호출하는 Object의 data가 root에 담김(allUsers의 리턴값)
  */
  User: {
    fullName(root) {
      return `${root.firstName} ${root.lastName}`;
    },
  },
  Tweet: {
    // 위와 같은 방식으로 user와 tweet 연결
    author(root) {
      return users.find((user) => user.id === root.userId);
    },
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`Running on ${url}`);
});

// throw Error('Apollo Server requires either an existing schema, modules or typeDefs');
// GraphQL은 data의 shape를 미리 알고있어야 하므로 발생

// RESTAPI를 GraphQL로 하려면 fetch를 하여 json으로 가져오면됨
// 그 후 Query에서 한대로 하면 됨
