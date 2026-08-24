import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const query = searchParams.get("q");

    if (!query?.trim()) {
      return NextResponse.json(
        { error: "Search query is required." },
        { status: 400 }
      );
    }

    const url = new URL(
      "https://nominatim.openstreetmap.org/search"
    );

    url.searchParams.set("q", query.trim());

    url.searchParams.set(
      "format",
      "json"
    );

    url.searchParams.set(
      "addressdetails",
      "1"
    );

    url.searchParams.set(
      "namedetails",
      "1"
    );

    url.searchParams.set(
      "limit",
      "8"
    );

    /*
     * We deliberately DON'T use:
     *
     * countrycodes=ng
     *
     * because that would prevent searches
     * for international locations.
     */

    const response = await fetch(url.toString(), {
      headers: {
        "User-Agent":
          "TEEKET Event Platform/1.0",
        Accept:
          "application/json",
      },

      /*
       * Prevent Next.js from caching
       * every search result.
       */
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            "Location service is currently unavailable.",
        },
        { status: 502 }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error(
      "Geocoding error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to search for this location.",
      },
      { status: 500 }
    );
  }
}