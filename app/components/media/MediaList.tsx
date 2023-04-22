import { Suspense, useState } from 'react';
import { Button, Loading, Pagination, Row, Spacer, Tooltip } from '@nextui-org/react';
import { useMediaQuery } from '@react-hookz/web';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ClientOnly } from 'remix-utils';

import type { IMedia } from '~/types/media';
import type { ILanguage } from '~/services/tmdb/tmdb.types';
import { useSoraSettings } from '~/hooks/useLocalStorage';
import ChevronLeftIcon from '~/assets/icons/ChevronLeftIcon';
import ChevronRightIcon from '~/assets/icons/ChevronRightIcon';
import FilterIcon from '~/assets/icons/FilterIcon';
import ViewGridIcon from '~/assets/icons/ViewGridIcon';
import ViewTableIcon from '~/assets/icons/ViewTableIcon';

import Filter from '../elements/filter/Filter';
import Flex from '../styles/Flex.styles';
import { H2 } from '../styles/Text.styles';
import { MediaListBanner, MediaListCard, MediaListGrid, MediaListTable } from './list';

/**
 * @typedef {Object} IMediaListProps
 * @property {Array<{ id: number; name: string; backdropPath: string }>} [coverItem] - Require when cover card is true, value is cover items to show
 * @property {number} [currentPage] - Require when pagination is true, loading type is page, value is current page
 * @property {{ [id: string]: string }} [genresMovie] - Pass genres movie object
 * @property {{ [id: string]: string }} [genresTv] - Pass genres tv object
 * @property {boolean} [hasNextPage] - Require when loading type is scroll, value is true if there is a next page
 * @property {boolean} [isCoverCard] - Value is true if the cover card is active
 * @property {Array<IMedia>} [items] - Value is items to show
 * @property {'movie' | 'tv' | 'anime' | 'people' | 'episode'} [itemsType] - Value is type of items to show, help to show the correct url, item type and item title
 * @property {Array<ILanguage>} [languages] - Pass languages object
 * @property {string | (() => never)} [listName] - Value is list name to show
 * @property {'table' | 'card' | 'banner' | 'grid'} [listType] - Value is list type to show
 * @property {'page' | 'scroll'} [loadingType] - Value is loading type to show
 * @property {'movie' | 'tv' | 'anime'} [mediaType] - Value is media type to show, help for filter type
 * @property {boolean} [navigationButtons] - Value is true if the navigation buttons are active
 * @property {() => void} [onClickViewMore] - Require when view more button is true, value is function to execute when view more button is clicked
 * @property {(page: number) => void} [onPageChangeHandler] - Require when pagination is true, value is function to execute when page is changed
 * @property {string} [provider] - Value is provider name, help to show the correct url for episode itemsType
 * @property {string} [routeName] - Value is route name, help to load the correct route when scrolling
 * @property {boolean} [showFilterButton] - Value is true if the filter button is active
 * @property {boolean} [showListTypeChangeButton] - Value is true if the list type change button is active
 * @property {boolean} [showMoreList] - Value is true if the view more button is active
 * @property {boolean} [showPagination] - Value is true if the pagination is active
 * @property {number} [totalPages] - Require when pagination is true, value is total pages
 * @property {boolean} [virtual] - Value is true if the virtual list is active
 */
interface IMediaListProps {
  /**
   * Require when cover card is true, value is cover items to show
   * @type {Array<{ id: number; name: string; backdropPath: string }>}
   * @memberof IMediaListProps
   * @example
   * [
   *  {
   *    id: 1,
   *    name: 'Movie name',
   *    backdropPath: '/backdrop/path'
   *  }
   * ]
   */
  coverItem?: { id: number; name: string; backdropPath: string }[];
  /**
   * Require when pagination is true, loading type is page, value is current page
   * @type {number}
   * @memberof IMediaListProps
   * @example
   * 1
   * 2
   * 3
   * ...
   * 10
   */
  currentPage?: number;
  /**
   * Pass genres movie object
   * @type {{ [id: string]: string }}
   * @memberof IMediaListProps
   * @example
   * {
   *  '1': 'Action',
   *  '2': 'Adventure',
   *  '3': 'Animation',
   *  '4': 'Comedy',
   * }
   */
  genresMovie?: { [id: string]: string };
  /**
   * Pass genres tv object
   * @type {{ [id: string]: string }}
   * @memberof IMediaListProps
   * @example
   * {
   *  '1': 'Action',
   *  '2': 'Adventure',
   *  '3': 'Animation',
   *  '4': 'Comedy',
   * }
   */
  genresTv?: { [id: string]: string };
  /**
   * Require when loading type is scroll, value is true if there is a next page
   * @type {boolean}
   * @memberof IMediaListProps
   * @example
   * true
   * false
   */
  hasNextPage?: boolean;
  /**
   * Value is true if the cover card is active
   * @type {boolean}
   * @memberof IMediaListProps
   * @example
   * true
   * false
   */
  isCoverCard?: boolean;
  /**
   * Value is items to show
   * @type {Array<IMedia>}
   * @memberof IMediaListProps
   * @see IMedia
   */
  items?: IMedia[];
  /**
   * Value is type of items to show, help to show the correct url, item type and item title
   * @type {'movie' | 'tv' | 'anime' | 'people' | 'episode'}
   * @memberof IMediaListProps
   * @example
   * 'movie'
   * 'tv'
   * 'anime'
   * 'people'
   * 'episode'
   */
  itemsType?: 'movie' | 'tv' | 'anime' | 'people' | 'episode';
  /**
   * Pass languages object
   * @type {Array<ILanguage>}
   * @memberof IMediaListProps
   * @see ILanguage
   */
  languages?: ILanguage[];
  /**
   * Value is name of the list
   * @type {string | (() => never)}
   * @memberof IMediaListProps
   * @example
   * 'Popular Movies'
   * t('Popular Movies')
   */
  listName?: string | (() => never);
  /**
   * Value is type of list to show
   * @type {'table' | 'slider-card' | 'slider-banner' | 'grid'}
   * @memberof IMediaListProps
   * @example
   * 'table'
   * 'slider-card'
   * 'slider-banner'
   * 'grid'
   */
  listType?: 'table' | 'slider-card' | 'slider-banner' | 'grid';
  /**
   * Value is type of loading to show
   * @type {'page' | 'scroll'}
   * @memberof IMediaListProps
   * @example
   * 'page'
   * 'scroll'
   */
  loadingType?: 'page' | 'scroll';
  /**
   * Value is true if the media to show, help for filter type
   * @type {'movie' | 'tv' | 'anime'}
   * @memberof IMediaListProps
   * @example
   * 'movie'
   * 'tv'
   * 'anime'
   */
  mediaType?: 'movie' | 'tv' | 'anime';
  /**
   * Value is true if the navigation buttons are active
   * @type {boolean}
   * @memberof IMediaListProps
   * @example
   * true
   * false
   */
  navigationButtons?: boolean;
  /**
   * Require when view more button is true, value is function to execute when view more button is clicked
   * @memberof IMediaListProps
   * @example
   * () => console.log('View more button is clicked')
   */
  onClickViewMore?: () => void;
  /**
   * Require when pagination is true, value is function to execute when page is changed
   * @memberof IMediaListProps
   * @example
   * (page: number) => console.log('Page is changed to', page)
   */
  onPageChangeHandler?: (page: number) => void;
  /**
   * Value is provider name, help to show the correct url for episode itemsType
   * @type {string}
   * @memberof IMediaListProps
   * @example
   * 'Gogo'
   * 'Zoro'
   */
  provider?: string;
  /**
   * Value is route name, help to load the correct route when scrolling in scroll loading type
   * @type {string}
   * @memberof IMediaListProps
   * @example
   * '/anime/popular'
   */
  routeName?: string;
  /**
   * Value is true if the filter button is active
   * @type {boolean}
   * @memberof IMediaListProps
   * @example
   * true
   * false
   */
  showFilterButton?: boolean;
  /**
   * Value is true if the list type change button is active
   * @type {boolean}
   * @memberof IMediaListProps
   * @example
   * true
   * false
   */
  showListTypeChangeButton?: boolean;
  /**
   * Value is true if the view more button is active
   * @type {boolean}
   * @memberof IMediaListProps
   * @example
   * true
   * false
   */
  showMoreList?: boolean;
  /**
   * Value is true if the pagination is active
   * @type {boolean}
   * @memberof IMediaListProps
   * @example
   * true
   * false
   */
  showPagination?: boolean;
  /**
   * Require when pagination is true, value is total pages
   * @type {number}
   * @memberof IMediaListProps
   * @example
   * 10
   * 20
   * 30
   * ...
   */
  totalPages?: number;
  /**
   * Value is true if the list is virtual
   * @type {boolean}
   * @memberof IMediaListProps
   * @example
   * true
   * false
   */
  virtual?: boolean; // value is true if the list is virtual
}

const MediaList = (props: IMediaListProps) => {
  const {
    coverItem,
    currentPage,
    genresMovie,
    genresTv,
    hasNextPage,
    isCoverCard,
    items,
    itemsType,
    languages,
    listName,
    loadingType,
    mediaType,
    navigationButtons,
    onClickViewMore,
    onPageChangeHandler,
    provider,
    routeName,
    showFilterButton,
    showListTypeChangeButton,
    showMoreList,
    showPagination,
    totalPages,
    virtual,
  } = props;
  let { listType } = props;
  let list;
  const { t } = useTranslation();

  const [prevEl, setPrevEl] = useState<HTMLElement | null>(null);
  const [nextEl, setNextEl] = useState<HTMLElement | null>(null);
  const [slideProgress, setSlideProgress] = useState<number>(0);
  const [displayType, setDisplayType] = useState<string>(listType as string);
  const { showFilter } = useSoraSettings();
  const is2Xs = useMediaQuery('(max-width: 320px)', { initializeWithValue: false });
  const isSm = useMediaQuery('(max-width: 650px)', { initializeWithValue: false });

  if (!listType && typeof window !== 'undefined') {
    listType =
      (localStorage.getItem('listType') as 'table' | 'slider-card' | 'slider-banner' | 'grid') ??
      'grid';
  }

  const filterChangeHandler = (value: string) => {
    setDisplayType(value);
    localStorage.setItem('listType', value);
  };

  switch (displayType) {
    case 'grid':
      list = (
        <MediaListGrid
          coverItem={coverItem}
          genresMovie={genresMovie}
          genresTv={genresTv}
          hasNextPage={hasNextPage}
          isCoverCard={isCoverCard}
          items={items}
          itemsType={itemsType}
          loadingType={loadingType}
          provider={provider}
          routeName={routeName}
          virtual={virtual}
        />
      );
      break;
    case 'table':
      list = <MediaListTable items={items} />;
      break;
    case 'slider-banner':
      list = <MediaListBanner items={items} genresMovie={genresMovie} genresTv={genresTv} />;
      break;
    case 'slider-card':
      list = (
        <MediaListCard
          coverItem={coverItem}
          genresMovie={genresMovie}
          genresTv={genresTv}
          isCoverCard={isCoverCard}
          items={items}
          itemsType={itemsType}
          navigation={{ nextEl, prevEl }}
          provider={provider}
          setSlideProgress={setSlideProgress}
          virtual={virtual}
        />
      );
      break;
    default:
  }

  return (
    <Flex
      direction="column"
      justify="center"
      align={
        listType === 'grid' || listType === 'table' || listType === 'slider-banner'
          ? 'center'
          : 'start'
      }
      css={{ width: '100%', maxWidth: '1920px' }}
    >
      {listName || showFilterButton || showListTypeChangeButton ? (
        <Flex direction="row" justify="between" align="center" wrap="wrap" css={{ width: '100%' }}>
          {listName ? (
            <H2
              h2
              css={{
                margin: '20px 0 5px 0',
                '@xsMax': {
                  fontSize: '1.75rem !important',
                },
              }}
            >
              {listName}
            </H2>
          ) : null}
          {showFilterButton || showListTypeChangeButton ? (
            <Flex direction="row" justify="end" align="center" css={{ gap: '$5' }}>
              {showFilterButton ? (
                <Tooltip content={t('show-hide-filter')}>
                  <Button
                    type="button"
                    auto
                    color="primary"
                    bordered={!showFilter.value}
                    icon={<FilterIcon />}
                    onPress={() => showFilter.set(!showFilter.value)}
                  />
                </Tooltip>
              ) : null}
              {showListTypeChangeButton ? (
                <Button.Group css={{ margin: 0 }}>
                  <Button
                    type="button"
                    onPress={() => filterChangeHandler('grid')}
                    icon={<ViewGridIcon width={40} height={40} />}
                    {...(displayType === 'grid' ? {} : { ghost: true })}
                  />
                  <Button
                    type="button"
                    onPress={() => filterChangeHandler('table')}
                    icon={<ViewTableIcon width={40} height={40} />}
                    {...(displayType === 'table' ? {} : { ghost: true })}
                  />
                </Button.Group>
              ) : null}
            </Flex>
          ) : null}
        </Flex>
      ) : null}
      {showMoreList ? (
        <Row fluid justify="space-between" wrap="nowrap" align="center">
          <Button
            type="button"
            auto
            size={isSm ? 'sm' : 'md'}
            rounded
            ghost
            onPress={onClickViewMore}
            css={{
              maxWidth: '$8',
              marginBottom: '$5',
            }}
          >
            {t('viewMore')}
          </Button>
          {navigationButtons ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                marginBottom: 'var(--nextui-space-5)',
              }}
            >
              <Button
                type="button"
                auto
                color="primary"
                rounded
                ghost
                ref={(node) => setPrevEl(node)}
                css={{
                  width: '32px',
                  height: '32px',
                  padding: 0,
                  cursor: 'pointer',
                  '&:hover': { opacity: '0.8' },
                  '@xs': { width: '44px', height: '44px' },
                }}
                aria-label="Previous"
                disabled={slideProgress === 0}
                icon={<ChevronLeftIcon height={isSm ? 18 : 24} width={isSm ? 18 : 24} />}
              />
              <Spacer x={0.25} />
              <Button
                type="button"
                auto
                color="primary"
                rounded
                ghost
                ref={(node) => setNextEl(node)}
                css={{
                  width: '32px',
                  height: '32px',
                  padding: 0,
                  cursor: 'pointer',
                  '&:hover': { opacity: '0.8' },
                  '@xs': { width: '44px', height: '44px' },
                }}
                aria-label="Next"
                disabled={slideProgress === 1}
                icon={<ChevronRightIcon height={isSm ? 18 : 24} width={isSm ? 18 : 24} />}
              />
            </div>
          ) : null}
        </Row>
      ) : null}
      <AnimatePresence>
        {showFilter.value && mediaType && (
          <ClientOnly fallback={<Loading type="default" />}>
            {() => (
              <Suspense fallback={<Loading type="default" />}>
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                  style={{ width: '100%' }}
                >
                  <Filter
                    genres={mediaType === 'movie' ? genresMovie : genresTv}
                    mediaType={mediaType}
                    languages={languages}
                  />
                </motion.div>
              </Suspense>
            )}
          </ClientOnly>
        )}
      </AnimatePresence>
      {list}
      {showPagination && totalPages && totalPages > 1 ? (
        <Pagination
          total={totalPages}
          initialPage={currentPage}
          // shadow
          onChange={onPageChangeHandler}
          css={{ marginTop: '50px' }}
          {...(isSm && !is2Xs ? { size: 'sm' } : isSm && is2Xs ? { size: 'xs' } : {})}
        />
      ) : null}
    </Flex>
  );
};

export default MediaList;
