import { useState, useEffect } from "react";
import React from "react";
import Header from "../Components/Header_other"
import Quote from "../Components/Footer"
import Friend from "../Components/Friend_req";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Friendlist from "../Components/Friend_list";
import Groups from "../Components/Group_Names";

const MainPage=()=>{
    const [message, setMessage]= useState('');

    const Navigate=useNavigate();
    const Backend_URL=import.meta.env.VITE_backend_url;

    useEffect(()=>{
        const fetchMessage=async()=>{
            try{
                const response = await fetch(`${Backend_URL}/main`,{
                    method: 'GET',
                    headers:{
                        'Content-Type': 'application/json',
                        'Authorization': localStorage.getItem("Token")
                    },
                });
                const data=await response.json();
                if (data.success){
                    setMessage(data.message);
                }
                else{
                    Navigate("/");
                    toast.error("Access Denied");
                    }
            }catch (error){
                setMessage("Error");
            }
        };
        fetchMessage();
    },[Navigate]);
    return(
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-100 p-4 font-sans">
        <Header />
        <div className="grid grid-cols-1 lg:grid-cols-3 w-full items-start border-4 gap-x-3 gap-y-4">
        <div className="w-full lg:col-span-2 lg:row-span-5">
            <Groups/>
        </div>
        <div className="lg:col-span-1 w-full">
            <Friend />
            <Friendlist />
        </div>
        </div>
        <Quote />
        </div>
    );
};

export default MainPage;