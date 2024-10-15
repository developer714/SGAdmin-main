import React, { useRef, useImperativeHandle, forwardRef } from "react";

const StripeInput = forwardRef((props, inputRef) => {
  const { component: Component, ...other } = props;
  const elementRef = useRef();
  useImperativeHandle(inputRef, () => ({
    focus: () => elementRef.current.focus(),
  }));

  return <Component onReady={(element) => (elementRef.current = element)} {...other} />;
});

export default StripeInput;
