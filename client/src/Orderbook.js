import React from 'react';
import axios from 'axios';
import {Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@material-ui/core';

const OrderTable = ({rows}) => (
	<TableContainer component={Paper}>
		<Table aria-label="simple table">
			<TableHead>
				<TableRow>
				<TableCell>ID</TableCell>
				<TableCell align="right">Order</TableCell>
				<TableCell align="right">Quantity</TableCell>
				<TableCell align="right">Price</TableCell>
				<TableCell align="right">Date</TableCell>
				</TableRow>
			</TableHead>
			<TableBody>
				{rows.map((row) => (
				<TableRow key={row.uuid}>
					<TableCell component="th" scope="row">
					{row.uuid}
					</TableCell>
					<TableCell align="right">{row.side}</TableCell>
					<TableCell align="right">{row.quantity}</TableCell>
					<TableCell align="right">{row.price}</TableCell>
					<TableCell align="right">{row.timestamp.toString()}</TableCell>
				</TableRow>
				))}
			</TableBody>
		</Table>
  </TableContainer>
);

const Orderbook = () => {
	const [date, setDate] = React.useState(new Date());
	const [book, setBook] = React.useState({buyQueue: [], sellQueue: []});

	const tick = () => {
		axios.get('/book').then(res=>res.data).then(res=>res.book).then(res=>setBook(res)).catch(err=> {console.error(err); setBook({buyQueue: [], sellQueue: []});});
		setDate(new Date())
	}

	React.useEffect(() => {
		const timerID = setTimeout(() => tick(), 1000)
		return () => {
			//
			clearTimeout(timerID)
		}
	}, [date])

	return <>
		<h3>Orderbook</h3>
		<div className="d-flex justify-content-center">
			<OrderTable rows={book.sellQueue}/>
			<OrderTable rows={book.buyQueue}/>
		</div>
	</>;
};

export default Orderbook;