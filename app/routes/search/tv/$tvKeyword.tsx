import * as React from 'react';
import { DataFunctionArgs, json, LoaderFunction } from '@remix-run/node';
import { useLoaderData, useNavigate, useParams } from '@remix-run/react';
import { Input, Grid, Container, Button, Pagination, useInput } from '@nextui-org/react';

import { getSearchTvShows } from '~/services/tmdb/tmdb.server';
import MediaList from '~/src/components/Media/MediaList';
import useMediaQuery from '~/hooks/useMediaQuery';

type LoaderData = {
  searchResults: Awaited<ReturnType<typeof getSearchTvShows>>;
};

export const loader: LoaderFunction = async ({ request, params }: DataFunctionArgs) => {
  const keyword = params?.tvKeyword || '';
  const url = new URL(request.url);
  const page = Number(url.searchParams.get('page'));
  if (!page || page < 1 || page > 1000) {
    return json<LoaderData>({
      searchResults: await getSearchTvShows(keyword),
    });
  }
  return json<LoaderData>({
    searchResults: await getSearchTvShows(keyword, page),
  });
};

const SearchRoute = () => {
  const { searchResults } = useLoaderData<LoaderData>() || {};
  const navigate = useNavigate();
  const { tvKeyword } = useParams();
  const { value, bindings } = useInput(tvKeyword || '');
  const [listName] = React.useState('Search Results');
  const isXs = useMediaQuery(650);

  const paginationChangeHandler = (page: number) =>
    navigate(`/search/tv/${tvKeyword}?page=${page}`);
  const onClickSearch = () => navigate(`/search/tv/${value}`);
  return (
    <>
      <Grid.Container gap={1} css={{ padding: '30px 10px' }}>
        <Grid>
          <Input
            {...bindings}
            clearable
            bordered
            initialValue={tvKeyword}
            color="primary"
            fullWidth
            helperText="Input tv name and search"
          />
        </Grid>
        <Grid>
          <Button auto onClick={onClickSearch}>
            Search
          </Button>
        </Grid>
      </Grid.Container>
      <Container
        fluid
        display="flex"
        justify="center"
        direction="column"
        alignItems="center"
        css={{
          '@xsMax': {
            paddingLeft: 'calc(var(--nextui-space-sm))',
            paddingRight: 'calc(var(--nextui-space-sm))',
          },
        }}
      >
        {searchResults?.items.length > 0 && (
          <MediaList listType="grid" items={searchResults.items} listName={listName} />
        )}
        <Pagination
          total={searchResults.totalPages}
          initialPage={searchResults.page}
          shadow
          onChange={paginationChangeHandler}
          css={{ marginTop: '30px' }}
          {...(isXs && { size: 'xs' })}
        />
      </Container>
    </>
  );
};

export default SearchRoute;
