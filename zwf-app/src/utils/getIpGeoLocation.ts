import * as requestIp from 'request-ip';
import * as fetch from 'node-fetch';


export async function getRequestGeoInfo(req) {
  const ipstackKey = process.env.IPSTACK_ACCESS_KEY;
  if (!ipstackKey) {
    throw new Error(`IPSTACK_ACCESS_KEY is not specified`);
  }

  const ip = requestIp.getClientIp(req);
  // IpStack free plan only supports HTTP
  const url = `http://api.ipstack.com/${ip}?access_key=${ipstackKey}&output=json&fields=country_code,region_code,latitude,longitude`; 

  const resp = await fetch(url, {timeout: 5000});
  const obj = await resp.json();

  return {
    ip,
    country: obj?.country_code,
    region: obj?.region_code,
    latitude: obj?.latitude,
    longitude: obj?.longitude,
  }
}

/**
 *
{
  "ip": "134.201.250.155",
  "type": "ipv4",
  "continent_code": "NA",
  "continent_name": "North America",
  "country_code": "US",
  "country_name": "United States",
  "region_code": "CA",
  "region_name": "California",
  "city": "Los Angeles",
  "zip": "90012",
  "latitude": 34.0655517578125,
  "longitude": -118.24053955078125,
  "location": {
    "geoname_id": 5368361,
    "capital": "Washington D.C.",
    "languages": [
      {
        "code": "en",
        "name": "English",
        "native": "English"
      }
    ],
    "country_flag": "http:\/\/assets.ipstack.com\/flags\/us.svg",
    "country_flag_emoji": "\ud83c\uddfa\ud83c\uddf8",
    "country_flag_emoji_unicode": "U+1F1FA U+1F1F8",
    "calling_code": "1",
    "is_eu": false
  }
}
 */