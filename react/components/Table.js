import React from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableFooter from '@mui/material/TableFooter';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';

function TablePaginationActions(props) {
  const theme = useTheme();
  const { count, page, rowsPerPage, onPageChange } = props;

  const handleBackButtonClick = event => {
    onPageChange(event, page - 1);
  };

  const handleNextButtonClick = event => {
    onPageChange(event, page + 1);
  };


  return (
    <div style={{ flexShrink: 0 }}>
      <IconButton sx={{ padding: '0px' }} 
      onClick={handleBackButtonClick} 
      disabled={page === 0}
      aria-label="previous page">
        {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
      </IconButton>

      <IconButton sx={{ padding: '0px' }}
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page">
        {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
      </IconButton>
    </div>
  );
}

TablePaginationActions.propTypes = {
  count: PropTypes.number.isRequired,
  onChangePage: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
};

export default function CustomPaginationActionsTable(props) {
  let rows = props.rows;

  const font = '0.5rem';

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <TableContainer component={Paper}>
      <Table size="small" sx={{ maxWidth: 500 }} aria-label="log table">
      <TableBody>
        <TableRow>
        	<TableCell sx={{ fontSize: "0.6rem", padding: '6px 2px 2px 6px', fontWeight: 'bold' }}>{'Open/Close'}</TableCell>
        	<TableCell sx={{ fontSize: "0.6rem", padding: '6px 2px 2px 6px', fontWeight: 'bold' }}>{'User'}</TableCell>
        	<TableCell sx={{ fontSize: "0.6rem", padding: '6px 2px 2px 6px', fontWeight: 'bold' }}>{'Date'}</TableCell>
        	<TableCell sx={{ fontSize: "0.6rem", padding: '6px 2px 2px 6px', fontWeight: 'bold' }}>{'Time'}</TableCell>
        </TableRow>
          {(rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
          ).map(row => (
            <TableRow key={row[0]}>
              <TableCell component="th" scope="row" sx={{ fontSize: "0.5rem", padding: '6px 2px 2px 6px'}}>
                {row[1][0]}
              </TableCell>
              <TableCell sx={{ fontSize: "0.5rem", padding: '6px 2px 2px 6px'}}>{row[1][1]}</TableCell>
              <TableCell sx={{ fontSize: "0.5rem", padding: '6px 2px 2px 6px'}}>{row[1][2]}</TableCell>
			        <TableCell sx={{ fontSize: "0.5rem", padding: '6px 2px 2px 6px'}}>{row[1][3]}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TablePagination sx={{ overflow: "visible" }}
              rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
              colSpan={4}
              count={rows.length}
              rowsPerPage={rowsPerPage}
              page={page}
              SelectProps={{
                inputProps: { 'aria-label': 'rows per page' },
                native: true,
                style:{
                  marginLeft: '0px',
				  marginRight: '0px',
                  fontSize: font
                }
              }}
              labelRowsPerPage={<div style={{fontSize:font}}>{'Rows per Page:'}</div>}
              labelDisplayedRows={row => <div style={{fontSize: font}}>{page * rowsPerPage+1 +'-'+((page * rowsPerPage) + rowsPerPage) + ' of ' + rows.length}</div>}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              ActionsComponent={TablePaginationActions}
            />
          </TableRow>
        </TableFooter>
      </Table>
    </TableContainer>
  );
}