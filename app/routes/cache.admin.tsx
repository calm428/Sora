import { useMemo, useState } from 'react';
import { Button } from '@nextui-org/button';
import { Spacer } from '@nextui-org/spacer';
import {
  json,
  redirect,
  type ActionArgs,
  type LoaderArgs,
  type MetaFunction,
} from '@remix-run/node';
import {
  useFetcher,
  useLoaderData,
  useLocation,
  useNavigate,
  useSearchParams,
} from '@remix-run/react';
import type { CacheEntry } from 'cachified';
import { motion } from 'framer-motion';
import { badRequest } from 'remix-utils';

import { getAllCacheKeys, lruCache, searchCacheKeys } from '~/services/lru-cache';
import { getUserFromCookie } from '~/services/supabase';
import { BreadcrumbItem } from '~/components/elements/Breadcrumb';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/elements/Dialog';
import SearchForm from '~/components/elements/SearchForm';
import ErrorBoundaryView from '~/components/elements/shared/ErrorBoundaryView';

const loader = async ({ request }: LoaderArgs) => {
  const cookie = request.headers.get('Cookie');
  if (!cookie) {
    throw redirect('/sign-in');
  }
  const user = await getUserFromCookie(cookie as string);
  if (!user) {
    throw redirect('/sign-in');
  }
  const admin = process.env.ADMIN_ID?.split(',');
  if (user && !admin?.includes(user.id)) {
    throw redirect('/');
  }
  const url = new URL(request.url);
  const query = url.searchParams.get('query');
  let cacheKeys: { key: string; data: CacheEntry<unknown> }[];
  if (typeof query === 'string') {
    cacheKeys = await searchCacheKeys(query);
  } else {
    cacheKeys = await getAllCacheKeys();
  }
  return json({ cacheKeys });
};

const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();
  const cacheKey = formData.get('cacheKey') as string;
  if (typeof cacheKey !== 'string') {
    throw badRequest({ message: 'Invalid cache key' });
  }
  lruCache.delete(cacheKey);
  return json({ success: true });
};

const meta: MetaFunction = () => ({
  title: 'Cache Admin',
  description: 'Cache Admin',
});

const handle = {
  breadcrumb: () => (
    <BreadcrumbItem to="/cache/admin" key="cache-admin">
      Cache Admin
    </BreadcrumbItem>
  ),
  miniTitle: () => ({
    title: 'Cache Management',
    showImage: false,
  }),
};

const CacheKeyRow = ({
  cacheKey,
  handleOpenDetailCache,
}: {
  cacheKey: string;
  handleOpenDetailCache: (cacheKey: string) => void;
}) => {
  const fetcher = useFetcher();
  const [doubleCheck, setDoubleCheck] = useState(false);
  return (
    <div className="flex items-center gap-2 font-mono">
      <fetcher.Form method="post">
        <input type="hidden" name="cacheKey" value={cacheKey} />
        {/* @ts-ignore */}
        <Button
          variant="ghost"
          color="danger"
          onBlur={() => setDoubleCheck(false)}
          onPress={(e) => {
            const target = e.target as HTMLFormElement;
            if (doubleCheck) {
              fetcher.submit(target?.form);
            } else {
              setDoubleCheck(true);
            }
          }}
        >
          {fetcher.state === 'idle' ? (doubleCheck ? 'You sure?' : 'Delete') : 'Deleting...'}
        </Button>
      </fetcher.Form>
      <Button variant="light" color="primary" onPress={() => handleOpenDetailCache(cacheKey)}>
        {cacheKey}
      </Button>
    </div>
  );
};

const CacheAdminRoute = () => {
  const { cacheKeys } = useLoaderData<typeof loader>();
  const [showDetailCache, setShowDetailCache] = useState(false);
  const [currentCacheKey, setCurrentCacheKey] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const query = searchParams.get('query') ?? '';
  const currentCache = useMemo(() => {
    if (currentCacheKey) {
      return cacheKeys.find((cacheKey) => cacheKey.key === currentCacheKey);
    }
    return null;
  }, [currentCacheKey, cacheKeys]);
  const handleShowDetailCache = (cacheKey: string) => {
    setCurrentCacheKey(cacheKey);
    setShowDetailCache(true);
  };
  const closeHandler = () => {
    setShowDetailCache(false);
  };
  const onSubmit = (value: string) => {
    navigate(`/cache/admin?query=${value}`);
  };

  return (
    <motion.div
      key={location.key}
      initial={{ x: '-10%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '-10%', opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-screen-4xl flex w-full flex-col justify-start px-3 sm:px-0">
        <h2>Cache Admin</h2>
        <SearchForm
          onSubmit={onSubmit}
          textOnButton="Search"
          textPlaceHolder="Search cache key"
          defaultValue={query}
        />
        <Spacer x={5} />
        <Dialog open={showDetailCache} onOpenChange={setShowDetailCache}>
          <div className="flex flex-col gap-4">
            {cacheKeys.map((cacheKey) => (
              <DialogTrigger key={cacheKey.key}>
                <CacheKeyRow
                  cacheKey={cacheKey.key}
                  handleOpenDetailCache={(key) => handleShowDetailCache(key)}
                />
              </DialogTrigger>
            ))}
          </div>
          <DialogContent>
            <DialogHeader>
              <DialogTitle id="modal-title">Cache detail</DialogTitle>
            </DialogHeader>
            {currentCache ? (
              <div className="flex flex-col gap-4" id="modal-description">
                <h5>
                  Cache Key: <span>{currentCache.key}</span>
                </h5>
                <h5>
                  Cache TTL: <span>{currentCache.data.metadata.ttl}</span>
                </h5>
                <h5>
                  Cache Stale While Revalidate: <span>{currentCache.data.metadata.swr}</span>
                </h5>
                <h5>
                  Cache Created At: <span>{currentCache.data.metadata.createdTime}</span>
                </h5>
                <h5>
                  Cache Data: <span>{JSON.stringify(currentCache.data.value)}</span>
                </h5>
              </div>
            ) : null}
            <DialogFooter>
              <Button variant="flat" color="danger" onPress={closeHandler}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </motion.div>
  );
};

const ErrorBoundary = ({ error }: { error: Error }) => <ErrorBoundaryView error={error} />;

export default CacheAdminRoute;
export { loader, action, meta, handle, ErrorBoundary };
