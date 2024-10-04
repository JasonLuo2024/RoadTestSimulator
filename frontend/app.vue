<template>
  <div
    class="h-screen w-screen flex flex-col justify-center items-center overflow-hidden bg-[#e6e5de]"
  >
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
    />

    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
    />
    <!-- Angle Control Panel -->

    <div>
      <!-- Game Canvas -->
      <canvas
        id="gameCanvas"
        :width="canvasWidth"
        :height="canvasHeight"
      ></canvas>
    </div>

    <div class="flex flex-col items-center space-y-4">
      <!-- Directional Control Pad -->
      <div class="grid grid-cols-3 gap-2 items-center justify-items-center">
        <div class="col-span-3 flex justify-center">
          <button
            @click="mimicKeyPress('ArrowUp')"
            class="bg-black text-white w-12 h-12 rounded-full flex items-center justify-center hover:bg-blue-600 active:bg-blue-700 transition-transform transform active:scale-95"
          >
            <i class="fas fa-arrow-up"></i>
          </button>
        </div>
        <button
          @click="decreaseAngle"
          class="bg-black text-white w-12 h-12 rounded-full flex items-center justify-center hover:bg-red-600 active:bg-red-700 transition-transform transform active:scale-95"
        >
          <i class="fas fa-arrow-left"></i>
        </button>
        <div></div>
        <!-- Center space for aesthetic or logo -->
        <button
          @click="increaseAngle"
          class="bg-black text-white w-12 h-12 rounded-full flex items-center justify-center hover:bg-green-600 active:bg-green-700 transition-transform transform active:scale-95"
        >
          <i class="fas fa-arrow-right"></i>
        </button>
        <div class="col-span-3 flex justify-center">
          <button
            @click="mimicKeyPress('ArrowDown')"
            class="bg-black text-white w-12 h-12 rounded-full flex items-center justify-center hover:bg-blue-600 active:bg-blue-700 transition-transform transform active:scale-95"
          >
            <i class="fas fa-arrow-down"></i>
          </button>
        </div>
      </div>
    </div>

    <div class="bg-gray-400 text-white border rounded shadow-md">
      <!-- Interactive Steering Wheel Angle Gauge -->
      <div class="flex justify-center items-center mt-4">
        <svg width="300" height="100" viewBox="0 0 300 150" class="gauge">
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
              'translate(150, 140) rotate(' + wheels_angle * 9000 + ')'
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
    </div>
  </div>
</template>
<script setup>
import { onMounted, ref } from "vue";
import vehicle from "~/assets/vehicle.png"; // Import vehicle image

const canvasWidth = 400;
const canvasHeight = 550;

const wheels_angle = ref(0.0);

// Function to increase angle
function increaseAngle() {
  if (wheels_angle.value < 0.01) {
    wheels_angle.value += 0.001; // Increase angle value
  }
}

// Function to decrease angle
function decreaseAngle() {
  if (wheels_angle.value > -0.01) {
    wheels_angle.value -= 0.001; // Decrease angle value
  }
}

const car = {
  width: 40, // Adjust based on the image size
  height: 80, // Adjust based on the image size
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

  // if (keys.ArrowLeft) {
  //   wheels_angle.value -= 0.001;
  // }

  // if (keys.ArrowRight) {
  //   wheels_angle.value += 0.001;
  // }

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

const mimicKeyPress = (key) => {
  simulateKeyDown(key);

  // Simulate keyup after a short delay to mimic a single press
  setTimeout(() => {
    simulateKeyUp(key);
  }, 100); // Adjust the delay time as needed
};

// Simulate key down event
const simulateKeyDown = (key) => {
  const event = new KeyboardEvent("keydown", { key });
  window.dispatchEvent(event);
  console.log(`${key} key down`);
};

// Simulate key up event
const simulateKeyUp = (key) => {
  const event = new KeyboardEvent("keyup", { key });
  window.dispatchEvent(event);
  console.log(`${key} key up`);
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

  background-position: center;
  background-size: 400px 560px; /* Set the background size */
}

button {
  touch-action: manipulation;
}
</style>
