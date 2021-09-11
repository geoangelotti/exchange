import * as React from "react"
import { Link } from "gatsby"
import Layout from "../components/layout"
import Seo from "../components/seo"
import TransactionHistory from '../components/transaction_history'

const Transactions = () => (
  <Layout>
    <Seo title="Transactions" />
    <Link to="/">Go back to the ordebook</Link>
    <TransactionHistory />
  </Layout>
)

export default Transactions
