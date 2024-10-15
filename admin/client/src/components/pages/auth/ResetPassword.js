import React from "react";
import styled from "@emotion/styled";
import * as Yup from "yup";
import { Formik } from "formik";

import { Alert as MuiAlert, Button, TextField as MuiTextField } from "@mui/material";
import { spacing } from "@mui/system";

import useAuth from "../../../hooks/useAuth";
import { Alert } from "../application/common/styled";

const TextField = styled(MuiTextField)(spacing);

function ResetPassword(token) {
  const { resetPassword } = useAuth();
  return (
    <Formik
      initialValues={{
        password: "",
        confirmPassword: "",
      }}
      validationSchema={Yup.object().shape({
        password: Yup.string().min(8, "Must be at least 8 characters").max(255).required("Required"),
        confirmPassword: Yup.string().when("password", {
          is: (val) => (val && val.length > 0 ? true : false),
          then: Yup.string().oneOf([Yup.ref("password")], "Both password need to be the same"),
        }),
      })}
      onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
        try {
          const response = await resetPassword(values, token);
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
            type="password"
            name="password"
            label="Password"
            value={values.password}
            error={Boolean(touched.password && errors.password)}
            fullWidth
            helperText={touched.password && errors.password}
            onBlur={handleBlur}
            onChange={handleChange}
            my={3}
          />
          <TextField
            type="password"
            name="confirmPassword"
            label="Confirm password"
            value={values.confirmPassword}
            error={Boolean(touched.confirmPassword && errors.confirmPassword)}
            fullWidth
            helperText={touched.confirmPassword && errors.confirmPassword}
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

export default ResetPassword;
