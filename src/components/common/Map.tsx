import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';

interface MapProps {
  latitude: number;
  longitude: number;
  zoom?: number;
}

const Map: React.FC<MapProps> = ({ latitude, longitude, zoom = 13 }) => {
  const customIcon = new Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
  });

  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={zoom}
      className="h-[300px] w-full rounded-lg"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={[latitude, longitude]} icon={customIcon}>
        <Popup>
          Incident Location
          <br />
          Lat: {latitude}
          <br />
          Lng: {longitude}
        </Popup>
      </Marker>
    </MapContainer>
  );
};

export default Map;