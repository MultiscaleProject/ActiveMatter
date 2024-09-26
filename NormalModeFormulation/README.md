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

