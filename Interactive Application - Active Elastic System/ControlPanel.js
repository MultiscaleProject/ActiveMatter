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
    this.LoadPNGs();
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
    this.DrawPNGs();
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
    _r.position(xs, (ys += dy));
    _v0.position(xs, (ys += dy));
    _alpha.position(xs, (ys += dy));
    _beta.position(xs, (ys += dy));
    _dTheta.position(xs, (ys += dy));
    
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
    this.radio.position(xs, 500);
    this.radio.style("width", "60px");

    this.grosor = createSlider(0.5, 3, 1.0, 0.1);
    this.grosor.position(xs, 520);
    this.grosor.style("width", "60px");
  }

  LoadPNGs() {
    this.delta_t_png = loadImage("zequations/Delta_t.png");
    this._r_png = loadImage("zequations/R.png");
    this._v0_png = loadImage("zequations/v_0.png");
    this._alpha_png = loadImage("zequations/alpha.png");
    this._beta_png = loadImage("zequations/beta.png");
    this._dTheta_png = loadImage("zequations/D_theta.png");
    this._k_png = loadImage("zequations/k.png");
  }

  DrawPNGs() {
    let ys = this.yy00 + 35 + this.posSlidersY0;
    let dy = 23;

    let tmhy = 17;
    let tmhx = 17;

    let ximg = this.xx00 + 75;

    image(this.delta_t_png, ximg, ys, 1.2 * tmhx, tmhy);
    image(this._r_png, ximg, (ys += dy) * 1.00, tmhx, tmhy);
    image(this._v0_png, ximg, (ys += dy) * 1.02, tmhx * 1.2, tmhy * 0.9);
    image(this._alpha_png, ximg, (ys += dy) * 1.02, tmhx, 0.57 * tmhy);
    image(this._beta_png, ximg, (ys += dy), tmhx, tmhy);
    image(this._dTheta_png, ximg, (ys += dy), 1.3 * tmhx, tmhy);
    
    ys += 3*dy;
    image(this._k_png, ximg, (ys += dy) * 0.99, 1.1 * tmhx, 1.1 * tmhy);
  }

  WriteValueParameters() {
    fill(255);
    textSize(20);

    let ys = this.yy00 + 50 + this.posSlidersY0;
    let dy = 23;
    let xtxt = this.xx00 + 100;

    text("=  " + str(d_t.value()), xtxt, ys);
    text("=  " + nfc(_r.value() / 1000, 3), xtxt, (ys += dy));
    text("=  " + nfc(_v0.value() / 1000, 2), xtxt, (ys += dy));
    text("=  " + str(_alpha.value()), xtxt, (ys += dy));
    text("=  " + str(_beta.value()), xtxt, (ys += dy));
    text("=  " + nfc(_dTheta.value(), 3), xtxt, (ys += dy));
    
    textSize(15)
    
    text("Spring constant", 40, 355);
    ys += 3*dy;
    text("=  " + str(_k.value()), xtxt, (ys += dy));
    
    textSize(15)
    
    text("Display options", 40, 490);
    text("Agent size", 110, 515);
    text("Link thickness", 110, 535);
    
  }
}
