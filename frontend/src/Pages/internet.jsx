import { useEffect, useState } from "react";
import { Outlet } from "react-router";

function Internet(){
    const [connected, setConnected] = useState(navigator.onLine);
    const OnlineStatus=()=>{
        setConnected(navigator.onLine);
    };

    useEffect(()=>{
        window.addEventListener('online',OnlineStatus);
        window.addEventListener('offline',OnlineStatus);

        return ()=>{
            window.removeEventListener("online",OnlineStatus);
            window.removeEventListener("offline",OnlineStatus);
        };
    },[]);

    if (!connected){
        return(
            <div className='h-screen w-screen flex flex-col items-center justify-center bg-black text-white'>
                <div><h2 className="text-3xl font-bold mb-5">No Internet Connection</h2></div>
                <div><h2 className="text-3xl font-bold mb-5">Reconnecting...</h2></div>
                <span className="loading loading-ring loading-xl"></span>
            </div>
        );
    }
    return <Outlet />
}
export default Internet;