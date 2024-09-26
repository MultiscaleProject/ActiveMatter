# `main.py`

## Overview
`main.py` is a script designed to run a batch of simulations for chiral active Brownian particles (CABP) at different chirality values (`chi`). The script loops over a predefined list of chirality values, creates a directory for each, and runs a Python analysis script (`full_analysis.py`) with the corresponding `chi` value as input.

## Prerequisites
- Python 3.x
- Ensure you have the necessary dependencies installed, including:
  - `numpy`
  - `matplotlib`
  - `dask` (if needed)

You can install these dependencies using:
```bash
pip install numpy matplotlib dask


# `hessian.py`

## Overview
`hessian.py` is responsible for constructing and diagonalizing the Hessian matrix for chiral active Brownian particles. It also calculates the normal modes (eigenvalues and eigenvectors) and provides functionality to compute Fourier-transformed moduli and plot various quantities like force vectors and eigenvalues.

## Prerequisites
- Python 3.x
- Required libraries:
  - `numpy`
  - `matplotlib`
  - `pickle`
  
Install them via:
```bash
pip install numpy matplotlib


# `simulation.py`

## Overview
`simulation.py` handles reading particle position and velocity data from CSV files and calculating equilibrium positions for a chiral active Brownian particle system. It can also generate a plot of equilibrium positions and orientations.

## Prerequisites
- Python 3.x
- Required libraries:
  - `numpy`
  - `matplotlib`

Install dependencies via:
```bash
pip install numpy matplotlib


# `analysis.py`

## Overview
`analysis.py` reads data from output files generated in the simulation and fits models to extract the parameters `B` and `G`. It also generates plots for each `chi` value and saves the fitted values to a text file.

## Prerequisites
- Python 3.x
- Required libraries:
  - `numpy`
  - `matplotlib`
  - `scipy`

Install dependencies via:
```bash
pip install numpy matplotlib scipy
