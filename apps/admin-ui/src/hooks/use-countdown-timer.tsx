import { useEffect, useState } from "react";

const useCountDownTimer = () => {
  const [countdown, setCountDown] = useState(0);

  useEffect(() => {
    if (countdown === 0) return;
    const timer = setInterval(() => {
      setCountDown((prev) => {
        if (prev < 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  return { countdown, setCountDown };
};

export default useCountDownTimer;
