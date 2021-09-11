import React from "react"
import axios from "axios"
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@material-ui/core"
import PropTypes from "prop-types"

const HistoryTable = ({ rows }) => (
  <TableContainer component={Paper}>
    <Table aria-label="simple table">
      <TableHead>
        <TableRow>
          <TableCell align="center">Seller</TableCell>
          <TableCell align="center">Buyer</TableCell>
          <TableCell align="center">Quantity</TableCell>
          <TableCell align="center">Price</TableCell>
          <TableCell align="center">Date</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row, i) => (
          <TableRow key={i}>
            <TableCell align="center">{row.seller}</TableCell>
            <TableCell align="center">{row.buyer}</TableCell>
            <TableCell align="center">{row.quantity}</TableCell>
            <TableCell align="center">{row.price}</TableCell>
            <TableCell align="center">{row.timestamp.toLocaleString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
)

const TransactionHistory = () => {
  const [date, setDate] = React.useState(new Date())
  const [transactions, setTransactions] = React.useState([])

  const tick = () => {
    axios
      .get("/api/transactions")
      .then(res => res.data)
      .then(res => res.transactions)
      .then(res => setTransactions(res))
      .catch(err => console.error(err))
    setDate(new Date())
  }

  React.useEffect(() => {
    const timerID = setTimeout(() => tick(), 2000)
    return () => {
      clearTimeout(timerID)
    }
  }, [date])

  return (
    <>
      <h4>Transaction History</h4>
      <div className="d-flex justify-content-center">
        <HistoryTable rows={transactions ? transactions : []} />
      </div>
    </>
  )
}

export default TransactionHistory
