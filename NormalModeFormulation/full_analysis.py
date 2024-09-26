import os
import numpy as np
import matplotlib.pyplot as plt
from simulation import Configuration
from hessian import Hessian
import dask
import argparse
from dask.distributed import Client, LocalCluster

def process(k, hess, nq):
    """
    Process Fourier modes for a given k value.

    Args:
        k (int): Index of the mode.
        hess (Hessian): Hessian object.
        nq (int): Number of Fourier modes.
    
    Returns:
        tuple: qrad (Fourier space radial modes), Fourier_qproj (Fourier projection).
    """
    qrad, Fourier_qproj = hess.ModesFourier(k, nq, False)
    return qrad, Fourier_qproj

def initialize_configuration(foldername):
    """
    Initialize the configuration and compute the Hessian matrix.
    
    Args:
        foldername (str): Path to the folder containing dynamics data.
    
    Returns:
        Hessian: The initialized Hessian object.
    """
    conf = Configuration(foldername)
    conf.read_data(100, 'positions', 1, 0)
    conf.calcR0()
    hess = Hessian(conf)
    hess.makeMatrix()
    return hess

def compute_moduli(hess, nq, folder_data):
    """
    Compute and save the Fourier space moduli data.
    
    Args:
        hess (Hessian): Hessian object.
        nq (int): Number of Fourier modes.
        folder_data (str): Path to the output folder for saving data.
    """
    qrad, longitudinal, transverse = hess.getModuli(nq, False)
    data = np.column_stack((qrad**2, longitudinal, transverse))
    file_path = os.path.join(folder_data, "modulus_data.txt")
    np.savetxt(file_path, data)

def compute_Gofq(hess, nq, Fourier_qproj, v0, dr, chi, folder_data):
    """
    Compute G(q) and save the data.
    
    Args:
        hess (Hessian): Hessian object.
        nq (int): Number of Fourier modes.
        Fourier_qproj (np.array): Fourier projections.
        v0 (float): Velocity.
        dr (float): Rotational diffusion constant.
        chi (float): Chirality.
        folder_data (str): Path to the output folder for saving data.
    """
    nq2 = int(2**0.5 * nq)
    qrad = np.linspace(0, nq2, nq2)  # Assuming qrad spans from 0 to nq2

    Gofq = np.zeros(len(qrad))
    for n, q in enumerate(qrad):
        Gofq[n] = np.sum(
            ((v0 ** 2 / 2.0) * (1.0 - ((hess.eigval * (dr + hess.eigval)) /
                                        ((dr + hess.eigval) ** 2 + chi ** 2)))) * Fourier_qproj[:len(hess.eigval), n]
        )
    
    Gofq /= hess.N * v0 ** 2
    data = np.column_stack((qrad, Gofq))
    file_path = os.path.join(folder_data, "corr_data.txt")
    np.savetxt(file_path, data)

    plt.figure(figsize=(6, 6))
    plt.plot(qrad, Gofq)
    plt.xlabel('qrad')
    plt.ylabel('G(q)')
    plt.savefig(os.path.join(folder_data, 'Gofq_plot.png'))
    plt.show()

if __name__ == '__main__':
    # Parse command-line arguments
    parser = argparse.ArgumentParser(description="Chiral Active Brownian Particle Simulation")
    parser.add_argument("-Dr", "--Dr", type=float, default=0.01, help="Rotational diffusion constant")
    parser.add_argument("-chi", "--chi", type=float, default=0.10, help="Chirality")
    args = parser.parse_args()

    v0 = 0.01
    dr = args.Dr
    chi = args.chi
    nq = 100
    folder_data = "output_data"
    os.makedirs(folder_data, exist_ok=True)

    # Set up file path for configuration data
    foldername = "/path/to/dynamics_data/chi_{}/".format(chi)  # Modify path as needed

    # Initialize configuration and Hessian
    hess = initialize_configuration(foldername)

    # Compute and save moduli
    print("Computing Fourier space response for moduli")
    compute_moduli(hess, nq, folder_data)

    # Set up Dask for parallel processing
    cluster = LocalCluster()
    client = Client(cluster)

    # Scatter the 'hess' object across workers
    hess_future = client.scatter(hess)
    results = []
    
    for k in range(0, 2 * hess.N, 1):
        result = dask.delayed(process)(k, hess_future, nq)
        results.append(result)

    results = dask.compute(*results)

    Fourier_qproj = np.zeros((2 * hess.N + 1, int(2**0.5 * nq)))

    for u, result in enumerate(results):
        qrad, Fourier_qproj[u, :] = result

    # Compute G(q) and plot the results
    print("Computing G(q) and saving data")
    compute_Gofq(hess, nq, Fourier_qproj, v0, dr, chi, folder_data)

