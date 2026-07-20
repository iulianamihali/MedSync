import "mapbox-gl/dist/mapbox-gl.css";
import { Box } from "@mui/system";
import Map, { Marker } from "react-map-gl/mapbox";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { CircularProgress, Typography } from "@mui/material";
import ExploreOutlinedIcon from "@mui/icons-material/ExploreOutlined";
import "./MapPreview.scss";

export default function MapPreview() {
    const [userLocation, setUserLocation] = useState<{
        latitude: number;
        longitude: number;
    } | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        navigator.geolocation.getCurrentPosition((position) => {
            setUserLocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
            });
        });
    }, []);

    return (
        <Box className="map-preview" onClick={() => navigate("/map")}>
            <Box className="map-preview__header">
                <Typography className="map-preview__title">
                    Find a clinic
                </Typography>
                <Box className="map-preview__explore-hint">
                    <ExploreOutlinedIcon />
                    <Typography>Explore map</Typography>
                </Box>
            </Box>

            {!userLocation ? (
                <Box className="map-preview__loading">
                    <CircularProgress size={28} />
                </Box>
            ) : (
                <Box
                    sx={{
                        width: "100%",
                        height: 220,
                    }}
                >
                    <Map
                        initialViewState={{
                            longitude: userLocation?.longitude,
                            latitude: userLocation?.latitude,
                            zoom: 14,
                        }}
                        mapStyle="mapbox://styles/mapbox/streets-v12"
                        mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
                        scrollZoom={false}
                        dragPan={false}
                    >
                        {userLocation && (
                            <Marker
                                longitude={userLocation?.longitude}
                                latitude={userLocation?.latitude}
                                anchor="center"
                            >
                                <Box className="map-preview__user-marker">
                                    <Box className="map-preview__user-marker-dot" />
                                </Box>
                            </Marker>
                        )}
                    </Map>
                </Box>
            )}
        </Box>
    );
}