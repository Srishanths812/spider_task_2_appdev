import { useState } from "react";
import { useNavigate } from "react-router-dom";
import React from "react";
import Header from "../Components/Header";
import Quote from "../Components/Footer"

function Password(){
    const [email,setEmail]=useState('');
    const [otpstatus,setOtpstatus]=useState(false);
    const [otp,setOtp]=useState('')
    const [passwordstatus,setPasswordstatus]=useState(false);
    const [password,setPassword] =useState('');

    return(
        <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 font-sans">
    <Header />
    <Quote />
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
          <div>
            <label className="label text-black font-bold">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="input input-primary bg-white text-black w-full mb-7"
              placeholder="Enter your Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          <button
            type="button"
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
            onClick={()=>setOtpstatus(true)}
          >
            Send OTP
          </button>
          {otpstatus && 
          <div className="mt-5">
            <label className="label text-black font-bold">
              Enter OTP
            </label>
            <input
              type="number"
              id="otp"
              className="input input-primary bg-white text-black w-full mb-7"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
            </div>}
      </div>
    </div>
    </div>
    )
}

export default Password
