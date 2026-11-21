import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";

let model: cocoSsd.ObjectDetection | null = null;

/*
 * Load COCO-SSD only once.
 */
export async function loadVehicleModel() {
  if (model) {
    return model;
  }

  console.log("Loading COCO-SSD vehicle detection model...");

  model = await cocoSsd.load();

  console.log("COCO-SSD model loaded successfully.");

  return model;
}

/*
 * Vehicle classes that COCO-SSD can detect.
 *
 * COCO-SSD includes:
 * car
 * motorcycle
 * bus
 * truck
 *
 * We count these as vehicles.
 */
const VEHICLE_CLASSES = [
  "car",
  "motorcycle",
  "bus",
  "truck",
];

/*
 * Detect vehicles in a video frame.
 */
export async function detectVehicles(
  video: HTMLVideoElement
): Promise<{
  vehicleCount: number;
  detections: cocoSsd.DetectedObject[];
}> {
  const detectionModel = await loadVehicleModel();

  const predictions = await detectionModel.detect(video);

  const vehicleDetections = predictions.filter(
    (prediction) =>
      VEHICLE_CLASSES.includes(prediction.class) &&
      prediction.score >= 0.5
  );

  return {
    vehicleCount: vehicleDetections.length,
    detections: vehicleDetections,
  };
}