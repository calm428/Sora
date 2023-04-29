/* eslint-disable @typescript-eslint/indent */

import { Badge, Button } from '@nextui-org/react';
import type { MetaFunction } from '@remix-run/node';
import { NavLink, useLocation, useNavigate } from '@remix-run/react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/elements/Dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/elements/Select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '~/components/elements/Sheet';
import { H2, H4 } from '~/components/styles/Text.styles';
import Info from '~/assets/icons/InfoIcon';

export const meta: MetaFunction = () => ({
  title: 'Design System',
  description: 'This page for testing the design system',
  'og:title': 'Design System',
  'og:description': 'This page for testing the design system',
});

export const handle = {
  breadcrumb: () => (
    <NavLink to="/test/design-system" aria-label="Design system Page">
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
          Design System
        </Badge>
      )}
    </NavLink>
  ),
  miniTitle: () => ({
    title: 'Design System',
    showImage: false,
  }),
  getSitemapEntries: () => null,
};

const DesignSystem = () => {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <motion.div
      key={location.key}
      initial={{ x: '-10%', opacity: 0 }}
      animate={{ x: '0', opacity: 1 }}
      exit={{ y: '-10%', opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col justify-start gap-y-4"
    >
      <H2 h2>Design System</H2>
      <div className="flex flex-row gap-x-2">
        <Sheet>
          <SheetTrigger asChild>
            <Button type="button" auto ghost aria-label="dropdown">
              Top
            </Button>
          </SheetTrigger>
          <SheetContent side="top" hideCloseButton>
            <SheetTitle asChild>
              <H4 h4>Sheet Title</H4>
            </SheetTitle>
            <SheetDescription>Sheet Description</SheetDescription>
          </SheetContent>
        </Sheet>
        <Sheet>
          <SheetTrigger asChild>
            <Button type="button" auto ghost aria-label="dropdown">
              Right
            </Button>
          </SheetTrigger>
          <SheetContent side="right" hideCloseButton>
            <SheetTitle asChild>
              <H4 h4>Sheet Title</H4>
            </SheetTitle>
            <SheetDescription>Sheet Description</SheetDescription>
          </SheetContent>
        </Sheet>
        <Sheet>
          <SheetTrigger asChild>
            <Button type="button" auto ghost aria-label="dropdown">
              Bottom
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" hideCloseButton>
            <SheetTitle asChild>
              <H4 h4>Sheet Title</H4>
            </SheetTitle>
            <SheetDescription>Sheet Description</SheetDescription>
          </SheetContent>
        </Sheet>
        <Sheet>
          <SheetTrigger asChild>
            <Button type="button" auto ghost aria-label="dropdown">
              Left
            </Button>
          </SheetTrigger>
          <SheetContent side="left" hideCloseButton>
            <SheetTitle asChild>
              <H4 h4>Sheet Title</H4>
            </SheetTitle>
            <SheetDescription>Sheet Description</SheetDescription>
          </SheetContent>
        </Sheet>
      </div>
      <div className="flex flex-row gap-x-4">
        <Button type="button" auto onPress={() => navigate('/test/gesg')}>
          test catch boundary
        </Button>
        <Button auto onPress={() => toast('This is a toast', { duration: Infinity })}>
          Show toast
        </Button>
        <Button
          auto
          onPress={() =>
            toast('This is a toast', {
              description: 'This is a toast description',
              icon: <Info className="h-5 w-5" />,
              duration: Infinity,
            })
          }
        >
          Show toast with description
        </Button>
        <Button
          auto
          onPress={() =>
            toast.success('This is a success toast', {
              description: 'This is a toast description',
              duration: Infinity,
            })
          }
        >
          Show success toast
        </Button>
        <Button
          auto
          onPress={() =>
            toast.error('This is a error toast', {
              description: 'This is a toast description',
              duration: Infinity,
            })
          }
        >
          Show error toast
        </Button>
        <Button
          auto
          onPress={() =>
            toast('This is a action toast', {
              action: {
                label: 'Undo',
                // eslint-disable-next-line no-console
                onClick: () => console.log('Undo'),
              },
              duration: Infinity,
            })
          }
        >
          Show action toast
        </Button>
        <Button
          auto
          onPress={() =>
            toast.promise(
              () =>
                new Promise((resolve) => {
                  setTimeout(resolve, 2000);
                }),
              {
                loading: 'Loading...',
                success: 'Success',
                error: 'Error',
                duration: Infinity,
              },
            )
          }
        >
          Show promise toast
        </Button>
      </div>
      <div className="flex flex-row gap-x-4">
        <Dialog>
          <DialogTrigger asChild>
            <Button auto type="button">
              Open Dialog
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you sure absolutely sure?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete your account and remove
                your data from our servers.
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex flex-row gap-x-4">
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Theme" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Theme" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </motion.div>
  );
};

export default DesignSystem;
