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
