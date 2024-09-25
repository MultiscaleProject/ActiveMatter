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
