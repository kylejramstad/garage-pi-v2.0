import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import FirstPageIcon from '@material-ui/icons/FirstPage';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import LastPageIcon from '@material-ui/icons/LastPage';

const useStyles1 = makeStyles(theme => ({
  root: {
    flexShrink: 0,
  },
  button: {
	  padding: '0px',
  },
}));

function TablePaginationActions(props) {
  const classes = useStyles1();
  const theme = useTheme();
  const { count, page, rowsPerPage, onChangePage } = props;

  const handleBackButtonClick = event => {
    onChangePage(event, page - 1);
  };

  const handleNextButtonClick = event => {
    onChangePage(event, page + 1);
  };


  return (
    <div className={classes.root}>
      <IconButton className={classes.button} onClick={handleBackButtonClick} disabled={page === 0} aria-label="previous page">
        {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
      </IconButton>
      <IconButton className={classes.button}
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
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

const useStyles2 = makeStyles({
  table: {
    maxWidth: 500,
  },
  nav: {
  	overflow: "visible",
  },
  tablecell: {
    fontSize: "0.5rem",
    padding: '6px 2px 2px 6px',
  },
  tableHead: {
  	fontSize: "0.6rem",
  	padding: '6px 2px 2px 6px',
  	fontWeight: 'bold',
  },
});

const CustomPaginationActionsTable = (props) => {
  let { rows } = props;
	   
  const classes = useStyles2();
  const font = '0.5rem';
  
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = event => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <TableContainer component={Paper}>
      <Table size="small" className={classes.table} aria-label="custom pagination table">
        <TableBody>
        <TableRow>
        	<TableCell className={classes.tableHead}>{'Open/Close'}</TableCell>
        	<TableCell className={classes.tableHead}>{'User'}</TableCell>
        	<TableCell className={classes.tableHead}>{'Date'}</TableCell>
        	<TableCell className={classes.tableHead}>{'Time'}</TableCell>
        </TableRow>
          {(rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
          ).map(row => (
            <TableRow key={row[0]}>
              <TableCell component="th" scope="row" className={classes.tablecell}>
                {row[1][0]}
              </TableCell>
              <TableCell className={classes.tablecell}>{row[1][1]}</TableCell>
              <TableCell className={classes.tablecell}>{row[1][2]}</TableCell>
			  <TableCell className={classes.tablecell}>{row[1][3]}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TablePagination className={classes.nav}
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
              onChangePage={handleChangePage}
              onChangeRowsPerPage={handleChangeRowsPerPage}
              ActionsComponent={TablePaginationActions}
            />
          </TableRow>
        </TableFooter>
      </Table>
    </TableContainer>
  );
}
export default CustomPaginationActionsTable