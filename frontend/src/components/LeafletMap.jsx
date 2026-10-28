import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

// Fix default leaflet icon paths for Vite bundler
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function LeafletMap({
  mode = 'viewer', // 'viewer' or 'picker'
  reports = [],
  hotspots = [],
  sensitiveZones = [],
  selectedLocation = null, // for picker: { lat, lon }
  onLocationSelect = null,
  onReportSelect = null,
  center = [11.1271, 78.6569], // Tamil Nadu center
  zoom = 7,
  height = '520px',
  showHotspots = true,
  showSensitive = true
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const hotspotsLayerRef = useRef(null);
  const sensitiveLayerRef = useRef(null);
  const pickerMarkerRef = useRef(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center,
        zoom,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | CleanTamil Nadu AI'
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      hotspotsLayerRef.current = L.layerGroup().addTo(map);
      sensitiveLayerRef.current = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;

      // Handle map clicks in picker mode
      if (mode === 'picker' && onLocationSelect) {
        map.on('click', (e) => {
          const { lat, lng } = e.latlng;
          onLocationSelect({ lat: Number(lat.toFixed(6)), lon: Number(lng.toFixed(6)) });
        });
      }
    }

    return () => {
      // Clean up map when component unmounts
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update center & zoom if changed
  useEffect(() => {
    if (mapInstanceRef.current && center) {
      mapInstanceRef.current.setView(center, zoom, { animate: true });
    }
  }, [center, zoom]);

  // Handle picker mode marker
  useEffect(() => {
    if (mode !== 'picker' || !mapInstanceRef.current) return;

    const map = mapInstanceRef.current;

    if (selectedLocation && selectedLocation.lat && selectedLocation.lon) {
      const { lat, lon } = selectedLocation;
      if (pickerMarkerRef.current) {
        pickerMarkerRef.current.setLatLng([lat, lon]);
      } else {
        const pickerIcon = L.divIcon({
          className: 'custom-picker-pin',
          html: `<div style="background:#15803d; color:#fff; width:34px; height:34px; border-radius:50%; border:3px solid #fff; box-shadow:0 3px 8px rgba(0,0,0,0.4); display:flex; align-items:center; justify-content:center; font-weight:800; font-size:16px;">📍</div>`,
          iconSize: [34, 34],
          iconAnchor: [17, 34],
        });

        pickerMarkerRef.current = L.marker([lat, lon], {
          icon: pickerIcon,
          draggable: true,
        }).addTo(map);

        pickerMarkerRef.current.on('dragend', (e) => {
          const pos = e.target.getLatLng();
          if (onLocationSelect) {
            onLocationSelect({ lat: Number(pos.lat.toFixed(6)), lon: Number(pos.lng.toFixed(6)) });
          }
        });
      }
      map.panTo([lat, lon]);
    }
  }, [selectedLocation, mode]);

  // Handle viewer mode: render reports, hotspots, and sensitive zones
  useEffect(() => {
    if (mode !== 'viewer' || !mapInstanceRef.current) return;

    // 1. Render Reports
    if (markersLayerRef.current) {
      markersLayerRef.current.clearLayers();

      reports.forEach((rep) => {
        if (!rep.latitude || !rep.longitude) return;

        const p = (rep.priority || 'Medium').toLowerCase();
        let pinColor = '#ca8a04'; // Medium
        if (p === 'critical') pinColor = '#dc2626';
        if (p === 'high') pinColor = '#ea580c';
        if (p === 'low') pinColor = '#0284c7';
        if (rep.status === 'Resolved') pinColor = '#16a34a';

        const customIcon = L.divIcon({
          className: 'custom-report-pin',
          html: `
            <div style="background:${pinColor}; color:#fff; border-radius:50%; width:28px; height:28px; display:flex; align-items:center; justify-content:center; border:2px solid #fff; box-shadow:0 2px 6px rgba(0,0,0,0.3); font-weight:700; font-size:11px;">
              ${p === 'critical' ? '🔥' : rep.status === 'Resolved' ? '✓' : '!'}
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([rep.latitude, rep.longitude], { icon: customIcon });

        const popupContent = `
          <div style="font-family: 'Inter', sans-serif; width: 230px;">
            <div style="font-size: 11px; font-weight: 700; color: #64748b; font-family: monospace;">${rep.id}</div>
            <div style="font-weight: 700; font-size: 13px; margin: 3px 0 6px 0; color: #0f172a; line-height: 1.3;">${rep.title}</div>
            <div style="width: 100%; height: 95px; border-radius: 4px; overflow: hidden; margin-bottom: 6px; background: #000;">
              <img src="${rep.image_url}" style="width:100%; height:100%; object-fit:cover;" alt="Report Thumbnail" />
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; font-size: 11px; margin-bottom: 4px;">
              <span style="font-weight:600; color:#334155;">Status: <strong>${rep.status}</strong></span>
              <span style="background:${pinColor}22; color:${pinColor}; padding:2px 6px; border-radius:10px; font-weight:700;">${rep.priority} (${Math.round(rep.priority_score)})</span>
            </div>
            <div style="font-size: 11px; color: #64748b; margin-bottom: 8px;">📍 ${rep.area}, ${rep.district}</div>
            <button id="view-rep-btn-${rep.id}" style="width:100%; background:#15803d; color:#fff; border:none; padding:5px; border-radius:4px; font-weight:600; font-size:11px; cursor:pointer;">
              Inspect Details
            </button>
          </div>
        `;

        marker.bindPopup(popupContent);

        marker.on('popupopen', () => {
          const btn = document.getElementById(`view-rep-btn-${rep.id}`);
          if (btn && onReportSelect) {
            btn.onclick = () => onReportSelect(rep);
          }
        });

        markersLayerRef.current.addLayer(marker);
      });
    }

    // 2. Render Hotspot Clusters
    if (hotspotsLayerRef.current) {
      hotspotsLayerRef.current.clearLayers();

      if (showHotspots) {
        hotspots.forEach((hs) => {
          if (!hs.latitude || !hs.longitude) return;

          const isCrit = hs.severity_level === 'Critical' || hs.report_count >= 4;
          const circleColor = isCrit ? '#dc2626' : '#ea580c';

          const circle = L.circle([hs.latitude, hs.longitude], {
            color: circleColor,
            fillColor: circleColor,
            fillOpacity: 0.18,
            radius: hs.radius_meters || 450,
            weight: 2,
            dashArray: '4, 4'
          });

          const hsPopup = `
            <div style="font-family:'Inter', sans-serif; width: 220px;">
              <div style="background:${circleColor}; color:#fff; font-size:10px; font-weight:800; padding:2px 6px; border-radius:3px; display:inline-block; margin-bottom:4px;">
                🚨 HOTSPOT ZONE (${hs.severity_level})
              </div>
              <div style="font-weight:700; font-size:13px; color:#0f172a; margin-bottom:4px;">${hs.name}</div>
              <div style="font-size:11px; color:#475569; margin-bottom:6px;">${hs.description}</div>
              <div style="font-size:11px; font-weight:700; color:#b91c1c;">
                • ${hs.report_count} Active Recurring Complaints
              </div>
              ${hs.sensitive_zone ? `<div style="font-size:10px; color:#7c3aed; margin-top:3px;">⚠️ Adjacent: ${hs.sensitive_zone}</div>` : ''}
            </div>
          `;

          circle.bindPopup(hsPopup);
          hotspotsLayerRef.current.addLayer(circle);
        });
      }
    }

    // 3. Render Sensitive Municipal Zones
    if (sensitiveLayerRef.current) {
      sensitiveLayerRef.current.clearLayers();

      if (showSensitive) {
        sensitiveZones.forEach((zone) => {
          if (!zone.lat || !zone.lon) return;

          const sensIcon = L.divIcon({
            className: 'custom-sensitive-pin',
            html: `
              <div style="background:#7c3aed; color:#fff; border-radius:4px; width:22px; height:22px; display:flex; align-items:center; justify-content:center; border:2px solid #fff; box-shadow:0 1px 4px rgba(0,0,0,0.3); font-size:11px;" title="${zone.name}">
                🏛️
              </div>
            `,
            iconSize: [22, 22],
            iconAnchor: [11, 11],
          });

          const sensMarker = L.marker([zone.lat, zone.lon], { icon: sensIcon });
          sensMarker.bindPopup(`
            <div style="font-family:'Inter', sans-serif; width:200px;">
              <div style="font-size:10px; font-weight:700; color:#7c3aed; text-transform:uppercase;">🏛️ Sensitive Zone Benchmark</div>
              <div style="font-weight:700; font-size:12px; margin-top:2px; color:#0f172a;">${zone.name}</div>
              <div style="font-size:11px; color:#64748b; margin-top:2px;">Category: ${zone.type.replace('_', ' ')} (${zone.district})</div>
              <div style="font-size:10px; color:#b45309; margin-top:4px;">Civic reports within ${zone.radius_m}m trigger priority escalation.</div>
            </div>
          `);

          sensitiveLayerRef.current.addLayer(sensMarker);
        });
      }
    }
  }, [mode, reports, hotspots, sensitiveZones, showHotspots, showSensitive]);

  return (
    <div
      ref={mapContainerRef}
      style={{
        width: '100%',
        height,
        borderRadius: 'var(--radius-md)',
        background: '#e2e8f0',
        zIndex: 1,
      }}
      id="clean-tamil-nadu-leaflet-map"
    />
  );
}
