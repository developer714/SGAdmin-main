import { useContext } from "react";

import { PaymentContext } from "../../contexts/super/PaymentContext";

const usePayment = () => {
  const context = useContext(PaymentContext);
  return context;
};

export default usePayment;
