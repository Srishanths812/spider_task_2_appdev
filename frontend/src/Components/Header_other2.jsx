import { useNavigate, useLocation } from "react-router-dom";
import {useState, useEffect, useRef } from 'react';
import toast from "react-hot-toast";

function Header() {
    const Navigate=useNavigate();
    const location=useLocation();
    const inputbox=useRef(null);

    const link=new URLSearchParams(location.search);
    const initialvalue=link.get("username") || '';
    const [searchkey, setSearchKey]=useState(initialvalue);
    const Backend_URL=import.meta.env.VITE_backend_url;

    const [dp, setDp] = useState('');

    useEffect(() => {
      console.log(Backend_URL)
      const fetchDP = async () => {
          const res = await fetch(Backend_URL+"/profile_details", {
              method: "POST",
              headers: {
                  "Content-Type": "application/json"
              },
              body: JSON.stringify({ username: localStorage.getItem("Username") })
          });
          const data = await res.json();
          setDp(data.dp[0]);
      };
      fetchDP();
    }, []);

    const deleteAccount=async()=>{
      try{
        const lists=await fetch(`${Backend_URL}/delete`,{
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'Authorization': localStorage.getItem("Token")
            },
            body: JSON.stringify({myname:localStorage.getItem("Username")}),
        });
        const data=await lists.json();
        if (data.success){
          toast.success("Account Deleted Successfully ")
          document.getElementById('my_modal_1').close()
          Navigate('/')
        }
        else{
          toast.error("Account Deletion Failed");
          document.getElementById('my_modal_1').close()
        }
      }catch(error){

      }
    }
    //below function is to focus on the input box
    //when the link is not on /main
    //this is done for continuity
    //when typed on search bar when in /main, the page goes to /search
    //but here u can't type as it is in the input box cause things have changed
    //so when it changes, i focus the input box so that we can continously type
    useEffect(()=>{
        if (initialvalue !=='' && inputbox.current){
            inputbox.current.focus();
        }
    }, [initialvalue]);
    let names=localStorage.getItem("Username");
    let temp='';
    names=names.split(' ');
    for (let j=0;j<names.length;j++){
      temp+=names[j].charAt(0).toUpperCase()+ names[j].slice(1)+' ';
    }
    names=temp;

    return (
      <header className="fixed top-0 left-0 right-0 w-full bg-blue-600 text-white py-7 z-50 shadow-xl">
       <div className="grid grid-cols-2 items-center px-8 gap-5">
      <div className="flex justify-start gap-4">
        <h1 className="text-5xl font-bold whitespace-nowrap">Bill Split</h1>
        <button 
          onClick={() => Navigate("/main")} 
          className="tooltip" 
          data-tip="Home">
          <svg 
            className="h-6 w-6" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </button>
      </div>
      <div className="grid justify-end">
            <div className="dropdown dropdown-end ml-3">
            <div tabIndex="0" role="button" className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full">
                <img
                  src={dp||"https://static.thenounproject.com/png/65090-200.png"} />
              </div>
            </div>
            <ul
              tabIndex="0"
              className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
              <h1 className="text-xl p-3">{names}</h1>
              <li><a onClick={() => Navigate("/profile")}>Change Profile Details</a></li>
              <li>
                <a>
                  <button onClick={()=> document.getElementById('my_modal_1').showModal()}>
                    Delete Account
                  </button>
                </a>
              </li>
              <div className="gird place-items-center py-2">
              <li>
                <a className="w-20 btn bg-red-500 text-white" onClick={() => Navigate("/")}>
                  Logout
                </a>
              </li>
              </div>
            </ul>
            <dialog id='my_modal_1' className="modal">
              <div className="modal-box">
                <h3 className="font-bold text-lg">Confirm Deletion</h3>
                <p className="py-4">Are you sure you want to delete your account? This action cannot be undone.</p>
                <div className="modal-action">
                  <button className="btn btn-error text-white" onClick={deleteAccount}>
                    Yes
                  </button>
                  <button className="btn" onClick={()=> document.getElementById('my_modal_1').close()}>
                    Cancel
                  </button>
                </div>
              </div>
            </dialog>
       </div>
       </div>
       </div>
     </header>
  );
}
export default Header;