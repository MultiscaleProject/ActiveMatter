# Agent-Based System Simulation

This project is an interactive simulation of an agent-based system implemented using p5.js. The simulation allows users to create, manipulate, and connect agents within a dynamic environment, adjusting various parameters that influence the agents' behavior and the overall system dynamics. The main goal is to provide a visual and interactive way to explore how agents and their interactions evolve over time.

## Features

- **Interactive Interface**: Create, move, and connect agents using a variety of controls and buttons.
- **Customizable Parameters**: Adjust agent behavior and connection properties through sliders and controls.
- **Dynamic Grid Movement**: Move the grid and adjust agent positions accordingly to explore different sections of the canvas.
- **Real-time Visualization**: Display agents and connections dynamically with visual indicators of their state and connections.
- **Export and Import Functionality**: Save and load system configurations (agents and connections) as CSV files.

## Main Components

### Global Variables
- **Interface Elements**: 
  - `controlPanel`: Manages the display and interaction areas for controls.
  - `buttons`: Handles user interface buttons for creating, removing, and connecting agents.
  - `importExport`: Manages importing and exporting data.

- **System State Variables**: 
  - `myXSystem`: Manages the collection of agents and connections.
  - `gridReferencePosition`: Tracks the position of the grid reference point.

- **Simulation Parameters**:
  - `_r`, `_v0`, `_alpha`, `_beta`, `_dTheta`, `_k`: Sliders controlling various agent and connection properties such as radius, speed, force constants, etc.
  - `updateParameters`: A flag indicating when to update the system with new parameter values.

### Key Functions

- **`setup()`**: Initializes the canvas, creates the interface elements, and sets up the main agent system.
- **`draw()`**: The main rendering loop. It updates the simulation, redraws the control panels, manages grid movement, and displays the agents and their connections.
- **Interaction Functions**: Handle user interactions with the keyboard and mouse:
  - `keyPressed()`: Toggles various modes such as creating or deleting agents.
  - `mousePressed()`, `mouseReleased()`, `mouseDragged()`: Allow for dragging agents, creating connections, and interacting with the simulation environment.

### Classes

#### 1. **AgentSystem**
- Manages all agents and their connections within the simulation.
- **Key Methods**:
  - `addAgent(x, y)`: Adds a new agent at specified coordinates.
  - `update(dt)`: Updates the state of each agent and the overall system, returning the net displacement.
  - `display()`: Draws all agents and connections on the canvas.
  - `adjustAgentPositions(displacement)`: Adjusts agent positions based on changes in the grid.

#### 2. **ButtonManager**
- Manages user interface buttons and toggles between different interaction modes (e.g., create agent, remove agent).
- **Key Methods**:
  - `handleMousePressed(system)`: Handles mouse interactions, including creating and deleting agents and connections.
  - `UpdateParameters(system)`: Updates agent parameters based on slider values.

#### 3. **ControlPanel**
- Defines the visual layout and control areas for the simulation.
- **Key Methods**:
  - `CreateSliders()`: Initializes sliders for adjusting system parameters.
  - `drawCanvas1()`, `drawCanvas2()`: Draws the main and secondary canvas areas for interaction.

#### 4. **Connection**
- Represents a connection between two agents, defining forces and interactions based on agent positions.
- **Key Methods**:
  - `Update(agents)`: Updates forces between connected agents.
  - `Display(agents)`: Visualizes the connection between agents on the canvas.

#### 5. **ImportExport**
- Handles importing and exporting system data as CSV files.
- **Key Methods**:
  - `exportarCsv()`: Exports the current configuration of agents and connections.
  - `recreateSystem()`: Reconstructs the agent system from imported data.

#### 6. **Agent**
- Represents individual agents with properties like position, orientation, speed, and applied forces.
- **Key Methods**:
  - `Update(dt)`: Updates the agent’s position and orientation based on forces.
  - `Display()`: Draws the agent with visual indicators of its orientation.
  - `ApplyForce()`, `ApplyForce_head()`, `ApplyForce_tail()`: Methods for applying forces to the agent.

## How to Use

1. **Run the Simulation**: Load the code in a p5.js environment and run it.
2. **Interact with the System**:
   - Use buttons to add, connect, or remove agents.
   - Drag agents to reposition them or adjust the grid movement.
3. **Adjust Parameters**: Use the sliders to modify agent properties and system behavior in real-time.
4. **Export/Import**: Save the current system state or load a new configuration using the import/export options.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/agent-system-simulation.git
