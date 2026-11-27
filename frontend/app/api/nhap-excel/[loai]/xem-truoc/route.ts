import { serverApi } from "@/lib/axios/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest, { params }: { params: Promise<{ loai: string }> }) {

    const { loai } = await params;
    
    const form = await request.formData();

    const res = await serverApi.post(`/nhap-excel/${loai}/xem-truoc`, 
        form, { 
            headers: { 'Content-Type': 'multipart/form-data' }, 
            validateStatus: () => true 
        }
    );

    return NextResponse.json(res.data, { status: res.status });
}
