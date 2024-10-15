import React from "react";
import styled from "@emotion/styled";
import { Helmet } from "react-helmet-async";
import {
  Grid,
  Typography,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";

import { Save as SaveIcon } from "@mui/icons-material";
import { AddCircleOutline as AddCircleOutlineIcon } from "@mui/icons-material";
import CachedIcon from "@mui/icons-material/Cached";

import ProductModal from "./component/M_Product";

import useZcrm from "../../../hooks/super/useZcrm";
import useAuth from "../../../hooks/useAuth";

import { Button, CollapseAlert, Divider, IconButton, SnackbarAlert } from "../../../components/pages/application/common/styled";
import { UserRole } from "../../../utils/constants";

const Root = styled.div`
  justify-content: center;
  align-items: center;
  display: flex;
  min-height: 100%;
`;

function SAZcrmProduct() {
  const { getProducts, updateProduct, products, setErr, errMsg } = useZcrm();

  const { isAuthenticated, adminRole } = useAuth();
  const [tmpProducts, setTmpProducts] = React.useState();
  const [originalProducts, setOriginalProducts] = React.useState();

  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [message, setMessage] = React.useState();
  const [success, setSuccess] = React.useState();
  const [snackOpen, setSnackOpen] = React.useState(false);
  const handleSnackClose = () => {
    setSnackOpen(false);
  };
  React.useEffect(() => {
    if (isAuthenticated) getProducts();
    return () => setErr(null);
  }, [isAuthenticated, setErr, getProducts]);
  const refresh = () => {
    setTmpProducts(null);
    getProducts();
  };
  React.useEffect(() => {
    if (products) {
      const tmp = products.map((t) => ({
        id: t.id,
        Product_Code: t.Product_Code,
        Product_Name: t.Product_Name,
        Unit_Price: t.Unit_Price,
        titleFlag: false,
        unitFlag: false,
      }));
      setTmpProducts(tmp);
      setOriginalProducts(tmp);
    }
  }, [products]);

  const [errOpen, setErrOpen] = React.useState(false);
  React.useEffect(() => {
    if (errMsg) setErrOpen(true);
  }, [errMsg]);

  const changeProductName = (e, productCode) => {
    const _tmpProducts = [...tmpProducts];
    const original = originalProducts.find((t) => t.Product_Code === productCode);
    _tmpProducts.forEach((t, tmpIdx, _tmpProducts) => {
      if (t.Product_Code === productCode) {
        t.titleFlag = original?.Product_Name !== e.target.value;
        t.Product_Name = e.target.value;
        _tmpProducts[tmpIdx] = t;
      }
    });
    setTmpProducts(_tmpProducts);
  };

  const changeUnitPrice = (e, productCode) => {
    const _tmpProducts = [...tmpProducts];
    const original = originalProducts.find((t) => t.Product_Code === productCode);
    _tmpProducts.forEach((t, tmpIdx, _tmpProducts) => {
      if (t.Product_Code === productCode) {
        t.unitFlag = original?.Unit_Price !== e.target.value;
        t.Unit_Price = e.target.value;
        _tmpProducts[tmpIdx] = t;
      }
    });
    setTmpProducts(_tmpProducts);
  };

  const productUpdate = async (productCode) => {
    const tmp = tmpProducts.find((t) => t.Product_Code === productCode);
    if (!tmp) return;
    const result = await updateProduct(tmp.id, {
      Product_Name: tmp.Product_Name,
      Unit_Price: tmp.Unit_Price,
    });
    setMessage(result.msg);
    setSuccess(result.status);
    setSnackOpen(true);
  };

  return (
    <React.Fragment>
      <Helmet title="SA Zoho CRM Product Management" />
      <Grid container sx={{ display: "flex", alignItems: "center" }}>
        <Grid item>
          <Typography variant="h3" gutterBottom display="inline">
            Zoho CRM Product Management
          </Typography>
        </Grid>
        <Grid item xs></Grid>
        <Grid item display="flex" alignItems="center">
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpen}
            sx={{
              fontSize: "15px",
              backgroundColor: "#369F33",
            }}
            disabled={null === products || ![UserRole.SUPER_ADMIN, UserRole.PAYMENT_ADMIN].includes(adminRole)}
          >
            <AddCircleOutlineIcon sx={{ marginRight: "8px" }} />
            Add Product
          </Button>
          <IconButton ml={4} onClick={refresh} size="large" sx={{ margin: "0px 0px 0px 16px" }}>
            <CachedIcon />
          </IconButton>
        </Grid>
      </Grid>
      <Divider my={4} />
      <CollapseAlert errOpen={errOpen} setErrOpen={setErrOpen} setErr={setErr} errMsg={errMsg} />

      {!tmpProducts ? (
        <Root>
          <CircularProgress color="primary" />
        </Root>
      ) : (
        <Grid container spacing={6}>
          <Grid item xs={12} lg={9}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell
                      align="center"
                      sx={{
                        padding: "8px",
                      }}
                    >
                      <Typography variant="tableHeader">Product Code</Typography>
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        padding: "8px",
                      }}
                    >
                      <Typography variant="tableHeader">Product Name</Typography>
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        padding: "8px",
                      }}
                    >
                      <Typography variant="tableHeader">Unit Price ($)</Typography>
                    </TableCell>

                    <TableCell width={"10%"}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tmpProducts?.map((row) => {
                    return (
                      <TableRow>
                        <TableCell
                          align="center"
                          sx={{
                            padding: "8px",
                          }}
                        >
                          {row?.Product_Code}
                        </TableCell>

                        <TableCell
                          sx={{
                            padding: "8px",
                          }}
                        >
                          <TextField
                            fullWidth
                            value={row?.Product_Name}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: "0px",
                              },
                              "& .MuiOutlinedInput-input": {
                                border: row?.titleFlag ? "solid 1px red" : "solid 1px #eee",
                              },
                            }}
                            onChange={(e) => changeProductName(e, row?.Product_Code)}
                          ></TextField>
                        </TableCell>
                        <TableCell
                          sx={{
                            padding: "8px",
                          }}
                        >
                          <TextField
                            fullWidth
                            value={row?.Unit_Price}
                            type="number"
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: "0px",
                              },
                              "& .MuiOutlinedInput-input": {
                                border: row?.unitFlag ? "solid 1px red" : "solid 1px #eee",
                              },
                            }}
                            onChange={(e) => changeUnitPrice(e, row?.Product_Code)}
                          ></TextField>
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            padding: "0px",
                          }}
                        >
                          <IconButton
                            size="large"
                            onClick={() => productUpdate(row?.Product_Code)}
                            disabled={![UserRole.SUPER_ADMIN, UserRole.PAYMENT_ADMIN].includes(adminRole)}
                          >
                            <SaveIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      )}
      <ProductModal open={open} handleClose={handleClose} productCode={products?.length + 1} />
      <SnackbarAlert open={snackOpen} onClose={handleSnackClose} severity={success} message={message} />
    </React.Fragment>
  );
}
export default SAZcrmProduct;
