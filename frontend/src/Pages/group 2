import { useState, useEffect, useRef } from "react";
import React from "react";
import Header from "../Components/Header_other2"
import Quote from "../Components/Footer"
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Chart from '../Components/charts';

const Group=() =>{
    const [expenses, setExpenses]=useState([]);
    const [category, setCategory]=useState('');
    const [split, setSplit]=useState({});
    const [total,setTotal]=useState(0);
    const [description,SetDescription]=useState('');
    const [open, setOpen]= useState(false);
    const [result, setResult]= useState('');
    const Navigate=useNavigate();
    const link=new URLSearchParams(location.search);
    const groupId=link.get("groupId")||'';
    const Backend_URL='http://localhost:3000';

    function topay(){
        let pay=0;
        for (let i=0;i<expenses.length;i++){
            const exp=expenses[i];
            if (exp.paidBy!==MyName){
                const split=exp.splits.find(s=>s.username===MyName);
                if (split){
                    pay+=split.amount;
                }
            }
        }
        return pay;
    }
    function tocollect(){
        let collect=0;
        for (let i=0;i<expenses.length;i++){
            const exp=expenses[i];
            if (exp.paidBy===MyName){
                const split=exp.splits.find(s=>s.username===MyName);
                if (split){
                    collect+=exp.cost-split.amount
                }
            }
        }
        return collect;
    }
    const GroupNames=async()=>{
      try{
        const lists=await fetch(`${Backend_URL}/group_all_details`,{
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({groupId}),
        });
        const data=await lists.json();
        setResult(data);
      }catch(error){
      }
    }

    const ExpenseNames=async()=>{
        try{
            const lists=await fetch(`${Backend_URL}/expense_details`,{
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({groupId}),
            });
            const data=await lists.json();
            setExpenses(data);
        }catch(error){
        }
    }

    const deleteGroup=async()=>{
        try{
            const lists=await fetch(`${Backend_URL}/deletegroup`,{
                method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({groupId}),
        });
        const data=await lists.json();
        if (data.success){
            toast.success("Group Deleted");
            Navigate('/main');
        }
        else{
            toast.error("Error");
        }
        }catch(error){

        }
    }
    
    const AddExpense=async()=>{
        try{
            const fullsplit={};
            result.members.forEach(member=>{
                fullsplit[member.username]=parseFloat(split[member.username])||(100/result.members.length);
            })
            if (!description){
                return toast.error("Expense Name cannot be empty")
            }
            else if(!category){
                return toast.error("Category cannot be empty")
            }
            const List=Object.entries(split);
            let sum=0;
            for (let i=0;i<List.length;i++){
                sum+=Number(List[i][1]);
            }
            if (sum>100){
                setSplit({});
                return toast.error("Sum of Percentage Cannot be Greater than 100")
            }
            const lists=await fetch(`${Backend_URL}/addexpense`,{
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({groupId,split:fullsplit,description,paidBy:MyName,total,category}),
                });
            const data=await lists.json();
            if (data.success){
                setTotal('');
                setOpen(false);
                setSplit({})
                SetDescription('')
                setCategory('')
                GroupNames();
                ExpenseNames();
                return toast.success("Expense Added Succesfully");
            }
        }catch(error){

        }
    }
    const DeleteExpense=async(expenseId)=>{
        try{
            const lists=await fetch(`${Backend_URL}/delete_expense`,{
                method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({groupId,expenseId}),
        });
        const data=await lists.json();
        console.log(data);
        if (data.success){
            toast.success("Expense Removed");
            ExpenseNames();
        }
        else toast.error("Error")
        }catch(err){
            toast.error("Error");
        }
    }
    const RemoveMem=async(groupId,username)=>{
        try{
            const lists=await fetch(`${Backend_URL}/removemember`,{
                method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({groupId,username}),
        });
        const data=await lists.json();
        if (data.success){
            toast.success("Member Removed");
            GroupNames();
        }
        else{
            toast.error("Error");
        }
        }catch(error){

        }
    }
    useEffect(()=>{
        GroupNames();
        const interval=setInterval(()=>{
            GroupNames();
        }, 2000);
        return()=> clearInterval(interval);
    }, []);

    useEffect(()=>{
        ExpenseNames();
        const interval=setInterval(()=>{
            ExpenseNames();
        }, 2000);
        return()=> clearInterval(interval);
    }, []);


    const MyName=localStorage.getItem("Username")

    function Capitalize(word){
        if (MyName===word){
            return "You"
        }
        const words=word.split(' ')
        let temp='';
        for (let j=0;j<words.length;j++){
            temp+=words[j].charAt(0).toUpperCase()+ words[j].slice(1)+' ';
        }
        return temp;
    }
    
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
        <div className="gap-y-4 mt-24 mb-20 min-h-screen flex flex-col justify-start bg-slate-100 p-4 font-sans">
        <Header />
        <Chart result={result} myName={MyName}/>
        {result && Array.isArray(result.members) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-full items-start border-4 border-black gap-x-3 gap-y-4">
            <div className="text-black font-bold text-4xl text-center col-span-1 sm:col-span-2 lg:col-span-3">
                {result.groupName}
            </div>
            {result.members.map((member) => (
                <div
                key={member.username}
                className="bg-white p-4 rounded-xl shadow border hover:bg-gray-100 transition"
                >
                <div className="flex justify-between items-start">
                    <div className="flex flex-col flex-1">
                    <div className="text-lg font-bold text-black">
                        {Capitalize(member.username)}
                    </div>
                    <div className="text-base text-gray-800">
                        Amount: ₹{member.amount}
                    </div>
                </div>
                <div className="grid grid-cols-1">
                    {member.username===MyName &&<div className="col-span-1 text-right text-gray-800">
                        <div>To Collect: ₹{tocollect()}</div>
                        <div>To Pay: ₹{topay()}</div>
                    </div>}
                </div>
                    {result.groupAdmin === MyName && member.username !== MyName && (
                    <button
                        onClick={() => RemoveMem(result.groupId, member.username)}
                        className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-700 text-sm ml-4">
                        - Remove Member
                    </button>
                    )}
                </div>
                </div>
            ))}
            </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <button 
            className="px-2 py-2 bg-yellow-300 text-black text-lg rounded hover:bg-yellow-400"
            onClick={()=>setOpen(true)}>
                + Add Expense
            </button>
            <button 
            className="px-2 py-2 bg-red-500 text-white rounded hover:bg-red-700 text-lg"
            onClick={()=>deleteGroup()}>
                Delete Group
            </button>
        </div>
        {expenses.map((exp,idx)=>(
            <div
            key={exp.expenseId}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-full items-start border-4 border-black gap-x-3 gap-y-4">
                <div className="col-span-full grid grid-cols-3">
                    <h2 className="text-4xl col-span-2 text-black font-bold ml-4">{exp.description}</h2>
                    <h2 className="text-lg col-span-1 text-gray-600 font-semibold pr-2 text-end">{new Date (exp.Day).toLocaleString("en-GB",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit",hour12:true})}</h2>
                    <div className="ml-4 text-2xl text-black font-bold col-span-2">{`Category : ${exp.category}`}</div>
                    <div className="pr-2 text-2xl text-black font-bold col-span-1 text-end">{`Paid By : ${Capitalize(exp.paidBy)}`}</div>
                    <div className="ml-4 text-2xl text-black font-bold col-span-full">{`Amount : ₹ ${exp.cost}`}</div>
                    <div className="p-3 grid col-span-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 justify-between gap-4">
                        {exp.splits.map((member) => (
                        <div
                        key={member.username}
                        className="col-span-1 bg-white p-4 rounded-full border-2 border-black transition"
                        >
                        <div className="flex">
                            <div className="flex flex-col flex-1">
                            <div className="text-lg font-bold text-black text-center">
                            {Capitalize(member.username)}
                            </div>
                            <div className="text-base text-gray-800 text-center">
                                Amount Split: ₹{member.amount}
                            </div>
                        </div>
                </div>
                </div>
            ))}
            {(exp.paidBy===MyName)&&<div className="col-span-full">
                <button 
                    className="col-span-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700 text-sm text-center w-full"
                    onClick={()=>DeleteExpense(exp.expenseId)}>
                        Delete Expense
                </button>
            </div>}
            </div>
            </div>
            </div>
        ))}
        <Quote />
        {open && (
            <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50" onClick={()=>setOpen(false)}>
                <div className="bg-slate-200 p-4 rounded-lg shadow-lg w-full max-w-md" onClick={(a)=>a.stopPropagation()}>
                    <h2 className="text-4xl text-black  font-bold text-center underline underline-offset-4 mb-4">Add Your Expense</h2>
                    <div>
                        <label className="text-black font-semibold mb-2">Expense Name : </label>
                        <input
                        type="text"
                        placeholder="Enter Expense Name..."
                        className="block mb-2 bg-slate-200 pl-1 border-black border-8 text-black border-double text- w-full"
                        value={description}
                        onChange={(a)=>SetDescription(a.target.value)}/>
                        <label className="text-black font-semibold mb-4">Amount Paid : </label>
                        <input
                        type="text"
                        placeholder="Enter Amount Spent..."
                        className="block mb-4 bg-slate-200 pl-1 border-black border-8 text-black border-double text- w-full"
                        value={total}
                        onChange={(a)=>setTotal(a.target.value)}/>
                    </div>
                    <div className="grid grid-cols-3 mb-4">
                    <div className="dropdown dropdown-hover col-span-1">
                        <div tabIndex='0' role='button' className="btn m-1 text-white">Select Category </div>
                        <ul tabIndex="0" className="dropdown-content text-white menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
                            <li><a onClick={()=>setCategory("Food")}>Food</a></li>
                            <li><a onClick={()=>setCategory("Transportation")}>Transportation</a></li>
                            <li><a onClick={()=>setCategory("Accomodation")}>Accomodation</a></li>
                            <li><a onClick={()=>setCategory("Entertainment")}>Entertainment</a></li>
                            <li><a onClick={()=>setCategory("Shopping")}>Shopping</a></li>
                            <li><a onClick={()=>setCategory("Health")}>Health</a></li>
                            <li><a onClick={()=>setCategory("Miscellaneous")}>Miscellaneous</a></li>
                        </ul>
                    </div>
                    <div className="border-2 col-span-2 border-black rounded-md p-2 m-1 mb-4 w-full">
                        <h2 className="text-black font-semibold ml-1 text-xl">{category}</h2>
                    </div>
                    </div>
                    <div className="text-gray-800 mb-3">
                        <h1 className="font-bold underline underline-offset-4">Enter Percentage Share (%)</h1>
                    </div>
                    <div>
                        {result.members.map((member)=>(
                            <div key={member.username} className="grid grid-cols-3 mb-4">
                                <label className="text-black font-semibold mb-2 ">{`${Capitalize(member.username)} : `}</label>
                                <input
                                type="number"
                                step="any"
                                value={split[member.username]?? (100/result.members.length)}
                                placeholder="Percentage Share (%)"
                                className="mb-4 col-span-2 bg-slate-200 pl-1 border-black border-2 text-black w-auto"
                                onChange={(a)=>{
                                    setSplit(prev =>({
                                        ...prev,
                                        [member.username]:a.target.value
                                    }));
                                }}/>
                            </div>
                        ))}
                    </div>
                    <div className="text-gray-800 mb-3">
                        <p>NOTE : Leave the field blank or enter 0 if the member didn't contribute</p>
                    </div>
                    <div className="grid-cols-2">
                        <button 
                        className="bg-green-500 py-2 px-3 text-2xl text-white rounded-xl hover:bg-green-700"
                        onClick={()=>AddExpense()}>
                            Create
                        </button>
                        <button 
                        type="reset"
                        className="bg-red-500 py-2 px-3 text-2xl ml-4 text-white rounded-xl hover:bg-red-700"
                        onClick={()=>{
                            setOpen(false);
                            setSplit({})
                            SetDescription('')
                            setCategory('')
                            setTotal()}}>
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        )}
        </div>
    )
}

export default Group;