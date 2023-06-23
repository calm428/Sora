import { json, type LoaderArgs, type MetaFunction } from '@remix-run/node';
import { useLoaderData, useLocation, useNavigate, type RouteMatch } from '@remix-run/react';
import i18next from '~/i18n/i18next.server';
import { motion, type PanInfo } from 'framer-motion';
import { isMobile } from 'react-device-detect';
import { useTranslation } from 'react-i18next';
import { useHydrated } from 'remix-utils';

import { authenticate } from '~/services/supabase';
import { getSearchPerson } from '~/services/tmdb/tmdb.server';
import { CACHE_CONTROL } from '~/utils/server/http';
import MediaList from '~/components/media/MediaList';
import { BreadcrumbItem } from '~/components/elements/Breadcrumb';
import SearchForm from '~/components/elements/SearchForm';

export const loader = async ({ request, params }: LoaderArgs) => {
  const [, locale] = await Promise.all([
    authenticate(request, undefined, true),
    i18next.getLocale(request),
  ]);

  const keyword = params?.peopleKeyword || '';
  const url = new URL(request.url);
  let page = Number(url.searchParams.get('page')) || undefined;
  if (page && (page < 1 || page > 1000)) page = 1;

  return json(
    {
      searchResults: await getSearchPerson(keyword, page, undefined, locale),
    },
    {
      headers: { 'Cache-Control': CACHE_CONTROL.search },
    },
  );
};

export const meta: MetaFunction = ({ data, params }) => {
  const { searchResults } = data;
  return {
    title: `Search results for '${params.peopleKeyword}' on Sora`,
    description: `Watch ${params.peopleKeyword} movie, tv seris in full HD online with Subtitle`,
    keywords: `watch ${params.peopleKeyword} free, watch ${params.peopleKeyword} movies, watch ${params.peopleKeyword} series, stream ${params.peopleKeyword} series, ${params.peopleKeyword} movies online free`,
    'og:url': `https://sora-anime.vercel.app/search/people/${params.peopleKeyword}`,
    'og:title': `Search results for '${params.peopleKeyword}' on Sora`,
    'og:description': `Watch ${params.peopleKeyword} in full HD online with Subtitle`,
    'og:image': searchResults?.items[0]?.posterPath || '',
  };
};

export const handle = {
  breadcrumb: (match: RouteMatch) => (
    <BreadcrumbItem
      to={`/search/people/${match.params.peopleKeyword}`}
      key={`search-people-${match.params.peopleKeyword}`}
    >
      {match.params.peopleKeyword}
    </BreadcrumbItem>
  ),
  miniTitle: (match: RouteMatch) => ({
    title: 'Search results',
    subtitle: match.params.peopleKeyword,
    showImage: false,
  }),
};

const SearchRoute = () => {
  const { searchResults } = useLoaderData<typeof loader>() || {};
  const navigate = useNavigate();
  const location = useLocation();
  const isHydrated = useHydrated();
  const { t } = useTranslation();

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset?.x > 100) {
      navigate('/search/anime');
    }
    if (info.offset?.x < -100 && info.offset?.y > -50) {
      return;
    }
  };

  const onSubmit = (value: string) => {
    navigate(`/search/people/${value}`);
  };

  return (
    <motion.div
      key={location.key}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex w-full flex-col items-center justify-center px-3 sm:px-0"
      drag={isMobile && isHydrated ? 'x' : false}
      dragConstraints={isMobile && isHydrated ? { left: 0, right: 0 } : false}
      dragElastic={isMobile && isHydrated ? 0.7 : false}
      onDragEnd={handleDragEnd}
      dragDirectionLock={isMobile && isHydrated}
      draggable={isMobile && isHydrated}
    >
      <SearchForm
        onSubmit={onSubmit}
        textHelper={t('search.helper.people')}
        textOnButton={t('search.action')}
        textPlaceHolder={t('search.placeHolder.people')}
      />
      <MediaList
        currentPage={searchResults?.page}
        items={searchResults?.items}
        itemsType="people"
        listName={t('search.searchResults')}
        listType="grid"
        totalPages={searchResults?.totalPages}
      />
    </motion.div>
  );
};

export default SearchRoute;
