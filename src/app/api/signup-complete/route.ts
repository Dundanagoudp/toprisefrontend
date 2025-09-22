import { NextRequest, NextResponse } from "next/server";
import apiClient from "@/apiClient";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const response = await apiClient.post("/users/api/users/createUserforWeb", body, {
      withCredentials: true,
    });
    return NextResponse.json(response.data, { status: 200 });
  } catch (error: any) {
    const status = error?.response?.status || 500;
    const message = error?.response?.data?.message || error?.message || "Registration failed";
    return NextResponse.json({ message }, { status });
  }
}


