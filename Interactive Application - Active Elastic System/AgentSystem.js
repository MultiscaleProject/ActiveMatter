class AgentSystem {
  constructor() {
    this.agents = {};
    this.connections = [];
    this.connections2 = [];
    this.nextAgentID = 0;
    this.fitness = 0;
  }
  
  randomThetas() {
    for (let agentID in this.agents) {
      let agent = this.agents[agentID];
      agent.theta = random(0, TWO_PI);
    }
  }

  resetNaturalLengths() {
    this.connections.forEach((connection) => {
      const agent1 = this.agents[connection.agentID1];
      const agent2 = this.agents[connection.agentID2];
      const distance = p5.Vector.dist(agent1.aposition, agent2.aposition);
      connection.l0 = distance;
    });
  }

  addAgent(x, y) {
    if (
      x > controlPanel.sx1 &&
      y > controlPanel.sy1 &&
      x < controlPanel.sx2 &&
      y < controlPanel.sy2
    ) {
      let newAgent = new Agent();
      newAgent.aposition = createVector(x, y);
      let agentID = "agent" + this.nextAgentID++; // Crear un ID único
      this.agents[agentID] = newAgent; // Agregar el agente al diccionario
      return agentID;
    }
  }

  getAgentIDAt(x, y) {
    for (let agentID in this.agents) {
      let agent = this.agents[agentID];
      if (dist(x, y, agent.aposition.x, agent.aposition.y) < agent.radius) {
        return agentID;
      }
    }
    return null;
  }

  removeAgentAt(x, y) {
    for (let agentID in this.agents) {
      let agent = this.agents[agentID];
      if (dist(x, y, agent.aposition.x, agent.aposition.y) < agent.radius) {
        this.removeAllConnectionsOfAgent(agentID);
        delete this.agents[agentID];
        break;
      }
    }
  }

  connectionExists(agentID1, agentID2) {
    return this.connections.some(
      (connection) =>
        (connection.agentID1 === agentID1 &&
          connection.agentID2 === agentID2) ||
        (connection.agentID1 === agentID2 && connection.agentID2 === agentID1)
    );
  }

  removeAllConnectionsOfAgent(agentID) {
    this.connections = this.connections.filter(
      (connection) =>
        connection.agentID1 !== agentID && connection.agentID2 !== agentID
    );
  }

  removeConnectionIfExists(agentID1, agentID2) {
    this.connections = this.connections.filter(
      (connection) =>
        !(
          connection.agentID1 === agentID1 && connection.agentID2 === agentID2
        ) &&
        !(connection.agentID1 === agentID2 && connection.agentID2 === agentID1)
    );
  }

  removeAgent(agentID) {
    delete this.agents[agentID]; 
  }

  update(dt) {
    let oldCenter = this.calculateCenterOfMass();
    for (let connection of this.connections) {
      connection.Update(this.agents);
    }
    for (let agentID in this.agents) {
      this.agents[agentID].Update(dt);
    }
    let newCenter = this.calculateCenterOfMass();
    let displacement = p5.Vector.sub(newCenter, oldCenter);
    return displacement;
  }

  calculateCenterOfMass() {
    let centerOfMass = createVector(0, 0);
    if (this.agents.length == 0) return centerOfMass;
    for (let agentID in this.agents) {
      centerOfMass.add(this.agents[agentID].aposition);
    }
    if (Object.keys(this.agents).length > 0.1) {
      centerOfMass.div(Object.keys(this.agents).length);
    }
    return centerOfMass;
  }

  centerSystem() {
    let currentCenter = this.calculateCenterOfMass();
    let canvasCenter = createVector(
      controlPanel.sx1 + (controlPanel.sx2 - controlPanel.sx1) / 2,
      (controlPanel.sy2 - controlPanel.sy1) / 2
    );
    let translation = p5.Vector.sub(canvasCenter, currentCenter);

    for (let agentID in this.agents) {
      this.agents[agentID].aposition.add(translation);
    }
  }

  adjustAgentPositions(displacement) {
    for (let agentID in this.agents) {
      this.agents[agentID].aposition.sub(displacement);
    }
  }

  display() {
    for (let agentID in this.agents) {
      let agent = this.agents[agentID];
      let isSelected = agentID === buttons.selectedAgentID;
      agent.Display(isSelected);
    }

    for (let connection of this.connections) {
      connection.Display(this.agents);
    }
  }

  clicked(mx, my) {
    for (let agentID in this.agents) {
      this.agents[agentID].Clicked(mx, my);
    }
  }

  stopDragging() {
    for (let agentID in this.agents) {
      this.agents[agentID].StopDragging();
    }
  }

  drag(mx, my) {
    for (let agentID in this.agents) {
      this.agents[agentID].Drag(mx, my);
    }
  }

  addConnection(agent1, agent2) {
    let newConnection = new Connection(agent1, agent2);
    this.connections.push(newConnection);
  }

  calculateAngularMomentum() {
    let angularMomentum = createVector(0, 0, 0);
    const referencePoint = this.calculateCenterOfMass();
    for (let agentID in this.agents) {
      let agent = this.agents[agentID];
      let r = p5.Vector.sub(agent.aposition, referencePoint);
      let velocity = p5.Vector.fromAngle(agent.theta).mult(agent.v0);
      let p = velocity;
      let angularMomentumAgent = r.cross(p);
      angularMomentum.add(angularMomentumAgent);
    }
    return angularMomentum;
  }
}
