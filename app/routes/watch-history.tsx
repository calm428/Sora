import { useState } from 'react';
import { Button } from '@nextui-org/button';
import { Pagination } from '@nextui-org/pagination';
import { Badge, Checkbox, Input } from '@nextui-org/react';
import { useMediaQuery } from '@react-hookz/web';
import { json, type LoaderArgs } from '@remix-run/node';
import { NavLink, useLoaderData, useLocation, useNavigate } from '@remix-run/react';

import { authenticate, getCountHistory, getHistory, type IHistory } from '~/services/supabase';
import { CACHE_CONTROL } from '~/utils/server/http';
import HistoryItem from '~/components/media/item/HistoryItem';

export const handle = {
  breadcrumb: () => (
    <NavLink to="/watch-history" aria-label="Watch History Page">
      {({ isActive }) => (
        <Badge
          color="primary"
          variant="flat"
          css={{
            opacity: isActive ? 1 : 0.7,
            transition: 'opacity 0.25s ease 0s',
            '&:hover': { opacity: 0.8 },
          }}
        >
          History
        </Badge>
      )}
    </NavLink>
  ),
  getSitemapEntries: () => null,
  miniTitle: () => ({
    title: 'History',
    showImage: false,
  }),
};

export const loader = async ({ request }: LoaderArgs) => {
  const user = await authenticate(request, true, true);

  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page')) || 1;
  const types = searchParams.get('types');
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  return json(
    {
      histories: user ? await getHistory(user.id, types, from, to, page) : [],
      totalPage: user ? Math.ceil((await getCountHistory(user.id, types, from, to)) / 20) : 0,
      page,
    },
    {
      headers: {
        'Cache-Control': CACHE_CONTROL.default,
      },
    },
  );
};

const History = () => {
  const { histories, page, totalPage } = useLoaderData<typeof loader>();
  const isSm = useMediaQuery('(max-width: 650px)', { initializeWithValue: false });
  const navigate = useNavigate();
  const location = useLocation();

  const sParams = new URLSearchParams(location.search);

  const [types, setTypes] = useState(sParams.get('types')?.split(',') || []);
  const [from, setFrom] = useState(sParams.get('from'));
  const [to, setTo] = useState(sParams.get('to'));

  const searchHistoryHandler = () => {
    const params = new URLSearchParams();
    if ([1, 2].includes(types?.length)) params.append('types', types?.join(','));
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    navigate(`/watch-history?${params.toString()}`);
  };

  const paginationChangeHandler = (_page: number) => {
    const url = new URL(document.URL);
    url.searchParams.set('page', _page.toString());
    navigate(`${url.pathname}${url.search}`);
  };

  return (
    <div className="flex w-full flex-col justify-start gap-6">
      <h2>Your watch history</h2>
      <div className="flex flex-row flex-wrap items-center justify-start gap-4">
        <Checkbox.Group
          label="Select media types"
          orientation="horizontal"
          color="secondary"
          defaultValue={types}
          onChange={(values) => setTypes(values)}
        >
          <Checkbox value="movie">Movie</Checkbox>
          <Checkbox value="tv">TV Show</Checkbox>
          <Checkbox value="anime">Anime</Checkbox>
        </Checkbox.Group>
        <Input
          width="186px"
          label="From"
          type="date"
          css={{ marginRight: '1rem' }}
          value={from || undefined}
          onChange={(e) => setFrom(e.target.value)}
        />
        <Input
          width="186px"
          label="To"
          type="date"
          value={to || undefined}
          onChange={(e) => setTo(e.target.value)}
        />
      </div>
      <Button
        type="button"
        color="primary"
        size="md"
        onPress={searchHistoryHandler}
        className="w-48"
      >
        Search History
      </Button>
      <div className="grid w-full grid-cols-1 justify-items-center gap-4 xl:grid-cols-2">
        {histories.map((item) => (
          <HistoryItem key={item.id} item={item as unknown as IHistory} />
        ))}
      </div>
      {totalPage > 1 ? (
        <div className="mt-7 flex justify-center">
          <Pagination
            showControls={!isSm}
            total={totalPage}
            initialPage={page}
            // shadow
            onChange={paginationChangeHandler}
            {...(isSm && { size: 'xs' })}
          />
        </div>
      ) : null}
    </div>
  );
};

export default History;
