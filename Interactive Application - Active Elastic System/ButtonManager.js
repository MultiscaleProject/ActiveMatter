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
