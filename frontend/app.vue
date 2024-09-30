<template>
  <div
    class="flex flex-row justify-center items-center overflow-hidden w-screen h-screen"
  >
    <!-- Angle Control Panel -->
    <div class="p-4 bg-gray-800 text-white border rounded shadow-md">
      <h2 class="text-lg font-bold">Steering Control Panel</h2>

      <!-- Interactive Steering Wheel Angle Gauge -->
      <div class="flex justify-center items-center mt-4">
        <svg width="300" height="150" viewBox="0 0 300 150" class="gauge">
          <!-- Outer arc -->
          <path
            d="M 10 140 A 130 130 0 0 1 290 140"
            fill="none"
            stroke="white"
            stroke-width="2"
          />
          <!-- Tick marks and numbers -->
          <g transform="translate(150, 140)">
            <line
              x1="0"
              y1="-130"
              x2="0"
              y2="-110"
              stroke="white"
              stroke-width="2"
            />
            <text
              x="0"
              y="-120"
              fill="white"
              font-size="10"
              text-anchor="middle"
            >
              0
            </text>
            <!-- Custom ticks for the specified range -->
            <g
              v-for="tick in 21"
              :key="tick"
              :transform="`rotate(${(tick - 10) * 9})`"
            >
              <line
                x1="0"
                y1="-130"
                x2="0"
                y2="-120"
                stroke="white"
                stroke-width="1.5"
              />
              <text
                v-if="tick % 5 === 0"
                x="0"
                y="-112"
                fill="white"
                font-size="8"
                text-anchor="middle"
                :transform="`rotate(${-((tick - 10) * 9)})`"
              >
                {{ (tick - 10) * 0.0001 }}
              </text>
            </g>
          </g>
          <!-- Needle to indicate the wheel angle -->
          <line
            :transform="
              'translate(150, 140) rotate(' + wheels_angle * 10000 + ')'
            "
            x1="0"
            y1="0"
            x2="0"
            y2="-120"
            stroke="red"
            stroke-width="2"
          />
        </svg>
      </div>
      <p class="text-center mt-2">
        Wheel Angle: {{ (wheels_angle * 1000).toFixed(3) }}°
      </p>

      <!-- Buttons for controlling the wheel angle -->
      <div class="flex space-x-4 justify-center mt-2">
        <button
          @click="decreaseAngle"
          class="bg-red-500 text-white py-1 px-3 rounded"
        >
          Decrease Angle
        </button>
        <button
          @click="increaseAngle"
          class="bg-green-500 text-white py-1 px-3 rounded"
        >
          Increase Angle
        </button>
      </div>
    </div>

    <!-- Game Canvas -->
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

const wheels_angle = ref(0.0);

// Function to increase angle
function increaseAngle() {
  if (wheels_angle.value < 0.01) {
    wheels_angle.value += 0.003; // Increase angle value
  }
}

// Function to decrease angle
function decreaseAngle() {
  if (wheels_angle.value > -0.01) {
    wheels_angle.value -= 0.003; // Decrease angle value
  }
}

const car = {
  width: 50, // Adjust based on the image size
  height: 100, // Adjust based on the image size
  x: canvasWidth / 2 - 25,
  y: canvasHeight / 2 - 50, // Start in the center of the canvas
  speed: 0.5,
  angle: -Math.PI / 2, // Set initial angle so the car points upwards
};

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

const getCarCorners = (x, y, angle) => {
  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);

  const halfWidth = car.width / 2;
  const halfHeight = car.height / 2;

  const corners = [
    { x: -halfWidth, y: -halfHeight },
    { x: halfWidth, y: -halfHeight },
    { x: halfWidth, y: halfHeight },
    { x: -halfWidth, y: halfHeight },
  ];

  return corners.map((corner) => ({
    x: x + (corner.x * cosA - corner.y * sinA),
    y: y + (corner.x * sinA + corner.y * cosA),
  }));
};

const margin = 100;

const isOutOfBoundary = (x, y) => {
  return (
    x < -margin ||
    x + car.width > canvasWidth + margin ||
    y < -margin ||
    y + car.height > canvasHeight + margin
  );
};

const resetCarPosition = () => {
  car.x = initialCarPosition.x;
  car.y = initialCarPosition.y;
  car.angle = -Math.PI / 2;
};

const moveCar = () => {
  const newXForward = car.x + car.speed * Math.cos(car.angle);
  const newYForward = car.y + car.speed * Math.sin(car.angle);

  const newXBackward = car.x - car.speed * Math.cos(car.angle);
  const newYBackward = car.y - car.speed * Math.sin(car.angle);

  if (keys.ArrowUp) {
    car.x = newXForward;
    car.y = newYForward;
    car.angle += wheels_angle.value;
  }

  if (keys.ArrowDown) {
    car.x = newXBackward;
    car.y = newYBackward;
    car.angle += wheels_angle.value;
  }

  if (isOutOfBoundary(car.x, car.y)) {
    resetCarPosition();
  }
};

const drawCar = (ctx) => {
  ctx.save();
  ctx.translate(car.x + car.width / 2, car.y + car.height / 2);

  ctx.rotate(car.angle + Math.PI / 2);

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

const gameLoop = (ctx) => {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  moveCar();
  drawCar(ctx);
  requestAnimationFrame(() => gameLoop(ctx));
};

onMounted(() => {
  if (!process.client) return;

  const canvas = document.querySelector("canvas");
  const ctx = canvas.getContext("2d");

  window.addEventListener("keydown", (e) => {
    if (keys[e.key] !== undefined) keys[e.key] = true;
  });

  window.addEventListener("keyup", (e) => {
    if (keys[e.key] !== undefined) keys[e.key] = false;
  });

  vehicleImg.onload = () => {
    gameLoop(ctx);
  };

  if (vehicleImg.complete) {
    gameLoop(ctx);
  }
});
</script>

<style scoped>
#gameCanvas {
  background-image: url("~/assets/background.png");
  background-size: cover;
  background-position: center;
}
</style>
