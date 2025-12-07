import "maplibre-gl/dist/maplibre-gl.css";
import Map, { Marker, useMap } from "react-map-gl";
// eslint-disable-next-line import/no-webpack-loader-syntax
import maplibregl from "maplibre-gl";
import { useRef } from "react";
import useEventListener from "@use-it/event-listener";
import { useSnackbar } from "notistack";
import { MapContextProvider } from "./context";
import { totalBounds } from "../../data/bounds";
import maplibreglWorker from "maplibre-gl/dist/maplibre-gl-csp-worker";
maplibregl.workerClass = maplibreglWorker;

const MaplibreMarker = ({ lat, lon }) => (
  <Marker longitude={lon} latitude={lat} anchor="bottom" />
);

const convertBounds = ([w, s, e, n]) => [
  [w, s],
  [e, n],
];

const MapSnappingEventListener = ({ mapRef }) => {
  const { enqueueSnackbar } = useSnackbar();

  useEventListener("map.snapTo", ({ detail: { lat, lng } }) => {
    const map = mapRef.current?.getMap(); // safely get the map instance
    if (!map) {
      console.warn("Map not ready yet");
      return;
    }

    console.log("executing `map.snapTo` event with maplibre");

    try {
      map.flyTo({
        center: [lng, lat], // MapLibre expects [lng, lat]
        zoom: 14,
      });
    } catch (e) {
      console.error(e);
      enqueueSnackbar("Unexpected error while attempting map navigation", {
        variant: "error",
      });
    }
  });

  return null;
};

const MaplibreMap = ({ children }) => {
  const mapRef = useRef(); // create a ref to store the map instance

  console.log("render Maplibre map");

  return (
    <Map
      ref={mapRef}
      mapLib={maplibregl}
      mapStyle="https://api.maptiler.com/maps/streets-v2/style.json?key=46DCXvzkGNIvqAgCljGV"
      initialViewState={{
        bounds: convertBounds(totalBounds),
      }}
      padding={24}
    >
      <MapSnappingEventListener mapRef={mapRef} />
      <MapContextProvider value={{ Marker: MaplibreMarker }}>
        {children}
      </MapContextProvider>
    </Map>
  );
};

export default MaplibreMap;
