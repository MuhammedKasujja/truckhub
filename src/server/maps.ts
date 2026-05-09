"use server";

export const searchPlaces = async (searchText: string) => {
  if (searchText.length < 3) {
    return undefined;
  }

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchText)}&limit=5&addressdetails=1`,
      {
        headers: {
          "User-Agent": "MyMapApp/1.0 (contact@yourdomain.com)",
        },
      },
    );
    const data = await res.json();
    const locations = data.map((ele) => ({
      name: ele.display_name,
      lat: Number(ele.lat),
      long: Number(ele.lon),
    }));
    console.table(locations);
    return locations;
  } catch (err) {
    console.error(err);
    return undefined;
  }
};
