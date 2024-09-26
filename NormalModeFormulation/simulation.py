# simulation.py
# Written by Amir Shee
# Last modified on July 19, 2023

import numpy as np
import matplotlib.pyplot as plt
from matplotlib.patches import Circle
import os
import argparse

class Configuration:
    """
    This class represents a configuration for a simulation.
    It reads particle position, orientation, and velocity data, and allows calculating equilibrium positions.
    """
    def __init__(self, foldername, ks=1.0, N=3183, Lx=50.0, Ly=50.0, nqout=100):
        """
        Initialize the Configuration object with the specified foldername.
        
        Args:
            foldername (str): The folder containing the simulation data.
            ks (float): Spring constant.
            N (int): Number of particles.
            Lx (float): System size in the x-direction.
            Ly (float): System size in the y-direction.
            nqout (int): Number of q points for output.
        """
        self.foldername = foldername
        self.ks = ks
        self.N = N
        self.Lx = Lx
        self.Ly = Ly
        self.nqout = nqout
        self.rval = None
        self.nval = None
        self.vval = None
        self.r0val = None
        self.n0val = None
    
    def read_data(self, howmany, name='positions', step=1, skip=0):
        """
        Reads data from CSV files containing particle positions, orientations, and velocities.
        
        Args:
            howmany (int): Number of files to read.
            name (str): Base name of the data files (default is 'positions').
            step (int): Step interval between files (default is 1).
            skip (int): Initial skip index (default is 0).
        
        Raises:
            FileNotFoundError: If the specified file does not exist.
        """
        self.rval = np.zeros((howmany, self.N, 2))
        self.nval = np.zeros((howmany, self.N, 2))
        self.vval = np.zeros((howmany, self.N, 2))
        
        for k in range(howmany):
            datafile = os.path.join(self.foldername, f"{name}_{k*step+skip}.csv")
            try:
                data = np.loadtxt(datafile, delimiter=',', skiprows=1)
                self.rval[k, :, 0] = data[:, 0]
                self.rval[k, :, 1] = data[:, 1]
                self.nval[k, :, 0] = data[:, 2]
                self.nval[k, :, 1] = data[:, 3]
                self.vval[k, :, 0] = data[:, 4]
                self.vval[k, :, 1] = data[:, 5]
            except FileNotFoundError:
                print(f"File not found: {datafile}. Skipping this file.")
            except ValueError as e:
                print(f"Error reading file {datafile}: {e}. Skipping this file.")
    
    def calcR0(self, plot=True):
        """
        Calculates the equilibrium positions of the particles and optionally generates a plot.
        
        Args:
            plot (bool): If True, generate a plot of the equilibrium positions (default is True).
        """
        self.r0val = np.mean(self.rval, axis=0)
        self.n0val = np.mean(self.nval, axis=0)
        
        if plot:
            fig = plt.figure(figsize=(10, 10), dpi=200)
            ax = fig.add_subplot(111)
            for (x, y) in zip(self.r0val[:, 0], self.r0val[:, 1]):
                ax.add_artist(Circle((x, y), 1.0, fill=False, edgecolor='b'))
            plt.quiver(self.r0val[:, 0], self.r0val[:, 1], self.n0val[:, 0], self.n0val[:, 1], color='r', angles='xy', scale_units='xy', scale=1)
            plt.xlabel('X')
            plt.ylabel('Y')
            plt.title('Equilibrium Positions and Orientations')
            plt.axis('equal')
            plt.savefig('eqm_positions_orientations.png')
            plt.show()

def main():
    """
    Main function for initializing a configuration and reading data.
    """
    parser = argparse.ArgumentParser(description="Simulation Configuration for Particle Systems")
    parser.add_argument("-f", "--foldername", type=str, required=True, help="Path to the folder containing simulation data")
    parser.add_argument("-n", "--num_files", type=int, default=10, help="Number of files to read (default is 10)")
    parser.add_argument("-p", "--plot", action="store_true", help="Plot equilibrium positions")
    args = parser.parse_args()

    foldername = args.foldername
    num_files = args.num_files
    plot = args.plot

    if not os.path.exists(foldername):
        raise FileNotFoundError(f"The folder {foldername} does not exist.")

    # Initialize the configuration
    conf = Configuration(foldername)
    conf.read_data(num_files, 'positions', step=1, skip=0)
    
    # Calculate equilibrium positions and plot if requested
    conf.calcR0(plot=plot)

if __name__ == "__main__":
    main()
