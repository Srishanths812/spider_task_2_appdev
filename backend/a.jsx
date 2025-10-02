import { useEffect } from "react";

function A(){
    let counter=0;
    useEffect(()=>{
        counter+=counter
    },[])
}