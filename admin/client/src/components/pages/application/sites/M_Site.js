import React, { useEffect, useState } from "react";
import styled from "@emotion/styled";
import * as Yup from "yup";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { Formik } from "formik";
import {
  Grid,
  Modal,
  Typography,
  useMediaQuery,
  CircularProgress,
  Box as MuiBox,
  IconButton as MuiIconButton,
  TextField,
} from "@mui/material";

import useSite from "../../../../hooks/user/useSite";
import useAuth from "../../../../hooks/useAuth";
import { UserRole } from "../../../../utils/constants";

import { Add as AddIcon, Remove as RemoveIcon } from "@mui/icons-material";
import { ReactComponent as CancelIcon } from "../../../../vendor/button/cancel.svg";
import { ReactComponent as ConfirmIcon } from "../../../../vendor/button/confirm.svg";

import { Alert, IOSSwitch, ModalButton } from "../common/styled";
import ModalBox from "../../../common/ModalBox";

const Root = styled.div`
  justify-content: center;
  align-items: center;
  display: flex;
  min-height: 200px;
`;
const IconButton = styled(MuiIconButton)`
  padding: 16px;
  svg {
    width: 24px;
    height: 24px;
  }
`;

function SiteModal({ open, handleClose, site }) {
  const navigate = useNavigate();
  const { setWebsiteController, userRole } = useAuth();
  const { updateSite, getSites } = useSite();

  const theme = useTheme();
  const isMD = useMediaQuery(theme.breakpoints.up("md"));

  const [subDomainList, setSubDomainList] = useState([{ subDomain: { name: "", addr: "", enabled: true } }]);
  const [enableWaf, setEnableWaf] = useState(true);
  useEffect(() => {
    if (site !== null) {
      if (site.subdomains.length === 0) {
        setSubDomainList([{ subDomain: { name: "", addr: "", enabled: true } }]);
      } else {
        var tmpArr = [];
        for (let index = 0; index < site.subdomains.length; index++) {
          tmpArr.push({
            subDomain: {
              name: site.subdomains[index]["name"],
              addr: site.subdomains[index]["addr"],
              enabled: site.subdomains[index]["enabled"],
            },
          });
        }
        setSubDomainList(tmpArr);
      }
      setEnableWaf(site.enabled);
    }
  }, [site]);

  // handle input change
  const handleNameInputChange = (e, index) => {
    const { name, value } = e.target;
    // Not allow space in value
    if (/\s/g.test(value)) {
      return;
    }
    const list = [...subDomainList];
    list[index][name].name = value;
    setSubDomainList(list);
  };

  const handleAddrInputChange = (e, index) => {
    const { name, value } = e.target;
    // Not allow space in value
    if (/\s/g.test(value)) {
      return;
    }
    const list = [...subDomainList];
    list[index][name].addr = value;
    setSubDomainList(list);
  };

  // handle click event of the Remove button
  const handleRemoveClick = (index) => {
    const list = [...subDomainList];
    list.splice(index, 1);
    setSubDomainList(list);
  };

  // handle click event of the Add button
  const handleAddClick = () => {
    setSubDomainList([...subDomainList, { subDomain: { name: "", addr: "", enabled: true } }]);
  };

  const wafEnableChange = (event) => {
    if (UserRole.READONLY_USER === userRole) return;
    const _enableWaf = !enableWaf;
    setEnableWaf(_enableWaf);
  };

  const subdomainEnableChange = (event) => {
    if (UserRole.READONLY_USER === userRole) return;
    const list = [...subDomainList];
    list.forEach((x) => {
      if (x.subDomain.name === event.target.value) {
        x.subDomain.enabled = !x.subDomain.enabled;
      }
    });
    setSubDomainList(list);
  };

  return (
    <Formik
      enableReinitialize={true}
      initialValues={{
        site_id: site?.site_id ? site.site_id : "",
        site_name: site?.name ? site.name : "",
        enable: undefined !== site?.enabled ? site.enabled : true,
        site_addr: site?.addr ? site.addr : "",
      }}
      validationSchema={Yup.object().shape({
        site_id: Yup.string()
          .matches(/^(?!www\.).*$/, 'Remove "www" label')
          .required("Domain is required"),
        site_name: Yup.string().required("Name is required"),
        site_addr: Yup.string().required("Address is required"),
      })}
      onSubmit={async (values, { resetForm, setErrors, setStatus, setSubmitting }) => {
        if (0 < subDomainList.length && !subDomainList[subDomainList.length - 1].subDomain.name) {
          subDomainList.splice(subDomainList.length - 1, 1);
        }
        try {
          values.submit = undefined;
          values.enable = enableWaf;
          await updateSite(site.id, values, subDomainList);
          getSites(setWebsiteController);
          handleClose();
          resetForm();
          navigate("/application/sites");
        } catch (error) {
          const message = error.message || "Something went wrong";
          setStatus({ success: false });
          setErrors({ submit: message });
          setSubmitting(false);
        }
        if (0 === subDomainList.length) {
          setSubDomainList([{ subDomain: { name: "", addr: "", enabled: true } }]);
        }
      }}
    >
      {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
        <React.Fragment>
          <Modal
            open={open}
            onClose={(_, reason) => {
              if (reason !== "backdropClick") {
                handleClose();
              }
            }}
          >
            <ModalBox
              sx={{ width: isMD ? "960px" : "90vw" }}
              title={null === site ? "Web Application" : `Web Application - ${site.site_id} ( + www )`}
              handleClose={handleClose}
            >
              <form noValidate onSubmit={handleSubmit}>
                {site === null ? (
                  <>
                    <Root>
                      <CircularProgress color="primary" />
                    </Root>
                  </>
                ) : (
                  <>
                    <Grid container pt={4}>
                      <Grid item xs={12}>
                        {errors.submit && (
                          <Alert mt={2} mb={3} variant="outlined" severity="error">
                            {errors.submit}
                          </Alert>
                        )}
                      </Grid>

                      <Grid item xs={12} md={4} pr={4} pb={4} sx={{ margin: "auto", textAlign: "left" }}>
                        <Typography py={4} px={4}>
                          Origin Address
                        </Typography>
                      </Grid>
                      <Grid item xs={9} md={6} pb={4}>
                        <TextField
                          color="secondary"
                          name="site_addr"
                          value={values.site_addr}
                          fullWidth
                          error={Boolean(touched.site_addr && errors.site_addr)}
                          helperText={touched.site_addr && errors.site_addr}
                          onBlur={handleBlur}
                          onChange={handleChange}
                        ></TextField>
                      </Grid>
                      <Grid item xs={3} md={2} pb={4} display="flex" alignItems="center" justifyContent={"center"}>
                        <IOSSwitch checked={enableWaf} onChange={wafEnableChange} color="success" />
                      </Grid>
                      <Grid item xs={12} sx={{ margin: "auto", textAlign: "left" }}>
                        <Typography variant="captionBold" py={8} px={4}>
                          Sub Domains
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Typography py={4} px={4}>
                          Host Name
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Typography py={4} px={4}>
                          Origin Address
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Typography py={4} px={4}>
                          Enable WAF
                        </Typography>
                      </Grid>
                      <Grid item xs={12} pb={4}>
                        <Grid container>
                          {subDomainList?.map((x, i) => {
                            return (
                              <>
                                <Grid item xs={12} md={4} px={2} pb={2}>
                                  <MuiBox display="flex" alignItems="center">
                                    <TextField
                                      color="secondary"
                                      name="subDomain"
                                      value={x?.subDomain?.name}
                                      onChange={(e) => handleNameInputChange(e, i)}
                                      sx={{ width: "100%" }}
                                    ></TextField>
                                    <Typography px={2}>.{site.site_id}</Typography>
                                  </MuiBox>
                                </Grid>
                                <Grid item xs={12} md={4} px={2} pb={2}>
                                  <TextField
                                    color="secondary"
                                    name="subDomain"
                                    value={x?.subDomain?.addr}
                                    onChange={(e) => handleAddrInputChange(e, i)}
                                    sx={{ width: "100%" }}
                                  ></TextField>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                  <Grid container>
                                    <Grid item xs={6} display="flex" alignItems="center" justifyContent={"center"}>
                                      <IOSSwitch
                                        checked={x?.subDomain?.enabled}
                                        disabled={x?.subDomain?.name?.length === 0}
                                        value={x?.subDomain?.name}
                                        onChange={subdomainEnableChange}
                                        px={4}
                                        color="success"
                                      />
                                    </Grid>
                                    <Grid item xs={6}>
                                      {subDomainList.length !== 1 && (
                                        <IconButton size="large" onClick={() => handleRemoveClick(i)}>
                                          <RemoveIcon />
                                        </IconButton>
                                      )}
                                      {subDomainList.length - 1 === i && (
                                        <IconButton size="large" onClick={handleAddClick} disabled={x?.subDomain?.name?.length === 0}>
                                          <AddIcon />
                                        </IconButton>
                                      )}
                                    </Grid>
                                  </Grid>
                                </Grid>
                              </>
                            );
                          })}
                        </Grid>
                      </Grid>
                      <Grid item xs={12} textAlign={"right"}>
                        <ModalButton variant="outlined" color="primary" onClick={handleClose} mr={4} startIcon={<CancelIcon />}>
                          Cancel
                        </ModalButton>
                        <ModalButton type="submit" variant="contained" color="success" disabled={isSubmitting} startIcon={<ConfirmIcon />}>
                          Save
                        </ModalButton>
                      </Grid>
                    </Grid>
                  </>
                )}
              </form>
            </ModalBox>
          </Modal>
        </React.Fragment>
      )}
    </Formik>
  );
}

export default SiteModal;
