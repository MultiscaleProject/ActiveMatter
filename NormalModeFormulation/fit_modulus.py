import os
import numpy as np
import matplotlib.pyplot as plt
from scipy.optimize import curve_fit

def read_three_column_file(file_name):
    """
    Reads a three-column file and returns three lists of values.
    
    Args:
        file_name (str): The path to the file to read.
    
    Returns:
        x1, x2, x3 (list of floats): Data from the three columns.
    """
    if not os.path.exists(file_name):
        raise FileNotFoundError(f"File not found: {file_name}")
    
    with open(file_name, 'r') as data:
        x1, x2, x3 = [], [], []
        for line in data:
            p = line.split()
            x1.append(float(p[0]))
            x2.append(float(p[1]))
            x3.append(float(p[2]))
    return x1, x2, x3

def model_func2(x1, G):
    """
    Model function for fitting to x3: G * x1.
    """
    return G * x1

def model_func1_fixed_G(x1, B):
    """
    Model function for fitting to x2: (B + G_fixed) * x1.
    """
    return (B + G_fixed) * x1

# Global variable to hold the fixed G value during curve fitting
G_fixed = None

def fit_data(chi):
    """
    Fit data for a given chi value, and return fitted B and G parameters.
    
    Args:
        chi (float): The chirality value.
    
    Returns:
        B (float): Fitted parameter for the x2 data.
        G (float): Fitted parameter for the x3 data.
    """
    global G_fixed
    file_path = f"chi_{chi}/output_data/modulus_data.txt"
    
    try:
        x1_list, x2_list, x3_list = read_three_column_file(file_path)
    except FileNotFoundError as e:
        print(e)
        return None, None
    
    # Convert lists to numpy arrays
    x1 = np.array(x1_list)
    x2 = np.array(x2_list)
    x3 = np.array(x3_list)
    
    # Apply mask to limit the range of x1
    mask = (x1 >= 0.00) & (x1 <= 1.1)
    x1_subset = x1[mask]
    x2_subset = x2[mask]
    x3_subset = x3[mask]
    
    # Fit x3 data to model_func2 to get G
    params1, _ = curve_fit(model_func2, x1_subset, x3_subset)
    G = params1[0]
    
    # Set the global G_fixed value for the second fit
    G_fixed = G
    
    # Fit x2 data to model_func1_fixed_G to get B
    params2, _ = curve_fit(model_func1_fixed_G, x1_subset, x2_subset)
    B = params2[0]
    
    # Plot the data and the fits
    plot_fit(x1_subset, x2_subset, x3_subset, B, G, chi)
    
    return B, G

def plot_fit(x1_subset, x2_subset, x3_subset, B, G, chi):
    """
    Plot the data and the fitted curves for a given chi value.
    
    Args:
        x1_subset (array): Subset of x1 data.
        x2_subset (array): Subset of x2 data.
        x3_subset (array): Subset of x3 data.
        B (float): Fitted B parameter.
        G (float): Fitted G parameter.
        chi (float): Chirality value for the plot title.
    """
    plt.figure(figsize=(10, 6))
    plt.scatter(x1_subset, x2_subset, color='blue', label='x2 Data')
    plt.scatter(x1_subset, x3_subset, color='red', label='x3 Data')
    plt.plot(x1_subset, model_func1_fixed_G(x1_subset, B), 'b--', label=f'Fit to x2: Bx + Gx, B={B:.3f}')
    plt.plot(x1_subset, model_func2(x1_subset, G), 'r--', label=f'Fit to x3: Gx, G={G:.3f}')
    plt.title(f'Chi = {chi}')
    plt.xlabel('x1')
    plt.ylabel('Value')
    plt.legend()
    plt.grid(True)
    plt.ylim(1e-3, 1e1)
    plt.xscale('log')
    plt.yscale('log')
    plt.savefig(f"chi_{chi}/fit_plot.png")
    plt.show()

def save_values_to_file(chi_values):
    """
    Fit data for each chi value and save the B, G, and their ratio to a text file.
    
    Args:
        chi_values (list of float): List of chi values to process.
    """
    with open("BG_values.txt", "w") as f:
        f.write("Chi\tB\tG\tratio\n")  # Header
        for chi in chi_values:
            B, G = fit_data(chi)
            if B is not None and G is not None:
                f.write(f"{chi}\t{B}\t{G}\t{(B+G)/G}\n")
            else:
                f.write(f"{chi}\tN/A\tN/A\tN/A\n")

# List of chi values to process
chi_values = [0.01, 0.05, 0.1, 0.5, 1.0, 5.0]

# Call the function to fit data and save values
save_values_to_file(chi_values)

