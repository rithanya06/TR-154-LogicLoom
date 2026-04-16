"""
Hospital Finder Service — Uses Overpass API (OpenStreetMap) to find nearby hospitals.
"""

import math
import logging
from typing import List

import httpx

logger = logging.getLogger(__name__)

OVERPASS_API_URL = "https://overpass-api.de/api/interpreter"

# Search radius in meters
DEFAULT_RADIUS = 10000  # 10 km


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the great-circle distance between two points on Earth using Haversine formula.
    
    Returns:
        Distance in kilometers
    """
    R = 6371.0  # Earth's radius in km
    
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)
    
    a = (math.sin(delta_lat / 2) ** 2 +
         math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return R * c


async def find_nearby_hospitals(
    latitude: float,
    longitude: float,
    radius: int = DEFAULT_RADIUS,
    limit: int = 10
) -> List[dict]:
    """
    Find hospitals near the given coordinates using Overpass API.
    
    Args:
        latitude: User's latitude
        longitude: User's longitude
        radius: Search radius in meters (default 10km)
        limit: Maximum number of results
        
    Returns:
        List of hospital info dicts sorted by distance
    """
    # Overpass QL query to find hospitals
    overpass_query = f"""
    [out:json][timeout:25];
    (
        node["amenity"="hospital"](around:{radius},{latitude},{longitude});
        way["amenity"="hospital"](around:{radius},{latitude},{longitude});
        node["amenity"="clinic"](around:{radius},{latitude},{longitude});
        way["amenity"="clinic"](around:{radius},{latitude},{longitude});
        node["amenity"="doctors"](around:{radius},{latitude},{longitude});
    );
    out center body;
    """
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                OVERPASS_API_URL,
                data={"data": overpass_query}
            )
            response.raise_for_status()
            data = response.json()
        
        hospitals = []
        seen_names = set()
        
        for element in data.get("elements", []):
            tags = element.get("tags", {})
            name = tags.get("name", tags.get("name:en", ""))
            
            if not name:
                # Generate a name from amenity type
                amenity_type = tags.get("amenity", "hospital").title()
                name = f"{amenity_type} (Unnamed)"
            
            # Skip duplicates
            if name in seen_names:
                continue
            seen_names.add(name)
            
            # Get coordinates (nodes have lat/lon directly, ways have center)
            if element.get("type") == "way":
                h_lat = element.get("center", {}).get("lat", 0)
                h_lon = element.get("center", {}).get("lon", 0)
            else:
                h_lat = element.get("lat", 0)
                h_lon = element.get("lon", 0)
            
            if h_lat == 0 and h_lon == 0:
                continue
            
            distance = haversine_distance(latitude, longitude, h_lat, h_lon)
            
            hospital_info = {
                "name": name,
                "latitude": h_lat,
                "longitude": h_lon,
                "distance_km": round(distance, 2),
                "address": tags.get("addr:full", tags.get("addr:street", None)),
                "phone": tags.get("phone", tags.get("contact:phone", None))
            }
            
            hospitals.append(hospital_info)
        
        # Sort by distance and limit results
        hospitals.sort(key=lambda x: x["distance_km"])
        hospitals = hospitals[:limit]
        
        logger.info(f"Found {len(hospitals)} hospitals near ({latitude}, {longitude})")
        return hospitals
        
    except httpx.TimeoutException:
        logger.error("Overpass API timeout")
        return []
    except Exception as e:
        logger.error(f"Hospital search error: {e}")
        return []
