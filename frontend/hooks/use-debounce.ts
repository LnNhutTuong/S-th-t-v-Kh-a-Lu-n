"use client"
import { useState, useEffect } from "react";

export const useDebounce = (giaTri: string, doTreMs: number) => {
    
    const [giaTriTre, setGiaTriTre] = useState(giaTri);
    
    useEffect(() => { 
        const id = setTimeout(() => setGiaTriTre(giaTri), doTreMs); 
        return () => clearTimeout(id); 
    }, [giaTri, doTreMs]);

    return giaTriTre;
}