import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

const API_OLIMP_URL = "https://test-facturacion.olimpush.com";
const API_TOKEN_OLIMP = `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN_OLIMP}`;

export async function GET(
  request: NextRequest,
  { params }: { params: { ruc: string } }
) {
  try {
    const { ruc } = params;

    const response = await axios.get(
      `${API_OLIMP_URL}/apifacturacion/v2/facturadorelectronico/ruc/${ruc}/validation`,
      {
        headers: {
          Authorization: API_TOKEN_OLIMP,
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("Error validando RUC:", error);
    return NextResponse.json(
      { error: "Error al validar el RUC", details: error.message },
      { status: error.response?.status || 500 }
    );
  }
}
