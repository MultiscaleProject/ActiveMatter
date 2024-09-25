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
