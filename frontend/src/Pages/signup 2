import { useState } from "react";
import { useNavigate } from "react-router-dom";
import React from "react";
import Header from "../Components/Header"
import Quote from "../Components/Footer"

const SignUp =()=>{
    localStorage.setItem("Token",'');
    localStorage.setItem("Username",'');
    
    const Navigate=useNavigate();
    const [username, setUsername]= useState('');
    const [password, setPassword]= useState('');
    const [message, setMessage]= useState('');

    const Backend_URL='http://localhost:3000';

    const formHandle= async(e)=>{
        e.preventDefault();
        setMessage("Brewing your financial portions....");
        try{
            const response=await fetch(`${Backend_URL}/signup`,{
                method: 'POST',
                headers:{
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({username,password}),
            });

            const data=await response.json();

            if (data.success){
                localStorage.setItem("Token",data.token);
                localStorage.setItem("Username",username);
                Navigate("/main");
            }
            else{
                setMessage(data.message);
                setUsername('');
                setPassword('');
            }
        }catch (error){
            setMessage("An Error Occured. Please Try Again Later")
            setUsername('');
            setPassword('');
        }
    };
    return(
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 font-sans">
    <Header />
    <Quote />
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Let's set you up!!!</h2>
        <form onSubmit={formHandle} className="space-y-6">
          <div>
            <label className="label text-gray-700">
              Username
            </label>
            <input
              type="text"
              id="username"
              className="input input-primary bg-white text-black w-full"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <p className="label text-red-600 p-1">*required</p>
          </div>
          <div>
            <label className="label text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="input input-primary bg-white text-black w-full"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <p className="label text-red-600 p-1">*required</p>
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
          >
            Sign Up
          </button>
          <button
            type="button"
            onClick= {()=> Navigate("/")}
            className="w-full bg-red-500 text-white py-2 px-4 rounded-md font-semibold hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:ring-offset-2 transition ease-in-out duration-150"
          >
            Login In
          </button>
        </form>
        {message && (
          <p className={`mt-6 text-center text-md ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default SignUp;
