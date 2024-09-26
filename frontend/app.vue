<template>
  <div
    class="flex justify-center items-center overflow-hidden w-screen h-screen"
  >
    <canvas
      id="gameCanvas"
      class="border-2"
      :width="canvasWidth"
      :height="canvasHeight"
    ></canvas>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import vehicle from "~/assets/vehicle.png"; // Import vehicle image

const canvasWidth = 800;
const canvasHeight = 800;

const car = {
  width: 50, // Adjust based on the image size
  height: 100, // Adjust based on the image size
  x: canvasWidth / 2 - 25,
  y: canvasHeight / 2 - 50, // Start in the center of the canvas
  speed: 0.5,
  angle: -Math.PI / 2, // Set initial angle so the car points upwards
};

// Initial center position
const initialCarPosition = {
  x: canvasWidth / 2 - 25,
  y: canvasHeight / 2 - 50,
};

const keys = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
};

let vehicleImg;

// Ensure the image loading happens on the client-side
if (process.client) {
  vehicleImg = new Image(); // Create image object only in the client-side
  vehicleImg.src = vehicle; // Load the vehicle image
}

// Function to calculate car's corners based on position and angle
const getCarCorners = (x, y, angle) => {
  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);

  // Half dimensions of the car
  const halfWidth = car.width / 2;
  const halfHeight = car.height / 2;

  // Calculate the offset of each corner from the car's center
  const corners = [
    { x: -halfWidth, y: -halfHeight }, // Top-left
    { x: halfWidth, y: -halfHeight }, // Top-right
    { x: halfWidth, y: halfHeight }, // Bottom-right
    { x: -halfWidth, y: halfHeight }, // Bottom-left
  ];

  // Rotate and translate the corners to match the car's current position and angle
  return corners.map((corner) => ({
    x: x + (corner.x * cosA - corner.y * sinA),
    y: y + (corner.x * sinA + corner.y * cosA),
  }));
};

const margin = 100; // Adjust this value to increase or decrease the margin space

const isOutOfBoundary = (x, y) => {
  return (
    x < -margin ||
    x + car.width > canvasWidth + margin ||
    y < -margin ||
    y + car.height > canvasHeight + margin
  );
};

// Function to reset the car position to the center of the canvas
const resetCarPosition = () => {
  car.x = initialCarPosition.x;
  car.y = initialCarPosition.y;
  car.angle = -Math.PI / 2; // Reset the angle
};

// Function to move the car in the direction it is facing
const moveCar = () => {
  const newXForward = car.x + car.speed * Math.cos(car.angle);
  const newYForward = car.y + car.speed * Math.sin(car.angle);

  const newXBackward = car.x - car.speed * Math.cos(car.angle);
  const newYBackward = car.y - car.speed * Math.sin(car.angle);

  // Move forward (towards the head of the car)
  if (keys.ArrowUp) {
    car.x = newXForward;
    car.y = newYForward;
  }

  // Move backward (towards the rear of the car)
  if (keys.ArrowDown) {
    car.x = newXBackward;
    car.y = newYBackward;
  }

  // Rotate the car left (counter-clockwise)
  if (keys.ArrowLeft) {
    car.angle -= 0.01;
  }

  // Rotate the car right (clockwise)
  if (keys.ArrowRight) {
    car.angle += 0.01;
  }

  // If the car goes out of bounds, reset its position to the center
  if (isOutOfBoundary(car.x, car.y)) {
    resetCarPosition();
  }
};

// Function to draw the car using the vehicle image
const drawCar = (ctx) => {
  ctx.save();
  ctx.translate(car.x + car.width / 2, car.y + car.height / 2); // Move origin to center of car

  // Adjust the angle so the image is aligned correctly
  ctx.rotate(car.angle + Math.PI / 2); // Add 90 degrees to align the image "front" with the "upward" direction

  // Draw the vehicle image (check if it's loaded)
  if (vehicleImg && vehicleImg.complete) {
    ctx.drawImage(
      vehicleImg,
      -car.width / 2,
      -car.height / 2,
      car.width,
      car.height
    );
  }

  ctx.restore();
};

// Main game loop
const gameLoop = (ctx) => {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight); // Clear the canvas
  moveCar(); // Update car movement
  drawCar(ctx); // Redraw the car at its new position
  requestAnimationFrame(() => gameLoop(ctx)); // Continue the loop
};

// Mounting the game loop
onMounted(() => {
  if (!process.client) return; // Only run in the client-side

  const canvas = document.querySelector("canvas");
  const ctx = canvas.getContext("2d");

  window.addEventListener("keydown", (e) => {
    if (keys[e.key] !== undefined) keys[e.key] = true; // Mark the key as pressed
  });

  window.addEventListener("keyup", (e) => {
    if (keys[e.key] !== undefined) keys[e.key] = false; // Mark the key as released
  });

  // Ensure the image is loaded before starting the game loop
  vehicleImg.onload = () => {
    gameLoop(ctx); // Start the game loop once the image is loaded
  };

  if (vehicleImg.complete) {
    gameLoop(ctx); // Start the game loop if the image is already loaded
  }
});
</script>

<style scoped>
#gameCanvas {
  background-image: url("~/assets/background.png"); /* Path to your image */
  background-size: cover; /* Cover the entire canvas */
  background-position: center; /* Center the background image */
}
</style>
