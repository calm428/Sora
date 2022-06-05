import * as React from "react"
import type { MetaFunction } from "@remix-run/node"
import { Link } from "@remix-run/react"
import Typography from "@mui/material/Typography"
import { Container } from "@nextui-org/react"

interface IIndexProps {}

// https://remix.run/api/conventions#meta
export const meta: MetaFunction = () => {
  return {
    title: "Remix App",
    description: "（づ￣3￣）づ╭❤️～",
  }
}

// https://remix.run/guides/routing#index-routes
const Index: React.FC<IIndexProps> = (props: IIndexProps) => {
  const {} = props
  return (
    <Container fluid>
      <Typography variant="h4" component="h1" gutterBottom>
        Hello World !!!
      </Typography>
      <Link to="/about" color="secondary">
        Go to the about page
      </Link>
    </Container>
  )
}

export default Index
