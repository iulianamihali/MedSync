import "./MapComponent.scss";
import { Box } from "@mui/system";
import { useEffect, useMemo, useRef, useState } from "react";
import Map, { type MapRef, Marker } from "react-map-gl/mapbox-legacy";
import type { ClinicLocation } from "../types";
import GlobalSettings from "../../../../../GlobalSettings.json";
import axiosUtil from "../../../../../common/axiosUtil";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import LayersIcon from "@mui/icons-material/Layers";
import CardClinicPreview from "./CardClinicPreview";
import type { SelectOptionDto } from "../../../../services/AddSpecialtyServicesView";
import SearchIcon from "@mui/icons-material/Search";
import { useLocation } from "react-router-dom";

import {
    Button,
    Checkbox,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Switch,
    TextField,
    Typography
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";

const MAP_STYLES = [
    {
        label: "Standard",
        value: "mapbox://styles/mapbox/streets-v12",
        preview:
            "https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/21.2,45.7,12,0/64x64?access_token=" +
            import.meta.env.VITE_MAPBOX_TOKEN
    },
    {
        label: "Satelit",
        value: "mapbox://styles/mapbox/satellite-streets-v12",
        preview:
            "https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/static/21.2,45.7,12,0/64x64?access_token=" +
            import.meta.env.VITE_MAPBOX_TOKEN
    },
    {
        label: "Teren",
        value: "mapbox://styles/mapbox/outdoors-v12",
        preview:
            "https://api.mapbox.com/styles/v1/mapbox/outdoors-v12/static/21.2,45.7,12,0/64x64?access_token=" +
            import.meta.env.VITE_MAPBOX_TOKEN
    },
    {
        label: "Trafic",
        value: "mapbox://styles/mapbox/navigation-day-v1",
        preview:
            "https://api.mapbox.com/styles/v1/mapbox/navigation-day-v1/static/21.2,45.7,12,0/64x64?access_token=" +
            import.meta.env.VITE_MAPBOX_TOKEN
    },
    {
        label: "Dark",
        value: "mapbox://styles/mapbox/dark-v11",
        preview:
            "https://api.mapbox.com/styles/v1/mapbox/dark-v11/static/21.2,45.7,12,0/64x64?access_token=" +
            import.meta.env.VITE_MAPBOX_TOKEN
    }
];

const MapComponent = () => {
    const [clinicLocations, setClinicLocations] = useState<ClinicLocation[]>([]);
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const mapRef = useRef<MapRef>(null);
    const [mapStyle, setMapStyle] = useState(MAP_STYLES[0].value);
    const [layersOpen, setLayersOpen] = useState(false);
    const [hoverId, setHoverId] = useState("");
    const [specialties, setSpecialties] = useState<SelectOptionDto[]>([]);
    const [selectedSpecialties, setSelectedSpecialties] = useState<SelectOptionDto[]>([]);
    const [searchLocation, setSearchLocation] = useState("");
    const [searchClinicsMode, setSearchClinicsMode] = useState(false);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const location = useLocation();
    const bookingFor = location.state;

    const handleSearchClinic = (value?: string) => {
        const query = (value ?? searchLocation).trim().toLowerCase();

        if (!query) {
            if (!userLocation) return;

            mapRef.current?.flyTo({
                center: [userLocation.longitude, userLocation.latitude],
                zoom: 12,
                duration: 1500
            });
            return;
        }

        const firstClinic = filteredInstitutions.find((clinic) =>
            clinic.institutionName?.toLowerCase().includes(query)
        );

        if (!firstClinic) return;

        mapRef.current?.flyTo({
            center: [firstClinic.longitude, firstClinic.latitude],
            zoom: 14,
            duration: 1500
        });

        setHoverId(firstClinic.id);
    };

    const handleSearchLocation = async (value?: string) => {
        const query = value ?? searchLocation;

        if (!query.trim()) {
            if (!userLocation) return;

            mapRef.current?.flyTo({
                center: [userLocation.longitude, userLocation.latitude],
                zoom: 12,
                duration: 1500
            });
            return;
        }

        const res = await fetch(
            `https://api.mapbox.com/search/geocode/v6/forward?q=${encodeURIComponent(query)}&access_token=${import.meta.env.VITE_MAPBOX_TOKEN}`
        );

        const data = await res.json();
        const first = data.features?.[0];
        if (!first) return;

        const [longitude, latitude] = first.geometry.coordinates;

        mapRef.current?.flyTo({
            center: [longitude, latitude],
            zoom: 12,
            duration: 1500
        });
    };

    const handleSearch = (value?: string) => {
        if (searchClinicsMode)
            handleSearchClinic(value);
        else
            handleSearchLocation(value);
    };

    const handleToggleSpecialty = (specialty: SelectOptionDto) => {
        const exists = selectedSpecialties.some((x) => x.id === specialty.id);

        if (exists) {
            setSelectedSpecialties((prev) => prev.filter((x) => x.id !== specialty.id));
        } else {
            setSelectedSpecialties((prev) => [...prev, specialty]);
        }
    };

    const getClinicLocations = () => {
        const url = `${GlobalSettings.globalDataRoute}/getClinicLocations`;
        axiosUtil
            .get<ClinicLocation[]>(url)
            .then((res) => setClinicLocations(res.data))
            .catch((err) => console.error(err));
    };

    const getSpecialties = () => {
        const url = `${GlobalSettings.globalDataRoute}/getSpecialties`;
        axiosUtil
            .get<SelectOptionDto[]>(url)
            .then((res) => setSpecialties(res.data))
            .catch((err) => console.error(err));
    };

    useEffect(() => {
        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
            setUserLocation({ latitude, longitude });
        });

        getClinicLocations();
        getSpecialties();
    }, []);

    useEffect(() => {
        if (userLocation && mapRef.current) {
            mapRef.current.flyTo({
                center: [userLocation.longitude, userLocation.latitude],
                zoom: 12,
                duration: 1500
            });
        }
    }, [userLocation]);

    const filteredInstitutions = useMemo(() => {
        if (!selectedSpecialties.length) return clinicLocations;

        return clinicLocations.filter((x) =>
            x.institutionSpecialties?.some((a) =>
                selectedSpecialties.some((b) => b.name === a)
            )
        );
    }, [selectedSpecialties, clinicLocations]);

    const handleZoomIn = () => mapRef.current?.zoomIn({ duration: 300 });
    const handleZoomOut = () => mapRef.current?.zoomOut({ duration: 300 });

    return (
        <Box className="map-component">
            <Map
                ref={mapRef}
                initialViewState={{
                    longitude: userLocation?.longitude ?? 25.0,
                    latitude: userLocation?.latitude ?? 45.9,
                    zoom: userLocation ? 12 : 6
                }}
                mapStyle={mapStyle}
                mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
                style={{ width: "100%", height: "100%" }}
            >
                {userLocation && (
                    <Marker longitude={userLocation.longitude} latitude={userLocation.latitude} anchor="center">
                        <MyLocationIcon className="user-marker" />
                    </Marker>
                )}

                {filteredInstitutions.map((location) => (
                    <Marker
                        key={location.id}
                        longitude={location.longitude}
                        latitude={location.latitude}
                        anchor="bottom"
                    >
                        <Box
                            className="marker-wrapper"
                            onClick={() => {
                                if (hoverId.length === 0) setHoverId(location.id);
                                else {
                                    if (location.id === hoverId) setHoverId("");
                                    else setHoverId(location.id);
                                }
                            }}
                        >
                            {hoverId === location.id && (
                                <Box
                                    className="marker-preview"
                                    onMouseEnter={() => setHoverId(location.id)}
                                    onMouseLeave={() => setHoverId("")}
                                >
                                    <CardClinicPreview location={location} bookingFor={bookingFor} />
                                </Box>
                            )}

                            <Box
                                component="img"
                                src="/assets/clinicalMarker.svg"
                                className="marker-image"
                            />

                            <Box className="rating-badge">
                                <Typography className="rating-star">★</Typography>
                                <Typography className="rating-text">{location.rating}</Typography>
                            </Box>
                        </Box>
                    </Marker>
                ))}
            </Map>

            <Box className="search-box">
                <TextField
                    size="small"
                    fullWidth
                    value={searchLocation}
                    onChange={(e) => {
                        const value = e.target.value;
                        setSearchLocation(value);

                        if (!value.trim()) {
                            handleSearch(value);
                        }
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            handleSearch();
                        }
                    }}
                    placeholder={searchClinicsMode ? "Search clinic" : "Search location"}
                    InputProps={{
                        startAdornment: <SearchIcon className="search-icon" />,
                        endAdornment: (
                            <Box className="search-switch-wrapper">
                                <Switch
                                    checked={searchClinicsMode}
                                    onChange={(e) => setSearchClinicsMode(e.target.checked)}
                                    size="small"
                                    className="search-switch"
                                />
                            </Box>
                        )
                    }}
                    className="search-input"
                />
            </Box>

            <Box className="filter-button-wrapper">
                <IconButton
                    onClick={() => setFiltersOpen(true)}
                    className={`filter-button ${selectedSpecialties.length > 0 ? "active" : ""}`}
                >
                    <FilterListIcon sx={{ fontSize: 20 }} />
                </IconButton>
            </Box>

            <Box className="controls">
                <Box className="layers-wrapper">
                    <Box className={`layers-panel ${layersOpen ? "open" : ""}`}>
                        {MAP_STYLES.map((s) => (
                            <Box
                                key={s.value}
                                onClick={() => {
                                    setMapStyle(s.value);
                                    setLayersOpen(false);
                                }}
                                className="style-option"
                            >
                                <Box className={`style-preview ${mapStyle === s.value ? "active" : ""}`}>
                                    <img
                                        src={s.preview}
                                        alt={s.label}
                                        className="style-preview-image"
                                    />
                                </Box>

                                <Box className={`style-label ${mapStyle === s.value ? "active" : ""}`}>
                                    {s.label}
                                </Box>
                            </Box>
                        ))}
                    </Box>

                    <Box
                        onClick={() => setLayersOpen((prev) => !prev)}
                        className={`control-button ${layersOpen ? "layers-open" : ""}`}
                    >
                        <LayersIcon className="control-icon" />
                    </Box>
                </Box>

                <Box
                    onClick={() => {
                        if (!userLocation) return;
                        mapRef.current?.flyTo({
                            center: [userLocation.longitude, userLocation.latitude],
                            zoom: 12,
                            duration: 1500
                        });
                    }}
                    className="control-button"
                >
                    <MyLocationIcon className="control-icon" />
                </Box>

                <Box
                    onClick={handleZoomIn}
                    className="control-button zoom-top"
                >
                    +
                </Box>

                <Box
                    onClick={handleZoomOut}
                    className="control-button zoom-bottom"
                >
                    −
                </Box>
            </Box>

            <Dialog
                open={filtersOpen}
                onClose={() => setFiltersOpen(false)}
                fullWidth
                maxWidth="xs"
                PaperProps={{
                    className: "dialog-paper"
                }}
            >
                <DialogTitle className="dialog-title">
                    Filter specialties
                </DialogTitle>

                <DialogContent className="dialog-content">
                    <Box className="specialties-list">
                        {specialties.map((specialty) => {
                            const checked = selectedSpecialties.some((x) => x.id === specialty.id);

                            return (
                                <Box
                                    key={specialty.id}
                                    onClick={() => handleToggleSpecialty(specialty)}
                                    className={`specialty-item ${checked ? "checked" : ""}`}
                                >
                                    <Typography className="specialty-name">
                                        {specialty.name}
                                    </Typography>

                                    <Checkbox
                                        checked={checked}
                                        onChange={() => handleToggleSpecialty(specialty)}
                                        onClick={(e) => e.stopPropagation()}
                                        className="specialty-checkbox"
                                    />
                                </Box>
                            );
                        })}
                    </Box>

                    <Box className="dialog-actions">
                        <Button
                            variant="text"
                            onClick={() => setSelectedSpecialties([])}
                            className="clear-button"
                        >
                            Clear
                        </Button>

                        <Button
                            variant="contained"
                            onClick={() => setFiltersOpen(false)}
                            className="apply-button"
                        >
                            Apply
                        </Button>
                    </Box>
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default MapComponent;