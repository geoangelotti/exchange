import * as React from "react"
import { Link } from "gatsby"
import Layout from "../components/layout"
import Seo from "../components/seo"
import Orderbook from "../components/orderbook"

const IndexPage = () => (
  <Layout>
    <Seo title="Orderbook" />
    <p>
      <Link to="/transactions/">Go to transaction history</Link> <br />
    </p>
    <Orderbook />
  </Layout>
)

export default IndexPage
