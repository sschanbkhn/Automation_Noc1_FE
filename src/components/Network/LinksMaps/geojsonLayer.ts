// FILE: src/components/geojsonLayer.js
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import GeoJSON from 'ol/format/GeoJSON';

export function createGeoJSONLayer(data: any) {
  return new VectorLayer({
    source: new VectorSource({
      features: new GeoJSON().readFeatures(data),
    }),
  });
}