# -*- coding: utf-8 -*-
"""
Created on Sat Nov 28 10:35:46 2020

@author: lgz
"""


# -*- coding: utf-8 -*-
"""
Created on Sun Apr 6 11:31:02 2019

@author: lgz
"""
import numpy as np
import numba as nb
from math import sin, cos, sqrt, pi

#import matplotlib 
#matplotlib.use("Agg")
import matplotlib.pyplot as plt
import os, time, sys

###############parameter###############
N = 400 #number of particles
delta_t = 0.1 #time step
L = 20
W = 20 * sqrt(3) / 2
k = 5.
Da_range = [0.3]#np.arange(float(sys.argv[1]), float(sys.argv[2]), 0.01)[0:10]
alpha = 0.001
beta = 0.3
v0 = 0.002
R_range = [0.3] #0,0.4,0.6,0.8,1,1.2
ro_range = [0, 1, 2, 3] 
max_iterations = 100000
interval_steps = 100
#######################################

############initial function###########
#3-line, N=30
def threeline():
    dA = 0.32
    dB = 0.58
    particles = np.zeros((30,2))
    for i in range(10):
        particles[i] = [4 + i * dA, 8 + dB]
    for i in range(10):
        particles[i + 10] = [4.2 + i * dA, 8]
    for i in range(10):
        particles[i + 20] = [4.1 + i * dA, 8 - dB]
    return particles

#Hexagon, N=91
def hexagon91():
    particles = np.zeros((91,2))
    
    k = 0
    for i in range(6):
        for j in range(i+6):
            particles[k] = [6.375-0.325*i+j*0.65, 8+(5-i)*0.563]
            k += 1
    
    while k<91:
        particles[k] = [16,16]-particles[90-k]
        k += 1
    
    #particles[0:2] = [[-7.5,12.99],[7.5,12.99]]
    #particles[2:5] = [[-15,0],[0,0],[15,0]]
    #particles[5:7] = [[-7.5,-12.99],[7.5,-12.99]]
    
    return particles

#Hexagon, N=547 
def hexagon547():
    particles = np.zeros((547,2))
    
    k = 0
    for i in range(14):
        for j in range(i+14):
            particles[k] = [7.775-0.325*i+j*0.65, 12+(13-i)*0.563]
            k += 1
    
    while k<547:
        particles[k] = [24,24]-particles[546-k]
        k += 1
    return particles

#uniform distribute
def periodic_uniform():
    particles = np.zeros((N, 2))
    L = int(sqrt(N)) 
    x0 = 0.2
    y0 = 0.2
    for i in range(L):
        for j in range(L):
            particles[i*L+j][0] = x0 + j + i % 2 * 0.5
            particles[i*L+j][1] = y0 + i * sqrt(3) / 2
    return particles
    
def local_neighbors(r, particles):
    nei_matrix = np.zeros((N, N), dtype=np.int8)
    
    for i, (xi, yi) in enumerate(particles):
        for j, (xj, yj) in enumerate(particles):
            if j != i:
                dist1 = sqrt((xi - xj) ** 2 + (yi - yj) ** 2)
                dist2 = sqrt((L - abs(xi - xj)) ** 2 + (yi - yj) ** 2)
                dist3 = sqrt((xi - xj) ** 2 + (W - abs(yi - yj)) ** 2)
                dist4 = sqrt((L - abs(xi - xj)) ** 2 + (W - abs(yi - yj)) ** 2)
                if (dist1 < r) | (dist2 < r) | (dist3 < r) | (dist4 < r):
                    nei_matrix[i][j] = 1
                
    return nei_matrix

def nearest_neighbors(neinum, particles):
    nei_matrix = np.zeros((N, N), np.int8)
    
    for i, (xi, yi) in enumerate(particles):
        dist = np.zeros(N)
        for j, (xj, yj) in enumerate(particles):
            if j != i:
                dist1 = sqrt((xi - xj) ** 2 + (yi - yj) ** 2)
                dist2 = sqrt((L - abs(xi - xj)) ** 2 + (yi - yj) ** 2)
                dist3 = sqrt((xi - xj) ** 2 + (W - abs(yi - yj)) ** 2)
                dist4 = sqrt((L - abs(xi - xj)) ** 2 + (W - abs(yi - yj)) ** 2)
                dist[j] = min(dist1, dist2, dist3, dist4)
        
        dist[i] = max(dist)            
        for fixnum in range(neinum):
            minindex = np.argmin(dist)
            nei_matrix[i][minindex] = 1
            dist[minindex] = np.max(dist)

    return nei_matrix

#neighbors: [[n00, n01, n02, ...], [n10, n11, n12, ...], ...]   
def neighbors(r, particles):
    neighbors = []
    for i, (x, y) in enumerate(particles):
        i_neighbors = []
        for j, (x1, y1) in enumerate(particles):
            if j != i:
                dist = sqrt((x - x1) ** 2 + (y - y1) ** 2)
                if dist < r:
                    i_neighbors.append(j)
        neighbors.append(i_neighbors)
    return neighbors

#spring natural length: initial distance matrix
def spring_natural_length(particles):
    N = len(particles)
    spring_len = np.zeros((N, N))
    for i in range(N):
        xi = particles[i][0]
        yi = particles[i][1]
        for j in range(N):
            
            xj = particles[j][0]
            yj = particles[j][1]
            dx = abs(xi - xj)
            dy = abs(yi - yj)
            if dx >= L / 2:
                dx = L - dx
            if dy >= W / 2:
                dy = W - dy
            spring_len[i][j] = sqrt(dx ** 2 + dy ** 2)
    return spring_len
#######################################

###########numba function##############
@nb.jit(["float64[:](float64[:,:], float64[:], int64[:,:], float64, float64)"], nopython=True)
def update(particles, thetas, nei_matrix, R, Da):
    #p, vv, dnum, vs 
    op = np.zeros(4)
    
    #polarization
    plz_c = 0.
    plz_s = 0.
    for i in range(N):
        plz_c += cos(thetas[i])
        plz_s += sin(thetas[i])
    op[0] = sqrt(plz_c ** 2 + plz_s ** 2) / N
    
    mid_par = np.zeros((N, 2))
    mid_the = np.zeros(N)
    for i in range(N):
        FX = 0.
        FY = 0.
        for j in nei_matrix[i]:
                
            axij = particles[j][0] - particles[i][0]
            if abs(axij) >= L / 2:    
                if axij > 0:
                    axij -= L
                else :
                    axij += L
            
            ayij = particles[j][1] - particles[i][1] 
            if abs(ayij) > W / 2:    
                if ayij > 0:
                    ayij -= W
                else :
                    ayij += W
        
            bcosij = cos(thetas[j]) - cos(thetas[i])
            bsinij = sin(thetas[j]) - sin(thetas[i])
            dis_v_xij = axij + R * bcosij
            dis_v_yij = ayij + R * bsinij
            dis = sqrt(dis_v_xij ** 2 + dis_v_yij ** 2) 
            dis_uv_xij = dis_v_xij / dis
            dis_uv_yij = dis_v_yij / dis
            FX += k / 1 * (dis - 1) * dis_uv_xij  #lij=1
            FY += k / 1 * (dis - 1) * dis_uv_yij  
                
        #rand_angular = np.random.uniform(-pi, pi)
        FV1 = FX * cos(thetas[i]) + FY * sin(thetas[i])# + Dr / (delta_t ** 0.5) * cos(rand_angular)
        FV2 = FY * cos(thetas[i]) - FX * sin(thetas[i])# + Dr / (delta_t ** 0.5) * sin(rand_angular)
        #velocity component
        vs = alpha * FV1 + v0
        
        mid_par[i][0] = particles[i][0] + delta_t * vs * cos(thetas[i])
        mid_par[i][1] = particles[i][1] + delta_t * vs * sin(thetas[i])
        mid_the[i] = thetas[i] + delta_t * (beta * FV2 + Da / (delta_t ** 0.5) * np.random.normal(0,1))
        
        if mid_par[i][0] < 0:
            mid_par[i][0] += L
            
        if mid_par[i][0] > L:
            mid_par[i][0] -= L
            
        if mid_par[i][1] < 0:
            mid_par[i][1] += W
            
        if mid_par[i][1] > W:
            mid_par[i][1] -= W
            
    
    for i in range(N):
        particles[i][0] = mid_par[i][0]
        particles[i][1] = mid_par[i][1]
        thetas[i] = mid_the[i]
 
    return op
########################################

###############initialize###############
def initialize(N):
    thetas = np.ones(N) * np.random.uniform(-pi, pi)
    #thetas = np.zeros(N)
    #for i,theta in enumerate(thetas):
     #   thetas[i] = np.random.uniform(-pi, pi)
    particles = periodic_uniform()
    
    #generate the neighbor matrix
    nei_matrix = np.zeros((N, 6), np.int64)
    for i in range(L):
        for j in range(L):
            nei_matrix[i*L+j][0] = (i * L + j - 1) % N
            nei_matrix[i*L+j][1] = (i * L + j + L) % N
            if i % 2 == 0:
                nei_matrix[i*L+j][2] = (i * L + j + L - 1) % N
                nei_matrix[i*L+j][5] = (i * L + j - L - 1) % N
            else:
                nei_matrix[i*L+j][2] = (i * L + j + L + 1) % N
                nei_matrix[i*L+j][5] = (i * L + j - L + 1) % N
            nei_matrix[i*L+j][3] = (i * L + j + 1) % N
            nei_matrix[i*L+j][4] = (i * L + j - L) % N
            
            if j - 1 < 0:
                nei_matrix[i*L+j][0] = (i * L + j - 1 + L) % N
                if i % 2 == 0:
                    nei_matrix[i*L+j][2] = (i * L + j + 2 * L - 1) % N
                    nei_matrix[i*L+j][5] = (i * L + j - 1) % N
                else:
                    nei_matrix[i*L+j][2] = (i * L + j + L + 1) % N
                    nei_matrix[i*L+j][5] = (i * L + j - L + 1) % N
                    
            if j + 1 > L - 1:
                nei_matrix[i*L+j][3] = i * L + j + 1 - L
                if i % 2 == 0:
                    nei_matrix[i*L+j][2] = (i * L + j + L - 1) % N
                    nei_matrix[i*L+j][5] = (i * L + j - L - 1) % N
                else:
                    nei_matrix[i*L+j][2] = (i * L + j + 1) % N
                    nei_matrix[i*L+j][5] = (i * L + j - 2 * L + 1) % N
            

            
    return thetas, particles, nei_matrix
#########################################

###########simulate run begin############
t_start = time.time()
runtime = time.time()
for R in R_range:
    for ro in ro_range:
        for Da in Da_range:    
                
            thetas, particles, nei_matrix = initialize(N)
            
            polarization = np.array([])
            
            path1 = "particles/R=%.3f/round%d/Da=%.3f/" % (R, ro, Da)
            if not os.path.exists(path1):
                os.makedirs(path1) 
            
            pathp = "orderparameter/R=%.3f/round%d/p/" % (R, ro)
            if not os.path.exists(pathp):
                os.makedirs(pathp)
            
            np.savetxt(path1 + "neighbors.txt", nei_matrix, fmt="%d")
            
            #cor = np.zeros(int(L / 4))
            for index in range(max_iterations):
                
                if index % 100000 == 0:
                    runtime = time.time() - runtime
                    print("Da=%.3f  round%d: %d / %d ; runtime: %.2fs" %(Da, ro, index , max_iterations, runtime))
                    runtime = time.time()                
                
                if index % 100000 == 0:
                    thetas_t = thetas[:,None]
                    output = np.concatenate((particles,thetas_t),axis=1)
                    np.savetxt(path1 + "%d.txt" % index, output)
                '''
                #correlation function
                if index >= 900000 and index % 10000 == 0:
                    thetas_t = thetas[:,None]
                    output = np.concatenate((particles,thetas_t),axis=1)
                    np.savetxt(path1 + "%d.txt" % index, output)
                    for r in range(1, int(L/4)+1):
                        c = 0.
                        nn = 0
                        for i in range(N):
                            xi = particles[i][0]
                            yi = particles[i][1]
                            if (xi+R*cos(thetas[i])>L/4)and(xi+R*cos(thetas[i])<L*3/4)and(yi+R*sin(thetas[i])>W/4) and (yi+R*sin(thetas[i])>L*3/4): 
                                nn += 1
                                ci = 0.
                                k = 0    
                                for j in range(N):
                                    xj = particles[j][0]
                                    yj = particles[j][1]
                                    dis = sqrt((xi - xj + R * (cos(thetas[i]) - cos(thetas[j]))) ** 2 + (yi - yj + R * (sin(thetas[i]) - sin(thetas[j]))) ** 2) 
                                    if dis < r + 0.5 and dis > r - 0.5:
                                        k += 1
                                        ci += cos(thetas[i]) * cos(thetas[j]) + sin(thetas[i]) * sin(thetas[j])
                                if k != 0:
                                    c += ci / k
                        c = c / nn
                        cor[r - 1] += c 
                        
                '''
                order_parameter = update(particles, thetas, nei_matrix, R, Da)
                
                if index % interval_steps == 0:
                    #order_parameter
                    polarization = np.append(polarization, order_parameter[0])
                    
            np.savetxt(pathp + "Da=%.3f.txt" % Da, polarization)
            
            plt.plot(np.arange(0, max_iterations, interval_steps), polarization, linestyle='-', color='b', label="polar")
            plt.ylim([0,1.05])
            plt.title("R=%.3f round%d Da=%.3f" %(R, ro, Da))
            plt.legend(loc='upper left')
            plt.savefig(pathp + "Da=%.3f.png" % Da)
            plt.close()
            '''
            cor = cor / 10
            np.savetxt(pathp + "Da=%.3f_cor.txt" % Da, cor)
            plt.plot(range(1, int(L/4)+1), cor, linestyle='-', marker='o', color='r')
            plt.ylim([-0.1, 1])
            plt.title("R=%.3fDa=%.3f_correlation" % (R, Da))
            plt.savefig(pathp + "Da=%.3f_cor.png" % Da)
            plt.close()
            '''
    
        
t_end = time.time()
print("total_time: %.3fh" % ((t_end - t_start) / 3600))
#######################################

###########plot polarization###########

#######################################
