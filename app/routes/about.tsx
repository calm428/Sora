import * as React from 'react';
import { Link } from '@remix-run/react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

// interface IAboutProps {}

const About = () => (
  <>
    <Typography variant="h4" component="h1" gutterBottom>
      Hello again !
    </Typography>
    <Button variant="contained" component={Link} to="/">
      Go to the main page
    </Button>
  </>
);

export default About;
