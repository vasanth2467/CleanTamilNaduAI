import React, { useState } from 'react';
import {
  Upload, MapPin, Camera, AlertCircle, CheckCircle2,
  Sparkles, Layers, Compass, ArrowRight, ShieldCheck, RefreshCw
} from 'lucide-react';
import LeafletMap from '../components/LeafletMap';
import { submitCitizenReport, analyzeAIPreview } from '../api';

const TN_DISTRICTS = [
  'Chennai',
  'Coimbatore',
  'Madurai',
  'Tiruchirappalli',
  'Salem',
  'Tirunelveli',
  'Tiruppur',
  'Erode',
  'Vellore',
  'Thanjavur',
  'Dindigul',
  'Kanchipuram',
  'Cuddalore',
  'Thoothukudi',
  'Nagercoil (Kanyakumari)'
];

export default function CitizenReportPage({ onReportCreated, setActivePage }) {
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [wasteType, setWasteType] = useState('plastic');
  const [estimatedVolume, setEstimatedVolume] = useState('medium_pile');
  const [district, setDistrict] = useState('Chennai');
  const [area, setArea] = useState('');
  const [landmark, setLandmark] = useState('');
  const [citizenName, setCitizenName] = useState('');
  const [citizenPhone, setCitizenPhone] = useState('');

  // Coordinates
  const [location, setLocation] = useState({ lat: 13.0827, lon: 80.2707 }); // Default Chennai Central
  const [gpsLoading, setGpsLoading] = useState(false);

  // Image State
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  // AI Detection State
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiError, setAiError] = useState('');

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submittedReport, setSubmittedReport] = useState(null);

  // File selection
  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (JPG, PNG, WebP).');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setAiResult(null);
    setAiError('');
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Run AI Detection Preview
  const handleRunAiDetection = async () => {
    if (!imageFile) {
      alert('Please select or upload a garbage photo first.');
      return;
    }
    setAiAnalyzing(true);
    setAiError('');

    try {
      const fd = new FormData();
      fd.append('file', imageFile);
      if (wasteType) fd.append('waste_type_hint', wasteType);

      const res = await analyzeAIPreview(fd);
      setAiResult(res);
    } catch (err) {
      setAiError(err.message || 'AI Preview analysis encountered an error.');
    } finally {
      setAiAnalyzing(false);
    }
  };

  // Geolocation trigger
  const handleGetCoordinates = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: Number(pos.coords.latitude.toFixed(6)),
          lon: Number(pos.coords.longitude.toFixed(6))
        });
        setGpsLoading(false);
      },
      (err) => {
        setGpsLoading(false);
        alert(`Location acquisition failed: ${err.message}. You can manually click on the map to set the pin.`);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!imageFile) {
      setSubmitError('A photograph of the garbage is mandatory for verification.');
      return;
    }
    if (!title.trim()) {
      setSubmitError('Please enter a descriptive report title.');
      return;
    }
    if (!area.trim()) {
      setSubmitError('Please specify the Area or Locality name.');
      return;
    }

    setSubmitting(true);

    try {
      const fd = new FormData();
      fd.append('title', title);
      if (description) fd.append('description', description);
      fd.append('waste_type', wasteType);
      fd.append('estimated_volume', estimatedVolume);
      fd.append('district', district);
      fd.append('area', area);
      fd.append('latitude', location.lat);
      fd.append('longitude', location.lon);
      if (landmark) fd.append('landmark', landmark);
      if (citizenName) fd.append('citizen_name', citizenName);
      if (citizenPhone) fd.append('citizen_phone', citizenPhone);
      fd.append('image', imageFile);

      const newReport = await submitCitizenReport(fd);
      setSubmittedReport(newReport);
      if (onReportCreated) onReportCreated(newReport);
    } catch (err) {
      setSubmitError(err.message || 'Failed to lodge citizen report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="section-wrapper">
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <div className="hero-badge">
            <Camera size={14} color="var(--primary)" />
            <span>Citizen Sanitation Portal • தூய்மை புகார் பதிவு</span>
          </div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.4rem' }}>
            Report Garbage & Illegal Dumping
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '640px', margin: '0.5rem auto 0 auto' }}>
            Submit an incident with geo-tagged coordinates and photo evidence.
            Our automated AI scanner classifies waste category and calculates civic priority.
          </p>
        </div>

        {/* Prototype Transparency Notice */}
        <div className="disclaimer-banner">
          <AlertCircle size={20} color="#b45309" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div className="disclaimer-title">Civic Prototype AI Notice</div>
            <div className="disclaimer-desc">
              AI waste detection is functioning in <strong>Prototype / Demo Mode</strong>.
              Detected bounding boxes and confidence scores demonstrate the municipal verification pipeline.
              Simulated results are never presented as real neural network predictions.
            </div>
          </div>
        </div>

        {submitError && (
          <div className="disclaimer-banner" style={{ background: '#fee2e2', borderLeftColor: '#dc2626' }}>
            <AlertCircle size={20} color="#dc2626" style={{ flexShrink: 0 }} />
            <span style={{ color: '#991b1b', fontSize: '0.88rem', fontWeight: 600 }}>{submitError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-card">
            {/* Step 1: Photo Upload & AI Scanner */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Camera size={18} color="var(--primary)" />
                Step 1: Upload Garbage Photo Evidence
              </h3>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-subtle)', marginBottom: '1rem' }}>
                Upload an image showing the accumulated garbage, overflowing waste bin, or illegal debris.
              </p>

              {!imagePreview ? (
                <div
                  className={`dropzone-box ${dragActive ? 'dragover' : ''}`}
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('citizen-photo-input').click()}
                >
                  <Upload size={36} color="var(--primary)" style={{ margin: '0 auto 0.75rem auto' }} />
                  <div style={{ fontWeight: 700, fontSize: '0.98rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                    Click to select photo or drag & drop here
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
                    Supports JPG, PNG, WebP (Max 10MB)
                  </div>
                </div>
              ) : (
                <div>
                  <div className="image-preview-container">
                    <img src={imagePreview} alt="Uploaded Garbage Preview" className="image-preview-img" />

                    {/* AI Bounding Boxes Overlay (if scanned) */}
                    {aiResult && aiResult.detected_objects && aiResult.detected_objects.map((obj, idx) => {
                      const [ymin, xmin, ymax, xmax] = obj.box_2d || [20, 20, 80, 80];
                      return (
                        <div
                          key={idx}
                          className="ai-box-overlay"
                          style={{
                            top: `${ymin}%`,
                            left: `${xmin}%`,
                            width: `${xmax - xmin}%`,
                            height: `${ymax - ymin}%`,
                          }}
                        >
                          <div className="ai-box-tag">
                            {obj.label} ({Math.round(obj.confidence * 100)}%)
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.85rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="btn-outline btn-sm"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                        setAiResult(null);
                      }}
                    >
                      Change Photo
                    </button>

                    <button
                      type="button"
                      id="run-ai-scan-btn"
                      className="btn-primary btn-sm"
                      onClick={handleRunAiDetection}
                      disabled={aiAnalyzing}
                      style={{ background: 'linear-gradient(135deg, #15803d 0%, #166534 100%)' }}
                    >
                      <Sparkles size={14} />
                      {aiAnalyzing ? 'Analyzing Image...' : 'Run AI Garbage Scanner'}
                    </button>
                  </div>
                </div>
              )}

              <input
                type="file"
                id="citizen-photo-input"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => handleFile(e.target.files[0])}
              />

              {/* AI Detection Result Display */}
              {aiResult && (
                <div style={{
                  marginTop: '1.25rem',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <Sparkles size={16} color="var(--primary)" />
                      AI Waste Classification: {aiResult.waste_category.toUpperCase()}
                    </span>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      background: '#dcfce7',
                      color: 'var(--primary-dark)',
                      padding: '2px 8px',
                      borderRadius: '12px'
                    }}>
                      Confidence: {Math.round(aiResult.confidence_score * 100)}% (Demo Model)
                    </span>
                  </div>

                  <div style={{ fontSize: '0.85rem', color: '#166534', marginBottom: '0.65rem' }}>
                    <strong>Assessment:</strong> {aiResult.severity_assessment}
                  </div>

                  <div style={{ fontSize: '0.78rem', color: '#15803d', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    {aiResult.detected_objects.map((obj, i) => (
                      <div key={i}>• Detected: <strong>{obj.label}</strong> (Confidence: {Math.round(obj.confidence * 100)}%, Severity: {obj.severity})</div>
                    ))}
                  </div>

                  <div style={{
                    marginTop: '0.75rem',
                    padding: '0.5rem',
                    background: '#ffffff',
                    borderRadius: '4px',
                    fontSize: '0.72rem',
                    color: '#854d0e',
                    border: '1px solid #fde047'
                  }}>
                    {aiResult.disclaimer}
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Location & GPS Selection */}
            <div style={{ marginBottom: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin size={18} color="var(--primary)" />
                  Step 2: Geotag Location Coordinates
                </h3>

                <button
                  type="button"
                  id="gps-locate-btn"
                  className="btn-outline btn-sm"
                  onClick={handleGetCoordinates}
                  disabled={gpsLoading}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <Compass size={14} color="var(--primary)" />
                  {gpsLoading ? 'Acquiring GPS...' : 'Use Current GPS Location'}
                </button>
              </div>

              <p style={{ fontSize: '0.84rem', color: 'var(--text-subtle)', marginBottom: '1rem' }}>
                Pin-drop the exact garbage spot by clicking or dragging on the map below.
              </p>

              {/* Leaflet Picker Map */}
              <div style={{ marginBottom: '1rem' }}>
                <LeafletMap
                  mode="picker"
                  selectedLocation={location}
                  onLocationSelect={(coords) => setLocation(coords)}
                  center={[location.lat, location.lon]}
                  zoom={14}
                  height="300px"
                />
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.5rem',
                fontSize: '0.82rem',
                color: 'var(--text-muted)',
                background: 'var(--bg-subtle)',
                padding: '0.65rem 1rem',
                borderRadius: 'var(--radius-sm)'
              }}>
                <span>Latitude: <strong style={{ color: 'var(--primary-dark)', fontFamily: 'monospace' }}>{location.lat}</strong></span>
                <span>Longitude: <strong style={{ color: 'var(--primary-dark)', fontFamily: 'monospace' }}>{location.lon}</strong></span>
                <span style={{ color: 'var(--text-subtle)', fontSize: '0.75rem', marginLeft: 'auto' }}>
                  Click anywhere on map to reposition pin
                </span>
              </div>
            </div>

            {/* Step 3: Incident Details Form */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Layers size={18} color="var(--primary)" />
                Step 3: Incident Details
              </h3>

              <div className="form-grid">
                {/* Title */}
                <div className="form-group full">
                  <label className="form-label" htmlFor="rep-title">
                    Report Title / Summary <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    id="rep-title"
                    required
                    placeholder="e.g. Overflowing garbage bin blocking pedestrian walkway"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                {/* Waste Type */}
                <div className="form-group">
                  <label className="form-label">Waste Category</label>
                  <select
                    id="rep-waste-type"
                    value={wasteType}
                    onChange={(e) => setWasteType(e.target.value)}
                  >
                    <option value="plastic">Plastic Packaging & Bottles</option>
                    <option value="overflowing_bin">Overflowing Municipal Bin</option>
                    <option value="mixed">Mixed Solid Waste Dump</option>
                    <option value="organic">Organic / Food / Market Refuse</option>
                    <option value="hazardous">Hazardous / Biomedical / Chemical</option>
                    <option value="construction">Construction & Demolition Debris</option>
                  </select>
                </div>

                {/* Estimated Volume */}
                <div className="form-group">
                  <label className="form-label">Estimated Refuse Volume</label>
                  <select
                    id="rep-volume"
                    value={estimatedVolume}
                    onChange={(e) => setEstimatedVolume(e.target.value)}
                  >
                    <option value="small_bag">Small Bag / Litter (1-5 kg)</option>
                    <option value="medium_pile">Medium Pile (5-50 kg)</option>
                    <option value="large_dump">Large Dump / Pile (50-200 kg)</option>
                    <option value="truckload">Massive Dump / Truckload (200+ kg)</option>
                  </select>
                </div>

                {/* District */}
                <div className="form-group">
                  <label className="form-label">District (Tamil Nadu)</label>
                  <select
                    id="rep-district"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                  >
                    {TN_DISTRICTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                {/* Area / Ward */}
                <div className="form-group">
                  <label className="form-label" htmlFor="rep-area">
                    Area / Locality / Ward <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    type="text"
                    id="rep-area"
                    required
                    placeholder="e.g. T. Nagar, Marina Beach, Simmakkal"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                  />
                </div>

                {/* Landmark */}
                <div className="form-group full">
                  <label className="form-label" htmlFor="rep-landmark">
                    Nearest Landmark
                  </label>
                  <input
                    type="text"
                    id="rep-landmark"
                    placeholder="e.g. Opposite Government Hospital Gate 2"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                  />
                </div>

                {/* Description */}
                <div className="form-group full">
                  <label className="form-label" htmlFor="rep-desc">
                    Detailed Civic Description
                  </label>
                  <textarea
                    id="rep-desc"
                    rows={3}
                    placeholder="Describe severity, foul smell, drainage obstruction, or hazardous elements..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                {/* Optional Citizen Name */}
                <div className="form-group">
                  <label className="form-label" htmlFor="rep-name">
                    Your Name (Optional)
                  </label>
                  <input
                    type="text"
                    id="rep-name"
                    placeholder="Leave blank to remain anonymous"
                    value={citizenName}
                    onChange={(e) => setCitizenName(e.target.value)}
                  />
                </div>

                {/* Optional Mobile */}
                <div className="form-group">
                  <label className="form-label" htmlFor="rep-phone">
                    Mobile Number (Optional)
                  </label>
                  <input
                    type="text"
                    id="rep-phone"
                    placeholder="For SMS status notifications"
                    value={citizenPhone}
                    onChange={(e) => setCitizenPhone(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Submit Bar */}
            <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button
                type="submit"
                id="submit-report-btn"
                className="btn-primary"
                disabled={submitting}
                style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}
              >
                {submitting ? 'Lodging Report...' : 'Submit Garbage Report & Generate ID'}
              </button>
            </div>
          </div>
        </form>

        {/* Success Modal */}
        {submittedReport && (
          <div className="modal-backdrop">
            <div className="modal-card" style={{ maxWidth: '580px', textAlign: 'center', padding: '2rem' }}>
              <div style={{
                width: '64px',
                height: '64px',
                background: 'var(--primary-bg)',
                color: 'var(--primary)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto'
              }}>
                <CheckCircle2 size={36} />
              </div>

              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                Garbage Report Lodged Successfully!
              </h2>

              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '1.5rem' }}>
                Thank you for contributing to a cleaner Tamil Nadu. Your complaint has been submitted
                to municipal sanitary monitoring.
              </p>

              <div style={{
                background: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                border: '1px solid var(--border-color)',
                textAlign: 'left',
                marginBottom: '1.5rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-subtle)' }}>Unique Report ID:</span>
                  <span style={{ fontWeight: 800, fontFamily: 'monospace', color: 'var(--primary-dark)', fontSize: '1rem' }}>
                    {submittedReport.id}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-subtle)' }}>Initial Priority Rating:</span>
                  <span style={{ fontWeight: 700, color: '#b45309' }}>
                    {submittedReport.priority} ({Math.round(submittedReport.priority_score)}/100)
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-subtle)' }}>Location:</span>
                  <span style={{ fontWeight: 600 }}>{submittedReport.area}, {submittedReport.district}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-subtle)' }}>Workflow Status:</span>
                  <span style={{ fontWeight: 700, color: 'var(--status-pending)' }}>Pending Sanitary Squad Allocation</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  className="btn-outline btn-sm"
                  onClick={() => {
                    setSubmittedReport(null);
                    // Reset form
                    setTitle('');
                    setDescription('');
                    setArea('');
                    setLandmark('');
                    setImageFile(null);
                    setImagePreview(null);
                    setAiResult(null);
                  }}
                >
                  File Another Report
                </button>

                <button
                  className="btn-primary btn-sm"
                  onClick={() => {
                    setSubmittedReport(null);
                    setActivePage('map');
                  }}
                >
                  View on Hotspot Map
                </button>

                <button
                  className="btn-outline btn-sm"
                  onClick={() => {
                    setSubmittedReport(null);
                    setActivePage('admin');
                  }}
                >
                  Go to Admin Dashboard
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
