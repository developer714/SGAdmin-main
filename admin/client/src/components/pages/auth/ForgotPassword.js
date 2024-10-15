import React from "react";
import styled from "@emotion/styled";
import * as Yup from "yup";
import { Formik } from "formik";

import { Alert as MuiAlert, Button, TextField as MuiTextField } from "@mui/material";
import { spacing } from "@mui/system";

import useAuth from "../../../hooks/useAuth";
import { Alert } from "../application/common/styled";

const TextField = styled(MuiTextField)(spacing);

function ForgotPassword() {
  const { forgetPassword } = useAuth();

  return (
    <Formik
      initialValues={{
        email: "",
      }}
      validationSchema={Yup.object().shape({
        email: Yup.string().email("Must be a valid email").max(255).required("Email is required"),
      })}
      onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
        try {
          const response = await forgetPassword(values.email);
          setErrors({ success: response.message });
        } catch (error) {
          const message = error.message || "Something went wrong";
          setStatus({ success: false });
          setErrors({ submit: message });
          setSubmitting(false);
        }
      }}
    >
      {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
        <form noValidate onSubmit={handleSubmit}>
          {errors.submit && (
            <Alert mt={2} mb={3} variant="outlined" severity="error">
              {errors.submit}
            </Alert>
          )}
          {errors.success && (
            <Alert mt={2} mb={3} variant="outlined" severity="info">
              {errors.success}
            </Alert>
          )}
          <TextField
            type="text"
            name="email"
            label="Email Address"
            value={values.email}
            error={Boolean(touched.email && errors.email)}
            fullWidth
            helperText={touched.email && errors.email}
            onBlur={handleBlur}
            onChange={handleChange}
            my={3}
          />
          <Button type="submit" fullWidth variant="contained" color="primary" disabled={isSubmitting}>
            Reset password
          </Button>
        </form>
      )}
    </Formik>
  );
}

export default ForgotPassword;
