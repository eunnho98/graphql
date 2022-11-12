import { gql, useQuery } from '@apollo/client';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

const GET_MOVIE = gql`
  # argument를 줘야할 때 쓰는 방법
  query getMovie($movieId: String!) {
    movie(id: $movieId) {
      id
      title
      medium_cover_image
      rating
      isLiked @client # api가 아닌 local cache에서 이 데이터를 읽어오겠다
      # Apollo Cache는 추가적인 정보를 같은 캐시에 저장함
    }
  }
`;

const Container = styled.div`
  height: 100vh;
  background-image: linear-gradient(-45deg, #d754ab, #fd723a);
  width: 100%;
  display: flex;
  justify-content: space-around;
  align-items: center;
  color: white;
`;

const Column = styled.div`
  margin-left: 10px;
  width: 50%;
`;

const Title = styled.h1`
  font-size: 65px;
  margin-bottom: 15px;
`;

const Subtitle = styled.h4`
  font-size: 35px;
  margin-bottom: 10px;
`;

const Description = styled.p`
  font-size: 28px;
`;

const Image = styled.div`
  width: 25%;
  height: 60%;
  background-color: transparent;
  background-image: url(${(props) => props.bg});
  background-size: cover;
  background-position: center center;
  border-radius: 7px;
`;

function Movie() {
  const params = useParams(); // parameter 받아오기
  const {
    data,
    loading,
    client: { cache },
  } = useQuery(GET_MOVIE, {
    variables: {
      movieId: params.id, // 여기서 argument(변수)를 줌
    },
  });
  const onClick = (e) => {
    // Fragment: type의 일부, apollo cache를 바꾸는 방법
    // fetch를 하면 cache에 저장, 이제 그 값을 fragment로 바꿀 수 있음
    cache.writeFragment({
      id: `Movie:${params.id}`,
      fragment: gql`
        # 여기에 무엇을 바꿀지 선언해줌
        fragment MovieFragment on Movie {
          isLiked
        }
      `,
      // 여기에 바꿀 값
      data: {
        isLiked: !data.movie.isLiked,
      },
    });
  };
  console.log(data, loading);
  // Apollo가 쿼리를 client에서 선언한 캐시 In-memory에 저장
  // -> 한 번 fetch한 것은 다시 fetch 안함
  return (
    <Container>
      <Column>
        <Title>{loading ? 'Loading...' : `${data.movie?.title}`}</Title>
        <Subtitle>⭐️ {data?.movie?.rating}</Subtitle>
        {/* local data를 요청하는 방법은 같음 */}
        <button onClick={onClick}>
          {data?.movie?.isLiked ? 'Unlike' : 'Like'}
        </button>
      </Column>
      <Image bg={data?.movie?.medium_cover_image} />
    </Container>
  );
}

export default Movie;
