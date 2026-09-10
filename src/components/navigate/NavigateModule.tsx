import React, { useState, useEffect, useMemo } from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useAuth } from '../../context/AuthContext';
import {
  CampusBuilding,
  CampusRoom,
  NavigationRouteResult,
  NavigationRouteStep,
  AccessibilityTag,
} from '../../types';
import {
  Search,
  Compass,
  Navigation,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Layers,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Building,
  ArrowRight,
  Plus,
  Edit,
  Trash2,
  ChevronRight,
  Eye,
  Crosshair,
  ShieldCheck,
} from 'lucide-react';

export const NavigateModule: React.FC = () => {
  const { t, announce, speakText, stopSpeaking, isSpeaking } = useAccessibility();
  const { currentUser } = useAuth();

  const [buildings, setBuildings] = useState<CampusBuilding[]>([]);
  const [rooms, setRooms] = useState<CampusRoom[]>([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('bldg_turing');
  const [selectedFloor, setSelectedFloor] = useState<number>(0);

  // Search & Selection
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<CampusRoom | null>(null);

  // Navigation State
  const [startRoomId, setStartRoomId] = useState<string>('rm_th_g01');
  const [endRoomId, setEndRoomId] = useState<string>('rm_th_g_washroom');
  const [accessibleOnly, setAccessibleOnly] = useState<boolean>(true);
  const [routeResult, setRouteResult] = useState<NavigationRouteResult | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const [isLoadingRoute, setIsLoadingRoute] = useState<boolean>(false);

  // Admin Room Editor Modal
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Partial<CampusRoom> | null>(null);

  // Load Map Data
  useEffect(() => {
    fetch('/api/navigate/map-data')
      .then(res => res.json())
      .then(data => {
        setBuildings(data.buildings || []);
        setRooms(data.rooms || []);
        if (data.rooms?.length > 0) {
          setSelectedRoom(data.rooms[0]);
        }
      })
      .catch(err => console.error('Failed to load map data:', err));
  }, []);

  const activeBuilding = useMemo(() => {
    return buildings.find(b => b.id === selectedBuildingId) || buildings[0];
  }, [buildings, selectedBuildingId]);

  // Rooms for active building & floor
  const floorRooms = useMemo(() => {
    return rooms.filter(
      r => r.buildingId === selectedBuildingId && r.floor === selectedFloor
    );
  }, [rooms, selectedBuildingId, selectedFloor]);

  // Search filter
  const filteredRooms = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return rooms.filter(
      r =>
        r.name.toLowerCase().includes(q) ||
        r.roomNumber.toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q)
    );
  }, [rooms, searchQuery]);

  // Handle Route Calculation
  const handleCalculateRoute = async (startId = startRoomId, endId = endRoomId) => {
    setIsLoadingRoute(true);
    try {
      const res = await fetch('/api/navigate/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startRoomId: startId,
          endRoomId: endId,
          accessibleOnly,
        }),
      });
      const data = await res.json();
      if (data && data.steps) {
        setRouteResult(data);
        setCurrentStepIndex(0);
        setIsNavigating(true);
        announce(`Route calculated to ${data.endRoom.name}. Total distance ${data.totalDistanceMeters} meters, estimated walking time ${data.totalEstimatedMinutes} minutes.`);

        // Narrate first step automatically
        if (data.steps.length > 0) {
          speakText(data.steps[0].audioPrompt);
        }
      }
    } catch (err) {
      console.error('Routing failed:', err);
    } finally {
      setIsLoadingRoute(false);
    }
  };

  // Find Nearest Facility
  const handleFindNearest = async (category: string) => {
    try {
      const res = await fetch(`/api/navigate/nearest?category=${category}&currentRoomId=${startRoomId}`);
      const data = await res.json();
      if (data.nearest) {
        setEndRoomId(data.nearest.id);
        setSelectedRoom(data.nearest);
        setSelectedBuildingId(data.nearest.buildingId);
        setSelectedFloor(data.nearest.floor);
        announce(`Nearest ${category} found: ${data.nearest.name} in ${data.nearest.buildingId}, Floor ${data.nearest.floor}`);
        handleCalculateRoute(startRoomId, data.nearest.id);
      }
    } catch (err) {
      console.error('Find nearest failed:', err);
    }
  };

  // Step narration controls
  const handleNextStep = () => {
    if (routeResult && currentStepIndex < routeResult.steps.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      const step = routeResult.steps[nextIdx];
      speakText(step.audioPrompt);
      announce(`Step ${nextIdx + 1} of ${routeResult.steps.length}: ${step.instruction}`);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0 && routeResult) {
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
      const step = routeResult.steps[prevIdx];
      speakText(step.audioPrompt);
      announce(`Step ${prevIdx + 1} of ${routeResult.steps.length}: ${step.instruction}`);
    }
  };

  const handleRepeatStep = () => {
    if (routeResult && routeResult.steps[currentStepIndex]) {
      speakText(routeResult.steps[currentStepIndex].audioPrompt);
    }
  };

  // Admin Save Room
  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoom || !editingRoom.name) return;

    try {
      if (editingRoom.id) {
        // Update
        const res = await fetch(`/api/navigate/rooms/${editingRoom.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingRoom),
        });
        const updated = await res.json();
        setRooms(prev => prev.map(r => (r.id === updated.id ? updated : r)));
      } else {
        // Create
        const res = await fetch('/api/navigate/rooms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingRoom),
        });
        const created = await res.json();
        setRooms(prev => [...prev, created]);
      }
      setIsAdminModalOpen(false);
      setEditingRoom(null);
      announce('Room successfully updated');
    } catch (err) {
      console.error('Failed to save room:', err);
    }
  };

  const currentStep: NavigationRouteStep | undefined = routeResult?.steps[currentStepIndex];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Module Title & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Compass className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              {t.modules.navigate.title}
            </h1>
            <span className="rounded-full bg-blue-100 text-blue-800 text-3xs font-bold px-2.5 py-0.5 border border-blue-200">
              Indoor & Outdoor
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {t.modules.navigate.subtitle}
          </p>
        </div>

        {/* Global Room Search Bar */}
        <div className="relative w-full md:w-96">
          <label htmlFor="input-room-search" className="sr-only">
            {t.modules.navigate.searchPlaceholder}
          </label>
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            id="input-room-search"
            type="search"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t.modules.navigate.searchPlaceholder}
            className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-xs text-slate-900 shadow-2xs placeholder-slate-400 focus:border-blue-600 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
          />

          {/* Autocomplete Dropdown */}
          {filteredRooms.length > 0 && (
            <div className="absolute left-0 right-0 top-12 z-50 rounded-xl bg-white p-2 shadow-xl border border-slate-200 max-h-64 overflow-y-auto">
              {filteredRooms.map(room => (
                <button
                  key={room.id}
                  id={`search-res-${room.id}`}
                  type="button"
                  onClick={() => {
                    setSelectedRoom(room);
                    setSelectedBuildingId(room.buildingId);
                    setSelectedFloor(room.floor);
                    setEndRoomId(room.id);
                    setSearchQuery('');
                    announce(`Selected ${room.name}`);
                  }}
                  className="w-full text-left p-2.5 rounded-lg hover:bg-blue-50 flex items-center justify-between text-xs transition-colors"
                >
                  <div>
                    <span className="font-bold text-slate-900">{room.name}</span>
                    <span className="text-slate-500 ml-2">({room.roomNumber})</span>
                    <p className="text-3xs text-slate-400">{room.department} • Floor {room.floor}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-blue-500" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* "Find Nearest" Quick Action Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center space-x-1.5">
            <Crosshair className="h-4 w-4 text-blue-600" />
            <span>{t.modules.navigate.findNearest}</span>
          </span>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'washroom', label: t.modules.navigate.washroom, icon: '🚻' },
              { id: 'exit', label: t.modules.navigate.exit, icon: '🚪' },
              { id: 'elevator', label: t.modules.navigate.elevator, icon: '🛗' },
              { id: 'canteen', label: t.modules.navigate.canteen, icon: '☕' },
              { id: 'parking', label: t.modules.navigate.parking, icon: '🅿️' },
            ].map(item => (
              <button
                key={item.id}
                id={`btn-nearest-${item.id}`}
                type="button"
                onClick={() => handleFindNearest(item.id)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-xs font-semibold text-slate-700 hover:text-blue-700 transition-all shadow-2xs"
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Map & Navigation Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Map Viewport (8 Columns) */}
        <div className="lg:col-span-8 flex flex-col space-y-4">
          {/* Controls Bar: Building & Floor Selector */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-3 border border-slate-200 shadow-2xs">
            {/* Building Tabs */}
            <div className="flex items-center space-x-1 overflow-x-auto scrollbar-none py-1">
              <Building className="h-4 w-4 text-slate-400 mr-1 shrink-0" />
              {buildings.map(bldg => (
                <button
                  key={bldg.id}
                  id={`btn-bldg-${bldg.id}`}
                  type="button"
                  onClick={() => {
                    setSelectedBuildingId(bldg.id);
                    setSelectedFloor(bldg.floors[0] || 0);
                    announce(`Viewing ${bldg.name}`);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedBuildingId === bldg.id
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {bldg.code}: {bldg.name.split(' ')[0]}
                </button>
              ))}
            </div>

            {/* Floor Selector Buttons */}
            <div className="flex items-center space-x-1">
              <Layers className="h-4 w-4 text-slate-400 mr-1" />
              <span className="text-xs font-semibold text-slate-500 mr-1">Floor:</span>
              {(activeBuilding?.floors || [0, 1]).map(flr => (
                <button
                  key={flr}
                  id={`btn-floor-${flr}`}
                  type="button"
                  onClick={() => {
                    setSelectedFloor(flr);
                    announce(`Floor ${flr} selected`);
                  }}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                    selectedFloor === flr
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                  aria-label={`Select Floor ${flr}`}
                >
                  {flr === 0 ? 'G' : flr}
                </button>
              ))}

              {/* Admin Room Tagger Button */}
              {currentUser.role === 'admin' && (
                <button
                  id="btn-admin-add-room"
                  type="button"
                  onClick={() => {
                    setEditingRoom({
                      buildingId: selectedBuildingId,
                      floor: selectedFloor,
                      type: 'classroom',
                      accessibilityTags: ['ramp_accessible', 'wide_doorway'],
                      coordinates: { x: 50, y: 50, width: 100, height: 80 },
                    });
                    setIsAdminModalOpen(true);
                  }}
                  className="ml-2 flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-purple-600 text-white text-xs font-bold hover:bg-purple-700"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Tag Room</span>
                </button>
              )}
            </div>
          </div>

          {/* Interactive SVG Map Canvas */}
          <div
            className="relative h-[480px] w-full rounded-2xl border-2 border-slate-200 bg-slate-950/5 p-4 shadow-inner overflow-hidden flex flex-col justify-between"
            role="region"
            aria-label={`Interactive floor plan of ${activeBuilding?.name}, Floor ${selectedFloor}`}
          >
            {/* Map Header Overlay */}
            <div className="flex items-center justify-between bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs text-xs font-bold text-slate-800 z-10">
              <div className="flex items-center space-x-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{activeBuilding?.name} • Floor {selectedFloor === 0 ? 'Ground' : selectedFloor}</span>
              </div>
              <div className="flex items-center space-x-3 text-3xs text-slate-500 font-medium">
                <span className="flex items-center space-x-1">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  <span>Ramp / Step-Free</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="h-2 w-2 rounded-full bg-purple-500" />
                  <span>Accessible Restroom</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  <span>Elevator</span>
                </span>
              </div>
            </div>

            {/* SVG Architectural Canvas */}
            <svg
              className="absolute inset-0 h-full w-full select-none"
              viewBox="0 0 600 380"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Architectural Grid & Corridors */}
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E2E8F0" strokeWidth="0.8" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Main Hallway / Tactile Path */}
              <rect x="20" y="160" width="560" height="50" rx="8" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="2" />
              <line x1="25" y1="185" x2="575" y2="185" stroke="#3B82F6" strokeWidth="2" strokeDasharray="6 4" />
              <text x="35" y="180" fill="#64748B" fontSize="9" fontWeight="600">
                TACTILE COMPLIANT CORRIDOR (STEP-FREE)
              </text>

              {/* Outdoor Campus Pathways connecting to other buildings */}
              <path
                d="M 500 210 L 500 360 L 300 360"
                fill="none"
                stroke="#94A3B8"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray="2 6"
              />
              <text x="360" y="355" fill="#475569" fontSize="9" fontWeight="bold">
                OUTDOOR PAVED ACCESS WALKWAY
              </text>

              {/* Render Floor Rooms as Interactive SVG Blocks */}
              {floorRooms.map(room => {
                const isSelected = selectedRoom?.id === room.id;
                const isStart = startRoomId === room.id;
                const isEnd = endRoomId === room.id;

                let fill = '#FFFFFF';
                let stroke = '#94A3B8';
                if (room.type === 'washroom') {
                  fill = '#FAF5FF';
                  stroke = '#A855F7';
                } else if (room.type === 'elevator') {
                  fill = '#FEF3C7';
                  stroke = '#F59E0B';
                } else if (room.type === 'exit') {
                  fill = '#ECFDF5';
                  stroke = '#10B981';
                } else if (room.type === 'auditorium' || room.type === 'lab') {
                  fill = '#EFF6FF';
                  stroke = '#3B82F6';
                }

                if (isSelected) {
                  stroke = '#2563EB';
                }

                return (
                  <g
                    key={room.id}
                    id={`svg-room-${room.id}`}
                    onClick={() => {
                      setSelectedRoom(room);
                      setEndRoomId(room.id);
                      announce(`Selected ${room.name}, ${room.roomNumber}`);
                    }}
                    className="cursor-pointer transition-all hover:opacity-90"
                  >
                    <rect
                      x={room.coordinates.x}
                      y={room.coordinates.y}
                      width={room.coordinates.width}
                      height={room.coordinates.height}
                      rx="8"
                      fill={fill}
                      stroke={stroke}
                      strokeWidth={isSelected ? 3 : 1.5}
                      className="transition-colors"
                    />

                    {/* Room Labels */}
                    <text
                      x={room.coordinates.x + 8}
                      y={room.coordinates.y + 16}
                      fill="#0F172A"
                      fontSize="9.5"
                      fontWeight="bold"
                    >
                      {room.roomNumber}
                    </text>
                    <text
                      x={room.coordinates.x + 8}
                      y={room.coordinates.y + 28}
                      fill="#334155"
                      fontSize="8"
                      fontWeight="500"
                    >
                      {room.name.length > 20 ? room.name.slice(0, 18) + '...' : room.name}
                    </text>

                    {/* Accessibility Icons / Badges inside room */}
                    {room.accessibilityTags.includes('accessible_restroom') && (
                      <text x={room.coordinates.x + room.coordinates.width - 20} y={room.coordinates.y + 18} fontSize="11">
                        ♿
                      </text>
                    )}
                    {room.accessibilityTags.includes('braille_signage') && (
                      <circle cx={room.coordinates.x + 12} cy={room.coordinates.y + room.coordinates.height - 10} r="3" fill="#3B82F6" />
                    )}

                    {/* Start & End Route Pins */}
                    {isStart && (
                      <g transform={`translate(${room.coordinates.x + room.coordinates.width / 2 - 10}, ${room.coordinates.y - 12})`}>
                        <circle cx="10" cy="10" r="10" fill="#10B981" />
                        <text x="10" y="14" fill="#FFFFFF" fontSize="10" fontWeight="bold" textAnchor="middle">
                          A
                        </text>
                      </g>
                    )}
                    {isEnd && (
                      <g transform={`translate(${room.coordinates.x + room.coordinates.width / 2 - 10}, ${room.coordinates.y - 12})`}>
                        <circle cx="10" cy="10" r="10" fill="#EF4444" />
                        <text x="10" y="14" fill="#FFFFFF" fontSize="10" fontWeight="bold" textAnchor="middle">
                          B
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Navigation Route Overlay Path */}
              {isNavigating && routeResult && (
                <path
                  d="M 100 85 L 100 185 L 375 185 L 375 65"
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray="8 6"
                  className="animate-pulse"
                />
              )}
            </svg>

            {/* Map Bottom Information Strip */}
            <div className="flex items-center justify-between bg-white/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-200 shadow-2xs z-10 text-xs">
              <span className="text-slate-600 font-medium">
                Click any room on map to inspect details or set as navigation destination.
              </span>
              <div className="flex items-center space-x-2 font-bold text-blue-600">
                <MapPin className="h-4 w-4" />
                <span>Selected: {selectedRoom?.name || 'None'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Turn-by-Turn Routing & Audio Narration (4 Columns) */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          {/* Route Planner Box */}
          <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-md">
            <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2 mb-3">
              <Navigation className="h-4 w-4 text-blue-600" />
              <span>Route Planner</span>
            </h2>

            <div className="space-y-3">
              {/* Start Point */}
              <div>
                <label className="block text-2xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  {t.modules.navigate.startPoint}
                </label>
                <select
                  id="select-start-room"
                  value={startRoomId}
                  onChange={e => setStartRoomId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 p-2 text-xs font-semibold text-slate-800 focus:border-blue-600 focus:outline-hidden"
                >
                  {rooms.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.roomNumber} - {r.name} ({r.buildingId.replace('bldg_', '')})
                    </option>
                  ))}
                </select>
              </div>

              {/* Destination */}
              <div>
                <label className="block text-2xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  {t.modules.navigate.destination}
                </label>
                <select
                  id="select-end-room"
                  value={endRoomId}
                  onChange={e => setEndRoomId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 p-2 text-xs font-semibold text-slate-800 focus:border-blue-600 focus:outline-hidden"
                >
                  {rooms.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.roomNumber} - {r.name} ({r.buildingId.replace('bldg_', '')})
                    </option>
                  ))}
                </select>
              </div>

              {/* Accessible Route Toggle */}
              <div className="pt-1">
                <label className="flex items-center space-x-2.5 p-2 rounded-xl bg-blue-50/70 border border-blue-200 cursor-pointer">
                  <input
                    id="toggle-accessible-route"
                    type="checkbox"
                    checked={accessibleOnly}
                    onChange={e => setAccessibleOnly(e.target.checked)}
                    className="h-4 w-4 rounded border-blue-400 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-blue-900 block">
                      {t.modules.navigate.accessibleRoute}
                    </span>
                    <span className="text-3xs text-blue-700">
                      Zero stairs, uses ramps and elevators only
                    </span>
                  </div>
                </label>
              </div>

              {/* Action Button */}
              <button
                id="btn-start-navigation"
                type="button"
                onClick={() => handleCalculateRoute()}
                disabled={isLoadingRoute}
                className="w-full mt-2 rounded-xl bg-blue-700 py-2.5 px-4 text-xs font-bold text-white shadow-md hover:bg-blue-800 transition-all flex items-center justify-center space-x-2 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
              >
                <Compass className="h-4 w-4" />
                <span>{isLoadingRoute ? 'Calculating...' : t.modules.navigate.startNavigation}</span>
              </button>
            </div>
          </div>

          {/* Turn-by-Turn Directions & Audio Narration Card */}
          {routeResult && (
            <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-md space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {t.modules.navigate.turnByTurn}
                  </h3>
                  <div className="flex items-center space-x-3 text-xs text-slate-500 mt-0.5">
                    <span>{routeResult.totalDistanceMeters} m</span>
                    <span>•</span>
                    <span>~{routeResult.totalEstimatedMinutes} min walk</span>
                  </div>
                </div>

                <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 text-3xs font-bold">
                  Active Guidance
                </span>
              </div>

              {/* Audio Narration Controls */}
              <div className="rounded-xl bg-slate-900 p-3.5 text-white space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Volume2 className="h-4 w-4 text-blue-400" />
                    <span className="text-xs font-bold">Audio Voice Guide</span>
                  </div>
                  <span className="text-3xs text-slate-400">Step {currentStepIndex + 1} of {routeResult.steps.length}</span>
                </div>

                {currentStep && (
                  <p className="text-xs text-slate-200 bg-slate-800/80 p-2.5 rounded-lg border border-slate-700 leading-relaxed font-medium">
                    "{currentStep.audioPrompt}"
                  </p>
                )}

                <div className="flex items-center justify-between pt-1">
                  <button
                    id="btn-repeat-audio-step"
                    type="button"
                    onClick={handleRepeatStep}
                    className="flex items-center space-x-1 text-3xs font-bold text-slate-300 hover:text-white px-2 py-1 rounded bg-slate-800"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>{t.modules.navigate.repeatStep}</span>
                  </button>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      disabled={currentStepIndex === 0}
                      className="px-2.5 py-1 rounded bg-slate-800 text-xs font-bold text-slate-200 hover:bg-slate-700 disabled:opacity-40"
                    >
                      Prev
                    </button>
                    <button
                      type="button"
                      onClick={handleNextStep}
                      disabled={currentStepIndex === routeResult.steps.length - 1}
                      className="px-2.5 py-1 rounded bg-blue-600 text-xs font-bold text-white hover:bg-blue-500 disabled:opacity-40"
                    >
                      Next Step
                    </button>
                  </div>
                </div>
              </div>

              {/* Step list */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {routeResult.steps.map((step, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setCurrentStepIndex(idx);
                      speakText(step.audioPrompt);
                    }}
                    className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      currentStepIndex === idx
                        ? 'border-blue-500 bg-blue-50/80 font-bold text-blue-900 shadow-2xs'
                        : 'border-slate-100 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-3xs font-bold ${
                        currentStepIndex === idx ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {step.stepNumber}
                      </span>
                      <span className="line-clamp-2">{step.instruction}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Selected Room Metadata Card */}
          {selectedRoom && (
            <div className="rounded-2xl bg-white p-4 border border-slate-200 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-3xs font-bold uppercase tracking-wider text-slate-400">
                  Room Information
                </span>
                <span className="text-3xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 capitalize">
                  {selectedRoom.type}
                </span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">{selectedRoom.name}</h4>
                <p className="text-xs text-slate-500">{selectedRoom.department} • Room {selectedRoom.roomNumber}</p>
                {selectedRoom.description && (
                  <p className="text-xs text-slate-600 mt-1 italic">{selectedRoom.description}</p>
                )}
              </div>

              {/* Accessibility Badges */}
              <div className="pt-2 border-t border-slate-100">
                <p className="text-3xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Accessibility Compliance Tags
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedRoom.accessibilityTags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-3xs font-semibold capitalize"
                    >
                      ✓ {tag.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Admin Room Tagger Modal */}
      {isAdminModalOpen && editingRoom && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center space-x-2">
              <ShieldCheck className="h-5 w-5 text-purple-600" />
              <span>Admin Floor Plan Tag Editor</span>
            </h3>

            <form onSubmit={handleSaveRoom} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Room Number</label>
                  <input
                    type="text"
                    required
                    value={editingRoom.roomNumber || ''}
                    onChange={e => setEditingRoom({ ...editingRoom, roomNumber: e.target.value })}
                    placeholder="e.g. TH-G05"
                    className="w-full rounded-lg border border-slate-300 p-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Room Name</label>
                  <input
                    type="text"
                    required
                    value={editingRoom.name || ''}
                    onChange={e => setEditingRoom({ ...editingRoom, name: e.target.value })}
                    placeholder="e.g. Algorithms Lab"
                    className="w-full rounded-lg border border-slate-300 p-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={editingRoom.department || ''}
                    onChange={e => setEditingRoom({ ...editingRoom, department: e.target.value })}
                    placeholder="e.g. Computer Science"
                    className="w-full rounded-lg border border-slate-300 p-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Room Type</label>
                  <select
                    value={editingRoom.type || 'classroom'}
                    onChange={e => setEditingRoom({ ...editingRoom, type: e.target.value as any })}
                    className="w-full rounded-lg border border-slate-300 p-2"
                  >
                    <option value="classroom">Classroom</option>
                    <option value="lab">Lab</option>
                    <option value="office">Office</option>
                    <option value="library">Library</option>
                    <option value="washroom">Washroom</option>
                    <option value="elevator">Elevator</option>
                    <option value="exit">Exit</option>
                    <option value="canteen">Canteen</option>
                    <option value="parking">Parking</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Accessibility Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={editingRoom.accessibilityTags?.join(', ') || ''}
                  onChange={e =>
                    setEditingRoom({
                      ...editingRoom,
                      accessibilityTags: e.target.value.split(',').map(s => s.trim()) as AccessibilityTag[],
                    })
                  }
                  placeholder="ramp_accessible, elevator_access, braille_signage"
                  className="w-full rounded-lg border border-slate-300 p-2"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAdminModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-purple-600 text-white font-bold hover:bg-purple-700"
                >
                  Save to Floor Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
