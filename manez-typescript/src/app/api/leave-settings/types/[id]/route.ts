import { NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  if (!API_BASE_URL) {
    return NextResponse.json(
      { message: "API base URL is not configured" },
      { status: 500 }
    );
  }

  try {
    const token = request.headers.get("x-access-token");

    if (!token) {
      return NextResponse.json(
        { message: "Missing access token" },
        { status: 401 }
      );
    }

    const { id } = params;

    const response = await fetch(
      `${API_BASE_URL}/leave-settings/types/${id}/`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error("Error fetching leave type:", error);
    return NextResponse.json(
      { message: "Failed to fetch leave type" },
      { status: 500 }
    );
  }
}
