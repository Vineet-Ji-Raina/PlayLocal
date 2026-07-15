"use client";
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

export default function LeafletMap({
  center = [19.0760, 72.8777], // default Mumbai
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

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Create Map
    const map = L.map(mapContainerRef.current).setView(center, zoom);
    mapInstanceRef.current = map;

    // Add Tile Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Create marker group
    markerGroupRef.current = L.layerGroup().addTo(map);

    // Setup map click listener
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

  // Update center when it changes
  useEffect(() => {
    if (mapInstanceRef.current && center) {
      mapInstanceRef.current.setView(center, mapInstanceRef.current.getZoom());
    }
  }, [center]);

  // Render Selection Marker
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
          <div class="flex items-center justify-center bg-rose-500 border-2 border-white text-white rounded-full h-8 w-8 shadow-lg shadow-rose-500/50 animate-bounce">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
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

  // Render normal Markers
  useEffect(() => {
    const markerGroup = markerGroupRef.current;
    if (!markerGroup || !mapInstanceRef.current) return;

    markerGroup.clearLayers();

    markers.forEach((marker) => {
      const pinColor = marker.isCurrentUser ? 'bg-indigo-600' : 'bg-emerald-500';
      const shadowColor = marker.isCurrentUser ? 'shadow-indigo-600/50' : 'shadow-emerald-500/50';

      const customIcon = L.divIcon({
        html: `
          <div class="flex items-center justify-center ${pinColor} border-2 border-white text-white rounded-full h-7 w-7 shadow-md ${shadowColor} transform hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="10" r="3"/>
              <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/>
            </svg>
          </div>
        `,
        className: 'custom-marker-pin',
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -28]
      });

      const mapMarker = L.marker(marker.position, { icon: customIcon });

      if (marker.popupText) {
        mapMarker.bindPopup(marker.popupText);
      }

      mapMarker.addTo(markerGroup);
    });
  }, [markers]);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-slate-800 shadow-inner">
      <div ref={mapContainerRef} className="w-full h-full bg-slate-900 z-10" />
      {isSelectionMode && (
        <div className="absolute top-4 right-4 bg-slate-900/90 border border-slate-800 text-slate-300 text-xs px-3 py-1.5 rounded-lg z-30 pointer-events-none shadow-md backdrop-blur">
          Click map to drop marker
        </div>
      )}
    </div>
  );
}
