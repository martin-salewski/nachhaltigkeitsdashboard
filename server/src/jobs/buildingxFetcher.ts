import { db } from '../drizzle/db.js';
import { sensorData } from '../drizzle/schema.js';

const BASE = 'https://eu.buildingx.siemens.com/api/openness';
const TOKEN_URL = 'https://siemens-bt-015.eu.auth0.com/oauth/token';

const PARTITION = process.env.BUILDINGX_PARTITION!;
const CLIENT_ID = process.env.BUILDINGX_CLIENT_ID!;
const CLIENT_SECRET = process.env.BUILDINGX_CLIENT_SECRET!;

let cachedToken: string | null = null;
let tokenExpiresAt = 0;
let deviceMapping: Record<string, string[]> | null = null;

async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiresAt) return cachedToken;
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      audience: 'https://horizon.siemens.com',
      grant_type: 'client_credentials',
    }),
  });
  const data = await res.json() as { access_token: string; expires_in: number };
  cachedToken = data.access_token;
  tokenExpiresAt = Date.now() + (data.expires_in - 300) * 1000;
  return cachedToken;
}

async function apiGet(token: string, path: string): Promise<any> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/vnd.api+json' },
  });
  if (!res.ok) throw new Error(`BuildingX API ${res.status}: ${path}`);
  return res.json();
}

async function fetchAllRooms(token: string): Promise<Record<string, string>> {
  const res = await apiGet(token, `/structure/partitions/${PARTITION}/locations`);
  const rooms: Record<string, string> = {};
  for (const item of res.data ?? []) {
    if (item.type === 'Room') {
      rooms[item.attributes.label] = item.id;
    }
  }
  return rooms;
}

async function buildDeviceMapping(): Promise<Record<string, string[]>> {
  const token = await getToken();
  const rooms = await fetchAllRooms(token);
  console.log(`[BuildingX] ${Object.keys(rooms).length} Räume in Partition gefunden`);
  const mapping: Record<string, string[]> = {};

  for (const [roomName, roomId] of Object.entries(rooms)) {
    try {
      const equipRes = await apiGet(token, `/structure/partitions/${PARTITION}/locations/${roomId}/relationships/has-assets`);
      const equipmentIds: string[] = (equipRes.data ?? []).map((e: any) => e.id);

      const deviceIds: string[] = [];
      for (const equipId of equipmentIds) {
        const detail = await apiGet(token, `/structure/partitions/${PARTITION}/equipment/${equipId}`);
        const controlled = detail.data?.relationships?.isControlledBy?.data ?? [];
        const ids = Array.isArray(controlled) ? controlled.map((d: any) => d.id) : [controlled.id];
        deviceIds.push(...ids.filter(Boolean));
      }

      mapping[roomName] = deviceIds;
      console.log(`[BuildingX] ${roomName}: ${deviceIds.length} Sensor(en) gefunden`);
    } catch (err) {
      console.error(`[BuildingX] Mapping fehlgeschlagen für ${roomName}:`, err);
      mapping[roomName] = [];
    }
  }

  return mapping;
}

export async function fetchAndStoreSensorData(): Promise<void> {
  if (!deviceMapping) {
    console.log('[BuildingX] Raum-Sensor-Mapping wird aufgebaut...');
    deviceMapping = await buildDeviceMapping();
  }

  const token = await getToken();
  const timestamp = new Date().toISOString();

  for (const [roomName, deviceIds] of Object.entries(deviceMapping)) {
    if (deviceIds.length === 0) continue;

    const readings: { temperature: number; humidity: number; co2: number }[] = [];

    for (const deviceId of deviceIds) {
      try {
        const res = await apiGet(token, `/operations/partitions/${PARTITION}/devices/${deviceId}/points?field[Point]=pointValue`);
        const points: any[] = res.data ?? [];

        let temperature: number | null = null;
        let humidity: number | null = null;
        let co2: number | null = null;

        for (const point of points) {
          const name: string = point.attributes?.name ?? '';
          const value = parseFloat(point.attributes?.pointValue?.value);
          if (isNaN(value)) continue;
          if (name === 'Temperature') temperature = value;
          else if (name === 'Humidity') humidity = value;
          else if (name === 'CO2 level') co2 = value;
        }

        if (temperature !== null && humidity !== null && co2 !== null) {
          readings.push({ temperature, humidity, co2 });
        }
      } catch (err) {
        console.error(`[BuildingX] Fehler bei Device ${deviceId} (${roomName}):`, err);
      }
    }

    if (readings.length === 0) continue;

    const n = readings.length;
    const avg = {
      temperature: Math.round(readings.reduce((s, r) => s + r.temperature, 0) / n * 10) / 10,
      humidity:    Math.round(readings.reduce((s, r) => s + r.humidity,    0) / n * 10) / 10,
      co2:         Math.round(readings.reduce((s, r) => s + r.co2,         0) / n),
    };

    await db.insert(sensorData).values({ timestamp, location: roomName, ...avg });
    console.log(`[BuildingX] ${roomName}: T=${avg.temperature}°C, H=${avg.humidity}%, CO2=${avg.co2}ppm`);
  }
}
