import * as React from 'react';
import { Link } from '@remix-run/react';
import Typography from '@mui/material/Typography';

// interface IListTvShowsProps {}

const ListTvShows = () => (
  <>
    <Typography variant="h4" component="h1" gutterBottom>
      List Tv Shows Page
    </Typography>
    <Link to="/tv-show" color="secondary">
      Go to the tv show detail page
    </Link>
  </>
);

export default ListTvShows;
