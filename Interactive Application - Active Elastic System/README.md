# Agent-Based System Simulation

This repository hosts an interactive application modeling an **Active Elastic System**, where self-propelled particles interact through spring-like connections. The system showcases emergent collective motion based on elasticity-driven dynamics, inspired by swarming behaviors observed in nature, such as fish schools, bird flocks, and bacterial colonies.

The project is an interactive simulation of an agent-based system implemented using p5.js. The simulation allows users to create, manipulate, and connect agents within a dynamic environment, adjusting various parameters that influence the agents' behavior and the overall system dynamics. The main goal is to provide a visual and interactive way to explore how agents and their interactions evolve over time.

## Features

- **Interactive Interface**: Create, move, and connect agents using a variety of controls and buttons.
- **Elastic Interactions**: Particles are connected by virtual springs, and their dynamics are driven by elasticity rather than alignment-based interactions like in traditional models (e.g., Vicsek model).
- **Customizable Parameters**: The application allows users to adjust parameters like spring constants, damping coefficients, noise levels, and more.
- **Dynamic Grid Movement**: Move the grid and adjust agent positions accordingly to explore different sections of the canvas.
- **Real-time Visualization**: The system displays real-time collective behaviors, and users can interact with the simulation, adding/removing agents or adjusting grid properties.
- **Agent System**: Agents can be dragged, repositioned, or connected/disconnected dynamically, with spring lengths resetting based on agent movement.
- **Export and Import Functionality**: Save and load system configurations (agents and connections) as CSV files.


## Theoretical Background

The **Active Elastic System** is based on the work presented in the paper "Elasticity-Based Mechanism for the Collective Motion of Self-Propelled Particles with Springlike Interactions" by Ferrante et al. (2013). This model introduces a novel mechanism where collective motion emerges from elastic deformations between self-propelled agents, without requiring explicit alignment interactions.

### Core Equations:

- **Position Update**:  
  $\mathbf{x}_i = v_0 \hat{n}_i + \alpha \left[ (\mathbf{F}_i + D_r \xi_r) \cdot \hat{n}_i \right] \hat{n}_i$
  
  Where $\mathbf{x}_i$ is the position of agent $i$, $v_0$ is the self-propulsion velocity, $\mathbf{F}_i$ represents the spring-like force on the agent, and $D_r$ adds random fluctuations.

This model diverges from traditional alignment-based collective motion models by utilizing position-based interactions, resulting in an active crystal-like state where agents move coherently.

## Getting Started

### Prerequisites

- **Web Browser**: The interactive application runs directly in a web browser, with no installation required.

### Running the Application

1. Open [Online Version](https://editor.p5js.org/saulhuitzil/full/KN0TT9HPo)

#### Alternative

1. Clone this repository:
   ```bash
   git clone https://github.com/MultiscaleProject/ActiveMatter.git

2. Navigate to the Interactive Application - Active Elastic System directory.
3. Open index.html in your preferred web browser (Firefox recommended).




   



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

## Example Use Case

The model is ideal for simulating and studying collective behaviors in biological or artificial systems. It can be used in research on swarming behavior, autonomous robotics, or collective dynamics in multi-agent systems.

## References

This project is based on the following publication:

- E. Ferrante, A. E. Turgut, M. Dorigo, and C. Huepe, *Elasticity-Based Mechanism for the Collective Motion of Self-Propelled Particles with Springlike Interactions*, Physical Review Letters, vol. 111, no. 26, 268302, 2013. [DOI: 10.1103/PhysRevLett.111.268302](https://doi.org/10.1103/PhysRevLett.111.268302)

For more details, please refer to the paper.

## Acknowledgement

This project was made possible through the support of Grant 62213 from the John Templeton Foundation. The opinions expressed in this publication are those of the author(s) and do not necessarily reflect the views of the John Templeton Foundation.

