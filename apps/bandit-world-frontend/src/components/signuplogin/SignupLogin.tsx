import React, { useState, useRef } from "react";
import axios from 'axios';

const BACKEND_URL = 'http://localhost:3000'


export default function SignupLogin() {
    const [status, setStatus] = useState('sign-up');
    const [userID, setUserID] = useState(null);
    const [token, setToken] = useState(null);
    const usernameRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);

    const sendCredentials = async () => {
        const username = usernameRef.current?.value;
        const password = passwordRef.current?.value;
        
        const response = await axios.post(`${BACKEND_URL}/api/v1/signup`, {
            username,
            password,
            type: "User",
        })

        const responseData = await response.data;

        setUserID(responseData.userId);
        setStatus('log-in');
    }

    const sendLoginData = async () => {
        const username = usernameRef.current?.value;
        const password = passwordRef.current?.value;
        
        const response = await axios.post(`${BACKEND_URL}/api/v1/signin`, {
            username,
            password,
            type: "User",
        })

        const responseData = await response.data;

        setToken(responseData.token);
        console.log(responseData);
    }

    return (
        <div className="SignupLwogin-container">
            <div className = "title-container"><h2>{status}</h2></div>
            <div className = "title-form">
                <div className="username">
                    <div>Username: </div>
                    <input type = "text" placeholder="Enter Username" ref={usernameRef}></input>
                </div>
                <div className="password">
                    <div>Password: </div>
                    <input type = "text" placeholder="Enter Password" ref={passwordRef}></input>
                </div>
                <button className="submit-button" onClick={() => status === 'log-in' ? sendLoginData() : sendCredentials()}>{status}</button>
            </div>
            <div className = "switch-status-container">
                <button className="sign-up-button">Sign Up</button>
                <button className="log-in-button">Log In</button>
            </div>
        </div>
    )
}