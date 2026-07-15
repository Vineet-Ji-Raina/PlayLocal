import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function LeafletMap({
  center = [19.0760, 72.8777],
  markers = [],
  onClick,
  isSelectionMode = false,
  selectionMarker = null,
  zoom = 12
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerGroupRef = useRef(null);
  const selectionMarkerRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current).setView(center, zoom);
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    markerGroupRef.current = L.layerGroup().addTo(map);

    if (isSelectionMode && onClick) {
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        onClick(lat, lng);
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current && center) {
      mapInstanceRef.current.setView(center, mapInstanceRef.current.getZoom());
    }
  }, [center]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (selectionMarkerRef.current) {
      selectionMarkerRef.current.remove();
      selectionMarkerRef.current = null;
    }

    if (isSelectionMode && selectionMarker) {
      const selectionIcon = L.divIcon({
        html: `
          <div style="background:#f43f5e;border:2px solid white;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;color:white;box-shadow:0 4px 12px rgba(244,63,94,0.5)">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
        `,
        className: 'custom-selection-pin',
        iconSize: [32, 32],
        iconAnchor: [16, 32]
      });

      selectionMarkerRef.current = L.marker(selectionMarker, { icon: selectionIcon }).addTo(map);
      map.panTo(selectionMarker);
    }
  }, [selectionMarker, isSelectionMode]);

  useEffect(() => {
    const markerGroup = markerGroupRef.current;
    if (!markerGroup || !mapInstanceRef.current) return;

    markerGroup.clearLayers();

    markers.forEach((marker) => {
      const bg = marker.isCurrentUser ? '#4f46e5' : '#10b981';
      const shadow = marker.isCurrentUser ? 'rgba(79,70,229,0.5)' : 'rgba(16,185,129,0.5)';

      const customIcon = L.divIcon({
        html: `
          <div style="background:${bg};border:2px solid white;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;color:white;box-shadow:0 4px 10px ${shadow}">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/></svg>
          </div>
        `,
        className: 'custom-marker-pin',
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -28]
      });

      const mapMarker = L.marker(marker.position, { icon: customIcon });
      if (marker.popupText) mapMarker.bindPopup(marker.popupText);
      mapMarker.addTo(markerGroup);
    });
  }, [markers]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '1rem', overflow: 'hidden', border: '1px solid #1e293b' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%', background: '#0f172a' }} />
      {isSelectionMode && (
        <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(15,23,42,0.9)', border: '1px solid #1e293b', color: '#cbd5e1', fontSize: '11px', padding: '6px 12px', borderRadius: '8px', zIndex: 30, backdropFilter: 'blur(4px)' }}>
          Click map to drop marker
        </div>
      )}
    </div>
  );
}
