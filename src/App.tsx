import React, { useCallback, useEffect, useState } from "react";
import "./App.css";
import { MinusSquareOutlined, PlusOutlined } from "@ant-design/icons";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore/lite";
import {
  GoogleAuthProvider,
  signInWithPopup,
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";

import { Button, Input } from "antd";
import firebaseConfig from "./firebase";

// Initialize Firebase outside the component
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

function App() {
  const [value, setValue] = useState(0);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [appVerifier, setAppVerifier] = useState<RecaptchaVerifier | null>(
    null
  );
  const [code, setCode] = useState<string | null>(null);
  const generateOtp = useCallback(async () => {
    try {
      if (!appVerifier) {
        const verifier = new RecaptchaVerifier(auth, "recaptcha-container", {});
        console.log(verifier);
        setAppVerifier(verifier);
      }

      if (appVerifier) {
        const data = await signInWithPhoneNumber(
          auth,
          `+91 ${phoneNumber}`,
          appVerifier
        );
        setConfirmationResult(data);
      }
    } catch (error) {
      console.log(error);
    }
  }, [auth, phoneNumber, appVerifier]);

  const handleSubmit = async () => {
    console.log(code, confirmationResult);
    confirmationResult
      ?.confirm(code)
      .then((result: any) => {
        // User signed in successfully.
        console.log(result.user);
        // ...
      })
      .catch((error: any) => {
        // User couldn't sign in (bad verification code?)
        // ...
        console.log(error);
      });
  };
  const onFinish = () => {
    const provider = new GoogleAuthProvider();

    signInWithPopup(auth, provider)
      .then((result) => {
        console.log(result);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const increment = () => {
    setValue(value + 1);
  };

  const decrement = () => {
    setValue(value - 1);
  };

  useEffect(() => {
    if (value > 5) return;
    const timer = setTimeout(() => {
      setValue(value + 1);
    }, 2000);

    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className="App">
      <div className="icons">
        <p>value:{value}</p>
        <PlusOutlined onClick={increment} />
        <MinusSquareOutlined onClick={decrement} />
        <div>
          <Button onClick={onFinish}>SignUp With Google</Button>
        </div>
        <div>
          <p>Mobile Number</p>
          <div>
            <Input
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <div id="recaptcha-container"></div> {/* Recaptcha container */}
            <Button onClick={generateOtp}>Generate OTP</Button>
          </div>
          <p>Enter Your OTP</p>
          <Input
            type="text"
            // value={verificationCode} //verification code displayed after verify the I'm not robot.
            onChange={(e) => setCode(e.target.value)}
          />
          <Button onClick={handleSubmit}>Verify OTP</Button>
        </div>
      </div>
    </div>
  );
}

export default App;
