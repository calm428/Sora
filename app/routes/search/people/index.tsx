import * as React from 'react';
import { DataFunctionArgs, json, LoaderFunction } from '@remix-run/node';
import { Form, useLoaderData, useNavigate, Link } from '@remix-run/react';
import { Input, Grid, Container, Button, Pagination, useInput } from '@nextui-org/react';
import { useTranslation } from 'react-i18next';

import { getListPeople } from '~/services/tmdb/tmdb.server';
import PeopleList from '~/src/components/people/PeopleList';
import useMediaQuery from '~/hooks/useMediaQuery';
import i18next from '~/i18n/i18next.server';

type LoaderData = {
  people: Awaited<ReturnType<typeof getListPeople>>;
};

export const loader: LoaderFunction = async ({ request }: DataFunctionArgs) => {
  const locale = await i18next.getLocale(request);
  const url = new URL(request.url);
  let page = Number(url.searchParams.get('page')) || undefined;
  if (page && (page < 1 || page > 1000)) page = 1;

  return json<LoaderData>({
    people: await getListPeople('popular', locale, page),
  });
};

export const handle = {
  breadcrumb: () => <Link to="/search/people">Search People</Link>,
};

const SearchRoute = () => {
  const { people } = useLoaderData<LoaderData>() || {};
  const navigate = useNavigate();
  const { value, bindings } = useInput('');
  const isXs = useMediaQuery(650);
  const { t } = useTranslation();

  const paginationChangeHandler = (page: number) => navigate(`/people/popular?page=${page}`);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate(`/search/people/${value}`);
  };

  return (
    <>
      <Form onSubmit={onSubmit}>
        <Grid.Container gap={1} css={{ m: 0, padding: '30px 10px', width: '100%' }}>
          <Grid>
            <Input
              {...bindings}
              labelPlaceholder={t('searchPlaceHolder')}
              clearable
              bordered
              color="primary"
              fullWidth
              helperText={t('searchHelper')}
            />
          </Grid>
          <Grid>
            <Button auto type="submit">
              {t('search')}
            </Button>
          </Grid>
        </Grid.Container>
      </Form>
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
        {people?.results.length > 0 && (
          <PeopleList listType="grid" items={people.results} listName={t('popularPeople')} />
        )}
        <Pagination
          total={people.total_pages}
          initialPage={people.page}
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
