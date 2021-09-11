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

const OrderTable = ({ rows }) => (
  <TableContainer component={Paper}>
    <Table aria-label="simple table">
      <TableHead>
        <TableRow>
          <TableCell align="center">ID</TableCell>
          <TableCell align="center">Order</TableCell>
          <TableCell align="center">Quantity</TableCell>
          <TableCell align="center">Price</TableCell>
          <TableCell align="center">Date</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map(row => (
          <TableRow key={row.uuid}>
            <TableCell component="th" scope="row">
              {row.uuid}
            </TableCell>
            <TableCell align="center">{row.side}</TableCell>
            <TableCell align="center">{row.quantity}</TableCell>
            <TableCell align="center">{row.price}</TableCell>
            <TableCell align="center">{row.timestamp.toLocaleString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
)

const Orderbook = ({ emptyBook = { buyQueue: [], sellQueue: [] } }) => {
  const [date, setDate] = React.useState(new Date())
  const [book, setBook] = React.useState(emptyBook)

  const tick = () => {
    axios
      .get("/api/book")
      .then(res => res.data)
      .then(res => res.book)
      .then(res => setBook(res))
      .catch(err => console.error(err))
    setDate(new Date())
  }

  React.useEffect(() => {
    const timerID = setTimeout(() => tick(), 250)
    return () => {
      clearTimeout(timerID)
    }
  }, [date])

  return (
    <>
      <h4>Orderbook</h4>
      <div className="d-flex justify-content-center">
        <OrderTable rows={book ? book.sellQueue : []} />
        <div style={{paddingLeft: "1rem"}}/>
        <OrderTable rows={book ? book.buyQueue : []} />
      </div>
    </>
  )
}

export default Orderbook
