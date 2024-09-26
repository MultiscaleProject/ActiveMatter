# hessian.py
# Written by Amir Shee
# Last modified on July 19, 2023

import numpy as np
from numpy import linalg as LA
import matplotlib.pyplot as plt
import matplotlib.patches as ptch
import pickle
from simulation import Configuration
import argparse
import os

class Hessian:
    def __init__(self, conf, debug=True):
        """
        Initializes the Hessian class with a Configuration object.

        Args:
            conf (Configuration): Configuration object containing particle data.
            debug (bool): Whether to display debugging information and plots.
        """
        self.conf = conf
        self.r0val = self.conf.r0val
        self.n0val = self.conf.n0val
        self.Lx = self.conf.Lx
        self.Ly = self.conf.Ly
        self.N = self.conf.N
        self.ks = self.conf.ks
        self.debug = debug
        self.Hessian = np.zeros((2 * self.N, 2 * self.N))

    def periodic(self, dl, Li):
        """
        Applies periodic boundary conditions.

        Args:
            dl (float): Displacement value.
            Li (float): Length in the i-th dimension.
        
        Returns:
            float: Corrected displacement.
        """
        return dl - 2. * Li * np.round(dl / (2. * Li))

    def getNeighbours(self, i):
        """
        Finds the neighbors of a particle in periodic boundary conditions.

        Args:
            i (int): Particle index.
        
        Returns:
            tuple: Neighbor indices, displacement vectors, equilibrium distance.
        """
        dx = self.periodic(self.r0val[:, 0] - self.r0val[i, 0], self.Lx)
        dy = self.periodic(self.r0val[:, 1] - self.r0val[i, 1], self.Ly)
        r2 = dx ** 2 + dy ** 2
        req = 2.0
        mask = np.sqrt(r2) <= req
        mask[i] = False  # Exclude self
        neighbours = np.nonzero(mask)[0]
        drvec = np.zeros((len(neighbours), 2))
        drvec[:, 0] = dx[neighbours]
        drvec[:, 1] = dy[neighbours]
        dl0 = 2.0
        return neighbours, drvec, dl0

    def makeMatrix(self):
        """
        Constructs the Hessian matrix based on particle interactions.
        """
        total_force = np.zeros((self.N, 2))
        fsum = 0.0
        fav = 0.0

        if self.debug:
            fig = plt.figure(figsize=(10, 10), dpi=200)
            ax = fig.add_subplot(111)
            ax.set_xlabel('X')
            ax.set_ylabel('Y')
            ax.set_title('Force Vectors')

        for i in range(self.N):
            neighbours, drvec, dl0 = self.getNeighbours(i)
            if len(neighbours) > 0:
                dr = np.linalg.norm(drvec, axis=1)
                nij = drvec / dr[:, None]
                fvec = -self.ks * (dr - dl0)[:, None] * nij

                total_force[i] = np.sum(fvec, axis=0)

                if self.debug:
                    ax.quiver(self.r0val[i, 0] + 0.01 * nij[:, 0], self.r0val[i, 1] + 0.01 * nij[:, 1], fvec[:, 0],
                              fvec[:, 1], color=(np.random.rand(), np.random.rand(), np.random.rand()), scale=20.0)

                fsum += np.sum(fvec)
                fval = np.sum(fvec * nij, axis=1)
                fav += np.sum(fval)

                diagsquare = np.zeros((2, 2))
                for j in range(len(neighbours)):
                    n = nij[j]
                    subsquare = np.zeros((2, 2))
                    subsquare[0, 0] = -fval[j] / dr[j] * (1 - n[0] ** 2) + self.ks * n[0] ** 2
                    subsquare[0, 1] = -fval[j] / dr[j] * (0 - n[0] * n[1]) + self.ks * n[0] * n[1]
                    subsquare[1, 0] = -fval[j] / dr[j] * (0 - n[1] * n[0]) + self.ks * n[1] * n[0]
                    subsquare[1, 1] = -fval[j] / dr[j] * (1 - n[1] ** 2) + self.ks * n[1] ** 2

                    label = neighbours[j]
                    self.Hessian[2 * i:(2 * i + 2), 2 * label:(2 * label + 2)] = -subsquare

                    diagsquare[0, 0] += fval[j] / dr[j] * (1 - n[0] ** 2) - self.ks * n[0] ** 2
                    diagsquare[0, 1] += fval[j] / dr[j] * (0 - n[0] * n[1]) - self.ks * n[0] * n[1]
                    diagsquare[1, 0] += fval[j] / dr[j] * (0 - n[1] * n[0]) - self.ks * n[1] * n[0]
                    diagsquare[1, 1] += fval[j] / dr[j] * (1 - n[1] ** 2) - self.ks * n[1] ** 2

                self.Hessian[2 * i:(2 * i + 2), 2 * i:(2 * i + 2)] = -diagsquare

            if self.debug:
                cir = ptch.Circle((self.r0val[i, 0], self.r0val[i, 1]), radius=1.0, ec=(1, 0, 0), fc='none')
                ax.add_patch(cir)

        print('Complete Hessian matrix calculation.')
        fav /= self.N
        print("Hessian: Estimating distance from mechanical equilibrium of initial configuration ")
        print("Scaled force sum is " + str(fsum / fav))

        if self.debug:
            plt.axis('equal')
            plt.savefig('force_vectors.png')

    def getModes(self):
        """
        Diagonalizes the Hessian matrix to obtain normal modes (eigenvalues and eigenvectors).
        """
        HessianSym = 0.5 * (self.Hessian + np.transpose(self.Hessian))
        print("Starting Diagonalisation!")
        self.eigval, self.eigvec = LA.eigh(HessianSym)
        if self.debug:
            plt.figure()
            eigrank = np.linspace(0, 2 * self.N, 2 * self.N)
            np.savetxt('eigen_value_data.txt', np.column_stack((eigrank, self.eigval)), header='Rank Eigenvalue')
            np.savetxt('eigen_value_data.csv', np.column_stack((eigrank, self.eigval)), delimiter=',', header='Rank,Eigenvalue')
            plt.plot(eigrank, self.eigval, '.-')
            plt.savefig('eigen_value.png')

        print("The smallest eigenvalue is: " + str(np.amin(self.eigval)))
        print(self.eigval)

def main():
    """
    Main function to initialize configuration, compute Hessian, and obtain modes.
    """
    parser = argparse.ArgumentParser(description="Chiral Active Brownian Particle Simulation")
    parser.add_argument("-chi", "--chi", type=float, default=0.10, help="Chirality parameter")
    args = parser.parse_args()

    chi = args.chi

    # Folder path to be modified
    foldername = f"/path/to/dynamics_data/chi_{chi}/"

    if not os.path.exists(foldername):
        raise FileNotFoundError(f"Folder {foldername} does not exist. Please provide a valid path.")

    # Initialize configuration and Hessian
    conf = Configuration(foldername)
    conf.read_data(100, 'positions', 1, 0)
    conf.calcR0()
    hess = Hessian(conf, debug=True)

    # Compute Hessian matrix and normal modes
    hess.makeMatrix()
    hess.getModes()

    # Optionally, save results to a pickle file
    data = {'foldername': foldername, 'hess': hess}
    with open(os.path.join(foldername, 'modes.p'), 'wb') as f:
        pickle.dump(data, f)

    print(f"Results saved in {foldername}")

if __name__ == "__main__":
    main()

