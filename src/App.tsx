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

import { Button, Form, Input, message } from "antd";
import { firebaseConfig } from "./firebase";

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

  // Initialize RecaptchaVerifier when the component mounts
  useEffect(() => {
    if (value > 5) return;
    const timer = setTimeout(() => {
      setValue(value + 1);
    }, 2000);
    return () => clearTimeout(timer);
  }, [value]);

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
        console.log(result.user);
      })
      .catch((error: any) => {
        console.log(error);
      });
  };

  const increment = () => {
    setValue(value + 1);
  };

  const decrement = () => {
    setValue(value - 1);
  };

  return (
    <div className="App">
      <Form onFinish={onFinish}>
        <div className="icons">
          <p>value:{value}</p>
          <PlusOutlined onClick={increment} />
          <MinusSquareOutlined onClick={decrement} />
          <Form.Item>
            <Button htmlType="submit">SignUp With Google</Button>
          </Form.Item>
          <Form.Item style={{ userSelect: "none" }}>
            <p>Mobile Number</p>
            <div>
              <Input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              <div id="recaptcha-container"></div> {/* Recaptcha container */}
              <Button onClick={generateOtp} style={{ userSelect: "none" }}>
                Generate OTP
              </Button>
            </div>
          </Form.Item>
          <Form.Item style={{ userSelect: "none" }}>
            <p>Enter Your OTP</p>
            <Input
              type="text"
              maxLength={6}
              onChange={(e) => setCode(e.target.value)}
            />
          </Form.Item>
          <Form.Item>
            <Button onClick={handleSubmit}>Verify OTP</Button>
          </Form.Item>
        </div>
      </Form>
    </div>
  );
}

export default App;
