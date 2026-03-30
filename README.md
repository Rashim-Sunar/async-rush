# Async Rush

Async Rush is an interactive, gamified educational tool designed to help developers visualize and master the JavaScript Event Loop. By providing a hands-on environment, it demonstrates how synchronous code, microtasks, and macrotasks are processed in JavaScript.

## Features

- Interactive Architecture: Drag and drop task components (synchronous tasks, Promises, and timeouts) directly into a simulated engine environment.
- 3D Visualization: A highly dynamic 3D background powered by React Three Fiber that enhances the learning experience.
- Real-Time Execution Simulation: Visually track the flow of execution across the Call Stack, Microtask Queue, and Macrotask Queue.
- Gamified Learning: Progressive levels tailored to introduce developers to increasingly complex asynchronous concepts.
- Responsive Mechanics: Fluid animations and drag-and-drop interactions powered by Framer Motion and dnd-kit.

## Technologies Used

- React 19
- Vite
- Three.js & React Three Fiber
- Tailwind CSS 4
- Framer Motion
- dnd-kit

## Prerequisites

Ensure you have Node.js and npm installed on your local machine.

## Installation

1. Clone the repository
2. Navigate to the project directory:
   ```bash
   cd async-rush
   ```
3. Install the application dependencies:
   ```bash
   npm install
   ```

## Getting Started

To start the development server, run the following command:

```bash
npm run dev
```

The application will be available at standard localhost ports provided by Vite (typically http://localhost:5173).

## How to Play

1. Analyze the Code: Review the provided JavaScript snippet located on the left panel of the user interface.
2. Formulate a Plan: Determine the order in which the tasks will resolve based on the rules of the Event Loop.
3. Drag and Drop: Move the correct task representations to their corresponding engine components.
4. Execute: Run the simulation to see if your arrangement accurately represents the Event Loop's behavior.
5. Review Output: Watch the terminal output and observe the execution sequences to validate your understanding.

## License

This project is licensed under the ISC License.
