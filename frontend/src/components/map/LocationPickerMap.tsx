import React, { useEffect, useCallback, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, MapPin, AlertCircle, Satellite, Map as MapIcon } from 'lucide-react';
import type { GeoCoords } from '../../types/rahat';
import { pinIcon } from './layerStyles';

const WEST_CHAMBARAN_CENTER: GeoCoords = {
  lat: 26.98,
  lng: 84.5,
  address: 'West Champaran District, Bihar, India',
};

const PICKER_ICON = pinIcon('#2563eb');

interface MapClickHandlerProps {
  onPick: (lat: number, lng: number, address?: string) => void;
}

const MapClickHandler: React.FC<MapClickHandlerProps> = ({ onPick }) => {
  useMapEvents({
    click: (e) => {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

interface MapControllerProps {
  center: [number, number];
}

const MapController: React.FC<MapControllerProps> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center[0] != null && center[1] != null && !isNaN(center[0]) && !isNaN(center[1])) {
      map.setView(center, map.getZoom(), { animate: true });
    }
  }, [center[0], center[1], map]);
  return null;
};

export interface LocationPickerMapProps {
  lat: number;
  lng: number;
  address?: string;
  onPick: (lat: number, lng: number, address?: string) => void;
  height?: string;
  zoom?: number;
}

const LocationPickerMap: React.FC<LocationPickerMapProps> = ({
  lat,
  lng,
  address,
  onPick,
  height = '300px',
  zoom = 11,
}) => {
  const [geoError, setGeoError] = useState(false);
  const [locating, setLocating] = useState(false);
  const [baseLayer, setBaseLayer] = useState<'street' | 'satellite'>('street');

  const centerLat = lat && !isNaN(lat) ? lat : WEST_CHAMBARAN_CENTER.lat;
  const centerLng = lng && !isNaN(lng) ? lng : WEST_CHAMBARAN_CENTER.lng;

  const handlePick = useCallback(
    (selectedLat: number, selectedLng: number, pickedAddress?: string) => {
      onPick(selectedLat, selectedLng, pickedAddress);
    },
    [onPick]
  );

  const handleUseMyLocation = () => {
    setGeoError(false);
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      setLocating(true);
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          let pickedAddress: string | undefined;
          try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
            if (response.ok) pickedAddress = (await response.json()).display_name;
          } catch {
            pickedAddress = undefined;
          }
          setLocating(false);
          onPick(pos.coords.latitude, pos.coords.longitude, pickedAddress);
        },
        () => {
          setLocating(false);
          setGeoError(true);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setGeoError(true);
    }
  };

  const hasCoords = lat != null && lng != null && !isNaN(lat) && !isNaN(lng);

  return (
    <div className="space-y-3">
      {geoError && (
        <div className="flex items-start gap-2 p-3 rounded-lg border border-amber-200 bg-amber-50 text-amber-800 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-600" />
          <div>
            <span className="font-semibold">Location permission unavailable.</span>{' '}
            Please select a location manually or enter an address.
          </div>
        </div>
      )}

      <div
        className="relative rounded-lg border border-slate-200 overflow-hidden shadow-sm bg-slate-50"
        style={{ height }}
      >
        <MapContainer
          center={[WEST_CHAMBARAN_CENTER.lat, WEST_CHAMBARAN_CENTER.lng]}
          zoom={zoom}
          scrollWheelZoom
          style={{ height: '100%', width: '100%' }}
        >
          {baseLayer === 'street' ? (
            <TileLayer key="street" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          ) : (
            <TileLayer key="satellite" attribution="Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics" url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" />
          )}
          <MapClickHandler onPick={handlePick} />
          <MapController center={[centerLat, centerLng]} />
          {hasCoords && (
            <Marker position={[lat, lng]} icon={PICKER_ICON} />
          )}
        </MapContainer>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-slate-500">
          <MapPin className="w-3.5 h-3.5" />
          <span>
            Lat: {centerLat.toFixed(5)}, Lng: {centerLng.toFixed(5)}
            {address ? ` • ${address}` : ''}
          </span>
        </div>
        <div className="flex items-center gap-1 rounded-md bg-slate-100 p-1">
          <button type="button" onClick={() => setBaseLayer('street')} className={`inline-flex items-center gap-1 rounded px-2 py-1.5 font-medium ${baseLayer === 'street' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'}`}><MapIcon className="w-3.5 h-3.5" />Street</button>
          <button type="button" onClick={() => setBaseLayer('satellite')} className={`inline-flex items-center gap-1 rounded px-2 py-1.5 font-medium ${baseLayer === 'satellite' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'}`}><Satellite className="w-3.5 h-3.5" />Satellite</button>
        </div>
        <button
          type="button"
          onClick={handleUseMyLocation}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors font-medium self-start sm:self-auto shadow-sm"
        >
          <Navigation className="w-3.5 h-3.5 text-blue-600" />
          {locating ? 'Finding location...' : 'Use my location'}
        </button>
      </div>
    </div>
  );
};

export default LocationPickerMap;
