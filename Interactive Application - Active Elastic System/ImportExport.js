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
