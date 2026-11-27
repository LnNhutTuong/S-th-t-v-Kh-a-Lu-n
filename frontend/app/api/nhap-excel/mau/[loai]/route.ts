import { serverApi } from "@/lib/axios/server";
import { NextRequest, NextResponse } from "next/server";
export async function GET(request: NextRequest, { params }: { params: Promise<{ loai: string }> }) {
    const  {loai} = await params;

    //Gọi backend, xin file Excel tương ứng
    const res = await serverApi.get(`/nhap-excel/mau/${loai}`, 
        { responseType: 'arraybuffer', 
            validateStatus: () => true 
        }
    );

    return new NextResponse(res.data, {
        status: res.status, 
        headers: {
            'Content-Type': String(res.headers['content-type'] ?? 'application/octet-stream'),
            'Content-Disposition': String(res.headers['content-disposition'] ?? 'attachment')
        }
    });

}