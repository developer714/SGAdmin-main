import React from "react";
import styled from "@emotion/styled";
import * as Yup from "yup";
// import { useTheme } from "@mui/material/styles";
import { Formik } from "formik";
import {
  Grid,
  TextField,
  CircularProgress,
  Modal,
  Typography,
  // useMediaQuery,
} from "@mui/material";

import {
  Close as CloseIcon,
  // Cancel as CancelIcon,
  Save as SaveIcon,
} from "@mui/icons-material";

import useWAFConfig from "../../../../../hooks/user/useWAFConfig";
import { Alert, Box, Button, Divider, IconButton } from "../../common/styled";

const Root = styled.div`
  justify-content: center;
  align-items: center;
  display: flex;
  min-height: 200px;
`;

function CustomRuleModal({ open, handleClose, ruleID }) {
  // const theme = useTheme();
  // const isMD = useMediaQuery(theme.breakpoints.up("md"));

  const { curCustomRule, getCustomRule, createCustomRule, updateCustomRule } = useWAFConfig();
  React.useEffect(() => {
    if (open) {
      if (ruleID) {
        getCustomRule(ruleID);
      }
    }
  }, [open, ruleID, getCustomRule]);

  return (
    <Formik
      enableReinitialize={true}
      initialValues={{
        description: ruleID && curCustomRule?.description ? curCustomRule.description : "",
        content: ruleID && curCustomRule?.content ? curCustomRule.content : "",
      }}
      validationSchema={Yup.object().shape({
        content: Yup.string().required("Content is required"),
      })}
      onSubmit={(values, { resetForm, setErrors, setStatus, setSubmitting }) => {
        try {
          if (ruleID) {
            updateCustomRule(curCustomRule.custom_rule_id, values);
          } else {
            createCustomRule(values);
          }
          handleClose();
          resetForm();
        } catch (error) {
          const message = error.message || "Something went wrong";
          setStatus({ success: false });
          setErrors({ submit: message });
          setSubmitting(false);
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
            <Box sx={{ width: "80vw" }}>
              <form noValidate onSubmit={handleSubmit}>
                <Grid container>
                  <Grid item xs={12} borderBottom={"solid 1px #ccc"}>
                    <Grid container pt={2} pb={2}>
                      <Grid item sx={{ margin: "auto" }}>
                        <Typography variant="h2">Custom Rule Info</Typography>
                      </Grid>
                      <Grid item xs></Grid>
                      <Grid item display="flex" alignItems="center">
                        <IconButton onClick={handleClose} size="large">
                          <CloseIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
                {ruleID && !curCustomRule ? (
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
                      <Grid item xs={12}>
                        <Alert mt={2} mb={3} variant="outlined" severity="info">
                          Custom Rule ID for organisation must be between 400,000 and 408,999
                        </Alert>
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        pr={4}
                        pb={4}
                        sx={{
                          margin: "auto",
                        }}
                      >
                        <Typography variant="h2">Description</Typography>
                      </Grid>
                      <Grid item xs={12} pb={4}>
                        <TextField
                          minRows={5}
                          multiline={true}
                          name="description"
                          value={values.description}
                          fullWidth
                          error={Boolean(touched.description && errors.description)}
                          helperText={touched.description && errors.description}
                          onBlur={handleBlur}
                          onChange={handleChange}
                        ></TextField>
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        pr={4}
                        pb={4}
                        sx={{
                          margin: "auto",
                        }}
                      >
                        <Typography variant="h2">Content{" (*)"}</Typography>
                      </Grid>
                      <Divider my={4} />
                      <Grid item xs={12} pb={4}>
                        <TextField
                          minRows={8}
                          multiline={true}
                          name="content"
                          value={values.content}
                          fullWidth
                          error={Boolean(touched.content && errors.content)}
                          helperText={touched.content && errors.content}
                          onBlur={handleBlur}
                          onChange={handleChange}
                        ></TextField>
                      </Grid>
                      <Grid item xs={12} textAlign={"right"}>
                        <Button variant="outlined" color="primary" onClick={handleClose} mr={4}>
                          <CloseIcon
                            sx={{
                              marginRight: "4px",
                              fillOpacity: "0.5",
                            }}
                          />
                          Cancel
                        </Button>
                        <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
                          <SaveIcon
                            sx={{
                              marginRight: "4px",
                            }}
                          />
                          Save
                        </Button>
                      </Grid>
                    </Grid>
                  </>
                )}
              </form>
            </Box>
          </Modal>
        </React.Fragment>
      )}
    </Formik>
  );
}

export default CustomRuleModal;
