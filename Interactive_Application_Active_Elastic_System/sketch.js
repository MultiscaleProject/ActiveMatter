let controlPanel;
let buttons;
let importExport;

let d_t, n_agents, _r, _v0, _alpha, _beta, _dTheta, _k, _k2;

let myXSystem;

let gridReferencePosition;

let updateParameters = true;

let p;

let timeStep;

function setup() {
  createCanvas(windowWidth, windowHeight - 100);

  buttons = new ButtonManager();
  importExport = new ImportExport();
  controlPanel = new ControlPanel();
  gridReferencePosition = createVector(0, 0);

  myXSystem = new AgentSystem();
  
  timeStep = 0;
}

function draw() {
  background(0, 70, 75);
  
  controlPanel.drawCanvas1();
  
  if (updateParameters) {
    buttons.UpdateParameters(myXSystem);
  }
  
  let displacement = createVector();
  
  for (let i = 0; i < 10; i++) {
    displacement.add(myXSystem.update(d_t.value()));
  }

  if (!buttons.moveGridMode) {
    buttons.drawGrid(createVector(0, 0));
  } else {
    myXSystem.adjustAgentPositions(displacement);
    
    gridReferencePosition.sub(displacement);
    buttons.drawGrid(gridReferencePosition);
  }
  
  myXSystem.display();
  
  controlPanel.drawCanvas2();
}

function keyPressed() {
  buttons.handleKeyPressed();
}

function mousePressed() {
  buttons.handleMousePressed(myXSystem);
}

function mouseReleased() {
  myXSystem.stopDragging();
}

function mouseDragged() {
  myXSystem.drag(mouseX, mouseY);
}

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


class ButtonManager {
  constructor() {
    this.createAgentButton = createButton("(a) New Agent");
    this.createAgentButton.mousePressed(() => this.toggleAgentCreation());
    this.canCreateAgents = false;
    this.isRemovingAgents = false;

    this.selectedAgentID = null;

    this.removeAgentButton = createButton("(r) Remove Agent");
    this.removeAgentButton.mousePressed(() => this.toggleAgentRemoval());

    this.createConnectionButton = createButton("(c) New Connection");
    this.createConnectionButton.mousePressed(() =>
      this.toggleCreatingConnection()
    );
    this.isCreatingConnection = false;

    this.agentEnEspera = null;
    this.conexionEnEspera = null;
    this.estaCreandoConexion = false;

    this.headTailType = "hh";
    this.createHeadTailButtons();
    this.updateHeadTailButtonsStyle();

    this.deleteConnectionButton = createButton("(d) Remove Connection");
    this.deleteConnectionButton.mousePressed(() =>
      this.toggleDeletingConnection()
    );

    this.randomizeThetaButton = createButton("Randomize Angles");
    this.randomizeThetaButton.mousePressed(() => this.randomizeAllThetas());

    this.moveGridButton = createButton("Move Grid");
    this.moveGridButton.mousePressed(() => this.toggleGridMovement());
    this.moveGridMode = false;
    this.toggleGridMovement();

    this.exportSystemButton = createButton("Save");
    this.exportSystemButton.mousePressed(() => importExport.exportarCsv());
    
    this.importAgentsButton = createFileInput((file) =>
      importExport.handleAgentFile(file)
    ).style("display", "none");
    this.importConnectionsButton = createFileInput((file) =>
      importExport.handleConnectionFile(file)
    ).style("display", "none");
    
    this.posImpExpButtX0 = 30;
    this.posImpExpButtY0 = 30;
   
    this.importAgentsLabel = createButton("Import Agents").mousePressed(() =>
      this.importAgentsButton.elt.click()
    );
    this.importConnectionsLabel = createButton(
      "Import Connections"
    ).mousePressed(() => this.importConnectionsButton.elt.click());
    
    this.importAgentsLabel.position(10+this.posImpExpButtX0, 10+this.posImpExpButtY0);
    this.importConnectionsLabel.position(10+this.posImpExpButtX0, 40+this.posImpExpButtY0);

    this.agentEnEspera2 = null;

    this.isDeletingConnections = false;
    
    this.cloneButton = createButton("Reset Lenghts");
    this.cloneButton.mousePressed(() => myXSystem.resetNaturalLengths());
    
  }
  
  toggleClone() {
    mySystem2 = myXSystem.cloneSystem();
  }
  
  calculateFitness() {
    const numSteps = 1000;
    const repeticiones = 30;
    console.log("FitnessX:", myXSystem.calculateAverageFitness(myXSystem, repeticiones, numSteps));
  }

  toggleAgentCreation() {
    this.canCreateAgents = !this.canCreateAgents;
    this.isRemovingAgents = false; // Asegurar que no se puedan eliminar agentes mientras se crean
    this.estaCreandoConexion = false;
    this.isDeletingConnections = false;
    this.updateButtonStyles();
  }

  stopSelection() {
    this.agentEnEspera = null;
    this.conexionEnEspera = null;
    this.selectedAgentID = null;
  }

  randomizeAllThetas() {
    myXSystem.randomThetas();
  }

  toggleCreatingConnection() {
    this.estaCreandoConexion = !this.estaCreandoConexion;
    this.canCreateAgents = false;
    this.isRemovingAgents = false;
    this.isDeletingConnections = false;
    this.stopSelection();
    this.updateButtonStyles();
  }
  
  togglePiConnectionType() {
    this.piConnectionType = !this.piConnectionType;
    this.updateButtonStyles();
  }

  toggleDeletingConnection() {
    this.isDeletingConnections = !this.isDeletingConnections;
    this.canCreateAgents = false;
    this.estaCreandoConexion = false;
    this.isRemovingAgents = false;
    this.stopSelection();
    this.updateButtonStyles();
  }

  createHeadTailButtons() {
    const types = ["hh", "ht", "th", "tt"];
    types.forEach((type) => {
      let button = createButton(type);
      button.id(`${type}-button`);
      button.mousePressed(() => this.setHeadTailType(type));
    });
  }

  setHeadTailType(type) {
    this.headTailType = type;
    this.updateHeadTailButtonsStyle();
  }

  updateHeadTailButtonsStyle() {
    const types = ["hh", "ht", "th", "tt"];
    types.forEach((type) => {
      const button = select(`#${type}-button`);
      if (this.headTailType === type) {
        button.addClass("button-active");
      } else {
        button.removeClass("button-active");
      }
    });
  }

  toggleAgentRemoval() {
    this.isRemovingAgents = !this.isRemovingAgents;
    this.canCreateAgents = false; // Asegurar que no se puedan crear agentes mientras se eliminan
    this.estaCreandoConexion = false;
    this.isDeletingConnections = false;
    this.updateButtonStyles();
  }

  drawGrid(refPosition) {
    stroke(250, 90);
    strokeWeight(0.25);
    let gridSpacing = 50;

    for (let i = refPosition.x % gridSpacing; i < width; i += gridSpacing) {
      line(i, 0, i, height, 2, 2);
    }
    for (let j = refPosition.y % gridSpacing; j < height; j += gridSpacing) {
      line(0, j, width, j, 2, 2);
    }
  }

  toggleGridMovement() {
    this.moveGridMode = !this.moveGridMode;
    this.updateGridButtonStyle();
  }

  updateGridButtonStyle() {
    if (this.moveGridMode) {
      this.moveGridButton.addClass("button-active");
    } else {
      this.moveGridButton.removeClass("button-active");
    }
  }

  updateButtonStyles() {
    this.updateButtonStyle(this.createAgentButton, this.canCreateAgents);
    this.updateButtonStyle(this.removeAgentButton, this.isRemovingAgents);
    this.updateButtonStyle(
      this.createConnectionButton,
      this.estaCreandoConexion
    );
    this.updateButtonStyle(
      this.deleteConnectionButton,
      this.isDeletingConnections
    );
    this.updateHeadTailButtonsStyle();
  }

  updateButtonStyle(button, isActive) {
    if (isActive) {
      button.addClass("button-active");
    } else {
      button.removeClass("button-active");
    }
  }

  handleKeyPressed() {
    switch (key) {
      case "a":
        this.toggleAgentCreation();
        break;
      case "r":
        this.toggleAgentRemoval();
        break;
      case "c":
        this.toggleCreatingConnection();
        break;
      case "d":
        this.toggleDeletingConnection();
        break;
      case " ":
        myXSystem.centerSystem();
        break;
      case "m":
        this.toggleGridMovement();
        break;
      case "h":
        importExport.recreateSystem();
        break;
    }
  }

  handleMousePressed(system) {
    if (this.isDeletingConnections) {
      let clickedAgentID = system.getAgentIDAt(mouseX, mouseY);
      if (clickedAgentID == null && this.selectedAgentID != null)
        this.toggleDeletingConnection();
      this.selectedAgentID = clickedAgentID;
      if (clickedAgentID) {
        if (!this.agentEnEspera) {
          this.agentEnEspera = clickedAgentID;
        } else if (this.agentEnEspera !== clickedAgentID) {
          system.removeConnectionIfExists(this.agentEnEspera, clickedAgentID);
          this.stopSelection();
        }
      }
    } else if (this.estaCreandoConexion) {
      let clickedAgentID = system.getAgentIDAt(mouseX, mouseY);

      if (clickedAgentID == null && this.selectedAgentID != null)
        this.toggleCreatingConnection();
      this.selectedAgentID = clickedAgentID;
      if (clickedAgentID) {
        if (!this.agentEnEspera) {
          this.agentEnEspera = clickedAgentID;
          this.conexionEnEspera = { agentID1: this.agentEnEspera };
        } else {
          if (this.agentEnEspera !== clickedAgentID) {
            this.conexionEnEspera.agentID2 = clickedAgentID;

            let vecDif = p5.Vector.sub(
              system.agents[this.conexionEnEspera.agentID1].aposition,
              system.agents[this.conexionEnEspera.agentID2].aposition
            );

            let newConnection = new Connection(
              this.conexionEnEspera.agentID1,
              this.conexionEnEspera.agentID2,
              vecDif.mag(),
              _k.value(),
              this.headTailType
            );

            system.connections.push(newConnection);
            this.stopSelection();
          } else this.toggleCreatingConnection();
        }
      }
    } else {
      if (this.canCreateAgents) {
        system.addAgent(mouseX, mouseY);
      } else if (this.isRemovingAgents) {
        system.removeAgentAt(mouseX, mouseY);
      }
    }
    system.clicked(mouseX, mouseY);
  }

  UpdateParameters(system) {
    for (let agentID in system.agents) {
      let a = system.agents[agentID];
      a.r = _r.value();
      a.v0 = _v0.value();
      a.alpha = _alpha.value();
      a.beta = _beta.value();
      a.dTheta = _dTheta.value();
      a.delta_t = d_t.value();
      a.radius = controlPanel.radio.value();
    }

    for (let i = 0; i < system.connections.length; i++) {
      let connection = system.connections[i];
      connection.k = _k.value();
    }
  }
}


class Connection {
  constructor(agentID1, agentID2, _l0, k, headTailType) {
    this.l0 = _l0;
    this.k = k;
    this.agentID1 = agentID1;
    this.agentID2 = agentID2;
    this.headTailType = headTailType; // "hh", "ht", "th", "tt"
  }

  Update(agents) {
    let agent_i = agents[this.agentID1];
    let agent_j = agents[this.agentID2];

    if (agent_i && agent_j) {
      let position_i, position_j;
      switch (this.headTailType) {
        case "hh":
          position_i = agent_i.Position_R_head();
          position_j = agent_j.Position_R_head();
          break;
        case "ht":
          position_i = agent_i.Position_R_head();
          position_j = agent_j.Position_R_tail();
          break;
        case "th":
          position_i = agent_i.Position_R_tail();
          position_j = agent_j.Position_R_head();
          break;
        case "tt":
          position_i = agent_i.Position_R_tail();
          position_j = agent_j.Position_R_tail();
          break;
      }

      let rij = p5.Vector.sub(position_j, position_i);
      let dir_rij = rij.copy().normalize();
      let force = dir_rij.mult((this.k * (rij.mag() - this.l0)) / 1000);

      switch (this.headTailType) {
        case "hh":
        case "ht":
          agent_i.ApplyForce_head(force);
          break;
        case "th":
        case "tt":
          agent_i.ApplyForce_tail(force);
          break;
      }

      force.mult(-1);
      switch (this.headTailType) {
        case "hh":
        case "th":
          agent_j.ApplyForce_head(force);
          break;
        case "ht":
        case "tt":
          agent_j.ApplyForce_tail(force);
          break;
      }
    }
  }

  dashedLine(x1, y1, x2, y2, dashLength, spaceLength) {
    let distance = dist(x1, y1, x2, y2);
    let dashNumber = distance / (dashLength + spaceLength);
    let xStep = (x2 - x1) / dashNumber;
    let yStep = (y2 - y1) / dashNumber;

    for (let i = 0; i < dashNumber; i++) {
      let x = x1 + i * xStep;
      let y = y1 + i * yStep;
      if (i % 2 === 0) {
        line(x, y, x + xStep, y + yStep);
      }
    }
  }

  Display(agents) {
    let agent_i = agents[this.agentID1];
    let agent_j = agents[this.agentID2];

    if (
      agent_i &&
      agent_j &&
      (agent_i.IsInsideCanvas() || agent_j.IsInsideCanvas())
    ) {
      strokeWeight(controlPanel.grosor.value());
      let rij = p5.Vector.sub(agent_j.aposition, agent_i.aposition);
      stroke(0, 0, 255, 200);
      line(
        agent_i.aposition.x,
        agent_i.aposition.y,
        agent_j.aposition.x,
        agent_j.aposition.y
      );

      let pos_i, pos_j;
      switch (this.headTailType) {
        case "hh":
          pos_i = agent_i.Position_R_head();
          pos_j = agent_j.Position_R_head();
          break;
        case "ht":
          pos_i = agent_i.Position_R_head();
          pos_j = agent_j.Position_R_tail();
          break;
        case "th":
          pos_i = agent_i.Position_R_tail();
          pos_j = agent_j.Position_R_head();
          break;
        case "tt":
          pos_i = agent_i.Position_R_tail();
          pos_j = agent_j.Position_R_tail();
          break;
        default:
          pos_i = agent_i.Position_R_head();
          pos_j = agent_j.Position_R_head();
      }

      strokeWeight(0.85 * controlPanel.grosor.value());
      stroke(0, 255, 0, 140); // Color para indicar el tipo de conexión
      this.dashedLine(pos_i.x, pos_i.y, pos_j.x, pos_j.y, 2, 2);
    }
  }
}


class ControlPanel {
  constructor() {
    this.posSlidersY0 = 30;
    
    this.sx1 = 250;
    this.sy1 = 25;
    this.sx2 = width - 25;
    this.sy2 = height - 25;

    this.sx3 = 20;
    this.sy3 = 25;
    this.sx4 = 225;
    this.sy4 = this.sy2;

    this.sx5 = 50;
    this.sy5 = 320;
    this.sx6 = 200;
    this.sy6 = 470;

    this.xx00 = 30;
    this.yy00 = 100;
    this.CreateSliders();
    // this.LoadPNGs();
  }

  drawCanvas1() {
    noStroke();
    rectMode(CORNERS);
    fill(15, 180);
    rect(this.sx1,this.sy1,this.sx2,this.sy2);
  }
  
  drawCanvas2() {
    fill(10, 80, 85);
    
    noStroke();
    rect(this.sx3, this.sy3, this.sx4, this.sy4);
    // this.DrawPNGs();
    this.WriteValueParameters();
  }

  CreateSliders() {
    let ys = this.yy00 + 34 + this.posSlidersY0;
    let xs = this.xx00 + 10;
    let dy = 23;

    d_t = createSlider(0.0, 0.1, 0.0, 0.0001);
    _r = createSlider(0, 50, 10, 0.1);
    _v0 = createSlider(0, 100, 10, 0.005);
    _alpha = createSlider(0, 0.5, 0.3, 0.001);
    _beta = createSlider(0, 0.2, 0.05, 0.0001);
    _dTheta = createSlider(0, 0.5, 0.25, 0.01);
    _k = createSlider(0, 3000, 1500, 1);

    d_t.position(xs, ys);
    _r.position(xs, (ys += 1.5*dy));
    _v0.position(xs, (ys += 1.5*dy));
    _alpha.position(xs, (ys += 1.5*dy));
    _beta.position(xs, (ys += 1.5*dy));
    _dTheta.position(xs, (ys += 1.5*dy));
    
    ys += 3*dy;
    _k.position(xs, (ys += dy));

    d_t.style("width", "60px");
    _r.style("width", "60px");
    _v0.style("width", "60px");
    _alpha.style("width", "60px");
    _beta.style("width", "60px");
    _dTheta.style("width", "60px");
    _k.style("width", "60px");

    this.radio = createSlider(3, 40, 20, 0.5);
    this.radio.position(xs, 550);
    this.radio.style("width", "60px");

    this.grosor = createSlider(0.5, 3, 1.0, 0.1);
    this.grosor.position(xs, 580);
    this.grosor.style("width", "60px");
  }

  WriteValueParameters() {
    fill(255);
    textSize(20);

    let ys = this.yy00 + 50 + this.posSlidersY0;
    let dy = 23;
    let xtxt = this.xx00 + 100;
    
    textSize(12)
    text("Time Interval", 25, 160);
    text("=  " + str(d_t.value()), xtxt, ys);
    text("=  " + nfc(_r.value() / 1000, 3), xtxt, (ys += 1.5*dy));
    text("=  " + nfc(_v0.value() / 1000, 2), xtxt, (ys += 1.5*dy));
    text("=  " + str(_alpha.value()), xtxt, (ys += 1.5*dy));
    text("=  " + str(_beta.value()), xtxt, (ys += 1.5*dy));
    text("=  " + nfc(_dTheta.value(), 3), xtxt, (ys += 1.5*dy));
    
    textSize(15)
    
    text("Spring constant", 40, 415);
    ys += 3*dy;
    text("=  " + str(_k.value()), xtxt, (ys += dy));
    
    textSize(15)
    
    text("Display options", 40, 530);
    text("Agent size", 110, 565);
    text("Link thickness", 110, 595);
    
  }
}


class ImportExport {
  exportarCsv() {
    let centerX = (controlPanel.sx2 + controlPanel.sx1) / 2;
    let centerY = (controlPanel.sy2 + controlPanel.sy1) / 2;
    let unit = 1000.0;

    let dosPi = 2 * Math.PI;

    let agentesData = [
      [
        "id",
        "x",
        "y",
        "theta",
        "r",
        "v0",
        "alpha",
        "beta",
        "dTheta",
        "cred",
        "cgreen",
        "cblue",
      ],
    ]; 
    for (let agentID in myXSystem.agents) {
      let ag = myXSystem.agents[agentID];
      let thetaMod = (ag.theta % dosPi).toFixed(3);
      thetaMod =
        thetaMod < 0 ? parseFloat(thetaMod) + dosPi : parseFloat(thetaMod);
      agentesData.push([
        agentID,
        ((ag.aposition.x - centerX) / unit).toFixed(3),
        ((ag.aposition.y - centerY) / unit).toFixed(3),
        thetaMod.toFixed(3),
        parseFloat((ag.r / unit).toFixed(3)),
        parseFloat((ag.v0 / unit).toFixed(3)),
        parseFloat(ag.alpha.toFixed(3)),
        parseFloat(ag.beta.toFixed(3)),
        parseFloat(ag.dTheta.toFixed(3)),
        ag.cred,
        ag.cgreen,
        ag.cblue,
      ]);
    }
    saveStrings(
      agentesData.map((e) => e.join(",")),
      "agents"
    );

    let conexionesData = [
      ["id", "agentID1", "agentID2", "l0", "k", "headTailType"],
    ]; 
    myXSystem.connections.forEach((con, index) => {
      conexionesData.push([
        index,
        con.agentID1,
        con.agentID2,
        parseFloat((con.l0 / unit).toFixed(3)),
        parseFloat(con.k.toFixed(3)),
        con.headTailType,
      ]);
    });
    saveStrings(
      conexionesData.map((e) => e.join(",")),
      "connections"
    );
  }

  // = = = = = = = = = =
  //       Import
  // = = = = = = = = = =

  handleAgentFile(file) {
    if (file.type === "text") {
      this.importedAgentData = file.data.split("\n");
      if (this.importedConnectionData) {
        this.recreateSystem();
      }
    } else {
      console.log("Not a valid file type");
    }
  }

  handleConnectionFile(file) {
    if (file.type === "text") {
      this.importedConnectionData = file.data.split("\n");
      if (this.importedAgentData) {
        this.recreateSystem();
      }
    } else {
      console.log("Not a valid file type");
    }
  }

  recreateSystem() {
    updateParameters = false;
    myXSystem = new AgentSystem();

    let isFirstLine = true;
   
    for (let line of this.importedAgentData) {
      if (isFirstLine) {
        isFirstLine = false;
        continue;
      }

      if (line.trim() === "") continue; 

      let data = line.split(",");
      let newAgent = new Agent();
      
      newAgent.aposition = createVector(
        parseFloat(data[1]) * 1000,
        parseFloat(data[2]) * 1000
      );
      newAgent.theta = parseFloat(data[3]);
      newAgent.r = parseFloat(data[4]) * 1000;
      newAgent.v0 = parseFloat(data[5]) * 1000;
      newAgent.alpha = parseFloat(data[6]);
      newAgent.beta = parseFloat(data[7]);
      newAgent.dTheta = parseFloat(data[8]);
      newAgent.cred = parseInt(data[9]);
      newAgent.cgreen = parseInt(data[10]);
      newAgent.cblue = parseInt(data[11]);

      let agentID = "agent" + myXSystem.nextAgentID++;
      myXSystem.agents[agentID] = newAgent;
    }
    
    for (let line of this.importedConnectionData) {
      if (!isFirstLine) {
        isFirstLine = true;
        continue;
      }

      if (line.trim() === "") continue;

      let data = line.split(",");
      let agent1 = data[1];
      let agent2 = data[2];
      let l0 = parseFloat(data[3]) * 1000;
      print("l0 =", l0);
      
      let k = parseFloat(data[4]);
      print("k =", k);
      
      let headTailType = data[5];

      if (myXSystem.agents[agent1] && myXSystem.agents[agent2]) {
        let newConnection = new Connection(agent1, agent2, l0, k);
        newConnection.headTailType = headTailType;
        myXSystem.connections.push(newConnection);
      }
    }

    myXSystem.centerSystem();
    print(myXSystem);
    this.importedAgentData = null;
    this.importedConnectionData = null;
  }
}


class Agent {
  constructor(img) {
    this.alpha = 0.0;
    this.beta = 0.00;
    this.dTheta = 0.00;

    this.aposition = createVector();
    
    this.theta = random(0, TWO_PI);
    // this.theta2 = this.theta;

    this.v0 = 0.0;
    this.r = 0.00;
    this.radius = controlPanel.radio.value();

    this.cred = int(random(100, 255));
    this.cgreen = int(random(100, 255));
    this.cblue = int(random(100, 255));

    this.delta_t = 0.01;

    this.f = createVector();

    this.f1 = createVector();
    this.f2 = createVector();

    this.f_head = createVector();
    this.f_tail = createVector();

    this.dragOffset = createVector();
    this.dragging = false;
  }

  // Unit vector in theta direction.
  N() {
    return createVector(cos(this.theta), sin(this.theta));
  }

  // Unit vector orthogonal to theta direction.
  N_ort() {
    return createVector(-sin(this.theta), cos(this.theta));
  }

  /*///////////////////////////
  ----------
  Update - Updating the position of the Agent over time.
  ----------
  ///////////////////////////*/
  Update(dt) {
    if (dt > 0) {
      this.theta += (this.beta * this.f_head.dot(this.N_ort())) * dt;
      this.theta -= (this.beta * this.f_tail.dot(this.N_ort())) * dt;
      this.theta += (this.dTheta / sqrt(dt)) * randomGaussian() * dt;
      
      let vd = this.N().mult(this.v0 * dt);

      let f_completo = p5.Vector.add(this.f_head, this.f_tail);

      vd.add(
        this.N().mult(this.alpha * 1 * f_completo.dot(this.N()) * dt)
      );
      vd.add(
        this.N_ort().mult(
          this.alpha * 1 * f_completo.dot(this.N_ort()) * dt
        )
      );

      this.aposition.add(vd);
    }
    this.f = createVector();
    this.f1 = createVector();
    this.f2 = createVector();
    this.f_head = createVector();
    this.f_tail = createVector();
  }

  ApplyForce(force) {
    this.f.add(force.copy());
  }

  ApplyForce1(force) {
    this.f1.add(force.copy());
  }

  ApplyForce2(force) {
    this.f2.add(force.copy());
  }

  ApplyForce_head(force) {
    this.f_head.add(force.copy());
  }

  ApplyForce_tail(force) {
    this.f_tail.add(force.copy());
  }

  Position_R() {
    return createVector(
      this.aposition.x + this.r * cos(this.theta),
      this.aposition.y + this.r * sin(this.theta)
    );
  }

  Position_R_head() {
    return createVector(
      this.aposition.x + this.r * cos(this.theta),
      this.aposition.y + this.r * sin(this.theta)
    );
  }

  Position_R_tail() {
    return createVector(
      this.aposition.x - this.r * cos(this.theta),
      this.aposition.y - this.r * sin(this.theta)
    );
  }

  IsInsideCanvas() {
    return (
      this.aposition.x > controlPanel.sx1 &&
      this.aposition.y > controlPanel.sy1 &&
      this.aposition.x < controlPanel.sx2 &&
      this.aposition.y < controlPanel.sy2
    );
  }

  Display(isSelected) {
    
    if (this.IsInsideCanvas()) {
      noStroke();

      if (isSelected) {
        let blinkInterval = frameCount % 30; // Ajusta la duración del parpadeo
        if (blinkInterval < 10) {fill(255, 0, 0);
        } else if (blinkInterval < 20) {fill(0, 255, 0);
        } else {fill(0, 0, 255);
        }
      } else {
        let angle2 = this.theta % (2 * Math.PI);
        if (angle2 < 0) angle2 += 2 * Math.PI;
        colorMode(HSB, 360, 100, 100, 100);
        let hueValue = map(angle2, 0, TWO_PI, 0, 360);
        fill(hueValue, 100, 100, 50);
        colorMode(RGB, 255, 255, 255, 255);
      }
      
      push(); 
      translate(this.aposition.x, this.aposition.y);

      let angle = atan2(this.N().y, this.N().x);
      rotate(angle);
      let ellipseLongAxis = map(this.r, 0, 40, controlPanel.radio.value(), controlPanel.radio.value() * 4);
      ellipse(0, 0, ellipseLongAxis, controlPanel.radio.value());

      pop();
      
      strokeWeight(2 * controlPanel.grosor.value());
      stroke(255, 0, 0, 250);

      let nose = this.Position_R();

      let nose2 = createVector(
        this.aposition.x + (this.r + 10) * cos(this.theta),
        this.aposition.y + (this.r + 10) * sin(this.theta)
      );

      line(this.aposition.x, this.aposition.y, nose2.x, nose2.y);
    }
  }

  DrawX(x, x1, x2) {
    return map(x, 0, 1000, x1, x2);
  }

  DrawY(y, y1, y2) {
    return map(y, 0, 1000, y1, y2);
  }

  Display2(x1, y1, x2, y2) {
    noStroke();
    fill(this.cred, this.cgreen, this.cblue);
    let x_ = this.DrawX(this.aposition.x, x1, x2);
    let y_ = this.DrawY(this.aposition.y, y1, y2);
    this.radius = 0.01 * min([x2 - x1, y2 - y1]);
    ellipse(x_, y_, controlPanel.radio.value() * 2, controlPanel.radio.value() * 2);
    strokeWeight(0.5);
    stroke(255, 0, 0, 250);
    let nose = this.Position_R();
  }

  Clicked(mx, my) {
    let d = dist(mx, my, this.aposition.x, this.aposition.y);
    if (d < this.radius) {
      this.dragging = true;
      this.dragOffset.x = this.aposition.x - mx;
      this.dragOffset.y = this.aposition.y - my;
    }
  }

  StopDragging() {
    this.dragging = false;
  }

  Drag(mx, my) {
    if (this.dragging) {
      this.aposition.x = mx + this.dragOffset.x;
      this.aposition.y = my + this.dragOffset.y;
    }
  }
}


